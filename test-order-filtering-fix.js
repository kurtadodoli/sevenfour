require('dotenv').config({ path: './server/.env' });
const mysql = require('mysql2/promise');

async function testOrderFiltering() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });
    
    console.log('🧪 TESTING ORDER FILTERING FIX');
    console.log('==============================');
    
    // Find the user who had the duplicate order
    const [userInfo] = await connection.execute(`
        SELECT user_id, customer_name, customer_email 
        FROM custom_orders 
        WHERE custom_order_id = 'CUSTOM-MCQ946KQ-R0MKD'
    `);
    
    if (userInfo.length === 0) {
        console.log('❌ Could not find user for testing');
        await connection.end();
        return;
    }
    
    const userId = userInfo[0].user_id;
    const userEmail = userInfo[0].customer_email;
    
    console.log(`👤 Testing for user: ${userInfo[0].customer_name} (${userEmail})`);
    console.log(`   User ID: ${userId}`);
    
    // Test 1: Check what orders would be returned by the old query (without filtering)
    console.log('\n📋 OLD QUERY (without filtering):');
    const [oldQuery] = await connection.execute(`
        SELECT order_number, status, total_amount, notes
        FROM orders 
        WHERE user_id = ?
        ORDER BY order_date DESC
    `, [userId]);
    
    console.log(`   Found ${oldQuery.length} order(s):`);
    oldQuery.forEach(order => {
        console.log(`     ${order.order_number} - ${order.status} - ₱${order.total_amount}`);
        if (order.notes) console.log(`       Notes: ${order.notes.substring(0, 80)}...`);
    });
    
    // Test 2: Check what orders would be returned by the new query (with filtering)
    console.log('\n📋 NEW QUERY (with filtering):');
    const [newQuery] = await connection.execute(`
        SELECT order_number, status, total_amount, notes
        FROM orders 
        WHERE user_id = ?
        AND order_number NOT LIKE 'CUSTOM-%-%-%'
        AND (notes IS NULL OR notes NOT LIKE '%Reference: CUSTOM-%')
        ORDER BY order_date DESC
    `, [userId]);
    
    console.log(`   Found ${newQuery.length} order(s):`);
    if (newQuery.length === 0) {
        console.log('     ✅ No delivery orders shown (correct!)');
    } else {
        newQuery.forEach(order => {
            console.log(`     ${order.order_number} - ${order.status} - ₱${order.total_amount}`);
            if (order.notes) console.log(`       Notes: ${order.notes.substring(0, 80)}...`);
        });
    }
    
    // Test 3: Check custom orders for this user
    console.log('\n📋 CUSTOM ORDERS (should still be visible):');
    const [customOrders] = await connection.execute(`
        SELECT custom_order_id, status, payment_status, estimated_price
        FROM custom_orders 
        WHERE customer_email = ? OR user_id = ?
        ORDER BY created_at DESC
    `, [userEmail, userId]);
    
    console.log(`   Found ${customOrders.length} custom order(s):`);
    customOrders.forEach(order => {
        console.log(`     ${order.custom_order_id} - ${order.status}/${order.payment_status} - ₱${order.estimated_price}`);
    });
    
    // Test 4: Verify the fix
    console.log('\n🔍 VERIFICATION:');
    const duplicateDeliveryOrders = oldQuery.filter(order => 
        order.order_number.match(/CUSTOM-.*-.*-\d+/) && 
        order.notes && order.notes.includes('Reference: CUSTOM-')
    );
    
    const filteredDeliveryOrders = newQuery.filter(order => 
        order.order_number.match(/CUSTOM-.*-.*-\d+/) && 
        order.notes && order.notes.includes('Reference: CUSTOM-')
    );
    
    console.log(`   Duplicate delivery orders (before fix): ${duplicateDeliveryOrders.length}`);
    console.log(`   Duplicate delivery orders (after fix): ${filteredDeliveryOrders.length}`);
    
    if (filteredDeliveryOrders.length === 0) {
        console.log('   ✅ FIX SUCCESSFUL: No duplicate delivery orders will be shown to user!');
    } else {
        console.log('   ❌ FIX FAILED: Duplicate delivery orders still visible');
    }
    
    await connection.end();
}

testOrderFiltering();
