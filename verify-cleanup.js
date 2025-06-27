const mysql = require('mysql2/promise');
const { dbConfig } = require('./server/config/db');

async function verifyCleanup() {
    const conn = await mysql.createConnection(dbConfig);
    
    try {
        console.log('🔍 Verifying cleanup of test and sample orders...');
        
        // Check remaining orders
        const [remainingOrders] = await conn.execute(`
            SELECT id, order_number, customer_name, customer_email, status
            FROM orders 
            WHERE customer_name LIKE '%test%' 
               OR customer_name LIKE '%sample%'
               OR customer_email LIKE '%test%'
               OR customer_email LIKE '%sample%'
               OR customer_email LIKE '%example%'
               OR order_number LIKE '%test%'
               OR order_number LIKE '%sample%'
            ORDER BY id
        `);
        
        console.log(`📋 Remaining test/sample orders: ${remainingOrders.length}`);
        
        if (remainingOrders.length > 0) {
            console.log('❌ Still have test orders:');
            remainingOrders.forEach(order => {
                console.log(`  - ID: ${order.id}, Number: ${order.order_number}, Customer: ${order.customer_name || 'N/A'}, Email: ${order.customer_email || 'N/A'}, Status: ${order.status}`);
            });
        } else {
            console.log('✅ No test/sample orders found in orders table');
        }
        
        // Check order invoices
        const [remainingInvoices] = await conn.execute(`
            SELECT invoice_id, customer_name, customer_email, invoice_status
            FROM order_invoices 
            WHERE customer_name LIKE '%test%' 
               OR customer_name LIKE '%sample%'
               OR customer_email LIKE '%test%'
               OR customer_email LIKE '%sample%'
               OR customer_email LIKE '%example%'
               OR invoice_id LIKE '%test%'
               OR invoice_id LIKE '%sample%'
            ORDER BY invoice_id
        `);
        
        console.log(`📋 Remaining test/sample invoices: ${remainingInvoices.length}`);
        
        if (remainingInvoices.length > 0) {
            console.log('❌ Still have test invoices:');
            remainingInvoices.forEach(invoice => {
                console.log(`  - Invoice: ${invoice.invoice_id}, Customer: ${invoice.customer_name || 'N/A'}, Email: ${invoice.customer_email || 'N/A'}, Status: ${invoice.invoice_status}`);
            });
        } else {
            console.log('✅ No test/sample invoices found');
        }
        
        // Check sales transactions
        const [remainingTransactions] = await conn.execute(`
            SELECT st.transaction_id, st.transaction_status, oi.customer_name
            FROM sales_transactions st
            LEFT JOIN order_invoices oi ON st.invoice_id = oi.invoice_id
            WHERE st.transaction_id LIKE '%test%' 
               OR st.transaction_id LIKE '%sample%'
               OR oi.customer_name LIKE '%test%' 
               OR oi.customer_name LIKE '%sample%'
            ORDER BY st.transaction_id
        `);
        
        console.log(`📋 Remaining test/sample transactions: ${remainingTransactions.length}`);
        
        if (remainingTransactions.length > 0) {
            console.log('❌ Still have test transactions:');
            remainingTransactions.forEach(txn => {
                console.log(`  - Transaction: ${txn.transaction_id}, Status: ${txn.transaction_status}, Customer: ${txn.customer_name || 'N/A'}`);
            });
        } else {
            console.log('✅ No test/sample transactions found');
        }
        
        console.log('\n🎉 Cleanup verification completed!');
        
    } catch (error) {
        console.error('❌ Error verifying cleanup:', error);
        throw error;
    } finally {
        await conn.end();
    }
}

// Run the verification
verifyCleanup()
    .then(() => {
        console.log('✅ Verification completed successfully!');
        process.exit(0);
    })
    .catch(error => {
        console.error('💥 Verification failed:', error);
        process.exit(1);
    });
