// Quick fix for the specific product causing the issue
const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 's3v3n-f0ur-cl0thing*',
  database: 'seven_four_clothing',
  port: 3306
};

async function quickFixProduct() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connected');

    // Check the specific product
    console.log('\n🔍 Checking "No Struggles No Progress" product...');
    const [products] = await connection.execute(`
      SELECT 
        product_id,
        productname,
        total_stock,
        total_available_stock,
        total_reserved_stock
      FROM products 
      WHERE productname = 'No Struggles No Progress'
    `);
    
    if (products.length === 0) {
      console.log('❌ Product not found');
      return;
    }
    
    const product = products[0];
    console.log('Current state:');
    console.log(`  total_stock: ${product.total_stock}`);
    console.log(`  available_stock: ${product.total_available_stock}`);
    console.log(`  reserved_stock: ${product.total_reserved_stock}`);

    // Update available stock to match total stock
    console.log('\n🔧 Updating available stock...');
    await connection.execute(`
      UPDATE products 
      SET total_available_stock = total_stock,
          stock_status = 'in_stock',
          last_stock_update = CURRENT_TIMESTAMP
      WHERE productname = 'No Struggles No Progress'
    `);
    
    console.log('✅ Updated successfully!');

    // Verify the update
    const [updatedProducts] = await connection.execute(`
      SELECT 
        productname,
        total_stock,
        total_available_stock,
        total_reserved_stock,
        stock_status
      FROM products 
      WHERE productname = 'No Struggles No Progress'
    `);
    
    if (updatedProducts.length > 0) {
      const updated = updatedProducts[0];
      console.log('\nUpdated state:');
      console.log(`  total_stock: ${updated.total_stock}`);
      console.log(`  available_stock: ${updated.total_available_stock}`);
      console.log(`  reserved_stock: ${updated.total_reserved_stock}`);
      console.log(`  status: ${updated.stock_status}`);
      
      if (updated.total_available_stock >= 5) {
        console.log('\n🎉 Product now has sufficient stock for order confirmation!');
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

quickFixProduct();
