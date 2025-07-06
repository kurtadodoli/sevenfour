const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 's3v3n-f0ur-cl0thing*',
  database: 'seven_four_clothing'
};

async function checkConstraints() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // Check current constraints on custom_orders table
    const [constraints] = await connection.execute(`
      SELECT tc.CONSTRAINT_NAME, tc.CONSTRAINT_TYPE, kcu.COLUMN_NAME
      FROM information_schema.TABLE_CONSTRAINTS tc
      JOIN information_schema.KEY_COLUMN_USAGE kcu ON tc.CONSTRAINT_NAME = kcu.CONSTRAINT_NAME
      WHERE tc.TABLE_SCHEMA = 'seven_four_clothing' 
      AND tc.TABLE_NAME = 'custom_orders'
      ORDER BY tc.CONSTRAINT_TYPE, tc.CONSTRAINT_NAME
    `);
    
    console.log('Current constraints on custom_orders table:');
    constraints.forEach(c => {
      console.log(`- ${c.CONSTRAINT_TYPE}: ${c.CONSTRAINT_NAME} on ${c.COLUMN_NAME}`);
    });
    
    // Check if custom_order_id has unique constraint
    const hasUnique = constraints.some(c => c.CONSTRAINT_TYPE === 'UNIQUE' && c.COLUMN_NAME === 'custom_order_id');
    console.log(`\nCustom Order ID unique constraint: ${hasUnique ? 'EXISTS' : 'MISSING'}`);
    
    // Check for duplicate custom_order_ids
    const [duplicates] = await connection.execute(`
      SELECT custom_order_id, COUNT(*) as count
      FROM custom_orders 
      GROUP BY custom_order_id 
      HAVING COUNT(*) > 1
      ORDER BY count DESC
    `);
    
    console.log(`\nDuplicate custom_order_ids found: ${duplicates.length}`);
    duplicates.forEach(d => {
      console.log(`- ${d.custom_order_id}: ${d.count} occurrences`);
    });
    
    await connection.end();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkConstraints();
