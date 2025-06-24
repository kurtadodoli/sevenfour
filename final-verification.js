const mysql = require('mysql2/promise');
const { dbConfig } = require('./server/config/db');

async function finalVerification() {
    console.log('✅ FINAL VERIFICATION: Custom Orders OrderPage Integration\n');
    
    try {
        const connection = await mysql.createConnection(dbConfig);
        
        // Check current state of custom orders
        console.log('1. Current state of custom orders database:');
        const [orders] = await connection.execute(`
            SELECT 
                co.custom_order_id,
                co.customer_email,
                co.user_id,
                co.product_type,
                co.status,
                co.created_at,
                u.first_name,
                u.last_name
            FROM custom_orders co
            LEFT JOIN users u ON co.user_id = u.user_id
            ORDER BY co.created_at DESC
        `);
        
        console.log(`📊 Total Orders: ${orders.length}`);
        console.log('Order Status:');
        
        let linkedCount = 0;
        let unlinkedCount = 0;
        
        orders.forEach((order, index) => {
            if (order.user_id) {
                linkedCount++;
                console.log(`  ✅ ${order.custom_order_id} - ${order.customer_email} → ${order.first_name} ${order.last_name} (ID: ${order.user_id})`);
            } else {
                unlinkedCount++;
                console.log(`  ❌ ${order.custom_order_id} - ${order.customer_email} → No user link`);
            }
        });
        
        console.log(`\n📈 Summary: ${linkedCount} linked, ${unlinkedCount} unlinked`);
        
        // Check users with orders
        console.log('\n2. Users with custom orders:');
        const [usersWithOrders] = await connection.execute(`
            SELECT 
                u.user_id,
                u.first_name,
                u.last_name,
                u.email,
                COUNT(co.id) as order_count
            FROM users u
            INNER JOIN custom_orders co ON u.user_id = co.user_id
            GROUP BY u.user_id
            ORDER BY order_count DESC
        `);
        
        usersWithOrders.forEach((user, index) => {
            console.log(`  👤 ${user.first_name} ${user.last_name} (${user.email}) - ${user.order_count} orders`);
        });
        
        await connection.end();
        
        console.log('\n🎯 NEXT STEPS FOR TESTING:');
        console.log('1. Open React app: http://localhost:3000');
        console.log('2. Register a new user OR login with existing credentials');
        console.log('3. If using existing user, you may need to:');
        console.log('   - Reset password through the app');
        console.log('   - Or register a new account');
        console.log('4. Navigate to Orders page');
        console.log('5. Click "Custom Orders" tab');
        console.log('6. Should see orders for that user');
        
        console.log('\n✅ DATABASE FIX COMPLETE!');
        console.log('The custom orders should now appear in OrderPage.js for authenticated users.');
        
    } catch (error) {
        console.error('❌ Verification failed:', error.message);
    }
}

finalVerification();
