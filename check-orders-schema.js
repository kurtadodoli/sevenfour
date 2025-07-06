const db = require('./server/config/db');

async function checkOrdersTableSchema() {
  try {
    console.log('🔍 Checking orders table schema...\n');
    
    const result = await db.query('DESCRIBE orders');
    
    console.log('📋 Orders table columns:');
    result.forEach(column => {
      console.log(`  - ${column.Field} (${column.Type}) ${column.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${column.Default ? `DEFAULT ${column.Default}` : ''}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkOrdersTableSchema();
