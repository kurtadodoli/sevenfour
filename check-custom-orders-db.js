const mysql = require('mysql2/promise');

async function checkDatabase() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'seven_four_clothing'
    });
    
    console.log('=== CHECKING CUSTOM ORDERS DATABASE STRUCTURE ===\n');
    
    // Check if custom_orders table exists
    console.log('1. Checking custom_orders table...');
    try {
      const [ordersCols] = await connection.execute('DESCRIBE custom_orders');
      console.log('✅ custom_orders table exists with columns:');
      ordersCols.forEach(col => {
        console.log(`   ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(nullable)' : '(required)'}`);
      });
    } catch (error) {
      console.log('❌ custom_orders table does not exist');
      console.log('Error:', error.message);
    }
    
    console.log('\n2. Checking custom_order_images table...');
    try {
      const [imagesCols] = await connection.execute('DESCRIBE custom_order_images');
      console.log('✅ custom_order_images table exists with columns:');
      imagesCols.forEach(col => {
        console.log(`   ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(nullable)' : '(required)'}`);
      });
    } catch (error) {
      console.log('❌ custom_order_images table does not exist');
      console.log('Error:', error.message);
    }
    
    console.log('\n3. Checking sample data...');
    try {
      const [orders] = await connection.execute('SELECT COUNT(*) as count FROM custom_orders');
      const [images] = await connection.execute('SELECT COUNT(*) as count FROM custom_order_images');
      console.log(`✅ Found ${orders[0].count} custom orders and ${images[0].count} images in database`);
    } catch (error) {
      console.log('❌ Error counting records:', error.message);
    }
    
    await connection.end();
    console.log('\n=== DATABASE CHECK COMPLETE ===');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('\nMake sure MySQL is running and the database exists.');
  }
}

checkDatabase();
