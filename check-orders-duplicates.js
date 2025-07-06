const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 's3v3n-f0ur-cl0thing*',
  database: 'seven_four_clothing'
};

async function checkOrdersDuplicates() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // Check for duplicate orders in the orders table based on custom order reference
    const [customOrderDuplicates] = await connection.execute(`
      SELECT 
        notes,
        COUNT(*) as count,
        GROUP_CONCAT(order_number) as order_numbers,
        GROUP_CONCAT(id) as order_ids
      FROM orders 
      WHERE notes LIKE '%CUSTOM-MCNQFDBQ-YQPWJ%'
      GROUP BY notes
      HAVING COUNT(*) > 1
      ORDER BY count DESC
    `);
    
    console.log('🔍 SPECIFIC ORDER CHECK: CUSTOM-MCNQFDBQ-YQPWJ');
    console.log(`Found ${customOrderDuplicates.length} duplicate sets for this custom order`);
    customOrderDuplicates.forEach(d => {
      console.log(`- Notes: ${d.notes}`);
      console.log(`- Count: ${d.count} duplicates`);
      console.log(`- Order Numbers: ${d.order_numbers}`);
      console.log(`- Order IDs: ${d.order_ids}`);
      console.log('---');
    });
    
    // Check for ANY custom order duplicates in orders table
    const [allCustomDuplicates] = await connection.execute(`
      SELECT 
        SUBSTRING_INDEX(SUBSTRING_INDEX(notes, 'Reference: ', -1), ' ', 1) as custom_order_ref,
        COUNT(*) as count,
        GROUP_CONCAT(order_number) as order_numbers,
        GROUP_CONCAT(id) as order_ids
      FROM orders 
      WHERE notes LIKE '%Reference: CUSTOM-%'
      GROUP BY SUBSTRING_INDEX(SUBSTRING_INDEX(notes, 'Reference: ', -1), ' ', 1)
      HAVING COUNT(*) > 1
      ORDER BY count DESC
    `);
    
    console.log('\n🔍 ALL CUSTOM ORDER DUPLICATES IN ORDERS TABLE:');
    console.log(`Found ${allCustomDuplicates.length} duplicate sets`);
    allCustomDuplicates.forEach(d => {
      console.log(`- Custom Order Ref: ${d.custom_order_ref}`);
      console.log(`- Count: ${d.count} duplicates`);
      console.log(`- Order Numbers: ${d.order_numbers}`);
      console.log(`- Order IDs: ${d.order_ids}`);
      console.log('---');
    });
    
    // Check all orders for the specific custom order
    const [specificOrders] = await connection.execute(`
      SELECT id, order_number, status, created_at, notes
      FROM orders 
      WHERE notes LIKE '%CUSTOM-MCNQFDBQ-YQPWJ%'
      ORDER BY created_at ASC
    `);
    
    console.log('\n📋 ALL ORDERS FOR CUSTOM-MCNQFDBQ-YQPWJ:');
    specificOrders.forEach((order, index) => {
      console.log(`${index + 1}. ID: ${order.id} | Order: ${order.order_number} | Status: ${order.status} | Created: ${order.created_at}`);
      console.log(`   Notes: ${order.notes}`);
      console.log('');
    });
    
    await connection.end();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkOrdersDuplicates();
