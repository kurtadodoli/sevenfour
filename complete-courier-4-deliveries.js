const mysql = require('mysql2/promise');

async function completeActiveDeliveries() {
  const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 's3v3n-f0ur-cl0thing*',
    database: 'seven_four_clothing',
    port: 3306
  };

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connected');

    // Mark all active deliveries for courier 4 as completed
    console.log('🔄 Updating active deliveries to completed status...');
    
    const [result] = await connection.execute(`
      UPDATE delivery_schedules 
      SET delivery_status = 'delivered', updated_at = NOW()
      WHERE courier_id = 4 AND delivery_status IN ('pending', 'scheduled', 'in_transit', 'delayed')
    `);
    
    console.log(`✅ Updated ${result.affectedRows} delivery schedules to 'delivered' status`);
    
    // Also check enhanced table just in case
    const [enhancedResult] = await connection.execute(`
      UPDATE delivery_schedules_enhanced 
      SET delivery_status = 'delivered', updated_at = NOW()
      WHERE courier_id = 4 AND delivery_status IN ('pending', 'scheduled', 'in_transit', 'delayed')
    `);
    
    console.log(`✅ Updated ${enhancedResult.affectedRows} enhanced delivery schedules to 'delivered' status`);
    
    console.log('\n🎉 All active deliveries have been marked as completed!');
    console.log('Now you can delete courier 4 safely.');

    await connection.end();
  } catch (error) {
    console.error('❌ Database error:', error);
    if (connection) await connection.end();
  }
}

completeActiveDeliveries();
