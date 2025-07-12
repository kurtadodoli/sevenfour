const axios = require('axios');
const mysql = require('mysql2/promise');
const { dbConfig } = require('./server/config/db');

async function testCustomMarkReceived() {
    console.log('=== TESTING CUSTOM ORDER MARK-RECEIVED ENDPOINT ===');
    
    try {
        // First, let's find a real custom order to test with
        const connection = await mysql.createConnection(dbConfig);
        
        const [customOrders] = await connection.execute(`
            SELECT custom_order_id, status, delivery_status, customer_email 
            FROM custom_orders 
            WHERE status IN ('delivered', 'shipped', 'processing')
            ORDER BY created_at DESC 
            LIMIT 5
        `);
        
        console.log('📋 Available custom orders:');
        customOrders.forEach((order, index) => {
            console.log(`${index + 1}. ID: ${order.custom_order_id}, Status: ${order.status}, Delivery: ${order.delivery_status}, Email: ${order.customer_email}`);
        });
        
        if (customOrders.length === 0) {
            console.log('❌ No custom orders found to test with');
            await connection.end();
            return;
        }
        
        const testOrder = customOrders[0];
        console.log(`\n🧪 Testing with order: ${testOrder.custom_order_id}`);
        
        // Find a user with this email to get auth token
        const [users] = await connection.execute(`
            SELECT user_id, email FROM users WHERE email = ?
        `, [testOrder.customer_email]);
        
        if (users.length === 0) {
            console.log('❌ No user found with matching email');
            await connection.end();
            return;
        }
        
        const testUser = users[0];
        console.log(`👤 Testing with user: ${testUser.email} (ID: ${testUser.user_id})`);
        
        await connection.end();
        
        // Test the endpoint directly
        console.log('\n🌐 Testing API endpoint...');
        
        // Since we need auth, let's test with a mock request to see if the endpoint exists
        try {
            const response = await axios.post(`http://localhost:5000/api/custom-orders/${testOrder.custom_order_id}/mark-received`, {}, {
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: 5000
            });
            
            console.log('✅ Response received:', response.status, response.data);
        } catch (error) {
            if (error.response) {
                console.log(`📋 Endpoint exists but returned: ${error.response.status} - ${error.response.statusText}`);
                console.log('Response data:', error.response.data);
                
                if (error.response.status === 401) {
                    console.log('✅ Endpoint found but requires authentication (expected)');
                } else if (error.response.status === 404) {
                    console.log('❌ 404 - Endpoint not found! This is the issue.');
                }
            } else if (error.code === 'ECONNREFUSED') {
                console.log('❌ Cannot connect to server. Make sure server is running on port 5000');
            } else {
                console.log('❌ Request error:', error.message);
            }
        }
        
    } catch (error) {
        console.error('❌ Test error:', error.message);
    }
}

// Run the test
testCustomMarkReceived();
