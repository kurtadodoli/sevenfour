const axios = require('axios');
const mysql = require('mysql2/promise');
const { dbConfig } = require('./server/config/db');

async function debugFullCustomOrdersFlow() {
    console.log('🔍 COMPREHENSIVE CUSTOM ORDERS DEBUG\n');
    
    try {
        // Step 1: Check database directly
        console.log('1. Checking database for custom orders...');
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
        
        console.log(`📊 Found ${orders.length} orders in database`);
        orders.forEach((order, index) => {
            console.log(`  ${index + 1}. ${order.custom_order_id} - ${order.product_type}`);
            console.log(`      User ID: ${order.user_id}, Customer Email: ${order.customer_email}`);
            console.log(`      Created: ${order.created_at}`);
        });
        
        await connection.end();
        
        // Step 2: Test login and get real token
        console.log('\n2. Testing login to get JWT token...');
        const loginResponse = await axios.post('http://localhost:3001/api/users/login', {
            email: 'kurtadodoli@gmail.com',
            password: 'password123'
        });
        
        if (!loginResponse.data.success) {
            console.log('❌ Login failed:', loginResponse.data.message);
            console.log('Available users in database:');
            
            const connection2 = await mysql.createConnection(dbConfig);
            const [users] = await connection2.execute(`
                SELECT user_id, email, first_name, last_name 
                FROM users 
                WHERE email LIKE '%kurt%' OR email LIKE '%adodoli%'
            `);
            users.forEach(user => {
                console.log(`  - ${user.email} (ID: ${user.user_id})`);
            });
            await connection2.end();
            return;
        }
        
        const token = loginResponse.data.token;
        console.log('✅ Login successful');
        console.log('Token received:', token ? 'Yes' : 'No');
        
        // Step 3: Decode and analyze the token
        console.log('\n3. Analyzing JWT token...');
        if (token) {
            try {
                const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
                console.log('Token payload:', payload);
                console.log('User ID in token:', payload.id);
                console.log('User email in token:', payload.email);
                console.log('Token expires:', new Date(payload.exp * 1000));
                console.log('Token is expired:', Date.now() > payload.exp * 1000);
            } catch (e) {
                console.log('❌ Error decoding token:', e.message);
            }
        }
        
        // Step 4: Test the my-orders endpoint with the real token
        console.log('\n4. Testing /api/custom-orders/my-orders with real token...');
        
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
        
        console.log('Request headers:', headers);
        
        try {
            const ordersResponse = await axios.get('http://localhost:3001/api/custom-orders/my-orders', {
                headers
            });
            
            console.log('✅ API call successful');
            console.log('Response status:', ordersResponse.status);
            console.log('Response data:', JSON.stringify(ordersResponse.data, null, 2));
            
            if (ordersResponse.data.success) {
                console.log(`\n📊 API returned ${ordersResponse.data.count} orders`);
                if (ordersResponse.data.data && ordersResponse.data.data.length > 0) {
                    ordersResponse.data.data.forEach((order, index) => {
                        console.log(`  ${index + 1}. ${order.custom_order_id} - ${order.product_type}`);
                    });
                } else {
                    console.log('❌ No orders in API response despite orders existing in database');
                }
            }
            
        } catch (apiError) {
            console.log('❌ API call failed:', apiError.response ? apiError.response.status : apiError.message);
            if (apiError.response) {
                console.log('Error response:', apiError.response.data);
            }
        }
        
        // Step 5: Check auth middleware logs
        console.log('\n5. The server logs should show auth middleware debug info above.');
        console.log('Look for "=== AUTH MIDDLEWARE DEBUG ===" in the server console');
        
    } catch (error) {
        console.error('❌ Debug failed:', error.message);
        if (error.response) {
            console.log('Error response status:', error.response.status);
            console.log('Error response data:', error.response.data);
        }
    }
}

debugFullCustomOrdersFlow();
