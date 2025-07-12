const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 's3v3n-f0ur-cl0thing*',
  database: 'seven_four_clothing'
};

async function createTestCustomOrderCancellation() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');

    // First, find a confirmed custom order
    const [customOrders] = await connection.execute(`
      SELECT id, custom_order_id, customer_name, final_price, estimated_price, product_type, product_name, size, color, user_id
      FROM custom_orders 
      WHERE status = 'confirmed'
      ORDER BY created_at DESC
      LIMIT 1
    `);

    if (customOrders.length === 0) {
      console.log('❌ No confirmed custom orders found');
      return;
    }

    const customOrder = customOrders[0];
    console.log('\n=== FOUND CUSTOM ORDER ===');
    console.log(`Order ID: ${customOrder.custom_order_id}`);
    console.log(`Customer: ${customOrder.customer_name}`);
    console.log(`Product: ${customOrder.product_type} - ${customOrder.product_name || 'Custom Design'}`);
    console.log(`Size: ${customOrder.size}, Color: ${customOrder.color}`);
    console.log(`Price: ${customOrder.final_price || customOrder.estimated_price || 0}`);

    // Check if there's already a cancellation request for this order
    const [existingRequest] = await connection.execute(`
      SELECT * FROM cancellation_requests WHERE order_number = ?
    `, [customOrder.custom_order_id]);

    if (existingRequest.length > 0) {
      console.log('\n✅ Cancellation request already exists for this order');
      console.log(`Status: ${existingRequest[0].status}`);
      console.log(`Reason: ${existingRequest[0].reason}`);
      return;
    }

    // Create a test cancellation request
    const [result] = await connection.execute(`
      INSERT INTO cancellation_requests (order_id, user_id, order_number, reason, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, 'pending', NOW(), NOW())
    `, [
      customOrder.id, // Use the custom order's ID as order_id
      customOrder.user_id || 1, // Use the user_id from custom order, or default to 1
      customOrder.custom_order_id,
      'Testing custom order cancellation - need to review design details'
    ]);

    console.log('\n✅ Created test cancellation request');
    console.log(`Request ID: ${result.insertId}`);
    
    // Now test the query again
    console.log('\n=== TESTING UPDATED QUERY WITH CUSTOM ORDER ===');
    const [requests] = await connection.execute(`
        SELECT 
            cr.*,
            o.order_number,
            -- Handle amount for both regular and custom orders
            CASE 
                WHEN cr.order_number LIKE 'CUSTOM-%' THEN
                    COALESCE(
                        (SELECT COALESCE(co.final_price, co.estimated_price, 0) 
                         FROM custom_orders co 
                         WHERE co.custom_order_id = cr.order_number),
                        0
                    )
                ELSE
                    COALESCE(o.total_amount, 0)
            END as total_amount,
            -- Add custom order details for better admin review
            CASE 
                WHEN cr.order_number LIKE 'CUSTOM-%' THEN
                    (SELECT CONCAT(
                        COALESCE(co.product_type, 'Unknown'), ' - ',
                        COALESCE(co.product_name, 'Custom Design'), ' (',
                        COALESCE(co.size, 'N/A'), ', ',
                        COALESCE(co.color, 'N/A'), ')'
                    ) FROM custom_orders co WHERE co.custom_order_id = cr.order_number)
                ELSE
                    (SELECT CONCAT(p.productname, ' (', oi.size, ')')
                     FROM order_items oi
                     LEFT JOIN products p ON oi.product_id = p.product_id
                     WHERE oi.order_id = o.id
                     LIMIT 1)
            END as product_details,
            -- Add order type indicator for frontend
            CASE 
                WHEN cr.order_number LIKE 'CUSTOM-%' THEN 'custom'
                ELSE 'regular'
            END as order_type
        FROM cancellation_requests cr
        LEFT JOIN orders o ON cr.order_id = o.id
        WHERE cr.order_number = ?
    `, [customOrder.custom_order_id]);

    if (requests.length > 0) {
      const request = requests[0];
      console.log('\n✅ Test Results:');
      console.log(`Order Number: ${request.order_number}`);
      console.log(`Order Type: ${request.order_type}`);
      console.log(`Amount: ${request.total_amount}`);
      console.log(`Product Details: ${request.product_details}`);
      console.log(`Status: ${request.status}`);
      console.log(`Reason: ${request.reason}`);
    }

    await connection.end();
  } catch (error) {
    console.error('❌ Error:', error);
    if (connection) await connection.end();
  }
}

createTestCustomOrderCancellation();
