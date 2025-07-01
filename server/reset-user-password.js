const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const path = require('path');

// Ensure dotenv is loaded with correct path
require('dotenv').config({ path: path.join(__dirname, '.env') });

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'seven_four_clothing',
    charset: 'utf8mb4'
};

async function resetUserPassword() {
    const connection = await mysql.createConnection(dbConfig);
    
    try {
        console.log('=== RESETTING PASSWORD FOR USER 967502321335217 ===');
        
        const newPassword = 'testpassword123';
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        await connection.execute(
            'UPDATE users SET password = ? WHERE user_id = 967502321335217',
            [hashedPassword]
        );
        
        console.log('✅ Password updated successfully!');
        console.log('Email: testuser@example.com');
        console.log('New Password: testpassword123');
        
        // Verify the update
        const [user] = await connection.execute(
            'SELECT user_id, email, first_name, last_name FROM users WHERE user_id = 967502321335217'
        );
        
        console.log('User details:', user[0]);
        
    } catch (error) {
        console.error('Error resetting password:', error);
    } finally {
        await connection.end();
    }
}

resetUserPassword().catch(console.error);
