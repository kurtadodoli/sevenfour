const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const { dbConfig } = require('./server/config/db');

async function createAdminUser() {
    console.log('👑 CREATING ADMIN USER\n');
    
    try {
        const connection = await mysql.createConnection(dbConfig);
        
        const email = 'qka-adodoli@tip.edu.ph';
        const password = 'admin123'; // Default password - user should change this
        const firstName = 'Admin';
        const lastName = 'Adodoli';
        
        // Check if user already exists
        console.log('1. Checking if user already exists...');
        const [existingUsers] = await connection.execute(`
            SELECT user_id, email, role FROM users WHERE email = ?
        `, [email]);
        
        if (existingUsers.length > 0) {
            console.log(`📋 User ${email} already exists!`);
            console.log(`   Current role: ${existingUsers[0].role}`);
            
            if (existingUsers[0].role === 'admin') {
                console.log('✅ User is already an admin!');
            } else {
                console.log('🔄 Updating user role to admin...');
                await connection.execute(`
                    UPDATE users SET role = 'admin' WHERE email = ?
                `, [email]);
                console.log('✅ User role updated to admin!');
            }
        } else {
            console.log(`📝 Creating new admin user: ${email}`);
            
            // Hash the password
            console.log('2. Hashing password...');
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            
            // Generate a unique user ID
            const userId = Date.now() + Math.floor(Math.random() * 1000);
            
            // Insert the new admin user
            console.log('3. Creating user in database...');
            await connection.execute(`
                INSERT INTO users (user_id, first_name, last_name, email, password, role, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, 'admin', NOW(), NOW())
            `, [userId, firstName, lastName, email, hashedPassword]);
            
            console.log('✅ Admin user created successfully!');
        }
        
        // Verify the user
        console.log('\n4. Verifying admin user...');
        const [verifyUser] = await connection.execute(`
            SELECT user_id, first_name, last_name, email, role, created_at
            FROM users WHERE email = ?
        `, [email]);
        
        if (verifyUser.length > 0) {
            const user = verifyUser[0];
            console.log('✅ Admin user verified:');
            console.log(`   ID: ${user.user_id}`);
            console.log(`   Name: ${user.first_name} ${user.last_name}`);
            console.log(`   Email: ${user.email}`);
            console.log(`   Role: ${user.role}`);
            console.log(`   Created: ${user.created_at}`);
        }
        
        await connection.end();
        
        console.log('\n🎉 SUCCESS!');
        console.log(`👑 ${email} is now an admin user!`);
        console.log('\n📝 Login credentials:');
        console.log(`   Email: ${email}`);
        console.log(`   Password: ${password}`);
        console.log('\n⚠️ IMPORTANT: Please change the password after first login!');
        
    } catch (error) {
        console.error('❌ Error creating admin user:', error.message);
    }
}

createAdminUser();
