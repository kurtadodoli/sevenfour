/**
 * Check specific order status - ORD17517233654614104
 */

const mysql = require('mysql2/promise');
const { dbConfig } = require('./server/config/db');

async function checkSpecificOrder() {
    const connection = await mysql.createConnection(dbConfig);
    
    try {
        console.log('🔍 Checking Order ORD17517233654614104...\n');
        
        // Find the specific order
        const [orders] = await connection.execute(`
            SELECT 
                o.id,
                o.order_number,
                o.status,
                o.payment_status,
                o.user_id,
                o.total_amount,
                o.payment_method,
                o.created_at,
                o.updated_at,
                st.transaction_id,
                st.transaction_status,
                st.payment_method as transaction_payment_method,
                oi.invoice_status
            FROM orders o
            LEFT JOIN sales_transactions st ON o.transaction_id = st.transaction_id
            LEFT JOIN order_invoices oi ON o.invoice_id = oi.invoice_id
            WHERE o.order_number = 'ORD17517233654614104'
        `);
        
        if (orders.length === 0) {
            console.log('❌ Order ORD17517233654614104 NOT FOUND in database');
            
            // Let's search for similar order numbers
            console.log('\n🔍 Searching for similar order numbers...');
            const [similarOrders] = await connection.execute(`
                SELECT order_number, status, total_amount, created_at
                FROM orders 
                WHERE order_number LIKE '%17517%' OR order_number LIKE '%233%'
                ORDER BY created_at DESC
                LIMIT 10
            `);
            
            if (similarOrders.length > 0) {
                console.log('📋 Similar orders found:');
                similarOrders.forEach(order => {
                    console.log(`   - ${order.order_number}: ${order.status} - ₱${order.total_amount}`);
                });
            } else {
                console.log('   No similar orders found');
            }
            
            await connection.end();
            return;
        }
        
        const order = orders[0];
        console.log('✅ Order Found:');
        console.log(`   Order Number: ${order.order_number}`);
        console.log(`   Order ID: ${order.id}`);
        console.log(`   Order Status: ${order.status}`);
        console.log(`   Payment Status: ${order.payment_status}`);
        console.log(`   Transaction Status: ${order.transaction_status}`);
        console.log(`   Invoice Status: ${order.invoice_status}`);
        console.log(`   Total Amount: ₱${order.total_amount}`);
        console.log(`   User ID: ${order.user_id}`);
        console.log(`   Created: ${order.created_at}`);
        console.log(`   Updated: ${order.updated_at}`);
        
        // Check why it's not appearing in confirmed orders
        console.log('\n🔍 Checking confirmed orders query...');
        const [confirmedCheck] = await connection.execute(`
            SELECT 
                o.id,
                o.order_number,
                o.status,
                o.payment_status
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.user_id
            LEFT JOIN order_invoices oi ON o.invoice_id = oi.invoice_id
            LEFT JOIN sales_transactions st ON o.transaction_id = st.transaction_id
            WHERE o.status = 'confirmed' AND o.order_number = 'ORD17517233654614104'
        `);
        
        if (confirmedCheck.length > 0) {
            console.log('✅ Order SHOULD appear in confirmed orders list');
        } else {
            console.log('❌ Order will NOT appear in confirmed orders list');
            console.log(`   Reason: Status is "${order.status}" but confirmed orders query looks for "confirmed"`);
            
            if (order.status !== 'confirmed') {
                console.log('\n🔧 Fixing order status...');
                await connection.execute(`
                    UPDATE orders 
                    SET status = 'confirmed', 
                        payment_status = 'verified',
                        updated_at = NOW() 
                    WHERE order_number = 'ORD17517233654614104'
                `);
                
                await connection.execute(`
                    UPDATE sales_transactions st
                    JOIN orders o ON st.transaction_id = o.transaction_id
                    SET st.transaction_status = 'confirmed'
                    WHERE o.order_number = 'ORD17517233654614104'
                `);
                
                console.log('✅ Order status updated to "confirmed"');
                console.log('✅ Transaction status updated to "confirmed"');
                console.log('✅ Payment status updated to "verified"');
                console.log('\n🎉 Order should now appear in "All Confirmed Orders" and Delivery Page!');
            }
        }
        
        // Show all confirmed orders count
        console.log('\n📊 Current confirmed orders:');
        const [confirmedCount] = await connection.execute(`
            SELECT COUNT(*) as total FROM orders WHERE status = 'confirmed'
        `);
        console.log(`   Total confirmed orders: ${confirmedCount[0].total}`);
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await connection.end();
    }
}

checkSpecificOrder();
