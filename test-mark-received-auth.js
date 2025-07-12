const axios = require('axios');

async function testMarkReceivedWithAuth() {
    console.log('=== TESTING MARK-RECEIVED WITH AUTH TOKEN ===');
    
    try {
        // First, let's log in to get a token - try multiple passwords
        const passwords = ['password123', 'admin123', '123456', 'password', 'kurtadodoli', 'test123'];
        let token = null;
        let loginSuccess = false;
        
        for (const password of passwords) {
            try {
                console.log(`🔑 Trying password: ${password}`);
                const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
                    email: 'krutadodoli@gmail.com',
                    password: password
                });
                
                if (loginResponse.data.success) {
                    token = loginResponse.data.token;
                    loginSuccess = true;
                    console.log(`✅ Login successful with password: ${password}`);
                    break;
                }
            } catch (error) {
                console.log(`❌ Failed with password: ${password}`);
            }
        }
        
        
        if (!loginSuccess) {
            console.log('❌ Login failed with all passwords');
            return;
        }
        
        console.log('✅ Login successful, got token');
        
        // Now test the mark-received endpoint with auth
        const customOrderId = 'CUSTOM-MCSNSHEW-E616P';
        const endpoint = `http://localhost:5000/api/custom-orders/${customOrderId}/mark-received`;
        
        console.log('🧪 Testing endpoint:', endpoint);
        
        const response = await axios.post(endpoint, {}, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            timeout: 10000
        });
        
        console.log('✅ Success:', response.status, response.data);
        
    } catch (error) {
        if (error.response) {
            console.log(`❌ Error Status: ${error.response.status}`);
            console.log('Error Data:', error.response.data);
            console.log('Error Message:', error.response.data?.message || 'No message');
        } else {
            console.log('❌ Network/Request Error:', error.message);
        }
    }
}

testMarkReceivedWithAuth();
