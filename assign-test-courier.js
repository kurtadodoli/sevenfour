/**
 * Script to assign a courier to a test order and verify courier display
 */

const mysql = require('mysql2/promise');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, 'server', '.env') });

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'seven_four_clothing'
};

async function assignCourierToTestOrder() {
  let connection;
  try {
    console.log('🚚 Assigning courier to test order...\n');
    
    connection = await mysql.createConnection(dbConfig);
    
    // First, check if there are any couriers
    const [couriers] = await connection.execute('SELECT * FROM couriers WHERE status = "active" LIMIT 1');
    
    if (couriers.length === 0) {
      console.log('📝 No active couriers found. Creating a test courier...');
      
      await connection.execute(`
        INSERT INTO couriers (name, email, phone_number, vehicle_type, license_number, status)
        VALUES ('John Delivery', 'john@courier.com', '+63 917 123 4567', 'Motorcycle', 'ABC123', 'active')
      `);
      
      console.log('✅ Test courier created: John Delivery');
    }
    
    // Get the courier ID
    const [availableCouriers] = await connection.execute('SELECT * FROM couriers WHERE status = "active" LIMIT 1');
    const courier = availableCouriers[0];
    
    console.log(`Using courier: ${courier.name} (${courier.phone_number})`);
    
    // Find a scheduled order without a courier
    const [orders] = await connection.execute(`
      SELECT o.id, o.order_number, o.delivery_status 
      FROM orders o
      LEFT JOIN delivery_schedules_enhanced ds ON o.id = ds.order_id
      WHERE o.delivery_status IN ('scheduled', 'in_transit')
      AND (ds.courier_id IS NULL OR ds.courier_id = '')
      LIMIT 1
    `);
    
    if (orders.length === 0) {
      console.log('⚠️ No scheduled orders without couriers found.');
      
      // Let's assign to any scheduled order
      const [anyScheduledOrders] = await connection.execute(`
        SELECT o.id, o.order_number, o.delivery_status 
        FROM orders o
        WHERE o.delivery_status IN ('scheduled', 'in_transit')
        LIMIT 1
      `);
      
      if (anyScheduledOrders.length === 0) {
        console.log('❌ No scheduled orders found at all.');
        return;
      }
      
      const order = anyScheduledOrders[0];
      console.log(`Assigning courier to order: ${order.order_number}`);
      
      // Update delivery schedule with courier
      await connection.execute(`
        UPDATE delivery_schedules_enhanced 
        SET courier_id = ?, updated_at = CURRENT_TIMESTAMP
        WHERE order_id = ? AND order_type = 'regular'
      `, [courier.id, order.id]);
      
      console.log('✅ Courier assigned via delivery schedule update');
      
    } else {
      const order = orders[0];
      console.log(`Assigning courier to order: ${order.order_number}`);
      
      // Update or insert delivery schedule with courier
      const [existingSchedules] = await connection.execute(`
        SELECT id FROM delivery_schedules_enhanced 
        WHERE order_id = ? AND order_type = 'regular'
      `, [order.id]);
      
      if (existingSchedules.length > 0) {
        // Update existing schedule
        await connection.execute(`
          UPDATE delivery_schedules_enhanced 
          SET courier_id = ?, updated_at = CURRENT_TIMESTAMP
          WHERE order_id = ? AND order_type = 'regular'
        `, [courier.id, order.id]);
        console.log('✅ Courier assigned via delivery schedule update');
      } else {
        // Create new schedule entry - need to get order details first
        const [orderDetails] = await connection.execute(`
          SELECT o.*, oi.customer_name, oi.customer_email
          FROM orders o
          LEFT JOIN order_invoices oi ON o.invoice_id = oi.invoice_id
          WHERE o.id = ?
        `, [order.id]);
        
        if (orderDetails.length > 0) {
          const details = orderDetails[0];
          await connection.execute(`
            INSERT INTO delivery_schedules_enhanced 
            (order_id, order_number, order_type, customer_name, customer_email, 
             delivery_address, delivery_status, courier_id, created_at, updated_at)
            VALUES (?, ?, 'regular', ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          `, [
            order.id, 
            order.order_number, 
            details.customer_name || 'Customer',
            details.customer_email || '',
            details.shipping_address || '',
            order.delivery_status,
            courier.id
          ]);
          console.log('✅ New delivery schedule created with courier assignment');
        }
      }
    }
    
    // Verify the assignment
    console.log('\n🔍 Verifying courier assignment...');
    
    const [verification] = await connection.execute(`
      SELECT 
        o.id,
        o.order_number,
        o.delivery_status,
        ds.courier_id,
        c.name as courier_name,
        c.phone_number as courier_phone
      FROM orders o
      LEFT JOIN delivery_schedules_enhanced ds ON o.id = ds.order_id AND ds.order_type = 'regular'
      LEFT JOIN couriers c ON ds.courier_id = c.id
      WHERE ds.courier_id IS NOT NULL
      LIMIT 3
    `);
    
    console.log('Orders with assigned couriers:');
    verification.forEach(order => {
      console.log(`  - ${order.order_number}: ${order.courier_name} (${order.courier_phone})`);
    });
    
    console.log('\n✅ Courier assignment complete! The delivery page should now show courier information.');
    
  } catch (error) {
    console.error('❌ Error assigning courier:', error.message);
  } finally {
    if (connection) await connection.end();
  }
}

assignCourierToTestOrder();
