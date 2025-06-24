// Fix script to update available stock for products with inconsistent inventory
const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 's3v3n-f0ur-cl0thing*',
  database: 'seven_four_clothing',
  port: 3306
};

async function fixInventoryData() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connected');

    // Find products with total_stock > 0 but total_available_stock = 0
    console.log('\n🔍 Finding products with inventory inconsistencies...');
    const [inconsistentProducts] = await connection.execute(`
      SELECT 
        product_id,
        productname,
        productquantity,
        total_stock,
        total_available_stock,
        total_reserved_stock
      FROM products 
      WHERE total_stock > 0 AND total_available_stock = 0
      ORDER BY productname
    `);
    
    console.log(`Found ${inconsistentProducts.length} products with inventory issues:`);
    inconsistentProducts.forEach(product => {
      console.log(`  - ${product.productname}:`);
      console.log(`    total_stock: ${product.total_stock}, available: ${product.total_available_stock}, reserved: ${product.total_reserved_stock}`);
    });

    if (inconsistentProducts.length === 0) {
      console.log('✅ No inventory inconsistencies found');
      return;
    }

    // Fix the inventory by setting available stock to total stock minus reserved stock
    console.log('\n🔧 Fixing inventory data...');
    await connection.beginTransaction();
    
    for (const product of inconsistentProducts) {
      const availableStock = Math.max(0, product.total_stock - (product.total_reserved_stock || 0));
      
      await connection.execute(`
        UPDATE products 
        SET total_available_stock = ?,
            last_stock_update = CURRENT_TIMESTAMP,
            stock_status = CASE 
              WHEN ? <= 0 THEN 'out_of_stock'
              WHEN ? <= 5 THEN 'critical_stock'
              WHEN ? <= 15 THEN 'low_stock'
              ELSE 'in_stock'
            END
        WHERE product_id = ?
      `, [availableStock, availableStock, availableStock, availableStock, product.product_id]);
      
      console.log(`  ✅ Fixed ${product.productname}: available_stock = ${availableStock}`);
    }
    
    await connection.commit();
    console.log('\n✅ Inventory data fixed successfully!');

    // Verify the fix for the specific product in order 4
    console.log('\n🔍 Verifying fix for "No Struggles No Progress"...');
    const [verifyProduct] = await connection.execute(`
      SELECT 
        productname,
        total_stock,
        total_available_stock,
        total_reserved_stock,
        stock_status
      FROM products 
      WHERE productname = 'No Struggles No Progress'
    `);
    
    if (verifyProduct.length > 0) {
      const product = verifyProduct[0];
      console.log(`  - ${product.productname}:`);
      console.log(`    total_stock: ${product.total_stock}`);
      console.log(`    available_stock: ${product.total_available_stock}`);
      console.log(`    reserved_stock: ${product.total_reserved_stock}`);
      console.log(`    status: ${product.stock_status}`);
      
      if (product.total_available_stock >= 5) {
        console.log('  ✅ Product now has sufficient stock for order 4!');
      } else {
        console.log('  ⚠️ Product still has insufficient stock for order 4');
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (connection) {
      await connection.rollback();
    }
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

fixInventoryData();
