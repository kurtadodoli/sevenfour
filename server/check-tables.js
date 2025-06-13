// check-tables.js
// Check if the products table exists and create it if it doesn't

const { pool } = require('./config/db');

async function checkTables() {
  try {
    console.log('Checking products table...');
    
    // Check if table exists
    const [tables] = await pool.query(`
      SHOW TABLES LIKE 'products'
    `);
    
    if (tables.length === 0) {
      console.log('Products table does not exist. Creating schema...');
      
      // Read SQL file and execute it
      const fs = require('fs');
      const path = require('path');
      const sql = fs.readFileSync(path.join(__dirname, 'database/product_schema.sql'), 'utf8');
      
      // Split SQL statements and execute them
      const statements = sql
        .split(';')
        .filter(statement => statement.trim() !== '')
        .map(statement => statement.trim() + ';');
      
      for (const statement of statements) {
        console.log('Executing:', statement.substring(0, 50) + '...');
        await pool.query(statement);
      }
      
      console.log('Schema created successfully!');
    } else {
      console.log('Products table already exists.');
      
      // Check schema structure
      const [columns] = await pool.query(`
        SHOW COLUMNS FROM products
      `);
      
      console.log('Current columns:');
      columns.forEach(col => {
        console.log(`- ${col.Field} (${col.Type})`);
      });
    }
  } catch (error) {
    console.error('Error checking/creating tables:', error);
  } finally {
    pool.end();
  }
}

checkTables();
