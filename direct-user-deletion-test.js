const axios = require('axios');

async function directUserDeletionTest() {
    console.log('🔍 Direct User Deletion Test');
    console.log('============================');

    try {
        // Login to get token
        const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
            email: 'testadmin@example.com',
            password: 'admin123'
        });        // Extract token more carefully
        const tokenData = loginResponse.data;
        let token = null;
        
        if (tokenData && typeof tokenData === 'object') {
            // Check if token is in data.token or data.data.token
            token = tokenData.token || (tokenData.data && tokenData.data.token);
        }
        
        if (!token) {
            console.error('❌ Could not extract token from login response');
            console.log('Response keys:', Object.keys(tokenData || {}));
            return;
        }

        console.log('✅ Token extracted successfully');
        
        // Test the specific user ID that was failing: 967502321335183
        const userIdToDelete = '967502321335183';
        console.log(`🎯 Attempting to delete user ID: ${userIdToDelete}`);
        
        const deleteUrl = `http://localhost:3001/api/admin/users/${userIdToDelete}`;
        console.log(`URL: ${deleteUrl}`);

        try {
            const deleteResponse = await axios.delete(deleteUrl, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                timeout: 10000 // 10 second timeout
            });

            console.log('✅ Deletion successful!');
            console.log('Response:', deleteResponse.data);

        } catch (deleteError) {
            console.error('❌ Delete request failed');
            console.error('Status:', deleteError.response?.status);
            console.error('Status Text:', deleteError.response?.statusText);
            
            if (deleteError.response?.data) {
                console.error('Error details:', JSON.stringify(deleteError.response.data, null, 2));
            }
            
            if (deleteError.code === 'ECONNABORTED') {
                console.error('🕒 Request timed out - this suggests a server hang');
            }
        }

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

directUserDeletionTest();
