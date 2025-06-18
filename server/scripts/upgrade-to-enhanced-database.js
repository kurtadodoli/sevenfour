const { pool } = require('../config/db.js');

async function upgradeToEnhancedDatabase() {
  try {
    console.log('🔄 Upgrading database for enhanced size-color-stock tracking...');
    
    // Check if we need to add columns to existing products table
    console.log('Checking existing products table structure...');
    const [columns] = await pool.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'products'
    `);
    
    const existingColumns = columns.map(col => col.COLUMN_NAME);
    console.log('Existing columns:', existingColumns);
    
    // Add missing columns if needed
    if (!existingColumns.includes('category')) {
      console.log('Adding category column...');
      await pool.query(`ALTER TABLE products ADD COLUMN category VARCHAR(50) DEFAULT 'Clothing'`);
    }
    
    if (!existingColumns.includes('status')) {
      console.log('Adding status column...');
      await pool.query(`ALTER TABLE products ADD COLUMN status ENUM('active', 'inactive', 'archived') DEFAULT 'active'`);
    }
    
    if (!existingColumns.includes('is_archived')) {
      console.log('Adding is_archived column...');
      await pool.query(`ALTER TABLE products ADD COLUMN is_archived BOOLEAN DEFAULT FALSE`);
    }
    
    if (!existingColumns.includes('name')) {
      console.log('Adding name column (mapped from productname)...');
      await pool.query(`ALTER TABLE products ADD COLUMN name VARCHAR(255)`);
      // Copy data from productname to name
      await pool.query(`UPDATE products SET name = productname WHERE name IS NULL`);
    }
    
    if (!existingColumns.includes('description')) {
      console.log('Adding description column (mapped from productdescription)...');
      await pool.query(`ALTER TABLE products ADD COLUMN description TEXT`);
      // Copy data from productdescription to description
      await pool.query(`UPDATE products SET description = productdescription WHERE description IS NULL`);
    }
    
    if (!existingColumns.includes('price')) {
      console.log('Adding price column (mapped from productprice)...');
      await pool.query(`ALTER TABLE products ADD COLUMN price DECIMAL(10, 2)`);
      // Copy data from productprice to price
      await pool.query(`UPDATE products SET price = productprice WHERE price IS NULL`);
    }
    
    // Create product_variants table if it doesn't exist
    console.log('Creating/updating product_variants table...');
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
        INDEX idx_size_color (product_id, size, color),
        FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
      )
    `);
      // Create product_images table if it doesn't exist
    console.log('Creating/updating product_images table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS product_images (
        image_id BIGINT PRIMARY KEY AUTO_INCREMENT,
        product_id BIGINT NOT NULL,
        image_filename VARCHAR(255) NOT NULL,
        image_order INT DEFAULT 0,
        is_thumbnail BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
        INDEX idx_product_order (product_id, image_order)
      )
    `);
    
    // Migrate existing product data to new structure
    console.log('Migrating existing product data...');
    
    // Get products that don't have variants yet
    const [productsToMigrate] = await pool.query(`
      SELECT p.product_id, p.productname, p.sizes, p.productcolor, p.total_stock, p.productimage
      FROM products p
      LEFT JOIN product_variants pv ON p.product_id = pv.product_id
      WHERE pv.product_id IS NULL
    `);
    
    console.log(`Found ${productsToMigrate.length} products to migrate...`);
    
    for (const product of productsToMigrate) {
      console.log(`Migrating product: ${product.productname}`);
      
      // Parse existing sizes
      let sizes = [];
      try {
        if (product.sizes) {
          sizes = JSON.parse(product.sizes);
        }
      } catch (e) {
        console.warn(`Could not parse sizes for product ${product.product_id}:`, product.sizes);
      }
      
      // If no sizes, create default sizes
      if (sizes.length === 0) {
        sizes = [
          { size: 'S', stock: 0 },
          { size: 'M', stock: 0 },
          { size: 'L', stock: 0 },
          { size: 'XL', stock: 0 }
        ];
      }
      
      // Create variants for each size with the product color
      const defaultColor = product.productcolor || 'Black';
      for (const sizeInfo of sizes) {
        const stock = sizeInfo.stock || 0;
        await pool.query(`
          INSERT INTO product_variants (product_id, size, color, stock_quantity)
          VALUES (?, ?, ?, ?)
        `, [product.product_id, sizeInfo.size, defaultColor, stock]);
      }
        // Migrate product image if exists
      if (product.productimage) {
        await pool.query(`
          INSERT IGNORE INTO product_images (product_id, image_filename, image_order, is_thumbnail)
          VALUES (?, ?, 0, TRUE)
        `, [product.product_id, product.productimage]);
      }
    }
    
    // Update category for existing products
    console.log('Setting default categories...');
    await pool.query(`
      UPDATE products 
      SET category = CASE 
        WHEN product_type IS NOT NULL THEN product_type
        ELSE 'Clothing'
      END
      WHERE category IS NULL OR category = ''
    `);
    
    // Update status based on productstatus
    console.log('Migrating status field...');
    await pool.query(`
      UPDATE products 
      SET status = CASE 
        WHEN productstatus = 'active' THEN 'active'
        WHEN productstatus = 'archived' THEN 'archived'
        ELSE 'active'
      END,
      is_archived = CASE 
        WHEN productstatus = 'archived' THEN TRUE
        ELSE FALSE
      END
      WHERE (status IS NULL OR status = '') OR is_archived IS NULL
    `);
    
    // Create indexes for better performance
    console.log('Creating performance indexes...');
    try {
      await pool.query('CREATE INDEX IF NOT EXISTS idx_products_status ON products(status)');
      await pool.query('CREATE INDEX IF NOT EXISTS idx_products_category ON products(category)');
      await pool.query('CREATE INDEX IF NOT EXISTS idx_products_archived ON products(is_archived)');
    } catch (e) {
      console.log('Some indexes may already exist, continuing...');
    }
    
    // Verify the migration
    console.log('Verifying migration...');
    const [productCount] = await pool.query('SELECT COUNT(*) as count FROM products');
    const [variantCount] = await pool.query('SELECT COUNT(*) as count FROM product_variants');
    const [imageCount] = await pool.query('SELECT COUNT(*) as count FROM product_images');
    
    console.log(`✅ Migration complete!`);
    console.log(`   Products: ${productCount[0].count}`);
    console.log(`   Variants: ${variantCount[0].count}`);
    console.log(`   Images: ${imageCount[0].count}`);
    
    // Show sample data
    const [sampleProducts] = await pool.query(`
      SELECT 
        p.product_id,
        p.name,
        p.category,
        p.status,
        COUNT(DISTINCT pv.variant_id) as variant_count,
        COUNT(DISTINCT pi.image_id) as image_count
      FROM products p
      LEFT JOIN product_variants pv ON p.product_id = pv.product_id
      LEFT JOIN product_images pi ON p.product_id = pi.product_id
      GROUP BY p.product_id
      LIMIT 5
    `);
    
    console.log('\n📊 Sample migrated products:');
    console.table(sampleProducts);
    
  } catch (error) {
    console.error('❌ Error during database upgrade:', error);
    throw error;
  }
}

// Run the upgrade if this file is executed directly
if (require.main === module) {
  upgradeToEnhancedDatabase()
    .then(() => {
      console.log('Database upgrade completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Database upgrade failed:', error);
      process.exit(1);
    });
}

module.exports = { upgradeToEnhancedDatabase };
