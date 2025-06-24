const mysql = require('mysql2/promise');
require('dotenv').config({ path: './server/.env' });

async function checkTableStructure() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log('✅ Connected to database');

    // Check custom_designs table structure
    console.log('\n🔍 Checking custom_designs table structure...');
    const [columns] = await connection.execute('DESCRIBE custom_designs');
    
    console.log('\n📋 Custom_designs table columns:');
    columns.forEach((col, index) => {
      console.log(`${index + 1}. ${col.Field} (${col.Type}) ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}${col.Default ? ` DEFAULT ${col.Default}` : ''}`);
    });

    // Check if custom_design_images table exists
    console.log('\n🔍 Checking custom_design_images table...');
    try {
      const [imageColumns] = await connection.execute('DESCRIBE custom_design_images');
      console.log('\n📋 Custom_design_images table columns:');
      imageColumns.forEach((col, index) => {
        console.log(`${index + 1}. ${col.Field} (${col.Type}) ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}${col.Default ? ` DEFAULT ${col.Default}` : ''}`);
      });
    } catch (imageError) {
      console.log('❌ custom_design_images table does not exist or is not accessible');
      console.log('Error:', imageError.message);
    }

    await connection.end();
    console.log('\n✅ Database check completed');
  } catch (error) {
    console.error('❌ Database Error:', error.message);
  }
}

checkTableStructure();
