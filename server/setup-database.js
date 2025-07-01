const { pool } = require('./config/db.js');

async function setupDatabase() {
  try {
    console.log('Setting up database tables...');
    
    // Create products table
    console.log('Creating products table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        product_id BIGINT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(50) NOT NULL,
        brand VARCHAR(100),
        price DECIMAL(10, 2) NOT NULL,
        cost_price DECIMAL(10, 2),
        status ENUM('active', 'inactive') DEFAULT 'active',
        is_featured BOOLEAN DEFAULT FALSE,
        stock_status ENUM('in_stock', 'low_stock', 'out_of_stock') DEFAULT 'in_stock',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        created_by BIGINT,
        updated_by BIGINT,
        is_archived BOOLEAN DEFAULT FALSE,
        INDEX idx_category (category),
        INDEX idx_status (status),
        INDEX idx_featured (is_featured)
      )
    `);
    
    // Create product_categories table
    console.log('Creating product_categories table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS product_categories (
        category_id INT PRIMARY KEY AUTO_INCREMENT,
        category_name VARCHAR(50) UNIQUE NOT NULL,
        parent_category_id INT,
        description TEXT
      )
    `);
    
    // Insert default categories
    await pool.query(`
      INSERT IGNORE INTO product_categories (category_name) VALUES 
      ('T-Shirts'),
      ('Hoodies'),
      ('Shorts'),
      ('Jackets'),
      ('Accessories')
    `);
    
    // Create product_variants table
    console.log('Creating product_variants table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS product_variants (
        variant_id BIGINT PRIMARY KEY AUTO_INCREMENT,
        product_id BIGINT NOT NULL,
        size VARCHAR(20),
        color VARCHAR(50),
        sku VARCHAR(100),
        stock_quantity INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_product (product_id),
        INDEX idx_stock (stock_quantity),
        FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
      )
    `);
    
    // Create product_sizes table
    console.log('Creating product_sizes table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS product_sizes (
        id BIGINT PRIMARY KEY AUTO_INCREMENT,
        product_id BIGINT NOT NULL,
        size VARCHAR(20) NOT NULL,
        UNIQUE KEY unique_product_size (product_id, size),
        FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
      )
    `);
    
    // Create product_colors table
    console.log('Creating product_colors table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS product_colors (
        id BIGINT PRIMARY KEY AUTO_INCREMENT,
        product_id BIGINT NOT NULL,
        color VARCHAR(50) NOT NULL,
        color_code VARCHAR(10),
        UNIQUE KEY unique_product_color (product_id, color),
        FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
      )
    `);
    
    // Create product_images table
    console.log('Creating product_images table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS product_images (
        image_id BIGINT PRIMARY KEY AUTO_INCREMENT,
        product_id BIGINT NOT NULL,
        image_url VARCHAR(255) NOT NULL,
        display_order INT DEFAULT 0,
        is_primary BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
        INDEX idx_product_order (product_id, display_order)
      )
    `);
      // Create carts table
    console.log('Creating carts table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS carts (
        id BIGINT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_user_cart (user_id),
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
      )
    `);
    
    // Create cart_items table
    console.log('Creating cart_items table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS cart_items (
        id BIGINT PRIMARY KEY AUTO_INCREMENT,
        cart_id BIGINT NOT NULL,
        product_id BIGINT NOT NULL,
        color_id BIGINT,
        size_id BIGINT,
        quantity INT NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_cart (cart_id),
        INDEX idx_product (product_id),
        UNIQUE KEY unique_cart_product_variant (cart_id, product_id, color_id, size_id),
        FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
        FOREIGN KEY (color_id) REFERENCES product_colors(id) ON DELETE SET NULL,
        FOREIGN KEY (size_id) REFERENCES product_sizes(id) ON DELETE SET NULL
      )
    `);
    
    // Create custom design requests table
    console.log('Creating custom_design_requests table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS custom_design_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        design_id VARCHAR(50) UNIQUE NOT NULL,
        user_id VARCHAR(16) NOT NULL,
        design_name VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        preferred_color VARCHAR(100),
        size VARCHAR(50),
        description TEXT NOT NULL,
        special_requests TEXT,
        budget VARCHAR(50),
        urgency ENUM('normal', 'rush', 'express') DEFAULT 'normal',
        images JSON,
        status ENUM('pending', 'approved', 'rejected', 'in_progress', 'completed') DEFAULT 'pending',
        admin_notes TEXT,
        estimated_price DECIMAL(10, 2),
        estimated_days INT,
        admin_id VARCHAR(16),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        INDEX idx_user_id (user_id),
        INDEX idx_status (status),
        INDEX idx_created_at (created_at)
      )
    `);
    console.log('✅ custom_design_requests table created successfully');

    // Create orders table
    console.log('Creating orders table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id BIGINT PRIMARY KEY AUTO_INCREMENT,
        order_number VARCHAR(50) UNIQUE NOT NULL,
        user_id BIGINT NOT NULL,
        invoice_id VARCHAR(50) NOT NULL,
        transaction_id VARCHAR(50) NOT NULL,
        total_amount DECIMAL(10, 2) NOT NULL,
        shipping_address TEXT NOT NULL,
        contact_phone VARCHAR(20) NOT NULL,
        notes TEXT,
        status ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
        order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_user_id (user_id),
        INDEX idx_order_number (order_number),
        INDEX idx_status (status),
        INDEX idx_order_date (order_date),
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
      )
    `);
    
    // Create order_invoices table
    console.log('Creating order_invoices table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS order_invoices (
        id BIGINT PRIMARY KEY AUTO_INCREMENT,
        invoice_id VARCHAR(50) UNIQUE NOT NULL,
        user_id BIGINT NOT NULL,
        total_amount DECIMAL(10, 2) NOT NULL,
        customer_name VARCHAR(255) NOT NULL,
        customer_email VARCHAR(255) NOT NULL,
        customer_phone VARCHAR(20) NOT NULL,
        delivery_address TEXT NOT NULL,
        notes TEXT,
        invoice_status ENUM('pending', 'paid', 'cancelled') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_user_id (user_id),
        INDEX idx_invoice_id (invoice_id),
        INDEX idx_status (invoice_status),
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
      )
    `);
    
    // Create sales_transactions table
    console.log('Creating sales_transactions table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sales_transactions (
        id BIGINT PRIMARY KEY AUTO_INCREMENT,
        transaction_id VARCHAR(50) UNIQUE NOT NULL,
        invoice_id VARCHAR(50) NOT NULL,
        user_id BIGINT NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        payment_method ENUM('cash_on_delivery', 'credit_card', 'paypal', 'bank_transfer') DEFAULT 'cash_on_delivery',
        transaction_status ENUM('pending', 'completed', 'failed', 'cancelled') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_transaction_id (transaction_id),
        INDEX idx_user_id (user_id),
        INDEX idx_status (transaction_status),
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
      )
    `);
    
    // Create order_items table  
    console.log('Creating order_items table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id BIGINT PRIMARY KEY AUTO_INCREMENT,
        order_id BIGINT,
        invoice_id VARCHAR(50) NOT NULL,
        product_id BIGINT NOT NULL,
        product_name VARCHAR(255) NOT NULL,
        product_price DECIMAL(10, 2) NOT NULL,
        quantity INT NOT NULL DEFAULT 1,
        color VARCHAR(100),
        size VARCHAR(50),
        subtotal DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_order_id (order_id),
        INDEX idx_invoice_id (invoice_id),
        INDEX idx_product_id (product_id),
        FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
      )
    `);

    // Create cancellation_requests table
    console.log('Creating cancellation_requests table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS cancellation_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        user_id INT NOT NULL,
        reason TEXT NOT NULL,
        status ENUM('pending', 'approved', 'denied') DEFAULT 'pending',
        requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        processed_at TIMESTAMP NULL,
        processed_by INT NULL,
        admin_notes TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        INDEX idx_order_id (order_id),
        INDEX idx_user_id (user_id),
        INDEX idx_status (status),
        INDEX idx_requested_at (requested_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Verify tables were created
    console.log('Verifying tables...');
    const [tables] = await pool.query('SHOW TABLES');
    console.log('Available tables:', tables.map(t => Object.values(t)[0]));
    
    console.log('Database setup completed successfully!');
    
  } catch (error) {
    console.error('Error setting up database:', error);
  } finally {
    process.exit(0);
  }
}

setupDatabase();
