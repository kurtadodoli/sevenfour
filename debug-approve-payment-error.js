const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 's3v3n-f0ur-cl0thing*',
  database: 'seven_four_clothing'
};

async function debugApprovePaymentError() {
  try {
    console.log('🔍 Debugging Approve Payment Error...');
    console.log('=' .repeat(60));
    
    const connection = await mysql.createConnection(dbConfig);
    
    // Check if the problematic order exists
    const orderNumber = 'ORD17518584735203314';
    console.log('\n📋 Checking order:', orderNumber);
    
    const [orders] = await connection.execute(`
      SELECT 
        id,
        order_number,
        status,
        payment_status,
        user_id,
        total_amount,
        created_at
      FROM orders 
      WHERE order_number = ?
    `, [orderNumber]);
    
    if (orders.length > 0) {
      console.log('✅ Order found:');
      console.table(orders);
      
      const order = orders[0];
      
      // Check if order has items
      console.log('\n📦 Checking order items:');
      const [items] = await connection.execute(`
        SELECT 
          oi.*,
          p.productname
        FROM order_items oi
        LEFT JOIN products p ON oi.product_id = p.product_id
        WHERE oi.order_id = ?
      `, [order.id]);
      
      if (items.length > 0) {
        console.log('✅ Order items found:');
        console.table(items);
      } else {
        console.log('❌ No order items found for this order');
      }
      
      // Check transaction record
      console.log('\n💳 Checking transaction record:');
      const [transactions] = await connection.execute(`
        SELECT *
        FROM sales_transactions
        WHERE transaction_id = (SELECT transaction_id FROM orders WHERE id = ?)
      `, [order.id]);
      
      if (transactions.length > 0) {
        console.log('✅ Transaction found:');
        console.table(transactions);
      } else {
        console.log('❌ No transaction record found');
      }
      
      // Check invoice record
      console.log('\n📄 Checking invoice record:');
      const [invoices] = await connection.execute(`
        SELECT *
        FROM order_invoices
        WHERE invoice_id = (SELECT invoice_id FROM orders WHERE id = ?)
      `, [order.id]);
      
      if (invoices.length > 0) {
        console.log('✅ Invoice found:');
        console.table(invoices);
      } else {
        console.log('❌ No invoice record found');
      }
      
    } else {
      console.log('❌ Order not found with order number:', orderNumber);
      
      // Check if there are any similar orders
      console.log('\n🔍 Checking for similar order numbers:');
      const [similarOrders] = await connection.execute(`
        SELECT id, order_number, status, created_at
        FROM orders 
        WHERE order_number LIKE ?
        ORDER BY created_at DESC
        LIMIT 5
      `, [`%${orderNumber.substring(3, 10)}%`]);
      
      if (similarOrders.length > 0) {
        console.log('📋 Found similar orders:');
        console.table(similarOrders);
      }
    }
    
    // Check recent pending orders
    console.log('\n📋 Recent pending orders:');
    const [pendingOrders] = await connection.execute(`
      SELECT 
        id,
        order_number,
        status,
        payment_status,
        total_amount,
        created_at
      FROM orders 
      WHERE status = 'pending'
      ORDER BY created_at DESC
      LIMIT 10
    `);
    
    if (pendingOrders.length > 0) {
      console.log('✅ Found pending orders:');
      console.table(pendingOrders);
    } else {
      console.log('❌ No pending orders found');
    }
    
    await connection.end();
    
    console.log('\n🔧 POTENTIAL ISSUES:');
    console.log('1. Order might not exist in database');
    console.log('2. Order might not be in "pending" status');
    console.log('3. Database connection might be failing');
    console.log('4. Missing required database tables or columns');
    console.log('5. Order might be missing required related records (items, transaction, invoice)');
    
    console.log('\n🛠️ RECOMMENDED FIXES:');
    console.log('1. Check if order exists and is in pending status');
    console.log('2. Verify all required database tables exist');
    console.log('3. Check backend console logs for SQL errors');
    console.log('4. Ensure order has associated items and transaction records');
    
  } catch (error) {
    console.error('❌ Error debugging approve payment:', error.message);
    console.error('Full error:', error);
  }
}

debugApprovePaymentError();
