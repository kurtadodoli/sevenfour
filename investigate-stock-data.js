const mysql = require('mysql2/promise');

async function investigateStockData() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 's3v3n-f0ur-cl0thing*',
    database: 'seven_four_clothing'
  });

  try {
    console.log('🔍 Investigating Stock Data Sources...\n');
    
    // Check what tables exist
    console.log('1️⃣ Checking available tables...');
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('Available tables:', tables.map(t => Object.values(t)[0]));
    
    // Check products table structure
    console.log('\n2️⃣ Checking products table structure...');
    const [productColumns] = await connection.execute('DESCRIBE products');
    console.log('Products table columns:');
    productColumns.forEach(col => {
      console.log(`- ${col.Field}: ${col.Type}`);
    });
    
    // Check actual product data
    console.log('\n3️⃣ Checking actual product stock data...');
    const [products] = await connection.execute(`
      SELECT product_id, productname, total_stock, sizes, sizeColorVariants 
      FROM products 
      WHERE status = 'active' 
      LIMIT 5
    `);
    
    console.log('Sample product data:');
    products.forEach(product => {
      console.log(`\n📦 ${product.productname}:`);
      console.log(`- Product ID: ${product.product_id}`);
      console.log(`- Total Stock: ${product.total_stock}`);
      console.log(`- Sizes: ${product.sizes ? product.sizes.substring(0, 100) + '...' : 'null'}`);
      console.log(`- SizeColorVariants: ${product.sizeColorVariants ? product.sizeColorVariants.substring(0, 100) + '...' : 'null'}`);
    });
    
    // Check if there's a separate stock table
    console.log('\n4️⃣ Checking for separate stock tables...');
    const stockTables = tables.filter(t => Object.values(t)[0].includes('stock'));
    if (stockTables.length > 0) {
      console.log('Found stock-related tables:', stockTables.map(t => Object.values(t)[0]));
      
      for (const table of stockTables) {
        const tableName = Object.values(table)[0];
        try {
          const [stockData] = await connection.execute(`SELECT * FROM ${tableName} LIMIT 3`);
          console.log(`\n📊 Sample data from ${tableName}:`, stockData);
        } catch (e) {
          console.log(`\n❌ Could not query ${tableName}:`, e.message);
        }
      }
    }
    
    console.log('\n5️⃣ Summary of findings...');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

investigateStockData();
