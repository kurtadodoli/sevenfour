const axios = require('axios');
require('dotenv').config();

const API_URL = 'http://localhost:5000';

const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    validateStatus: status => status < 500
});

async function testAuthEndpoints() {
    try {
        console.log('🔍 Testing Auth Endpoints...\n');

        // Test Login
        console.log('Testing Login Endpoint:');
        console.log('------------------------');
        try {
            const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
                email: 'admin@sevenfour.com',
                password: 'Admin@123'
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log('✅ Login Success!');
            console.log('Status:', loginResponse.status);
            console.log('Response:', JSON.stringify(loginResponse.data, null, 2));
            console.log('Token received:', !!loginResponse.data.token);
        } catch (error) {
            console.log('❌ Login Failed!');
            console.log('Status:', error.response?.status);
            console.log('Error:', error.response?.data || error.message);
        }

        console.log('\n');

        // Test Register
        console.log('Testing Register Endpoint:');
        console.log('-------------------------');
        const testUser = {
            email: `test.user.${Date.now()}@example.com`,
            password: 'Test@123',
            firstName: 'Test',
            lastName: 'User',
            birthday: '1990-01-01',
            gender: 'other',
            newsletter: false
        };

        try {
            const registerResponse = await axios.post(`${API_URL}/api/auth/register`, testUser, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log('✅ Register Success!');
            console.log('Status:', registerResponse.status);
            console.log('Response:', JSON.stringify(registerResponse.data, null, 2));
        } catch (error) {
            console.log('❌ Register Failed!');
            console.log('Status:', error.response?.status);
            console.log('Error:', error.response?.data || error.message);
        }

        // Test Invalid Login
        console.log('\nTesting Invalid Login:');
        console.log('----------------------');
        try {
            await axios.post(`${API_URL}/api/auth/login`, {
                email: 'wrong@email.com',
                password: 'wrongpassword'
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        } catch (error) {
            if (error.response?.status === 401) {
                console.log('✅ Invalid Login Test Passed (Got 401 as expected)');
            } else {
                console.log('❌ Invalid Login Test Failed');
                console.log('Status:', error.response?.status);
                console.log('Error:', error.response?.data || error.message);
            }
        }

    } catch (error) {
        console.error('❌ Test Suite Error:', error.message);
    }
}

// Run the tests
testAuthEndpoints();
