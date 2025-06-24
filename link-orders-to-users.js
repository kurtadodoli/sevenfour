const mysql = require('mysql2/promise');
const { dbConfig } = require('./server/config/db');

async function linkOrdersToUsers() {
    console.log('🔗 LINKING EXISTING CUSTOM ORDERS TO USERS\n');
    
    try {
        const connection = await mysql.createConnection(dbConfig);
        
        // Update orders to link them with users based on email matching
        console.log('1. Updating custom orders to link with users...');
        
        const updateQuery = `
            UPDATE custom_orders co
            INNER JOIN users u ON co.customer_email = u.email
            SET co.user_id = u.user_id
            WHERE co.user_id IS NULL
        `;
        
        const [updateResult] = await connection.execute(updateQuery);
        console.log(`✅ Updated ${updateResult.affectedRows} orders with user_id`);
        
        // Verify the updates
        console.log('\n2. Verifying updates...');
        const [updatedOrders] = await connection.execute(`
            SELECT 
                co.custom_order_id,
                co.customer_email,
                co.user_id,
                u.first_name,
                u.last_name
            FROM custom_orders co
            LEFT JOIN users u ON co.user_id = u.user_id
            ORDER BY co.created_at DESC
        `);
        
        console.log('Updated orders:');
        updatedOrders.forEach((order, index) => {
            if (order.user_id) {
                console.log(`  ✅ ${order.custom_order_id} - ${order.customer_email} → User ID ${order.user_id} (${order.first_name} ${order.last_name})`);
            } else {
                console.log(`  ❌ ${order.custom_order_id} - ${order.customer_email} → Still no user_id`);
            }
        });
        
        await connection.end();
        
        console.log('\n✅ SUCCESS: Custom orders have been linked to users!');
        console.log('Now the /api/custom-orders/my-orders endpoint should work properly.');
        
    } catch (error) {
        console.error('❌ Linking failed:', error.message);
    }
}

linkOrdersToUsers();
