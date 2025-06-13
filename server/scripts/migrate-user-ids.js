require('dotenv').config();
const mysql = require('mysql2/promise');

async function migrateUserIds() {
    console.log('🔄 Starting User ID Migration...');
    
    const dbConfig = {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'seven_four_clothing'
    };
    
    console.log('📊 Database config:', { ...dbConfig, password: '***' });
    
    const pool = mysql.createPool(dbConfig);    try {
        // Test connection first
        console.log('🔗 Testing database connection...');
        await pool.execute('SELECT 1');
        console.log('✅ Database connection successful!');
        
        // Step 1: Add temporary column
        console.log('1️⃣ Adding temporary column...');
        await pool.execute('ALTER TABLE users ADD COLUMN new_user_id BIGINT UNIQUE');

        // Step 2: Generate random IDs for existing users
        console.log('2️⃣ Generating random IDs...');
        const [users] = await pool.execute('SELECT user_id FROM users');
        
        for (const user of users) {
            let randomId;
            let isUnique = false;
            
            // Generate unique random ID
            while (!isUnique) {
                // Generate 15-digit random number
                randomId = Math.floor(Math.random() * 900000000000000) + 100000000000000;
                
                // Check if it's unique
                const [existing] = await pool.execute('SELECT new_user_id FROM users WHERE new_user_id = ?', [randomId]);
                if (existing.length === 0) {
                    isUnique = true;
                }
            }
            
            // Update the user with new random ID
            await pool.execute('UPDATE users SET new_user_id = ? WHERE user_id = ?', [randomId, user.user_id]);
            console.log(`   Updated user ${user.user_id} -> ${randomId}`);
        }

        // Step 3: Update foreign key tables if they exist
        console.log('3️⃣ Updating foreign key references...');
        
        // Check if login_attempts table exists and has user_id column
        try {
            await pool.execute('SELECT user_id FROM login_attempts LIMIT 1');
            console.log('   Updating login_attempts...');
            await pool.execute(`
                UPDATE login_attempts la 
                JOIN users u ON la.user_id = u.user_id 
                SET la.user_id = u.new_user_id 
                WHERE u.new_user_id IS NOT NULL
            `);
        } catch (error) {
            console.log('   login_attempts table does not have user_id column, skipping...');
        }

        // Step 4: Drop old primary key and rename column
        console.log('4️⃣ Updating table structure...');
        await pool.execute('ALTER TABLE users DROP PRIMARY KEY');
        await pool.execute('ALTER TABLE users DROP COLUMN user_id');
        await pool.execute('ALTER TABLE users CHANGE new_user_id user_id BIGINT PRIMARY KEY');

        // Step 5: Update AUTO_INCREMENT to use large random starting point
        const startingPoint = Math.floor(Math.random() * 900000000000000) + 100000000000000;
        await pool.execute(`ALTER TABLE users AUTO_INCREMENT = ${startingPoint}`);

        console.log('✅ User ID migration completed successfully!');
        console.log('📊 New user ID format: 15-digit random numbers');

        // Show updated admin account
        const [admin] = await pool.execute('SELECT user_id, email, role FROM users WHERE email = ?', ['kurtadodoli@gmail.com']);
        if (admin.length > 0) {
            console.log(`🔑 Admin account updated: ID ${admin[0].user_id}, Email: ${admin[0].email}`);
        }

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        
        // Cleanup on error
        try {
            await pool.execute('ALTER TABLE users DROP COLUMN new_user_id');
        } catch (cleanupError) {
            console.log('Cleanup attempt completed');
        }
    } finally {
        await pool.end();
    }
}

migrateUserIds();
