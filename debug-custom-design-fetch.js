const mysql = require('mysql2/promise');
const { dbConfig } = require('./server/config/db');

async function debugCustomDesignFetch() {
    let connection;
    try {
        console.log('🔍 Debugging Custom Design Request Fetch...');
        
        connection = await mysql.createConnection(dbConfig);
        
        // Get total count of custom orders
        const [countResult] = await connection.execute(`
            SELECT COUNT(*) as total_count 
            FROM custom_orders
        `);
        
        console.log(`📊 Total custom orders in database: ${countResult[0].total_count}`);
        
        // Get all custom orders with details
        const [orders] = await connection.execute(`
            SELECT 
                co.custom_order_id,
                co.user_id,
                co.email,
                co.product_type,
                co.product_name,
                co.status,
                co.created_at,
                co.updated_at,
                u.first_name,
                u.last_name,
                u.email as user_email
            FROM custom_orders co
            LEFT JOIN users u ON co.user_id = u.user_id
            ORDER BY co.created_at DESC
        `);
        
        console.log(`📋 Found ${orders.length} custom orders:`);
        
        // Group by status
        const statusGroups = {};
        orders.forEach(order => {
            const status = order.status || 'unknown';
            if (!statusGroups[status]) {
                statusGroups[status] = [];
            }
            statusGroups[status].push(order);
        });
        
        console.log('\n📊 Status breakdown:');
        Object.keys(statusGroups).forEach(status => {
            console.log(`  ${status}: ${statusGroups[status].length} orders`);
        });
        
        // Show first few orders for inspection
        console.log('\n🔍 First 5 orders for inspection:');
        orders.slice(0, 5).forEach((order, index) => {
            console.log(`  ${index + 1}. ID: ${order.custom_order_id}, Status: ${order.status}, Created: ${order.created_at}`);
            console.log(`      User: ${order.first_name} ${order.last_name} (${order.email || order.user_email})`);
            console.log(`      Product: ${order.product_name || order.product_type}`);
        });
        
        // Check for any potential issues
        const ordersWithoutStatus = orders.filter(o => !o.status);
        const ordersWithoutUserInfo = orders.filter(o => !o.email && !o.user_email);
        
        console.log(`\n⚠️ Orders without status: ${ordersWithoutStatus.length}`);
        console.log(`⚠️ Orders without user info: ${ordersWithoutUserInfo.length}`);
        
        // Test the exact query from the API endpoint
        console.log('\n🧪 Testing API endpoint query...');
        const [apiOrders] = await connection.execute(`
            SELECT 
                co.*,
                u.first_name,
                u.last_name,
                u.email as user_email
            FROM custom_orders co
            LEFT JOIN users u ON co.user_id = u.user_id
            ORDER BY co.created_at DESC
        `);
        
        console.log(`📋 API endpoint query returned: ${apiOrders.length} orders`);
        
        // Check for differences
        if (orders.length !== apiOrders.length) {
            console.log('❌ Mismatch between queries!');
        } else {
            console.log('✅ Queries match');
        }
        
        await connection.end();
        
    } catch (error) {
        console.error('❌ Error during debug:', error);
        if (connection) {
            await connection.end();
        }
    }
}

debugCustomDesignFetch().then(() => {
    console.log('\n✅ Debug complete');
    process.exit(0);
}).catch(err => {
    console.error('💥 Debug failed:', err);
    process.exit(1);
});
