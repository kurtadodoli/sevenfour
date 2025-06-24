const mysql = require('mysql2/promise');

async function investigateProductStockTable() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 's3v3n-f0ur-cl0thing*',
    database: 'seven_four_clothing'
  });

  try {
    console.log('🔍 Investigating product_stock table...\n');
    
    // Check product_stock table structure
    console.log('1️⃣ Product Stock table structure:');
    const [stockColumns] = await connection.execute('DESCRIBE product_stock');
    stockColumns.forEach(col => {
      console.log(`- ${col.Field}: ${col.Type}`);
    });
    
    // Check actual stock data
    console.log('\n2️⃣ Sample product_stock data:');
    const [stockData] = await connection.execute(`
      SELECT * FROM product_stock LIMIT 10
    `);
    
    stockData.forEach(stock => {
      console.log(`Product ${stock.product_id} - Size: ${stock.size} - Stock: ${stock.stock_quantity}`);
    });
    
    // Check products table actual data
    console.log('\n3️⃣ Sample products data:');
    const [products] = await connection.execute(`
      SELECT product_id, productname, total_stock, sizes 
      FROM products 
      WHERE status = 'active' 
      LIMIT 5
    `);
    
    products.forEach(product => {
      console.log(`\n📦 ${product.productname}:`);
      console.log(`- Product ID: ${product.product_id}`);
      console.log(`- Total Stock (products table): ${product.total_stock}`);
      console.log(`- Sizes: ${product.sizes}`);
    });
    
    // Join products with product_stock to see the relationship
    console.log('\n4️⃣ Products with their stock details:');
    const [joinedData] = await connection.execute(`
      SELECT 
        p.product_id,
        p.productname,
        p.total_stock,
        ps.size,
        ps.stock_quantity,
        ps.reserved_quantity
      FROM products p
      LEFT JOIN product_stock ps ON p.product_id = ps.product_id
      WHERE p.status = 'active'
      ORDER BY p.productname, ps.size
      LIMIT 20
    `);
    
    console.log('Product stock breakdown:');
    let currentProduct = null;
    let totalCalculated = 0;
    
    joinedData.forEach(row => {
      if (currentProduct !== row.productname) {
        if (currentProduct) {
          console.log(`  → Calculated total: ${totalCalculated}\n`);
        }
        currentProduct = row.productname;
        totalCalculated = 0;
        console.log(`📦 ${row.productname} (DB total_stock: ${row.total_stock}):`);
      }
      
      if (row.size) {
        console.log(`  - Size ${row.size}: ${row.stock_quantity} units (reserved: ${row.reserved_quantity})`);
        totalCalculated += row.stock_quantity || 0;
      }
    });
    
    if (currentProduct) {
      console.log(`  → Calculated total: ${totalCalculated}\n`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

investigateProductStockTable();
