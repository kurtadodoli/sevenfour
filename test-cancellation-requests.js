const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'sfc_database'
};

async function testCancellationRequests() {
  const connection = await mysql.createConnection(dbConfig);
  
  console.log('Testing cancellation requests with order items...');
  
  const [requests] = await connection.execute(`
    SELECT 
      cr.*,
      u.first_name as customer_first_name,
      u.last_name as customer_last_name,
      u.email as customer_email,
      o.total_amount as order_total,
      o.status as order_status
    FROM cancellation_requests cr
    JOIN users u ON cr.user_id = u.user_id
    JOIN orders o ON cr.order_id = o.id
    ORDER BY cr.created_at DESC
    LIMIT 2
  `);
  
  console.log('Cancellation requests found:', requests.length);
  
  for (let i = 0; i < requests.length; i++) {
    const request = requests[i];
    console.log(`\n--- Request ${i + 1} ---`);
    console.log('Order ID:', request.order_id);
    console.log('Order Number:', request.order_number);
    
    // Get order items for this request
    const [orderItems] = await connection.execute(`
      SELECT 
        oi.product_id,
        oi.product_name,
        oi.quantity,
        oi.color,
        oi.size,
        oi.product_price,
        oi.subtotal,
        p.productname,
        p.productimage,
        p.productdescription
      FROM order_items oi
      JOIN orders o ON oi.invoice_id = o.invoice_id
      LEFT JOIN products p ON oi.product_id = p.product_id
      WHERE o.id = ?
    `, [request.order_id]);
    
    console.log('Order items found:', orderItems.length);
    if (orderItems.length > 0) {
      orderItems.forEach((item, idx) => {
        console.log(`  Item ${idx + 1}:`, {
          product_name: item.product_name,
          productname: item.productname,
          quantity: item.quantity,
          size: item.size,
          color: item.color,
          price: item.product_price,
          image: item.productimage
        });
      });
    }
  }
  
  await connection.end();
}

testCancellationRequests().catch(console.error);
