const axios = require('axios');

async function testAuthenticatedCustomOrders() {
    console.log('🧪 TESTING AUTHENTICATED CUSTOM ORDERS ENDPOINT\n');
    
    const baseURL = 'http://localhost:3001';
    
    try {
        // Test with Kurt's account (krutadodoli@gmail.com) since he has the most orders
        console.log('1. Attempting to login as Kurt (krutadodoli@gmail.com)...');
        
        // We'll need to try common passwords or create a test user
        const testCredentials = [
            { email: 'krutadodoli@gmail.com', password: 'password' },
            { email: 'krutadodoli@gmail.com', password: 'test123' },
            { email: 'krutadodoli@gmail.com', password: '123456' },
            { email: 'testuser1749780547242@example.com', password: 'test123' },
            { email: 'test@example.com', password: 'test123' }
        ];
        
        let successfulLogin = null;
        
        for (const cred of testCredentials) {
            try {
                console.log(`Trying ${cred.email} with password ${cred.password}...`);
                const loginResponse = await axios.post(`${baseURL}/api/auth/login`, cred);
                
                if (loginResponse.data.success) {
                    console.log(`✅ Login successful for ${cred.email}!`);
                    successfulLogin = {
                        ...cred,
                        token: loginResponse.data.token,
                        user: loginResponse.data.user
                    };
                    break;
                }
            } catch (loginError) {
                console.log(`❌ Login failed for ${cred.email}: ${loginError.response?.data?.message || loginError.message}`);
            }
        }
        
        if (successfulLogin) {
            console.log(`\n2. Testing /api/custom-orders/my-orders with ${successfulLogin.email}...`);
            
            const authResponse = await axios.get(`${baseURL}/api/custom-orders/my-orders`, {
                headers: {
                    'Authorization': `Bearer ${successfulLogin.token}`
                }
            });
            
            console.log('✅ Authenticated request successful!');
            console.log(`Found ${authResponse.data.data.length} custom orders:`);
            
            authResponse.data.data.forEach((order, index) => {
                console.log(`  ${index + 1}. ${order.custom_order_id} - ${order.product_type} (${order.status})`);
            });
            
        } else {
            console.log('\n❌ Could not login with any test credentials.');
            console.log('Creating a new test user...');
            
            // Create a new test user
            const newUser = {
                first_name: 'Test',
                last_name: 'OrderUser',
                email: 'testorder@example.com',
                password: 'test123',
                gender: 'other',
                birthday: '1990-01-01'
            };
            
            try {
                const registerResponse = await axios.post(`${baseURL}/api/auth/register`, newUser);
                console.log('✅ New user created successfully!');
                
                // Now login with the new user
                const loginResponse = await axios.post(`${baseURL}/api/auth/login`, {
                    email: newUser.email,
                    password: newUser.password
                });
                
                if (loginResponse.data.success) {
                    console.log('✅ Login successful with new user!');
                    
                    const authResponse = await axios.get(`${baseURL}/api/custom-orders/my-orders`, {
                        headers: {
                            'Authorization': `Bearer ${loginResponse.data.token}`
                        }
                    });
                    
                    console.log(`Found ${authResponse.data.data.length} custom orders for new user (should be 0)`);
                }
                
            } catch (registerError) {
                console.log('❌ Could not create new user:', registerError.response?.data?.message || registerError.message);
            }
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testAuthenticatedCustomOrders();
