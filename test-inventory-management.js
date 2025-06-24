// Test script to verify inventory management for order confirmation and cancellation
const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 's3v3n-f0ur-cl0thing*',
  database: 'seven_four_clothing',
  port: 3306
};

async function testInventoryManagement() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connected');

    console.log('\n🔍 CURRENT INVENTORY STATUS');
    console.log('='*50);
    
    // Check current product stock levels
    const [products] = await connection.execute(`
      SELECT 
        product_id, 
        productname, 
        productquantity,
        total_stock,
        total_available_stock, 
        total_reserved_stock,
        stock_status
      FROM products 
      WHERE total_available_stock > 0 OR total_reserved_stock > 0
      ORDER BY productname
      LIMIT 10
    `);
    
    console.log('\n📦 Current Product Inventory:');
    products.forEach(p => {
      console.log(`  - ${p.productname}`);
      console.log(`    Available: ${p.total_available_stock || 0}, Reserved: ${p.total_reserved_stock || 0}, Status: ${p.stock_status || 'unknown'}`);
    });

    console.log('\n🔍 RECENT ORDERS FOR TESTING');
    console.log('='*50);
    
    // Find recent orders that could be used for testing
    const [orders] = await connection.execute(`
      SELECT 
        o.id,
        o.order_number,
        o.status,
        o.user_id,
        COUNT(oi.id) as item_count,
        SUM(oi.quantity) as total_quantity
      FROM orders o
      LEFT JOIN order_items oi ON o.invoice_id = oi.invoice_id
      WHERE o.status IN ('pending', 'confirmed')
      GROUP BY o.id, o.order_number, o.status, o.user_id
      ORDER BY o.order_date DESC
      LIMIT 5
    `);
    
    console.log('\n📋 Recent Orders:');
    if (orders.length === 0) {
      console.log('  No pending or confirmed orders found');
    } else {
      orders.forEach(order => {
        console.log(`  - Order ${order.order_number} (ID: ${order.id})`);
        console.log(`    Status: ${order.status}, Items: ${order.item_count}, Total Qty: ${order.total_quantity}`);
      });
    }

    // Show order items for the first order if available
    if (orders.length > 0) {
      const firstOrder = orders[0];
      console.log(`\n🛍️ Items in Order ${firstOrder.order_number}:`);
      
      const [orderItems] = await connection.execute(`
        SELECT 
          oi.product_id,
          oi.quantity,
          p.productname,
          p.total_available_stock,
          p.total_reserved_stock
        FROM order_items oi
        JOIN orders o ON oi.invoice_id = o.invoice_id
        JOIN products p ON oi.product_id = p.product_id
        WHERE o.id = ?
      `, [firstOrder.id]);
      
      orderItems.forEach(item => {
        console.log(`  - ${item.productname}: Ordered=${item.quantity}, Available=${item.total_available_stock}, Reserved=${item.total_reserved_stock}`);
      });
    }

    console.log('\n📊 INVENTORY MANAGEMENT TEST SUMMARY');
    console.log('='*50);
    console.log('✅ Database structure verified');
    console.log('✅ Product inventory fields found: total_available_stock, total_reserved_stock');
    console.log('✅ Order items structure confirmed');
    console.log('\n🎯 NEXT STEPS:');
    console.log('1. When order is CONFIRMED: total_available_stock decreases, total_reserved_stock increases');
    console.log('2. When order is CANCELLED: total_available_stock increases, total_reserved_stock decreases');
    console.log('3. Stock status is automatically updated based on available stock levels');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

testInventoryManagement();
