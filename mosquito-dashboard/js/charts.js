// Store chart instances
let trendChart = null;
let envChart = null;
let airChart = null;
let soundChart = null;

// Function to update trend chart (mosquito detection count)
function updateTrendChart(data) {
    try {
        const ctx = document.getElementById('trendChart');
        if (!ctx) {
            console.error('Trend chart canvas not found');
            return;
        }

        // Destroy existing chart if it exists
        if (trendChart) {
            trendChart.destroy();
        }
        
        const now = new Date();
        const yesterday = now.getTime() - (24 * 60 * 60 * 1000);
        
        const hourlyData = {};
        Object.values(data).forEach(detection => {
            if (detection.timestamp >= yesterday) {
                const hour = new Date(detection.timestamp).getHours();
                hourlyData[hour] = (hourlyData[hour] || 0) + (detection.status === 'ada' ? 1 : 0);
            }
        });

        const hours = Array.from({length: 24}, (_, i) => i);
        const counts = hours.map(hour => hourlyData[hour] || 0);

        console.log('Trend chart data:', { hours, counts });

        trendChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: hours.map(hour => `${hour}:00`),
                datasets: [{
                    label: 'Deteksi Nyamuk',
                    data: counts,
                    borderColor: 'rgb(75, 85, 99)',
                    backgroundColor: 'rgba(75, 85, 99, 0.1)',
                    tension: 0.3,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 1000,
                    easing: 'easeInOutQuart'
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12,
                        titleFont: {
                            size: 14,
                            weight: 'bold'
                        },
                        bodyFont: {
                            size: 13
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            display: true,
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error updating trend chart:', error);
    }
}

// Function to update environment chart
function updateEnvChart(data) {
    try {
        const ctx = document.getElementById('envChart');
        if (!ctx) {
            console.error('Environment chart canvas not found');
            return;
        }

        // Destroy existing chart if it exists
        if (envChart) {
            envChart.destroy();
        }
        
        const now = new Date();
        const yesterday = now.getTime() - (24 * 60 * 60 * 1000);
        
        const hourlyData = {
            temp: {},
            humidity: {}
        };
        
        Object.values(data).forEach(detection => {
            if (detection.timestamp >= yesterday) {
                const hour = new Date(detection.timestamp).getHours();
                if (!hourlyData.temp[hour]) {
                    hourlyData.temp[hour] = [];
                    hourlyData.humidity[hour] = [];
                }
                hourlyData.temp[hour].push(detection.temperature);
                hourlyData.humidity[hour].push(detection.humidity);
            }
        });

        const hours = Array.from({length: 24}, (_, i) => i);
        const temps = hours.map(hour => {
            const values = hourlyData.temp[hour] || [];
            return values.length ? values.reduce((a, b) => a + b) / values.length : null;
        });
        const humidities = hours.map(hour => {
            const values = hourlyData.humidity[hour] || [];
            return values.length ? values.reduce((a, b) => a + b) / values.length : null;
        });

        console.log('Environment chart data:', { hours, temps, humidities });

        envChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: hours.map(hour => `${hour}:00`),
                datasets: [
                    {
                        label: 'Suhu (°C)',
                        data: temps,
                        borderColor: 'rgb(239, 68, 68)',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        tension: 0.3,
                        yAxisID: 'y-temp'
                    },
                    {
                        label: 'Kelembapan (%)',
                        data: humidities,
                        borderColor: 'rgb(59, 130, 246)',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        tension: 0.3,
                        yAxisID: 'y-humidity'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                plugins: {
                    legend: {
                        position: 'top'
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12
                    }
                },
                scales: {
                    'y-temp': {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Suhu (°C)'
                        }
                    },
                    'y-humidity': {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Kelembapan (%)'
                        },
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error updating environment chart:', error);
    }
}

// Function to update air quality chart
function updateAirChart(data) {
    try {
        const ctx = document.getElementById('airChart');
        if (!ctx) {
            console.error('Air quality chart canvas not found');
            return;
        }

        // Destroy existing chart if it exists
        if (airChart) {
            airChart.destroy();
        }
        
        const now = new Date();
        const yesterday = now.getTime() - (24 * 60 * 60 * 1000);
        
        const hourlyData = {};
        Object.values(data).forEach(detection => {
            if (detection.timestamp >= yesterday) {
                const hour = new Date(detection.timestamp).getHours();
                if (!hourlyData[hour]) hourlyData[hour] = [];
                hourlyData[hour].push(detection.co2);
            }
        });

        const hours = Array.from({length: 24}, (_, i) => i);
        const co2Levels = hours.map(hour => {
            const values = hourlyData[hour] || [];
            return values.length ? values.reduce((a, b) => a + b) / values.length : null;
        });

        console.log('Air quality chart data:', { hours, co2Levels });

        airChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: hours.map(hour => `${hour}:00`),
                datasets: [{
                    label: 'CO₂ (ppm)',
                    data: co2Levels,
                    borderColor: 'rgb(16, 185, 129)',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.3,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${Math.round(context.parsed.y)} ppm`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'CO₂ (ppm)'
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error updating air quality chart:', error);
    }
}

// Function to update sound level chart
function updateSoundChart(data) {
    try {
        const ctx = document.getElementById('soundChart');
        if (!ctx) {
            console.error('Sound chart canvas not found');
            return;
        }

        // Destroy existing chart if it exists
        if (soundChart) {
            soundChart.destroy();
        }
        
        const now = new Date();
        const yesterday = now.getTime() - (24 * 60 * 60 * 1000);
        
        const hourlyData = {};
        Object.values(data).forEach(detection => {
            if (detection.timestamp >= yesterday) {
                const hour = new Date(detection.timestamp).getHours();
                if (!hourlyData[hour]) hourlyData[hour] = [];
                hourlyData[hour].push(detection.sound);
            }
        });

        const hours = Array.from({length: 24}, (_, i) => i);
        const soundLevels = hours.map(hour => {
            const values = hourlyData[hour] || [];
            return values.length ? values.reduce((a, b) => a + b) / values.length : null;
        });

        console.log('Sound level chart data:', { hours, soundLevels });

        soundChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: hours.map(hour => `${hour}:00`),
                datasets: [{
                    label: 'Level Suara (dB)',
                    data: soundLevels,
                    borderColor: 'rgb(234, 179, 8)',
                    backgroundColor: 'rgba(234, 179, 8, 0.1)',
                    tension: 0.3,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.parsed.y.toFixed(1)} dB`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Level Suara (dB)'
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error updating sound chart:', error);
    }
}

// Initialize all charts
function initializeCharts(data) {
    try {
        console.log('Initializing charts with data:', JSON.stringify(data, null, 2));
        updateTrendChart(data);
        updateEnvChart(data);
        updateAirChart(data);
        updateSoundChart(data);
        console.log('Charts initialized successfully');
    } catch (error) {
        console.error('Error initializing charts:', error);
        console.error('Error details:', error.message, error.stack);
    }
}
