const mysql = require('mysql2/promise');

console.log('🧪 Testing TransactionPage History Functionality');
console.log('===============================================');

async function testTransactionPageHistory() {
  let connection;
  
  try {
    // Create database connection
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 's3v3n-f0ur-cl0thing*',
      database: 'seven_four_clothing'
    });

    console.log('✅ Database connected');

    // Test 1: Check custom orders with different statuses
    console.log('\n📊 Test 1: Custom Orders Status Distribution');
    const customOrdersQuery = `
      SELECT 
        status,
        COUNT(*) as count
      FROM custom_orders 
      GROUP BY status
      ORDER BY count DESC
    `;
    
    const [customOrdersResult] = await connection.execute(customOrdersQuery);
    console.log('Custom Orders by Status:');
    customOrdersResult.forEach(row => {
      console.log(`  ${row.status}: ${row.count} orders`);
    });

    // Test 2: Check custom orders with payment statuses
    console.log('\n💳 Test 2: Custom Orders Payment Status Distribution');
    const paymentStatusQuery = `
      SELECT 
        co.status as order_status,
        cop.payment_status,
        COUNT(*) as count
      FROM custom_orders co
      LEFT JOIN custom_order_payments cop ON co.custom_order_id = cop.custom_order_id
      GROUP BY co.status, cop.payment_status
      ORDER BY co.status, cop.payment_status
    `;
    
    const [paymentStatusResult] = await connection.execute(paymentStatusQuery);
    console.log('Custom Orders Payment Status:');
    paymentStatusResult.forEach(row => {
      console.log(`  Order: ${row.order_status} | Payment: ${row.payment_status || 'No Payment'} | Count: ${row.count}`);
    });

    // Test 3: Check regular orders with payment statuses
    console.log('\n🛒 Test 3: Regular Orders Payment Status Distribution');
    const regularOrdersQuery = `
      SELECT 
        status,
        payment_status,
        COUNT(*) as count
      FROM orders
      WHERE status IN ('confirmed', 'Order Received', 'processing', 'shipped', 'delivered')
      GROUP BY status, payment_status
      ORDER BY status, payment_status
    `;
    
    const [regularOrdersResult] = await connection.execute(regularOrdersQuery);
    console.log('Regular Orders Payment Status:');
    regularOrdersResult.forEach(row => {
      console.log(`  Status: ${row.status} | Payment: ${row.payment_status || 'No Payment'} | Count: ${row.count}`);
    });

    // Test 4: Sample data for TransactionPage tabs
    console.log('\n📋 Test 4: Sample Data for TransactionPage Tabs');
    
    // Get sample approved custom orders
    const approvedCustomQuery = `
      SELECT custom_order_id, customer_name, status, created_at, estimated_price
      FROM custom_orders 
      WHERE status = 'approved'
      ORDER BY created_at DESC 
      LIMIT 3
    `;
    const [approvedCustom] = await connection.execute(approvedCustomQuery);
    console.log('Sample Approved Custom Orders:');
    approvedCustom.forEach(order => {
      console.log(`  ${order.custom_order_id} - ${order.customer_name} - ₱${order.estimated_price} (${order.created_at})`);
    });

    // Get sample rejected custom orders
    const rejectedCustomQuery = `
      SELECT custom_order_id, customer_name, status, created_at, estimated_price
      FROM custom_orders 
      WHERE status = 'rejected'
      ORDER BY created_at DESC 
      LIMIT 3
    `;
    const [rejectedCustom] = await connection.execute(rejectedCustomQuery);
    console.log('Sample Rejected Custom Orders:');
    rejectedCustom.forEach(order => {
      console.log(`  ${order.custom_order_id} - ${order.customer_name} - ₱${order.estimated_price} (${order.created_at})`);
    });

    // Get sample pending custom orders
    const pendingCustomQuery = `
      SELECT custom_order_id, customer_name, status, created_at, estimated_price
      FROM custom_orders 
      WHERE status = 'pending'
      ORDER BY created_at DESC 
      LIMIT 3
    `;
    const [pendingCustom] = await connection.execute(pendingCustomQuery);
    console.log('Sample Pending Custom Orders:');
    pendingCustom.forEach(order => {
      console.log(`  ${order.custom_order_id} - ${order.customer_name} - ₱${order.estimated_price} (${order.created_at})`);
    });

    // Test 5: Check payment verification data
    console.log('\n💰 Test 5: Payment Verification Data Sample');
    const paymentVerificationQuery = `
      SELECT 
        co.custom_order_id,
        co.customer_name,
        co.status as order_status,
        cop.payment_status,
        cop.payment_amount,
        cop.gcash_reference,
        cop.created_at as payment_date
      FROM custom_orders co
      INNER JOIN custom_order_payments cop ON co.custom_order_id = cop.custom_order_id
      ORDER BY cop.created_at DESC
      LIMIT 5
    `;
    const [paymentVerification] = await connection.execute(paymentVerificationQuery);
    console.log('Sample Payment Verification Orders:');
    paymentVerification.forEach(order => {
      console.log(`  ${order.custom_order_id} - ${order.customer_name} - ${order.order_status}/${order.payment_status} - ₱${order.payment_amount} - ${order.gcash_reference} (${order.payment_date})`);
    });

    // Test 6: Verify TransactionPage will show history correctly
    console.log('\n🎯 Test 6: TransactionPage History Summary');
    
    const totalCustomOrders = await connection.execute('SELECT COUNT(*) as total FROM custom_orders');
    const totalApproved = await connection.execute('SELECT COUNT(*) as total FROM custom_orders WHERE status = "approved"');
    const totalRejected = await connection.execute('SELECT COUNT(*) as total FROM custom_orders WHERE status = "rejected"');
    const totalPending = await connection.execute('SELECT COUNT(*) as total FROM custom_orders WHERE status = "pending"');
    
    const totalPayments = await connection.execute('SELECT COUNT(*) as total FROM custom_order_payments');
    const verifiedPayments = await connection.execute('SELECT COUNT(*) as total FROM custom_order_payments WHERE payment_status = "verified"');
    const pendingPayments = await connection.execute('SELECT COUNT(*) as total FROM custom_order_payments WHERE payment_status = "pending" OR payment_status = "submitted"');
    
    console.log('Expected TransactionPage Statistics:');
    console.log('Custom Design Requests Tab:');
    console.log(`  Total: ${totalCustomOrders[0][0].total}`);
    console.log(`  Approved: ${totalApproved[0][0].total}`);
    console.log(`  Rejected: ${totalRejected[0][0].total}`);
    console.log(`  Pending: ${totalPending[0][0].total}`);
    
    console.log('Verify Payment Tab:');
    console.log(`  Total Payment Records: ${totalPayments[0][0].total}`);
    console.log(`  Verified: ${verifiedPayments[0][0].total}`);
    console.log(`  Pending: ${pendingPayments[0][0].total}`);

    console.log('\n✅ TransactionPage History Test Complete');
    console.log('The updated TransactionPage should now show:');
    console.log('1. "Verify Payment" tab: ALL payment records (verified, pending, rejected) as history');
    console.log('2. "Custom Design Requests" tab: ALL custom orders (approved, rejected, pending) as history');
    console.log('3. Both tabs act as complete historical records, not just pending items');
    console.log('4. Proper statistics showing breakdown by status');
    console.log('5. Conditional action buttons (approve/deny only for pending items)');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the test
testTransactionPageHistory();
