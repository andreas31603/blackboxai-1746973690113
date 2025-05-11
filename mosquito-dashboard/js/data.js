// Generate dummy data
function generateDummyData() {
    const data = {};
    const now = new Date();
    
    for (let i = 0; i < 7; i++) {
        for (let hour = 0; hour < 24; hour++) {
            const timestamp = new Date(now);
            timestamp.setDate(now.getDate() - i);
            timestamp.setHours(hour, 0, 0, 0);
            
            // Generate realistic environmental data
            const temp = 20 + Math.random() * 15; // 20-35°C
            const humidity = 60 + Math.random() * 30; // 60-90%
            const light = Math.max(0, Math.min(100000, 
                hour >= 6 && hour <= 18 ? 
                50000 + Math.random() * 50000 : // Daylight
                Math.random() * 1000 // Night
            )); // 0-100000 lux
            const co2 = 400 + Math.random() * 600; // 400-1000 ppm
            
            // Generate mosquito count based on environmental factors
            const count = Math.floor(
                (Math.random() * 8) + 
                (temp >= 25 && temp <= 30 ? 3 : 0) + // Optimal temperature
                (humidity >= 80 ? 2 : 0) + // High humidity
                (light < 1000 ? 2 : 0) + // Dark conditions
                (co2 > 800 ? 2 : 0) // High CO2
            );
            
            data[`detection_${i}_${hour}`] = {
                timestamp: timestamp.getTime(),
                count: count,
                temperature: temp,
                humidity: humidity,
                light: light,
                co2: co2
            };
        }
    }
    return data;
}

// Function to update stats and ML prediction
function updateStats(data) {
    const today = new Date().setHours(0, 0, 0, 0);
    let todayCount = 0;
    
    const sortedData = Object.values(data).sort((a, b) => b.timestamp - a.timestamp);
    if (sortedData.length > 0) {
        const latest = sortedData[0];
        
        // Update current readings with animation
        const elements = {
            'currentTemp': `${latest.temperature.toFixed(1)}°C`,
            'currentHumidity': `${latest.humidity.toFixed(1)}%`,
            'currentLight': `${Math.round(latest.light)} lux`,
            'currentAir': `${Math.round(latest.co2)} ppm`
        };

        Object.entries(elements).forEach(([id, value]) => {
            const el = document.getElementById(id);
            el.classList.add('animate-pulse');
            setTimeout(() => {
                el.textContent = value;
                el.classList.remove('animate-pulse');
            }, 500);
        });
        
        // Calculate ML prediction
        const currentHour = new Date().getHours();
        const mlResult = calculateMLPrediction(
            latest.temperature,
            latest.humidity,
            latest.light,
            latest.co2,
            currentHour
        );
        
        // Update ML prediction UI with smooth transitions
        document.getElementById('mlProbability').style.width = `${mlResult.probability * 100}%`;
        document.getElementById('mlProbabilityText').textContent = `${Math.round(mlResult.probability * 100)}%`;
        
        // Update ML factor bars with animation
        const factors = {
            'mlTempBar': mlResult.factors.temperature,
            'mlHumidityBar': mlResult.factors.humidity,
            'mlLightBar': mlResult.factors.light,
            'mlAirBar': mlResult.factors.air,
            'mlTimeBar': mlResult.factors.time
        };

        Object.entries(factors).forEach(([id, value]) => {
            const el = document.getElementById(id);
            el.style.width = `${value * 100}%`;
        });
        
        // Update factor percentages
        document.getElementById('mlTempFactor').textContent = `${Math.round(mlResult.factors.temperature * 100)}%`;
        document.getElementById('mlHumidityFactor').textContent = `${Math.round(mlResult.factors.humidity * 100)}%`;
        document.getElementById('mlLightFactor').textContent = `${Math.round(mlResult.factors.light * 100)}%`;
        document.getElementById('mlAirFactor').textContent = `${Math.round(mlResult.factors.air * 100)}%`;
        document.getElementById('mlTimeFactor').textContent = `${Math.round(mlResult.factors.time * 100)}%`;
        
        // Update risk prediction with animation
        const risk = mlResult.probability >= 0.7 ? 'Tinggi' :
                   mlResult.probability >= 0.4 ? 'Sedang' : 'Rendah';
        const riskEl = document.getElementById('riskPrediction');
        riskEl.classList.add('animate-pulse');
        setTimeout(() => {
            riskEl.textContent = risk;
            riskEl.classList.remove('animate-pulse');
        }, 500);
    }
    
    Object.values(data).forEach(detection => {
        if (new Date(detection.timestamp).getTime() >= today) {
            todayCount += detection.count;
        }
    });

    // Update today count with animation
    const todayCountEl = document.getElementById('todayCount');
    todayCountEl.classList.add('animate-pulse');
    setTimeout(() => {
        todayCountEl.textContent = todayCount;
        todayCountEl.classList.remove('animate-pulse');
    }, 500);
}

// Function to update table
function updateTable(data) {
    const tableBody = document.getElementById('dataTable');
    const sortedData = Object.entries(data)
        .sort(([,a], [,b]) => b.timestamp - a.timestamp)
        .slice(0, 10);

    tableBody.innerHTML = sortedData.map(([,detection]) => `
        <tr class="hover:bg-gray-50 transition duration-150">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                ${formatDate(new Date(detection.timestamp))}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                ${detection.count}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                ${detection.temperature.toFixed(1)}°C
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                ${detection.humidity.toFixed(1)}%
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                ${Math.round(detection.light)} lux
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                ${Math.round(detection.co2)} ppm
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${detection.count > 5 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}">
                    ${detection.count > 5 ? 'Tinggi' : 'Normal'}
                </span>
            </td>
        </tr>
    `).join('');
}
