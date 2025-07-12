const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 's3v3n-f0ur-cl0thing*',
  database: 'seven_four_clothing'
};

async function checkCustomOrdersTable() {
  try {
    console.log('🔍 Checking custom_orders table structure...');
    
    const connection = await mysql.createConnection(dbConfig);
    
    // Check table structure
    console.log('\n📋 Custom Orders Table Structure:');
    const [columns] = await connection.execute('DESCRIBE custom_orders');
    console.table(columns);
    
    // Check existing custom orders
    console.log('\n📊 Existing Custom Orders:');
    const [orders] = await connection.execute(`
      SELECT * FROM custom_orders 
      ORDER BY created_at DESC 
      LIMIT 3
    `);
    
    if (orders.length > 0) {
      console.log(`Found ${orders.length} custom orders:`);
      orders.forEach((order, index) => {
        console.log(`\n--- Custom Order ${index + 1} ---`);
        Object.entries(order).forEach(([key, value]) => {
          console.log(`${key}: ${value}`);
        });
      });
    } else {
      console.log('No custom orders found');
    }
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ Error checking custom orders table:', error.message);
  }
}

checkCustomOrdersTable();
