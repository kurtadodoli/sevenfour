const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 's3v3n-f0ur-cl0thing*',
  database: 'seven_four_clothing'
};

async function checkOrdersTable() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    console.log('Checking orders table structure...');
    
    const [columns] = await connection.execute(`
      DESCRIBE orders
    `);
    
    console.log('Orders table columns:');
    columns.forEach(col => {
      console.log(`  ${col.Field} (${col.Type})`);
    });
    
    console.log('\nChecking sample orders...');
    
    const [orders] = await connection.execute(`
      SELECT * FROM orders LIMIT 5
    `);
    
    console.log('Sample orders:');
    orders.forEach(order => {
      console.log(`Order ID: ${order.id}, Order Number: ${order.order_number}`);
      console.log('  Columns:', Object.keys(order));
      console.log('---');
    });
    
    await connection.end();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkOrdersTable();
