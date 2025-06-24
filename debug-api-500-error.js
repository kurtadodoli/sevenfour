const axios = require('axios');
const jwt = require('jsonwebtoken');

async function debugAPIError() {
    console.log('🔍 DEBUGGING 500 ERROR ON CUSTOM ORDERS API\n');
    
    try {
        // Create a test JWT token for Kurt
        const kurtUserId = 229491642395434;
        const testPayload = {
            user_id: kurtUserId,
            email: 'kurtadodoli@gmail.com',
            role: 'customer'
        };
        
        // Use a test secret (we need to check what the server uses)
        const testToken = jwt.sign(testPayload, 'test-secret', { expiresIn: '1h' });
        
        console.log('1. Testing with generated JWT token...');
        console.log('User ID:', kurtUserId);
        console.log('Email:', 'kurtadodoli@gmail.com');
        
        try {
            const response = await axios.get('http://localhost:3001/api/custom-orders/my-orders', {
                headers: {
                    'Authorization': `Bearer ${testToken}`
                }
            });
            
            console.log('✅ API call successful!');
            console.log('Response:', JSON.stringify(response.data, null, 2));
            
        } catch (error) {
            console.log('❌ API call failed:');
            console.log('Status:', error.response?.status);
            console.log('Status Text:', error.response?.statusText);
            console.log('Error Message:', error.response?.data?.message || error.message);
            console.log('Full Error Response:', JSON.stringify(error.response?.data, null, 2));
            
            if (error.response?.status === 500) {
                console.log('\n🔍 500 Error indicates a server-side issue. Common causes:');
                console.log('- Database connection error');
                console.log('- Invalid SQL query');
                console.log('- Missing environment variables');
                console.log('- JWT secret mismatch');
                console.log('- Node.js code syntax error');
            } else if (error.response?.status === 401) {
                console.log('\n🔍 401 Error indicates authentication issue:');
                console.log('- Invalid JWT token');
                console.log('- Wrong JWT secret');
                console.log('- Expired token');
                console.log('- Missing Authorization header');
            }
        }
        
        // Test the fallback endpoint too
        console.log('\n2. Testing fallback endpoint...');
        try {
            const fallbackResponse = await axios.get('http://localhost:3001/api/user-designs/kurtadodoli%40gmail.com');
            console.log('✅ Fallback endpoint successful!');
            console.log('Fallback Response:', JSON.stringify(fallbackResponse.data, null, 2));
        } catch (fallbackError) {
            console.log('❌ Fallback endpoint also failed:');
            console.log('Status:', fallbackError.response?.status);
            console.log('Error:', fallbackError.response?.data?.message || fallbackError.message);
        }
        
        console.log('\n💡 NEXT STEPS:');
        console.log('1. Check server console for detailed error messages');
        console.log('2. Verify JWT secret configuration');
        console.log('3. Check database connection and query syntax');
        console.log('4. Restart the server if needed');
        
    } catch (error) {
        console.error('❌ Debug script failed:', error.message);
    }
}

debugAPIError();
