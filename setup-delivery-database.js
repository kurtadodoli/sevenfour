// Database setup script for DeliveryPage.js
const mysql = require('mysql2/promise');

// Load environment variables
require('dotenv').config({ path: './server/.env' });

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'seven_four_clothing',
  multipleStatements: true
};

async function createDeliverySchema() {
  let connection;
  
  try {
    console.log('🔗 Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database successfully!');
    
    // Create couriers table
    console.log('📦 Creating couriers table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS couriers (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE,
        phone_number VARCHAR(20) NOT NULL,
        vehicle_type ENUM('motorcycle', 'car', 'van', 'truck') NOT NULL,
        license_number VARCHAR(50),
        total_deliveries INT DEFAULT 0,
        successful_deliveries INT DEFAULT 0,
        failed_deliveries INT DEFAULT 0,
        average_rating DECIMAL(3,2) DEFAULT 0.00,
        is_active BOOLEAN DEFAULT TRUE,
        max_daily_deliveries INT DEFAULT 10,
        working_hours_start TIME DEFAULT '08:00:00',
        working_hours_end TIME DEFAULT '18:00:00',
        service_areas JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    // Create delivery_calendar table
    console.log('📅 Creating delivery_calendar table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS delivery_calendar (
        id INT PRIMARY KEY AUTO_INCREMENT,
        calendar_date DATE NOT NULL UNIQUE,
        max_deliveries INT DEFAULT 20,
        current_bookings INT DEFAULT 0,
        is_available BOOLEAN DEFAULT TRUE,
        is_holiday BOOLEAN DEFAULT FALSE,
        is_weekend BOOLEAN DEFAULT FALSE,
        special_notes TEXT,
        weather_status ENUM('good', 'rainy', 'stormy', 'extreme') DEFAULT 'good',
        delivery_restrictions TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    // Create enhanced delivery_schedules table
    console.log('🚚 Creating enhanced delivery_schedules table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS delivery_schedules_enhanced (
        id INT PRIMARY KEY AUTO_INCREMENT,
        order_id INT NOT NULL,
        order_number VARCHAR(50) NOT NULL,
        order_type ENUM('regular', 'custom_design', 'custom_order') DEFAULT 'regular',
        
        customer_id INT,
        customer_name VARCHAR(255) NOT NULL,
        customer_email VARCHAR(255),
        customer_phone VARCHAR(20),
        
        delivery_date DATE NOT NULL,
        delivery_time_slot VARCHAR(50),
        delivery_status ENUM('pending', 'scheduled', 'in_transit', 'delivered', 'delayed', 'cancelled', 'failed') DEFAULT 'scheduled',
        
        delivery_address TEXT NOT NULL,
        delivery_city VARCHAR(100) NOT NULL,
        delivery_province VARCHAR(100) NOT NULL,
        delivery_postal_code VARCHAR(10),
        delivery_contact_phone VARCHAR(20),
        delivery_notes TEXT,
        
        courier_id INT,
        priority_level ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
        delivery_fee DECIMAL(10,2) DEFAULT 0.00,
        
        scheduled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        dispatched_at TIMESTAMP NULL,
        delivered_at TIMESTAMP NULL,
        
        calendar_color VARCHAR(7) DEFAULT '#007bff',
        display_icon VARCHAR(50) DEFAULT '📦',
        
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    // Create delivery_status_history table
    console.log('📋 Creating delivery_status_history table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS delivery_status_history (
        id INT PRIMARY KEY AUTO_INCREMENT,
        delivery_schedule_id INT NOT NULL,
        order_id INT NOT NULL,
        previous_status VARCHAR(50),
        new_status VARCHAR(50) NOT NULL,
        status_notes TEXT,
        changed_by_user_id INT,
        changed_by_name VARCHAR(255),
        location_lat DECIMAL(10,8),
        location_lng DECIMAL(11,8),
        location_address TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Insert sample couriers
    console.log('👥 Inserting sample couriers...');
    const courierCount = await connection.execute('SELECT COUNT(*) as count FROM couriers');
    if (courierCount[0][0].count === 0) {
      await connection.execute(`
        INSERT INTO couriers (name, email, phone_number, vehicle_type, service_areas) VALUES
        ('Juan Dela Cruz', 'juan@sfc-courier.com', '+63 917 123 4567', 'motorcycle', '["Manila", "Quezon City", "Makati", "Pasig"]'),
        ('Maria Santos', 'maria@sfc-courier.com', '+63 918 234 5678', 'car', '["Taguig", "Muntinlupa", "Parañaque", "Las Piñas"]'),
        ('Pedro Rodriguez', 'pedro@sfc-courier.com', '+63 919 345 6789', 'van', '["Marikina", "Pasay", "Caloocan", "Malabon"]'),
        ('Ana Garcia', 'ana@sfc-courier.com', '+63 920 456 7890', 'motorcycle', '["Navotas", "Valenzuela", "San Juan", "Mandaluyong"]')
      `);
      console.log('✅ Sample couriers inserted!');
    } else {
      console.log('ℹ️ Couriers already exist, skipping...');
    }
    
    // Initialize calendar for next 30 days
    console.log('📅 Initializing calendar...');
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      
      await connection.execute(`
        INSERT IGNORE INTO delivery_calendar (calendar_date, is_weekend, is_holiday) 
        VALUES (?, ?, FALSE)
      `, [dateStr, isWeekend]);
    }
    console.log('✅ Calendar initialized!');
    
    // Check if we need to migrate existing delivery_schedules
    console.log('🔄 Checking for existing delivery schedules to migrate...');
    try {
      const [existingSchedules] = await connection.execute('SELECT COUNT(*) as count FROM delivery_schedules');
      const [newSchedules] = await connection.execute('SELECT COUNT(*) as count FROM delivery_schedules_enhanced');
      
      if (existingSchedules[0].count > 0 && newSchedules[0].count === 0) {
        console.log('📋 Migrating existing delivery schedules...');
        await connection.execute(`
          INSERT INTO delivery_schedules_enhanced (
            order_id, order_number, customer_name, customer_email, customer_phone,
            delivery_date, delivery_time_slot, delivery_status,
            delivery_address, delivery_city, delivery_province, delivery_postal_code,
            delivery_contact_phone, delivery_notes, courier_id, priority_level, delivery_fee
          )
          SELECT 
            order_id, 
            COALESCE(order_number, CONCAT('ORD', order_id)) as order_number,
            customer_name, customer_email, customer_phone,
            delivery_date, delivery_time_slot, delivery_status,
            delivery_address, delivery_city, delivery_province, delivery_postal_code,
            delivery_contact_phone, delivery_notes, courier_id, priority_level, delivery_fee
          FROM delivery_schedules
        `);
        console.log('✅ Migration completed!');
      }
    } catch (migrateError) {
      console.log('ℹ️ No existing delivery_schedules table found or migration not needed');
    }
    
    console.log('🎉 Database schema for DeliveryPage.js created successfully!');
    
    // Show summary
    const [courierCount2] = await connection.execute('SELECT COUNT(*) as count FROM couriers');
    const [calendarCount] = await connection.execute('SELECT COUNT(*) as count FROM delivery_calendar');
    const [scheduleCount] = await connection.execute('SELECT COUNT(*) as count FROM delivery_schedules_enhanced');
    
    console.log('\n📊 Database Summary:');
    console.log(`👥 Couriers: ${courierCount2[0].count}`);
    console.log(`📅 Calendar entries: ${calendarCount[0].count}`);
    console.log(`🚚 Delivery schedules: ${scheduleCount[0].count}`);
    
  } catch (error) {
    console.error('❌ Error creating delivery schema:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔗 Database connection closed');
    }
  }
}

// Run the setup
createDeliverySchema()
  .then(() => {
    console.log('\n✅ Delivery management database setup completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Failed to setup delivery management database:', error.message);
    process.exit(1);
  });
