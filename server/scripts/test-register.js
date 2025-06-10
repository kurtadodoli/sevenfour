const axios = require('axios');

const testRegistration = async () => {
    try {
        const testUser = {
            firstName: 'Test',
            lastName: 'User',
            email: 'testuser@example.com',
            password: 'TestPass123',
            gender: 'other',
            birthday: '2000-01-01'
        };

        console.log('Testing server connection...');
        try {
            await axios.get('http://localhost:5000/api/auth/status');
            console.log('Server is running ✅');
        } catch (error) {
            throw new Error('Server is not running or not accessible');
        }

        console.log('\nAttempting to register test user:', {
            ...testUser,
            password: '[REDACTED]'
        });
        
        const response = await axios.post('http://localhost:5000/api/auth/register', 
            testUser,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                timeout: 5000 // 5 second timeout
            }
        );

        console.log('\nRegistration Response:', {
            status: response.status,
            success: response.data.success,
            message: response.data.message,
            token: response.data.token ? '[TOKEN RECEIVED]' : '[NO TOKEN]',
            user: response.data.user
        });

    } catch (error) {
        console.error('\nRegistration Error:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            stack: error.stack
        });
    }
};

testRegistration();
