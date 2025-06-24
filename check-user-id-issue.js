const mysql = require('mysql2/promise');
const { dbConfig } = require('./server/config/db');

async function checkDatabaseStructure() {
    console.log('🔍 CHECKING DATABASE STRUCTURE AND USER_ID ISSUE\n');
    
    try {
        const connection = await mysql.createConnection(dbConfig);
        
        // Check users table structure
        console.log('1. Checking users table structure...');
        const [userColumns] = await connection.execute('DESCRIBE users');
        console.log('Users table columns:');
        userColumns.forEach(col => {
            console.log(`  - ${col.Field}: ${col.Type} (${col.Null === 'YES' ? 'nullable' : 'not null'})`);
        });
        
        // Check some users
        console.log('\n2. Checking users in database...');        const [users] = await connection.execute('SELECT user_id, first_name, last_name, email FROM users LIMIT 5');
        console.log(`👥 Found ${users.length} users:`);
        users.forEach((user, index) => {
            console.log(`  ${index + 1}. ID: ${user.user_id} - ${user.first_name} ${user.last_name} (${user.email})`);
        });
        
        // Check custom_orders table structure
        console.log('\n3. Checking custom_orders table structure...');
        const [orderColumns] = await connection.execute('DESCRIBE custom_orders');
        console.log('Custom orders table columns:');
        orderColumns.forEach(col => {
            console.log(`  - ${col.Field}: ${col.Type} (${col.Null === 'YES' ? 'nullable' : 'not null'})`);
        });
        
        // Check the custom orders with NULL user_id
        console.log('\n4. Checking custom orders with NULL user_id...');
        const [nullUserOrders] = await connection.execute(`
            SELECT custom_order_id, customer_email, user_id, created_at
            FROM custom_orders 
            WHERE user_id IS NULL
            ORDER BY created_at DESC
        `);
        
        console.log(`📊 Found ${nullUserOrders.length} orders with NULL user_id:`);
        nullUserOrders.forEach((order, index) => {
            console.log(`  ${index + 1}. ${order.custom_order_id} - ${order.customer_email} - Created: ${order.created_at}`);
        });
        
        // Try to match emails between users and orders
        console.log('\n5. Trying to match order emails with user emails...');
        const [emailMatches] = await connection.execute(`
            SELECT 
                co.custom_order_id,
                co.customer_email,
                co.user_id as current_user_id,
                u.user_id as matching_user_id,
                u.first_name,
                u.last_name
            FROM custom_orders co
            LEFT JOIN users u ON co.customer_email = u.email
            WHERE co.user_id IS NULL
        `);
        
        console.log('Email matching results:');
        emailMatches.forEach((match, index) => {
            if (match.matching_user_id) {
                console.log(`  ✅ ${match.custom_order_id} - ${match.customer_email} → User ID ${match.matching_user_id} (${match.first_name} ${match.last_name})`);
            } else {
                console.log(`  ❌ ${match.custom_order_id} - ${match.customer_email} → No matching user`);
            }
        });
        
        await connection.end();
        
        console.log('\n💡 ANALYSIS:');
        console.log('- All custom orders have user_id = NULL');
        console.log('- This means orders were created without authentication');
        console.log('- The /api/custom-orders/my-orders endpoint requires user_id to match');
        console.log('- Need to either:');
        console.log('  a) Update existing orders to link them to users by email');
        console.log('  b) Modify the endpoint to also search by email for NULL user_id orders');
        
    } catch (error) {
        console.error('❌ Check failed:', error.message);
    }
}

checkDatabaseStructure();
