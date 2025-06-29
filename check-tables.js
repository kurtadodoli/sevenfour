// Check table structures
const mysql = require('mysql2/promise');

async function checkTableStructures() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 's3v3n-f0ur-cl0thing*',
      database: 'seven_four_clothing'
    });

    console.log('📊 Checking table structures...');
    
    // Check orders table structure
    console.log('\n📦 Orders table structure:');
    const [orderColumns] = await connection.execute(`DESCRIBE orders`);
    orderColumns.forEach(col => {
      console.log(`  - ${col.Field} (${col.Type})`);
    });

    // Get a few sample orders to see the data
    console.log('\n📦 Sample orders:');
    const [sampleOrders] = await connection.execute(`
      SELECT * FROM orders LIMIT 3
    `);
    sampleOrders.forEach((order, index) => {
      console.log(`  Order ${index + 1}:`, Object.keys(order).map(key => `${key}=${order[key]}`).join(', '));
    });

    await connection.end();

  } catch (error) {
    console.error('❌ Database check failed:', error.message);
  }
}

checkTableStructures();
