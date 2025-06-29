// Check orders table structure to fix the query
const mysql = require('mysql2/promise');

require('dotenv').config({ path: './server/.env' });

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'seven_four_clothing'
};

async function checkOrdersTable() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    
    // Get table structure
    const [columns] = await connection.execute('DESCRIBE orders');
    console.log('📋 Orders table columns:');
    columns.forEach(col => {
      console.log(`   ${col.Field}: ${col.Type}`);
    });
    
    // Get sample order data
    const [orders] = await connection.execute('SELECT * FROM orders WHERE status = "confirmed" LIMIT 1');
    if (orders.length > 0) {
      console.log('\n📊 Sample order data:');
      console.log(orders[0]);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    if (connection) await connection.end();
  }
}

checkOrdersTable();
