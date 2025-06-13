require('dotenv').config();
const mysql = require('mysql2/promise');

async function safeUserIdMigration() {
    console.log('🚀 Safe User ID Migration to Long Random Numbers...');
    
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
        await pool.execute('DROP TABLE IF EXISTS users_migration_backup');
        await pool.execute('CREATE TABLE users_migration_backup AS SELECT * FROM users');
        
        await pool.execute('DROP TABLE IF EXISTS password_reset_tokens_migration_backup');
        await pool.execute('CREATE TABLE password_reset_tokens_migration_backup AS SELECT * FROM password_reset_tokens');

        // Step 4: Temporarily disable foreign key checks
        await pool.execute('SET FOREIGN_KEY_CHECKS = 0');

        // Step 5: Drop the foreign key constraint
        console.log('2️⃣ Dropping foreign key constraint...');
        await pool.execute('ALTER TABLE password_reset_tokens DROP FOREIGN KEY password_reset_tokens_ibfk_1');

        // Step 6: Update password_reset_tokens table
        console.log('3️⃣ Updating password_reset_tokens table...');
        for (const [oldId, newId] of Object.entries(userIdMapping)) {
            await pool.execute('UPDATE password_reset_tokens SET user_id = ? WHERE user_id = ?', [newId, oldId]);
        }

        // Step 7: Update users table
        console.log('4️⃣ Updating users table...');
        for (const [oldId, newId] of Object.entries(userIdMapping)) {
            await pool.execute('UPDATE users SET user_id = ? WHERE user_id = ?', [newId, oldId]);
        }

        // Step 8: Modify table structures to BIGINT
        console.log('5️⃣ Modifying table structures...');
        await pool.execute('ALTER TABLE users MODIFY user_id BIGINT PRIMARY KEY');
        await pool.execute('ALTER TABLE password_reset_tokens MODIFY user_id BIGINT');

        // Step 9: Recreate foreign key constraint
        console.log('6️⃣ Recreating foreign key constraint...');
        await pool.execute('ALTER TABLE password_reset_tokens ADD CONSTRAINT password_reset_tokens_ibfk_1 FOREIGN KEY (user_id) REFERENCES users(user_id)');

        // Step 10: Re-enable foreign key checks
        await pool.execute('SET FOREIGN_KEY_CHECKS = 1');

        // Step 11: Set high AUTO_INCREMENT value for future users
        const startPoint = Math.floor(Math.random() * 900000000000000) + 100000000000000;
        await pool.execute(`ALTER TABLE users AUTO_INCREMENT = ${startPoint}`);

        console.log('✅ Migration completed successfully!');
        
        // Show admin account
        const [admin] = await pool.execute('SELECT user_id, email FROM users WHERE email = ?', ['kurtadodoli@gmail.com']);
        if (admin.length > 0) {
            console.log(`🔑 Admin account ID: ${admin[0].user_id}`);
        }

        // Verify the migration
        console.log('7️⃣ Verifying migration...');
        const [newUsers] = await pool.execute('SELECT user_id, email FROM users ORDER BY email');
        console.log('New user IDs:');
        for (const user of newUsers) {
            console.log(`   ${user.email}: ${user.user_id}`);
        }

        // Clean up backup tables
        console.log('8️⃣ Cleaning up backup tables...');
        await pool.execute('DROP TABLE users_migration_backup');
        await pool.execute('DROP TABLE password_reset_tokens_migration_backup');

        console.log('🎉 Migration completed successfully!');

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        console.error('Full error:', error);
        
        // Attempt to restore from backup
        try {
            console.log('🔄 Attempting to restore from backup...');
            await pool.execute('SET FOREIGN_KEY_CHECKS = 0');
            
            // Drop current tables
            await pool.execute('DROP TABLE IF EXISTS users');
            await pool.execute('DROP TABLE IF EXISTS password_reset_tokens');
            
            // Restore from backup
            await pool.execute('CREATE TABLE users AS SELECT * FROM users_migration_backup');
            await pool.execute('ALTER TABLE users ADD PRIMARY KEY (user_id)');
            await pool.execute('ALTER TABLE users MODIFY user_id INT AUTO_INCREMENT');
            
            await pool.execute('CREATE TABLE password_reset_tokens AS SELECT * FROM password_reset_tokens_migration_backup');
            
            // Recreate foreign key
            await pool.execute('ALTER TABLE password_reset_tokens ADD CONSTRAINT password_reset_tokens_ibfk_1 FOREIGN KEY (user_id) REFERENCES users(user_id)');
            
            await pool.execute('SET FOREIGN_KEY_CHECKS = 1');
            console.log('✅ Restored from backup');
        } catch (restoreError) {
            console.error('❌ Failed to restore backup:', restoreError.message);
        }
    } finally {
        await pool.end();
    }
}

safeUserIdMigration();
