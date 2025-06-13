// Test Authentication Endpoints
const axios = require('axios');

const API_BASE = 'http://localhost:5000';

async function testAuth() {
    try {
        console.log('🧪 Testing Authentication Endpoints...\n');

        // Test 1: Register a new user
        console.log('1️⃣ Testing Registration...');
        const registerData = {
            first_name: 'Test',
            last_name: 'User',
            email: 'test@example.com',
            password: 'TestPassword123!',
            gender: 'male',
            birthday: '1990-01-01'
        };

        try {
            const registerResponse = await axios.post(`${API_BASE}/api/auth/register`, registerData);
            console.log('✅ Registration successful:', registerResponse.data.message);
            console.log('🔐 Token received:', registerResponse.data.data.token ? 'Yes' : 'No');
        } catch (error) {
            console.log('❌ Registration failed:', error.response?.data?.message || error.message);
        }

        // Test 2: Login with admin credentials
        console.log('\n2️⃣ Testing Admin Login...');
        const loginData = {
            email: 'kurtadodoli@gmail.com',
            password: 'Admin123!@#'
        };

        let token = null;
        try {
            const loginResponse = await axios.post(`${API_BASE}/api/auth/login`, loginData);
            console.log('✅ Admin login successful:', loginResponse.data.message);
            token = loginResponse.data.data.token;
            console.log('🔐 Token received:', token ? 'Yes' : 'No');
            console.log('👤 User role:', loginResponse.data.data.user.role);
        } catch (error) {
            console.log('❌ Admin login failed:', error.response?.data?.message || error.message);
        }

        // Test 3: Get profile with token
        if (token) {
            console.log('\n3️⃣ Testing Profile Access...');
            try {
                const profileResponse = await axios.get(`${API_BASE}/api/auth/profile`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                console.log('✅ Profile access successful');
                console.log('👤 User:', profileResponse.data.data.user.first_name, profileResponse.data.data.user.last_name);
            } catch (error) {
                console.log('❌ Profile access failed:', error.response?.data?.message || error.message);
            }

            // Test 4: Verify token
            console.log('\n4️⃣ Testing Token Verification...');
            try {
                const verifyResponse = await axios.get(`${API_BASE}/api/auth/verify`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                console.log('✅ Token verification successful');
                console.log('👤 Verified user:', verifyResponse.data.data.user.email);
            } catch (error) {
                console.log('❌ Token verification failed:', error.response?.data?.message || error.message);
            }
        }

        console.log('\n🎉 Authentication test completed!\n');

    } catch (error) {
        console.error('💥 Test suite error:', error.message);
    }
}

// Run the test
testAuth();
