// Create a test admin account
const axios = require('axios');

async function createTestAdmin() {
    console.log('🔧 Creating test admin account...');
    
    try {
        const response = await axios.post('http://localhost:5000/api/users/register', {
            first_name: 'Test',
            last_name: 'Admin',
            email: 'testadmin@example.com',
            password: 'TestAdmin123!',
            gender: 'other',
            birthday: '1990-01-01',
            role: 'admin'
        });
        
        console.log('✅ Test admin account created successfully!');
        console.log('Email:', response.data.data.user.email);
        console.log('Role:', response.data.data.user.role);
        console.log('Token:', response.data.data.token);
        
        return response.data.data.token;
        
    } catch (error) {
        console.error('❌ Error creating test admin account:');
        console.error('Status:', error.response?.status);
        console.error('Response:', error.response?.data);
        console.error('Message:', error.message);
        
        // If account already exists, try to login
        if (error.response?.status === 409) {
            console.log('🔑 Account already exists, trying to login...');
            try {
                const loginResponse = await axios.post('http://localhost:5000/api/users/login', {
                    email: 'testadmin@example.com',
                    password: 'TestAdmin123!'
                });
                
                console.log('✅ Login successful!');
                console.log('Token:', loginResponse.data.data.token);
                return loginResponse.data.data.token;
                
            } catch (loginError) {
                console.error('❌ Login failed:', loginError.response?.data || loginError.message);
                return null;
            }
        }
        
        return null;
    }
}

createTestAdmin();
