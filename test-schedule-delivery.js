const mysql = require('mysql2/promise');
const { dbConfig } = require('./server/config/db');

async function testScheduleDelivery() {
  let connection;
  try {
    console.log('🔗 Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    
    // Get some regular orders to test with
    console.log('📋 Getting regular orders...');
    const [orders] = await connection.execute(`
      SELECT id, order_number, customer_name, delivery_status 
      FROM orders 
      WHERE delivery_status IS NULL OR delivery_status = 'pending'
      LIMIT 5
    `);
    
    console.log('Available orders for testing:');
    orders.forEach(order => {
      console.log(`- Order ID: ${order.id}, Number: ${order.order_number}, Customer: ${order.customer_name}, Status: ${order.delivery_status || 'pending'}`);
    });
    
    if (orders.length > 0) {
      const testOrder = orders[0];
      console.log(`\n🧪 Testing delivery scheduling with order ${testOrder.id}...`);
      
      // Test the API call
      const testData = {
        order_id: testOrder.id,
        order_type: 'regular',
        delivery_date: '2025-07-01',
        delivery_time_slot: '10:00-12:00',
        delivery_notes: 'Test delivery scheduling',
        priority_level: 'normal'
      };
      
      console.log('Test data:', testData);
      
      // Simulate the scheduling process manually
      try {
        // Check if delivery_schedules_enhanced table accepts this data
        const [result] = await connection.execute(`
          INSERT INTO delivery_schedules_enhanced (
            order_id, order_number, order_type,
            customer_name, customer_email, customer_phone,
            delivery_date, delivery_time_slot, delivery_status,
            delivery_address, delivery_city, delivery_province, delivery_postal_code,
            delivery_contact_phone, delivery_notes,
            courier_id, priority_level,
            calendar_color, display_icon
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'scheduled', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          testOrder.id,
          testOrder.order_number || 'TEST-ORDER',
          'regular',
          testOrder.customer_name || 'Test Customer',
          'test@example.com',
          '123-456-7890',
          testData.delivery_date,
          testData.delivery_time_slot,
          'Test Address',
          'Test City',
          'Test Province',
          'K1A 0A6',
          '123-456-7890',
          testData.delivery_notes,
          null, // courier_id
          testData.priority_level,
          '#007bff', // calendar_color
          '📅' // display_icon
        ]);
        
        console.log('✅ Test delivery schedule created with ID:', result.insertId);
        
        // Clean up the test record
        await connection.execute('DELETE FROM delivery_schedules_enhanced WHERE id = ?', [result.insertId]);
        console.log('🧹 Test record cleaned up');
        
      } catch (insertError) {
        console.error('❌ Error creating test delivery schedule:', insertError.message);
      }
    } else {
      console.log('❌ No orders available for testing');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

testScheduleDelivery();
