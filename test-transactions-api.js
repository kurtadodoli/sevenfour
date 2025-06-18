const http = require('http');

async function testTransactionsAPI() {
    try {
        console.log('Testing admin transactions API...');
        
        const options = {
            hostname: 'localhost',
            port: 3001,
            path: '/api/admin/transactions',
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                // Need to add admin auth token for this to work
                'Authorization': 'Bearer admin_token_here'
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

console.log('Note: This will fail without proper admin authentication.');
console.log('The endpoint requires admin login. Please test through the web interface.');
testTransactionsAPI();
