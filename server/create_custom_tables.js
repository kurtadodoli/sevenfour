const mysql = require('mysql2/promise');

async function createCustomOrdersTables() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 's3v3n-f0ur-cl0thing*',
    database: 'seven_four_clothing',
    port: 3306
  });
  
  console.log('Connected to database');
  
  try {
    // Drop existing tables
    console.log('Dropping existing tables...');
    await connection.execute('DROP TABLE IF EXISTS custom_order_communications');
    await connection.execute('DROP TABLE IF EXISTS custom_order_status_history');
    await connection.execute('DROP TABLE IF EXISTS custom_order_images');
    await connection.execute('DROP TABLE IF EXISTS custom_orders');
    console.log('✅ Tables dropped');
    
    // Create custom_orders table
    console.log('Creating custom_orders table...');
    await connection.execute(`      CREATE TABLE custom_orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        custom_order_id VARCHAR(50) UNIQUE NOT NULL,
        user_id BIGINT NULL,  -- Allow NULL for guests
        product_type ENUM('t-shirts', 'shorts', 'hoodies', 'jackets', 'sweaters', 'jerseys') NOT NULL,
        
        -- Product customization details
        size VARCHAR(10) NOT NULL,
        color VARCHAR(50) NOT NULL,
        quantity INT NOT NULL DEFAULT 1,
        urgency ENUM('standard', 'express', 'rush') DEFAULT 'standard',
        special_instructions TEXT,
        
        -- Customer information
        customer_name VARCHAR(255) NOT NULL,
        customer_email VARCHAR(255) NOT NULL,
        customer_phone VARCHAR(20),
        
        -- Shipping address
        province VARCHAR(100) NOT NULL,
        municipality VARCHAR(100) NOT NULL,
        street_number VARCHAR(255) NOT NULL,
        house_number VARCHAR(100),
        barangay VARCHAR(100),
        postal_code VARCHAR(20),
        
        -- Order status and tracking
        status ENUM('pending', 'under_review', 'approved', 'in_production', 'quality_check', 'ready_for_shipping', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
        estimated_price DECIMAL(10, 2) DEFAULT 0.00,
        final_price DECIMAL(10, 2) DEFAULT 0.00,
        payment_status ENUM('pending', 'paid', 'refunded') DEFAULT 'pending',
        payment_method ENUM('cash_on_delivery', 'online_payment') DEFAULT 'cash_on_delivery',
        
        -- Admin notes and updates
        admin_notes TEXT,
        production_notes TEXT,
        estimated_delivery_date DATE,
        actual_delivery_date DATE,
        
        -- Timestamps
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          -- Foreign key constraints (user_id can be NULL for guest orders)
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
        
        -- Indexes for better performance
        INDEX idx_custom_order_id (custom_order_id),
        INDEX idx_user_id (user_id),
        INDEX idx_status (status),
        INDEX idx_product_type (product_type),
        INDEX idx_created_at (created_at),
        INDEX idx_customer_email (customer_email)
      )
    `);
    console.log('✅ custom_orders table created');
    
    // Create custom_order_images table
    console.log('Creating custom_order_images table...');
    await connection.execute(`
      CREATE TABLE custom_order_images (
        id INT AUTO_INCREMENT PRIMARY KEY,
        custom_order_id VARCHAR(50) NOT NULL,
        image_filename VARCHAR(255) NOT NULL,
        original_filename VARCHAR(255) NOT NULL,
        image_path VARCHAR(500) NOT NULL,
        image_url VARCHAR(500),
        image_size INT,
        mime_type VARCHAR(50),
        upload_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        FOREIGN KEY (custom_order_id) REFERENCES custom_orders(custom_order_id) ON DELETE CASCADE,
        INDEX idx_custom_order_id (custom_order_id),
        INDEX idx_upload_order (upload_order)
      )
    `);
    console.log('✅ custom_order_images table created');
    
    // Create custom_order_status_history table
    console.log('Creating custom_order_status_history table...');
    await connection.execute(`
      CREATE TABLE custom_order_status_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        custom_order_id VARCHAR(50) NOT NULL,
        old_status VARCHAR(50),
        new_status VARCHAR(50) NOT NULL,
        changed_by BIGINT,
        change_reason TEXT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        FOREIGN KEY (custom_order_id) REFERENCES custom_orders(custom_order_id) ON DELETE CASCADE,
        FOREIGN KEY (changed_by) REFERENCES users(user_id) ON DELETE SET NULL,
        INDEX idx_custom_order_id (custom_order_id),
        INDEX idx_created_at (created_at)
      )
    `);
    console.log('✅ custom_order_status_history table created');
    
    // Create custom_order_communications table
    console.log('Creating custom_order_communications table...');
    await connection.execute(`
      CREATE TABLE custom_order_communications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        custom_order_id VARCHAR(50) NOT NULL,
        sender_id BIGINT NOT NULL,
        sender_type ENUM('customer', 'admin', 'system') NOT NULL,
        message TEXT NOT NULL,
        attachment_path VARCHAR(500),
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        FOREIGN KEY (custom_order_id) REFERENCES custom_orders(custom_order_id) ON DELETE CASCADE,
        FOREIGN KEY (sender_id) REFERENCES users(user_id) ON DELETE CASCADE,
        INDEX idx_custom_order_id (custom_order_id),
        INDEX idx_sender_id (sender_id),
        INDEX idx_created_at (created_at),
        INDEX idx_is_read (is_read)
      )
    `);
    console.log('✅ custom_order_communications table created');
    
    console.log('🎉 All custom orders tables created successfully!');
    
    // Verify tables
    const [tables] = await connection.execute("SHOW TABLES LIKE 'custom%'");
    console.log('\\nVerified tables:');
    tables.forEach(table => console.log('  ✅', Object.values(table)[0]));
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await connection.end();
  }
}

createCustomOrdersTables();
