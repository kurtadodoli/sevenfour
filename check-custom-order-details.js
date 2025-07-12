const mysql = require('mysql2/promise');
const { dbConfig } = require('./server/config/db');

async function checkCustomOrderDetails() {
    console.log('=== CHECKING CUSTOM ORDER DETAILS ===');
    
    const connection = await mysql.createConnection(dbConfig);
    
    try {
        // Check the specific custom order
        const [customOrder] = await connection.execute(`
            SELECT * FROM custom_orders WHERE custom_order_id = ?
        `, ['CUSTOM-MCSNSHEW-E616P']);
        
        if (customOrder.length > 0) {
            console.log('🔍 Custom order details:');
            console.log(JSON.stringify(customOrder[0], null, 2));
            
            const order = customOrder[0];
            
            // Check if this user_id exists in users table
            if (order.user_id) {
                const [userCheck] = await connection.execute(`
                    SELECT user_id, email, first_name, last_name, role FROM users WHERE user_id = ?
                `, [order.user_id]);
                
                if (userCheck.length > 0) {
                    console.log('\n✅ Associated user found:');
                    console.log(JSON.stringify(userCheck[0], null, 2));
                } else {
                    console.log('\n❌ No user found with user_id:', order.user_id);
                }
            } else {
                console.log('\n⚠️ Custom order has no user_id - likely a guest order');
            }
        } else {
            console.log('❌ Custom order not found');
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await connection.end();
    }
}

checkCustomOrderDetails();
