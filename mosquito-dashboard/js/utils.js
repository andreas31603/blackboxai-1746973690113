// Function to format date
function formatDate(date) {
    return new Intl.DateTimeFormat('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short'
    }).format(date);
}

// Function to calculate ML prediction
function calculateMLPrediction(temp, humidity, co2, hour, detectionRate = 0) {
    // Enhanced ML model simulation based on typical mosquito behavior and historical data
    let probability = 0;
    
    // Temperature factor (optimal range 25-30°C)
    let tempFactor;
    if (temp >= 25 && temp <= 30) {
        tempFactor = 0.25; // Optimal temperature range
    } else if (temp >= 20 && temp < 25) {
        tempFactor = 0.15; // Cool but acceptable
    } else if (temp > 30 && temp <= 35) {
        tempFactor = 0.15; // Warm but acceptable
    } else {
        tempFactor = 0.05; // Too cold or too hot
    }
    
    // Humidity factor (higher humidity = higher probability)
    let humidityFactor;
    if (humidity >= 70 && humidity <= 85) {
        humidityFactor = 0.25; // Optimal humidity range
    } else if (humidity > 85) {
        humidityFactor = 0.2; // Very humid
    } else if (humidity >= 60 && humidity < 70) {
        humidityFactor = 0.15; // Moderately humid
    } else {
        humidityFactor = 0.05; // Too dry
    }
    
    // CO2 factor (higher CO2 = higher probability)
    let airFactor;
    if (co2 >= 500) {
        airFactor = 0.2; // High CO2 levels attract mosquitoes
    } else if (co2 >= 300) {
        airFactor = 0.15; // Moderate CO2 levels
    } else {
        airFactor = 0.05; // Low CO2 levels
    }
    
    // Time factor (more active at dawn and dusk)
    let timeFactor;
    if ((hour >= 17 && hour <= 20) || (hour >= 4 && hour <= 7)) {
        timeFactor = 0.15; // Dawn and dusk hours (peak activity)
    } else if (hour >= 21 || hour <= 3) {
        timeFactor = 0.1; // Night hours
    } else {
        timeFactor = 0.05; // Daytime hours
    }

    // Historical detection rate factor
    let detectionFactor = detectionRate * 0.15; // Max 15% influence from historical data

    // Calculate final probability
    probability = tempFactor + humidityFactor + airFactor + timeFactor + detectionFactor;
    
    // Normalize probability to ensure it doesn't exceed 1
    probability = Math.min(probability, 1);
    
    return {
        probability,
        factors: {
            temperature: tempFactor,
            humidity: humidityFactor,
            air: airFactor,
            time: timeFactor,
            detection: detectionFactor
        }
    };
}
