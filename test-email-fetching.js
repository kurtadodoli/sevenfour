const axios = require('axios');
const mysql = require('mysql2/promise');
const { dbConfig } = require('./server/config/db');

async function testEmailBasedFetching() {
    console.log('🧪 TESTING EMAIL-BASED CUSTOM ORDERS FETCHING\n');
    
    try {
        // Step 1: Check what orders exist in database for this email
        console.log('1. Checking database for orders by email...');
        const connection = await mysql.createConnection(dbConfig);
        
        const testEmail = 'kurtadodoli@gmail.com';
        const [orders] = await connection.execute(`
            SELECT 
                co.custom_order_id,
                co.customer_email,
                co.user_id,
                co.product_type,
                co.product_name,
                co.status,
                co.created_at
            FROM custom_orders co
            WHERE co.customer_email = ?
            ORDER BY co.created_at DESC
        `, [testEmail]);
        
        console.log(`📊 Found ${orders.length} orders in database for email: ${testEmail}`);
        orders.forEach((order, index) => {
            console.log(`  ${index + 1}. ${order.custom_order_id} - ${order.product_type}`);
            console.log(`      Email: ${order.customer_email}, User ID: ${order.user_id}`);
            console.log(`      Created: ${new Date(order.created_at).toLocaleString()}`);
        });
        
        await connection.end();
        
        // Step 2: Login and test API endpoint
        console.log('\n2. Testing API endpoint with email-based fetching...');
        const loginResponse = await axios.post('http://localhost:3001/api/users/login', {
            email: testEmail,
            password: 'password123'
        });
        
        if (!loginResponse.data.success) {
            console.log('❌ Login failed:', loginResponse.data.message);
            return;
        }
        
        const token = loginResponse.data.token;
        console.log('✅ Login successful');
        
        // Step 3: Fetch orders via API
        const ordersResponse = await axios.get('http://localhost:3001/api/custom-orders/my-orders', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ API call successful');
        console.log(`📊 API returned ${ordersResponse.data.count} orders`);
        
        if (ordersResponse.data.data && ordersResponse.data.data.length > 0) {
            console.log('\n📋 Orders returned by API:');
            ordersResponse.data.data.forEach((order, index) => {
                console.log(`  ${index + 1}. ${order.custom_order_id} - ${order.product_type}`);
                console.log(`      Email: ${order.customer_email}`);
                console.log(`      Created: ${new Date(order.created_at).toLocaleString()}`);
            });
        }
        
        // Step 4: Compare database vs API results
        console.log('\n4. Comparison:');
        console.log(`   Database orders: ${orders.length}`);
        console.log(`   API orders: ${ordersResponse.data.count}`);
        console.log(`   Match: ${orders.length === ordersResponse.data.count ? '✅ YES' : '❌ NO'}`);
        
        if (orders.length === ordersResponse.data.count) {
            console.log('\n🎉 SUCCESS! Email-based fetching is working correctly');
            console.log('   ✅ All orders for this email are being returned');
            console.log('   ✅ API and database counts match');
        } else {
            console.log('\n❌ MISMATCH! API is not returning all orders for this email');
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.response) {
            console.log('Response status:', error.response.status);
            console.log('Response data:', error.response.data);
        }
    }
}

testEmailBasedFetching();
