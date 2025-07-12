const mysql = require('mysql2/promise');
const { dbConfig } = require('./config/db');

(async () => {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('Checking current user_id column type...');
    
    // Check current column type
    const [columns] = await connection.execute(`
      SHOW COLUMNS FROM custom_order_cancellation_requests WHERE Field = 'user_id'
    `);
    
    console.log('Current column structure:', columns[0]);
    
    console.log('Updating user_id column to BIGINT...');
    
    // Change user_id to BIGINT
    await connection.execute(`
      ALTER TABLE custom_order_cancellation_requests 
      MODIFY user_id BIGINT NOT NULL
    `);
    
    console.log('✅ Successfully changed user_id column to BIGINT');
    
    // Check the updated column type
    const [updatedColumns] = await connection.execute(`
      SHOW COLUMNS FROM custom_order_cancellation_requests WHERE Field = 'user_id'
    `);
    
    console.log('Updated column structure:', updatedColumns[0]);
    
    await connection.end();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error:', error);
    await connection.end();
  }
})();
