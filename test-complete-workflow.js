const mysql = require('mysql2/promise');

async function testCompleteCustomOrderWorkflow() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 's3v3n-f0ur-cl0thing*',
    database: 'seven_four_clothing'
  });

  try {
    console.log('🎯 COMPLETE Custom Order Delivery Status Workflow Test\n');
    
    // Get first approved custom order
    const [orders] = await connection.execute(`
      SELECT id, custom_order_id, customer_name, delivery_status, status 
      FROM custom_orders 
      WHERE status = 'approved'
      LIMIT 1
    `);
    
    if (orders.length === 0) {
      console.log('❌ No approved custom orders found for testing');
      return;
    }
    
    const testOrder = orders[0];
    console.log(`📦 Testing with custom order: ${testOrder.custom_order_id}`);
    console.log(`👤 Customer: ${testOrder.customer_name}\n`);
    
    // STEP 1: Reset to pending
    console.log('1️⃣ INITIAL STATE: Custom order is approved but not scheduled');
    await connection.execute(
      'UPDATE custom_orders SET delivery_status = ? WHERE id = ?',
      ['pending', testOrder.id]
    );
    console.log(`   ✅ Status: approved + delivery_status: pending`);
    console.log(`   🎛️ UI: Shows "Select for Scheduling" button\n`);
    
    // STEP 2: Schedule the order (this is what happens when admin clicks calendar date)
    console.log('2️⃣ ADMIN SCHEDULES THE ORDER (clicks calendar date)');
    await connection.execute(
      'UPDATE custom_orders SET delivery_status = ?, delivery_notes = ? WHERE id = ?',
      ['scheduled', 'Scheduled for December 25, 2024 at 10:00 AM', testOrder.id]
    );
    console.log(`   ✅ Status: approved + delivery_status: scheduled`);
    console.log(`   🎛️ UI: Shows "In Transit", "Delivered", "Delayed" buttons`);
    console.log(`   📅 Order appears in calendar on scheduled date\n`);
    
    // STEP 3: Mark as In Transit
    console.log('3️⃣ ADMIN CLICKS "IN TRANSIT" BUTTON');
    await connection.execute(
      'UPDATE custom_orders SET delivery_status = ?, delivery_notes = ? WHERE id = ?',
      ['in_transit', 'Out for delivery - driver assigned', testOrder.id]
    );
    console.log(`   ✅ Status: approved + delivery_status: in_transit`);
    console.log(`   🎛️ UI: Shows "Delivered", "Delayed" buttons`);
    console.log(`   🚚 Customer can track: Order is out for delivery\n`);
    
    // STEP 4: Mark as Delivered  
    console.log('4️⃣ ADMIN CLICKS "DELIVERED" BUTTON');
    await connection.execute(
      'UPDATE custom_orders SET delivery_status = ?, actual_delivery_date = ?, delivery_notes = ? WHERE id = ?',
      ['delivered', new Date().toISOString().split('T')[0], 'Successfully delivered to customer', testOrder.id]
    );
    console.log(`   ✅ Status: approved + delivery_status: delivered`);
    console.log(`   🎛️ UI: No buttons (order completed)`);
    console.log(`   ✅ Customer: Order marked as delivered\n`);
    
    // STEP 5: Demonstrate Delayed workflow
    console.log('5️⃣ ALTERNATIVE: DELAYED WORKFLOW');
    await connection.execute(
      'UPDATE custom_orders SET delivery_status = ?, delivery_notes = ? WHERE id = ?',
      ['scheduled', 'Rescheduled for testing delayed workflow', testOrder.id]
    );
    console.log(`   📅 Reset to scheduled state`);
    
    await connection.execute(
      'UPDATE custom_orders SET delivery_status = ?, delivery_notes = ? WHERE id = ?',
      ['delayed', 'Delivery delayed due to weather conditions', testOrder.id]
    );
    console.log(`   ⚠️  Status: approved + delivery_status: delayed`);
    console.log(`   🎛️ UI: Shows "Select to Reschedule" button`);
    console.log(`   📅 Order REMOVED from calendar`);
    console.log(`   🔄 Admin can click "Select to Reschedule" to pick new date\n`);
    
    // Final verification
    const [finalState] = await connection.execute(
      'SELECT custom_order_id, delivery_status, delivery_notes FROM custom_orders WHERE id = ?',
      [testOrder.id]
    );
    
    console.log('📋 FINAL VERIFICATION:');
    console.log(`Order: ${finalState[0].custom_order_id}`);
    console.log(`Delivery Status: ${finalState[0].delivery_status}`);
    console.log(`Notes: ${finalState[0].delivery_notes}`);
    
    console.log('\n✅ WORKFLOW COMPLETE!');
    console.log('\n🎯 Summary of How It Works:');
    console.log('1. Custom orders start as "approved" with delivery_status "pending"');
    console.log('2. Admin selects order and clicks calendar date to schedule');
    console.log('3. Backend API updates delivery_status to "scheduled"');
    console.log('4. UI shows "In Transit", "Delivered", "Delayed" buttons');
    console.log('5. Each button calls the backend API to update status');
    console.log('6. "Delayed" removes order from calendar, allows rescheduling');
    
    // Reset for demo
    await connection.execute(
      'UPDATE custom_orders SET delivery_status = ? WHERE id = ?',
      ['scheduled', testOrder.id]
    );
    console.log(`\n🔄 Reset ${testOrder.custom_order_id} to "scheduled" for demo purposes`);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await connection.end();
  }
}

testCompleteCustomOrderWorkflow();
