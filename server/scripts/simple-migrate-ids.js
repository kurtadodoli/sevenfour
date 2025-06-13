require('dotenv').config();
const mysql = require('mysql2/promise');

async function simpleUserIdMigration() {
    console.log('🚀 Simple User ID Migration to Long Random Numbers...');
    
    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        console.log('✅ Database connected');

        // Step 1: Get all current users
        const [users] = await pool.execute('SELECT user_id, email FROM users ORDER BY user_id');
        console.log(`Found ${users.length} users to migrate`);

        // Step 2: Create backup table
        console.log('1️⃣ Creating backup...');
        await pool.execute('DROP TABLE IF EXISTS users_backup');
        await pool.execute('CREATE TABLE users_backup AS SELECT * FROM users');

        // Step 3: Temporarily disable foreign key checks
        await pool.execute('SET FOREIGN_KEY_CHECKS = 0');

        // Step 4: Drop and recreate users table with BIGINT
        console.log('2️⃣ Recreating users table with BIGINT IDs...');
        await pool.execute('DROP TABLE users');
        
        await pool.execute(`
            CREATE TABLE users (
                user_id BIGINT PRIMARY KEY,
                first_name VARCHAR(50) NOT NULL,
                last_name VARCHAR(50) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                gender ENUM('MALE', 'FEMALE', 'OTHER') NOT NULL,
                birthday DATE NOT NULL,
                role ENUM('customer', 'admin') DEFAULT 'customer',
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                last_login TIMESTAMP NULL
            )
        `);

        // Step 5: Insert users with new random IDs
        console.log('3️⃣ Inserting users with new random IDs...');
        for (const user of users) {
            // Generate 15-digit random number
            const newId = Math.floor(Math.random() * 900000000000000) + 100000000000000;
            
            await pool.execute(`
                INSERT INTO users (user_id, first_name, last_name, email, password, gender, birthday, role, is_active, created_at, updated_at, last_login)
                SELECT ?, first_name, last_name, email, password, gender, birthday, role, is_active, created_at, updated_at, last_login
                FROM users_backup WHERE user_id = ?
            `, [newId, user.user_id]);
            
            console.log(`   ${user.email}: ${user.user_id} -> ${newId}`);
        }

        // Step 6: Set high AUTO_INCREMENT value for future users
        const startPoint = Math.floor(Math.random() * 900000000000000) + 100000000000000;
        await pool.execute(`ALTER TABLE users AUTO_INCREMENT = ${startPoint}`);

        // Step 7: Re-enable foreign key checks
        await pool.execute('SET FOREIGN_KEY_CHECKS = 1');

        console.log('✅ Migration completed successfully!');
        
        // Show admin account
        const [admin] = await pool.execute('SELECT user_id, email FROM users WHERE email = ?', ['kurtadodoli@gmail.com']);
        if (admin.length > 0) {
            console.log(`🔑 Admin account ID: ${admin[0].user_id}`);
        }

        // Clean up backup table
        await pool.execute('DROP TABLE users_backup');

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        
        // Restore from backup if possible
        try {
            await pool.execute('DROP TABLE IF EXISTS users');
            await pool.execute('CREATE TABLE users AS SELECT * FROM users_backup');
            await pool.execute('ALTER TABLE users ADD PRIMARY KEY (user_id)');
            await pool.execute('DROP TABLE users_backup');
            console.log('✅ Restored from backup');
        } catch (restoreError) {
            console.error('❌ Failed to restore backup:', restoreError.message);
        }
    } finally {
        await pool.end();
    }
}

simpleUserIdMigration().catch(console.error);
