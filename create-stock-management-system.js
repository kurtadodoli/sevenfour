const mysql = require('mysql2/promise');

async function createStockManagementSystem() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 's3v3n-f0ur-cl0thing*',
    database: 'seven_four_clothing'
  });

  try {
    console.log('🎯 Creating Stock Management System...\n');
    
    // Step 1: Create product_stock table for detailed stock tracking
    console.log('1️⃣ Creating product_stock table...');
    
    const createStockTable = `
      CREATE TABLE IF NOT EXISTS product_stock (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id BIGINT NOT NULL,
        size VARCHAR(10) NOT NULL,
        stock_quantity INT NOT NULL DEFAULT 0,
        reserved_quantity INT NOT NULL DEFAULT 0,
        available_quantity INT GENERATED ALWAYS AS (stock_quantity - reserved_quantity) STORED,
        low_stock_threshold INT DEFAULT 10,
        critical_stock_threshold INT DEFAULT 5,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_product_id (product_id),
        INDEX idx_product_size (product_id, size),
        UNIQUE KEY unique_product_size (product_id, size),
        FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
      )
    `;
    
    await connection.execute(createStockTable);
    console.log('   ✅ product_stock table created');
      // Step 2: Update products table to include better stock tracking
    console.log('2️⃣ Adding stock summary columns to products table...');
    
    const columnsToAdd = [
      'total_available_stock INT DEFAULT 0',
      'total_reserved_stock INT DEFAULT 0',
      'stock_status ENUM(\'in_stock\', \'low_stock\', \'critical_stock\', \'out_of_stock\') DEFAULT \'in_stock\'',
      'last_stock_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
    ];
    
    for (const column of columnsToAdd) {
      try {
        await connection.execute(`ALTER TABLE products ADD COLUMN ${column}`);
        console.log(`   ✅ Added column: ${column.split(' ')[0]}`);
      } catch (error) {
        if (error.message.includes('Duplicate column name')) {
          console.log(`   ℹ️ Column ${column.split(' ')[0]} already exists`);
        } else {
          console.log(`   ⚠️ Could not add column ${column.split(' ')[0]}: ${error.message}`);
        }
      }
    }
    
    // Step 3: Create stored procedures for stock management
    console.log('3️⃣ Creating stock management procedures...');
    
    // Procedure to update product stock summary
    const createUpdateStockSummaryProc = `
      CREATE PROCEDURE IF NOT EXISTS UpdateProductStockSummary(IN p_product_id BIGINT)
      BEGIN
        DECLARE total_stock INT DEFAULT 0;
        DECLARE total_reserved INT DEFAULT 0;
        DECLARE available_stock INT DEFAULT 0;
        DECLARE stock_status_val VARCHAR(20) DEFAULT 'in_stock';
        
        -- Calculate totals from product_stock table
        SELECT 
          COALESCE(SUM(stock_quantity), 0),
          COALESCE(SUM(reserved_quantity), 0),
          COALESCE(SUM(available_quantity), 0)
        INTO total_stock, total_reserved, available_stock
        FROM product_stock 
        WHERE product_id = p_product_id;
        
        -- Determine stock status
        IF available_stock = 0 THEN
          SET stock_status_val = 'out_of_stock';
        ELSEIF available_stock <= 5 THEN
          SET stock_status_val = 'critical_stock';
        ELSEIF available_stock <= 15 THEN
          SET stock_status_val = 'low_stock';
        ELSE
          SET stock_status_val = 'in_stock';
        END IF;
        
        -- Update products table
        UPDATE products 
        SET 
          total_stock = total_stock,
          total_available_stock = available_stock,
          total_reserved_stock = total_reserved,
          stock_status = stock_status_val,
          last_stock_update = CURRENT_TIMESTAMP
        WHERE product_id = p_product_id;
      END
    `;
    
    // Drop procedure if exists and recreate
    await connection.execute('DROP PROCEDURE IF EXISTS UpdateProductStockSummary');
    await connection.execute(createUpdateStockSummaryProc);
    console.log('   ✅ UpdateProductStockSummary procedure created');
    
    // Step 4: Migrate existing size data to stock table
    console.log('4️⃣ Migrating existing size data to stock table...');
    
    const [existingProducts] = await connection.execute(`
      SELECT product_id, sizes FROM products WHERE sizes IS NOT NULL AND sizes != ''
    `);
    
    let migratedCount = 0;
    for (const product of existingProducts) {
      try {
        const sizes = JSON.parse(product.sizes || '[]');
        
        for (const sizeData of sizes) {
          if (sizeData.size && typeof sizeData.stock === 'number') {
            // Insert or update stock record
            await connection.execute(`
              INSERT INTO product_stock (product_id, size, stock_quantity)
              VALUES (?, ?, ?)
              ON DUPLICATE KEY UPDATE 
                stock_quantity = VALUES(stock_quantity),
                last_updated = CURRENT_TIMESTAMP
            `, [product.product_id, sizeData.size, sizeData.stock]);
          }
        }
        
        // Update product stock summary
        await connection.execute('CALL UpdateProductStockSummary(?)', [product.product_id]);
        migratedCount++;
        
      } catch (error) {
        console.log(`   ⚠️ Could not migrate sizes for product ${product.product_id}: ${error.message}`);
      }
    }
    
    console.log(`   ✅ Migrated stock data for ${migratedCount} products`);
    
    // Step 5: Create sample stock data for products without stock
    console.log('5️⃣ Adding sample stock data for products without stock...');
    
    const [productsWithoutStock] = await connection.execute(`
      SELECT p.product_id, p.productname, p.product_type
      FROM products p
      LEFT JOIN product_stock ps ON p.product_id = ps.product_id
      WHERE ps.product_id IS NULL
      LIMIT 10
    `);
    
    const standardSizes = {
      't-shirts': ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      'hoodies': ['S', 'M', 'L', 'XL', 'XXL'],
      'shorts': ['XS', 'S', 'M', 'L', 'XL'],
      'jackets': ['S', 'M', 'L', 'XL', 'XXL'],
      'jerseys': ['S', 'M', 'L', 'XL', 'XXL'],
      'sweaters': ['S', 'M', 'L', 'XL', 'XXL'],
      'bags': ['One Size'],
      'hats': ['One Size']
    };
    
    for (const product of productsWithoutStock) {
      const sizes = standardSizes[product.product_type] || ['S', 'M', 'L', 'XL'];
      
      for (const size of sizes) {
        // Random stock between 0-50 for demonstration
        const stockQty = Math.floor(Math.random() * 51);
        
        await connection.execute(`
          INSERT INTO product_stock (product_id, size, stock_quantity)
          VALUES (?, ?, ?)
        `, [product.product_id, size, stockQty]);
      }
      
      // Update product stock summary
      await connection.execute('CALL UpdateProductStockSummary(?)', [product.product_id]);
    }
    
    console.log(`   ✅ Added sample stock data for ${productsWithoutStock.length} products`);
    
    // Step 6: Create stock summary view
    console.log('6️⃣ Creating stock summary views...');
    
    const createStockSummaryView = `
      CREATE OR REPLACE VIEW product_stock_summary AS
      SELECT 
        p.product_id,
        p.productname,
        p.productcolor,
        p.productprice,
        p.product_type,
        p.total_available_stock,
        p.total_reserved_stock,
        p.stock_status,
        GROUP_CONCAT(
          CONCAT(ps.size, ':', ps.available_quantity) 
          ORDER BY 
            CASE ps.size
              WHEN 'XS' THEN 1
              WHEN 'S' THEN 2
              WHEN 'M' THEN 3
              WHEN 'L' THEN 4
              WHEN 'XL' THEN 5
              WHEN 'XXL' THEN 6
              WHEN 'One Size' THEN 7
              ELSE 8
            END
          SEPARATOR ','
        ) AS size_stock_breakdown,
        COUNT(ps.id) as total_sizes,
        SUM(CASE WHEN ps.available_quantity = 0 THEN 1 ELSE 0 END) as out_of_stock_sizes,
        SUM(CASE WHEN ps.available_quantity <= ps.critical_stock_threshold AND ps.available_quantity > 0 THEN 1 ELSE 0 END) as critical_stock_sizes,
        SUM(CASE WHEN ps.available_quantity <= ps.low_stock_threshold AND ps.available_quantity > ps.critical_stock_threshold THEN 1 ELSE 0 END) as low_stock_sizes
      FROM products p
      LEFT JOIN product_stock ps ON p.product_id = ps.product_id
      WHERE p.status = 'active'
      GROUP BY p.product_id, p.productname, p.productcolor, p.productprice, p.product_type, p.total_available_stock, p.total_reserved_stock, p.stock_status
    `;
    
    await connection.execute(createStockSummaryView);
    console.log('   ✅ product_stock_summary view created');
    
    // Step 7: Show current stock status
    console.log('7️⃣ Current stock status summary...');
    
    const [stockStats] = await connection.execute(`
      SELECT 
        COUNT(*) as total_products,
        SUM(total_available_stock) as total_stock_units,
        COUNT(CASE WHEN stock_status = 'out_of_stock' THEN 1 END) as out_of_stock_products,
        COUNT(CASE WHEN stock_status = 'critical_stock' THEN 1 END) as critical_stock_products,
        COUNT(CASE WHEN stock_status = 'low_stock' THEN 1 END) as low_stock_products,
        COUNT(CASE WHEN stock_status = 'in_stock' THEN 1 END) as in_stock_products
      FROM products
      WHERE status = 'active'
    `);
    
    const stats = stockStats[0];
    console.log(`   📊 Total Products: ${stats.total_products}`);
    console.log(`   📦 Total Stock Units: ${stats.total_stock_units}`);
    console.log(`   🔴 Out of Stock: ${stats.out_of_stock_products}`);
    console.log(`   🔴 Critical Stock: ${stats.critical_stock_products}`);
    console.log(`   🟡 Low Stock: ${stats.low_stock_products}`);
    console.log(`   🟢 In Stock: ${stats.in_stock_products}`);
    
    console.log('\n✅ STOCK MANAGEMENT SYSTEM CREATED SUCCESSFULLY!');
    console.log('\n📋 What was created:');
    console.log('- product_stock table for detailed size-specific stock tracking');
    console.log('- Stock summary columns in products table');
    console.log('- UpdateProductStockSummary stored procedure');
    console.log('- product_stock_summary view for easy querying');
    console.log('- Migrated existing size data to new stock system');
    console.log('- Added sample stock data for products without stock');
    
    console.log('\n🎯 Next Steps:');
    console.log('- Update InventoryPage to use the new stock system');
    console.log('- Stock data will now properly display in the inventory');
    console.log('- Use UpdateProductStockSummary(product_id) to refresh stock totals');
    
  } catch (error) {
    console.error('❌ Error creating stock management system:', error.message);
  } finally {
    await connection.end();
  }
}

createStockManagementSystem();
