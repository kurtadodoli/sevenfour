const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 's3v3n-f0ur-cl0thing*',
  database: 'seven_four_clothing'
};

async function findOrderLocation() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');

    const orderNumber = 'ORD17508699018537684';
    const customerName = 'kurt';
    const orderAmount = 1500;

    console.log(`🔍 Searching for order ${orderNumber} across all tables...`);
    
    // Check orders table (regular orders)
    console.log('\n1️⃣ Checking orders table...');
    const [regularOrders] = await connection.execute(`
      SELECT id, order_number, total_amount, customer_name, first_name, last_name, status, created_at 
      FROM orders 
      WHERE order_number = ? OR (first_name = ? OR last_name = ? OR customer_name = ?) AND total_amount = ?
    `, [orderNumber, customerName, customerName, customerName, orderAmount]);

    if (regularOrders.length > 0) {
      console.log('📋 Found in orders table:');
      regularOrders.forEach(order => {
        console.log(`  - ID: ${order.id}, Order: ${order.order_number}, Customer: ${order.customer_name || order.first_name + ' ' + order.last_name}, Amount: ₱${order.total_amount}, Status: ${order.status}`);
      });
    } else {
      console.log('❌ Not found in orders table');
    }

    // Check custom_orders table again with different criteria
    console.log('\n2️⃣ Checking custom_orders table...');
    const [customOrders] = await connection.execute(`
      SELECT id, custom_order_id, customer_name, estimated_price, final_price, status, created_at 
      FROM custom_orders 
      WHERE customer_name = ? AND (estimated_price = ? OR final_price = ?)
    `, [customerName, orderAmount, orderAmount]);

    if (customOrders.length > 0) {
      console.log('📋 Found in custom_orders table:');
      customOrders.forEach(order => {
        console.log(`  - ID: ${order.id}, Order: ${order.custom_order_id}, Customer: ${order.customer_name}, Estimated: ₱${order.estimated_price}, Final: ₱${order.final_price}, Status: ${order.status}`);
      });
    } else {
      console.log('❌ Not found in custom_orders table with matching price');
    }

    // Check delivery_schedules tables
    console.log('\n3️⃣ Checking delivery_schedules_enhanced table...');
    const [deliverySchedules] = await connection.execute(`
      SELECT id, order_id, order_number, customer_name, order_type, delivery_status 
      FROM delivery_schedules_enhanced 
      WHERE order_number = ? OR customer_name = ?
    `, [orderNumber, customerName]);

    if (deliverySchedules.length > 0) {
      console.log('📋 Found in delivery_schedules_enhanced table:');
      deliverySchedules.forEach(schedule => {
        console.log(`  - ID: ${schedule.id}, Order ID: ${schedule.order_id}, Order Number: ${schedule.order_number}, Customer: ${schedule.customer_name}, Type: ${schedule.order_type}, Status: ${schedule.delivery_status}`);
      });
    } else {
      console.log('❌ Not found in delivery_schedules_enhanced table');
    }

    // Check for any order with the specific order number pattern
    console.log('\n4️⃣ Searching for order number pattern...');
    const orderNumberSearch = orderNumber.slice(-10); // Last 10 digits
    
    // Check if it's stored as a regular order but displayed differently
    const [patternOrders] = await connection.execute(`
      SELECT 'orders' as table_name, id, order_number, total_amount, first_name, last_name, status 
      FROM orders 
      WHERE order_number LIKE '%${orderNumberSearch}%' OR id = '${orderNumber}' OR order_number = '${orderNumber}'
      UNION ALL
      SELECT 'custom_orders' as table_name, id, custom_order_id as order_number, estimated_price as total_amount, customer_name as first_name, '' as last_name, status 
      FROM custom_orders 
      WHERE custom_order_id LIKE '%${orderNumberSearch}%' OR id = '${orderNumber}' OR custom_order_id = '${orderNumber}'
    `);

    if (patternOrders.length > 0) {
      console.log('📋 Found orders with similar patterns:');
      patternOrders.forEach(order => {
        console.log(`  - Table: ${order.table_name}, ID: ${order.id}, Order: ${order.order_number}, Amount: ₱${order.total_amount}, Customer: ${order.first_name} ${order.last_name}, Status: ${order.status}`);
      });
    }

    // Show all orders for customer kurt with any price
    console.log('\n5️⃣ All orders for customer "kurt":');
    const [allKurtOrders] = await connection.execute(`
      SELECT 'orders' as table_name, id, order_number, total_amount, first_name, last_name, status, created_at
      FROM orders 
      WHERE first_name = ? OR last_name = ? OR customer_name = ?
      UNION ALL
      SELECT 'custom_orders' as table_name, id, custom_order_id as order_number, estimated_price as total_amount, customer_name as first_name, '' as last_name, status, created_at
      FROM custom_orders 
      WHERE customer_name = ?
      ORDER BY created_at DESC
    `, [customerName, customerName, customerName, customerName]);

    if (allKurtOrders.length > 0) {
      console.log('📋 All orders for kurt:');
      allKurtOrders.forEach(order => {
        console.log(`  - Table: ${order.table_name}, ID: ${order.id}, Order: ${order.order_number}, Amount: ₱${order.total_amount}, Customer: ${order.first_name} ${order.last_name}, Status: ${order.status}, Date: ${order.created_at}`);
      });
    }

    console.log('\n💡 RECOMMENDATIONS:');
    console.log('1. If you can provide the exact database ID or more details, I can remove the specific order');
    console.log('2. The order might be in the regular orders table, not custom_orders');
    console.log('3. Please confirm which of the above orders you want to remove');

  } catch (error) {
    console.error('❌ Database error:', error.message);
    console.error('Full error:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

findOrderLocation();
