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

async function testDeliveryCapacityLimit() {
  let connection;
  
  try {
    console.log('🧪 Testing Delivery Capacity Limit (Max 3 per day)');
    console.log('='.repeat(60));
    
    connection = await mysql.createConnection(dbConfig);
    
    // Test date for capacity checking
    const testDate = '2025-07-10'; // Future date for testing
    
    // 1. Check current delivery count for test date
    console.log('\n📊 Step 1: Check current deliveries for', testDate);
    const [currentDeliveries] = await connection.execute(`
      SELECT COUNT(*) as delivery_count 
      FROM delivery_schedules_enhanced 
      WHERE DATE(delivery_date) = ? 
      AND delivery_status NOT IN ('cancelled', 'removed')
    `, [testDate]);
    
    console.log(`Current deliveries: ${currentDeliveries[0].delivery_count}/3`);
    
    // 2. Test calendar API to see how it displays the count
    console.log('\n📅 Step 2: Test calendar API for delivery counts');
    try {
      const calendarResponse = await axios.get('http://localhost:3001/api/delivery-enhanced/calendar', {
        params: {
          month: 6, // July (0-indexed)
          year: 2025
        }
      });
      
      // Find the test date in calendar response
      const testDateData = calendarResponse.data.days?.find(day => 
        day.date.startsWith(testDate)
      );
      
      if (testDateData) {
        console.log(`📅 Calendar shows ${testDateData.bookingCount} deliveries for ${testDate}`);
        console.log(`📅 Availability status: ${testDateData.availabilityStatus}`);
      } else {
        console.log('❌ Test date not found in calendar response');
      }
      
    } catch (error) {
      console.log('❌ Calendar API error:', error.message);
    }
    
    // 3. Test scheduling when at capacity
    if (currentDeliveries[0].delivery_count >= 3) {
      console.log('\n🚫 Step 3: Test scheduling when at capacity (should fail)');
      
      try {
        const scheduleResponse = await axios.post('http://localhost:3001/api/delivery-enhanced/schedule', {
          order_id: 999999, // Dummy order ID
          order_type: 'regular',
          delivery_date: testDate + 'T10:00:00',
          customer_name: 'Test Customer',
          delivery_address: 'Test Address, Test City, Metro Manila'
        });
        
        console.log('❌ Scheduling should have failed but succeeded:', scheduleResponse.data);
        
      } catch (error) {
        if (error.response && error.response.status === 400 && error.response.data.capacityExceeded) {
          console.log('✅ Scheduling correctly rejected - capacity exceeded');
          console.log(`   Message: ${error.response.data.message}`);
        } else {
          console.log('❌ Unexpected error:', error.message);
        }
      }
    } else {
      console.log('\n📝 Step 3: Current capacity not at limit, cannot test rejection');
      console.log(`   Current: ${currentDeliveries[0].delivery_count}/3`);
    }
    
    // 4. Show all deliveries for the test date
    console.log('\n📋 Step 4: All deliveries scheduled for', testDate);
    const [allDeliveries] = await connection.execute(`
      SELECT order_id, order_type, customer_name, delivery_time_slot, delivery_status
      FROM delivery_schedules_enhanced 
      WHERE DATE(delivery_date) = ?
      ORDER BY delivery_time_slot
    `, [testDate]);
    
    if (allDeliveries.length > 0) {
      allDeliveries.forEach((delivery, index) => {
        console.log(`   ${index + 1}. Order ${delivery.order_id} (${delivery.order_type}) - ${delivery.customer_name} - ${delivery.delivery_time_slot} [${delivery.delivery_status}]`);
      });
    } else {
      console.log('   No deliveries scheduled for this date');
    }
    
    console.log('\n✅ Delivery capacity limit test completed');
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

testDeliveryCapacityLimit();
