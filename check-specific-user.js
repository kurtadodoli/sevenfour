const mysql = require('mysql2/promise');
const { dbConfig } = require('./server/config/db');

async function checkSpecificUser() {
    console.log('=== CHECKING SPECIFIC USER ===');
    
    const connection = await mysql.createConnection(dbConfig);
    
    try {
        // Check the specific user
        const [user] = await connection.execute(`
            SELECT user_id, email, first_name, last_name, role, password, created_at 
            FROM users 
            WHERE user_id = ?
        `, [967502321335218]);
        
        if (user.length > 0) {
            console.log('✅ User found:');
            console.log('User ID:', user[0].user_id);
            console.log('Email:', user[0].email);
            console.log('Name:', user[0].first_name, user[0].last_name);
            console.log('Role:', user[0].role);
            console.log('Has password:', !!user[0].password);
            console.log('Password length:', user[0].password ? user[0].password.length : 0);
            console.log('Created:', user[0].created_at);
            
            // Check if password looks like bcrypt hash
            if (user[0].password && user[0].password.startsWith('$2b$')) {
                console.log('✅ Password is properly hashed (bcrypt)');
            } else {
                console.log('⚠️ Password is not properly hashed or missing');
                console.log('Password preview:', user[0].password ? user[0].password.substring(0, 20) + '...' : 'null');
            }
        } else {
            console.log('❌ User not found with ID:', 967502321335218);
            
            // Check for similar users
            const [similarUsers] = await connection.execute(`
                SELECT user_id, email, first_name, last_name 
                FROM users 
                WHERE email LIKE '%krut%' OR first_name LIKE '%Kurt%'
            `);
            
            console.log('\n🔍 Similar users found:');
            similarUsers.forEach((user, index) => {
                console.log(`${index + 1}. ID: ${user.user_id}, Email: ${user.email}, Name: ${user.first_name} ${user.last_name}`);
            });
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await connection.end();
    }
}

checkSpecificUser();
