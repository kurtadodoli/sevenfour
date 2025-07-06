const mysql = require('mysql2/promise');

async function checkUsers() {
    console.log('👥 CHECKING AVAILABLE USERS FOR TESTING');
    
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 's3v3n-f0ur-cl0thing*',
        database: 'seven_four_clothing',
        charset: 'utf8mb4'
    });

    try {
        const [users] = await connection.execute(`
            SELECT id, email, username, first_name, last_name, created_at
            FROM users 
            ORDER BY created_at DESC 
            LIMIT 5
        `);
        
        if (users.length > 0) {
            console.log('\n📋 Available test users:');
            users.forEach((user, index) => {
                console.log(`${index + 1}. ID: ${user.id} | Email: ${user.email} | Username: ${user.username}`);
                console.log(`   Name: ${user.first_name} ${user.last_name} | Created: ${user.created_at}`);
            });
            
            console.log('\n💡 You can use any of these emails to test login.');
            console.log('⚠️ Make sure you know the password or create a new test user.');
        } else {
            console.log('\n❌ No users found in database');
            console.log('💡 You may need to create a user first via the frontend registration.');
        }

        // Check if there are any cart items for testing
        console.log('\n🛒 Checking for cart items...');
        const [carts] = await connection.execute(`
            SELECT c.id as cart_id, c.user_id, u.email, COUNT(ci.id) as item_count
            FROM carts c
            LEFT JOIN cart_items ci ON c.id = ci.cart_id
            LEFT JOIN users u ON c.user_id = u.id
            GROUP BY c.id, c.user_id, u.email
            HAVING item_count > 0
            ORDER BY item_count DESC
            LIMIT 3
        `);
        
        if (carts.length > 0) {
            console.log('\n📦 Users with cart items:');
            carts.forEach(cart => {
                console.log(`- User: ${cart.email} (ID: ${cart.user_id}) has ${cart.item_count} items in cart`);
            });
        } else {
            console.log('\n⚠️ No users have items in their cart');
            console.log('💡 Add some products to cart via frontend first, or the order creation will fail.');
        }

    } catch (error) {
        console.error('❌ Error checking users:', error);
    } finally {
        await connection.end();
    }
}

checkUsers().catch(console.error);
