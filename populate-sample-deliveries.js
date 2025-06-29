// Populate sample delivery schedules for testing the calendar functionality
const mysql = require('mysql2/promise');

// Load environment variables
require('dotenv').config({ path: './server/.env' });

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'seven_four_clothing'
};

async function populateSampleDeliverySchedules() {
  let connection;
  
  try {
    console.log('🔗 Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database successfully!');
    
    // Check if we already have delivery schedules
    const [existingSchedules] = await connection.execute('SELECT COUNT(*) as count FROM delivery_schedules_enhanced');
    
    if (existingSchedules[0].count > 0) {
      console.log(`ℹ️ Found ${existingSchedules[0].count} existing delivery schedules, skipping population...`);
      return;
    }
    
    // Get confirmed orders to create delivery schedules from
    const [confirmedOrders] = await connection.execute(`
      SELECT 
        o.id, o.order_number, o.contact_phone,
        o.shipping_address, o.total_amount, o.created_at,
        oi.customer_name, oi.customer_email
      FROM orders o
      LEFT JOIN order_invoices oi ON o.invoice_id = oi.invoice_id
      WHERE o.status = 'confirmed' 
      ORDER BY o.created_at DESC 
      LIMIT 5
    `);
    
    console.log(`📦 Found ${confirmedOrders.length} confirmed orders to schedule for delivery`);
    
    if (confirmedOrders.length === 0) {
      console.log('⚠️ No confirmed orders found. Creating sample delivery schedules...');
      
      // Create sample delivery schedules for demonstration
      const sampleSchedules = [
        {
          order_id: 999,
          order_number: 'SAMPLE-001',
          customer_name: 'John Doe',
          customer_email: 'john@example.com',
          customer_phone: '+63 917 123 4567',
          delivery_address: '123 Test Street, Quezon City',
          delivery_city: 'Quezon City',
          delivery_province: 'Metro Manila',
          delivery_date: '2025-06-28',
          delivery_time_slot: '9:00 AM - 12:00 PM',
          delivery_status: 'scheduled',
          priority_level: 'normal',
          calendar_color: '#007bff',
          display_icon: '📦'
        },
        {
          order_id: 998,
          order_number: 'SAMPLE-002',
          customer_name: 'Jane Smith',
          customer_email: 'jane@example.com',
          customer_phone: '+63 918 234 5678',
          delivery_address: '456 Sample Ave, Makati City',
          delivery_city: 'Makati City',
          delivery_province: 'Metro Manila',
          delivery_date: '2025-06-29',
          delivery_time_slot: '1:00 PM - 5:00 PM',
          delivery_status: 'in_transit',
          priority_level: 'high',
          calendar_color: '#ffc107',
          display_icon: '🚚'
        }
      ];
      
      for (const schedule of sampleSchedules) {
        await connection.execute(`
          INSERT INTO delivery_schedules_enhanced (
            order_id, order_number, customer_name, customer_email, customer_phone,
            delivery_date, delivery_time_slot, delivery_status,
            delivery_address, delivery_city, delivery_province,
            priority_level, calendar_color, display_icon
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          schedule.order_id, schedule.order_number, schedule.customer_name,
          schedule.customer_email, schedule.customer_phone, schedule.delivery_date,
          schedule.delivery_time_slot, schedule.delivery_status, schedule.delivery_address,
          schedule.delivery_city, schedule.delivery_province, schedule.priority_level,
          schedule.calendar_color, schedule.display_icon
        ]);
      }
      
      console.log(`✅ Created ${sampleSchedules.length} sample delivery schedules`);
    } else {
      // Create delivery schedules from real confirmed orders
      for (let i = 0; i < confirmedOrders.length; i++) {
        const order = confirmedOrders[i];
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + i + 1); // Schedule for next few days
        
        const deliveryDate = futureDate.toISOString().split('T')[0];
        const timeSlots = [
          '9:00 AM - 12:00 PM',
          '1:00 PM - 5:00 PM',
          '10:00 AM - 2:00 PM'
        ];
        const timeSlot = timeSlots[i % timeSlots.length];
        
        const statusOptions = [
          { status: 'scheduled', color: '#007bff', icon: '📦' },
          { status: 'in_transit', color: '#ffc107', icon: '🚚' },
          { status: 'delivered', color: '#28a745', icon: '✅' }
        ];
        const statusConfig = statusOptions[i % statusOptions.length];
        
        // Parse shipping address
        const addressParts = order.shipping_address ? order.shipping_address.split(',') : ['Unknown Address'];
        const deliveryAddress = order.shipping_address || 'Address not provided';
        const deliveryCity = addressParts.length > 1 ? addressParts[1].trim() : 'Unknown City';
        const deliveryProvince = addressParts.length > 2 ? addressParts[2].trim() : 'Metro Manila';
        
        await connection.execute(`
          INSERT INTO delivery_schedules_enhanced (
            order_id, order_number, customer_name, customer_email, customer_phone,
            delivery_date, delivery_time_slot, delivery_status,
            delivery_address, delivery_city, delivery_province,
            priority_level, calendar_color, display_icon
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          order.id, order.order_number, order.customer_name,
          order.customer_email, order.contact_phone, deliveryDate,
          timeSlot, statusConfig.status, deliveryAddress,
          deliveryCity, deliveryProvince, 'normal',
          statusConfig.color, statusConfig.icon
        ]);
        
        console.log(`✅ Created delivery schedule for order ${order.order_number} on ${deliveryDate}`);
      }
    }
    
    // Show final summary
    const [finalCount] = await connection.execute('SELECT COUNT(*) as count FROM delivery_schedules_enhanced');
    console.log(`\n📊 Total delivery schedules: ${finalCount[0].count}`);
    
    // Show sample schedule details
    const [sampleSchedules] = await connection.execute(`
      SELECT 
        order_number, customer_name, delivery_date, delivery_time_slot, 
        delivery_status, calendar_color, display_icon
      FROM delivery_schedules_enhanced 
      ORDER BY delivery_date 
      LIMIT 3
    `);
    
    console.log('\n📅 Sample delivery schedules:');
    sampleSchedules.forEach(schedule => {
      console.log(`   ${schedule.display_icon} ${schedule.order_number} - ${schedule.customer_name}`);
      console.log(`      📅 ${schedule.delivery_date} at ${schedule.delivery_time_slot}`);
      console.log(`      📊 Status: ${schedule.delivery_status} (${schedule.calendar_color})`);
    });
    
  } catch (error) {
    console.error('❌ Error populating delivery schedules:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔗 Database connection closed');
    }
  }
}

// Run the population
populateSampleDeliverySchedules()
  .then(() => {
    console.log('\n✅ Sample delivery schedules populated successfully!');
    console.log('\n🎯 Ready to test DeliveryPage.js calendar functionality!');
    console.log('   Visit: http://localhost:3000/delivery');
    console.log('   Login as admin to view delivery schedules on calendar');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Failed to populate delivery schedules:', error.message);
    process.exit(1);
  });
