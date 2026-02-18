
const https = require('https');

const API_KEY = 'AIzaSyA_i3AFH4YWEJdwHSU5Wl5X0tJWXGEbV-E';
const MODEL_NAME = 'gemini-1.5-flash';
// const MODEL_NAME = 'gemini-pro';
const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;

const data = JSON.stringify({
    contents: [{ parts: [{ text: "Hello" }] }]
});

const req = https.request(url, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
}, (res) => {
    let responseData = '';

    res.on('data', (chunk) => {
        responseData += chunk;
    });

    res.on('end', () => {
        console.log('Status Code:', res.statusCode);
        console.log('Response:', responseData);
    });
});

req.on('error', (e) => {
    console.error('Request Error:', e);
});

req.write(data);
req.end();
