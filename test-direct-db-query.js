const mysql = require('mysql2/promise');

async function testDirectDatabaseQuery() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 's3v3n-f0ur-cl0thing*',
    database: 'seven_four_clothing'
  });

  try {
    console.log('🔍 Testing Direct Database Queries...\n');
    
    // Test products query
    console.log('1️⃣ Active Products:');
    const [products] = await connection.execute(`
      SELECT 
        product_id,
        productname,
        productprice,
        productcolor,
        product_type,
        productstatus,
        status
      FROM products
      WHERE (productstatus = 'active' OR status = 'active')
      ORDER BY productname ASC
      LIMIT 5
    `);
    
    console.log(`Found ${products.length} active products:`);
    products.forEach(p => {
      console.log(`- ${p.productname} (ID: ${p.product_id})`);
    });
    
    // Test stock query for specific products
    console.log('\n2️⃣ Stock Data:');
    const productIds = products.map(p => p.product_id);
    const placeholders = productIds.map(() => '?').join(',');
    
    const [stockData] = await connection.execute(`
      SELECT 
        product_id,
        size,
        stock_quantity,
        reserved_quantity
      FROM product_stock
      WHERE product_id IN (${placeholders})
      ORDER BY product_id, size
    `, productIds);
    
    console.log(`Found ${stockData.length} stock records:`);
    
    // Group by product
    const stockByProduct = {};
    stockData.forEach(stock => {
      if (!stockByProduct[stock.product_id]) {
        stockByProduct[stock.product_id] = [];
      }
      stockByProduct[stock.product_id].push({
        size: stock.size,
        stock: stock.stock_quantity || 0
      });
    });
    
    // Show combined data
    console.log('\n3️⃣ Combined Data:');
    products.forEach(product => {
      const stocks = stockByProduct[product.product_id] || [];
      const totalStock = stocks.reduce((sum, s) => sum + s.stock, 0);
      
      console.log(`\n📦 ${product.productname}:`);
      console.log(`   Total Stock: ${totalStock} units`);
      if (stocks.length > 0) {
        stocks.forEach(s => {
          console.log(`   - ${s.size}: ${s.stock} units`);
        });
      } else {
        console.log('   - No stock data found');
      }
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

testDirectDatabaseQuery();
