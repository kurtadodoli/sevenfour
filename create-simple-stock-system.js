const mysql = require('mysql2/promise');

async function createSimpleStockSystem() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 's3v3n-f0ur-cl0thing*',
    database: 'seven_four_clothing'
  });

  try {
    console.log('🎯 Creating Simple Stock Management System...\n');
    
    // Step 1: Create product_stock table
    console.log('1️⃣ Creating product_stock table...');
    
    const createStockTable = `
      CREATE TABLE IF NOT EXISTS product_stock (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id BIGINT NOT NULL,
        size VARCHAR(10) NOT NULL,
        stock_quantity INT NOT NULL DEFAULT 0,
        reserved_quantity INT NOT NULL DEFAULT 0,
        low_stock_threshold INT DEFAULT 10,
        critical_stock_threshold INT DEFAULT 5,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_product_id (product_id),
        INDEX idx_product_size (product_id, size),
        UNIQUE KEY unique_product_size (product_id, size)
      )
    `;
    
    await connection.execute(createStockTable);
    console.log('   ✅ product_stock table created');
    
    // Step 2: Add stock columns to products table
    console.log('2️⃣ Adding stock summary columns to products table...');
    
    const columnsToAdd = [
      'total_available_stock INT DEFAULT 0',
      'total_reserved_stock INT DEFAULT 0',
      'stock_status ENUM(\'in_stock\', \'low_stock\', \'critical_stock\', \'out_of_stock\') DEFAULT \'in_stock\'',
      'last_stock_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP'
    ];
    
    for (const column of columnsToAdd) {
      try {
        await connection.execute(`ALTER TABLE products ADD COLUMN ${column}`);
        console.log(`   ✅ Added column: ${column.split(' ')[0]}`);
      } catch (error) {
        if (error.message.includes('Duplicate column name')) {
          console.log(`   ℹ️ Column ${column.split(' ')[0]} already exists`);
        }
      }
    }
    
    // Step 3: Migrate existing size data
    console.log('3️⃣ Migrating existing size data to stock table...');
    
    const [existingProducts] = await connection.execute(`
      SELECT product_id, sizes, productname FROM products 
      WHERE sizes IS NOT NULL AND sizes != '' AND sizes != 'null'
    `);
    
    let migratedCount = 0;
    for (const product of existingProducts) {
      try {
        const sizes = JSON.parse(product.sizes || '[]');
        
        for (const sizeData of sizes) {
          if (sizeData.size && typeof sizeData.stock === 'number') {
            await connection.execute(`
              INSERT INTO product_stock (product_id, size, stock_quantity)
              VALUES (?, ?, ?)
              ON DUPLICATE KEY UPDATE 
                stock_quantity = VALUES(stock_quantity),
                last_updated = CURRENT_TIMESTAMP
            `, [product.product_id, sizeData.size, sizeData.stock]);
          }
        }
        migratedCount++;
        
      } catch (error) {
        console.log(`   ⚠️ Could not migrate sizes for product ${product.product_id}: ${error.message}`);
      }
    }
    
    console.log(`   ✅ Migrated stock data for ${migratedCount} products`);
    
    // Step 4: Add sample stock for products without stock
    console.log('4️⃣ Adding sample stock data for products without stock...');
    
    const [productsWithoutStock] = await connection.execute(`
      SELECT p.product_id, p.productname, p.product_type
      FROM products p
      LEFT JOIN product_stock ps ON p.product_id = ps.product_id
      WHERE ps.product_id IS NULL
      AND p.status = 'active'
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
        // Create varied stock levels for demo
        let stockQty;
        const rand = Math.random();
        if (rand < 0.1) stockQty = 0; // 10% out of stock
        else if (rand < 0.2) stockQty = Math.floor(Math.random() * 5) + 1; // 10% critical (1-5)
        else if (rand < 0.4) stockQty = Math.floor(Math.random() * 15) + 6; // 20% low (6-20)
        else stockQty = Math.floor(Math.random() * 50) + 21; // 70% normal (21-70)
        
        await connection.execute(`
          INSERT INTO product_stock (product_id, size, stock_quantity)
          VALUES (?, ?, ?)
        `, [product.product_id, size, stockQty]);
      }
    }
    
    console.log(`   ✅ Added sample stock data for ${productsWithoutStock.length} products`);
    
    // Step 5: Update product stock summaries
    console.log('5️⃣ Updating product stock summaries...');
    
    await connection.execute(`
      UPDATE products p
      SET 
        total_available_stock = (
          SELECT COALESCE(SUM(stock_quantity - reserved_quantity), 0)
          FROM product_stock ps
          WHERE ps.product_id = p.product_id
        ),
        total_reserved_stock = (
          SELECT COALESCE(SUM(reserved_quantity), 0)
          FROM product_stock ps
          WHERE ps.product_id = p.product_id
        ),
        total_stock = (
          SELECT COALESCE(SUM(stock_quantity), 0)
          FROM product_stock ps
          WHERE ps.product_id = p.product_id
        )
    `);
    
    // Update stock status
    await connection.execute(`
      UPDATE products 
      SET stock_status = CASE 
        WHEN total_available_stock = 0 THEN 'out_of_stock'
        WHEN total_available_stock <= 5 THEN 'critical_stock'
        WHEN total_available_stock <= 15 THEN 'low_stock'
        ELSE 'in_stock'
      END
    `);
    
    console.log('   ✅ Updated product stock summaries');
    
    // Step 6: Show stock status
    console.log('6️⃣ Current stock status summary...');
    
    const [stockStats] = await connection.execute(`
      SELECT 
        COUNT(*) as total_products,
        SUM(COALESCE(total_available_stock, 0)) as total_stock_units,
        COUNT(CASE WHEN stock_status = 'out_of_stock' THEN 1 END) as out_of_stock_products,
        COUNT(CASE WHEN stock_status = 'critical_stock' THEN 1 END) as critical_stock_products,
        COUNT(CASE WHEN stock_status = 'low_stock' THEN 1 END) as low_stock_products,
        COUNT(CASE WHEN stock_status = 'in_stock' THEN 1 END) as in_stock_products
      FROM products
      WHERE status = 'active'
    `);
    
    const stats = stockStats[0];
    console.log(`   📊 Total Active Products: ${stats.total_products}`);
    console.log(`   📦 Total Stock Units: ${stats.total_stock_units}`);
    console.log(`   🔴 Out of Stock: ${stats.out_of_stock_products}`);
    console.log(`   🔴 Critical Stock: ${stats.critical_stock_products}`);
    console.log(`   🟡 Low Stock: ${stats.low_stock_products}`);
    console.log(`   🟢 In Stock: ${stats.in_stock_products}`);
    
    // Show some sample products with stock
    console.log('\n📋 Sample products with stock:');
    const [sampleProducts] = await connection.execute(`
      SELECT 
        p.productname,
        p.total_available_stock,
        p.stock_status,
        GROUP_CONCAT(CONCAT(ps.size, ':', ps.stock_quantity) SEPARATOR ', ') as size_breakdown
      FROM products p
      JOIN product_stock ps ON p.product_id = ps.product_id
      WHERE p.status = 'active'
      GROUP BY p.product_id, p.productname, p.total_available_stock, p.stock_status
      LIMIT 5
    `);
    
    sampleProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.productname}`);
      console.log(`   Total Stock: ${product.total_available_stock} | Status: ${product.stock_status}`);
      console.log(`   Sizes: ${product.size_breakdown}`);
    });
    
    console.log('\n✅ STOCK MANAGEMENT SYSTEM CREATED SUCCESSFULLY!');
    console.log('\n📋 What was created:');
    console.log('- product_stock table for detailed size-specific stock tracking');
    console.log('- Stock summary columns in products table');
    console.log('- Migrated existing size data to new stock system');
    console.log('- Added realistic sample stock data with varied levels');
    console.log('- Updated all product stock summaries and statuses');
    
    console.log('\n🎯 Database Structure:');
    console.log('- product_stock: Detailed stock by product + size');
    console.log('- products.total_available_stock: Sum of all available stock');
    console.log('- products.stock_status: Overall status (in_stock/low_stock/critical_stock/out_of_stock)');
    
  } catch (error) {
    console.error('❌ Error creating stock system:', error.message);
  } finally {
    await connection.end();
  }
}

createSimpleStockSystem();
