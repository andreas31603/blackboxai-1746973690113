// Function to format date
function formatDate(date) {
    return new Intl.DateTimeFormat('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short'
    }).format(date);
}

// Function to calculate ML prediction
function calculateMLPrediction(temp, humidity, light, co2, hour) {
    // Enhanced ML model simulation
    let probability = 0;
    
    // Temperature factor (optimal range 25-30°C)
    const tempFactor = temp >= 25 && temp <= 30 ? 0.25 : 0.1;
    
    // Humidity factor (higher humidity = higher probability)
    const humidityFactor = humidity >= 80 ? 0.25 : 0.1;
    
    // Light factor (darker = higher probability)
    const lightFactor = light < 1000 ? 0.2 : 0.1;
    
    // CO2 factor (higher CO2 = higher probability)
    const airFactor = co2 > 800 ? 0.2 : 0.1;
    
    // Time factor (more active at night)
    const timeFactor = (hour >= 18 || hour <= 6) ? 0.1 : 0.05;
    
    probability = tempFactor + humidityFactor + lightFactor + airFactor + timeFactor;
    
    return {
        probability,
        factors: {
            temperature: tempFactor,
            humidity: humidityFactor,
            light: lightFactor,
            air: airFactor,
            time: timeFactor
        }
    };
}
