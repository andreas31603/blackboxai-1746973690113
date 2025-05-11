// Function to update trend chart
function updateTrendChart(data) {
    const ctx = document.getElementById('trendChart').getContext('2d');
    const now = new Date();
    const yesterday = now.getTime() - (24 * 60 * 60 * 1000);
    
    const hourlyData = {};
    Object.values(data).forEach(detection => {
        if (detection.timestamp >= yesterday) {
            const hour = new Date(detection.timestamp).getHours();
            hourlyData[hour] = (hourlyData[hour] || 0) + detection.count;
        }
    });

    const hours = Array.from({length: 24}, (_, i) => i);
    const counts = hours.map(hour => hourlyData[hour] || 0);

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: hours.map(hour => `${hour}:00`),
            datasets: [{
                label: 'Jumlah Deteksi',
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
}

// Function to update environment chart
function updateEnvChart(data) {
    const ctx = document.getElementById('envChart').getContext('2d');
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

    new Chart(ctx, {
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
}

// Function to update light chart
function updateLightChart(data) {
    const ctx = document.getElementById('lightChart').getContext('2d');
    const now = new Date();
    const yesterday = now.getTime() - (24 * 60 * 60 * 1000);
    
    const hourlyData = {};
    Object.values(data).forEach(detection => {
        if (detection.timestamp >= yesterday) {
            const hour = new Date(detection.timestamp).getHours();
            if (!hourlyData[hour]) hourlyData[hour] = [];
            hourlyData[hour].push(detection.light);
        }
    });

    const hours = Array.from({length: 24}, (_, i) => i);
    const lightLevels = hours.map(hour => {
        const values = hourlyData[hour] || [];
        return values.length ? values.reduce((a, b) => a + b) / values.length : null;
    });

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: hours.map(hour => `${hour}:00`),
            datasets: [{
                label: 'Intensitas Cahaya (lux)',
                data: lightLevels,
                borderColor: 'rgb(245, 158, 11)',
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
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
                            return `${Math.round(context.parsed.y)} lux`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Intensitas Cahaya (lux)'
                    }
                }
            }
        }
    });
}

// Function to update air quality chart
function updateAirChart(data) {
    const ctx = document.getElementById('airChart').getContext('2d');
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

    new Chart(ctx, {
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
}

// Initialize all charts
function initializeCharts(data) {
    updateTrendChart(data);
    updateEnvChart(data);
    updateLightChart(data);
    updateAirChart(data);
}
