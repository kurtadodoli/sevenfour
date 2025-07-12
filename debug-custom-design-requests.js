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

async function debugCustomDesignRequests() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('=== DEBUGGING CUSTOM DESIGN REQUESTS ===\n');
    
    // Get all custom orders
    const [customOrders] = await connection.execute(`
      SELECT 
        id,
        custom_order_id,
        user_id,
        product_type,
        size,
        color,
        quantity,
        estimated_price,
        final_price,
        status,
        created_at,
        updated_at
      FROM custom_orders 
      ORDER BY created_at DESC 
      LIMIT 5
    `);
    
    console.log(`Found ${customOrders.length} custom orders:`);
    
    customOrders.forEach((order, index) => {
      console.log(`\n${index + 1}. Custom Order ${order.custom_order_id}:`);
      console.log(`   - ID: ${order.id}`);
      console.log(`   - Status: ${order.status}`);
      console.log(`   - Product Type: ${order.product_type}`);
      console.log(`   - Size: ${order.size}`);
      console.log(`   - Color: ${order.color}`);
      console.log(`   - Quantity: ${order.quantity}`);
      console.log(`   - Price: ${order.estimated_price || order.final_price || 'N/A'}`);
      console.log(`   - Created: ${order.created_at}`);
      
      // Check if approve/reject buttons should show
      const shouldShowButtons = order.status === 'pending';
      console.log(`   - Should show approve/reject buttons: ${shouldShowButtons ? 'YES' : 'NO'}`);
    });
    
    // Also check if there are any user details for these orders
    console.log('\n=== CHECKING USER DETAILS ===');
    for (let order of customOrders) {
      const [users] = await connection.execute(
        'SELECT user_id, first_name, last_name, email FROM users WHERE user_id = ?',
        [order.user_id]
      );
      
      if (users.length > 0) {
        const user = users[0];
        console.log(`\nOrder ${order.custom_order_id} customer:`);
        console.log(`   - Name: ${user.first_name} ${user.last_name}`);
        console.log(`   - Email: ${user.email}`);
      }
    }
    
    console.log('\n=== EXPECTED FRONTEND BEHAVIOR ===');
    console.log('For orders with status "pending":');
    console.log('- Should display green checkmark (approve) button');
    console.log('- Should display red X (reject) button'); 
    console.log('- Should display blue eye (view) button');
    console.log('\nFor orders with other statuses:');
    console.log('- Should only display blue eye (view) button');
    
  } finally {
    await connection.end();
  }
}

debugCustomDesignRequests().catch(console.error);
