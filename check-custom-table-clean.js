const mysql = require('mysql2/promise');
require('dotenv').config({ path: './server/.env' });

async function checkCustomDesignsTable() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log('✅ Connected to database\n');

    // Get table structure
    const [columns] = await connection.execute('DESCRIBE custom_designs');
    
    console.log('📋 CUSTOM_DESIGNS Table Structure:');
    console.log('===================================');
    columns.forEach((col, index) => {
      console.log(`${(index + 1).toString().padStart(2, ' ')}. ${col.Field.padEnd(20)} | ${col.Type.padEnd(20)} | ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });

    console.log('\n🔍 Fields that reference email:');
    const emailFields = columns.filter(col => col.Field.toLowerCase().includes('email'));
    emailFields.forEach(field => {
      console.log(`   - ${field.Field} (${field.Type})`);
    });

    await connection.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkCustomDesignsTable();
