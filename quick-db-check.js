const mysql = require('mysql2/promise');

async function quickDbCheck() {
  try {
    console.log('Attempting to connect to database...');
    
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 's3v3n-f0ur-cl0thing*',
      database: 'seven_four_clothing'
    });

    console.log('✓ Connected to database successfully');

    // Check if orders table exists
    const [tables] = await connection.execute(`
      SHOW TABLES LIKE 'orders'
    `);
    
    if (tables.length === 0) {
      console.log('✗ Orders table does not exist');
      return;
    }
    
    console.log('✓ Orders table exists');

    // Check orders table structure
    const [columns] = await connection.execute(`DESCRIBE orders`);
    console.log('\nOrders table columns:');
    columns.forEach(col => {
      console.log(`- ${col.Field}: ${col.Type}, Null: ${col.Null}, Default: ${col.Default}`);
    });

    // Check specifically for customer_fullname
    const customerFullnameCol = columns.find(col => col.Field === 'customer_fullname');
    if (customerFullnameCol) {
      console.log(`\n✓ customer_fullname column exists: ${customerFullnameCol.Type}, Default: ${customerFullnameCol.Default}`);
    } else {
      console.log('\n✗ customer_fullname column is missing');
    }

    await connection.end();
    
  } catch (error) {
    console.error('Database connection error:', error.message);
    console.log('\nPossible solutions:');
    console.log('1. Make sure MySQL service is running');
    console.log('2. Check database credentials in server/.env');
    console.log('3. Verify database "seven_four_clothing" exists');
  }
}

quickDbCheck();
