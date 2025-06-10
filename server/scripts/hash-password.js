const bcrypt = require('bcryptjs');

async function hashPassword() {
    const password = 's3v3n-f0ur-cl0thing*';
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    console.log('Password:', password);
    console.log('Hash:', hash);
}

hashPassword();
