const { query } = require('./config/db');

async function checkUsers() {
    try {
        const users = await query('SELECT user_id, email, role FROM users LIMIT 5');
        console.log('Users in database:');
        users.forEach(u => console.log(`- ${u.email} (${u.role}) [ID: ${u.user_id}]`));
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

checkUsers();
