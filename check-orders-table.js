const db = require('./server/config/db');

async function checkOrdersTable() {
  try {
    // Get all columns
    const columns = await db.query(`
      SELECT COLUMN_NAME 
      FROM information_schema.COLUMNS 
      WHERE TABLE_NAME = 'orders' 
      AND TABLE_SCHEMA = 'seven_four_clothing' 
      ORDER BY ORDINAL_POSITION
    `);
    
    console.log('All columns in orders table:');
    columns.forEach((col, index) => console.log(`${index + 1}. ${col.COLUMN_NAME}`));
    
    // Check for custom-related columns
    const customColumns = await db.query(`
      SELECT COLUMN_NAME 
      FROM information_schema.COLUMNS 
      WHERE TABLE_NAME = 'orders' 
      AND TABLE_SCHEMA = 'seven_four_clothing' 
      AND COLUMN_NAME LIKE '%custom%'
    `);
    
    console.log('\nColumns with "custom" in name:');
    if (customColumns.length > 0) {
      customColumns.forEach(col => console.log(`- ${col.COLUMN_NAME}`));
    } else {
      console.log('None found');
    }
    
    // Check if there are any foreign key relationships
    const foreignKeys = await db.query(`
      SELECT 
        COLUMN_NAME,
        REFERENCED_TABLE_NAME,
        REFERENCED_COLUMN_NAME
      FROM information_schema.KEY_COLUMN_USAGE 
      WHERE TABLE_NAME = 'orders' 
      AND TABLE_SCHEMA = 'seven_four_clothing'
      AND REFERENCED_TABLE_NAME IS NOT NULL
    `);
    
    console.log('\nForeign key relationships:');
    if (foreignKeys.length > 0) {
      foreignKeys.forEach(fk => {
        console.log(`- ${fk.COLUMN_NAME} -> ${fk.REFERENCED_TABLE_NAME}.${fk.REFERENCED_COLUMN_NAME}`);
      });
    } else {
      console.log('None found');
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkOrdersTable();
