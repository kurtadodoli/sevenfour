const mysql = require('mysql2/promise');

async function checkDeliverySchedulesStructure() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root', 
      password: 's3v3n-f0ur-cl0thing*',
      database: 'seven_four_clothing'
    });

    console.log('🔍 Checking delivery_schedules table structure...');
    const [columns] = await connection.execute('DESCRIBE delivery_schedules');
    
    console.log('📋 Delivery schedules table columns:');
    columns.forEach(col => {
      console.log(`  - ${col.Field} (${col.Type})`);
    });
    
    await connection.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkDeliverySchedulesStructure();
