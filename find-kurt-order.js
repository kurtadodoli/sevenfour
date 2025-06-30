const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 's3v3n-f0ur-cl0thing*',
  database: 'seven_four_clothing'
};

async function findKurtOrder() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');

    const orderNumber = 'ORD17508699018537684';
    const customerName = 'kurt';
    const orderAmount = 1500;

    console.log(`🔍 Searching for order ${orderNumber} and customer ${customerName}...`);
    
    // 1. Check orders table with correct columns
    console.log('\n1️⃣ Checking orders table...');
    const [regularOrders] = await connection.execute(`
      SELECT o.id, o.order_number, o.total_amount, o.status, o.created_at, o.user_id,
             u.first_name, u.last_name, u.email
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.user_id
      WHERE o.order_number = ? OR o.total_amount = ?
    `, [orderNumber, orderAmount]);

    if (regularOrders.length > 0) {
      console.log('📋 Found orders with matching criteria:');
      regularOrders.forEach(order => {
        console.log(`  - ID: ${order.id}`);
        console.log(`  - Order Number: ${order.order_number}`);
        console.log(`  - Customer: ${order.first_name} ${order.last_name} (${order.email})`);
        console.log(`  - Amount: ₱${order.total_amount}`);
        console.log(`  - Status: ${order.status}`);
        console.log(`  - Date: ${order.created_at}`);
        console.log('  ---');
      });
    } else {
      console.log('❌ No matching orders found in orders table');
    }

    // 2. Search for orders by customer name in users table
    console.log('\n2️⃣ Searching for orders by customer "kurt"...');
    const [kurtOrders] = await connection.execute(`
      SELECT o.id, o.order_number, o.total_amount, o.status, o.created_at,
             u.first_name, u.last_name, u.email
      FROM orders o
      JOIN users u ON o.user_id = u.user_id
      WHERE u.first_name LIKE '%kurt%' OR u.last_name LIKE '%kurt%' OR u.email LIKE '%kurt%'
      ORDER BY o.created_at DESC
    `);

    if (kurtOrders.length > 0) {
      console.log('📋 Found orders for kurt in orders table:');
      kurtOrders.forEach(order => {
        console.log(`  - ID: ${order.id}`);
        console.log(`  - Order Number: ${order.order_number}`);
        console.log(`  - Customer: ${order.first_name} ${order.last_name} (${order.email})`);
        console.log(`  - Amount: ₱${order.total_amount}`);
        console.log(`  - Status: ${order.status}`);
        console.log(`  - Date: ${order.created_at}`);
        console.log('  ---');
      });
    }

    // 3. Check custom_orders table for kurt
    console.log('\n3️⃣ Checking custom_orders table for kurt...');
    const [kurtCustomOrders] = await connection.execute(`
      SELECT id, custom_order_id, customer_name, customer_email, estimated_price, final_price, status, created_at 
      FROM custom_orders 
      WHERE customer_name LIKE '%kurt%' OR customer_email LIKE '%kurt%'
      ORDER BY created_at DESC
    `);

    if (kurtCustomOrders.length > 0) {
      console.log('📋 Found custom orders for kurt:');
      kurtCustomOrders.forEach(order => {
        console.log(`  - ID: ${order.id}`);
        console.log(`  - Custom Order ID: ${order.custom_order_id}`);
        console.log(`  - Customer: ${order.customer_name} (${order.customer_email})`);
        console.log(`  - Estimated Price: ₱${order.estimated_price}`);
        console.log(`  - Final Price: ₱${order.final_price || 'N/A'}`);
        console.log(`  - Status: ${order.status}`);
        console.log(`  - Date: ${order.created_at}`);
        console.log('  ---');
      });
      
      console.log('\n🗑️ CUSTOM ORDER REMOVAL OPTIONS:');
      console.log('If you want to remove any of the custom orders above, I can help.');
      console.log('Please tell me the ID number of the custom order you want to remove.');
      
    } else {
      console.log('❌ No custom orders found for kurt');
    }

    // 4. Search for the specific order number pattern
    console.log('\n4️⃣ Searching for order number ORD17508699018537684...');
    const [specificOrder] = await connection.execute(`
      SELECT o.id, o.order_number, o.total_amount, o.status, o.created_at,
             u.first_name, u.last_name, u.email
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.user_id
      WHERE o.order_number = ?
    `, [orderNumber]);

    if (specificOrder.length > 0) {
      console.log('📋 Found the specific order:');
      specificOrder.forEach(order => {
        console.log(`  - ID: ${order.id}`);
        console.log(`  - Order Number: ${order.order_number}`);
        console.log(`  - Customer: ${order.first_name} ${order.last_name} (${order.email})`);
        console.log(`  - Amount: ₱${order.total_amount}`);
        console.log(`  - Status: ${order.status}`);
        console.log(`  - Date: ${order.created_at}`);
        
        if (order.order_number.startsWith('ORD')) {
          console.log('\n✅ This is a REGULAR ORDER (not a custom order)');
          console.log('❌ This order should NOT be in the custom_orders table');
          console.log('💡 If it appears in custom orders, it was added incorrectly');
        }
      });
    } else {
      console.log('❌ Order ORD17508699018537684 not found in orders table');
    }

    console.log('\n💡 SUMMARY:');
    console.log('- Order ORD17508699018537684 is a regular order format (ORD prefix)');
    console.log('- Regular orders belong in the "orders" table, not "custom_orders" table');
    console.log('- Custom orders have format like "CUSTOM-XXXXX-XXXXX"');
    console.log('\nIf you see this order in the custom orders list, please specify:');
    console.log('1. The exact ID of the entry to remove from custom_orders table');
    console.log('2. Or confirm which of the kurt custom orders above you want to remove');

  } catch (error) {
    console.error('❌ Database error:', error.message);
    console.error('Full error:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

findKurtOrder();
