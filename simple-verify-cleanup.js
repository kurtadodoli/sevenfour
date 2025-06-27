const mysql = require('mysql2/promise');
const { dbConfig } = require('./server/config/db');

async function simpleVerifyCleanup() {
    const conn = await mysql.createConnection(dbConfig);
    
    try {
        console.log('🔍 Verifying cleanup of test and sample orders...');
        
        // Check remaining orders with test patterns
        const [remainingOrders] = await conn.execute(`
            SELECT id, order_number, status, total_amount
            FROM orders 
            WHERE order_number LIKE '%test%'
               OR order_number LIKE '%sample%'
               OR order_number LIKE 'TEST%'
            ORDER BY id
        `);
        
        console.log(`📋 Remaining orders with test patterns: ${remainingOrders.length}`);
        
        if (remainingOrders.length > 0) {
            console.log('❌ Still have test orders:');
            remainingOrders.forEach(order => {
                console.log(`  - ID: ${order.id}, Number: ${order.order_number}, Status: ${order.status}, Amount: ₱${order.total_amount}`);
            });
        } else {
            console.log('✅ No test pattern orders found in orders table');
        }
        
        // Check all remaining orders to see total count
        const [allOrders] = await conn.execute(`
            SELECT COUNT(*) as total_orders FROM orders
        `);
        
        console.log(`📊 Total remaining orders in database: ${allOrders[0].total_orders}`);
        
        // Check order invoices with test patterns
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
               OR invoice_id LIKE 'TEST%'
            ORDER BY invoice_id
        `);
        
        console.log(`📋 Remaining test/sample invoices: ${remainingInvoices.length}`);
        
        if (remainingInvoices.length > 0) {
            console.log('❌ Still have test invoices:');
            remainingInvoices.forEach(invoice => {
                console.log(`  - Invoice: ${invoice.invoice_id}, Customer: ${invoice.customer_name || 'N/A'}, Email: ${invoice.customer_email || 'N/A'}`);
            });
        } else {
            console.log('✅ No test/sample invoices found');
        }
        
        // Check total invoices
        const [allInvoices] = await conn.execute(`
            SELECT COUNT(*) as total_invoices FROM order_invoices
        `);
        
        console.log(`📊 Total remaining invoices in database: ${allInvoices[0].total_invoices}`);
        
        console.log('\n🎉 Cleanup verification completed!');
        
        if (remainingOrders.length === 0 && remainingInvoices.length === 0) {
            console.log('✅ SUCCESS: All test and sample data has been cleaned up!');
        } else {
            console.log('⚠️  WARNING: Some test data may still remain');
        }
        
    } catch (error) {
        console.error('❌ Error verifying cleanup:', error);
        throw error;
    } finally {
        await conn.end();
    }
}

// Run the verification
simpleVerifyCleanup()
    .then(() => {
        process.exit(0);
    })
    .catch(error => {
        console.error('💥 Verification failed:', error);
        process.exit(1);
    });
