const mysql = require('mysql2/promise');
const { dbConfig } = require('./server/config/db');

async function approveCancellation() {
    const conn = await mysql.createConnection(dbConfig);
    
    try {
        await conn.beginTransaction();
        
        console.log('=== APPROVING CANCELLATION REQUEST 33 ===');
        
        // Check current stock before cancellation approval
        const [beforeStock] = await conn.execute(`
            SELECT stock_quantity, available_quantity, reserved_quantity
            FROM product_variants 
            WHERE product_id = 640009057958 AND size = 'L' AND color = 'Black'
        `);
        
        console.log('Stock BEFORE cancellation approval:');
        if (beforeStock.length > 0) {
            const b = beforeStock[0];
            console.log(`  Stock: ${b.stock_quantity}, Available: ${b.available_quantity}, Reserved: ${b.reserved_quantity}`);
        }
        
        const requestId = 33;
        const adminId = 1750448349269; // Valid admin ID
        
        // Get the cancellation request
        const [requestResult] = await conn.execute(`
            SELECT cr.*, o.status as order_status
            FROM cancellation_requests cr
            JOIN orders o ON cr.order_id = o.id
            WHERE cr.id = ? AND cr.status = 'pending'
        `, [requestId]);
        
        if (requestResult.length === 0) {
            console.log('❌ Cancellation request not found or already processed');
            return;
        }
        
        const request = requestResult[0];
        console.log(`Processing cancellation for order ${request.order_id} (${request.order_number})`);
        
        // Update the cancellation request
        await conn.execute(`
            UPDATE cancellation_requests 
            SET status = 'approved', admin_notes = 'Test approval', processed_by = ?, processed_at = NOW()
            WHERE id = ?
        `, [adminId, requestId]);
        
        // Get the order items to restore inventory
        const [orderItems] = await conn.execute(`
            SELECT oi.product_id, oi.quantity, oi.color, oi.size, p.productname, 
                   p.total_available_stock, p.total_reserved_stock
            FROM order_items oi
            JOIN orders o ON oi.invoice_id = o.invoice_id
            JOIN products p ON oi.product_id = p.product_id
            WHERE o.id = ?
        `, [request.order_id]);
        
        console.log(`Found ${orderItems.length} items in cancelled order`);
        
        // Restore inventory - subtract from reserved_quantity and recalculate available_quantity
        for (const item of orderItems) {
            console.log(`Restoring variant stock for ${item.productname} ${item.color || 'Default'}/${item.size || 'N/A'}: releasing ${item.quantity} reserved units`);
            
            // Restore the variant stock by reducing reserved quantity
            await conn.execute(`
                UPDATE product_variants 
                SET reserved_quantity = GREATEST(0, reserved_quantity - ?),
                    last_updated = CURRENT_TIMESTAMP
                WHERE product_id = ? AND size = ? AND color = ?
            `, [item.quantity, item.product_id, item.size || 'N/A', item.color || 'Default']);
            
            // Recalculate available_quantity based on stock_quantity - reserved_quantity
            await conn.execute(`
                UPDATE product_variants 
                SET available_quantity = stock_quantity - reserved_quantity
                WHERE product_id = ? AND size = ? AND color = ?
            `, [item.product_id, item.size || 'N/A', item.color || 'Default']);
            
            // Record stock movement for variant restoration
            await conn.execute(`
                INSERT INTO stock_movements (
                    product_id, movement_type, quantity, size, reason, 
                    reference_number, user_id, notes
                ) VALUES (?, 'IN', ?, ?, 'Order Cancellation', ?, ?, ?)
            `, [
                item.product_id, 
                item.quantity, 
                item.size || 'N/A', 
                request.order_id, 
                adminId,
                `Order cancelled - released ${item.quantity} reserved units for ${item.productname} ${item.size || 'N/A'}/${item.color || 'Default'}`
            ]);
        }
        
        // Update order status to cancelled
        await conn.execute(`
            UPDATE orders 
            SET status = 'cancelled', updated_at = NOW()
            WHERE id = ?
        `, [request.order_id]);
        
        // Update invoice status
        await conn.execute(`
            UPDATE order_invoices 
            SET invoice_status = 'cancelled', updated_at = NOW()
            WHERE invoice_id = (SELECT invoice_id FROM orders WHERE id = ?)
        `, [request.order_id]);
        
        // Update sales transaction status
        await conn.execute(`
            UPDATE sales_transactions 
            SET transaction_status = 'cancelled', updated_at = NOW()
            WHERE transaction_id = (SELECT transaction_id FROM orders WHERE id = ?)
        `, [request.order_id]);
        
        // Check stock after cancellation approval
        const [afterStock] = await conn.execute(`
            SELECT stock_quantity, available_quantity, reserved_quantity
            FROM product_variants 
            WHERE product_id = 640009057958 AND size = 'L' AND color = 'Black'
        `);
        
        console.log('Stock AFTER cancellation approval:');
        if (afterStock.length > 0) {
            const a = afterStock[0];
            console.log(`  Stock: ${a.stock_quantity}, Available: ${a.available_quantity}, Reserved: ${a.reserved_quantity}`);
        }
        
        await conn.commit();
        console.log('✅ Cancellation approved and stock restored successfully!');
        
    } catch (error) {
        await conn.rollback();
        console.error('❌ Error approving cancellation:', error);
    }
    
    await conn.end();
}

approveCancellation().catch(console.error);
