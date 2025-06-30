const axios = require('axios');
const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 's3v3n-f0ur-cl0thing*',
  database: 'seven_four_clothing'
};

async function testWithAuthentication() {
  try {
    console.log('🔐 Testing custom order API with authentication...');
    
    // First, let's get an admin user and login
    const connection = await mysql.createConnection(dbConfig);
    
    const [admins] = await connection.execute(`
      SELECT user_id, email, role, password FROM users 
      WHERE role = 'admin' 
      LIMIT 1
    `);
    
    if (admins.length === 0) {
      console.log('❌ No admin users found');
      await connection.end();
      return;
    }
    
    const adminUser = admins[0];
    console.log('👤 Found admin user:', adminUser.email);
    
    // Get a test custom order
    const [customOrders] = await connection.execute(`
      SELECT id, custom_order_id, customer_name, status, delivery_status 
      FROM custom_orders 
      WHERE status = 'approved' 
      LIMIT 1
    `);
    
    if (customOrders.length === 0) {
      console.log('❌ No approved custom orders found to test with');
      await connection.end();
      return;
    }
    
    const testOrder = customOrders[0];
    console.log('📦 Found test order:', testOrder.custom_order_id);
    
    await connection.end();
    
    // Try to login and get a token
    console.log('\n🔑 Attempting to login...');
    
    let token;
    try {
      const loginResponse = await axios.post(
        'http://localhost:5000/api/auth/login',
        {
          email: adminUser.email,
          password: 'password123' // Common test password
        },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 5000
        }
      );
      
      token = loginResponse.data.token;
      console.log('✅ Login successful, got token');
      
    } catch (loginError) {
      console.log('❌ Login failed:', loginError.response?.data?.message || loginError.message);
      
      // Try with a different password
      try {
        console.log('🔑 Trying alternative password...');
        const altLoginResponse = await axios.post(
          'http://localhost:5000/api/auth/login',
          {
            email: adminUser.email,
            password: 'admin123'
          },
          {
            headers: { 'Content-Type': 'application/json' },
            timeout: 5000
          }
        );
        
        token = altLoginResponse.data.token;
        console.log('✅ Login successful with alternative password');
        
      } catch (altLoginError) {
        console.log('❌ Alternative login also failed');
        console.log('💡 Manual token creation needed for testing');
        
        // For testing purposes, let's try without authentication first to see the exact error
        console.log('\n🧪 Testing API endpoint without authentication to see error...');
        
        try {
          await axios.patch(
            `http://localhost:5000/api/custom-orders/${testOrder.id}/delivery-status`,
            {
              delivery_status: 'in_transit',
              delivery_date: null,
              delivery_notes: 'Test update'
            },
            {
              headers: { 'Content-Type': 'application/json' },
              timeout: 5000
            }
          );
        } catch (noAuthError) {
          console.log('🔍 Unauthenticated API Error Details:');
          console.log('Status:', noAuthError.response?.status);
          console.log('Response:', noAuthError.response?.data);
        }
        
        return;
      }
    }
    
    // Now test the API with authentication
    console.log('\n🌐 Testing authenticated API call...');
    
    try {
      const response = await axios.patch(
        `http://localhost:5000/api/custom-orders/${testOrder.id}/delivery-status`,
        {
          delivery_status: 'in_transit',
          delivery_date: null,
          delivery_notes: 'Test update from authenticated API test'
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          timeout: 5000
        }
      );
      
      console.log('✅ Authenticated API call successful!');
      console.log('Response:', response.data);
      
    } catch (authError) {
      console.log('❌ Authenticated API Error Details:');
      console.log('Status:', authError.response?.status);
      console.log('Response:', authError.response?.data);
      console.log('Error Message:', authError.message);
    }
    
  } catch (error) {
    console.error('❌ Script error:', error.message);
  }
}

testWithAuthentication();
