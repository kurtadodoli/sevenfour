// Complete inventory management test and fix
const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 's3v3n-f0ur-cl0thing*',
  database: 'seven_four_clothing',
  port: 3306
};

async function completeInventoryTest() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connected');

    // 1. Check current order status and inventory
    console.log('\n🔍 CHECKING CURRENT STATE');
    console.log('='*50);
    
    const [orders] = await connection.execute(`
      SELECT id, order_number, status, user_id, total_amount
      FROM orders 
      WHERE status = 'pending'
      ORDER BY id DESC
      LIMIT 3
    `);
    
    console.log(`Found ${orders.length} pending orders:`);
    orders.forEach(order => {
      console.log(`  - Order ${order.order_number} (ID: ${order.id}): ${order.status}, User: ${order.user_id}`);
    });

    if (orders.length === 0) {
      console.log('❌ No pending orders found to test with');
      return;
    }

    const testOrder = orders[0];
    console.log(`\n🧪 TESTING WITH ORDER ${testOrder.order_number}`);

    // 2. Check order items and current product stock
    const [orderItems] = await connection.execute(`
      SELECT oi.product_id, oi.quantity, oi.product_price, p.productname, 
             p.total_available_stock, p.total_reserved_stock, p.productquantity, p.total_stock
      FROM order_items oi
      JOIN orders o ON oi.invoice_id = o.invoice_id
      JOIN products p ON oi.product_id = p.product_id
      WHERE o.id = ?
    `, [testOrder.id]);

    console.log(`\nOrder items (${orderItems.length}):`);
    orderItems.forEach(item => {
      console.log(`  - ${item.productname}:`);
      console.log(`    Ordered: ${item.quantity} units`);
      console.log(`    Current Stock: available=${item.total_available_stock}, reserved=${item.total_reserved_stock}, total=${item.total_stock}`);
    });

    // 3. Test manual inventory update to see if it works
    console.log('\n🔧 TESTING MANUAL INVENTORY UPDATE');
    
    if (orderItems.length > 0) {
      const firstItem = orderItems[0];
      
      console.log(`\nTesting update for ${firstItem.productname}:`);
      console.log(`  Before: available=${firstItem.total_available_stock}, reserved=${firstItem.total_reserved_stock}`);
      
      // Test the same query that confirmOrder uses
      const testQuantity = firstItem.quantity;
      
      try {
        await connection.beginTransaction();
        
        // This is the exact same query from confirmOrder
        await connection.execute(`
          UPDATE products 
          SET total_available_stock = total_available_stock - ?,
              total_reserved_stock = COALESCE(total_reserved_stock, 0) + ?,
              last_stock_update = CURRENT_TIMESTAMP,
              stock_status = CASE 
                  WHEN (total_available_stock - ?) <= 0 THEN 'out_of_stock'
                  WHEN (total_available_stock - ?) <= 5 THEN 'critical_stock'
                  WHEN (total_available_stock - ?) <= 15 THEN 'low_stock'
                  ELSE 'in_stock'
              END
          WHERE product_id = ?
        `, [testQuantity, testQuantity, testQuantity, testQuantity, testQuantity, firstItem.product_id]);
        
        // Check the result
        const [updatedProduct] = await connection.execute(`
          SELECT productname, total_available_stock, total_reserved_stock, stock_status
          FROM products 
          WHERE product_id = ?
        `, [firstItem.product_id]);
        
        if (updatedProduct.length > 0) {
          const updated = updatedProduct[0];
          console.log(`  After: available=${updated.total_available_stock}, reserved=${updated.total_reserved_stock}, status=${updated.stock_status}`);
          console.log(`  ✅ Manual inventory update SUCCESSFUL!`);
        }
        
        // Rollback to restore original state
        await connection.rollback();
        console.log(`  🔄 Rolled back changes for testing`);
        
      } catch (error) {
        await connection.rollback();
        console.log(`  ❌ Manual inventory update FAILED:`, error.message);
      }
    }

    // 4. Check the confirmOrder query structure
    console.log('\n🔍 TESTING CONFIRMORDER QUERY STRUCTURE');
    
    try {
      const [queryTest] = await connection.execute(`
        SELECT oi.product_id, oi.quantity, p.productname, p.total_available_stock
        FROM order_items oi
        JOIN orders o ON oi.invoice_id = o.invoice_id
        JOIN products p ON oi.product_id = p.product_id
        WHERE o.id = ? AND o.user_id = ?
      `, [testOrder.id, testOrder.user_id]);
      
      console.log(`✅ ConfirmOrder query works: found ${queryTest.length} items`);
      queryTest.forEach(item => {
        console.log(`  - ${item.productname}: quantity=${item.quantity}, available=${item.total_available_stock}`);
      });
      
    } catch (error) {
      console.log(`❌ ConfirmOrder query failed:`, error.message);
    }

    // 5. Check if products have the required inventory fields
    console.log('\n📋 CHECKING PRODUCT TABLE STRUCTURE');
    const [columns] = await connection.execute("DESCRIBE products");
    const inventoryFields = columns.filter(col => 
      col.Field.includes('stock') || col.Field.includes('quantity')
    );
    
    console.log('Inventory fields in products table:');
    inventoryFields.forEach(field => {
      console.log(`  - ${field.Field}: ${field.Type} ${field.Null === 'NO' ? 'NOT NULL' : 'NULLABLE'} (Default: ${field.Default})`);
    });

    // 6. Create a test script for order confirmation
    console.log('\n📝 RECOMMENDATION');
    console.log('='*50);
    console.log('If manual inventory update works, the issue might be:');
    console.log('1. Authentication problems in confirmOrder endpoint');
    console.log('2. Transaction rollback due to other errors');
    console.log('3. Frontend not calling the correct endpoint');
    console.log('\nNext steps:');
    console.log('- Check server logs when confirming order');
    console.log('- Verify authentication token is valid');
    console.log('- Test the exact confirmOrder endpoint with curl');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

completeInventoryTest();
