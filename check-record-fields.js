const mysql = require('mysql2/promise');
require('dotenv').config({ path: './server/.env' });

async function checkRecordFields() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log('🔍 Checking record fields for juan@example.com...');

    const [records] = await connection.execute(`
      SELECT id, design_id, product_name, first_name, last_name, email, 
             customer_name, customer_email, status, created_at
      FROM custom_designs 
      WHERE email = ? OR customer_email = ?
      LIMIT 1
    `, ['juan@example.com', 'juan@example.com']);

    if (records.length > 0) {
      console.log('📄 Database Record:');
      const record = records[0];
      Object.keys(record).forEach(key => {
        console.log(`  ${key}: ${record[key]}`);
      });
    } else {
      console.log('❌ No records found for juan@example.com');
    }

    await connection.end();
  } catch (error) {
    console.error('❌ Database Error:', error.message);
  }
}

checkRecordFields();
