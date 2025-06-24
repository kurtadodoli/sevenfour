// Check user authentication and test order confirmation directly
const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 's3v3n-f0ur-cl0thing*',
  database: 'seven_four_clothing',
  port: 3306
};

async function checkAuthAndOrders() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connected');

    // 1. Check what users exist and their IDs
    console.log('\n👥 CHECKING USERS:');
    const [users] = await connection.execute(`
      SELECT user_id, username, email, role, status
      FROM users 
      WHERE status = 'active'
      ORDER BY user_id DESC
      LIMIT 5
    `);
    
    console.log(`Found ${users.length} active users:`);
    users.forEach(user => {
      console.log(`  - ID: ${user.user_id}, Email: ${user.email}, Role: ${user.role}`);
    });

    // 2. Check pending orders and which users they belong to
    console.log('\n📋 CHECKING PENDING ORDERS:');
    const [orders] = await connection.execute(`
      SELECT o.id, o.order_number, o.status, o.user_id, o.total_amount,
             u.email, u.username
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.user_id
      WHERE o.status = 'pending'
      ORDER BY o.id DESC
      LIMIT 5
    `);
    
    console.log(`Found ${orders.length} pending orders:`);
    orders.forEach(order => {
      console.log(`  - Order ${order.order_number}: User ID ${order.user_id} (${order.email || 'No email'})`);
    });

    // 3. For each pending order, check if the user exists and get order items
    if (orders.length > 0) {
      const testOrder = orders[0];
      console.log(`\n🔍 DETAILED INFO FOR ORDER ${testOrder.order_number}:`);
      
      // Check order items and current inventory
      const [orderItems] = await connection.execute(`
        SELECT oi.product_id, oi.quantity, oi.product_price,
               p.productname, p.total_available_stock, p.total_reserved_stock
        FROM order_items oi
        JOIN orders o ON oi.invoice_id = o.invoice_id
        JOIN products p ON oi.product_id = p.product_id
        WHERE o.id = ?
      `, [testOrder.id]);
      
      console.log(`Order items (${orderItems.length}):`);
      orderItems.forEach(item => {
        const canFulfill = item.total_available_stock >= item.quantity;
        const status = canFulfill ? '✅' : '❌';
        console.log(`  ${status} ${item.productname}: need ${item.quantity}, available ${item.total_available_stock}`);
      });
      
      // Check if user exists
      if (testOrder.user_id) {
        const [userCheck] = await connection.execute(`
          SELECT user_id, email, status FROM users WHERE user_id = ?
        `, [testOrder.user_id]);
        
        if (userCheck.length > 0) {
          console.log(`✅ User exists: ${userCheck[0].email} (status: ${userCheck[0].status})`);
        } else {
          console.log(`❌ User ID ${testOrder.user_id} not found in users table!`);
        }
      }
    }

    // 4. Check if there are any authentication tokens
    console.log('\n🔑 CHECKING AUTHENTICATION SETUP:');
    
    // Check if there's a sessions or tokens table
    const [tables] = await connection.execute("SHOW TABLES LIKE '%session%' OR SHOW TABLES LIKE '%token%'");
    console.log(`Authentication-related tables: ${tables.length > 0 ? tables.map(t => Object.values(t)[0]).join(', ') : 'None found'}`);

    // 5. Test the exact query that confirmOrder uses
    if (orders.length > 0) {
      const testOrder = orders[0];
      console.log(`\n🧪 TESTING CONFIRMORDER QUERY FOR ORDER ${testOrder.id}:`);
      
      try {
        const [testResult] = await connection.execute(`
          SELECT oi.product_id, oi.quantity, p.productname, p.total_available_stock
          FROM order_items oi
          JOIN orders o ON oi.invoice_id = o.invoice_id
          JOIN products p ON oi.product_id = p.product_id
          WHERE o.id = ? AND o.user_id = ?
        `, [testOrder.id, testOrder.user_id]);
        
        console.log(`✅ Query successful: found ${testResult.length} items`);
        if (testResult.length === 0) {
          console.log('⚠️  This might be why confirmOrder fails - no items found with this query!');
        }
        
      } catch (error) {
        console.log(`❌ Query failed: ${error.message}`);
      }
    }

    console.log('\n📝 TROUBLESHOOTING SUMMARY:');
    console.log('='*50);
    console.log('To test order confirmation:');
    console.log('1. Make sure you are logged in with a valid user');
    console.log('2. Try confirming an order that belongs to your user ID');
    console.log('3. Check browser console for any authentication errors');
    console.log('4. Check server terminal for detailed confirmation logs');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkAuthAndOrders();
