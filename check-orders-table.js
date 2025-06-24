const mysql = require('mysql2/promise');

async function checkOrdersTable() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 's3v3n-f0ur-cl0thing*',
    database: 'seven_four_clothing'
  });
  
  console.log('Checking orders table structure:');
  const [columns] = await connection.execute('DESCRIBE orders');
  columns.forEach(col => console.log(`  ${col.Field}: ${col.Type} ${col.Null} ${col.Key} ${col.Default}`));
  
  console.log('\nChecking order_invoices table structure:');
  const [invoiceColumns] = await connection.execute('DESCRIBE order_invoices');
  invoiceColumns.forEach(col => console.log(`  ${col.Field}: ${col.Type} ${col.Null} ${col.Key} ${col.Default}`));
  
  await connection.end();
}

checkOrdersTable().catch(console.error);
