const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 's3v3n-f0ur-cl0thing*',
  database: 'seven_four_clothing'
};

async function checkTableStructures() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');

    // Check orders table structure
    console.log('\n📋 Orders table structure:');
    const [ordersColumns] = await connection.execute('DESCRIBE orders');
    ordersColumns.forEach(col => {
      console.log(`  ${col.Field} (${col.Type})`);
    });

    // Check custom_orders table structure  
    console.log('\n📋 Custom_orders table structure:');
    const [customOrdersColumns] = await connection.execute('DESCRIBE custom_orders');
    customOrdersColumns.forEach(col => {
      console.log(`  ${col.Field} (${col.Type})`);
    });

    // Now search for the order with correct column names
    console.log('\n🔍 Looking for order CUSTOM-8H-QMZ5R-2498...');
    
    // Check in orders table
    const [ordersResult] = await connection.execute(`
      SELECT * FROM orders WHERE order_number = 'CUSTOM-8H-QMZ5R-2498'
    `);
    
    if (ordersResult.length > 0) {
      console.log('📋 Found in orders table:');
      console.log(ordersResult[0]);
    } else {
      console.log('❌ Not found in orders table');
    }

    // Check in custom_orders table
    const [customOrdersResult] = await connection.execute(`
      SELECT * FROM custom_orders WHERE order_number = 'CUSTOM-8H-QMZ5R-2498'
    `);
    
    if (customOrdersResult.length > 0) {
      console.log('📋 Found in custom_orders table:');
      console.log(customOrdersResult[0]);
    } else {
      console.log('❌ Not found in custom_orders table');
    }

  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkTableStructures();
