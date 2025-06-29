// Check existing orders to find a valid order_id for testing
const mysql = require('mysql2/promise');

async function checkExistingOrders() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 's3v3n-f0ur-cl0thing*',
      database: 'seven_four_clothing'
    });

    console.log('📊 Checking existing orders...');
    
    // Check regular orders
    const [orders] = await connection.execute(`
      SELECT id, order_number, customerName, total_amount, created_at 
      FROM orders 
      ORDER BY created_at DESC 
      LIMIT 5
    `);
    
    console.log(`\n📦 Regular orders (${orders.length} found):`);
    orders.forEach(order => {
      console.log(`  - ID: ${order.id}, Number: ${order.order_number}, Customer: ${order.customerName}`);
    });

    // Check custom orders
    const [customOrders] = await connection.execute(`
      SELECT id, custom_order_id, customer_name, created_at 
      FROM custom_orders 
      ORDER BY created_at DESC 
      LIMIT 5
    `);
    
    console.log(`\n🎨 Custom orders (${customOrders.length} found):`);
    customOrders.forEach(order => {
      console.log(`  - ID: ${order.id}, Number: ${order.custom_order_id}, Customer: ${order.customer_name}`);
    });

    // Check custom designs
    const [customDesigns] = await connection.execute(`
      SELECT id, design_id, customer_name, created_at 
      FROM custom_designs 
      ORDER BY created_at DESC 
      LIMIT 5
    `);
    
    console.log(`\n🎨 Custom designs (${customDesigns.length} found):`);
    customDesigns.forEach(design => {
      console.log(`  - ID: ${design.id}, Number: ${design.design_id}, Customer: ${design.customer_name}`);
    });

    await connection.end();

    // Return a valid order for testing
    if (orders.length > 0) {
      console.log('\n💡 Suggested test data:');
      console.log(`   order_id: ${orders[0].id}`);
      console.log(`   order_type: 'regular'`);
    } else if (customOrders.length > 0) {
      console.log('\n💡 Suggested test data:');
      console.log(`   order_id: ${customOrders[0].id}`);
      console.log(`   order_type: 'custom_order'`);
    }

  } catch (error) {
    console.error('❌ Database check failed:', error.message);
  }
}

checkExistingOrders();
