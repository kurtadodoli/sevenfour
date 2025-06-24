// Debug script to check order confirmation issue
const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 's3v3n-f0ur-cl0thing*',
  database: 'seven_four_clothing',
  port: 3306
};

async function debugOrderConfirmation() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connected');

    // Check if order 4 exists
    console.log('\n🔍 Checking order 4...');
    const [orders] = await connection.execute(`
      SELECT id, order_number, status, user_id, invoice_id, total_amount
      FROM orders 
      WHERE id = 4
    `);
    
    if (orders.length === 0) {
      console.log('❌ Order 4 not found');
      return;
    }
    
    const order = orders[0];
    console.log('📋 Order 4 details:');
    console.log(`  - Order Number: ${order.order_number}`);
    console.log(`  - Status: ${order.status}`);
    console.log(`  - User ID: ${order.user_id}`);
    console.log(`  - Invoice ID: ${order.invoice_id}`);
    console.log(`  - Total: ${order.total_amount}`);

    // Check order items
    console.log('\n🛍️ Checking order items...');
    const [orderItems] = await connection.execute(`
      SELECT oi.product_id, oi.quantity, oi.product_price, p.productname
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.product_id
      WHERE oi.invoice_id = ?
    `, [order.invoice_id]);
    
    console.log(`Found ${orderItems.length} items in order:`);
    orderItems.forEach(item => {
      console.log(`  - ${item.productname || 'Unknown Product'}: ${item.quantity} units @ ₱${item.product_price}`);
    });

    // Check if products table has inventory fields
    console.log('\n📦 Checking products table structure...');
    const [columns] = await connection.execute("DESCRIBE products");
    const inventoryFields = columns.filter(col => 
      col.Field.includes('stock') || 
      col.Field.includes('quantity') || 
      col.Field.includes('available')
    );
    
    console.log('Inventory-related fields:');
    inventoryFields.forEach(field => {
      console.log(`  - ${field.Field}: ${field.Type}`);
    });

    // Check current stock for products in order 4
    if (orderItems.length > 0) {
      console.log('\n📊 Current stock for order items...');
      for (const item of orderItems) {
        const [stockInfo] = await connection.execute(`
          SELECT 
            productname,
            productquantity,
            total_stock,
            total_available_stock,
            total_reserved_stock,
            stock_status
          FROM products 
          WHERE product_id = ?
        `, [item.product_id]);
        
        if (stockInfo.length > 0) {
          const stock = stockInfo[0];
          console.log(`  - ${stock.productname}:`);
          console.log(`    productquantity: ${stock.productquantity}`);
          console.log(`    total_stock: ${stock.total_stock}`);
          console.log(`    total_available_stock: ${stock.total_available_stock}`);
          console.log(`    total_reserved_stock: ${stock.total_reserved_stock}`);
          console.log(`    stock_status: ${stock.stock_status}`);
        } else {
          console.log(`  - Product ID ${item.product_id}: Not found`);
        }
      }
    }

    // Test the query that the confirmOrder function uses
    console.log('\n🔍 Testing confirmOrder query...');
    try {
      const [testItems] = await connection.execute(`
        SELECT oi.product_id, oi.quantity, p.productname, p.total_available_stock
        FROM order_items oi
        JOIN orders o ON oi.invoice_id = o.invoice_id
        JOIN products p ON oi.product_id = p.product_id
        WHERE o.id = ? AND o.user_id = ?
      `, [4, order.user_id]);
      
      console.log(`✅ Query successful, found ${testItems.length} items`);
      testItems.forEach(item => {
        console.log(`  - ${item.productname}: ordered=${item.quantity}, available=${item.total_available_stock}`);
      });
    } catch (error) {
      console.log('❌ Query failed:', error.message);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

debugOrderConfirmation();
