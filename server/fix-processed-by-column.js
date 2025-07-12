const mysql = require('mysql2/promise');
const { dbConfig } = require('./config/db');

(async () => {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('Checking processed_by column type...');
    
    // Check current column type
    const [columns] = await connection.execute(`
      SHOW COLUMNS FROM custom_order_cancellation_requests WHERE Field = 'processed_by'
    `);
    
    console.log('Current processed_by column structure:', columns[0]);
    
    if (columns[0].Type === 'int') {
      console.log('Updating processed_by column to BIGINT...');
      
      // Change processed_by to BIGINT
      await connection.execute(`
        ALTER TABLE custom_order_cancellation_requests 
        MODIFY processed_by BIGINT NULL
      `);
      
      console.log('✅ Successfully changed processed_by column to BIGINT');
    } else {
      console.log('✅ processed_by column already has correct type');
    }
    
    await connection.end();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error:', error);
    await connection.end();
  }
})();
