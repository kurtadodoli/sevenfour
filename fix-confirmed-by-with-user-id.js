/**
 * Fix confirmed_by field with proper admin user ID
 */

const mysql = require('mysql2/promise');
const { dbConfig } = require('./server/config/db');

async function fixConfirmedByWithUserID() {
    const connection = await mysql.createConnection(dbConfig);
    
    try {
        console.log('🔍 Finding admin user ID and fixing confirmed_by field...\n');
        
        // Find an admin user ID
        const [adminUsers] = await connection.execute(`
            SELECT user_id, email, role 
            FROM users 
            WHERE role = 'admin' 
            LIMIT 1
        `);
        
        if (adminUsers.length === 0) {
            console.log('❌ No admin users found');
            return;
        }
        
        const adminUser = adminUsers[0];
        console.log(`✅ Found admin user: ${adminUser.email} (ID: ${adminUser.user_id})`);
        
        // Update the order with admin user ID
        console.log('\n🔧 Updating confirmed_by field with admin user ID...');
        await connection.execute(`
            UPDATE orders 
            SET confirmed_by = ?,
                payment_status = 'verified',
                updated_at = NOW()
            WHERE order_number = 'ORD17517233654614104'
        `, [adminUser.user_id]);
        
        console.log('✅ Updated confirmed_by field with admin user ID');
        console.log('✅ Updated payment_status to "verified"');
        
        // Verify the update
        const [updatedOrder] = await connection.execute(`
            SELECT 
                o.order_number,
                o.status,
                o.confirmed_by,
                o.payment_status,
                u.email as confirmed_by_email
            FROM orders o
            LEFT JOIN users u ON o.confirmed_by = u.user_id
            WHERE o.order_number = 'ORD17517233654614104'
        `);
        
        if (updatedOrder.length > 0) {
            const order = updatedOrder[0];
            console.log('\n📋 Updated Order Status:');
            console.log(`   Order Number: ${order.order_number}`);
            console.log(`   Status: ${order.status}`);
            console.log(`   Confirmed By: ${order.confirmed_by} (${order.confirmed_by_email})`);
            console.log(`   Payment Status: ${order.payment_status}`);
            
            // Check if it now meets delivery-enhanced conditions
            const meetsCondition = order.status === 'confirmed' && order.confirmed_by !== null;
            console.log(`\n✅ Now meets delivery-enhanced conditions: ${meetsCondition}`);
            
            if (meetsCondition) {
                console.log('🎉 Order should now appear in:');
                console.log('   - TransactionPage.js "All Confirmed Orders"');
                console.log('   - DeliveryPage.js delivery management');
            }
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await connection.end();
    }
}

fixConfirmedByWithUserID();
