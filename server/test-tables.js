const { pool } = require('./config/db.js');

async function testTables() {
  try {
    console.log('Testing database tables...');
    
    // Test product_categories table
    console.log('Testing product_categories...');
    const [categories] = await pool.query('SELECT * FROM product_categories');
    console.log('Categories found:', categories.length);
    
    // Test products table
    console.log('Testing products table...');
    const [products] = await pool.query('SELECT COUNT(*) as count FROM products');
    console.log('Products count:', products[0].count);
    
    // Test carts table
    console.log('Testing carts table...');
    const [carts] = await pool.query('SELECT COUNT(*) as count FROM carts');
    console.log('Carts count:', carts[0].count);
    
    console.log('All tables are working correctly!');
    
  } catch (error) {
    console.error('Error testing tables:', error);
  } finally {
    process.exit(0);
  }
}

testTables();
