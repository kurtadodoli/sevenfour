const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 's3v3n-f0ur-cl0thing*',
    database: 'seven_four_clothing'
};

async function debugOrderItems() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        
        console.log('🔍 Debugging order items relationship...');
        
        // Get a sample cancellation request
        const [sampleRequest] = await connection.execute(`
            SELECT cr.order_id, cr.order_number, o.invoice_id, o.id as order_table_id
            FROM cancellation_requests cr
            JOIN orders o ON cr.order_id = o.id
            LIMIT 1
        `);
        
        if (sampleRequest.length === 0) {
            console.log('❌ No cancellation requests found');
            await connection.end();
            return;
        }
        
        const sample = sampleRequest[0];
        console.log('📋 Sample order:', {
            order_id: sample.order_id,
            order_number: sample.order_number,
            invoice_id: sample.invoice_id,
            order_table_id: sample.order_table_id
        });
        
        // Check if order_items exist for this invoice_id
        const [orderItemsByInvoice] = await connection.execute(`
            SELECT COUNT(*) as count
            FROM order_items 
            WHERE invoice_id = ?
        `, [sample.invoice_id]);
        
        console.log('📦 Order items by invoice_id:', orderItemsByInvoice[0].count);
        
        // Check if order_items exist with any relation to this order
        const [orderItemsDirect] = await connection.execute(`
            SELECT oi.*, 'direct_invoice_match' as match_type
            FROM order_items oi
            WHERE oi.invoice_id = ?
            LIMIT 3
        `, [sample.invoice_id]);
        
        console.log('📋 Direct order items found:', orderItemsDirect.length);
        if (orderItemsDirect.length > 0) {
            console.log('Sample item:', {
                product_id: orderItemsDirect[0].product_id,
                product_name: orderItemsDirect[0].product_name,
                quantity: orderItemsDirect[0].quantity,
                invoice_id: orderItemsDirect[0].invoice_id
            });
        }
        
        // Test the current backend query
        const [backendQuery] = await connection.execute(`
            SELECT 
                oi.product_id,
                oi.product_name,
                oi.quantity,
                oi.color,
                oi.size,
                oi.product_price,
                oi.subtotal,
                p.productname,
                p.productimage,
                p.productdescription
            FROM order_items oi
            JOIN orders o ON oi.invoice_id = o.invoice_id
            LEFT JOIN products p ON oi.product_id = p.product_id
            WHERE o.id = ?
        `, [sample.order_id]);
        
        console.log('🔍 Backend query result:', backendQuery.length);
        
        // Check orders table structure
        const [orderStructure] = await connection.execute(`
            SELECT id, invoice_id, order_number
            FROM orders
            WHERE id = ?
        `, [sample.order_id]);
        
        console.log('📋 Order structure:', orderStructure[0]);
        
        await connection.end();
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

debugOrderItems();
