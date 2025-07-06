const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 's3v3n-f0ur-cl0thing*',
  database: 'seven_four_clothing'
};

async function checkCancellationRequests() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    console.log('Checking all cancellation requests...');
    
    const [requests] = await connection.execute(`
      SELECT 
        cr.*,
        o.order_number as linked_order_number
      FROM cancellation_requests cr
      LEFT JOIN orders o ON cr.order_id = o.id
      ORDER BY cr.created_at DESC
    `);
    
    console.log(`Found ${requests.length} cancellation requests:`);
    requests.forEach(req => {
      console.log(`Request ${req.id}:`);
      console.log(`  Order ID: ${req.order_id}`);
      console.log(`  Order Number (from request): ${req.order_number || 'none'}`);
      console.log(`  Order Number (from orders table): ${req.linked_order_number || 'none'}`);
      console.log(`  User ID: ${req.user_id}`);
      console.log(`  Status: ${req.status}`);
      console.log(`  Reason: ${req.reason || 'none'}`);
      console.log('---');
    });
    
    // Now let's check what should be the image source for each
    console.log('\nChecking image sources for these orders...');
    
    for (const req of requests.slice(0, 3)) { // Check first 3
      console.log(`\nRequest ${req.id} - Order ${req.order_number || req.linked_order_number}:`);
      
      // Check if it's a custom order by order number pattern
      const isCustomOrder = req.order_number && req.order_number.startsWith('CUSTOM-');
      console.log(`  Is custom order pattern: ${isCustomOrder}`);
      
      if (isCustomOrder) {
        // Check custom order images
        const [customImages] = await connection.execute(`
          SELECT image_filename, upload_order, created_at
          FROM custom_order_images 
          WHERE custom_order_id = ?
          ORDER BY upload_order ASC, created_at ASC
        `, [req.order_number]);
        
        console.log(`  Custom order images: ${customImages.length}`);
        customImages.forEach(img => {
          console.log(`    ${img.image_filename} (order: ${img.upload_order})`);
        });
      } else {
        // Check regular order items
        const [orderItems] = await connection.execute(`
          SELECT 
            oi.product_id,
            p.productname,
            p.productimage,
            pi.image_filename,
            pi.is_thumbnail
          FROM order_items oi
          LEFT JOIN products p ON oi.product_id = p.product_id
          LEFT JOIN product_images pi ON p.product_id = pi.product_id
          WHERE oi.order_id = ?
        `, [req.order_id]);
        
        console.log(`  Regular order items: ${orderItems.length}`);
        orderItems.forEach(item => {
          console.log(`    Product: ${item.productname}`);
          console.log(`    Product image: ${item.productimage || 'none'}`);
          console.log(`    Thumbnail: ${item.image_filename || 'none'} (is_thumbnail: ${item.is_thumbnail})`);
        });
      }
    }
    
    await connection.end();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkCancellationRequests();
