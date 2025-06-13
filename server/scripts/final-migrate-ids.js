require('dotenv').config();
const mysql = require('mysql2/promise');

async function finalUserIdMigration() {
    console.log('🚀 Final User ID Migration to Long Random Numbers...');
    
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
        const [users] = await pool.execute('SELECT * FROM users ORDER BY user_id');
        console.log(`Found ${users.length} users to migrate`);

        // Step 2: Create user ID mapping
        const userIdMapping = {};
        for (const user of users) {
            const newId = Math.floor(Math.random() * 900000000000000) + 100000000000000;
            userIdMapping[user.user_id] = newId;
            console.log(`   ${user.email}: ${user.user_id} -> ${newId}`);
        }

        // Step 3: Create backup tables
        console.log('1️⃣ Creating backup tables...');
        await pool.execute('DROP TABLE IF EXISTS users_backup');
        await pool.execute('CREATE TABLE users_backup AS SELECT * FROM users');
        
        await pool.execute('DROP TABLE IF EXISTS password_reset_tokens_backup');
        await pool.execute('CREATE TABLE password_reset_tokens_backup AS SELECT * FROM password_reset_tokens');

        // Step 4: Disable foreign key checks
        await pool.execute('SET FOREIGN_KEY_CHECKS = 0');

        // Step 5: Update password_reset_tokens table first
        console.log('2️⃣ Updating password_reset_tokens table...');
        for (const [oldId, newId] of Object.entries(userIdMapping)) {
            await pool.execute('UPDATE password_reset_tokens SET user_id = ? WHERE user_id = ?', [newId, oldId]);
        }

        // Step 6: Update users table
        console.log('3️⃣ Updating users table...');
        for (const [oldId, newId] of Object.entries(userIdMapping)) {
            await pool.execute('UPDATE users SET user_id = ? WHERE user_id = ?', [newId, oldId]);
        }

        // Step 7: Modify users table to BIGINT
        console.log('4️⃣ Modifying users table structure...');
        await pool.execute('ALTER TABLE users MODIFY user_id BIGINT PRIMARY KEY');

        // Step 8: Modify password_reset_tokens table to BIGINT
        console.log('5️⃣ Modifying password_reset_tokens table structure...');
        await pool.execute('ALTER TABLE password_reset_tokens MODIFY user_id BIGINT');

        // Step 9: Re-enable foreign key checks
        await pool.execute('SET FOREIGN_KEY_CHECKS = 1');

        // Step 10: Set high AUTO_INCREMENT value for future users
        const startPoint = Math.floor(Math.random() * 900000000000000) + 100000000000000;
        await pool.execute(`ALTER TABLE users AUTO_INCREMENT = ${startPoint}`);

        console.log('✅ Migration completed successfully!');
        
        // Show admin account
        const [admin] = await pool.execute('SELECT user_id, email FROM users WHERE email = ?', ['kurtadodoli@gmail.com']);
        if (admin.length > 0) {
            console.log(`🔑 Admin account ID: ${admin[0].user_id}`);
        }

        // Clean up backup tables
        console.log('6️⃣ Cleaning up backup tables...');
        await pool.execute('DROP TABLE users_backup');
        await pool.execute('DROP TABLE password_reset_tokens_backup');

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        
        // Restore from backup if possible
        try {
            console.log('🔄 Attempting to restore from backup...');
            await pool.execute('SET FOREIGN_KEY_CHECKS = 0');
            
            await pool.execute('DROP TABLE IF EXISTS users');
            await pool.execute('CREATE TABLE users AS SELECT * FROM users_backup');
            await pool.execute('ALTER TABLE users ADD PRIMARY KEY (user_id)');
            await pool.execute('ALTER TABLE users MODIFY user_id INT AUTO_INCREMENT');
            
            await pool.execute('DROP TABLE IF EXISTS password_reset_tokens');
            await pool.execute('CREATE TABLE password_reset_tokens AS SELECT * FROM password_reset_tokens_backup');
            
            await pool.execute('SET FOREIGN_KEY_CHECKS = 1');
            console.log('✅ Restored from backup');
        } catch (restoreError) {
            console.error('❌ Failed to restore backup:', restoreError.message);
        }
    } finally {
        await pool.end();
    }
}

finalUserIdMigration();
