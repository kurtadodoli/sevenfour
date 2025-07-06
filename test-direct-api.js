// Direct test of the delivery status API endpoint
require('dotenv').config({ path: './server/.env' });
const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testDirectly() {
  console.log('🧪 Direct Test of Delivery Status API');
  console.log('====================================');
  
  try {
    // Test with explicit custom_order type
    console.log('📦 Testing custom order status update with explicit type...');
    
    const response = await axios.put(`${BASE_URL}/api/delivery-status/orders/43/status`, {
      delivery_status: 'delivered',
      order_type: 'custom_order', // Explicitly set as custom_order
      delivery_notes: 'Direct test - delivered status for custom order'
    });
    
    console.log('✅ Response received:', response.data);
    
    // Now check the database directly
    console.log('\n🔍 Checking database after API call...');
    
    const mysql = require('mysql2/promise');
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'seven_four_clothing',
      port: process.env.DB_PORT || 3306
    });
    
    // Check delivery schedules for custom order
    const [schedules] = await connection.execute(`
      SELECT id, order_id, order_number, order_type, delivery_status, updated_at 
      FROM delivery_schedules_enhanced 
      WHERE order_id = 43 AND order_type = 'custom_order'
      ORDER BY updated_at DESC
    `);
    
    console.log('📅 Custom order delivery schedules:');
    schedules.forEach((schedule, index) => {
      console.log(`   ${index + 1}. Schedule ID: ${schedule.id}, Status: ${schedule.delivery_status}, Updated: ${schedule.updated_at}`);
    });
    
    // Check custom_orders table
    const [customOrder] = await connection.execute(`
      SELECT id, custom_order_id, delivery_status, updated_at 
      FROM custom_orders 
      WHERE id = 43
    `);
    
    console.log('📋 Custom orders table:');
    if (customOrder.length > 0) {
      console.log('   Status:', customOrder[0].delivery_status, 'Updated:', customOrder[0].updated_at);
    }
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testDirectly();
