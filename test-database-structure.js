const mysql = require('mysql2/promise');
const { dbConfig } = require('./server/config/db');

async function testDatabaseStructure() {
  let connection;
  try {
    console.log('🔗 Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    
    // Check if delivery_schedules_enhanced table exists
    console.log('📋 Checking delivery_schedules_enhanced table...');
    try {
      const [result] = await connection.execute("SHOW TABLES LIKE 'delivery_schedules_enhanced'");
      if (result.length === 0) {
        console.log('❌ delivery_schedules_enhanced table does not exist!');
        
        // Create the table
        console.log('🔨 Creating delivery_schedules_enhanced table...');
        await connection.execute(`
          CREATE TABLE delivery_schedules_enhanced (
            id INT AUTO_INCREMENT PRIMARY KEY,
            order_id VARCHAR(255) NOT NULL,
            order_number VARCHAR(255) NOT NULL,
            order_type ENUM('regular', 'custom_design', 'custom_order') NOT NULL,
            customer_name VARCHAR(255) NOT NULL,
            customer_email VARCHAR(255),
            customer_phone VARCHAR(20),
            delivery_date DATE NOT NULL,
            delivery_time_slot VARCHAR(50),
            delivery_status ENUM('scheduled', 'in_transit', 'delivered', 'delayed', 'cancelled') DEFAULT 'scheduled',
            delivery_address TEXT,
            delivery_city VARCHAR(100),
            delivery_province VARCHAR(100),
            delivery_postal_code VARCHAR(20),
            delivery_contact_phone VARCHAR(20),
            delivery_notes TEXT,
            courier_id INT,
            priority_level ENUM('normal', 'high', 'urgent') DEFAULT 'normal',
            calendar_color VARCHAR(7) DEFAULT '#007bff',
            display_icon VARCHAR(10) DEFAULT '📅',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            UNIQUE KEY unique_order_delivery (order_id, order_type),
            INDEX idx_delivery_date (delivery_date),
            INDEX idx_delivery_status (delivery_status),
            INDEX idx_courier_id (courier_id)
          )
        `);
        console.log('✅ delivery_schedules_enhanced table created successfully!');
      } else {
        console.log('✅ delivery_schedules_enhanced table exists');
      }
    } catch (error) {
      console.error('❌ Error with delivery_schedules_enhanced table:', error.message);
    }
    
    // Check if delivery_calendar table exists
    console.log('📋 Checking delivery_calendar table...');
    try {
      const [result] = await connection.execute("SHOW TABLES LIKE 'delivery_calendar'");
      if (result.length === 0) {
        console.log('❌ delivery_calendar table does not exist!');
        
        // Create the table
        console.log('🔨 Creating delivery_calendar table...');
        await connection.execute(`
          CREATE TABLE delivery_calendar (
            id INT AUTO_INCREMENT PRIMARY KEY,
            calendar_date DATE NOT NULL UNIQUE,
            is_available BOOLEAN DEFAULT TRUE,
            max_deliveries INT DEFAULT 3,
            current_bookings INT DEFAULT 0,
            special_notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_calendar_date (calendar_date)
          )
        `);
        console.log('✅ delivery_calendar table created successfully!');
      } else {
        console.log('✅ delivery_calendar table exists');
      }
    } catch (error) {
      console.error('❌ Error with delivery_calendar table:', error.message);
    }
    
    // Check orders table has delivery columns
    console.log('📋 Checking orders table delivery columns...');
    try {
      const [columns] = await connection.execute("SHOW COLUMNS FROM orders LIKE 'delivery_status'");
      if (columns.length === 0) {
        console.log('❌ orders table missing delivery_status column!');
        await connection.execute("ALTER TABLE orders ADD COLUMN delivery_status ENUM('pending', 'scheduled', 'in_transit', 'delivered', 'delayed', 'cancelled') DEFAULT 'pending'");
        console.log('✅ Added delivery_status column to orders table');
      } else {
        console.log('✅ orders table has delivery_status column');
      }
      
      const [schedColumns] = await connection.execute("SHOW COLUMNS FROM orders LIKE 'scheduled_delivery_date'");
      if (schedColumns.length === 0) {
        console.log('❌ orders table missing scheduled_delivery_date column!');
        await connection.execute("ALTER TABLE orders ADD COLUMN scheduled_delivery_date DATE NULL");
        console.log('✅ Added scheduled_delivery_date column to orders table');
      } else {
        console.log('✅ orders table has scheduled_delivery_date column');
      }
      
      const [notesColumns] = await connection.execute("SHOW COLUMNS FROM orders LIKE 'delivery_notes'");
      if (notesColumns.length === 0) {
        console.log('❌ orders table missing delivery_notes column!');
        await connection.execute("ALTER TABLE orders ADD COLUMN delivery_notes TEXT NULL");
        console.log('✅ Added delivery_notes column to orders table');
      } else {
        console.log('✅ orders table has delivery_notes column');
      }
      
    } catch (error) {
      console.error('❌ Error checking orders table:', error.message);
    }
    
    console.log('🎉 Database structure test completed!');
    
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

testDatabaseStructure();
