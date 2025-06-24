const axios = require('axios');
const mysql = require('mysql2/promise');
const { dbConfig } = require('./server/config/db');

async function debugOrderHistory() {
    console.log('🔍 DEBUGGING ORDER HISTORY ISSUE\n');
    
    try {
        const connection = await mysql.createConnection(dbConfig);
        
        // Check the current users and their orders
        console.log('1. Checking all users and their order counts...');
        const [userOrderCounts] = await connection.execute(`            SELECT 
                u.user_id,
                u.first_name,
                u.last_name,
                u.email,
                u.role,
                COUNT(o.id) as order_count
            FROM users u
            LEFT JOIN orders o ON u.user_id = o.user_id
            GROUP BY u.user_id
            ORDER BY u.created_at DESC
            LIMIT 10
        `);
        
        console.log('📊 Users and their order counts:');
        userOrderCounts.forEach(user => {
            console.log(`   ${user.first_name} ${user.last_name} (${user.email}) [${user.role}]: ${user.order_count} orders`);
        });
        
        // Check for the specific admin user we just created
        console.log('\n2. Checking the admin user specifically...');
        const [adminUser] = await connection.execute(`
            SELECT user_id, first_name, last_name, email, role
            FROM users 
            WHERE email = 'qka-adodoli@tip.edu.ph'
        `);
        
        if (adminUser.length > 0) {
            const admin = adminUser[0];
            console.log(`Admin user found: ${admin.first_name} ${admin.last_name} (ID: ${admin.user_id})`);
              // Check orders for this admin user
            const [adminOrders] = await connection.execute(`
                SELECT id, order_number, user_id, total_amount, order_date
                FROM orders 
                WHERE user_id = ?
            `, [admin.user_id]);
            
            console.log(`Admin user has ${adminOrders.length} orders`);
            if (adminOrders.length > 0) {
                adminOrders.forEach(order => {
                    console.log(`   Order ${order.order_number}: $${order.total_amount}`);
                });
            }
        }
        
        // Test the API with the admin user
        console.log('\n3. Testing API login and order fetch...');
        
        try {
            // Login with admin credentials
            const loginResponse = await axios.post('http://localhost:3001/api/users/login', {
                email: 'qka-adodoli@tip.edu.ph',
                password: 'admin123'
            });
            
            console.log('✅ Login successful');
            const token = loginResponse.data.token;
            
            // Decode token to see user info
            const payload = JSON.parse(atob(token.split('.')[1]));
            console.log('Token payload:', {
                id: payload.id,
                email: payload.email,
                role: payload.role
            });
            
            // Test the /me-with-items endpoint
            console.log('\n4. Testing /api/orders/me-with-items...');
            const ordersResponse = await axios.get('http://localhost:3001/api/orders/me-with-items', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            console.log(`API returned ${ordersResponse.data.data.length} orders`);
            if (ordersResponse.data.data.length > 0) {
                console.log('Orders returned by API:');
                ordersResponse.data.data.forEach((order, index) => {
                    console.log(`   ${index + 1}. Order ${order.order_number}: user_id=${order.user_id}, total=${order.total_amount || order.invoice_total}`);
                });
            } else {
                console.log('✅ No orders returned (expected for new user)');
            }
            
            // If admin role, test the admin endpoint too
            if (payload.role === 'admin') {
                console.log('\n5. Testing admin endpoint /api/orders...');
                const adminOrdersResponse = await axios.get('http://localhost:3001/api/orders', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                const allOrders = adminOrdersResponse.data.data.orders || adminOrdersResponse.data.data || [];
                console.log(`Admin endpoint returned ${allOrders.length} orders (all users)`);
            }
            
        } catch (apiError) {
            console.error('API Error:', apiError.response?.data || apiError.message);
        }
        
        await connection.end();
        
        console.log('\n🎯 ANALYSIS:');
        console.log('If the admin user sees orders from other users when using /me-with-items,');
        console.log('then there\'s a bug in the backend filtering.');
        console.log('If the frontend is calling the wrong endpoint, that needs to be fixed.');
        
    } catch (error) {
        console.error('❌ Debug failed:', error.message);
    }
}

debugOrderHistory();
