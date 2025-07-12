const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'server', '.env') });

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'seven_four_clothing',
  charset: 'utf8mb4'
};

async function testPendingVerificationAPI() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('=== SIMULATING PENDING VERIFICATION API ===');
    
    // Get orders with status 'pending' (for verification) or 'cancelled' (previously denied)
    const [orders] = await connection.execute(`
      SELECT DISTINCT
          o.id as order_id,
          o.order_number,
          o.order_date,
          o.total_amount,
          o.status,
          o.notes,
          o.updated_at
      FROM orders o
      WHERE (o.status = 'pending' OR o.status = 'cancelled')
      ORDER BY o.order_date DESC
      LIMIT 10
    `);
    
    console.log(`Found ${orders.length} pending orders before payment proof filter`);
    
    // For each order, get order items and check if they have payment proof
    const ordersWithPaymentProof = [];
    
    for (let order of orders) {
      const [items] = await connection.execute(`
        SELECT 
            oi.*,
            p.productname,
            p.productcolor,
            p.product_type,
            p.productimage
        FROM order_items oi
        LEFT JOIN products p ON oi.product_id = p.product_id
        WHERE oi.order_id = ?
        AND oi.gcash_reference_number IS NOT NULL 
        AND oi.gcash_reference_number != 'COD_ORDER'
        AND oi.gcash_reference_number != 'N/A'
        AND oi.payment_proof_image_path IS NOT NULL
        AND oi.payment_proof_image_path != 'N/A'
        ORDER BY oi.sort_order
      `, [order.order_id]);
      
      if (items.length > 0 || order.status === 'cancelled') {
        // Get all order items for this order
        const [allItems] = await connection.execute(`
          SELECT 
              oi.*,
              p.productname,
              p.productcolor,
              p.product_type,
              p.productimage
          FROM order_items oi
          LEFT JOIN products p ON oi.product_id = p.product_id
          WHERE oi.order_id = ?
          ORDER BY oi.id
        `, [order.order_id]);
        
        // Use the first order item with payment proof for customer details
        const firstItemWithProof = items.length > 0 ? items[0] : null;
        
        // Determine payment status based on order status and notes
        let payment_status = 'pending';
        if (order.status === 'cancelled' && order.notes && (order.notes.includes('Payment denied') || order.notes.includes('Payment rejected'))) {
          payment_status = 'rejected';
        } else if (order.status === 'confirmed') {
          payment_status = 'verified';
        }
        
        order.payment_status = payment_status;
        order.items = allItems;
        
        ordersWithPaymentProof.push(order);
      }
    }
    
    console.log(`Found ${ordersWithPaymentProof.length} orders with payment verification data`);
    
    ordersWithPaymentProof.forEach(order => {
      console.log(`\nOrder ${order.order_number}:`);
      console.log(`  - Database status: ${order.status}`);
      console.log(`  - Payment status: ${order.payment_status}`);
      console.log(`  - Total amount: ${order.total_amount}`);
      console.log(`  - Items count: ${order.items ? order.items.length : 0}`);
    });
    
    // This should match what the API returns
    const apiResponse = {
      success: true,
      data: ordersWithPaymentProof,
      count: ordersWithPaymentProof.length
    };
    
    console.log('\n=== API RESPONSE STRUCTURE ===');
    console.log('Success:', apiResponse.success);
    console.log('Count:', apiResponse.count);
    
  } finally {
    await connection.end();
  }
}

testPendingVerificationAPI().catch(console.error);
