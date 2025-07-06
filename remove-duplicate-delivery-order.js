require('dotenv').config({ path: './server/.env' });
const mysql = require('mysql2/promise');

async function removeDuplicateDeliveryOrder() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });
    
    console.log('🧹 REMOVING DUPLICATE DELIVERY ORDER');
    console.log('===================================');
    
    // Show current state
    const [before] = await connection.execute(`
        SELECT order_number, status, total_amount, created_at 
        FROM orders 
        WHERE order_number LIKE '%R0MKD%'
    `);
    
    console.log('📦 BEFORE CLEANUP:');
    before.forEach(order => {
        console.log(`   ${order.order_number} - ${order.status} - ₱${order.total_amount} - ${order.created_at}`);
    });
    
    // Remove the duplicate delivery order
    const [deleteResult] = await connection.execute(`
        DELETE FROM orders WHERE order_number = 'CUSTOM-KQ-R0MKD-6358'
    `);
    
    console.log(`\n🗑️ Deleted ${deleteResult.affectedRows} delivery order(s)`);
    
    // Also remove the associated invoice and order items
    const [invoiceDelete] = await connection.execute(`
        DELETE FROM order_invoices WHERE invoice_id IN (
            SELECT invoice_id FROM orders WHERE order_number = 'CUSTOM-KQ-R0MKD-6358'
        )
    `);
    
    const [itemsDelete] = await connection.execute(`
        DELETE FROM order_items WHERE order_id IN (
            SELECT id FROM orders WHERE order_number = 'CUSTOM-KQ-R0MKD-6358'
        )
    `);
    
    console.log(`🗑️ Deleted ${invoiceDelete.affectedRows} invoice(s)`);
    console.log(`🗑️ Deleted ${itemsDelete.affectedRows} order item(s)`);
    
    // Show final state
    const [after] = await connection.execute(`
        SELECT order_number, status, total_amount, created_at 
        FROM orders 
        WHERE order_number LIKE '%R0MKD%'
    `);
    
    console.log('\n📦 AFTER CLEANUP:');
    if (after.length === 0) {
        console.log('   ✅ No duplicate delivery orders remaining');
    } else {
        after.forEach(order => {
            console.log(`   ${order.order_number} - ${order.status} - ₱${order.total_amount} - ${order.created_at}`);
        });
    }
    
    // Verify the original custom order is still intact
    const [customOrder] = await connection.execute(`
        SELECT custom_order_id, status, payment_status, customer_name 
        FROM custom_orders 
        WHERE custom_order_id = 'CUSTOM-MCQ946KQ-R0MKD'
    `);
    
    console.log('\n📋 ORIGINAL CUSTOM ORDER STATUS:');
    if (customOrder.length > 0) {
        const order = customOrder[0];
        console.log(`   ID: ${order.custom_order_id}`);
        console.log(`   Status: ${order.status}`);
        console.log(`   Payment Status: ${order.payment_status}`);
        console.log(`   Customer: ${order.customer_name}`);
        console.log('   ✅ Original custom order is intact');
    }
    
    console.log('\n🎉 CLEANUP COMPLETED!');
    console.log('The user should now see only the original custom order in "My Orders".');
    
    await connection.end();
}

removeDuplicateDeliveryOrder();
