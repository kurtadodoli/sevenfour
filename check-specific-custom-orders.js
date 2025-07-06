const mysql = require('mysql2/promise');
const { dbConfig } = require('./server/config/db');

async function checkSpecificCustomOrders() {
    try {
        console.log('🔍 Checking specific custom orders from cancellation requests...');
        
        const connection = await mysql.createConnection(dbConfig);
        
        const customOrderIds = [
            'CUSTOM-SM-8SXDR-2612',
            'CUSTOM-SE-QDPYR-9065', 
            'CUSTOM-YR-57YHE-6098'
        ];
        
        for (const orderId of customOrderIds) {
            console.log(`\n🔍 Checking ${orderId}:`);
            
            // Check if this custom order exists in custom_orders table
            const [customOrder] = await connection.execute(`
                SELECT * FROM custom_orders WHERE custom_order_id = ?
            `, [orderId]);
            
            if (customOrder.length > 0) {
                console.log(`  ✅ Found in custom_orders table`);
                console.log(`     Status: ${customOrder[0].status}`);
                console.log(`     Product Type: ${customOrder[0].product_type}`);
            } else {
                console.log(`  ❌ NOT found in custom_orders table`);
            }
            
            // Check if this custom order has images
            const [images] = await connection.execute(`
                SELECT * FROM custom_order_images WHERE custom_order_id = ?
            `, [orderId]);
            
            if (images.length > 0) {
                console.log(`  🖼️ Found ${images.length} images:`);
                images.forEach((img, index) => {
                    console.log(`     Image ${index + 1}: ${img.image_filename}`);
                });
            } else {
                console.log(`  📷 No images found for this order`);
            }
            
            // Check if there's a cancellation request for this order
            const [cancellation] = await connection.execute(`
                SELECT cr.id, cr.reason 
                FROM cancellation_requests cr
                LEFT JOIN orders o ON cr.order_id = o.id
                WHERE o.order_number = ?
            `, [orderId]);
            
            if (cancellation.length > 0) {
                console.log(`  📋 Cancellation request ID: ${cancellation[0].id}`);
                console.log(`     Reason: ${cancellation[0].reason}`);
            } else {
                console.log(`  📋 No cancellation request found`);
            }
        }
        
        await connection.end();
        console.log('\n✅ Check completed!');
        
    } catch (error) {
        console.error('❌ Error checking specific custom orders:', error);
    }
}

checkSpecificCustomOrders();
