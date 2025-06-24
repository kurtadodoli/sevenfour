const mysql = require('mysql2/promise');

async function checkProductsTable() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 's3v3n-f0ur-cl0thing*',
    database: 'seven_four_clothing'
  });

  try {
    console.log('🔍 Checking products table structure...\n');
    
    const [columns] = await connection.execute('DESCRIBE products');
    
    console.log('Products Table Columns:');
    columns.forEach((col, index) => {
      console.log(`${index + 1}. ${col.Field} (${col.Type}) - ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'} - Default: ${col.Default || 'none'}`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await connection.end();
  }
}

checkProductsTable();
