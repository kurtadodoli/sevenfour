const mysql = require('mysql2/promise');
const { dbConfig } = require('./config/db');

async function checkCartTables() {
  try {
    console.log('🔄 Connecting to database...');
    const connection = await mysql.createConnection(dbConfig);
    
    const [tables] = await connection.execute("SHOW TABLES LIKE '%cart%'");
    console.log('🛒 Cart-related tables:', tables);
    
    // Check if carts table exists, if not create it
    const cartTableExists = tables.some(table => Object.values(table)[0] === 'carts');
    if (!cartTableExists) {
      console.log('📋 Creating carts table...');
      await connection.execute(`
        CREATE TABLE carts (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_user_id (user_id)
        )
      `);
      console.log('✅ Carts table created');
    } else {
      console.log('✅ Carts table already exists');
    }
    
    // Check if cart_items table exists, if not create it
    const cartItemsExists = tables.some(table => Object.values(table)[0] === 'cart_items');
    if (!cartItemsExists) {
      console.log('📋 Creating cart_items table...');
      await connection.execute(`
        CREATE TABLE cart_items (
          id INT AUTO_INCREMENT PRIMARY KEY,
          cart_id INT NOT NULL,
          product_id BIGINT NOT NULL,
          quantity INT NOT NULL DEFAULT 1,
          size VARCHAR(50),
          color VARCHAR(100),
          price DECIMAL(10, 2),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_cart_id (cart_id),
          INDEX idx_product_id (product_id)
        )
      `);
      console.log('✅ Cart_items table created');
    } else {
      console.log('✅ Cart_items table already exists');
    }
    
    await connection.end();
    console.log('🎉 Cart tables check completed!');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkCartTables();
