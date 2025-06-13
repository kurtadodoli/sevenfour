// add-sample-products.js
// A script to add sample products to the database

const { pool } = require('../config/db');
const { promisify } = require('util');
const query = promisify(pool.query).bind(pool);

async function addSampleProducts() {
  try {
    console.log('Adding sample products...');
    
    // Check if products table exists
    const tables = await query(`
      SHOW TABLES LIKE 'products'
    `);
    
    if (tables.length === 0) {
      console.error('Products table does not exist. Please run the product_schema.sql file first.');
      return;
    }
    
    // Check if there are existing products
    const existingProducts = await query(`
      SELECT COUNT(*) as count FROM products
    `);
    
    if (existingProducts[0].count > 0) {
      console.log(`There are already ${existingProducts[0].count} products in the database. Skipping sample data insertion.`);
      return;
    }
    
    // Sample products
    const products = [
      {
        name: 'Classic T-Shirt',
        description: 'A comfortable classic cotton t-shirt',
        price: 29.99,
        category: 'T-Shirts',
        brand: 'Seven Four',
        status: 'active',
        stock_status: 'in_stock',
        is_featured: true
      },
      {
        name: 'Basketball Shorts',
        description: 'Lightweight basketball shorts perfect for the court',
        price: 34.99,
        category: 'Shorts',
        brand: 'Seven Four',
        status: 'active',
        stock_status: 'in_stock',
        is_featured: false
      },
      {
        name: 'Team Hoodie',
        description: 'Stay warm with this team hoodie',
        price: 49.99,
        category: 'Hoodies',
        brand: 'Seven Four',
        status: 'active',
        stock_status: 'in_stock',
        is_featured: true
      },
      {
        name: 'Windbreaker Jacket',
        description: 'Lightweight jacket perfect for wind protection',
        price: 59.99,
        category: 'Jackets',
        brand: 'Seven Four',
        status: 'active',
        stock_status: 'low_stock',
        is_featured: false
      },
      {
        name: 'Sports Cap',
        description: 'Adjustable sports cap with team logo',
        price: 24.99,
        category: 'Headwear',
        brand: 'Seven Four',
        status: 'active',
        stock_status: 'in_stock',
        is_featured: true
      }
    ];
    
    // Insert products
    for (const product of products) {
      const result = await query(`
        INSERT INTO products (name, description, price, category, brand, status, stock_status, is_featured)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        product.name,
        product.description,
        product.price,
        product.category,
        product.brand,
        product.status,
        product.stock_status,
        product.is_featured
      ]);
      
      const productId = result.insertId;
      
      // Add sample sizes
      const sizes = ['S', 'M', 'L', 'XL'];
      for (const size of sizes) {
        await query(`
          INSERT INTO product_sizes (product_id, size)
          VALUES (?, ?)
        `, [productId, size]);
      }
      
      // Add sample colors
      const colors = ['Black', 'White', 'Blue'];
      for (const color of colors) {
        await query(`
          INSERT INTO product_colors (product_id, color)
          VALUES (?, ?)
        `, [productId, color]);
      }
      
      console.log(`Added product: ${product.name}`);
    }
    
    console.log('Sample products added successfully!');
  } catch (error) {
    console.error('Error adding sample products:', error);
  } finally {
    pool.end();
  }
}

addSampleProducts();
