const axios = require('axios');

async function testAuthenticatedAPI() {
    try {
        console.log('🧪 Testing authenticated API access...');
        
        // Test different admin credentials
        const adminCredentials = [
            { email: 'admin@sevenforclothing.com', password: 'admin123' },
            { email: 'admin@test.com', password: 'admin123' },
            { email: 'admin@admin.com', password: 'admin123' },
            { email: 'admin', password: 'admin' }
        ];
        
        let authToken = null;
        
        for (const creds of adminCredentials) {
            try {
                console.log(`🔐 Trying login with ${creds.email}...`);
                const loginResponse = await axios.post('http://localhost:5000/api/users/login', creds);
                
                if (loginResponse.data.success && loginResponse.data.token) {
                    authToken = loginResponse.data.token;
                    console.log(`✅ Login successful with ${creds.email}`);
                    console.log(`👤 User role: ${loginResponse.data.user?.role || 'unknown'}`);
                    break;
                } else {
                    console.log(`❌ Login failed for ${creds.email}: ${loginResponse.data.message}`);
                }
            } catch (loginError) {
                console.log(`❌ Login error for ${creds.email}: ${loginError.response?.data?.message || loginError.message}`);
            }
        }
        
        if (!authToken) {
            console.log('\n❌ Could not authenticate with any admin credentials');
            console.log('🔍 Let me check what users exist in the database...');
            
            // Check users in database
            const mysql = require('mysql2/promise');
            const { dbConfig } = require('./server/config/db');
            
            const connection = await mysql.createConnection(dbConfig);
            const [users] = await connection.execute(`
                SELECT user_id, first_name, last_name, email, role, is_active 
                FROM users 
                WHERE role = 'admin' OR email LIKE '%admin%'
                ORDER BY created_at DESC
            `);
            
            console.log('\n👥 Admin users in database:');
            users.forEach(user => {
                console.log(`  - ${user.email} (${user.role}) - Active: ${user.is_active} - Name: ${user.first_name} ${user.last_name}`);
            });
            
            await connection.end();
            return;
        }
        
        // Test the custom orders API with valid auth
        console.log('\n📡 Testing custom orders API with authentication...');
        
        try {
            const apiResponse = await axios.get('http://localhost:5000/api/custom-orders/admin/all', {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });
            
            console.log(`✅ API Response Status: ${apiResponse.status}`);
            console.log(`📋 API Success: ${apiResponse.data.success}`);
            console.log(`📊 Data Count: ${apiResponse.data.data?.length || 0}`);
            console.log(`📄 Total Orders: ${apiResponse.data.count || 'unknown'}`);
            
            if (apiResponse.data.success && apiResponse.data.data && apiResponse.data.data.length > 0) {
                console.log('\n📋 Sample orders from API:');
                apiResponse.data.data.slice(0, 3).forEach((order, index) => {
                    console.log(`  ${index + 1}. ${order.custom_order_id}`);
                    console.log(`      Status: ${order.status} -> ${order.status_display}`);
                    console.log(`      Customer: ${order.customer_name} (${order.customer_email})`);
                    console.log(`      Product: ${order.product_display_name}`);
                    console.log(`      Images: ${order.image_count || 0}`);
                    console.log(`      Created: ${order.created_at}`);
                });
                
                console.log('\n✅ API is working correctly and returning data!');
                console.log('🔧 Issue might be on the frontend side');
            } else {
                console.log('\n❌ API returned no data');
            }
            
        } catch (apiError) {
            console.error('❌ API request failed:', apiError.response?.status, apiError.response?.data?.message || apiError.message);
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testAuthenticatedAPI().then(() => {
    console.log('\n✅ Authentication test complete');
    process.exit(0);
}).catch(err => {
    console.error('💥 Authentication test failed:', err);
    process.exit(1);
});
