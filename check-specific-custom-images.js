const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 's3v3n-f0ur-cl0thing*',
  database: 'seven_four_clothing'
};

async function checkCustomOrderImages() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // Check specific custom orders from cancellation requests
    const customOrderIds = ['CUSTOM-SM-8SXDR-2612', 'CUSTOM-SE-QDPYR-9065', 'CUSTOM-YR-57YHE-6098'];
    
    for (const customOrderId of customOrderIds) {
      console.log(`\nChecking custom order: ${customOrderId}`);
      
      // Check custom order details
      const [customOrder] = await connection.execute(`
        SELECT product_type, product_name, status, customer_name
        FROM custom_orders
        WHERE custom_order_id = ?
      `, [customOrderId]);
      
      if (customOrder.length > 0) {
        console.log(`  Product: ${customOrder[0].product_type} - ${customOrder[0].product_name}`);
        console.log(`  Status: ${customOrder[0].status}`);
        console.log(`  Customer: ${customOrder[0].customer_name}`);
      } else {
        console.log(`  NOT FOUND in custom_orders table`);
      }
      
      // Check images
      const [images] = await connection.execute(`
        SELECT image_filename, upload_order, created_at
        FROM custom_order_images
        WHERE custom_order_id = ?
        ORDER BY upload_order ASC, created_at ASC
      `, [customOrderId]);
      
      console.log(`  Images found: ${images.length}`);
      images.forEach(img => {
        console.log(`    ${img.image_filename} (order: ${img.upload_order}, created: ${img.created_at})`);
      });
    }
    
    await connection.end();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkCustomOrderImages();
