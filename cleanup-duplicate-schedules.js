const db = require('./server/config/db');

async function cleanupDuplicateSchedules() {
  try {
    console.log('🧹 Cleaning up duplicate delivery schedules...\n');

    // Find duplicates grouped by order_id and delivery_date
    const duplicates = await db.query(`
      SELECT order_id, delivery_date, COUNT(*) as count, GROUP_CONCAT(id) as schedule_ids
      FROM delivery_schedules_enhanced 
      GROUP BY order_id, delivery_date 
      HAVING COUNT(*) > 1
      ORDER BY count DESC
    `);

    console.log(`🔍 Found ${duplicates.length} sets of duplicates:`);
    
    if (duplicates.length === 0) {
      console.log('✅ No duplicates found!');
      return;
    }

    for (const duplicate of duplicates) {
      console.log(`\n📦 Order ID ${duplicate.order_id} on ${duplicate.delivery_date}:`);
      console.log(`   - ${duplicate.count} duplicate entries`);
      console.log(`   - Schedule IDs: ${duplicate.schedule_ids}`);
      
      // Get the IDs to delete (keep the first one, delete the rest)
      const ids = duplicate.schedule_ids.split(',');
      const idsToDelete = ids.slice(1); // Remove first ID, keep the rest for deletion
      
      if (idsToDelete.length > 0) {
        console.log(`   - Keeping Schedule ID: ${ids[0]}`);
        console.log(`   - Deleting Schedule IDs: ${idsToDelete.join(', ')}`);
        
        // Delete the duplicate entries
        const placeholders = idsToDelete.map(() => '?').join(',');
        const deleteQuery = `DELETE FROM delivery_schedules_enhanced WHERE id IN (${placeholders})`;
        
        const result = await db.query(deleteQuery, idsToDelete);
        console.log(`   ✅ Deleted ${result.affectedRows} duplicate entries`);
      }
    }

    console.log('\n🎉 Cleanup complete!');
    
    // Verify the cleanup worked
    const remainingDuplicates = await db.query(`
      SELECT order_id, delivery_date, COUNT(*) as count
      FROM delivery_schedules_enhanced 
      GROUP BY order_id, delivery_date 
      HAVING COUNT(*) > 1
    `);
    
    console.log(`\n📊 Verification: ${remainingDuplicates.length} duplicate sets remaining`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

cleanupDuplicateSchedules();
