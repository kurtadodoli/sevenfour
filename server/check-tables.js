const mysql = require('mysql2/promise');

// Use the same config as app.js
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'seven_four_clothing',
  charset: 'utf8mb4'
};

async function checkTableStructures() {
  try {
    console.log('=== Checking Table Structures ===');
    
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');
    
    // Check if product_images table exists
    const [tables] = await connection.execute(`SHOW TABLES LIKE 'product_images'`);
    console.log('Product Images table exists:', tables.length > 0);
    
    if (tables.length > 0) {
      const [columns] = await connection.execute(`DESCRIBE product_images`);
      console.log('\n📋 product_images table structure:');
      columns.forEach(col => {
        console.log(`  - ${col.Field}: ${col.Type}`);
      });
    }
    
    // Check products table structure for image fields
    const [productCols] = await connection.execute(`DESCRIBE products`);
    console.log('\n📋 products table image fields:');
    productCols.forEach(col => {
      if (col.Field.includes('image')) {
        console.log(`  - ${col.Field}: ${col.Type}`);
      }
    });
    
    // Check sample product data
    const [products] = await connection.execute(`SELECT product_id, productname, productimage FROM products LIMIT 3`);
    console.log('\n📋 Sample product data:');
    products.forEach(product => {
      console.log(`  - ID: ${product.product_id}, Name: ${product.productname}, Image: ${product.productimage}`);
    });
    
    await connection.end();
    console.log('\n✅ Check completed successfully!');
    
  } catch (error) {
    console.error('❌ Error checking table structures:', error);
  }
}

checkTableStructures();
