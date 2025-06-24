const mysql = require('mysql2/promise');
require('dotenv').config({ path: './server/.env' });

async function revertAndFixCustomDesignsTable() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log('✅ Connected to database');

    console.log('\n🔄 Fixing custom_designs table structure...');
    console.log('Goal: Keep email field, add user_id, link via both email and user_id');

    // 1. Add user_id column if it doesn't exist
    console.log('1. Adding user_id column...');
    try {
      await connection.execute(`
        ALTER TABLE custom_designs 
        ADD COLUMN user_id BIGINT NULL AFTER id
      `);
      console.log('   ✅ Added user_id column');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('   ✅ user_id column already exists');
      } else {
        throw error;
      }
    }

    // 2. Add customer_email column back if it doesn't exist
    console.log('2. Ensuring customer_email column exists...');
    try {
      await connection.execute(`
        ALTER TABLE custom_designs 
        ADD COLUMN customer_email VARCHAR(255) NOT NULL AFTER customer_name
      `);
      console.log('   ✅ Added customer_email column');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('   ✅ customer_email column already exists');
      } else {
        console.log(`   ⚠️  Could not add customer_email: ${error.message}`);
      }
    }

    // 3. Add foreign key constraint for user_id (if not exists)
    console.log('3. Adding foreign key constraint for user_id...');
    try {
      await connection.execute(`
        ALTER TABLE custom_designs 
        ADD CONSTRAINT fk_custom_designs_user_id 
        FOREIGN KEY (user_id) REFERENCES users(user_id) 
        ON DELETE SET NULL
      `);
      console.log('   ✅ Added foreign key constraint');
    } catch (error) {
      if (error.code === 'ER_DUP_KEYNAME') {
        console.log('   ✅ Foreign key constraint already exists');
      } else {
        console.log(`   ⚠️  Could not add foreign key: ${error.message}`);
      }
    }

    // 4. Show final table structure
    console.log('\n📋 Final table structure:');
    const [finalColumns] = await connection.execute('DESCRIBE custom_designs');
    finalColumns.forEach((col, index) => {
      console.log(`   ${index + 1}. ${col.Field} (${col.Type}) ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });

    console.log('\n🎉 Table structure fixed successfully!');
    console.log('💡 Structure:');
    console.log('   - user_id: Links to users table (for account association)');
    console.log('   - customer_email: Stores email automatically from logged-in user');
    console.log('   - No manual email input needed in frontend');
    console.log('   - Orders linked to accounts via both user_id and email');

  } catch (error) {
    console.error('❌ Error fixing database:', error);
    console.error('Error details:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

console.log('🔧 FIXING CUSTOM DESIGNS TABLE STRUCTURE');
console.log('=========================================');
console.log('This will:');
console.log('- Keep customer_email column (auto-filled from user account)');
console.log('- Add user_id column (for account linking)');
console.log('- Remove manual email input from frontend');
console.log('');

revertAndFixCustomDesignsTable();
