const mysql = require('mysql2/promise');
require('dotenv').config({ path: './server/.env' });

async function simpleCheck() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log('✅ Connected to database');

    // Check custom_designs table
    const [orders] = await connection.execute(`
      SELECT COUNT(*) as total_orders, 
             COUNT(CASE WHEN email IS NOT NULL THEN 1 END) as orders_with_email
      FROM custom_designs
    `);
    
    console.log(`📊 Total orders: ${orders[0].total_orders}, Orders with email: ${orders[0].orders_with_email}`);

    // Check specific user orders
    const [userOrders] = await connection.execute(`
      SELECT email, first_name, last_name, product_name, status 
      FROM custom_designs 
      WHERE email IS NOT NULL 
      LIMIT 3
    `);
    
    console.log('👥 Sample user orders:');
    userOrders.forEach((order, i) => {
      console.log(`  ${i+1}. ${order.first_name} ${order.last_name} (${order.email}) - ${order.product_name} [${order.status}]`);
    });

    await connection.end();
    console.log('✅ Test completed successfully');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

simpleCheck();
