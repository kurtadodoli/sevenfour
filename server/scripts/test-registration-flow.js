const axios = require('axios');

const API_URL = 'http://localhost:5000';

const testRegistrationFlow = async () => {
    console.log('🧪 Testing Registration and Login Flow');
    console.log('=====================================\n');    // Test user data with proper password requirements
    const testUser = {
        firstName: 'John',
        lastName: 'Doe',
        email: `test.user.${Date.now()}@example.com`,
        password: 'TestPass123!',
        gender: 'male',
        birthday: '1990-01-01'
    };

    try {
        // 1. Test server connection
        console.log('1. Testing server connection...');
        try {
            await axios.get(`${API_URL}/api/auth/verify`, {
                timeout: 3000,
                validateStatus: () => true // Accept any status code
            });
            console.log('✅ Server is accessible\n');
        } catch (error) {
            console.log('❌ Server connection failed');
            console.log('   Make sure the server is running on port 5000\n');
            return;
        }

        // 2. Test Registration
        console.log('2. Testing user registration...');
        console.log(`   Email: ${testUser.email}`);
        console.log(`   Password: ${testUser.password}`);
        
        let registrationResponse;
        try {
            registrationResponse = await axios.post(`${API_URL}/api/auth/register`, testUser, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                timeout: 10000
            });

            if (registrationResponse.data.success) {
                console.log('✅ Registration successful!');
                console.log(`   User ID: ${registrationResponse.data.user.user_id}`);
                console.log(`   Token received: ${registrationResponse.data.token ? 'Yes' : 'No'}`);
                console.log(`   User role: ${registrationResponse.data.user.role}\n`);
            } else {
                console.log('❌ Registration failed');
                console.log(`   Message: ${registrationResponse.data.message}\n`);
                return;
            }
        } catch (error) {
            console.log('❌ Registration failed');
            if (error.response?.data) {
                console.log(`   Status: ${error.response.status}`);
                console.log(`   Message: ${error.response.data.message}`);
                if (error.response.data.errors) {
                    console.log('   Validation errors:');
                    error.response.data.errors.forEach(err => console.log(`     - ${err}`));
                }
            } else {
                console.log(`   Error: ${error.message}`);
            }
            console.log('');
            return;
        }

        // 3. Test Login with the newly created account
        console.log('3. Testing login with new account...');
        try {
            const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
                email: testUser.email,
                password: testUser.password
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                timeout: 10000
            });

            if (loginResponse.data.success) {
                console.log('✅ Login successful!');
                console.log(`   User ID: ${loginResponse.data.user.id}`);
                console.log(`   User role: ${loginResponse.data.user.role}`);
                console.log(`   Token received: ${loginResponse.data.token ? 'Yes' : 'No'}\n`);
            } else {
                console.log('❌ Login failed');
                console.log(`   Message: ${loginResponse.data.message}\n`);
            }
        } catch (error) {
            console.log('❌ Login failed');
            if (error.response?.data) {
                console.log(`   Status: ${error.response.status}`);
                console.log(`   Message: ${error.response.data.message}`);
            } else {
                console.log(`   Error: ${error.message}`);
            }
            console.log('');
        }

        // 4. Test duplicate registration
        console.log('4. Testing duplicate email registration...');
        try {
            await axios.post(`${API_URL}/api/auth/register`, testUser, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                timeout: 10000
            });
            console.log('❌ Duplicate registration should have failed but succeeded\n');
        } catch (error) {
            if (error.response?.status === 400) {
                console.log('✅ Duplicate email properly rejected');
                console.log(`   Message: ${error.response.data.message}\n`);
            } else {
                console.log('❌ Unexpected error for duplicate registration');
                console.log(`   Status: ${error.response?.status}`);
                console.log(`   Message: ${error.response?.data?.message || error.message}\n`);
            }
        }

        // 5. Test invalid password registration
        console.log('5. Testing weak password validation...');        try {
            await axios.post(`${API_URL}/api/auth/register`, {
                ...testUser,
                email: `weak.password.${Date.now()}@example.com`,
                password: 'weak'
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                timeout: 10000
            });
            console.log('❌ Weak password should have been rejected but was accepted\n');
        } catch (error) {
            if (error.response?.status === 400) {
                console.log('✅ Weak password properly rejected');
                console.log(`   Message: ${error.response.data.message}`);
                if (error.response.data.errors) {
                    console.log('   Validation errors:');
                    error.response.data.errors.forEach(err => console.log(`     - ${err}`));
                }
                console.log('');
            } else {
                console.log('❌ Unexpected error for weak password');
                console.log(`   Status: ${error.response?.status}`);
                console.log(`   Message: ${error.response?.data?.message || error.message}\n`);
            }
        }

        console.log('🎉 Registration flow test completed!');
        console.log('=====================================');

    } catch (error) {
        console.error('💥 Unexpected error during testing:', error.message);
    }
};

// Run the test
testRegistrationFlow();
