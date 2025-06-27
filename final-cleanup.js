const mysql = require('mysql2/promise');
const { dbConfig } = require('./server/config/db');

async function finalCleanup() {
    const conn = await mysql.createConnection(dbConfig);
    
    try {
        await conn.beginTransaction();
        
        console.log('🧹 Final cleanup of remaining test data...');
        
        // Get specific test order IDs
        const [testOrderIds] = await conn.execute(`
            SELECT id FROM orders 
            WHERE order_number LIKE '%test%'
               OR order_number LIKE '%sample%'
               OR order_number LIKE 'TEST%'
        `);
        
        console.log(`Found ${testOrderIds.length} test orders to remove`);
        
        // Delete order items for these orders
        for (const order of testOrderIds) {
            const [deleteItems] = await conn.execute(`
                DELETE FROM order_items WHERE order_id = ?
            `, [order.id]);
            console.log(`  Deleted ${deleteItems.affectedRows} order items for order ${order.id}`);
        }
        
        // Delete the test orders
        const [deleteOrders] = await conn.execute(`
            DELETE FROM orders 
            WHERE order_number LIKE '%test%'
               OR order_number LIKE '%sample%'
               OR order_number LIKE 'TEST%'
        `);
        console.log(`  Deleted ${deleteOrders.affectedRows} test orders`);
        
        // Delete test invoices
        const [deleteInvoices] = await conn.execute(`
            DELETE FROM order_invoices 
            WHERE customer_name LIKE '%test%' 
               OR customer_name LIKE '%sample%'
               OR customer_email LIKE '%test%'
               OR customer_email LIKE '%sample%'
               OR customer_email LIKE '%example%'
               OR invoice_id LIKE '%test%'
               OR invoice_id LIKE '%sample%'
               OR invoice_id LIKE 'TEST%'
        `);
        console.log(`  Deleted ${deleteInvoices.affectedRows} test invoices`);
        
        // Delete related transactions
        const [deleteTransactions] = await conn.execute(`
            DELETE FROM sales_transactions 
            WHERE transaction_id LIKE '%test%' 
               OR transaction_id LIKE '%sample%'
               OR transaction_id LIKE 'TEST%'
               OR invoice_id NOT IN (SELECT invoice_id FROM order_invoices)
        `);
        console.log(`  Deleted ${deleteTransactions.affectedRows} orphaned transactions`);
        
        await conn.commit();
        console.log('✅ Final cleanup completed successfully!');
        
        // Verify final state
        const [finalOrders] = await conn.execute(`
            SELECT COUNT(*) as count FROM orders 
            WHERE order_number LIKE '%test%'
               OR order_number LIKE '%sample%'
               OR order_number LIKE 'TEST%'
        `);
        
        const [finalInvoices] = await conn.execute(`
            SELECT COUNT(*) as count FROM order_invoices 
            WHERE customer_name LIKE '%test%' 
               OR customer_email LIKE '%test%'
               OR invoice_id LIKE '%test%'
               OR invoice_id LIKE 'TEST%'
        `);
        
        console.log(`📊 Final verification:`);
        console.log(`   Test orders remaining: ${finalOrders[0].count}`);
        console.log(`   Test invoices remaining: ${finalInvoices[0].count}`);
        
        if (finalOrders[0].count === 0 && finalInvoices[0].count === 0) {
            console.log('🎉 SUCCESS: All test data has been completely removed!');
        } else {
            console.log('⚠️  Some test data may still remain');
        }
        
    } catch (error) {
        await conn.rollback();
        console.error('❌ Error during final cleanup:', error);
        throw error;
    } finally {
        await conn.end();
    }
}

// Run the final cleanup
finalCleanup()
    .then(() => {
        console.log('✅ Final cleanup completed!');
        process.exit(0);
    })
    .catch(error => {
        console.error('💥 Final cleanup failed:', error);
        process.exit(1);
    });
