const bcrypt = require('bcrypt');
const { query, testConnection } = require('../config/db');

const setupDatabase = async () => {
    console.log('🔧 Setting up database and admin account...\n');

    try {
        // Test database connection
        const connected = await testConnection();
        if (!connected) {
            throw new Error('Database connection failed');
        }

        // Hash the admin password
        const adminPassword = 'Admin123!@#';
        const hashedPassword = await bcrypt.hash(adminPassword, 12);
        console.log('🔐 Admin password hashed successfully');

        // Update admin account with correct hashed password
        const updateResult = await query(
            `UPDATE users SET password = ? WHERE email = ?`,
            [hashedPassword, 'kurtadodoli@gmail.com']
        );

        if (updateResult.affectedRows > 0) {
            console.log('✅ Admin account updated successfully');
        } else {
            // If no rows affected, create the admin account
            await query(
                `INSERT INTO users (
                    first_name, last_name, email, password, 
                    gender, birthday, role, is_active
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    'Kurt', 'Adodoli', 'kurtadodoli@gmail.com', 
                    hashedPassword, 'other', '1990-01-01', 'admin', true
                ]
            );
            console.log('✅ Admin account created successfully');
        }

        // Verify admin account
        const adminUser = await query(
            'SELECT user_id, first_name, last_name, email, role FROM users WHERE email = ?',
            ['kurtadodoli@gmail.com']
        );

        if (adminUser.length > 0) {
            console.log('\n📊 Admin Account Details:');
            console.log(`   User ID: ${adminUser[0].user_id}`);
            console.log(`   Name: ${adminUser[0].first_name} ${adminUser[0].last_name}`);
            console.log(`   Email: ${adminUser[0].email}`);
            console.log(`   Role: ${adminUser[0].role}`);
        }

        console.log('\n🎉 Database setup completed successfully!');
        console.log('\nAdmin login credentials:');
        console.log('   Email: kurtadodoli@gmail.com');
        console.log('   Password: Admin123!@#');

    } catch (error) {
        console.error('❌ Database setup failed:', error.message);
        process.exit(1);
    }

    process.exit(0);
};

setupDatabase();
