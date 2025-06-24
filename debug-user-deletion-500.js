const axios = require('axios');

async function debugUserDeletion() {
    console.log('🔍 Debugging User Deletion 500 Error');
    console.log('=====================================');

    try {
        // Step 1: Login as admin        console.log('1. Logging in as admin...');
        const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
            email: 'testadmin@example.com',
            password: 'admin123'
        });

        if (!loginResponse.data.success) {
            console.error('❌ Login failed:', loginResponse.data);
            return;
        }        const token = loginResponse.data.token;
        console.log('✅ Login successful, token received');
        console.log('Token preview:', token ? token.substring(0, 50) + '...' : 'No token');
        console.log('Full login response:', JSON.stringify(loginResponse.data, null, 2));

        // Step 2: Get current user logs to find a test user ID
        console.log('\n2. Fetching user logs...');
        const userLogsResponse = await axios.get('http://localhost:3001/api/admin/user-logs', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!userLogsResponse.data || userLogsResponse.data.length === 0) {
            console.log('❌ No users found in user logs');
            return;
        }

        console.log(`✅ Found ${userLogsResponse.data.length} users`);
        
        // Find a non-admin user to test deletion
        const testUser = userLogsResponse.data.find(user => 
            user.role !== 'admin' && user.email !== 'admin@sevenfour.com'
        );

        if (!testUser) {
            console.log('❌ No non-admin users found for testing');
            return;
        }

        console.log(`✅ Found test user: ${testUser.email} (ID: ${testUser.user_id})`);

        // Step 3: Try to delete the user
        console.log(`\n3. Attempting to delete user ID: ${testUser.user_id}...`);
        
        try {
            const deleteResponse = await axios.delete(
                `http://localhost:3001/api/admin/users/${testUser.user_id}`,
                {
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );

            console.log('✅ User deletion successful:', deleteResponse.data);

        } catch (deleteError) {
            console.error('❌ User deletion failed:');
            console.error('Status:', deleteError.response?.status);
            console.error('Status Text:', deleteError.response?.statusText);
            console.error('Error Data:', deleteError.response?.data);
            
            if (deleteError.response?.status === 500) {
                console.error('\n💥 500 Internal Server Error Details:');
                console.error('Message:', deleteError.response.data?.message);
                console.error('Error:', deleteError.response.data?.error);
                console.error('Details:', deleteError.response.data?.details);
            }
        }

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
    }
}

// Run the debug test
debugUserDeletion().catch(console.error);
