const http = require('http');

async function testAdminUsers() {
    try {
        console.log('Testing admin users from user logs API...');
        
        const options = {
            hostname: 'localhost',
            port: 3001,
            path: '/api/admin/user-logs-test',
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        };
        
        const req = http.request(options, (res) => {
            console.log('Status:', res.statusCode);
            
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    console.log('Admin users found:');
                    const adminUsers = parsed.filter(user => user.role === 'admin');
                    console.log(JSON.stringify(adminUsers, null, 2));
                    console.log(`\nTotal users: ${parsed.length}`);
                    console.log(`Admin users: ${adminUsers.length}`);
                    console.log('\nAdmin user emails:');
                    adminUsers.forEach(user => {
                        console.log(`- ${user.email} (ID: ${user.id})`);
                    });
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

testAdminUsers();
