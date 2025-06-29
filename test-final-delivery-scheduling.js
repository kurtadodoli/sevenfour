// Final test for delivery scheduling API
const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 's3v3n-f0ur-cl0thing*',
  database: 'seven_four_clothing'
};

async function testDeliveryScheduling() {
  let connection;
  
  try {
    console.log('🔄 Starting final delivery scheduling test...');
    
    // Connect to database
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connected');
    
    // First, get available orders
    console.log('\n📦 Fetching available orders...');
    const [orders] = await connection.execute(`
      SELECT id, order_number, status 
      FROM orders 
      WHERE status IN ('confirmed', 'processing') 
      LIMIT 1
    `);
    
    if (orders.length === 0) {
      console.log('❌ No orders available for testing');
      return;
    }
    
    const testOrder = orders[0];
    console.log('✅ Found test order:', testOrder);
    
    // Test the API endpoint
    console.log('\n🌐 Testing delivery scheduling API...');
    
    const testData = {
      order_id: testOrder.id,
      order_type: 'regular',
      delivery_date: '2024-12-20',
      delivery_time_slot: '09:00-12:00',
      courier_id: 1,
      delivery_notes: 'Final test delivery',
      priority_level: 'normal'
    };
    
    console.log('📤 Test data:', testData);
    
    // Make HTTP request to the API
    const response = await fetch('http://localhost:5000/api/delivery-enhanced/schedule', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });
    
    const result = await response.json();
    console.log('\n📥 API Response Status:', response.status);
    console.log('📥 API Response Body:', JSON.stringify(result, null, 2));
    
    if (response.ok && result.success) {
      console.log('✅ Delivery scheduling API is working correctly!');
      
      // Verify the database entry
      const [schedules] = await connection.execute(`
        SELECT * FROM delivery_schedules_enhanced 
        WHERE order_id = ? AND order_type = ?
      `, [testOrder.id, 'regular']);
      
      if (schedules.length > 0) {
        console.log('✅ Database entry verified:', schedules[0]);
      } else {
        console.log('❌ Database entry not found');
      }
    } else {
      console.log('❌ API request failed');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run the test
testDeliveryScheduling().catch(console.error);
