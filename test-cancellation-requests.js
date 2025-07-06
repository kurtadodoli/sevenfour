const mysql = require('mysql2/promise');

// Use the same config as app.js
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'seven_four_clothing',
  charset: 'utf8mb4'
};

async function testCancellationRequests() {
  try {
    console.log('=== Testing Cancellation Requests with Product Images ===');
    console.log('Using config:', {
      host: dbConfig.host,
      user: dbConfig.user,
      database: dbConfig.database
    });
    
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');
    
    // Test the updated query
    const [requests] = await connection.execute(`
      SELECT 
        cr.*,
        o.order_number,
        o.total_amount,
        u.first_name,
        u.last_name,
        u.email as customer_email,
        CONCAT(u.first_name, ' ', u.last_name) as user_name,
        oi.customer_name,
        oi.customer_email as invoice_customer_email,
        pi.image_url as product_image
      FROM cancellation_requests cr
      LEFT JOIN orders o ON cr.order_id = o.id
      LEFT JOIN users u ON o.user_id = u.user_id
      LEFT JOIN order_invoices oi ON o.invoice_id = oi.invoice_id
      LEFT JOIN order_items oit ON o.id = oit.order_id
      LEFT JOIN products p ON oit.product_id = p.product_id
      LEFT JOIN product_images pi ON p.product_id = pi.product_id AND pi.is_primary = 1
      GROUP BY cr.id
      ORDER BY cr.created_at DESC
    `);
    
    console.log(`✅ Found ${requests.length} cancellation requests`);
    
    if (requests.length > 0) {
      console.log('\n📋 Sample cancellation request:');
      const sample = requests[0];
      console.log('- ID:', sample.id);
      console.log('- Order Number:', sample.order_number);
      console.log('- Customer:', sample.customer_name || sample.user_name);
      console.log('- Status:', sample.status);
      console.log('- Product Image:', sample.product_image ? 'YES' : 'NO');
      if (sample.product_image) {
        console.log('- Image URL:', sample.product_image);
      }
    } else {
      console.log('ℹ️ No cancellation requests found. This is normal if none have been created yet.');
    }
    
    await connection.end();
    console.log('✅ Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Error testing cancellation requests:', error);
  }
}

testCancellationRequests();
