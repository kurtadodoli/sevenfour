const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 's3v3n-f0ur-cl0thing*',
    database: 'seven_four_clothing',
    port: 3306
};

async function testGCashReference() {
    try {
        console.log('🔍 Testing GCash Reference Fields...\n');
        
        const connection = await mysql.createConnection(dbConfig);
        
        // Check orders table for any orders with status pending
        console.log('=== ORDERS TABLE (All Pending) ===');
        const [orders] = await connection.execute(`
            SELECT 
                id, order_number, payment_reference, payment_proof_filename, status
            FROM orders 
            WHERE status = 'pending'
            LIMIT 5
        `);
        
        console.log(`Found ${orders.length} pending orders:`);
        orders.forEach(order => {
            console.log(`  - Order ${order.order_number}: payment_reference=${order.payment_reference}, proof=${order.payment_proof_filename}`);
        });
        
        // Check all order_items for any with gcash reference
        console.log('\n=== ORDER_ITEMS TABLE (Any with GCash) ===');
        const [itemsWithGcash] = await connection.execute(`
            SELECT 
                id, order_id, gcash_reference_number, payment_proof_image_path
            FROM order_items 
            WHERE gcash_reference_number IS NOT NULL
            AND gcash_reference_number != 'N/A'
            AND gcash_reference_number != 'COD_ORDER'
            LIMIT 5
        `);
        
        console.log(`Found ${itemsWithGcash.length} items with GCash reference:`);
        itemsWithGcash.forEach(item => {
            console.log(`  - Item ${item.id} (Order ${item.order_id}): ${item.gcash_reference_number}`);
        });
        
        // If we have items with gcash, get their order details
        if (itemsWithGcash.length > 0) {
            console.log('\n=== MATCHING ORDERS FOR GCASH ITEMS ===');
            const orderIds = itemsWithGcash.map(item => item.order_id);
            const placeholders = orderIds.map(() => '?').join(',');
            
            const [matchingOrders] = await connection.execute(`
                SELECT id, order_number, payment_reference, status
                FROM orders 
                WHERE id IN (${placeholders})
            `, orderIds);
            
            matchingOrders.forEach(order => {
                const items = itemsWithGcash.filter(item => item.order_id === order.id);
                console.log(`  - Order ${order.order_number} (${order.status}): payment_ref=${order.payment_reference}`);
                items.forEach(item => {
                    console.log(`    → Item ${item.id}: ${item.gcash_reference_number}`);
                });
            });
        }
        
        // Check if there are any other gcash reference fields
        console.log('\n=== CHECKING FOR OTHER GCASH FIELDS ===');
        const [columns] = await connection.execute(`
            SELECT TABLE_NAME, COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = 'seven_four_clothing' 
            AND COLUMN_NAME LIKE '%gcash%'
        `);
        
        console.log('GCash-related columns found:');
        columns.forEach(col => {
            console.log(`  - ${col.TABLE_NAME}.${col.COLUMN_NAME}`);
        });
        
        await connection.end();
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testGCashReference();
