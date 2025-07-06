const axios = require('axios');

const baseURL = 'http://localhost:5000';

async function testWithAuthentication() {
    console.log('Testing endpoints with admin authentication...\n');
    
    try {
        // Step 1: Login as an admin user
        console.log('1. Logging in as admin...');
        const loginResponse = await axios.post(`${baseURL}/api/auth/login`, {
            email: 'test@admin.com',
            password: 'admin123'
        });
        
        if (!loginResponse.data.success) {
            console.log('Login failed, trying different password...');
            // Try common test passwords
            const passwords = ['admin123', 'admin', 'test123', '123456'];
            let loginSuccess = false;
            
            for (const pwd of passwords) {
                try {
                    const retryLogin = await axios.post(`${baseURL}/api/auth/login`, {
                        email: 'testadmin@example.com',
                        password: pwd
                    });
                    
                    if (retryLogin.data.success) {
                        console.log(`Login successful with password: ${pwd}`);
                        loginResponse.data = retryLogin.data;
                        loginSuccess = true;
                        break;
                    }
                } catch (e) {
                    // Continue trying
                }
            }
            
            if (!loginSuccess) {
                console.log('Could not login with any common passwords');
                console.log('Please login manually in the frontend first, then try these endpoints');
                return;
            }
        }
        
        const token = loginResponse.data.data.token;
        console.log('Login successful! Token obtained:', token.substring(0, 20) + '...');
        
        // Step 2: Test refund requests endpoint with authentication
        console.log('\n2. Testing /api/orders/refund-requests with admin token...');
        try {
            const refundResponse = await axios.get(`${baseURL}/api/orders/refund-requests`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log('✅ Refund requests status:', refundResponse.status);
            console.log('Data count:', refundResponse.data?.data?.length || 0);
            if (refundResponse.data?.data?.length > 0) {
                console.log('Sample request:', JSON.stringify(refundResponse.data.data[0], null, 2));
            }
        } catch (error) {
            console.log('❌ Refund requests error:');
            if (error.response) {
                console.log('Status:', error.response.status);
                console.log('Error:', error.response.data);
            } else {
                console.log('Error:', error.message);
            }
        }
        
        // Step 3: Test transactions endpoint with authentication
        console.log('\n3. Testing /api/orders/transactions/all with admin token...');
        try {
            const transResponse = await axios.get(`${baseURL}/api/orders/transactions/all`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log('✅ Transactions status:', transResponse.status);
            console.log('Data count:', transResponse.data?.data?.length || 0);
            if (transResponse.data?.data?.length > 0) {
                console.log('Sample transaction:', JSON.stringify(transResponse.data.data[0], null, 2));
            }
        } catch (error) {
            console.log('❌ Transactions error:');
            if (error.response) {
                console.log('Status:', error.response.status);
                console.log('Error:', error.response.data);
            } else {
                console.log('Error:', error.message);
            }
        }
        
    } catch (error) {
        console.error('Authentication test failed:', error.message);
        if (error.response) {
            console.log('Login error:', error.response.data);
        }
    }
}

testWithAuthentication().then(() => {
    console.log('\nAuthenticated endpoint tests completed');
    process.exit(0);
}).catch(error => {
    console.error('Test script error:', error);
    process.exit(1);
});
