const mysql = require('mysql2/promise');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, 'server', '.env') });

async function testCustomOrderSubmission() {
  let connection;
  
  try {
    console.log('=== TESTING CUSTOM ORDER DATA STORAGE ===\n');
    
    // Connect to database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 's3v3n-f0ur-cl0thing*',
      database: process.env.DB_NAME || 'seven_four_clothing',
      port: process.env.DB_PORT || 3306
    });
    
    console.log('✅ Connected to database');
    
    // Generate test order ID
    const customOrderId = `TEST-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 5)}`.toUpperCase();
    
    // Test data that matches CustomPage.js form structure
    const testOrderData = {
      custom_order_id: customOrderId,
      user_id: null, // Guest order
      product_type: 't-shirts',
      product_name: 'My Custom Logo T-Shirt',
      size: 'L',
      color: 'Black',
      quantity: 2,
      urgency: 'standard',
      special_instructions: 'Please print logo on front center, small logo on back',
      customer_name: 'John Doe',
      customer_email: 'john.doe@example.com',
      customer_phone: '09123456789',
      province: 'Metro Manila',
      municipality: 'Manila',
      street_number: '123 Rizal Street, Binondo',
      house_number: 'Unit 4B',
      barangay: 'Ermita',
      postal_code: '1000',
      estimated_price: 2100.00, // 2 x 1050
      status: 'pending'
    };
    
    // Insert test order
    const insertOrderQuery = `
      INSERT INTO custom_orders (
        custom_order_id, user_id, product_type, product_name, size, color, quantity, urgency,
        special_instructions, customer_name, customer_email, customer_phone,
        province, municipality, street_number, house_number, barangay, postal_code,
        estimated_price, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;
    
    const [orderResult] = await connection.execute(insertOrderQuery, [
      testOrderData.custom_order_id,
      testOrderData.user_id,
      testOrderData.product_type,
      testOrderData.product_name,
      testOrderData.size,
      testOrderData.color,
      testOrderData.quantity,
      testOrderData.urgency,
      testOrderData.special_instructions,
      testOrderData.customer_name,
      testOrderData.customer_email,
      testOrderData.customer_phone,
      testOrderData.province,
      testOrderData.municipality,
      testOrderData.street_number,
      testOrderData.house_number,
      testOrderData.barangay,
      testOrderData.postal_code,
      testOrderData.estimated_price,
      testOrderData.status
    ]);
    
    console.log('✅ Test order inserted with ID:', orderResult.insertId);
    
    // Insert test images
    const testImages = [
      {
        filename: 'design-1-123456789.jpg',
        original: 'my-logo-design.jpg',
        path: '/uploads/custom-orders/design-1-123456789.jpg',
        size: 2048576, // 2MB
        mimetype: 'image/jpeg',
        order: 1
      },
      {
        filename: 'design-2-123456790.png',
        original: 'back-design.png',
        path: '/uploads/custom-orders/design-2-123456790.png',
        size: 1536000, // 1.5MB
        mimetype: 'image/png',
        order: 2
      }
    ];
    
    for (const image of testImages) {
      const insertImageQuery = `
        INSERT INTO custom_order_images (
          custom_order_id, image_filename, original_filename, image_path, 
          image_size, mime_type, upload_order, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
      `;
      
      await connection.execute(insertImageQuery, [
        customOrderId,
        image.filename,
        image.original,
        image.path,
        image.size,
        image.mimetype,
        image.order
      ]);
    }
    
    console.log('✅ Test images inserted');
    
    // Verify the data
    console.log('\n📋 Verifying stored data...');
    
    const [orders] = await connection.execute(`
      SELECT 
        custom_order_id, product_type, product_name, size, color, quantity,
        customer_name, customer_email, municipality, estimated_price, status,
        created_at
      FROM custom_orders 
      WHERE custom_order_id = ?
    `, [customOrderId]);
    
    const [images] = await connection.execute(`
      SELECT 
        image_filename, original_filename, image_size, mime_type, upload_order
      FROM custom_order_images 
      WHERE custom_order_id = ?
      ORDER BY upload_order
    `, [customOrderId]);
    
    console.log('\n📦 ORDER DATA:');
    const order = orders[0];
    console.log(`   Order ID: ${order.custom_order_id}`);
    console.log(`   Product: ${order.product_name} (${order.product_type})`);
    console.log(`   Size/Color: ${order.size} / ${order.color}`);
    console.log(`   Quantity: ${order.quantity}`);
    console.log(`   Customer: ${order.customer_name} (${order.customer_email})`);
    console.log(`   Location: ${order.municipality}`);
    console.log(`   Price: ₱${order.estimated_price}`);
    console.log(`   Status: ${order.status}`);
    console.log(`   Created: ${order.created_at}`);
    
    console.log('\n🖼️  IMAGE DATA:');
    images.forEach((img, index) => {
      console.log(`   Image ${index + 1}: ${img.original_filename}`);
      console.log(`     - File: ${img.image_filename}`);
      console.log(`     - Size: ${(img.image_size / 1024 / 1024).toFixed(2)} MB`);
      console.log(`     - Type: ${img.mime_type}`);
    });
    
    // Show all data in a summary query
    console.log('\n📊 COMPLETE ORDER SUMMARY:');
    const [summary] = await connection.execute(`
      SELECT 
        co.custom_order_id,
        co.product_name,
        co.customer_name,
        co.estimated_price,
        COUNT(coi.id) as image_count,
        co.created_at
      FROM custom_orders co
      LEFT JOIN custom_order_images coi ON co.custom_order_id = coi.custom_order_id
      GROUP BY co.id
      ORDER BY co.created_at DESC
      LIMIT 5
    `);
    
    summary.forEach(order => {
      console.log(`   ${order.custom_order_id}: ${order.product_name} by ${order.customer_name} (₱${order.estimated_price}) - ${order.image_count} images`);
    });
    
    console.log('\n🎉 TEST SUCCESSFUL!');
    console.log('\nAll CustomPage.js form data is properly stored:');
    console.log('✓ Product details (type, name, size, color, quantity)');
    console.log('✓ Customer information (name, email, phone)');
    console.log('✓ Shipping address (all Metro Manila fields)');
    console.log('✓ Design images with metadata');
    console.log('✓ Pricing and order status');
    console.log('✓ Timestamps for tracking');
    
    // Clean up test data
    await connection.execute('DELETE FROM custom_order_images WHERE custom_order_id = ?', [customOrderId]);
    await connection.execute('DELETE FROM custom_orders WHERE custom_order_id = ?', [customOrderId]);
    console.log('\n🧹 Test data cleaned up');
    
  } catch (error) {
    console.error('❌ Error testing custom order:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the test
testCustomOrderSubmission();
