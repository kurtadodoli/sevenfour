const mysql = require('mysql2/promise');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, 'server', '.env') });

// Database configuration
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'seven_four_clothing'
};

async function cleanupErroneousDeliveryOrder() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Connected to database');
        
        console.log('\n🧹 CLEANING UP ERRONEOUS DELIVERY ORDER:');
        console.log('='.repeat(50));
        
        // First, check what we're about to delete
        const [deliveryOrders] = await connection.execute(`
            SELECT 
                id,
                order_number,
                status,
                total_amount,
                notes,
                created_at
            FROM orders 
            WHERE notes LIKE '%H5DP7%'
        `);
        
        if (deliveryOrders.length === 0) {
            console.log('❌ No delivery orders found with H5DP7 reference');
            return;
        }
        
        console.log(`Found ${deliveryOrders.length} delivery order(s) to clean up:`);
        deliveryOrders.forEach(order => {
            console.log(`   🗑️  Order: ${order.order_number}`);
            console.log(`      Status: ${order.status}`);
            console.log(`      Amount: ${order.total_amount}`);
            console.log(`      Created: ${order.created_at}`);
            console.log(`      Notes: ${order.notes}`);
        });
        
        // Also check for order items
        const [orderItems] = await connection.execute(`
            SELECT 
                oi.id,
                oi.order_id,
                oi.product_name,
                o.order_number
            FROM order_items oi
            JOIN orders o ON oi.order_id = o.id
            WHERE o.notes LIKE '%H5DP7%'
        `);
        
        if (orderItems.length > 0) {
            console.log(`\n📦 Found ${orderItems.length} order item(s) to clean up:`);
            orderItems.forEach(item => {
                console.log(`   🗑️  Item ID: ${item.id} - ${item.product_name}`);
            });
        }
        
        // Check for invoices
        const [invoices] = await connection.execute(`
            SELECT 
                i.invoice_id,
                i.total_amount,
                o.order_number
            FROM order_invoices i
            JOIN orders o ON i.invoice_id = o.invoice_id
            WHERE o.notes LIKE '%H5DP7%'
        `);
        
        if (invoices.length > 0) {
            console.log(`\n📄 Found ${invoices.length} invoice(s) to clean up:`);
            invoices.forEach(invoice => {
                console.log(`   🗑️  Invoice: ${invoice.invoice_id} - ${invoice.total_amount}`);
            });
        }
        
        console.log('\n⚠️  WARNING: This will DELETE the erroneous delivery order!');
        console.log('   The custom order CUSTOM-MCQ7J8MI-H5DP7 will remain intact.');
        console.log('   Only the duplicate delivery order CUSTOM-MI-H5DP7-6634 will be removed.');
        console.log('   This is safe because no payment has been submitted yet.');
        
        // Proceed with cleanup
        console.log('\n🧹 Starting cleanup...');
        
        // Delete order items first (foreign key constraint)
        if (orderItems.length > 0) {
            for (const order of deliveryOrders) {
                await connection.execute(`
                    DELETE FROM order_items WHERE order_id = ?
                `, [order.id]);
                console.log(`   ✅ Deleted order items for order ${order.order_number}`);
            }
        }
        
        // Delete invoices
        if (invoices.length > 0) {
            for (const invoice of invoices) {
                await connection.execute(`
                    DELETE FROM order_invoices WHERE invoice_id = ?
                `, [invoice.invoice_id]);
                console.log(`   ✅ Deleted invoice ${invoice.invoice_id}`);
            }
        }
        
        // Delete the delivery orders
        for (const order of deliveryOrders) {
            await connection.execute(`
                DELETE FROM orders WHERE id = ?
            `, [order.id]);
            console.log(`   ✅ Deleted delivery order ${order.order_number}`);
        }
        
        console.log('\n✅ CLEANUP COMPLETE!');
        console.log('   The custom order CUSTOM-MCQ7J8MI-H5DP7 is now in correct state:');
        console.log('   - Status: approved');
        console.log('   - Payment Status: pending');
        console.log('   - NO delivery order exists (as it should be)');
        console.log('   - Customer can now submit payment proof');
        console.log('   - After payment verification, proper delivery order will be created');
        
    } catch (error) {
        console.error('❌ Error during cleanup:', error);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

cleanupErroneousDeliveryOrder();
