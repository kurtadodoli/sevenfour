const mysql = require('mysql2/promise');

async function createCustomDesignTables() {
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
    console.log('Dropping existing custom design tables...');
    await connection.execute('DROP TABLE IF EXISTS custom_design_images');
    await connection.execute('DROP TABLE IF EXISTS custom_designs');
    console.log('✅ Tables dropped');
    
    // Create custom_designs table
    console.log('Creating custom_designs table...');
    await connection.execute(`
      CREATE TABLE custom_designs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        design_id VARCHAR(50) UNIQUE NOT NULL,
        user_id BIGINT NULL,
        
        -- Product Information
        product_type ENUM('t-shirts', 'shorts', 'hoodies', 'jackets', 'sweaters', 'jerseys') NOT NULL,
        product_name VARCHAR(255) NOT NULL,
        product_color VARCHAR(50) NOT NULL,
        product_size ENUM('XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL') NOT NULL,
        quantity INT NOT NULL DEFAULT 1,
        additional_info TEXT,
        
        -- Customer Information
        customer_name VARCHAR(255) NOT NULL,
        customer_email VARCHAR(255) NOT NULL,
        customer_phone VARCHAR(20),
        
        -- Metro Manila Shipping Details
        street_address VARCHAR(500) NOT NULL,
        city ENUM(
          'Caloocan', 'Las Piñas', 'Makati', 'Malabon', 'Mandaluyong', 'Manila', 
          'Marikina', 'Muntinlupa', 'Navotas', 'Parañaque', 'Pasay', 'Pasig', 
          'Pateros', 'Quezon City', 'San Juan', 'Taguig', 'Valenzuela'
        ) NOT NULL,
        house_number VARCHAR(100),
        barangay VARCHAR(100),
        postal_code VARCHAR(10),
        
        -- Order Management
        status ENUM('pending', 'under_review', 'approved', 'in_production', 'ready_for_pickup', 'completed', 'cancelled') DEFAULT 'pending',
        estimated_price DECIMAL(10, 2) DEFAULT 0.00,
        final_price DECIMAL(10, 2) DEFAULT 0.00,
        admin_notes TEXT,
        
        -- Timestamps
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        -- Foreign key constraints (user_id can be NULL for guest orders)
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
        
        -- Indexes for better performance
        INDEX idx_design_id (design_id),
        INDEX idx_user_id (user_id),
        INDEX idx_status (status),
        INDEX idx_product_type (product_type),
        INDEX idx_created_at (created_at),
        INDEX idx_customer_email (customer_email)
      )
    `);
    console.log('✅ custom_designs table created');
    
    // Create custom_design_images table
    console.log('Creating custom_design_images table...');
    await connection.execute(`
      CREATE TABLE custom_design_images (
        id INT AUTO_INCREMENT PRIMARY KEY,
        design_id VARCHAR(50) NOT NULL,
        image_filename VARCHAR(255) NOT NULL,
        original_filename VARCHAR(255) NOT NULL,
        image_path VARCHAR(500) NOT NULL,
        image_url VARCHAR(500),
        image_size INT,
        mime_type VARCHAR(50),
        upload_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        FOREIGN KEY (design_id) REFERENCES custom_designs(design_id) ON DELETE CASCADE,
        INDEX idx_design_id (design_id),
        INDEX idx_upload_order (upload_order)
      )
    `);
    console.log('✅ custom_design_images table created');
    
    console.log('🎉 All custom design tables created successfully!');
    
    // Verify tables exist
    const [tables] = await connection.execute("SHOW TABLES LIKE 'custom_design%'");
    console.log('\nVerified tables:');
    tables.forEach(table => {
      console.log(`  ✅ ${Object.values(table)[0]}`);
    });
    
  } catch (error) {
    console.error('❌ Error creating tables:', error);
  } finally {
    await connection.end();
  }
}

// Run the function
createCustomDesignTables();
