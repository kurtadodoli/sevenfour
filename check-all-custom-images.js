const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 's3v3n-f0ur-cl0thing*',
  database: 'seven_four_clothing'
};

async function checkAllCustomOrderImages() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    console.log('Checking all custom order images...');
    
    const [images] = await connection.execute(`
      SELECT custom_order_id, image_filename, upload_order, created_at
      FROM custom_order_images
      ORDER BY created_at DESC
      LIMIT 20
    `);
    
    console.log(`Found ${images.length} custom order images:`);
    images.forEach(img => {
      console.log(`  ${img.custom_order_id}: ${img.image_filename} (order: ${img.upload_order})`);
    });
    
    console.log('\nChecking all custom orders...');
    
    const [customOrders] = await connection.execute(`
      SELECT custom_order_id, product_type, customer_name, status, created_at
      FROM custom_orders
      ORDER BY created_at DESC
      LIMIT 20
    `);
    
    console.log(`Found ${customOrders.length} custom orders:`);
    customOrders.forEach(order => {
      console.log(`  ${order.custom_order_id}: ${order.product_type} (${order.status}) - ${order.customer_name}`);
    });
    
    // Check if any of the image custom_order_ids match the cancellation custom order numbers
    console.log('\nChecking for matches with cancellation requests...');
    const cancellationCustomIds = ['CUSTOM-SM-8SXDR-2612', 'CUSTOM-SE-QDPYR-9065', 'CUSTOM-YR-57YHE-6098', 'CUSTOM-GE-SKUCS-1786', 'CUSTOM-JV-T8FOQ-1610'];
    
    for (const customId of cancellationCustomIds) {
      const [matchingImages] = await connection.execute(`
        SELECT image_filename
        FROM custom_order_images
        WHERE custom_order_id = ?
      `, [customId]);
      
      const [matchingOrders] = await connection.execute(`
        SELECT status, product_type
        FROM custom_orders
        WHERE custom_order_id = ?
      `, [customId]);
      
      console.log(`  ${customId}:`);
      console.log(`    Images: ${matchingImages.length}`);
      console.log(`    In custom_orders table: ${matchingOrders.length > 0 ? 'YES' : 'NO'}`);
      if (matchingOrders.length > 0) {
        console.log(`    Order status: ${matchingOrders[0].status}, type: ${matchingOrders[0].product_type}`);
      }
    }
    
    await connection.end();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkAllCustomOrderImages();
