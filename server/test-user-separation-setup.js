// Test script to set up user separation data
const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 's3v3n-f0ur-cl0thing*',
  database: 'seven_four_clothing'
};

async function setupTestData() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');

    // Clear existing test data
    await connection.execute('DELETE FROM custom_designs WHERE customer_email IN (?, ?)', 
      ['user1@test.com', 'user2@test.com']);
    console.log('🧹 Cleared existing test data');    // Insert test custom orders for user1@test.com
    const user1Orders = [
      {
        design_id: 'CUSTOM_001_USER1',
        customer_name: 'User One',
        customer_email: 'user1@test.com',
        customer_phone: '09123456789',
        product_type: 't-shirts',
        product_name: 'Custom T-Shirt',
        product_size: 'M',
        product_color: 'Blue',
        quantity: 2,
        additional_info: 'Custom design for user 1 - order 1',
        street_address: '123 Test Street',
        city: 'Manila',
        status: 'pending'
      },
      {
        design_id: 'CUSTOM_002_USER1',
        customer_name: 'User One',
        customer_email: 'user1@test.com',
        customer_phone: '09123456789',
        product_type: 'hoodies',
        product_name: 'Custom Hoodie',
        product_size: 'L',
        product_color: 'Black',
        quantity: 1,
        additional_info: 'Custom design for user 1 - order 2',
        street_address: '123 Test Street',
        city: 'Manila',
        status: 'pending'
      }
    ];

    // Insert test custom orders for user2@test.com
    const user2Orders = [
      {
        design_id: 'CUSTOM_001_USER2',
        customer_name: 'User Two',
        customer_email: 'user2@test.com',
        customer_phone: '09987654321',
        product_type: 'jerseys',
        product_name: 'Custom Jersey',
        product_size: 'S',
        product_color: 'Red',
        quantity: 3,
        additional_info: 'Custom design for user 2 - order 1',
        street_address: '456 Test Avenue',
        city: 'Quezon City',
        status: 'pending'
      },
      {
        design_id: 'CUSTOM_002_USER2',
        customer_name: 'User Two',
        customer_email: 'user2@test.com',
        customer_phone: '09987654321',
        product_type: 'sweaters',
        product_name: 'Custom Sweater',
        product_size: 'M',
        product_color: 'Green',
        quantity: 1,
        additional_info: 'Custom design for user 2 - order 2',
        street_address: '456 Test Avenue',
        city: 'Quezon City',
        status: 'cancelled'
      }
    ];    // Insert orders for user 1
    for (const order of user1Orders) {
      await connection.execute(`
        INSERT INTO custom_designs (
          design_id, customer_name, customer_email, customer_phone,
          product_type, product_name, product_size, product_color, quantity,
          additional_info, street_address, city, status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, [
        order.design_id, order.customer_name, order.customer_email, order.customer_phone,
        order.product_type, order.product_name, order.product_size, order.product_color, order.quantity,
        order.additional_info, order.street_address, order.city, order.status
      ]);
    }
    console.log('✅ Created orders for user1@test.com');

    // Insert orders for user 2
    for (const order of user2Orders) {
      await connection.execute(`
        INSERT INTO custom_designs (
          design_id, customer_name, customer_email, customer_phone,
          product_type, product_name, product_size, product_color, quantity,
          additional_info, street_address, city, status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, [
        order.design_id, order.customer_name, order.customer_email, order.customer_phone,
        order.product_type, order.product_name, order.product_size, order.product_color, order.quantity,
        order.additional_info, order.street_address, order.city, order.status
      ]);
    }
    console.log('✅ Created orders for user2@test.com');

    // Verify the data
    const [user1Results] = await connection.execute(
      'SELECT * FROM custom_designs WHERE customer_email = ? ORDER BY created_at',
      ['user1@test.com']
    );
    
    const [user2Results] = await connection.execute(
      'SELECT * FROM custom_designs WHERE customer_email = ? ORDER BY created_at',
      ['user2@test.com']
    );

    console.log(`📊 User1 has ${user1Results.length} orders:`);
    user1Results.forEach(order => {
      console.log(`  - ${order.design_id}: ${order.product_type} (${order.status})`);
    });

    console.log(`📊 User2 has ${user2Results.length} orders:`);
    user2Results.forEach(order => {
      console.log(`  - ${order.design_id}: ${order.product_type} (${order.status})`);
    });

    console.log('✅ Test data setup complete!');

  } catch (error) {
    console.error('❌ Error setting up test data:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

setupTestData();
