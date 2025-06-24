const mysql = require('mysql2/promise');
require('dotenv').config({ path: './server/.env' });

async function updateCustomDesignsTable() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log('✅ Connected to database');

    // Check current table structure
    console.log('\n🔍 Current table structure:');
    const [currentColumns] = await connection.execute('DESCRIBE custom_designs');
    currentColumns.forEach((col, index) => {
      console.log(`   ${index + 1}. ${col.Field} (${col.Type})`);
    });

    console.log('\n🔄 Updating table structure...');

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

    // 2. Update field names to match new structure
    console.log('2. Updating field names...');
    
    // Rename fields to match OrderPage.js structure
    const fieldUpdates = [
      { old: 'customer_email', new: 'temp_customer_email', description: 'Rename customer_email to temp (for removal)' },
      { old: 'email', new: 'temp_email', description: 'Rename email to temp (for removal)' }
    ];

    for (const update of fieldUpdates) {
      try {
        await connection.execute(`
          ALTER TABLE custom_designs 
          CHANGE COLUMN ${update.old} ${update.new} VARCHAR(255) NULL
        `);
        console.log(`   ✅ ${update.description}`);
      } catch (error) {
        if (error.code === 'ER_BAD_FIELD_ERROR') {
          console.log(`   ⚠️  ${update.old} column doesn't exist - skipping`);
        } else {
          console.log(`   ⚠️  Error updating ${update.old}: ${error.message}`);
        }
      }
    }

    // 3. Remove the email columns (now renamed)
    console.log('3. Removing email columns...');
    const columnsToRemove = ['temp_customer_email', 'temp_email'];
    
    for (const column of columnsToRemove) {
      try {
        await connection.execute(`ALTER TABLE custom_designs DROP COLUMN ${column}`);
        console.log(`   ✅ Removed ${column} column`);
      } catch (error) {
        if (error.code === 'ER_CANT_DROP_FIELD_OR_KEY') {
          console.log(`   ⚠️  ${column} column doesn't exist - skipping`);
        } else {
          console.log(`   ⚠️  Error removing ${column}: ${error.message}`);
        }
      }
    }

    // 4. Add foreign key constraint for user_id
    console.log('4. Adding foreign key constraint...');
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

    // 5. Show final table structure
    console.log('\n📋 Final table structure:');
    const [finalColumns] = await connection.execute('DESCRIBE custom_designs');
    finalColumns.forEach((col, index) => {
      console.log(`   ${index + 1}. ${col.Field} (${col.Type}) ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });

    console.log('\n🎉 Database update completed successfully!');
    console.log('💡 Custom designs will now be linked to user accounts via user_id');
    console.log('💡 No email fields needed - user email comes from authentication');

  } catch (error) {
    console.error('❌ Error updating database:', error);
    console.error('Error details:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

console.log('🔄 UPDATING CUSTOM DESIGNS TABLE STRUCTURE');
console.log('==========================================');
console.log('This will:');
console.log('- Add user_id column');
console.log('- Remove email and customer_email columns');
console.log('- Add foreign key constraint to users table');
console.log('');

updateCustomDesignsTable();
