const axios = require('axios');

// Test function to debug the 500 error on custom orders endpoints
async function debugCustomOrdersAPI() {
    console.log('🔍 Debugging Custom Orders API 500 Error...\n');
    
    const baseURL = 'http://localhost:3001/api';
    
    try {
        // First, let's test basic server connectivity
        console.log('1. Testing basic server connectivity...');
        const healthCheck = await axios.get(`${baseURL}/products`);
        console.log('✅ Server is responding, products endpoint works');
        
        // Test user login to get a valid JWT token
        console.log('\n2. Testing user login to get JWT token...');
        const loginResponse = await axios.post(`${baseURL}/auth/login`, {
            email: 'kurtadodoli@gmail.com',
            password: 'password123'
        });
        
        if (loginResponse.data.token) {
            console.log('✅ Login successful, got JWT token');
            const token = loginResponse.data.token;
            
            // Test the custom orders endpoint with auth header
            console.log('\n3. Testing custom orders my-orders endpoint...');
            try {
                const customOrdersResponse = await axios.get(`${baseURL}/custom-orders/my-orders`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                console.log('✅ Custom orders endpoint worked!');
                console.log('Response data:', customOrdersResponse.data);
            } catch (customOrdersError) {
                console.log('❌ Custom orders endpoint failed with 500 error');
                console.log('Error details:', {
                    status: customOrdersError.response?.status,
                    statusText: customOrdersError.response?.statusText,
                    data: customOrdersError.response?.data,
                    message: customOrdersError.message
                });
            }
            
            // Test the user-designs endpoint
            console.log('\n4. Testing user-designs endpoint...');
            try {
                const userDesignsResponse = await axios.get(`${baseURL}/user-designs/kurtadodoli%40gmail.com`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                console.log('✅ User designs endpoint worked!');
                console.log('Response data:', userDesignsResponse.data);
            } catch (userDesignsError) {
                console.log('❌ User designs endpoint failed');
                console.log('Error details:', {
                    status: userDesignsError.response?.status,
                    statusText: userDesignsError.response?.statusText,
                    data: userDesignsError.response?.data,
                    message: userDesignsError.message
                });
            }
            
        } else {
            console.log('❌ Login failed - no token received');
            console.log('Login response:', loginResponse.data);
        }
        
    } catch (error) {
        console.error('❌ Error during API debugging:', {
            message: error.message,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data
        });
    }
}

// Run the debug test
debugCustomOrdersAPI();
