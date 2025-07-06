// Test the fixed custom order delivery status update
require('dotenv').config({ path: './server/.env' });
const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testCustomOrderStatusUpdate() {
  console.log('🧪 Testing Custom Order Delivery Status Update');
  console.log('==================================================');
  
  const orderId = 43; // Order ID for CUSTOM-MCNQFDBQ-YQPWJ
  const orderType = 'custom_order';
  const newStatus = 'in_transit';
  
  try {
    // Test the status update endpoint
    console.log(`📦 Testing status update for order ${orderId} to ${newStatus}...`);
    
    const updateResponse = await axios.put(`${BASE_URL}/api/delivery-status/orders/${orderId}/status`, {
      delivery_status: newStatus,
      order_type: orderType,
      delivery_notes: `Status updated to ${newStatus} via test script on ${new Date().toLocaleString()}`
    });
    
    console.log('✅ API Response:', updateResponse.data);
    
    // Verify the update in database
    console.log('\n🔍 Verifying update in database...');
    
    const mysql = require('mysql2/promise');
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'seven_four_clothing',
      port: process.env.DB_PORT || 3306
    });
    
    // Check custom_orders table
    const [customOrder] = await connection.execute(`
      SELECT id, custom_order_id, status, delivery_status, updated_at 
      FROM custom_orders 
      WHERE id = ?
    `, [orderId]);
    
    if (customOrder.length > 0) {
      console.log('📋 custom_orders table status:', customOrder[0]);
    }
    
    // Check delivery_schedules_enhanced table
    const [deliverySchedules] = await connection.execute(`
      SELECT id, order_id, order_number, delivery_status, updated_at 
      FROM delivery_schedules_enhanced 
      WHERE order_id = ? AND order_type = ?
      ORDER BY updated_at DESC
    `, [orderId, orderType]);
    
    console.log(`📅 delivery_schedules_enhanced table (${deliverySchedules.length} record(s)):`);
    deliverySchedules.forEach((schedule, index) => {
      console.log(`   ${index + 1}. Schedule ID: ${schedule.id}, Status: ${schedule.delivery_status}, Updated: ${schedule.updated_at}`);
    });
    
    await connection.end();
    
    console.log('\n✅ Test completed successfully!');
    
    if (customOrder[0]?.delivery_status === newStatus && deliverySchedules.some(s => s.delivery_status === newStatus)) {
      console.log('🎉 SUCCESS: Both tables were updated correctly!');
    } else {
      console.log('⚠️ WARNING: Status might not be updated in all tables');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testCustomOrderStatusUpdate();
