const mysql = require('mysql2/promise');
require('dotenv').config();

// Create connection pool with better error handling
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'seven_four_clothing',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 10000,
  timeout: 10000,
  charset: 'utf8mb4'
});

// Test database connection function
const testConnection = async () => {
  try {
    console.log('🔄 Testing database connection...');
    const connection = await pool.getConnection();
    
    // Test with a simple query
    await connection.query('SELECT 1');
    
    console.log('✅ Database connection successful!');
    console.log(`📊 Connected to: ${process.env.DB_NAME} on ${process.env.DB_HOST}:${process.env.DB_PORT}`);
    
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error('Error details:', {
      code: error.code,
      errno: error.errno,
      sqlMessage: error.sqlMessage,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      user: process.env.DB_USER
    });
    return false;
  }
};

// Execute query with better error handling
const execute = async (sql, params = []) => {
  try {
    const [results] = await pool.execute(sql, params);
    return [results];
  } catch (error) {
    console.error('Database query error:', {
      sql: sql,
      params: params,
      error: error.message,
      code: error.code
    });
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
  
  if (isConnected) {
    console.log('🎉 Database is ready to use!');
  } else {
    console.log('💡 Please check:');
    console.log('   - MySQL server is running');
    console.log('   - Database credentials in .env file');
    console.log('   - Database "seven_four_clothing" exists');
    console.log('   - Network connectivity');
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