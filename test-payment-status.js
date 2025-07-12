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

async function testPendingVerificationStatus() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    // Simulate the pending verification logic from the API
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
    
    console.log('=== TESTING PAYMENT STATUS LOGIC ===');
    console.log(`Found ${orders.length} orders with pending/cancelled status`);
    
    orders.forEach(order => {
      // Simulate the payment status logic
      let payment_status = 'pending';
      if (order.status === 'cancelled' && order.notes && (order.notes.includes('Payment denied') || order.notes.includes('Payment rejected'))) {
        payment_status = 'rejected';
      } else if (order.status === 'confirmed') {
        payment_status = 'verified';
      }
      
      console.log(`\nOrder ${order.order_number}:`);
      console.log(`  - Database status: ${order.status}`);
      console.log(`  - Computed payment_status: ${payment_status}`);
      console.log(`  - Notes: ${order.notes ? order.notes.substring(0, 100) + '...' : 'No notes'}`);
    });
    
  } finally {
    await connection.end();
  }
}

testPendingVerificationStatus().catch(console.error);
