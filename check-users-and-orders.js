const mysql = require('mysql2/promise');
const { dbConfig } = require('./server/config/db');

async function checkUsersAndCustomOrders() {
    console.log('=== CHECKING USERS AND CUSTOM ORDERS ===');
    
    const connection = await mysql.createConnection(dbConfig);
    
    try {
        // Check users
        const [users] = await connection.execute(`
            SELECT user_id, email, first_name, last_name, role 
            FROM users 
            ORDER BY user_id
        `);
        
        console.log('\n👥 Users in database:');
        users.forEach((user, index) => {
            console.log(`${index + 1}. ID: ${user.user_id}, Email: ${user.email}, Name: ${user.first_name} ${user.last_name}, Role: ${user.role}`);
        });
        
        // Check the specific custom order
        const [customOrder] = await connection.execute(`
            SELECT * FROM custom_orders WHERE custom_order_id = ?
        `, ['CUSTOM-MCSNSHEW-E616P']);
        
        if (customOrder.length > 0) {
            const order = customOrder[0];
            console.log('\n🎨 Custom order details:');
            console.log(`- ID: ${order.custom_order_id}`);
            console.log(`- User ID: ${order.user_id}`);
            console.log(`- Customer Email: ${order.customer_email}`);
            console.log(`- Status: ${order.status}`);
            console.log(`- Delivery Status: ${order.delivery_status}`);
            
            // Find matching user
            const matchingUser = users.find(u => u.user_id === order.user_id || u.email === order.customer_email);
            if (matchingUser) {
                console.log(`- Matching User: ${matchingUser.email} (ID: ${matchingUser.user_id})`);
            } else {
                console.log('- No matching user found!');
            }
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await connection.end();
    }
}

checkUsersAndCustomOrders();
