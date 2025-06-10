const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../.env' });

async function resetAdminPassword() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT
    });

    try {
        const newPassword = 'Admin@123';
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await pool.execute(
            'UPDATE users SET password = ? WHERE email = ?',
            [hashedPassword, 'admin@sevenfour.com']
        );

        console.log('✅ Admin password has been reset successfully');
        console.log('New login credentials:');
        console.log('Email: admin@sevenfour.com');
        console.log('Password: Admin@123');
    } catch (error) {
        console.error('❌ Error resetting admin password:', error);
    } finally {
        await pool.end();
    }
}

resetAdminPassword();
