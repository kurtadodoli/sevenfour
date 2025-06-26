const mysql = require('mysql2/promise');
const { dbConfig } = require('./server/config/db');

async function checkUsersSchema() {
    const conn = await mysql.createConnection(dbConfig);
    
    // Check the structure of users table
    const [columns] = await conn.execute('DESCRIBE users');
    console.log('users table columns:');
    columns.forEach(col => {
        console.log(`${col.Field}: ${col.Type} (${col.Null === 'YES' ? 'nullable' : 'not null'}) (${col.Key || 'no key'})`);
    });
    
    // Get sample users
    const [users] = await conn.execute('SELECT * FROM users LIMIT 3');
    console.log('\nSample users:');
    console.log(users);
    
    await conn.end();
}

checkUsersSchema().catch(console.error);
