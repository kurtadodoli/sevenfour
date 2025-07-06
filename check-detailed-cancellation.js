const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 's3v3n-f0ur-cl0thing*',
  database: 'seven_four_clothing'
};

async function checkCancellationRequests() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    console.log('Checking cancellation_requests table structure...');
    
    const [columns] = await connection.execute(`
      DESCRIBE cancellation_requests
    `);
    
    console.log('Cancellation requests columns:');
    columns.forEach(col => {
      console.log(`  ${col.Field} (${col.Type})`);
    });
    
    // Check all cancellation requests
    console.log('\nAll cancellation requests:');
    const [requests] = await connection.execute(`
      SELECT 
        cr.*,
        o.order_number,
        -- Check if there are any custom order references
        (SELECT COUNT(*) FROM custom_orders co WHERE co.custom_order_id = CAST(cr.order_id AS CHAR)) as direct_custom_match
      FROM cancellation_requests cr
      LEFT JOIN orders o ON cr.order_id = o.id
      ORDER BY cr.created_at DESC
    `);
    
    console.log(`Found ${requests.length} cancellation requests:`);
    requests.forEach(req => {
      console.log(`Request ${req.id}: Order ID ${req.order_id} -> Order Number: ${req.order_number || 'NULL'}`);
      console.log(`  Custom?: ${req.custom_order_id || 'NO'}`);
      console.log(`  Direct custom match: ${req.direct_custom_match}`);
      console.log(`  Product name: ${req.product_name || 'none'}`);
      console.log(`  Product ID: ${req.product_id || 'none'}`);
      console.log('---');
    });
    
    // Let's also check if any custom orders might have their own cancellation system
    console.log('\nChecking for any custom order with certain statuses...');
    const [customCancelled] = await connection.execute(`
      SELECT custom_order_id, status, customer_name, product_type 
      FROM custom_orders 
      WHERE status IN ('cancelled', 'rejected') OR status LIKE '%cancel%'
      LIMIT 10
    `);
    
    console.log('Custom orders with cancellation-like status:');
    customCancelled.forEach(order => {
      console.log(`${order.custom_order_id}: ${order.status} - ${order.product_type} (${order.customer_name})`);
    });
    
    await connection.end();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkCancellationRequests();
