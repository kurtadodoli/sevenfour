// Reset password for krutadodoli@gmail.com
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function resetAdminPassword() {
    console.log('🔧 Resetting admin password...');
    
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 's3v3n-f0ur-cl0thing*',
        database: 'seven_four_clothing'
    });
    
    try {
        const email = 'krutadodoli@gmail.com';
        const newPassword = 'NewAdmin123!';
        
        // Hash the new password
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
        
        // Update the password
        const [result] = await connection.execute(
            'UPDATE users SET password = ? WHERE email = ?',
            [hashedPassword, email]
        );
        
        if (result.affectedRows > 0) {
            console.log('✅ Password reset successful!');
            console.log('Email:', email);
            console.log('New Password:', newPassword);
            console.log('You can now login with these credentials');
        } else {
            console.log('❌ User not found');
        }
        
    } catch (error) {
        console.error('❌ Error resetting password:', error.message);
    } finally {
        await connection.end();
    }
}

resetAdminPassword();
