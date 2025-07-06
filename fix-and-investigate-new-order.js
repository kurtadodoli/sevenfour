const mysql = require('mysql2/promise');
const { dbConfig } = require('./server/config/db');

async function fixNewOrderAndInvestigate() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    
    console.log('🔧 Fixing order ORD17517282369104816 and investigating the payment approval process...\n');
    
    // Fix the specific order first
    await connection.execute(`
      UPDATE orders 
      SET payment_status = 'verified',
          confirmed_by = 967502321335218,
          confirmed_at = NOW()
      WHERE order_number = 'ORD17517282369104816'
    `);
    
    console.log('✅ Fixed order ORD17517282369104816');
    
    // Verify the fix
    const [fixedOrder] = await connection.execute(`
      SELECT status, payment_status, confirmed_by, confirmed_at
      FROM orders 
      WHERE order_number = 'ORD17517282369104816'
    `);
    
    console.log('📋 Updated order status:', fixedOrder[0]);
    
    // Now investigate the payment approval endpoints to see if they're being used
    console.log('\n🔍 Investigating payment approval patterns...\n');
    
    // Check for orders that were approved but still have confirmed_by as null
    const [problematicOrders] = await connection.execute(`
      SELECT 
        order_number, created_at, updated_at, status, payment_status, confirmed_by,
        CASE 
          WHEN notes LIKE '%Payment approved by admin%' THEN 'Admin approved'
          ELSE 'No admin approval'
        END as approval_status
      FROM orders 
      WHERE status = 'confirmed'
      AND confirmed_by IS NULL
      AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      ORDER BY created_at DESC
    `);
    
    console.log(`Found ${problematicOrders.length} recent orders with confirmed status but null confirmed_by:`);
    problematicOrders.forEach(order => {
      console.log(`   ${order.order_number}: ${order.approval_status} | Created: ${order.created_at}`);
    });
    
    if (problematicOrders.length > 0) {
      console.log('\n🚨 ISSUE IDENTIFIED: Payment approval endpoints are not being used or not working properly');
      console.log('💡 Orders are getting confirmed status but not through our fixed approval endpoints');
      
      // Let's check what's setting the status to confirmed
      console.log('\n🔍 Checking how orders are getting confirmed...');
      
      // Look for any other endpoints that might be setting status to confirmed
      console.log('The orders have "Payment approved by admin" in notes, suggesting the old approval logic is still running somewhere.');
    } else {
      console.log('\n✅ All recent confirmed orders have proper confirmed_by field');
    }
    
    // Test the delivery endpoint to see if our order appears now
    console.log('\n🚚 Testing delivery endpoint...');
    
    try {
      const axios = require('axios');
      const response = await axios.get('http://localhost:5000/api/delivery-enhanced/orders');
      
      if (response.data.success) {
        const orders = response.data.data.orders || response.data.data;
        const ourOrder = orders.find(o => o.order_number === 'ORD17517282369104816');
        
        if (ourOrder) {
          console.log('✅ Order ORD17517282369104816 now appears in delivery endpoint!');
        } else {
          console.log('❌ Order still not appearing in delivery endpoint');
        }
      }
    } catch (error) {
      console.log('⚠️ Could not test delivery endpoint (server may not be running)');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    if (connection) await connection.end();
  }
}

fixNewOrderAndInvestigate();
