const mysql = require('mysql2/promise');

async function checkTables() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root', 
    password: 's3v3n-f0ur-cl0thing*',
    database: 'seven_four_clothing',
    port: 3306
  });
  
  try {
    const [tables] = await connection.execute("SHOW TABLES LIKE 'custom%'");
    console.log('Custom tables found:');
    tables.forEach(table => console.log('  -', Object.values(table)[0]));
    
    if (tables.length > 0) {
      console.log('\nChecking custom_orders table...');
      const [columns] = await connection.execute('DESCRIBE custom_orders');
      console.log('Custom orders table structure:');
      columns.forEach(col => console.log(`  - ${col.Field}: ${col.Type}`));
    } else {
      console.log('No custom tables found. Need to create them.');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
  
  await connection.end();
}

checkTables();
