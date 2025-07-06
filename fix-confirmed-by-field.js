/**
 * Check confirmed_by field for the specific order
 */

const mysql = require('mysql2/promise');
const { dbConfig } = require('./server/config/db');

async function checkConfirmedByField() {
    const connection = await mysql.createConnection(dbConfig);
    
    try {
        console.log('🔍 Checking confirmed_by field for ORD17517233654614104...\n');
        
        const [orders] = await connection.execute(`
            SELECT 
                o.id,
                o.order_number,
                o.status,
                o.confirmed_by,
                o.payment_status,
                o.created_at,
                o.updated_at
            FROM orders o
            WHERE o.order_number = 'ORD17517233654614104'
        `);
        
        if (orders.length === 0) {
            console.log('❌ Order not found');
            return;
        }
        
        const order = orders[0];
        console.log('✅ Order Details:');
        console.log(`   Order Number: ${order.order_number}`);
        console.log(`   Status: ${order.status}`);
        console.log(`   Confirmed By: ${order.confirmed_by || 'NULL'}`);
        console.log(`   Payment Status: ${order.payment_status}`);
        console.log(`   Created: ${order.created_at}`);
        console.log(`   Updated: ${order.updated_at}`);
        
        // Check delivery-enhanced query condition
        const meetsCondition = order.status === 'confirmed' && 
                             (order.confirmed_by !== null || order.status === 'Order Received');
        
        console.log(`\n🔍 Delivery-Enhanced Query Condition Check:`);
        console.log(`   Status is 'confirmed': ${order.status === 'confirmed'}`);
        console.log(`   confirmed_by is not NULL: ${order.confirmed_by !== null}`);
        console.log(`   Status is 'Order Received': ${order.status === 'Order Received'}`);
        console.log(`   Meets overall condition: ${meetsCondition}`);
        
        if (!meetsCondition) {
            console.log('\n🔧 Fixing by setting confirmed_by field...');
            await connection.execute(`
                UPDATE orders 
                SET confirmed_by = 'admin_payment_verification',
                    updated_at = NOW()
                WHERE order_number = 'ORD17517233654614104'
            `);
            
            console.log('✅ Updated confirmed_by field to "admin_payment_verification"');
            console.log('🎉 Order should now appear in delivery-enhanced endpoint!');
        } else {
            console.log('✅ Order already meets all conditions');
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await connection.end();
    }
}

checkConfirmedByField();
