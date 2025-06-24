const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 's3v3n-f0ur-cl0thing*',
  database: 'seven_four_clothing',
  port: 3306
};

async function checkOrderTableStructure() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('🔍 CHECKING ORDER TABLE STRUCTURE\n');
    
    // Check orders table structure
    console.log('1️⃣ Orders table structure:');
    const [orderColumns] = await connection.execute("DESCRIBE orders");
    console.log('📋 Orders table fields:');
    orderColumns.forEach(col => {
      console.log(`   ${col.Field}: ${col.Type} (${col.Null === 'YES' ? 'NULL' : 'NOT NULL'})`);
    });
    
    // Check order_items table structure
    console.log('\n2️⃣ Order_items table structure:');
    const [itemColumns] = await connection.execute("DESCRIBE order_items");
    console.log('📋 Order_items table fields:');
    itemColumns.forEach(col => {
      console.log(`   ${col.Field}: ${col.Type} (${col.Null === 'YES' ? 'NULL' : 'NOT NULL'})`);
    });
    
    // Get a sample order to see the actual structure
    console.log('\n3️⃣ Sample order data:');
    const [sampleOrders] = await connection.execute(`
      SELECT * FROM orders LIMIT 1
    `);
    
    if (sampleOrders.length > 0) {
      console.log('📋 Sample order fields:');
      Object.keys(sampleOrders[0]).forEach(key => {
        console.log(`   ${key}: ${sampleOrders[0][key]}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

checkOrderTableStructure();
