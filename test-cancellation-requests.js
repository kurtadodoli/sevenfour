const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 's3v3n-f0ur-cl0thing*',
  database: 'seven_four_clothing'
};

async function testCancellationRequests() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');

    // Test the updated query
    console.log('\n=== TESTING UPDATED CANCELLATION REQUESTS QUERY ===');
    const [requests] = await connection.execute(`
        SELECT 
            cr.*,
            o.order_number,
            -- Handle amount for both regular and custom orders
            CASE 
                WHEN cr.order_number LIKE 'CUSTOM-%' THEN
                    COALESCE(
                        (SELECT COALESCE(co.final_price, co.estimated_price, 0) 
                         FROM custom_orders co 
                         WHERE co.custom_order_id = cr.order_number),
                        0
                    )
                ELSE
                    COALESCE(o.total_amount, 0)
            END as total_amount,
            u.first_name,
            u.last_name,
            u.email as customer_email,
            CONCAT(u.first_name, ' ', u.last_name) as user_name,
            oi.customer_name,
            oi.customer_email as invoice_customer_email,
            -- Handle both regular orders and custom orders for product images
            CASE 
                -- Check if this is a custom order by pattern
                WHEN cr.order_number LIKE 'CUSTOM-%' THEN
                    COALESCE(
                        -- Try to get custom order image first
                        (SELECT 
                            CASE 
                                WHEN coi.image_filename IS NOT NULL THEN 
                                    CONCAT('custom-orders/', coi.image_filename)
                                ELSE NULL
                            END
                         FROM custom_order_images coi
                         WHERE coi.custom_order_id = cr.order_number
                         ORDER BY coi.upload_order ASC, coi.created_at ASC
                         LIMIT 1),
                        -- Fallback: check if custom order exists and return null for proper frontend handling
                        (SELECT 
                            CASE 
                                WHEN co.custom_order_id IS NOT NULL THEN NULL
                                ELSE NULL
                            END
                         FROM custom_orders co 
                         WHERE co.custom_order_id = cr.order_number
                         LIMIT 1),
                        -- Default fallback for custom orders without images
                        NULL
                    )
                ELSE
                    -- Handle regular orders
                    COALESCE(
                        -- Try to get image from regular order items
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
                        -- Default fallback for regular orders
                        'default-product.png'
                    )
            END as product_image,
            -- Add order type indicator for frontend
            CASE 
                WHEN cr.order_number LIKE 'CUSTOM-%' THEN 'custom'
                ELSE 'regular'
            END as order_type,
            -- Add custom order details for better admin review
            CASE 
                WHEN cr.order_number LIKE 'CUSTOM-%' THEN
                    (SELECT CONCAT(
                        COALESCE(co.product_type, 'Unknown'), ' - ',
                        COALESCE(co.product_name, 'Custom Design'), ' (',
                        COALESCE(co.size, 'N/A'), ', ',
                        COALESCE(co.color, 'N/A'), ')'
                    ) FROM custom_orders co WHERE co.custom_order_id = cr.order_number)
                ELSE
                    (SELECT CONCAT(p.productname, ' (', oi.size, ')')
                     FROM order_items oi
                     LEFT JOIN products p ON oi.product_id = p.product_id
                     WHERE oi.order_id = o.id
                     LIMIT 1)
            END as product_details
        FROM cancellation_requests cr
        LEFT JOIN orders o ON cr.order_id = o.id
        LEFT JOIN users u ON o.user_id = u.user_id
        LEFT JOIN order_invoices oi ON o.invoice_id = oi.invoice_id
        ORDER BY cr.created_at DESC
    `);

    console.log(`📋 Found ${requests.length} cancellation requests`);
    
    if (requests.length > 0) {
      console.log('\n=== CANCELLATION REQUESTS DETAILS ===');
      requests.forEach((request, index) => {
        console.log(`\n${index + 1}. ${request.order_number} (${request.order_type})`);
        console.log(`   💰 Amount: ${request.total_amount || 'N/A'}`);
        console.log(`   🖼️ Image: ${request.product_image || 'N/A'}`);
        console.log(`   📝 Product Details: ${request.product_details || 'N/A'}`);
        console.log(`   👤 Customer: ${request.user_name || request.customer_name || 'N/A'}`);
        console.log(`   📧 Email: ${request.customer_email || 'N/A'}`);
        console.log(`   📅 Status: ${request.status}`);
        console.log(`   💬 Reason: ${request.reason || 'N/A'}`);
      });
    } else {
      console.log('\n❌ No cancellation requests found in database');
      
      // Check if we have any custom orders that could be cancelled
      console.log('\n=== CHECKING FOR CUSTOM ORDERS ===');
      const [customOrders] = await connection.execute(`
        SELECT custom_order_id, customer_name, status, final_price, estimated_price, product_type, product_name, size, color
        FROM custom_orders 
        WHERE status = 'confirmed'
        ORDER BY created_at DESC
        LIMIT 5
      `);
      
      console.log(`📋 Found ${customOrders.length} confirmed custom orders`);
      if (customOrders.length > 0) {
        customOrders.forEach((order, index) => {
          console.log(`\n${index + 1}. ${order.custom_order_id}`);
          console.log(`   👤 Customer: ${order.customer_name}`);
          console.log(`   💰 Price: ${order.final_price || order.estimated_price || 0}`);
          console.log(`   📝 Product: ${order.product_type} - ${order.product_name || 'Custom Design'} (${order.size}, ${order.color})`);
          console.log(`   📅 Status: ${order.status}`);
        });
      }
    }

    await connection.end();
  } catch (error) {
    console.error('❌ Error:', error);
    if (connection) await connection.end();
  }
}

testCancellationRequests();
