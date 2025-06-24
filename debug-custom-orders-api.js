const axios = require('axios');

async function debugCustomOrdersAPI() {
    console.log('🔍 DEBUGGING CUSTOM ORDERS API INTEGRATION\n');
    
    const baseURL = 'http://localhost:3001';
    
    try {
        // Step 1: Check if we can reach the server
        console.log('1. Testing server connectivity...');
        const healthCheck = await axios.get(`${baseURL}/api/test`);
        console.log('✅ Server is reachable');
        
        // Step 2: Check what custom orders exist in the database
        console.log('\n2. Checking custom orders in database...');
        const { dbConfig } = require('./server/config/db');
        const mysql = require('mysql2/promise');
        
        const connection = await mysql.createConnection(dbConfig);
        
        const [orders] = await connection.execute(`
            SELECT 
                custom_order_id, 
                product_type, 
                customer_name, 
                customer_email, 
                user_id,
                status,
                created_at
            FROM custom_orders 
            ORDER BY created_at DESC
        `);
        
        console.log(`📊 Found ${orders.length} custom orders in database:`);
        orders.forEach((order, index) => {
            console.log(`  ${index + 1}. ${order.custom_order_id} - ${order.customer_name} (${order.customer_email}) - User ID: ${order.user_id || 'NULL'}`);
        });
        
        await connection.end();
        
        // Step 3: Test the my-orders endpoint without authentication
        console.log('\n3. Testing /api/custom-orders/my-orders without auth...');
        try {
            const response = await axios.get(`${baseURL}/api/custom-orders/my-orders`);
            console.log('Response:', response.data);
        } catch (error) {
            console.log(`Expected error (401): ${error.response?.status} - ${error.response?.data?.message}`);
        }
        
        // Step 4: Check if there are any users to test with
        console.log('\n4. Checking users in database...');
        const connection2 = await mysql.createConnection(dbConfig);
        const [users] = await connection2.execute('SELECT id, username, email FROM users LIMIT 5');
        console.log(`👥 Found ${users.length} users:`);
        users.forEach((user, index) => {
            console.log(`  ${index + 1}. ID: ${user.id} - ${user.username} (${user.email})`);
        });
        await connection2.end();
        
        // Step 5: Try to create a test token and make authenticated request
        console.log('\n5. Testing authentication flow...');
        
        if (users.length > 0) {
            const testUser = users[0];
            console.log(`Testing with user: ${testUser.username} (ID: ${testUser.id})`);
            
            // Try to login to get a real token
            try {
                const loginResponse = await axios.post(`${baseURL}/api/auth/login`, {
                    email: testUser.email,
                    password: 'test123' // This might not work, but let's try
                });
                
                if (loginResponse.data.success) {
                    console.log('✅ Login successful, testing authenticated endpoint...');
                    const token = loginResponse.data.token;
                    
                    const authResponse = await axios.get(`${baseURL}/api/custom-orders/my-orders`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    
                    console.log('✅ Authenticated request successful!');
                    console.log('Response:', authResponse.data);
                } else {
                    console.log('❌ Login failed');
                }
            } catch (loginError) {
                console.log('❌ Login attempt failed:', loginError.response?.data?.message || loginError.message);
            }
        }
        
        console.log('\n🔍 DEBUGGING SUMMARY:');
        console.log('- Server is running and accessible');
        console.log(`- Database has ${orders.length} custom orders`);
        console.log(`- Database has ${users.length} users`);
        console.log('- Authentication endpoint requires valid credentials');
        
        console.log('\n💡 NEXT STEPS TO CHECK:');
        console.log('1. Verify user is logged in the React app');
        console.log('2. Check browser console for errors');
        console.log('3. Verify JWT token is being sent correctly');
        console.log('4. Check if user_id matches between orders and logged-in user');
        
    } catch (error) {
        console.error('❌ Debug failed:', error.message);
    }
}

debugCustomOrdersAPI();
