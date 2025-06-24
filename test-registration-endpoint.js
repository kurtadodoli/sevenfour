const http = require('http');

// Test registration endpoint
const timestamp = Date.now();
const testData = {
    first_name: 'Test',
    last_name: 'User',
    email: `test${timestamp}@example.com`,
    password: 'Password123!',
    role: 'customer'
};

console.log('Testing registration endpoint with data:', testData);

const postData = JSON.stringify(testData);

const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/auth/register',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
    }
};

const req = http.request(options, (res) => {
    console.log('\n=== Response ===');
    console.log('Status Code:', res.statusCode);
    console.log('Headers:', res.headers);
    
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    
    res.on('end', () => {
        console.log('Response Body:', data);
        try {
            const parsed = JSON.parse(data);
            console.log('Parsed Response:', JSON.stringify(parsed, null, 2));
        } catch (e) {
            console.log('Could not parse JSON response');
        }
    });
});

req.on('error', (e) => {
    console.error('Request Error:', e.message);
});

req.write(postData);
req.end();
