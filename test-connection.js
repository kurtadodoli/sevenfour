const http = require('http');

// Test if server is running
function testConnection() {
    const options = {
        hostname: 'localhost',
        port: 3001,
        path: '/api/test',
        method: 'GET'
    };

    const req = http.request(options, (res) => {
        console.log(`✅ Server is running on port 3001`);
        console.log(`Status: ${res.statusCode}`);
    });

    req.on('error', (err) => {
        console.log(`❌ Server is NOT running on port 3001`);
        console.log(`Error: ${err.message}`);
        console.log('\nTry starting the server with:');
        console.log('cd server');
        console.log('node app.js');
    });

    req.end();
}

testConnection();
