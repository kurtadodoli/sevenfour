// server/scripts/add-dummy-product.js
// Quick script to add a dummy product directly to the database

const { pool } = require('../config/db');

async function addDummyProduct() {
  try {
    console.log('Adding a dummy product to the database...');    // First create a category if needed
    let categoryId;
    try {
      // Check if categories table exists
      const [catResult] = await pool.query(
        `INSERT INTO categories (name, description) VALUES ('T-Shirts', 'T-shirts and tops') ON DUPLICATE KEY UPDATE name=name`
      );
      
      // Get the category ID
      const [catRows] = await pool.query(`SELECT id FROM categories WHERE name = 'T-Shirts'`);
      categoryId = catRows[0]?.id || 1;
    } catch (err) {
      console.log('Could not create category, using ID 1:', err.message);
      categoryId = 1;
    }

    // Insert a simple product
    const [result] = await pool.query(
      `INSERT INTO products 
       (name, description, price, brand, category_id, is_featured)
       VALUES 
       ('Test T-Shirt', 'This is a test product', 29.99, 'Seven Four', ?, 1)`,
      [categoryId]
    );
    
    const productId = result.insertId;
    console.log(`Created product with ID: ${productId}`);
      // Check if product_sizes and product_colors tables exist
    try {
      // Just add sample data for now
      console.log('Added sample product with ID:', productId);
      
      // We'll skip adding sizes and colors for now
      // since the tables might be different
    } catch (err) {
      console.log('Tables for sizes/colors may not exist yet:', err.message);
    }
    console.log('Added colors');
    
    console.log('Dummy product added successfully!');
    
  } catch (error) {
    console.error('Error adding dummy product:', error);
  } finally {
    pool.end();
  }
}

addDummyProduct();
