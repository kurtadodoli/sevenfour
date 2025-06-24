const mysql = require('mysql2/promise');

async function checkProductsTable() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 's3v3n-f0ur-cl0thing*',
      database: 'seven_four_clothing',
      port: 3306
    });
    
    console.log('✅ Checking products table structure...');
    
    const [columns] = await connection.execute('DESCRIBE products');
    console.log('\n📋 Products table columns:');
    columns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : ''}`);
    });
      const [sampleProducts] = await connection.execute(`
      SELECT product_id, productname, productquantity, total_stock, total_available_stock 
      FROM products 
      WHERE productquantity > 0 OR total_stock > 0 OR total_available_stock > 0
      LIMIT 5
    `);
    console.log('\n📦 Sample products with stock:');
    sampleProducts.forEach(p => {
      console.log(`  - ${p.productname}: productquantity=${p.productquantity}, total_stock=${p.total_stock}, available_stock=${p.total_available_stock}`);
    });

    // Check order_items table structure to see how product quantities are stored in orders
    console.log('\n🔍 Checking order_items table structure...');
    const [orderItemColumns] = await connection.execute('DESCRIBE order_items');
    console.log('\n📋 Order_items table columns:');
    orderItemColumns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : ''}`);
    });    // Sample order items
    const [sampleOrderItems] = await connection.execute(`
      SELECT oi.product_id, oi.quantity, oi.product_price, p.productname, p.productquantity, p.total_available_stock
      FROM order_items oi
      JOIN products p ON oi.product_id = p.product_id
      LIMIT 3
    `);
    console.log('\n🛍️ Sample order items:');
    sampleOrderItems.forEach(item => {
      console.log(`  - ${item.productname}: ordered=${item.quantity}, current_stock=${item.productquantity || item.total_available_stock}`);
    });
    
    await connection.end();
    console.log('\n✅ Database check complete');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkProductsTable();
