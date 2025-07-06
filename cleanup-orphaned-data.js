require('dotenv').config({ path: './server/.env' });
const mysql = require('mysql2/promise');

async function cleanupInvoicesAndItems() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });
    
    console.log('🧹 CLEANING UP ORPHANED INVOICES AND ORDER ITEMS');
    console.log('==============================================');
    
    // Find invoices that reference non-existent orders
    const [orphanedInvoices] = await connection.execute(`
        SELECT oi.invoice_id, oi.customer_name, oi.total_amount
        FROM order_invoices oi
        LEFT JOIN orders o ON oi.invoice_id = o.invoice_id
        WHERE o.invoice_id IS NULL
        AND oi.invoice_id LIKE '%${Date.now().toString().slice(0, 8)}%'
    `);
    
    console.log(`📄 Found ${orphanedInvoices.length} orphaned invoice(s)`);
    
    if (orphanedInvoices.length > 0) {
        // Delete orphaned invoices
        for (const invoice of orphanedInvoices) {
            console.log(`   Deleting invoice: ${invoice.invoice_id} (${invoice.customer_name})`);
            await connection.execute(`DELETE FROM order_invoices WHERE invoice_id = ?`, [invoice.invoice_id]);
        }
    }
    
    // Find order items that reference non-existent orders
    const [orphanedItems] = await connection.execute(`
        SELECT oi.id, oi.order_id, oi.product_name
        FROM order_items oi
        LEFT JOIN orders o ON oi.order_id = o.id
        WHERE o.id IS NULL
    `);
    
    console.log(`📦 Found ${orphanedItems.length} orphaned order item(s)`);
    
    if (orphanedItems.length > 0) {
        // Delete orphaned order items
        for (const item of orphanedItems) {
            console.log(`   Deleting order item: ${item.product_name} (order_id: ${item.order_id})`);
            await connection.execute(`DELETE FROM order_items WHERE id = ?`, [item.id]);
        }
    }
    
    console.log('\n✅ Cleanup completed');
    
    await connection.end();
}

cleanupInvoicesAndItems();
