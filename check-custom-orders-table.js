const mysql = require('mysql2/promise');

async function checkCustomOrdersTable() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 's3v3n-f0ur-cl0thing*',
    database: 'seven_four_clothing'
  });

  try {
    console.log('🔍 Checking custom_orders table structure...\n');
    
    const [columns] = await connection.execute('DESCRIBE custom_orders');
    
    console.log('Custom Orders Table Columns:');
    columns.forEach((col, index) => {
      console.log(`${index + 1}. ${col.Field} (${col.Type})`);
    });
    
    // Check if delivery-related columns exist
    const deliveryColumns = columns.filter(col => 
      col.Field.includes('delivery') || 
      col.Field.includes('status')
    );
    
    console.log('\nDelivery/Status related columns:');
    if (deliveryColumns.length > 0) {
      deliveryColumns.forEach(col => {
        console.log(`- ${col.Field}: ${col.Type}`);
      });
    } else {
      console.log('❌ No delivery-related columns found');
    }
    
    // Check if there are any approved custom orders
    const [approvedOrders] = await connection.execute(`
      SELECT id, custom_order_id, customer_name, status 
      FROM custom_orders 
      WHERE status = 'approved'
      LIMIT 3
    `);
    
    console.log('\nApproved Custom Orders:');
    if (approvedOrders.length > 0) {
      approvedOrders.forEach(order => {
        console.log(`- ${order.custom_order_id}: ${order.customer_name} (${order.status})`);
      });
    } else {
      console.log('❌ No approved custom orders found');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await connection.end();
  }
}

checkCustomOrdersTable();
