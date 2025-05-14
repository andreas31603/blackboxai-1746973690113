// Function to format date
function formatDate(date) {
    return new Intl.DateTimeFormat('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short'
    }).format(date);
}

// Function to calculate ML prediction
function calculateMLPrediction(temp, humidity, co2, hour) {
    // Enhanced ML model simulation based on typical mosquito behavior
    let probability = 0;
    
    // Temperature factor (optimal range 25-30°C)
    let tempFactor;
    if (temp >= 25 && temp <= 30) {
        tempFactor = 0.3; // Optimal temperature range
    } else if (temp >= 20 && temp < 25) {
        tempFactor = 0.2; // Cool but acceptable
    } else if (temp > 30 && temp <= 35) {
        tempFactor = 0.2; // Warm but acceptable
    } else {
        tempFactor = 0.1; // Too cold or too hot
    }
    
    // Humidity factor (higher humidity = higher probability)
    let humidityFactor;
    if (humidity >= 70 && humidity <= 85) {
        humidityFactor = 0.3; // Optimal humidity range
    } else if (humidity > 85) {
        humidityFactor = 0.25; // Very humid
    } else if (humidity >= 60 && humidity < 70) {
        humidityFactor = 0.2; // Moderately humid
    } else {
        humidityFactor = 0.1; // Too dry
    }
    
    // CO2 factor (higher CO2 = higher probability)
    let airFactor;
    if (co2 >= 500) {
        airFactor = 0.25; // High CO2 levels attract mosquitoes
    } else if (co2 >= 300) {
        airFactor = 0.2; // Moderate CO2 levels
    } else {
        airFactor = 0.1; // Low CO2 levels
    }
    
    // Time factor (more active at dawn and dusk)
    let timeFactor;
    if (hour >= 17 || hour <= 7) {
        timeFactor = 0.15; // Dawn and dusk hours
    } else if (hour >= 8 && hour <= 16) {
        timeFactor = 0.05; // Daytime hours
    } else {
        timeFactor = 0.1; // Other hours
    }
    
    probability = tempFactor + humidityFactor + airFactor + timeFactor;
    
    return {
        probability,
        factors: {
            temperature: tempFactor,
            humidity: humidityFactor,
            air: airFactor,
            time: timeFactor
        }
    };
}
