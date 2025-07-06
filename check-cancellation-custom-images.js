const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 's3v3n-f0ur-cl0thing*',
  database: 'seven_four_clothing'
};

async function checkCancellationCustomOrders() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    console.log('Checking cancellation requests for custom orders...');
    
    const [requests] = await connection.execute(`
      SELECT 
        cr.id as request_id,
        cr.order_id,
        o.order_number,
        o.order_type,
        cr.status,
        -- Check both image sources
        (SELECT pi.image_filename 
         FROM order_items oit2 
         LEFT JOIN products p ON oit2.product_id = p.product_id
         LEFT JOIN product_images pi ON p.product_id = pi.product_id AND pi.is_thumbnail = 1
         WHERE oit2.order_id = o.id 
         LIMIT 1) as regular_image,
        (SELECT coi.image_filename
         FROM custom_order_images coi
         WHERE coi.custom_order_id = o.order_number
         ORDER BY coi.upload_order ASC, coi.created_at ASC
         LIMIT 1) as custom_image,
        -- Final product image as backend would send it
        COALESCE(
          (SELECT CASE 
              WHEN pi.image_filename IS NOT NULL THEN 
                  CASE 
                      WHEN pi.image_filename LIKE '%.%' THEN pi.image_filename
                      ELSE CONCAT(pi.image_filename, '.jpg')
                  END
              WHEN p.productimage IS NOT NULL THEN p.productimage
              ELSE NULL
           END
           FROM order_items oit2 
           LEFT JOIN products p ON oit2.product_id = p.product_id
           LEFT JOIN product_images pi ON p.product_id = pi.product_id AND pi.is_thumbnail = 1
           WHERE oit2.order_id = o.id 
           LIMIT 1),
          (SELECT 
              CASE 
                  WHEN coi.image_filename IS NOT NULL THEN 
                      CONCAT('custom-orders/', coi.image_filename)
                  ELSE NULL
              END
           FROM custom_order_images coi
           WHERE coi.custom_order_id = o.order_number
           ORDER BY coi.upload_order ASC, coi.created_at ASC
           LIMIT 1),
          'default-product.png'
        ) as final_product_image
      FROM cancellation_requests cr
      LEFT JOIN orders o ON cr.order_id = o.id
      ORDER BY cr.created_at DESC
      LIMIT 10
    `);
    
    console.log('Found cancellation requests:', requests.length);
    
    requests.forEach(req => {
      console.log(`Request ${req.request_id}: Order ${req.order_number} (Type: ${req.order_type || 'unknown'})`);
      console.log(`  Regular image: ${req.regular_image || 'none'}`);
      console.log(`  Custom image: ${req.custom_image || 'none'}`);
      console.log(`  Final image: ${req.final_product_image || 'none'}`);
      console.log('---');
    });
    
    await connection.end();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkCancellationCustomOrders();
