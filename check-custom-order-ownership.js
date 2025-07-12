// Check which user ID the custom orders belong to
const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 's3v3n-f0ur-cl0thing*',
    database: 'seven_four_clothing'
};

async function checkCustomOrderOwnership() {
    console.log('🔍 Checking custom order ownership...');
    
    const connection = await mysql.createConnection(dbConfig);
    
    try {
        // Check custom orders and their user_id
        const [customOrders] = await connection.execute(`
            SELECT 
                custom_order_id,
                customer_name,
                customer_email,
                user_id,
                status
            FROM custom_orders 
            ORDER BY created_at DESC
        `);
        
        console.log('Custom orders found:');
        customOrders.forEach((order, index) => {
            console.log(`${index + 1}. ${order.custom_order_id}`);
            console.log(`   Customer: ${order.customer_name} (${order.customer_email})`);
            console.log(`   User ID: ${order.user_id}`);
            console.log(`   Status: ${order.status}`);
            console.log('   ---');
        });
        
        // Check which user has user_id = 967502321335226 (the admin we logged in with)
        const [adminUser] = await connection.execute(`
            SELECT user_id, email, first_name, last_name, role
            FROM users 
            WHERE user_id = 967502321335226
        `);
        
        console.log('\nAdmin user (967502321335226):', adminUser[0]);
        
        // Check if krutadodoli@gmail.com user exists
        const [customerUser] = await connection.execute(`
            SELECT user_id, email, first_name, last_name, role
            FROM users 
            WHERE email = 'krutadodoli@gmail.com'
        `);
        
        console.log('\nCustomer user (krutadodoli@gmail.com):', customerUser[0]);
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await connection.end();
    }
}

checkCustomOrderOwnership();
