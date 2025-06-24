const mysql = require('mysql2/promise');

async function checkOrderItems() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 's3v3n-f0ur-cl0thing*',
    database: 'seven_four_clothing'
  });
  
  console.log('order_items table structure:');
  const [columns] = await connection.execute('DESCRIBE order_items');
  columns.forEach(col => console.log(`  ${col.Field}: ${col.Type} ${col.Null} ${col.Key} ${col.Default}`));
  
  await connection.end();
}

checkOrderItems().catch(console.error);
