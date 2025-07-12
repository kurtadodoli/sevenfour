// Check user table structure and sample data
const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 's3v3n-f0ur-cl0thing*',
    database: 'seven_four_clothing'
};

async function checkUsers() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        
        console.log('📊 Checking users table...');
        
        // Check table structure
        const [tableInfo] = await connection.execute(`
            DESCRIBE users
        `);
        
        console.log('Users table structure:');
        tableInfo.forEach(column => {
            console.log(`- ${column.Field}: ${column.Type} (${column.Null === 'YES' ? 'nullable' : 'not null'})`);
        });
        
        // Check sample users
        const [users] = await connection.execute(`
            SELECT user_id, email, first_name, last_name, role, is_active
            FROM users 
            ORDER BY user_id DESC 
            LIMIT 5
        `);
        
        console.log(`\nFound ${users.length} users (sample):`);
        users.forEach((user, index) => {
            console.log(`${index + 1}. ID: ${user.user_id}, Email: ${user.email}, Active: ${user.is_active}`);
        });
        
        // Check if the user_id from custom orders matches any user
        const userId = 967502321335218;
        console.log(`\n🔍 Checking user ID ${userId} from custom orders...`);
        
        const [userCheck] = await connection.execute(`
            SELECT user_id, email, first_name, last_name, role, is_active
            FROM users 
            WHERE user_id = ?
        `, [userId]);
        
        if (userCheck.length > 0) {
            console.log('✅ User found:', userCheck[0]);
        } else {
            console.log('❌ User not found');
        }
        
        await connection.end();
        
    } catch (error) {
        console.error('Database error:', error.message);
        console.error('Error details:', error);
    }
}

checkUsers();
