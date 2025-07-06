const mysql = require('mysql2/promise');

async function checkCustomOrderFields() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 's3v3n-f0ur-cl0thing*',
      database: 'seven_four_clothing'
    });

    console.log('📊 Checking custom orders table structure...');
    const [columns] = await connection.execute('DESCRIBE custom_orders');
    console.log('Custom Orders columns:');
    columns.forEach(col => console.log(`  ${col.Field} (${col.Type})`));

    console.log('\n📊 Sample custom order data with delivery info...');
    const [sampleData] = await connection.execute(`
      SELECT 
        custom_order_id,
        customer_name,
        status,
        estimated_delivery_date,
        actual_delivery_date,
        delivery_status,
        delivery_notes,
        created_at
      FROM custom_orders 
      WHERE status IN ('approved', 'confirmed')
      ORDER BY created_at DESC 
      LIMIT 5
    `);
    
    sampleData.forEach(order => {
      console.log(`Order: ${order.custom_order_id} - ${order.customer_name}`);
      console.log(`  Status: ${order.status}`);
      console.log(`  Estimated Delivery: ${order.estimated_delivery_date || 'Not scheduled'}`);
      console.log(`  Actual Delivery: ${order.actual_delivery_date || 'Not delivered'}`);
      console.log(`  Delivery Status: ${order.delivery_status || 'Not set'}`);
      console.log(`  Delivery Notes: ${order.delivery_notes || 'None'}`);
      console.log('');
    });

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    if (connection) await connection.end();
  }
}

checkCustomOrderFields();
