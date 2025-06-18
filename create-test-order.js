const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 's3v3n-f0ur-cl0thing*',
  database: 'seven_four_clothing',
  port: 3306
};

async function createTestOrder() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // Create a test order
    const orderId = Date.now();
    const invoiceId = `INV${orderId}`;
    const userId = 229491642395434; // Kurt's user ID from the logs
    
    console.log('Creating test order...');
    
    // Insert order
    await connection.execute(`
      INSERT INTO orders (
        id, user_id, invoice_id, customer_name, customer_email, 
        contact_phone, shipping_address, notes, total_amount, 
        status, order_date, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), NOW())
    `, [
      orderId,
      userId,
      invoiceId,
      'Kurt Adodoli',
      'kurtadodoli@gmail.com',
      '+63 123 456 7890',
      '123 Sample Street, Quezon City, Metro Manila, Philippines',
      'Please handle with care',
      249.97,
      'completed'
    ]);
    
    console.log('Order created with ID:', orderId);
    
    // Insert order items (using the existing product)
    const productId = 713079971589; // The "Even Our Splash" product from inventory
    
    await connection.execute(`
      INSERT INTO order_items (
        order_id, product_id, productname, price, quantity, selectedSize
      ) VALUES (?, ?, ?, ?, ?, ?)
    `, [orderId, productId, 'Even Our Splash T-Shirt', 122.98, 2, 'M']);
    
    await connection.execute(`
      INSERT INTO order_items (
        order_id, product_id, productname, price, quantity, selectedSize
      ) VALUES (?, ?, ?, ?, ?, ?)
    `, [orderId, 999999, 'Seven Four Cap', 49.99, 1, 'One Size']);
    
    console.log('Order items created');
    
    // Create invoice record
    await connection.execute(`
      INSERT INTO order_invoices (
        invoice_id, total_amount, invoice_status, created_at, updated_at
      ) VALUES (?, ?, ?, NOW(), NOW())
    `, [invoiceId, 249.97, 'paid']);
    
    console.log('Invoice created with ID:', invoiceId);
    
    await connection.end();
    console.log('✅ Test order created successfully!');
    console.log('Order ID:', orderId);
    console.log('Invoice ID:', invoiceId);
    console.log('User ID:', userId);
    
  } catch (error) {
    console.error('Error creating test order:', error);
  }
}

createTestOrder();
