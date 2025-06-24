const mysql = require('mysql2/promise');
require('dotenv').config({ path: './server/.env' });

async function testCustomOrdersAPI() {  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    console.log('🔍 Testing Final Custom Orders Implementation...\n');    // 1. Check what emails exist in custom_designs
    console.log('1. Checking custom_designs table structure:');
    const [columns] = await connection.execute(`SHOW COLUMNS FROM custom_designs`);
    columns.forEach(col => console.log(`   - ${col.Field} (${col.Type})`));
      console.log('\n2. Checking existing custom orders with email data:');
    const [orders] = await connection.execute(`
      SELECT id, email, first_name, last_name, additional_info, status, created_at 
      FROM custom_designs 
      ORDER BY created_at DESC 
      LIMIT 5
    `);
    
    if (orders.length === 0) {
      console.log('❌ No custom orders found in database');
    } else {      orders.forEach(order => {
        console.log(`📄 Order #${order.id}: ${order.first_name} ${order.last_name} (${order.email}) - ${order.additional_info}`);
      });
    }

    // 2. Test API endpoint functionality
    const testEmail = orders.length > 0 ? orders[0].email : 'test@example.com';
    console.log(`\n2. Testing API endpoint for: ${testEmail}`);
    
    const axios = require('axios');
    try {
      const response = await axios.get(`http://localhost:3001/api/user-designs/${testEmail}`);
      console.log('✅ API Response:', JSON.stringify(response.data, null, 2));
    } catch (apiError) {
      console.log('❌ API Error:', apiError.message);
    }

    // 3. Create a test order to verify new order functionality
    console.log('\n3. Testing new custom order creation...');
    try {
      const testOrderData = {
        firstName: 'Test',
        lastName: 'User',
        email: 'testuser@example.com',
        phone: '09123456789',
        designDescription: 'Test order from final verification',
        designType: 'Custom Shirt',
        preferredColors: 'Blue, White',
        notes: 'Final test order'
      };

      const createResponse = await axios.post('http://localhost:3001/api/custom-designs', testOrderData);
      console.log('✅ New Order Created:', JSON.stringify(createResponse.data, null, 2));

      // Verify the new order shows up for this user
      const verifyResponse = await axios.get(`http://localhost:3001/api/user-designs/${testOrderData.email}`);
      console.log('✅ Order Verification:', JSON.stringify(verifyResponse.data, null, 2));
      
    } catch (createError) {
      console.log('❌ Order Creation Error:', createError.message);
    }

  } catch (error) {
    console.error('❌ Database Error:', error.message);
  } finally {
    await connection.end();
  }
}

testCustomOrdersAPI().catch(console.error);
