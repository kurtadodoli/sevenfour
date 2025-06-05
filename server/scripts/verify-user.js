require('dotenv').config();
const { pool } = require('../config/database');

async function verifyUser() {
    try {
        const [users] = await pool.query(
            'SELECT id, email, password FROM users WHERE email = ?',
            ['test@example.com']
        );

        if (users.length === 0) {
            console.log('❌ Test user not found in database');
            return;
        }

        console.log('✅ Test user found:', {
            id: users[0].id,
            email: users[0].email,
            passwordHash: users[0].password
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await pool.end();
    }
}

verifyUser();