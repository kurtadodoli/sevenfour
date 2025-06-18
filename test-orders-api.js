const http = require('http');

async function testOrdersAPI() {
    try {
        console.log('Testing orders API...');
        
        const options = {
            hostname: 'localhost',
            port: 3001,
            path: '/api/orders/test-list',
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        };
        
        const req = http.request(options, (res) => {
            console.log('Status:', res.statusCode);
            console.log('Headers:', res.headers);
            
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                console.log('Response body:');
                try {
                    const parsed = JSON.parse(data);
                    console.log(JSON.stringify(parsed, null, 2));
                } catch (e) {
                    console.log('Raw response:', data);
                }
            });
        });
        
        req.on('error', (error) => {
            console.error('Request error:', error.message);
        });
        
        req.end();
        
    } catch (error) {
        console.log('Error:', error.message);
    }
}

testOrdersAPI();
