const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 's3v3n-f0ur-cl0thing*',
  database: 'seven_four_clothing'
};

async function testCustomDesignRequests() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');

    // Test the custom design requests query (simulate the /admin/all endpoint)
    console.log('\n=== TESTING CUSTOM DESIGN REQUESTS ===');
    
    // Get orders first
    const [orders] = await connection.execute(`
        SELECT 
            co.*,
            u.first_name,
            u.last_name,
            u.email as user_email
        FROM custom_orders co
        LEFT JOIN users u ON co.user_id = u.user_id
        ORDER BY co.created_at DESC
        LIMIT 3
    `);

    console.log(`📋 Found ${orders.length} custom orders`);
    
    if (orders.length > 0) {
      // Process each order and get images
      for (const order of orders) {
        console.log(`\n--- ${order.custom_order_id} ---`);
        console.log(`Customer: ${order.customer_name}`);
        console.log(`Product: ${order.product_type} - ${order.product_name || 'Custom Design'}`);
        console.log(`Size: ${order.size}, Color: ${order.color}, Qty: ${order.quantity}`);
        console.log(`Final Price: ${order.final_price || 'N/A'}`);
        console.log(`Estimated Price: ${order.estimated_price || 'N/A'}`);
        console.log(`Status: ${order.status}`);
        
        // Get images for this order
        const [images] = await connection.execute(`
            SELECT 
                id,
                image_filename as filename,
                original_filename,
                image_size,
                mime_type,
                upload_order
            FROM custom_order_images 
            WHERE custom_order_id = ?
            ORDER BY upload_order ASC
        `, [order.custom_order_id]);
        
        console.log(`Images: ${images.length} found`);
        if (images.length > 0) {
          images.forEach((img, index) => {
            console.log(`  ${index + 1}. ${img.filename} (${img.mime_type})`);
          });
        }
      }
    }

    await connection.end();
  } catch (error) {
    console.error('❌ Error:', error);
    if (connection) await connection.end();
  }
}

testCustomDesignRequests();
