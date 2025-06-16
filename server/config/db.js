// server/config/db.js
const mysql = require('mysql2/promise');
const path = require('path');

// Ensure dotenv is loaded with correct path
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Debug: Check if password is loaded
console.log('DB Config Debug:');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '[PASSWORD_SET]' : '[PASSWORD_NOT_SET]');
console.log('DB_NAME:', process.env.DB_NAME);

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'seven_four_clothing',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Helper function to execute queries
const query = async (sql, params = []) => {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

// Test database connection
const testConnection = async () => {
  try {
    console.log('Testing connection with config:', {
      host: dbConfig.host,
      user: dbConfig.user,
      database: dbConfig.database,
      port: dbConfig.port,
      hasPassword: !!dbConfig.password
    });
    
    const connection = await pool.getConnection();
    console.log('✅ Database connection successful!');
    console.log(`📊 Connected to: ${dbConfig.database} on ${dbConfig.host}:${dbConfig.port}`);
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Error details:', {
      code: error.code,
      errno: error.errno,
      sqlMessage: error.sqlMessage
    });
    return false;
  }
};

module.exports = {
  dbConfig,
  pool,
  query,
  testConnection
};