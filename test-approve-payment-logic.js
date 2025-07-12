const mysql = require('mysql2/promise');
const path = require('path');

// Load environment variables from the correct path
require('dotenv').config({ path: path.join(__dirname, 'server', '.env') });

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 's3v3n-f0ur-cl0thing*',
  database: process.env.DB_NAME || 'seven_four_clothing',
  port: process.env.DB_PORT || 3306,
  dateStrings: true,
  ssl: false,
  multipleStatements: false,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
};

async function testApprovePaymentLogic() {
  try {
    console.log('🧪 Testing Approve Payment Logic...');
    console.log('=' .repeat(60));
    
    const orderIdOrNumber = 'ORD17518584735203314';
    const mockUser = {
      id: 1750448349269,
      email: 'testadmin@example.com',
      role: 'admin'
    };
    
    console.log('Order ID/Number:', orderIdOrNumber);
    console.log('Admin User:', mockUser.email);
    
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connection established');
    
    await connection.beginTransaction();
    console.log('✅ Transaction started');
    
    try {
      // Check if order exists and is pending - handle both ID and order number
      let orderCheck;
      if (isNaN(parseInt(orderIdOrNumber))) {
        // It's an order number (string)
        console.log('🔍 Looking up order by order_number (string)');
        [orderCheck] = await connection.execute(`
          SELECT id, order_number, status, total_amount, user_id
          FROM orders 
          WHERE order_number = ? AND status = 'pending'
        `, [orderIdOrNumber]);
      } else {
        // It's a numeric order ID
        console.log('🔍 Looking up order by id (numeric)');
        [orderCheck] = await connection.execute(`
          SELECT id, order_number, status, total_amount, user_id
          FROM orders 
          WHERE id = ? AND status = 'pending'
        `, [parseInt(orderIdOrNumber)]);
      }
      
      console.log(`📋 Order lookup result: ${orderCheck.length} orders found`);
      if (orderCheck.length > 0) {
        console.log('Order details:', orderCheck[0]);
      }
      
      if (orderCheck.length === 0) {
        await connection.rollback();
        await connection.end();
        console.log('❌ Order not found or not in pending status');
        return;
      }
      
      const order = orderCheck[0];
      const orderId = order.id; // Use the actual numeric ID for database operations
      
      console.log(`✅ Found order ${orderId} (${order.order_number})`);
      
      // Get order items to convert reserved stock to deducted stock
      console.log('🔍 Fetching order items...');
      const [orderItems] = await connection.execute(`
        SELECT oi.product_id, oi.quantity, oi.size, oi.color, 
               p.productname, p.total_available_stock
        FROM order_items oi
        JOIN products p ON oi.product_id = p.product_id
        WHERE oi.order_id = ?
      `, [orderId]);
      
      console.log(`📦 Found ${orderItems.length} order items`);
      orderItems.forEach(item => {
        console.log(`  - ${item.productname} (${item.size}/${item.color}) x${item.quantity}`);
      });
      
      // Process each item
      console.log('🔄 Processing order items...');
      for (const item of orderItems) {
        console.log(`Processing ${item.productname} - Size: ${item.size}, Color: ${item.color}, Qty: ${item.quantity}`);
        
        // Log the payment approval as an ADJUSTMENT (since stock was already deducted)
        await connection.execute(`
          INSERT INTO stock_movements 
          (product_id, movement_type, quantity, size, reason, reference_number, user_id, notes)
          VALUES (?, 'ADJUSTMENT', ?, ?, 'Payment Approved - Stock Already Deducted', ?, ?, ?)
        `, [item.product_id, 0, item.size || 'N/A', 
            orderId, mockUser.id, `Payment approved for ${item.quantity} units of ${item.productname} ${item.size}/${item.color} (stock was already deducted during order placement)`]);
        
        console.log(`  ✅ Stock movement logged for ${item.productname}`);
      }
      
      // Update overall product stock totals from variants (to ensure consistency)
      const uniqueProductIds = [...new Set(orderItems.map(item => item.product_id))];
      console.log(`🔄 Updating product totals for ${uniqueProductIds.length} unique products...`);
      
      for (const productId of uniqueProductIds) {
        await connection.execute(`
          UPDATE products p
          SET p.total_stock = (
              SELECT COALESCE(SUM(pv.stock_quantity), p.productquantity) 
              FROM product_variants pv 
              WHERE pv.product_id = p.product_id
          ),
          p.total_available_stock = (
              SELECT COALESCE(SUM(pv.available_quantity), 0) 
              FROM product_variants pv 
              WHERE pv.product_id = p.product_id
          ),
          p.total_reserved_stock = (
              SELECT COALESCE(SUM(pv.reserved_quantity), 0) 
              FROM product_variants pv 
              WHERE pv.product_id = p.product_id
          ),
          p.stock_status = CASE 
              WHEN (SELECT COALESCE(SUM(pv.available_quantity), 0) FROM product_variants pv WHERE pv.product_id = p.product_id) <= 0 THEN 'out_of_stock'
              WHEN (SELECT COALESCE(SUM(pv.available_quantity), 0) FROM product_variants pv WHERE pv.product_id = p.product_id) <= 5 THEN 'critical_stock'
              WHEN (SELECT COALESCE(SUM(pv.available_quantity), 0) FROM product_variants pv WHERE pv.product_id = p.product_id) <= 15 THEN 'low_stock'
              ELSE 'in_stock'
          END,
          p.last_stock_update = CURRENT_TIMESTAMP
          WHERE p.product_id = ?
        `, [productId]);
        
        console.log(`  ✅ Updated product totals for product ID: ${productId}`);
      }
      
      // Update order status to confirmed
      console.log('🔄 Updating order status to confirmed...');
      await connection.execute(`
        UPDATE orders 
        SET status = 'confirmed', 
            payment_status = 'verified',
            confirmed_by = ?,
            confirmed_at = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP,
            notes = CONCAT(COALESCE(notes, ''), ' | Payment approved by admin: ', ?)
        WHERE id = ?
      `, [mockUser.id, mockUser.email, orderId]);
      console.log('  ✅ Order status updated');
      
      // Update transaction status
      console.log('🔄 Updating transaction status...');
      await connection.execute(`
        UPDATE sales_transactions st
        JOIN orders o ON st.transaction_id = o.transaction_id
        SET st.transaction_status = 'confirmed'
        WHERE o.id = ?
      `, [orderId]);
      console.log('  ✅ Transaction status updated');
      
      // Update order invoice status if exists
      console.log('🔄 Updating invoice status...');
      await connection.execute(`
        UPDATE order_invoices 
        SET invoice_status = 'confirmed',
            updated_at = CURRENT_TIMESTAMP
        WHERE invoice_id = (SELECT invoice_id FROM orders WHERE id = ?)
      `, [orderId]);
      console.log('  ✅ Invoice status updated');
      
      await connection.commit();
      console.log('✅ Transaction committed successfully');
      
      await connection.end();
      
      console.log(`🎉 Order ${orderId} approved and confirmed successfully!`);
      
      console.log('\n📋 SUCCESS RESPONSE:');
      console.log({
        success: true,
        message: 'Payment approved successfully. Order confirmed (stock was already deducted during order placement).',
        data: {
          orderId,
          newStatus: 'confirmed',
          approvedBy: mockUser.email,
          approvedAt: new Date().toISOString(),
          stockNote: 'Stock was already deducted when order was placed',
          orderItems: orderItems.map(item => ({
            product: item.productname,
            size: item.size,
            color: item.color,
            quantity: item.quantity
          }))
        }
      });
      
    } catch (error) {
      await connection.rollback();
      await connection.end();
      throw error;
    }
    
  } catch (error) {
    console.error('❌ Error in approve payment logic:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      errno: error.errno,
      sqlState: error.sqlState,
      sqlMessage: error.sqlMessage
    });
  }
}

testApprovePaymentLogic();
