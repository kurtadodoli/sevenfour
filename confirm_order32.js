const mysql = require('mysql2/promise');
const { dbConfig } = require('./server/config/db');

async function confirmOrder32() {
    const conn = await mysql.createConnection(dbConfig);
    
    try {
        await conn.beginTransaction();
        
        console.log('=== CONFIRMING ORDER 32 ===');
        
        // Check current stock before confirmation
        const [beforeStock] = await conn.execute(`
            SELECT stock_quantity, available_quantity, reserved_quantity
            FROM product_variants 
            WHERE product_id = 640009057958 AND size = 'L' AND color = 'Black'
        `);
        
        console.log('Stock BEFORE confirmation:');
        if (beforeStock.length > 0) {
            const b = beforeStock[0];
            console.log(`  Stock: ${b.stock_quantity}, Available: ${b.available_quantity}, Reserved: ${b.reserved_quantity}`);
        }
        
        // Simulate the order confirmation logic
        const orderId = 32;
        const quantity = 5;
        
        // Update variant stock (increase reserved_quantity)
        await conn.execute(`
            UPDATE product_variants 
            SET reserved_quantity = reserved_quantity + ?,
                last_updated = CURRENT_TIMESTAMP
            WHERE product_id = ? AND size = ? AND color = ?
        `, [quantity, 640009057958, 'L', 'Black']);
        
        // Recalculate available_quantity
        await conn.execute(`
            UPDATE product_variants 
            SET available_quantity = stock_quantity - reserved_quantity
            WHERE product_id = ? AND size = ? AND color = ?
        `, [640009057958, 'L', 'Black']);
        
        // Update order status
        await conn.execute(`
            UPDATE orders 
            SET status = 'confirmed', updated_at = CURRENT_TIMESTAMP 
            WHERE id = ?
        `, [orderId]);
        
        // Update invoice and transaction status
        await conn.execute(`
            UPDATE order_invoices 
            SET invoice_status = 'sent'
            WHERE invoice_id = (SELECT invoice_id FROM orders WHERE id = ?)
        `, [orderId]);
        
        await conn.execute(`
            UPDATE sales_transactions 
            SET transaction_status = 'confirmed'
            WHERE transaction_id = (SELECT transaction_id FROM orders WHERE id = ?)
        `, [orderId]);
        
        // Log stock movement
        await conn.execute(`
            INSERT INTO stock_movements 
            (product_id, movement_type, quantity, size, reason, reference_number, user_id, notes)
            VALUES (?, 'OUT', ?, ?, 'Order Confirmation', ?, ?, ?)
        `, [640009057958, quantity, 'L', orderId, 967502321335176, 
            `Order confirmed - reserved ${quantity} units for Strive Forward L/Black`]);
        
        // Check stock after confirmation
        const [afterStock] = await conn.execute(`
            SELECT stock_quantity, available_quantity, reserved_quantity
            FROM product_variants 
            WHERE product_id = 640009057958 AND size = 'L' AND color = 'Black'
        `);
        
        console.log('Stock AFTER confirmation:');
        if (afterStock.length > 0) {
            const a = afterStock[0];
            console.log(`  Stock: ${a.stock_quantity}, Available: ${a.available_quantity}, Reserved: ${a.reserved_quantity}`);
        }
        
        await conn.commit();
        console.log('✅ Order 32 confirmed successfully!');
        
    } catch (error) {
        await conn.rollback();
        console.error('❌ Error confirming order:', error);
    }
    
    await conn.end();
}

confirmOrder32().catch(console.error);
