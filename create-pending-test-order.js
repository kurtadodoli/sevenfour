const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 's3v3n-f0ur-cl0thing*',
  database: 'seven_four_clothing',
  port: 3306
};

async function createPendingOrderForTesting() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('🔧 CREATING A PENDING ORDER FOR TESTING\n');
    
    // 1. First, let's see current stock
    console.log('1️⃣ Current stock status:');
    const [stockCheck] = await connection.execute(`
      SELECT productname, total_available_stock, total_reserved_stock, total_stock
      FROM products 
      WHERE productname = 'No Struggles No Progress'
    `);
    
    if (stockCheck.length > 0) {
      const stock = stockCheck[0];
      console.log(`📦 ${stock.productname}:`);
      console.log(`   Available: ${stock.total_available_stock}`);
      console.log(`   Reserved: ${stock.total_reserved_stock}`);
      console.log(`   Total: ${stock.total_stock}`);
    }
    
    // 2. Get product info
    const [products] = await connection.execute(`
      SELECT product_id, productname, productprice 
      FROM products 
      WHERE productname = 'No Struggles No Progress'
    `);
    
    if (products.length === 0) {
      console.log('❌ Test product not found');
      return;
    }
    
    const product = products[0];
    console.log(`📦 Using product: ${product.productname} (ID: ${product.product_id})`);
    
    // 3. Create a simple pending order using existing user
    console.log('\n2️⃣ Creating pending order...');
    
    await connection.beginTransaction();
    
    try {
      const orderNumber = `TEST${Date.now()}`;
      const invoiceId = `INV${Date.now()}`;
      const transactionId = `TXN${Date.now()}`;
      const testQuantity = 3; // Order 3 items
      const totalAmount = product.productprice * testQuantity;
      
      // Use existing user ID from sample
      const userId = 967502321335176;
      
      // Insert order
      const [orderResult] = await connection.execute(`
        INSERT INTO orders (
          order_number, user_id, status, total_amount, invoice_id, transaction_id,
          shipping_address, contact_phone, order_date, created_at, updated_at
        ) VALUES (?, ?, 'pending', ?, ?, ?, 'Test Address 123', '1234567890', NOW(), NOW(), NOW())
      `, [orderNumber, userId, totalAmount, invoiceId, transactionId]);
      
      const orderId = orderResult.insertId;
      console.log(`✅ Created order ${orderNumber} (ID: ${orderId})`);
      
      // Insert order item with correct structure
      await connection.execute(`
        INSERT INTO order_items (
          invoice_id, product_id, product_name, product_price, quantity, 
          color, size, subtotal, created_at
        ) VALUES (?, ?, ?, ?, ?, 'Black', 'M', ?, NOW())
      `, [invoiceId, product.product_id, product.productname, product.productprice, testQuantity, totalAmount]);
      
      console.log(`✅ Added order item: ${testQuantity}x ${product.productname}`);
      
      await connection.commit();
      
      console.log('\n3️⃣ Order created successfully! Now you can test:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`📱 Order Number: ${orderNumber}`);
      console.log(`🆔 Order ID: ${orderId}`);
      console.log(`👤 User ID: ${userId}`);
      console.log(`📦 Product: ${product.productname}`);
      console.log(`🔢 Quantity: ${testQuantity}`);
      console.log(`💰 Total: ₱${totalAmount}`);
      
      console.log('\n🧪 TESTING STEPS:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('1. Login to the app with a user account');
      console.log('2. Go to Order History page');
      console.log('3. Find the pending order and click "Confirm Order"');
      console.log('4. Watch the server terminal for logs');
      console.log('5. Check MaintenancePage - stock should decrease by 3');
      console.log('6. Click "Cancel Order" and submit reason');
      console.log('7. Button should change to "Cancellation Requested"');
      console.log('8. Admin approves cancellation');
      console.log('9. Check MaintenancePage - stock should restore by 3');
      
      console.log('\n📊 EXPECTED STOCK CHANGES:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`Before confirmation: Available=${stockCheck[0].total_available_stock}, Reserved=${stockCheck[0].total_reserved_stock}`);
      console.log(`After confirmation:  Available=${stockCheck[0].total_available_stock - testQuantity}, Reserved=${stockCheck[0].total_reserved_stock + testQuantity}`);
      console.log(`After cancellation:  Available=${stockCheck[0].total_available_stock}, Reserved=${stockCheck[0].total_reserved_stock}`);
      
    } catch (error) {
      await connection.rollback();
      console.log('❌ Failed to create order:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

createPendingOrderForTesting();
