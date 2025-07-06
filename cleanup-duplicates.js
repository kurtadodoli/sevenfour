const mysql = require('mysql2/promise');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, 'server', '.env') });

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'seven_four_clothing',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

async function cleanupDuplicates() {
  let connection;
  
  try {
    console.log('🧹 Cleaning up duplicate custom order deliveries');
    console.log('='.repeat(50));
    
    connection = await mysql.createConnection(dbConfig);
    
    // Find duplicates
    const [duplicates] = await connection.execute(`
      SELECT order_id, order_type, COUNT(*) as count
      FROM delivery_schedules_enhanced 
      WHERE order_type IN ('custom_order', 'custom_design')
      GROUP BY order_id, order_type
      HAVING COUNT(*) > 1
      ORDER BY count DESC
    `);
    
    if (duplicates.length === 0) {
      console.log('✅ No duplicates found');
      return;
    }
    
    console.log('📋 Found duplicates to clean:');
    duplicates.forEach(dup => {
      console.log(`   Order ${dup.order_id} (${dup.order_type}): ${dup.count} entries`);
    });
    
    // For each duplicate, keep only the latest entry (highest id)
    for (const dup of duplicates) {
      console.log(`\n🔧 Cleaning order ${dup.order_id} (${dup.order_type})`);
      
      // Get all entries for this order
      const [entries] = await connection.execute(`
        SELECT id, scheduled_at, delivery_date, delivery_status
        FROM delivery_schedules_enhanced 
        WHERE order_id = ? AND order_type = ?
        ORDER BY id DESC
      `, [dup.order_id, dup.order_type]);
      
      if (entries.length <= 1) continue;
      
      // Keep the first one (latest by id), delete the rest
      const keepId = entries[0].id;
      const deleteIds = entries.slice(1).map(e => e.id);
      
      console.log(`   Keeping ID ${keepId} (${entries[0].delivery_status}, ${entries[0].delivery_date})`);
      console.log(`   Deleting IDs: ${deleteIds.join(', ')}`);
      
      if (deleteIds.length > 0) {
        await connection.execute(`
          DELETE FROM delivery_schedules_enhanced 
          WHERE id IN (${deleteIds.map(() => '?').join(',')})
        `, deleteIds);
        
        console.log(`   ✅ Deleted ${deleteIds.length} duplicate entries`);
      }
    }
    
    // Verify cleanup
    const [afterCleanup] = await connection.execute(`
      SELECT order_id, order_type, COUNT(*) as count
      FROM delivery_schedules_enhanced 
      WHERE order_type IN ('custom_order', 'custom_design')
      GROUP BY order_id, order_type
      HAVING COUNT(*) > 1
    `);
    
    if (afterCleanup.length === 0) {
      console.log('\n✅ Cleanup completed - no more duplicates');
    } else {
      console.log('\n❌ Still have duplicates:');
      afterCleanup.forEach(dup => {
        console.log(`   Order ${dup.order_id} (${dup.order_type}): ${dup.count} entries`);
      });
    }
    
  } catch (error) {
    console.error('❌ Cleanup error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

cleanupDuplicates();
