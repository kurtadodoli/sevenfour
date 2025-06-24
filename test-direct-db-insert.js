const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: './server/.env' });

async function createTestCustomOrder() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log('✅ Connected to database');
    
    // Get first active user
    const [users] = await connection.execute(
      'SELECT user_id, email, first_name, last_name FROM users WHERE is_active = 1 LIMIT 1'
    );
    
    if (users.length === 0) {
      console.log('❌ No active users found');
      return;
    }
    
    const user = users[0];
    console.log('👤 Using user:', user);
    
    // Generate design ID
    const designId = `TEST-${Date.now()}`;
    
    // Test direct database insertion without going through the API
    console.log('💾 Testing direct database insertion...');
    
    const insertQuery = `
      INSERT INTO custom_designs (
        design_id, user_id, product_type, product_name, product_color, product_size, quantity,
        additional_info, customer_name, first_name, last_name, email, customer_email, customer_phone,
        street_address, city, house_number, barangay, postal_code,
        status, estimated_price
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 0.00)
    `;
    
    const values = [
      designId, // design_id
      user.user_id, // user_id
      't-shirts', // product_type
      'Test Custom T-Shirt', // product_name
      'Red', // product_color
      'L', // product_size
      1, // quantity
      'Test additional info', // additional_info
      `${user.first_name} ${user.last_name}`, // customer_name
      user.first_name, // first_name
      user.last_name, // last_name
      user.email, // email
      user.email, // customer_email
      '1234567890', // customer_phone
      'Test Street 123', // street_address
      'Manila', // city
      null, // house_number
      null, // barangay
      '1000' // postal_code
    ];
    
    console.log('🔍 Values to insert:', values);
    
    const [result] = await connection.execute(insertQuery, values);
    console.log('✅ Direct database insertion successful!');
    console.log('Result:', result);
    
    // Verify the insertion
    const [check] = await connection.execute(
      'SELECT * FROM custom_designs WHERE design_id = ?',
      [designId]
    );
    
    console.log('✅ Verification successful - record exists:', check[0]);
    
    // Clean up
    await connection.execute('DELETE FROM custom_designs WHERE design_id = ?', [designId]);
    console.log('🧹 Test record cleaned up');
    
  } catch (error) {
    console.error('❌ Error:', error);
    console.error('❌ Error code:', error.code);
    console.error('❌ SQL Message:', error.sqlMessage);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

createTestCustomOrder();
