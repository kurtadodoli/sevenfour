const { query } = require('./config/db');

async function checkUserTable() {
    try {
        console.log('Checking users table structure...');
        const result = await query('DESCRIBE users');
        
        console.log('Users table columns:');
        result.forEach(col => {
            console.log(`- ${col.Field} (${col.Type}) ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
        });
        
        // Check if profile_picture_url column exists
        const hasProfilePictureUrl = result.some(col => col.Field === 'profile_picture_url');
        
        if (!hasProfilePictureUrl) {
            console.log('\n❌ profile_picture_url column does NOT exist!');
            console.log('Adding the column...');
            
            await query('ALTER TABLE users ADD COLUMN profile_picture_url VARCHAR(255) NULL');
            console.log('✅ profile_picture_url column added successfully!');
        } else {
            console.log('\n✅ profile_picture_url column exists');
        }
        
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

checkUserTable();
