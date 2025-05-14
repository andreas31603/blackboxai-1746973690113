// Initialize Firebase with compat version
const firebaseConfig = {
    apiKey: "AIzaSyBXhRRVgY3rI2TVeYp3UQklCp3NVrwzfeA",
    authDomain: "tugas-akhir-6ca04.firebaseapp.com",
    databaseURL: "https://tugas-akhir-6ca04-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "tugas-akhir-6ca04",
    storageBucket: "tugas-akhir-6ca04.firebasestorage.app",
    messagingSenderId: "452775472698",
    appId: "1:452775472698:web:695d0e4e66d26960f5cf03",
    measurementId: "G-2G6C7KML4W"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();
const database = firebase.database();

// Function to calculate average values for ML prediction
function calculateAverages(data, filterFn = () => true) {
    const filteredData = Object.values(data).filter(filterFn);
    if (filteredData.length === 0) return null;

    return {
        avgTemp: filteredData.reduce((sum, d) => sum + d.temperature, 0) / filteredData.length,
        avgHumidity: filteredData.reduce((sum, d) => sum + d.humidity, 0) / filteredData.length,
        avgCO2: filteredData.reduce((sum, d) => sum + d.co2, 0) / filteredData.length,
        avgSound: filteredData.reduce((sum, d) => sum + d.sound, 0) / filteredData.length,
        detectionRate: filteredData.filter(d => d.status === 'ada').length / filteredData.length
    };
}

// Function to load data from Firebase
async function loadFirebaseData() {
    try {
        console.log('Fetching data from Firebase...');
        const dataRef = database.ref('sensor_data');
        
        return new Promise((resolve, reject) => {
            dataRef.orderByChild('waktu').limitToLast(1000).on('value', (snapshot) => {
                try {
                    const data = {};
                    snapshot.forEach((childSnapshot) => {
                        const detection = childSnapshot.val();
                        // Ensure all required fields exist
                        if (detection.waktu && detection.sensor_suara !== undefined && 
                            detection.sensor_suhu !== undefined && detection.sensor_kelembapan !== undefined && 
                            detection.sensor_gas !== undefined && detection.deteksi_nyamuk !== undefined) {
                            
                            data[childSnapshot.key] = {
                                timestamp: new Date(detection.waktu).getTime(),
                                sound: parseFloat(detection.sensor_suara),
                                temperature: parseFloat(detection.sensor_suhu),
                                humidity: parseFloat(detection.sensor_kelembapan),
                                co2: parseFloat(detection.sensor_gas),
                                status: detection.deteksi_nyamuk,
                                count: detection.deteksi_nyamuk === 'ada' ? 1 : 0
                            };
                        } else {
                            console.warn('Skipping invalid data entry:', detection);
                        }
                    });

                    if (Object.keys(data).length === 0) {
                        console.warn('No valid data entries found in Firebase');
                    } else {
                        const firstEntry = Object.values(data)[0];
                        console.log('First parsed entry:', JSON.stringify(firstEntry, null, 2));
                    }

                    resolve(data);
                } catch (error) {
                    console.error('Error processing Firebase data:', error);
                    reject(error);
                }
            }, (error) => {
                console.error('Error fetching data from Firebase:', error);
                reject(error);
            });
        });
    } catch (error) {
        console.error('Error in loadFirebaseData:', error);
        return {};
    }
}

// Function to update stats and ML predictions
function updateStats(data) {
    const today = new Date().setHours(0, 0, 0, 0);
    let todayCount = 0;
    
    const sortedData = Object.values(data).sort((a, b) => b.timestamp - a.timestamp);
    if (sortedData.length > 0) {
        const latest = sortedData[0];
        console.log('Latest data for stats update:', JSON.stringify({
            ...latest,
            timestamp: new Date(latest.timestamp).toISOString()
        }, null, 2));
        
        // Update current readings with animation
        const elements = {
            'currentTemp': `${latest.temperature.toFixed(1)}°C`,
            'currentHumidity': `${latest.humidity.toFixed(1)}%`,
            'currentAir': `${Math.round(latest.co2)} ppm`,
            'currentSound': `${latest.sound.toFixed(1)} dB`
        };

        Object.entries(elements).forEach(([id, value]) => {
            const el = document.getElementById(id);
            if (el) {
                console.log(`Updating ${id} with value:`, value);
                el.classList.add('animate-pulse');
                setTimeout(() => {
                    el.textContent = value;
                    el.classList.remove('animate-pulse');
                }, 500);
            }
        });

        // Calculate overall ML prediction
        const overallStats = calculateAverages(data);
        if (overallStats) {
            const overallMlResult = calculateMLPrediction(
                overallStats.avgTemp,
                overallStats.avgHumidity,
                overallStats.avgCO2,
                new Date().getHours(),
                overallStats.detectionRate
            );

            // Update overall ML prediction UI
            updateMLPredictionUI(overallMlResult, 'overall');
        }

        // Calculate today's ML prediction
        const isToday = (timestamp) => {
            const date = new Date(timestamp);
            const today = new Date();
            return date.getDate() === today.getDate() &&
                   date.getMonth() === today.getMonth() &&
                   date.getFullYear() === today.getFullYear();
        };

        const todayStats = calculateAverages(data, d => isToday(d.timestamp));
        if (todayStats) {
            const todayMlResult = calculateMLPrediction(
                todayStats.avgTemp,
                todayStats.avgHumidity,
                todayStats.avgCO2,
                new Date().getHours(),
                todayStats.detectionRate
            );

            // Update today's ML prediction UI
            updateMLPredictionUI(todayMlResult, 'today');
        }
    }
    
    // Calculate today's mosquito detections
    Object.values(data).forEach(detection => {
        const detectionDate = new Date(detection.timestamp);
        const isToday = detectionDate.getDate() === new Date().getDate() &&
                       detectionDate.getMonth() === new Date().getMonth() &&
                       detectionDate.getFullYear() === new Date().getFullYear();
        if (isToday && detection.status === 'ada') {
            todayCount++;
        }
    });

    console.log('Today\'s total mosquito detections:', todayCount);

    // Update today count with animation
    const todayCountEl = document.getElementById('todayCount');
    if (todayCountEl) {
        todayCountEl.classList.add('animate-pulse');
        setTimeout(() => {
            todayCountEl.textContent = todayCount;
            todayCountEl.classList.remove('animate-pulse');
        }, 500);
    }
}

// Function to update ML prediction UI elements
function updateMLPredictionUI(mlResult, type) {
    const prefix = type === 'overall' ? 'overall' : 'today';
    
    // Update probability bar
    const probabilityBar = document.getElementById(`${prefix}MlProbability`);
    const probabilityText = document.getElementById(`${prefix}MlProbabilityText`);
    if (probabilityBar && probabilityText) {
        const probabilityPercentage = `${Math.round(mlResult.probability * 100)}%`;
        probabilityBar.style.width = probabilityPercentage;
        probabilityText.textContent = probabilityPercentage;
    }

    // Update factor bars
    const factors = {
        'Temp': mlResult.factors.temperature,
        'Humidity': mlResult.factors.humidity,
        'Air': mlResult.factors.air,
        'Time': mlResult.factors.time
    };

    Object.entries(factors).forEach(([factor, value]) => {
        const barEl = document.getElementById(`${prefix}Ml${factor}Bar`);
        const textEl = document.getElementById(`${prefix}Ml${factor}Factor`);
        if (barEl && textEl) {
            const percentage = `${Math.round(value * 100)}%`;
            barEl.style.width = percentage;
            textEl.textContent = percentage;
        }
    });

    // Update risk level
    const riskEl = document.getElementById(`${prefix}RiskLevel`);
    if (riskEl) {
        const risk = mlResult.probability >= 0.7 ? 'Tinggi' :
                    mlResult.probability >= 0.4 ? 'Sedang' : 'Rendah';
        riskEl.textContent = risk;
        riskEl.className = `text-lg font-semibold ${
            risk === 'Tinggi' ? 'text-red-600' :
            risk === 'Sedang' ? 'text-yellow-600' :
            'text-green-600'
        }`;
    }
}

// Function to update table
function updateTable(data) {
    const tableBody = document.getElementById('dataTable');
    if (!tableBody) return;

    const sortedData = Object.entries(data)
        .sort(([,a], [,b]) => b.timestamp - a.timestamp)
        .slice(0, 10);

    tableBody.innerHTML = sortedData.map(([,detection]) => `
        <tr class="hover:bg-gray-50 transition duration-150">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                ${formatDate(new Date(detection.timestamp))}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                ${detection.sound.toFixed(1)} dB
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                ${detection.temperature.toFixed(1)}°C
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                ${detection.humidity.toFixed(1)}%
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                ${Math.round(detection.co2)} ppm
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${detection.status === 'ada' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}">
                    ${detection.status === 'ada' ? 'Ada' : 'Tidak Ada'}
                </span>
            </td>
        </tr>
    `).join('');
}

// Initialize data and start updates
document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log('Initializing dashboard...');
        const data = await loadFirebaseData();
        if (Object.keys(data).length === 0) {
            console.error('No data loaded from Firebase');
            document.querySelectorAll('.animate-pulse').forEach(el => {
                el.textContent = 'No Data';
                el.classList.remove('animate-pulse');
            });
            return;
        }
        console.log('Data loaded, updating components...');
        updateStats(data);
        updateTable(data);
        initializeCharts(data);
        console.log('Dashboard initialization complete');
    } catch (error) {
        console.error('Error initializing dashboard:', error);
        console.error('Error details:', error.message, error.stack);
    }
});
