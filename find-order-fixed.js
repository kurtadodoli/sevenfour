const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 's3v3n-f0ur-cl0thing*',
  database: 'seven_four_clothing'
};

async function findOrderLocationFixed() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');

    // First, check the structure of the orders table
    console.log('🔍 Checking orders table structure...');
    const [orderColumns] = await connection.execute(`SHOW COLUMNS FROM orders`);
    console.log('📋 Orders table columns:');
    orderColumns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type}`);
    });

    const orderNumber = 'ORD17508699018537684';
    const customerName = 'kurt';
    const orderAmount = 1500;

    console.log(`\n🔍 Searching for order ${orderNumber} across all tables...`);
    
    // Check orders table (regular orders) with correct column names
    console.log('\n1️⃣ Checking orders table...');
    const [regularOrders] = await connection.execute(`
      SELECT id, order_number, total_amount, first_name, last_name, status, created_at 
      FROM orders 
      WHERE order_number = ? OR (first_name = ? OR last_name = ?) AND total_amount = ?
    `, [orderNumber, customerName, customerName, orderAmount]);

    if (regularOrders.length > 0) {
      console.log('📋 Found in orders table:');
      regularOrders.forEach(order => {
        console.log(`  - ID: ${order.id}, Order: ${order.order_number}, Customer: ${order.first_name} ${order.last_name}, Amount: ₱${order.total_amount}, Status: ${order.status}`);
      });
    } else {
      console.log('❌ Not found in orders table');
    }

    // Check all orders for customer kurt in orders table
    console.log('\n2️⃣ All orders for "kurt" in orders table...');
    const [kurtRegularOrders] = await connection.execute(`
      SELECT id, order_number, total_amount, first_name, last_name, status, created_at 
      FROM orders 
      WHERE first_name LIKE '%kurt%' OR last_name LIKE '%kurt%'
      ORDER BY created_at DESC
    `);

    if (kurtRegularOrders.length > 0) {
      console.log('📋 Found kurt orders in orders table:');
      kurtRegularOrders.forEach(order => {
        console.log(`  - ID: ${order.id}, Order: ${order.order_number}, Customer: ${order.first_name} ${order.last_name}, Amount: ₱${order.total_amount}, Status: ${order.status}, Date: ${order.created_at}`);
      });
    } else {
      console.log('❌ No orders for kurt found in orders table');
    }

    // Check custom_orders table
    console.log('\n3️⃣ All orders for "kurt" in custom_orders table...');
    const [kurtCustomOrders] = await connection.execute(`
      SELECT id, custom_order_id, customer_name, estimated_price, final_price, status, created_at 
      FROM custom_orders 
      WHERE customer_name LIKE '%kurt%'
      ORDER BY created_at DESC
    `);

    if (kurtCustomOrders.length > 0) {
      console.log('📋 Found kurt orders in custom_orders table:');
      kurtCustomOrders.forEach(order => {
        console.log(`  - ID: ${order.id}, Order: ${order.custom_order_id}, Customer: ${order.customer_name}, Estimated: ₱${order.estimated_price}, Final: ₱${order.final_price}, Status: ${order.status}, Date: ${order.created_at}`);
      });
      
      // If user wants to remove any of these custom orders
      console.log('\n❓ Which of these custom orders do you want to remove?');
      console.log('💡 Please specify the ID or custom_order_id of the order to remove');
      
    } else {
      console.log('❌ No custom orders for kurt found');
    }

    // Search for the specific order number pattern anywhere
    console.log('\n4️⃣ Searching for specific order number pattern...');
    const searchPattern = orderNumber.slice(-8); // Last 8 digits
    
    const [patternSearch] = await connection.execute(`
      SELECT id, order_number, total_amount, first_name, last_name, status 
      FROM orders 
      WHERE order_number LIKE '%${searchPattern}%' OR id = '${orderNumber}'
    `);

    if (patternSearch.length > 0) {
      console.log('📋 Found orders with similar number patterns:');
      patternSearch.forEach(order => {
        console.log(`  - ID: ${order.id}, Order: ${order.order_number}, Customer: ${order.first_name} ${order.last_name}, Amount: ₱${order.total_amount}, Status: ${order.status}`);
      });
    }

    console.log('\n💡 NEXT STEPS:');
    console.log('Based on the results above, please tell me:');
    console.log('1. Which specific order ID you want to remove');
    console.log('2. From which table (orders or custom_orders)');
    console.log('3. Or provide more details about the order you want to remove');

  } catch (error) {
    console.error('❌ Database error:', error.message);
    console.error('Full error:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

findOrderLocationFixed();
