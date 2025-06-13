require('dotenv').config();
const mysql = require('mysql2/promise');

async function completeUserIdMigration() {
    console.log('🚀 Complete User ID Migration to Long Random Numbers...');
    
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
        const tablesToBackup = ['users', 'products', 'orders', 'reviews', 'inventory_logs', 'user_logs', 'carts', 'password_reset_tokens'];
        
        for (const table of tablesToBackup) {
            await pool.execute(`DROP TABLE IF EXISTS ${table}_backup`);
            await pool.execute(`CREATE TABLE ${table}_backup AS SELECT * FROM ${table}`);
        }

        // Step 4: Disable foreign key checks
        await pool.execute('SET FOREIGN_KEY_CHECKS = 0');

        // Step 5: Update all referencing tables first
        console.log('2️⃣ Updating referencing tables...');
        
        // Update products table
        for (const [oldId, newId] of Object.entries(userIdMapping)) {
            await pool.execute('UPDATE products SET created_by = ? WHERE created_by = ?', [newId, oldId]);
        }
        
        // Update orders table
        for (const [oldId, newId] of Object.entries(userIdMapping)) {
            await pool.execute('UPDATE orders SET user_id = ? WHERE user_id = ?', [newId, oldId]);
        }
        
        // Update reviews table
        for (const [oldId, newId] of Object.entries(userIdMapping)) {
            await pool.execute('UPDATE reviews SET user_id = ? WHERE user_id = ?', [newId, oldId]);
        }
        
        // Update inventory_logs table
        for (const [oldId, newId] of Object.entries(userIdMapping)) {
            await pool.execute('UPDATE inventory_logs SET user_id = ? WHERE user_id = ?', [newId, oldId]);
        }
        
        // Update user_logs table
        for (const [oldId, newId] of Object.entries(userIdMapping)) {
            await pool.execute('UPDATE user_logs SET user_id = ? WHERE user_id = ?', [newId, oldId]);
        }
        
        // Update carts table
        for (const [oldId, newId] of Object.entries(userIdMapping)) {
            await pool.execute('UPDATE carts SET user_id = ? WHERE user_id = ?', [newId, oldId]);
        }
        
        // Update password_reset_tokens table
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

        // Step 8: Modify referencing tables to BIGINT
        console.log('5️⃣ Modifying referencing table structures...');
        await pool.execute('ALTER TABLE products MODIFY created_by BIGINT');
        await pool.execute('ALTER TABLE orders MODIFY user_id BIGINT');
        await pool.execute('ALTER TABLE reviews MODIFY user_id BIGINT');
        await pool.execute('ALTER TABLE inventory_logs MODIFY user_id BIGINT');
        await pool.execute('ALTER TABLE user_logs MODIFY user_id BIGINT');
        await pool.execute('ALTER TABLE carts MODIFY user_id BIGINT');
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
        for (const table of tablesToBackup) {
            await pool.execute(`DROP TABLE ${table}_backup`);
        }

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        
        // Restore from backup if possible
        try {
            console.log('🔄 Attempting to restore from backup...');
            await pool.execute('SET FOREIGN_KEY_CHECKS = 0');
            
            const tablesToRestore = ['users', 'products', 'orders', 'reviews', 'inventory_logs', 'user_logs', 'carts', 'password_reset_tokens'];
            
            for (const table of tablesToRestore) {
                await pool.execute(`DROP TABLE IF EXISTS ${table}`);
                await pool.execute(`CREATE TABLE ${table} AS SELECT * FROM ${table}_backup`);
                await pool.execute(`DROP TABLE ${table}_backup`);
            }
            
            await pool.execute('SET FOREIGN_KEY_CHECKS = 1');
            console.log('✅ Restored from backup');
        } catch (restoreError) {
            console.error('❌ Failed to restore backup:', restoreError.message);
        }
    } finally {
        await pool.end();
    }
}

completeUserIdMigration();
