const mysql = require('mysql2/promise');

async function getCleanColumnList() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 's3v3n-f0ur-cl0thing*',
    database: 'seven_four_clothing'
  });

  try {
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'seven_four_clothing' 
      AND TABLE_NAME = 'custom_designs'
      ORDER BY ORDINAL_POSITION
    `);
    
    console.log('Custom Designs Table Columns:');
    columns.forEach((col, index) => {
      console.log(`${index + 1}. ${col.COLUMN_NAME}`);
    });
    
    // Check for specific columns we need
    const columnNames = columns.map(col => col.COLUMN_NAME);
    
    console.log('\nChecking for required columns:');
    const requiredColumns = [
      'id', 'design_id', 'customer_name', 'customer_email', 'customer_phone',
      'product_type', 'product_color', 'quantity', 'final_price', 'estimated_price',
      'delivery_status', 'delivery_date', 'delivery_notes', 'created_at'
    ];
    
    requiredColumns.forEach(col => {
      const exists = columnNames.includes(col);
      console.log(`${exists ? '✅' : '❌'} ${col}`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await connection.end();
  }
}

getCleanColumnList();
