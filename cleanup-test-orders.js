const mysql = require('mysql2/promise');
const { dbConfig } = require('./server/config/db');

async function removeTestAndSampleOrders() {
    const conn = await mysql.createConnection(dbConfig);
    
    try {
        await conn.beginTransaction();
        
        console.log('🧹 Starting cleanup of test and sample orders...');
        
        // Find test/sample orders and related data
        const [testOrders] = await conn.execute(`
            SELECT DISTINCT 
                oi.invoice_id,
                oi.user_id,
                st.transaction_id,
                o.id as order_id,
                o.order_number
            FROM order_invoices oi
            LEFT JOIN sales_transactions st ON oi.invoice_id = st.invoice_id
            LEFT JOIN orders o ON oi.user_id = o.user_id
            WHERE 
                oi.customer_name LIKE '%test%' 
                OR oi.customer_name LIKE '%sample%'
                OR oi.customer_email LIKE '%test%'
                OR oi.customer_email LIKE '%sample%'
                OR oi.customer_email LIKE '%example%'
                OR oi.delivery_address LIKE '%test%'
                OR o.order_number LIKE '%test%'
                OR o.order_number LIKE '%sample%'
                OR oi.invoice_id LIKE '%test%'
                OR oi.invoice_id LIKE '%sample%'
        `);
        
        console.log(`Found ${testOrders.length} test/sample orders to remove`);
        
        if (testOrders.length === 0) {
            console.log('✅ No test/sample orders found');
            await conn.rollback();
            return;
        }
        
        // Log what will be deleted
        console.log('📋 Orders to be deleted:');
        testOrders.forEach(order => {
            console.log(`  - Order ID: ${order.order_id}, Number: ${order.order_number}, Invoice: ${order.invoice_id}`);
        });
        
        // Delete related data in correct order
        for (const order of testOrders) {
            // Delete order items first
            if (order.order_id) {
                const [deleteItems] = await conn.execute(`
                    DELETE FROM order_items WHERE order_id = ?
                `, [order.order_id]);
                console.log(`  Deleted ${deleteItems.affectedRows} order items for order ${order.order_id}`);
                
                // Delete the order
                const [deleteOrder] = await conn.execute(`
                    DELETE FROM orders WHERE id = ?
                `, [order.order_id]);
                console.log(`  Deleted order ${order.order_id}`);
            }
            
            // Delete sales transaction
            if (order.transaction_id) {
                const [deleteTxn] = await conn.execute(`
                    DELETE FROM sales_transactions WHERE transaction_id = ?
                `, [order.transaction_id]);
                console.log(`  Deleted transaction ${order.transaction_id}`);
            }
            
            // Delete invoice
            if (order.invoice_id) {
                const [deleteInvoice] = await conn.execute(`
                    DELETE FROM order_invoices WHERE invoice_id = ?
                `, [order.invoice_id]);
                console.log(`  Deleted invoice ${order.invoice_id}`);
            }
        }
        
        // Also clean up any orphaned cancellation requests (if table exists)
        try {
            const [deleteCancellations] = await conn.execute(`
                DELETE FROM order_cancellation_requests 
                WHERE order_id NOT IN (SELECT id FROM orders)
            `);
            console.log(`  Deleted ${deleteCancellations.affectedRows} orphaned cancellation requests`);
        } catch (error) {
            if (error.code === 'ER_NO_SUCH_TABLE') {
                console.log('  Skipping cancellation requests cleanup - table does not exist');
            } else {
                throw error;
            }
        }
        
        // Clean up any orphaned custom orders with test data
        try {
            const [deleteCustomOrders] = await conn.execute(`
                DELETE FROM custom_design_orders 
                WHERE customer_name LIKE '%test%' 
                   OR customer_name LIKE '%sample%'
                   OR customer_email LIKE '%test%'
                   OR customer_email LIKE '%sample%'
                   OR customer_email LIKE '%example%'
            `);
            console.log(`  Deleted ${deleteCustomOrders.affectedRows} test custom design orders`);
        } catch (error) {
            if (error.code === 'ER_NO_SUCH_TABLE') {
                console.log('  Skipping custom design orders cleanup - table does not exist');
            } else {
                throw error;
            }
        }
        
        await conn.commit();
        console.log('✅ Successfully cleaned up all test and sample orders!');
        
    } catch (error) {
        await conn.rollback();
        console.error('❌ Error cleaning up test orders:', error);
        throw error;
    } finally {
        await conn.end();
    }
}

// Run the cleanup
removeTestAndSampleOrders()
    .then(() => {
        console.log('🎉 Cleanup completed successfully!');
        process.exit(0);
    })
    .catch(error => {
        console.error('💥 Cleanup failed:', error);
        process.exit(1);
    });
