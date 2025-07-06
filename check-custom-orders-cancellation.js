const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 's3v3n-f0ur-cl0thing*',
  database: 'seven_four_clothing'
};

async function checkCustomOrdersTables() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    console.log('Checking for custom orders tables...');
    
    const [tables] = await connection.execute(`
      SHOW TABLES LIKE '%custom%'
    `);
    
    console.log('Custom-related tables:');
    tables.forEach(table => {
      console.log(`  ${Object.values(table)[0]}`);
    });
    
    // Check custom_orders table
    console.log('\nChecking custom_orders table structure...');
    const [customOrderCols] = await connection.execute(`
      DESCRIBE custom_orders
    `);
    
    console.log('Custom orders columns:');
    customOrderCols.forEach(col => {
      console.log(`  ${col.Field} (${col.Type})`);
    });
    
    // Check sample custom orders
    console.log('\nSample custom orders:');
    const [customOrders] = await connection.execute(`
      SELECT * FROM custom_orders LIMIT 5
    `);
    
    customOrders.forEach(order => {
      console.log(`Custom Order ID: ${order.custom_order_id}, Status: ${order.status}`);
    });
    
    // Check if there's a relationship between custom orders and cancellation requests
    console.log('\nChecking cancellation requests...');
    const [requests] = await connection.execute(`
      SELECT 
        cr.id as request_id,
        cr.order_id,
        o.order_number,
        cr.status,
        -- Check if this order_id might be linked to custom orders
        (SELECT COUNT(*) FROM custom_orders co WHERE co.custom_order_id = o.order_number) as is_custom_order,
        (SELECT co.product_type FROM custom_orders co WHERE co.custom_order_id = o.order_number LIMIT 1) as custom_product_type
      FROM cancellation_requests cr
      LEFT JOIN orders o ON cr.order_id = o.id
      LIMIT 10
    `);
    
    console.log('Cancellation requests:');
    requests.forEach(req => {
      console.log(`Request ${req.request_id}: Order ${req.order_number}`);
      console.log(`  Is custom order: ${req.is_custom_order > 0 ? 'YES' : 'NO'}`);
      console.log(`  Product type: ${req.custom_product_type || 'none'}`);
      console.log('---');
    });
    
    await connection.end();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkCustomOrdersTables();
