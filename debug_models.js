
const https = require('https');
const fs = require('fs');

const API_KEY = 'AIzaSyA_i3AFH4YWEJdwHSU5Wl5X0tJWXGEbV-E';
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

console.log(`Fetching models from: ${url}`);

https.get(url, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        console.log(`Status Code: ${res.statusCode}`);
        const outputPath = 'debug_models_output.txt';
        fs.writeFileSync(outputPath, `Status: ${res.statusCode}\nData: ${data}`);
        console.log(`Output written to ${outputPath}`);
    });

}).on('error', (err) => {
    console.error('Error:', err.message);
    fs.writeFileSync('debug_models_error.txt', err.message);
});
