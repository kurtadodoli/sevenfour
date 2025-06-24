const mysql = require('mysql2/promise');

async function checkDB() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root', 
    password: 's3v3n-f0ur-cl0thing*',
    database: 'seven_four_clothing'
  });
  
  console.log('Checking custom_orders table structure:');
  const [columns] = await connection.execute('DESCRIBE custom_orders');
  columns.forEach(col => console.log(`  ${col.Field}: ${col.Type} ${col.Null} ${col.Key} ${col.Default}`));
  
  console.log('\nChecking existing orders:');
  const [orders] = await connection.execute('SELECT id, status, images FROM custom_orders ORDER BY created_at DESC LIMIT 5');
  orders.forEach(order => console.log(`  ID: ${order.id}, Status: ${order.status}, Images: ${order.images}`));
  
  await connection.end();
}

checkDB().catch(console.error);
