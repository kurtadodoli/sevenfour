const mysql = require('mysql2/promise');
const { dbConfig } = require('./server/config/db');

async function debugOrder13() {
    const conn = await mysql.createConnection(dbConfig);
    
    // Get order details
    const [orderDetails] = await conn.execute(`
        SELECT * FROM orders WHERE id = 13
    `);
    
    console.log('Order 13 details:');
    console.log(orderDetails[0]);
    
    if (orderDetails.length > 0) {
        const order = orderDetails[0];
        
        // Check if invoice exists
        const [invoiceDetails] = await conn.execute(`
            SELECT * FROM order_invoices WHERE invoice_id = ?
        `, [order.invoice_id]);
        
        console.log('\nInvoice details:');
        console.log(invoiceDetails[0] || 'No invoice found');
        
        // Check order items using the invoice_id
        const [orderItems] = await conn.execute(`
            SELECT * FROM order_items WHERE invoice_id = ?
        `, [order.invoice_id]);
        
        console.log('\nOrder items:');
        console.log(orderItems);
        
        // Also try to find items by order_id if there's a direct relationship
        const [itemsByOrderId] = await conn.execute(`
            SELECT * FROM order_items WHERE order_id = ?
        `, [13]);
        
        console.log('\nOrder items by order_id:');
        console.log(itemsByOrderId);
    }
    
    await conn.end();
}

debugOrder13().catch(console.error);
