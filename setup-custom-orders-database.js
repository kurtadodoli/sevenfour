const mysql = require('mysql2/promise');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, 'server', '.env') });

async function createCustomOrdersDatabase() {
  let connection;
  
  try {
    console.log('=== CREATING CUSTOM ORDERS DATABASE ===\n');
    
    // Connect to database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 's3v3n-f0ur-cl0thing*',
      database: process.env.DB_NAME || 'seven_four_clothing',
      port: process.env.DB_PORT || 3306
    });
    
    console.log('✅ Connected to database successfully');
    
    // Check if custom_orders table exists
    const [existingTables] = await connection.execute(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = '${process.env.DB_NAME || 'seven_four_clothing'}' 
      AND TABLE_NAME IN ('custom_orders', 'custom_order_images')
    `);
    
    console.log('\n📋 Existing custom order tables:');
    existingTables.forEach(table => console.log(`   - ${table.TABLE_NAME}`));
    
    if (existingTables.length === 0) {
      console.log('\n🔨 Creating custom orders tables...');
      
      // Create custom_orders table
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS custom_orders (
          id INT AUTO_INCREMENT PRIMARY KEY,
          custom_order_id VARCHAR(50) UNIQUE NOT NULL,
          user_id BIGINT NULL,
          
          -- Product Information
          product_type ENUM('t-shirts', 'shorts', 'hoodies', 'jackets', 'sweaters', 'jerseys') NOT NULL,
          product_name VARCHAR(255) NULL,
          size ENUM('XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL') NOT NULL,
          color VARCHAR(50) NOT NULL,
          quantity INT NOT NULL DEFAULT 1,
          urgency ENUM('standard', 'express', 'rush') DEFAULT 'standard',
          special_instructions TEXT NULL,
          
          -- Customer Information
          customer_name VARCHAR(255) NOT NULL,
          customer_email VARCHAR(255) NOT NULL,
          customer_phone VARCHAR(20) NULL,
          
          -- Shipping Address (Metro Manila only)
          province VARCHAR(50) DEFAULT 'Metro Manila',
          municipality ENUM(
            'Caloocan', 'Las Piñas', 'Makati', 'Malabon', 'Mandaluyong', 'Manila', 
            'Marikina', 'Muntinlupa', 'Navotas', 'Parañaque', 'Pasay', 'Pasig', 
            'Pateros', 'Quezon City', 'San Juan', 'Taguig', 'Valenzuela'
          ) NOT NULL,
          street_number VARCHAR(500) NOT NULL,
          house_number VARCHAR(100) NULL,
          barangay VARCHAR(100) NULL,
          postal_code VARCHAR(10) NULL,
          
          -- Pricing and Status
          estimated_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
          final_price DECIMAL(10, 2) NULL,
          status ENUM('pending', 'under_review', 'approved', 'in_production', 'ready_for_delivery', 'completed', 'cancelled') DEFAULT 'pending',
          admin_notes TEXT NULL,
          
          -- Timestamps
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          
          -- Indexes
          INDEX idx_custom_order_id (custom_order_id),
          INDEX idx_user_id (user_id),
          INDEX idx_status (status),
          INDEX idx_product_type (product_type),
          INDEX idx_customer_email (customer_email),
          INDEX idx_created_at (created_at),
          INDEX idx_municipality (municipality)
        )
      `);
      
      console.log('✅ Created custom_orders table');
      
      // Create custom_order_images table
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS custom_order_images (
          id INT AUTO_INCREMENT PRIMARY KEY,
          custom_order_id VARCHAR(50) NOT NULL,
          image_filename VARCHAR(255) NOT NULL,
          original_filename VARCHAR(255) NOT NULL,
          image_path VARCHAR(500) NOT NULL,
          image_url VARCHAR(500) NULL,
          image_size INT NULL,
          mime_type VARCHAR(50) NULL,
          upload_order INT DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          
          FOREIGN KEY (custom_order_id) REFERENCES custom_orders(custom_order_id) ON DELETE CASCADE,
          INDEX idx_custom_order_id (custom_order_id),
          INDEX idx_upload_order (upload_order),
          INDEX idx_created_at (created_at)
        )
      `);
      
      console.log('✅ Created custom_order_images table');
      
    } else {
      console.log('\n✅ Tables already exist, checking structure...');
      
      // Check if product_name column exists in custom_orders table
      const [columns] = await connection.execute(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = '${process.env.DB_NAME || 'seven_four_clothing'}' 
        AND TABLE_NAME = 'custom_orders' 
        AND COLUMN_NAME = 'product_name'
      `);
      
      if (columns.length === 0) {
        console.log('🔧 Adding product_name column to custom_orders table...');
        await connection.execute(`
          ALTER TABLE custom_orders 
          ADD COLUMN product_name VARCHAR(255) NULL AFTER product_type
        `);
        await connection.execute(`
          ALTER TABLE custom_orders 
          ADD INDEX idx_product_name (product_name)
        `);
        console.log('✅ Added product_name column');
      }
    }
    
    // Verify table structures
    console.log('\n📊 Table Structures:');
    
    const [orderColumns] = await connection.execute('DESCRIBE custom_orders');
    console.log('\nCUSTOM_ORDERS TABLE:');
    orderColumns.forEach(col => {
      console.log(`   ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(nullable)' : '(required)'}`);
    });
    
    const [imageColumns] = await connection.execute('DESCRIBE custom_order_images');
    console.log('\nCUSTOM_ORDER_IMAGES TABLE:');
    imageColumns.forEach(col => {
      console.log(`   ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(nullable)' : '(required)'}`);
    });
    
    // Check data count
    const [orderCount] = await connection.execute('SELECT COUNT(*) as count FROM custom_orders');
    const [imageCount] = await connection.execute('SELECT COUNT(*) as count FROM custom_order_images');
    
    console.log('\n📈 Current Data:');
    console.log(`   Custom Orders: ${orderCount[0].count}`);
    console.log(`   Order Images: ${imageCount[0].count}`);
    
    console.log('\n🎉 Custom Orders Database Setup Complete!');
    console.log('\nThe database is ready to store all CustomPage.js form data:');
    console.log('✓ Product selection (type, name, size, color, quantity)');
    console.log('✓ Design images (up to 10 images with metadata)');
    console.log('✓ Customer information (name, email, phone)');
    console.log('✓ Shipping details (Metro Manila addresses)');
    console.log('✓ Order status and pricing');
    console.log('✓ Timestamps and user tracking');
    
  } catch (error) {
    console.error('❌ Error setting up database:', error.message);
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('\n💡 Database access denied. Please check:');
      console.log('   - MySQL is running');
      console.log('   - Database credentials in server/.env');
      console.log('   - Database "seven_four_clothing" exists');
    }
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the setup
createCustomOrdersDatabase();
