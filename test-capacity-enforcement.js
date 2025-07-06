const axios = require('axios');
const mysql = require('mysql2/promise');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, 'server', '.env') });

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'seven_four_clothing',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

async function testCapacityEnforcement() {
  let connection;
  
  try {
    console.log('🧪 Testing Delivery Capacity Enforcement');
    console.log('='.repeat(50));
    
    connection = await mysql.createConnection(dbConfig);
    
    const testDate = '2025-07-15'; // Future date for testing
    
    // Clear any existing test deliveries for this date
    console.log('\n🧹 Clearing test deliveries for', testDate);
    await connection.execute(`
      DELETE FROM delivery_schedules_enhanced 
      WHERE DATE(delivery_date) = ? 
      AND order_id >= 999990
    `, [testDate]);
    
    // Check current count
    const [initialCount] = await connection.execute(`
      SELECT COUNT(*) as delivery_count 
      FROM delivery_schedules_enhanced 
      WHERE DATE(delivery_date) = ? 
      AND delivery_status NOT IN ('cancelled', 'removed')
    `, [testDate]);
    
    console.log(`Initial delivery count: ${initialCount[0].delivery_count}/3`);
    
    // Test: Schedule 3 deliveries (should all succeed)
    console.log('\n📦 Step 1: Schedule 3 deliveries (should all succeed)');
    
    for (let i = 1; i <= 3; i++) {
      try {
        const response = await axios.post('http://localhost:3001/api/delivery-enhanced/schedule', {
          order_id: 999990 + i,
          order_type: 'regular',
          delivery_date: testDate + 'T' + (9 + i) + ':00:00',
          customer_name: `Test Customer ${i}`,
          customer_email: `test${i}@example.com`,
          customer_phone: `+63912345678${i}`,
          delivery_address: `Test Address ${i}, Test City, Metro Manila`
        });
        
        console.log(`   ✅ Delivery ${i} scheduled successfully`);
        
      } catch (error) {
        console.log(`   ❌ Delivery ${i} failed:`, error.response?.data?.message || error.message);
      }
    }
    
    // Check count after 3 deliveries
    const [afterThreeCount] = await connection.execute(`
      SELECT COUNT(*) as delivery_count 
      FROM delivery_schedules_enhanced 
      WHERE DATE(delivery_date) = ? 
      AND delivery_status NOT IN ('cancelled', 'removed')
    `, [testDate]);
    
    console.log(`\nAfter scheduling 3: ${afterThreeCount[0].delivery_count}/3 deliveries`);
    
    // Test: Schedule 4th delivery (should fail)
    console.log('\n🚫 Step 2: Schedule 4th delivery (should fail due to capacity)');
    
    try {
      const response = await axios.post('http://localhost:3001/api/delivery-enhanced/schedule', {
        order_id: 999994,
        order_type: 'regular',
        delivery_date: testDate + 'T13:00:00',
        customer_name: 'Test Customer 4',
        customer_email: 'test4@example.com',
        customer_phone: '+639123456784',
        delivery_address: 'Test Address 4, Test City, Metro Manila'
      });
      
      console.log('   ❌ 4th delivery should have failed but succeeded:', response.data);
      
    } catch (error) {
      if (error.response && error.response.status === 400 && error.response.data.capacityExceeded) {
        console.log('   ✅ 4th delivery correctly rejected - capacity exceeded');
        console.log(`   📋 Message: ${error.response.data.message}`);
        console.log(`   📊 Current: ${error.response.data.currentDeliveries}, Max: ${error.response.data.maxDeliveries}`);
      } else {
        console.log('   ❌ Unexpected error:', error.response?.data?.message || error.message);
      }
    }
    
    // Final count check
    const [finalCount] = await connection.execute(`
      SELECT COUNT(*) as delivery_count 
      FROM delivery_schedules_enhanced 
      WHERE DATE(delivery_date) = ? 
      AND delivery_status NOT IN ('cancelled', 'removed')
    `, [testDate]);
    
    console.log(`\nFinal delivery count: ${finalCount[0].delivery_count}/3 deliveries`);
    
    // Show all scheduled deliveries
    console.log('\n📋 All deliveries for', testDate + ':');
    const [allDeliveries] = await connection.execute(`
      SELECT order_id, customer_name, delivery_time_slot, delivery_status
      FROM delivery_schedules_enhanced 
      WHERE DATE(delivery_date) = ?
      ORDER BY delivery_time_slot
    `, [testDate]);
    
    allDeliveries.forEach((delivery, index) => {
      console.log(`   ${index + 1}. Order ${delivery.order_id} - ${delivery.customer_name} - ${delivery.delivery_time_slot || 'No time'} [${delivery.delivery_status}]`);
    });
    
    // Test calendar display
    console.log('\n📅 Step 3: Test calendar display for', testDate);
    try {
      const calendarResponse = await axios.get('http://localhost:3001/api/delivery-enhanced/calendar', {
        params: {
          month: 6, // July (0-indexed)
          year: 2025
        }
      });
      
      const testDateData = calendarResponse.data.days?.find(day => 
        day.date.startsWith(testDate)
      );
      
      if (testDateData) {
        console.log(`   📅 Calendar bookingCount: ${testDateData.bookingCount} (should be capped at 3)`);
        console.log(`   📅 Availability status: ${testDateData.availabilityStatus}`);
        console.log(`   📅 Deliveries length: ${testDateData.deliveries?.length || 0}`);
      } else {
        console.log('   ❌ Test date not found in calendar response');
      }
      
    } catch (error) {
      console.log('   ❌ Calendar API error:', error.message);
    }
    
    console.log('\n✅ Capacity enforcement test completed');
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

testCapacityEnforcement();
