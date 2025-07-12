const axios = require('axios');

async function testAdminLogin() {
    console.log('=== TESTING ADMIN LOGIN WITH DIFFERENT PASSWORDS ===');
    
    const passwords = [
        'admin123',
        'password',
        'admin',
        'test123',
        'Admin123',
        'admin@test.com',
        'testadmin123'
    ];
    
    for (const password of passwords) {
        try {
            console.log(`🔐 Trying password: "${password}"`);
            
            const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
                email: 'admin@test.com',
                password: password
            });
            
            if (loginResponse.data.success) {
                console.log(`✅ LOGIN SUCCESSFUL with password: "${password}"`);
                console.log('Response:', loginResponse.data);
                return password;
            }
            
        } catch (error) {
            if (error.response && error.response.status === 401) {
                console.log(`❌ Failed with: "${password}"`);
            } else {
                console.log(`⚠️ Other error with "${password}":`, error.message);
            }
        }
    }
    
    console.log('❌ No working password found');
    return null;
}

testAdminLogin();
