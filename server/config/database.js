const mysql = require('mysql2/promise');
require('dotenv').config();

// Create connection pool with updated configuration
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 's3v3n-f0ur-cl0thing*',
  database: process.env.DB_NAME || 'seven_four_clothing',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test database connection function
const testConnection = async () => {
  try {
    console.log('🔄 Testing database connection...');
    const connection = await pool.getConnection();
    
    // Test with a simple query
    await connection.query('SELECT 1');
    
    console.log('✅ Database connection successful!');
    
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
};

// Execute query with better error handling
const execute = async (sql, params = []) => {
  try {
    const [results] = await pool.execute(sql, params);
    return [results];
  } catch (error) {
    console.error('Database query error:', error.message);
    throw error;
  }
};

// Query function (for compatibility with existing code)
const query = async (sql, params = []) => {
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

// Get a single record
const getOne = async (sql, params = []) => {
  try {
    const [results] = await pool.execute(sql, params);
    return results[0] || null;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

// Initialize database on startup
const initDatabase = async () => {
  const isConnected = await testConnection();
  
  if (!isConnected) {
    console.log('💡 Please check database configuration');
  }
  
  return isConnected;
};

module.exports = {
  pool,
  execute,
  query,
  getOne,
  testConnection,
  initDatabase
};