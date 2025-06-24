const axios = require('axios');
const mysql = require('mysql2/promise');
const { dbConfig } = require('./server/config/db');

async function debugOrderPageIssue() {
    console.log('🔍 DEBUGGING ORDERPAGE CUSTOM ORDERS ISSUE\n');
    
    try {
        // First, let's verify what's in the database for Kurt
        console.log('1. Checking database for Kurt\'s orders...');
        const connection = await mysql.createConnection(dbConfig);
        
        const [orders] = await connection.execute(`
            SELECT 
                co.custom_order_id,
                co.customer_email,
                co.user_id,
                co.product_type,
                co.product_name,
                co.status,
                co.created_at,
                u.first_name,
                u.last_name,
                u.email as user_email
            FROM custom_orders co
            LEFT JOIN users u ON co.user_id = u.user_id
            WHERE co.customer_email = 'kurtadodoli@gmail.com' OR u.email = 'kurtadodoli@gmail.com'
            ORDER BY co.created_at DESC
        `);
        
        console.log(`📊 Found ${orders.length} orders for kurtadodoli@gmail.com:`);
        orders.forEach((order, index) => {
            console.log(`  ${index + 1}. ${order.custom_order_id} - ${order.product_type} (Status: ${order.status})`);
            console.log(`      User ID: ${order.user_id}, Customer Email: ${order.customer_email}`);
        });
        
        // Check if the user exists and get their exact details
        console.log('\n2. Checking user details for Kurt...');
        const [users] = await connection.execute(`
            SELECT user_id, first_name, last_name, email
            FROM users 
            WHERE email LIKE '%kurt%' OR email LIKE '%adodoli%'
        `);
        
        console.log('Found users matching Kurt:');
        users.forEach((user, index) => {
            console.log(`  ${index + 1}. ID: ${user.user_id}, Name: ${user.first_name} ${user.last_name}, Email: ${user.email}`);
        });
        
        await connection.end();
        
        // Now let's test the API endpoint directly
        console.log('\n3. Testing the API endpoint...');
        
        // We need to simulate what the frontend is doing
        // Let's check if the API endpoint is working by testing with a mock JWT token
        
        console.log('Testing /api/custom-orders/my-orders endpoint...');
        
        // First, let's check if the endpoint responds at all (it should give 401)
        try {
            const response = await axios.get('http://localhost:3001/api/custom-orders/my-orders');
            console.log('Unexpected: Got response without auth:', response.data);
        } catch (error) {
            if (error.response && error.response.status === 401) {
                console.log('✅ Endpoint correctly requires authentication');
            } else {
                console.log('❌ Unexpected error:', error.message);
            }
        }
        
        console.log('\n4. Let\'s check what the frontend might be doing wrong...');
        console.log('Possible issues:');
        console.log('- JWT token might be invalid or expired');
        console.log('- User authentication might not be working properly');
        console.log('- Frontend might not be sending the Authorization header');
        console.log('- User ID in the token might not match the database');
        
        console.log('\n💡 DEBUGGING STEPS TO TRY:');
        console.log('1. Open browser developer tools (F12)');
        console.log('2. Go to Network tab');
        console.log('3. Refresh the Custom Orders tab');
        console.log('4. Look for the API call to /api/custom-orders/my-orders');
        console.log('5. Check if:');
        console.log('   - The request is being made');
        console.log('   - The Authorization header is present');
        console.log('   - The response status and data');
        
    } catch (error) {
        console.error('❌ Debug failed:', error.message);
    }
}

debugOrderPageIssue();
