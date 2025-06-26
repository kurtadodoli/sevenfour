const mysql = require('mysql2/promise');
const { dbConfig } = require('./server/config/db');

async function testOrphanedProductHandling() {
    const conn = await mysql.createConnection(dbConfig);
    
    try {
        await conn.beginTransaction();
        
        console.log('=== TESTING ORPHANED PRODUCT HANDLING (ORDER 13) ===');
        
        const requestId = 18; // The pending cancellation for order 13
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
            await conn.end();
            return;
        }
        
        const request = requestResult[0];
        console.log(`Processing cancellation for order ${request.order_id} (${request.order_number})`);
        
        // Update the cancellation request
        await conn.execute(`
            UPDATE cancellation_requests 
            SET status = 'approved', admin_notes = 'Test orphaned product handling', processed_by = ?, processed_at = NOW()
            WHERE id = ?
        `, [adminId, requestId]);
        
        // Try to get order items with valid products (JOIN with products table)
        const [orderItems] = await conn.execute(`
            SELECT oi.product_id, oi.quantity, oi.color, oi.size, p.productname, 
                   p.total_available_stock, p.total_reserved_stock
            FROM order_items oi
            JOIN orders o ON oi.invoice_id = o.invoice_id
            JOIN products p ON oi.product_id = p.product_id
            WHERE o.id = ?
        `, [request.order_id]);
        
        // Also check for orphaned order items (items with invalid product_id)
        const [orphanedItems] = await conn.execute(`
            SELECT oi.product_id, oi.quantity, oi.color, oi.size, oi.product_name,
                   'orphaned' as productname, 0 as total_available_stock, 0 as total_reserved_stock
            FROM order_items oi
            JOIN orders o ON oi.invoice_id = o.invoice_id
            LEFT JOIN products p ON oi.product_id = p.product_id
            WHERE o.id = ? AND p.product_id IS NULL
        `, [request.order_id]);
        
        console.log(`Found ${orderItems.length} valid items and ${orphanedItems.length} orphaned items in cancelled order`);
        
        if (orphanedItems.length > 0) {
            console.log('⚠️ WARNING: Found orphaned order items (product_id not in products table):');
            orphanedItems.forEach(item => {
                console.log(`  - Product ID ${item.product_id}: ${item.product_name} (${item.color}/${item.size}) x${item.quantity}`);
            });
            console.log('These items will be skipped for stock restoration due to missing product data.');
        }
        
        // Process valid items only
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
        }
        
        // Update order status to cancelled
        await conn.execute(`
            UPDATE orders 
            SET status = 'cancelled', updated_at = NOW()
            WHERE id = ?
        `, [request.order_id]);
        
        await conn.commit();
        console.log(`✅ Cancellation approved successfully! Stock restoration: ${orderItems.length > 0 ? 'YES' : 'NO (no valid items)'}`);
        
    } catch (error) {
        await conn.rollback();
        console.error('❌ Error testing orphaned product handling:', error);
    }
    
    await conn.end();
}

testOrphanedProductHandling().catch(console.error);
