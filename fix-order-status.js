/**
 * Fix Order Status - Convert "approved" orders to "confirmed"
 * This fixes orders that were approved but not showing in confirmed orders list
 */

const mysql = require('mysql2/promise');
const { dbConfig } = require('./server/config/db');

async function fixOrderStatus() {
    const connection = await mysql.createConnection(dbConfig);
    
    try {
        console.log('🔧 Fixing Order Status from "approved" to "confirmed"...\n');
        
        // Find orders with status "approved" that should be "confirmed"
        console.log('📋 Finding orders with status "approved"...');
        const [approvedOrders] = await connection.execute(`
            SELECT 
                o.id,
                o.order_number,
                o.status,
                o.payment_status,
                st.transaction_status,
                o.total_amount,
                o.created_at
            FROM orders o
            LEFT JOIN sales_transactions st ON o.transaction_id = st.transaction_id
            WHERE o.status = 'approved'
            ORDER BY o.created_at DESC
        `);
        
        console.log(`✅ Found ${approvedOrders.length} orders with "approved" status:`);
        approvedOrders.forEach(order => {
            console.log(`   - ${order.order_number}: ₱${order.total_amount} (Payment: ${order.payment_status}, Transaction: ${order.transaction_status})`);
        });
        
        if (approvedOrders.length === 0) {
            console.log('ℹ️  No orders found with "approved" status to fix.');
            await connection.end();
            return;
        }
        
        // Update orders from "approved" to "confirmed"
        console.log('\n🔄 Updating order status from "approved" to "confirmed"...');
        const [updateResult] = await connection.execute(`
            UPDATE orders 
            SET status = 'confirmed', 
                payment_status = 'verified',
                updated_at = NOW() 
            WHERE status = 'approved'
        `);
        
        console.log(`✅ Updated ${updateResult.affectedRows} orders to "confirmed" status`);
        
        // Update sales transactions from "approved" to "confirmed"
        console.log('🔄 Updating transaction status from "approved" to "confirmed"...');
        const [transactionUpdateResult] = await connection.execute(`
            UPDATE sales_transactions st
            JOIN orders o ON st.transaction_id = o.transaction_id
            SET st.transaction_status = 'confirmed'
            WHERE o.status = 'confirmed' AND st.transaction_status = 'approved'
        `);
        
        console.log(`✅ Updated ${transactionUpdateResult.affectedRows} transaction records`);
        
        // Verify the specific order ORD17517233654614104
        console.log('\n🔍 Checking specific order ORD17517233654614104...');
        const [specificOrder] = await connection.execute(`
            SELECT 
                o.id,
                o.order_number,
                o.status,
                o.payment_status,
                st.transaction_status,
                o.total_amount
            FROM orders o
            LEFT JOIN sales_transactions st ON o.transaction_id = st.transaction_id
            WHERE o.order_number = 'ORD17517233654614104'
        `);
        
        if (specificOrder.length > 0) {
            const order = specificOrder[0];
            console.log(`✅ Order ORD17517233654614104 status:`);
            console.log(`   - Order Status: ${order.status}`);
            console.log(`   - Payment Status: ${order.payment_status}`);
            console.log(`   - Transaction Status: ${order.transaction_status}`);
            console.log(`   - Total: ₱${order.total_amount}`);
            
            if (order.status === 'confirmed') {
                console.log('🎉 Order should now appear in "All Confirmed Orders" and Delivery Page!');
            } else {
                console.log('⚠️  Order still not confirmed. May need manual update.');
            }
        } else {
            console.log('❌ Order ORD17517233654614104 not found in database');
        }
        
        // Show summary of confirmed orders
        console.log('\n📊 Summary of confirmed orders:');
        const [confirmedOrders] = await connection.execute(`
            SELECT COUNT(*) as total FROM orders WHERE status = 'confirmed'
        `);
        console.log(`   Total confirmed orders: ${confirmedOrders[0].total}`);
        
        console.log('\n✅ Order status fix completed!');
        console.log('ℹ️  Refresh the Transaction Page and Delivery Page to see the changes.');
        
    } catch (error) {
        console.error('❌ Error fixing order status:', error);
    } finally {
        await connection.end();
    }
}

fixOrderStatus();
