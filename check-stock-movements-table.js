const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 's3v3n-f0ur-cl0thing*',
  database: 'seven_four_clothing'
};

async function checkStockMovementsTable() {
  try {
    console.log('🔍 Checking stock_movements table structure...');
    console.log('=' .repeat(60));
    
    const connection = await mysql.createConnection(dbConfig);
    
    // Check table structure
    const [structure] = await connection.execute(`DESCRIBE stock_movements`);
    console.log('📋 Table structure:');
    console.table(structure);
    
    // Check existing movement types
    const [movementTypes] = await connection.execute(`
      SELECT DISTINCT movement_type, COUNT(*) as count 
      FROM stock_movements 
      GROUP BY movement_type 
      ORDER BY count DESC
    `);
    
    console.log('\n📊 Existing movement types:');
    console.table(movementTypes);
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ Error checking table:', error.message);
  }
}

checkStockMovementsTable();
