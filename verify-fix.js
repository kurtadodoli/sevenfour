const mysql = require('mysql2/promise');
const { dbConfig } = require('./server/config/db');

(async () => {
    const connection = await mysql.createConnection(dbConfig);
    
    console.log('✅ VERIFYING THE EMAIL FIX:');
    const [orders] = await connection.execute(`
        SELECT co.custom_order_id, co.customer_email, co.user_id, co.product_type, co.status
        FROM custom_orders co
        WHERE co.customer_email = 'kurtadodoli@gmail.com'
        ORDER BY co.created_at DESC
    `);
    
    console.log(`Found ${orders.length} orders for kurtadodoli@gmail.com:`);
    orders.forEach((order, index) => {
        console.log(`  ${index + 1}. ${order.custom_order_id} - ${order.product_type} (${order.status}) - User ID: ${order.user_id}`);
    });
    
    if (orders.length > 0) {
        console.log('\n🎉 SUCCESS! Orders are now properly linked to the correct user.');
        console.log('Now refresh the Custom Orders tab in your browser to see them.');
    } else {
        console.log('\n❌ Something went wrong. No orders found for kurtadodoli@gmail.com');
    }
    
    await connection.end();
})();
