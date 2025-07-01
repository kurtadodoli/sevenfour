const mysql = require('mysql2/promise');
const { dbConfig } = require('./server/config/db');

async function testCustomOrdersQuery() {
    let connection;
    try {
        console.log('🧪 Testing the exact query from the API...');
        
        connection = await mysql.createConnection(dbConfig);
        
        // Test the exact query from the API endpoint
        const [orders] = await connection.execute(`
            SELECT 
                co.*,
                u.first_name,
                u.last_name,
                u.email as user_email
            FROM custom_orders co
            LEFT JOIN users u ON co.user_id = u.user_id
            ORDER BY co.created_at DESC
        `);
        
        console.log(`📋 Found ${orders.length} orders from API query`);
        
        if (orders.length > 0) {
            console.log('\n🔍 First order details:');
            const firstOrder = orders[0];
            console.log('Order ID:', firstOrder.custom_order_id);
            console.log('Status:', firstOrder.status);
            console.log('Customer name:', firstOrder.customer_name);
            console.log('Customer email:', firstOrder.customer_email);
            console.log('User info:', firstOrder.first_name, firstOrder.last_name, firstOrder.user_email);
            console.log('Created at:', firstOrder.created_at);
            
            // Check if this order has images
            const [images] = await connection.execute(`
                SELECT 
                    id,
                    image_filename as filename,
                    original_filename,
                    image_size,
                    mime_type,
                    upload_order
                FROM custom_order_images 
                WHERE custom_order_id = ?
                ORDER BY upload_order ASC
            `, [firstOrder.custom_order_id]);
            
            console.log('Images found:', images.length);
            
            // Show what the final processed order would look like
            const processedOrder = {
                ...firstOrder,
                images: images || [],
                image_count: images ? images.length : 0,
                product_display_name: firstOrder.product_name || firstOrder.product_type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
                status_display: firstOrder.status.replace('_', ' ').toUpperCase(),
                days_since_order: Math.floor((Date.now() - new Date(firstOrder.created_at).getTime()) / (1000 * 60 * 60 * 24))
            };
            
            console.log('\n📦 Final processed order (what frontend should get):');
            console.log('ID:', processedOrder.custom_order_id);
            console.log('Product display name:', processedOrder.product_display_name);
            console.log('Status display:', processedOrder.status_display);
            console.log('Days since order:', processedOrder.days_since_order);
            console.log('Image count:', processedOrder.image_count);
        }
        
        console.log('\n📊 All orders summary:');
        orders.forEach((order, index) => {
            console.log(`${index + 1}. ${order.custom_order_id} - ${order.status} - ${order.customer_name} - ${order.created_at.toISOString().split('T')[0]}`);
        });
        
        await connection.end();
        
    } catch (error) {
        console.error('❌ Error testing query:', error);
        if (connection) {
            await connection.end();
        }
    }
}

testCustomOrdersQuery().then(() => {
    console.log('\n✅ Query test complete');
    process.exit(0);
}).catch(err => {
    console.error('💥 Query test failed:', err);
    process.exit(1);
});
