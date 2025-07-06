const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 's3v3n-f0ur-cl0thing*',
  database: 'seven_four_clothing'
};

async function fixFinalPrice() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected to database successfully');

    const orderId = 'CUSTOM-MCNQQ7NW-GQEOI';
    
    // First, check the current state
    console.log('\n=== BEFORE FIX ===');
    const [beforeOrders] = await connection.execute(
      'SELECT custom_order_id, estimated_price, final_price, payment_status, status FROM custom_orders WHERE custom_order_id = ?',
      [orderId]
    );
    console.log('Current order state:', JSON.stringify(beforeOrders[0], null, 2));

    // Fix the final_price for verified custom orders where final_price is 0
    console.log('\n=== FIXING FINAL PRICE ===');
    const [updateResult] = await connection.execute(`
      UPDATE custom_orders 
      SET final_price = estimated_price 
      WHERE custom_order_id = ? 
        AND payment_status = 'verified' 
        AND final_price = 0.00
    `, [orderId]);
    
    console.log('Update result:', updateResult);
    console.log(`Rows affected: ${updateResult.affectedRows}`);

    // Check the state after fix
    console.log('\n=== AFTER FIX ===');
    const [afterOrders] = await connection.execute(
      'SELECT custom_order_id, estimated_price, final_price, payment_status, status FROM custom_orders WHERE custom_order_id = ?',
      [orderId]
    );
    console.log('Fixed order state:', JSON.stringify(afterOrders[0], null, 2));

    // Also fix any other custom orders with the same issue
    console.log('\n=== FIXING ALL SIMILAR ORDERS ===');
    const [allUpdateResult] = await connection.execute(`
      UPDATE custom_orders 
      SET final_price = estimated_price 
      WHERE payment_status = 'verified' 
        AND final_price = 0.00
        AND estimated_price > 0
    `);
    
    console.log(`Fixed ${allUpdateResult.affectedRows} custom orders with missing final_price`);

    // Show all orders that were fixed
    const [fixedOrders] = await connection.execute(`
      SELECT custom_order_id, estimated_price, final_price, payment_status, status, customer_name
      FROM custom_orders 
      WHERE payment_status = 'verified' 
        AND final_price > 0
        AND estimated_price = final_price
      ORDER BY updated_at DESC
      LIMIT 10
    `);
    
    console.log('\n=== RECENTLY FIXED ORDERS ===');
    fixedOrders.forEach(order => {
      console.log(`${order.custom_order_id}: ₱${order.estimated_price} -> ₱${order.final_price} (${order.customer_name})`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

fixFinalPrice();
