const mysql = require('mysql2/promise');
const { dbConfig } = require('./server/config/db');

async function createTestOrder() {
    const conn = await mysql.createConnection(dbConfig);
    
    try {
        await conn.beginTransaction();
        
        // Create test invoice
        const invoiceId = `INV${Date.now()}${Math.floor(Math.random() * 1000)}`;
        const transactionId = `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;
        const orderNumber = `ORD${Date.now()}${Math.floor(Math.random() * 10000)}`;
        const userId = 967502321335176; // Same user as order 13
        
        // Insert invoice
        await conn.execute(`
            INSERT INTO order_invoices (
                invoice_id, user_id, date, total_amount, invoice_status,
                customer_name, customer_email, customer_phone, delivery_address
            ) VALUES (?, ?, NOW(), 850.00, 'draft', 'Test User', 'test@example.com', '1234567890', 'Test Address')
        `, [invoiceId, userId]);
        
        // Insert transaction
        await conn.execute(`
            INSERT INTO sales_transactions (
                transaction_id, invoice_id, user_id, amount, transaction_status, payment_method
            ) VALUES (?, ?, ?, 850.00, 'pending', 'cash_on_delivery')
        `, [transactionId, invoiceId, userId]);
        
        // Insert order
        const [orderResult] = await conn.execute(`
            INSERT INTO orders (
                order_number, user_id, invoice_id, transaction_id, status,
                total_amount, shipping_address, contact_phone
            ) VALUES (?, ?, ?, ?, 'pending', 850.00, 'Test Address', '1234567890')
        `, [orderNumber, userId, invoiceId, transactionId]);
        
        const orderId = orderResult.insertId;
        
        // Insert order item for Strive Forward (product_id: 640009057958)
        await conn.execute(`
            INSERT INTO order_items (
                order_id, invoice_id, product_id, product_name, product_price,
                quantity, color, size, subtotal
            ) VALUES (?, ?, 640009057958, 'Strive Forward', 850.00, 5, 'Black', 'L', 850.00)
        `, [orderId, invoiceId]);
        
        await conn.commit();
        
        console.log(`Test order created successfully!`);
        console.log(`Order ID: ${orderId}`);
        console.log(`Order Number: ${orderNumber}`);
        console.log(`Invoice ID: ${invoiceId}`);
        console.log(`Product: Strive Forward (Black/L) x5`);
        
        await conn.end();
        return orderId;
        
    } catch (error) {
        await conn.rollback();
        await conn.end();
        throw error;
    }
}

createTestOrder().catch(console.error);
