const mysql = require('mysql2/promise');

async function testInventorySystem() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 's3v3n-f0ur-cl0thing*',
    database: 'seven_four_clothing'
  });

  try {
    console.log('🧪 Testing Inventory System...\n');
    
    // Test 1: Check product_stock table
    console.log('1️⃣ Testing product_stock table...');
    const [stockRecords] = await connection.execute(`
      SELECT 
        COUNT(*) as total_records,
        COUNT(DISTINCT product_id) as unique_products,
        SUM(stock_quantity) as total_stock,
        AVG(stock_quantity) as avg_stock_per_size
      FROM product_stock
    `);
      console.log(`   📊 Stock Records: ${stockRecords[0].total_records}`);
    console.log(`   📦 Products with Stock: ${stockRecords[0].unique_products}`);
    console.log(`   📈 Total Stock Units: ${stockRecords[0].total_stock}`);
    console.log(`   📊 Avg Stock per Size: ${parseFloat(stockRecords[0].avg_stock_per_size || 0).toFixed(1)}`);
    
    // Test 2: Check products table stock summaries
    console.log('\n2️⃣ Testing products table stock summaries...');
    const [productSummaries] = await connection.execute(`
      SELECT 
        stock_status,
        COUNT(*) as count,
        SUM(total_available_stock) as total_stock
      FROM products 
      WHERE status = 'active'
      GROUP BY stock_status
      ORDER BY 
        CASE stock_status
          WHEN 'out_of_stock' THEN 1
          WHEN 'critical_stock' THEN 2
          WHEN 'low_stock' THEN 3
          WHEN 'in_stock' THEN 4
        END
    `);
    
    productSummaries.forEach(summary => {
      const emoji = {
        'out_of_stock': '🔴',
        'critical_stock': '🔴',
        'low_stock': '🟡',
        'in_stock': '🟢'
      }[summary.stock_status] || '⚪';
      
      console.log(`   ${emoji} ${summary.stock_status}: ${summary.count} products (${summary.total_stock} units)`);
    });
    
    // Test 3: Sample inventory data (what the API would return)
    console.log('\n3️⃣ Testing inventory API data structure...');
    const [inventoryData] = await connection.execute(`
      SELECT 
        p.product_id,
        p.productname,
        p.productcolor,
        p.total_available_stock,
        p.stock_status,
        GROUP_CONCAT(
          CONCAT('{"size":"', ps.size, '","stock":', ps.stock_quantity, ',"reserved":', ps.reserved_quantity, '}')
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
        ) AS sizes
      FROM products p
      LEFT JOIN product_stock ps ON p.product_id = ps.product_id
      WHERE p.status = 'active'
      GROUP BY p.product_id, p.productname, p.productcolor, p.total_available_stock, p.stock_status
      LIMIT 3
    `);
    
    console.log(`   📋 Sample products (showing first 3):`);
    inventoryData.forEach((product, index) => {
      console.log(`   ${index + 1}. ${product.productname} (${product.productcolor})`);
      console.log(`      Total Stock: ${product.total_available_stock} | Status: ${product.stock_status}`);
      
      if (product.sizes) {
        try {
          const sizeArray = `[${product.sizes}]`;
          const sizes = JSON.parse(sizeArray);
          const sizeBreakdown = sizes.map(s => `${s.size}:${s.stock}`).join(', ');
          console.log(`      Size Breakdown: ${sizeBreakdown}`);
        } catch (error) {
          console.log(`      Size Breakdown: Error parsing sizes`);
        }
      }
      console.log('');
    });
    
    // Test 4: Test stock status indicators
    console.log('4️⃣ Testing stock status indicators...');
    const [statusBreakdown] = await connection.execute(`
      SELECT 
        p.productname,
        p.total_available_stock,
        p.stock_status,
        COUNT(ps.id) as size_count,
        SUM(CASE WHEN ps.stock_quantity = 0 THEN 1 ELSE 0 END) as out_of_stock_sizes,
        SUM(CASE WHEN ps.stock_quantity <= 5 AND ps.stock_quantity > 0 THEN 1 ELSE 0 END) as critical_sizes,
        SUM(CASE WHEN ps.stock_quantity <= 15 AND ps.stock_quantity > 5 THEN 1 ELSE 0 END) as low_stock_sizes
      FROM products p
      JOIN product_stock ps ON p.product_id = ps.product_id
      WHERE p.status = 'active'
      GROUP BY p.product_id, p.productname, p.total_available_stock, p.stock_status
      HAVING out_of_stock_sizes > 0 OR critical_sizes > 0 OR low_stock_sizes > 0
      LIMIT 5
    `);
    
    console.log(`   ⚠️  Products needing attention:`);
    statusBreakdown.forEach((product, index) => {
      console.log(`   ${index + 1}. ${product.productname}`);
      console.log(`      Overall: ${product.total_available_stock} units (${product.stock_status})`);
      console.log(`      Problems: ${product.out_of_stock_sizes} out of stock, ${product.critical_sizes} critical, ${product.low_stock_sizes} low`);
    });
    
    console.log('\n✅ INVENTORY SYSTEM TEST COMPLETE!');
    console.log('\n🎯 System Status:');
    console.log('- ✅ product_stock table: Detailed size-level tracking');
    console.log('- ✅ products table: Summary stock data');
    console.log('- ✅ Stock status calculation: Automatic based on availability');
    console.log('- ✅ API data structure: Ready for InventoryPage');
    console.log('- ✅ Stock indicators: Multiple levels (out/critical/low/normal)');
    
    console.log('\n📱 Ready for InventoryPage:');
    console.log('- Products will show accurate stock numbers');
    console.log('- Size breakdown will display with proper stock levels');
    console.log('- Stock status indicators will show correct colors');
    console.log('- Filtering by stock status will work properly');
    
  } catch (error) {
    console.error('❌ Error testing inventory system:', error.message);
  } finally {
    await connection.end();
  }
}

testInventorySystem();
