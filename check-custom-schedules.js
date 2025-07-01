const mysql = require('mysql2/promise');
require('dotenv').config({ path: './server/.env' });

async function checkCustomOrderSchedules() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log('📊 CHECKING DELIVERY_SCHEDULES_ENHANCED FOR CUSTOM ORDERS:');
    const [schedules] = await connection.execute(`
      SELECT id, order_id, order_type, delivery_date, delivery_status, delivery_time_slot
      FROM delivery_schedules_enhanced 
      WHERE order_type LIKE '%custom%' OR order_id IN (2, 3, 19, 44)
      ORDER BY delivery_date
    `);

    if (schedules.length === 0) {
      console.log('❌ No custom orders found in delivery_schedules_enhanced');
    } else {
      schedules.forEach((s, i) => {
        console.log(`${i+1}. Schedule ID: ${s.id}`);
        console.log(`   Order ID: ${s.order_id}`);
        console.log(`   Order Type: ${s.order_type}`);
        console.log(`   Date: ${s.delivery_date?.toLocaleDateString() || 'NULL'}`);
        console.log(`   Status: ${s.delivery_status}`);
        console.log(`   Time Slot: ${s.delivery_time_slot || 'NULL'}`);
        console.log('');
      });
    }
    
    console.log('\n📊 CHECKING ALL DELIVERY_SCHEDULES_ENHANCED FOR JUNE 30:');
    const [june30] = await connection.execute(`
      SELECT id, order_id, order_type, delivery_date, delivery_status
      FROM delivery_schedules_enhanced 
      WHERE DATE(delivery_date) = '2025-06-30'
    `);
    
    if (june30.length === 0) {
      console.log('❌ No deliveries found for June 30, 2025 in delivery_schedules_enhanced');
    } else {
      june30.forEach((s, i) => {
        console.log(`${i+1}. Order ID: ${s.order_id}, Type: ${s.order_type}, Status: ${s.delivery_status}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkCustomOrderSchedules();
