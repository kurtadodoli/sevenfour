require('dotenv').config();
const mysql = require('mysql2/promise');

async function migrateToLongUserIds() {
    console.log('🚀 Starting Migration to Long Random User IDs...');
    
    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        // Test connection
        await pool.execute('SELECT 1');
        console.log('✅ Database connected successfully');

        // Step 1: Create mapping table
        console.log('1️⃣ Creating user ID mapping...');
        await pool.execute(`
            CREATE TEMPORARY TABLE user_id_mapping (
                old_id INT,
                new_id BIGINT PRIMARY KEY
            )
        `);

        // Step 2: Generate new IDs for all users
        const [users] = await pool.execute('SELECT user_id FROM users ORDER BY user_id');
        console.log(`Found ${users.length} users to migrate`);

        for (const user of users) {
            // Generate 15-digit random number
            const newId = Math.floor(Math.random() * 900000000000000) + 100000000000000;
            await pool.execute('INSERT INTO user_id_mapping (old_id, new_id) VALUES (?, ?)', [user.user_id, newId]);
            console.log(`   Mapping: ${user.user_id} -> ${newId}`);
        }

        // Step 3: Create new users table with BIGINT IDs
        console.log('2️⃣ Creating new users table structure...');
        await pool.execute(`
            CREATE TABLE users_new LIKE users
        `);
        
        await pool.execute(`
            ALTER TABLE users_new 
            MODIFY COLUMN user_id BIGINT PRIMARY KEY
        `);

        // Step 4: Copy data with new IDs
        console.log('3️⃣ Copying user data with new IDs...');
        await pool.execute(`
            INSERT INTO users_new (user_id, first_name, last_name, email, password, gender, birthday, role, is_active, created_at, updated_at, last_login)
            SELECT m.new_id, u.first_name, u.last_name, u.email, u.password, u.gender, u.birthday, u.role, u.is_active, u.created_at, u.updated_at, u.last_login
            FROM users u
            JOIN user_id_mapping m ON u.user_id = m.old_id
        `);

        // Step 5: Replace tables
        console.log('4️⃣ Replacing tables...');
        await pool.execute('DROP TABLE users');
        await pool.execute('RENAME TABLE users_new TO users');

        // Step 6: Set high AUTO_INCREMENT value
        const newAutoIncrement = Math.floor(Math.random() * 900000000000000) + 100000000000000;
        await pool.execute(`ALTER TABLE users AUTO_INCREMENT = ${newAutoIncrement}`);

        console.log('✅ Migration completed successfully!');
        
        // Show results
        const [newUsers] = await pool.execute('SELECT user_id, email FROM users WHERE email = ?', ['kurtadodoli@gmail.com']);
        if (newUsers.length > 0) {
            console.log(`🔑 Admin account new ID: ${newUsers[0].user_id}`);
        }

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
    } finally {
        await pool.end();
    }
}

migrateToLongUserIds().catch(console.error);
