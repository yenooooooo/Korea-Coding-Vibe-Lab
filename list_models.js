
const https = require('https');

const API_KEY = 'AIzaSyA_i3AFH4YWEJdwHSU5Wl5X0tJWXGEbV-E';
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

https.get(url, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            console.log('Available Models:');
            if (json.models) {
                json.models.forEach(model => {
                    if (model.supportedGenerationMethods.includes('generateContent')) {
                        console.log(`- ${model.name}`);
                    }
                });
            } else {
                console.log('No models found in response:', data);
            }
        } catch (e) {
            console.error('Error parsing JSON:', e.message);
            console.log('Raw data:', data);
        }
    });

}).on('error', (err) => {
    console.error('Error:', err.message);
});
