const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 's3v3n-f0ur-cl0thing*',
  database: 'seven_four_clothing'
};

async function testCurrentBackendQuery() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    console.log('Testing current backend query for cancellation requests...');
    
    const [requests] = await connection.execute(`
        SELECT 
            cr.*,
            o.order_number as orders_table_number,
            o.total_amount,
            u.first_name,
            u.last_name,
            u.email as customer_email,
            CONCAT(u.first_name, ' ', u.last_name) as user_name,
            oi.customer_name,
            oi.customer_email as invoice_customer_email,
            -- Handle both regular orders and custom orders for product images
            COALESCE(
                -- Try to get image from regular order items first
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
                -- If no regular order image, try to get custom order image
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
                -- Default fallback
                'default-product.png'
            ) as product_image
        FROM cancellation_requests cr
        LEFT JOIN orders o ON cr.order_id = o.id
        LEFT JOIN users u ON o.user_id = u.user_id
        LEFT JOIN order_invoices oi ON o.invoice_id = oi.invoice_id
        WHERE cr.order_number LIKE 'CUSTOM-%'
        ORDER BY cr.created_at DESC
        LIMIT 10
    `);
    
    console.log(`Found ${requests.length} custom order cancellation requests:`);
    
    requests.forEach(req => {
      console.log(`\nRequest ${req.id}:`);
      console.log(`  Order ID (from cancellation): ${req.order_id}`);
      console.log(`  Order Number (from cancellation): ${req.order_number}`);
      console.log(`  Order Number (from orders table): ${req.orders_table_number || 'NULL'}`);
      console.log(`  Product Image: ${req.product_image}`);
      console.log(`  Customer: ${req.customer_name || req.user_name || 'unknown'}`);
    });
    
    await connection.end();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testCurrentBackendQuery();
