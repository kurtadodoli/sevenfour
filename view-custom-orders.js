const mysql = require('mysql2/promise');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, 'server', '.env') });

async function viewCustomOrders() {
  let connection;
  
  try {
    console.log('=== CUSTOM ORDERS DATABASE VIEWER ===\n');
    
    // Connect to database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 's3v3n-f0ur-cl0thing*',
      database: process.env.DB_NAME || 'seven_four_clothing',
      port: process.env.DB_PORT || 3306
    });
    
    console.log('✅ Connected to database\n');
    
    // Get all orders with image count
    const [orders] = await connection.execute(`
      SELECT 
        co.custom_order_id,
        co.product_type,
        co.product_name,
        co.size,
        co.color,
        co.quantity,
        co.customer_name,
        co.customer_email,
        co.municipality,
        co.estimated_price,
        co.status,
        co.created_at,
        COUNT(coi.id) as image_count
      FROM custom_orders co
      LEFT JOIN custom_order_images coi ON co.custom_order_id = coi.custom_order_id
      GROUP BY co.id
      ORDER BY co.created_at DESC
    `);
    
    console.log(`📦 FOUND ${orders.length} CUSTOM ORDERS:\n`);
    
    orders.forEach((order, index) => {
      console.log(`${index + 1}. ${order.custom_order_id}`);
      console.log(`   Product: ${order.product_name || order.product_type} (${order.size}, ${order.color})`);
      console.log(`   Quantity: ${order.quantity} | Price: ₱${order.estimated_price}`);
      console.log(`   Customer: ${order.customer_name} (${order.customer_email})`);
      console.log(`   Location: ${order.municipality}`);
      console.log(`   Images: ${order.image_count} uploaded`);
      console.log(`   Status: ${order.status.toUpperCase()}`);
      console.log(`   Created: ${new Date(order.created_at).toLocaleString()}`);
      console.log('   ' + '-'.repeat(60));
    });
    
    // Summary statistics
    const statusCounts = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});
    
    const totalValue = orders.reduce((sum, order) => sum + parseFloat(order.estimated_price), 0);
    const totalImages = orders.reduce((sum, order) => sum + order.image_count, 0);
    
    console.log('\n📊 SUMMARY STATISTICS:');
    console.log(`   Total Orders: ${orders.length}`);
    console.log(`   Total Value: ₱${totalValue.toLocaleString()}`);
    console.log(`   Total Images: ${totalImages}`);
    console.log('\n📈 Order Status Breakdown:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`   ${status.replace('_', ' ').toUpperCase()}: ${count}`);
    });
    
    // Most popular products
    const productCounts = orders.reduce((acc, order) => {
      acc[order.product_type] = (acc[order.product_type] || 0) + 1;
      return acc;
    }, {});
    
    console.log('\n🎽 Popular Product Types:');
    Object.entries(productCounts)
      .sort(([,a], [,b]) => b - a)
      .forEach(([product, count]) => {
        console.log(`   ${product.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}: ${count} orders`);
      });
    
    // Recent orders (last 5)
    if (orders.length > 0) {
      console.log('\n🕐 RECENT ORDERS:');
      orders.slice(0, 5).forEach((order, index) => {
        const timeAgo = Math.round((Date.now() - new Date(order.created_at).getTime()) / (1000 * 60 * 60));
        console.log(`   ${index + 1}. ${order.custom_order_id} - ${order.customer_name} (${timeAgo}h ago)`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error viewing custom orders:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the viewer
viewCustomOrders();
