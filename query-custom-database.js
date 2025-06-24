const mysql = require('mysql2/promise');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, 'server', '.env') });

async function queryCustomDatabase() {
  let connection;
  
  try {
    console.log('=== CUSTOM DESIGN DATABASE QUERY TOOL ===\n');
    
    // Connect to database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 's3v3n-f0ur-cl0thing*',
      database: process.env.DB_NAME || 'seven_four_clothing',
      port: process.env.DB_PORT || 3306
    });
    
    console.log('✅ Connected to database\n');
    
    // 1. Show table structures
    console.log('📋 TABLE STRUCTURES:\n');
    
    console.log('1. CUSTOM_ORDERS TABLE:');
    const [orderCols] = await connection.execute('DESCRIBE custom_orders');
    orderCols.forEach(col => {
      console.log(`   ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(nullable)' : '(required)'} ${col.Key ? `[${col.Key}]` : ''}`);
    });
    
    console.log('\n2. CUSTOM_ORDER_IMAGES TABLE:');
    const [imageCols] = await connection.execute('DESCRIBE custom_order_images');
    imageCols.forEach(col => {
      console.log(`   ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(nullable)' : '(required)'} ${col.Key ? `[${col.Key}]` : ''}`);
    });
    
    // 2. Show recent orders
    console.log('\n📦 RECENT CUSTOM ORDERS:');
    const [recentOrders] = await connection.execute(`
      SELECT 
        custom_order_id,
        product_type,
        product_name,
        size,
        color,
        quantity,
        customer_name,
        municipality,
        estimated_price,
        status,
        created_at
      FROM custom_orders 
      ORDER BY created_at DESC 
      LIMIT 5
    `);
    
    recentOrders.forEach((order, index) => {
      console.log(`\n${index + 1}. ORDER: ${order.custom_order_id}`);
      console.log(`   Product: ${order.product_name || order.product_type} (${order.size}, ${order.color})`);
      console.log(`   Quantity: ${order.quantity} | Price: ₱${order.estimated_price}`);
      console.log(`   Customer: ${order.customer_name}`);
      console.log(`   Location: ${order.municipality}`);
      console.log(`   Status: ${order.status.toUpperCase()}`);
      console.log(`   Date: ${new Date(order.created_at).toLocaleString()}`);
    });
    
    // 3. Show images for recent orders
    console.log('\n🖼️  ORDER IMAGES:');
    for (const order of recentOrders.slice(0, 3)) {
      const [images] = await connection.execute(`
        SELECT image_filename, original_filename, image_size, mime_type
        FROM custom_order_images 
        WHERE custom_order_id = ?
        ORDER BY upload_order
      `, [order.custom_order_id]);
      
      console.log(`\n   ${order.custom_order_id} (${images.length} images):`);
      images.forEach((img, idx) => {
        const sizeInMB = img.image_size ? (img.image_size / 1024 / 1024).toFixed(2) : 'unknown';
        console.log(`     ${idx + 1}. ${img.original_filename} (${sizeInMB}MB, ${img.mime_type})`);
      });
    }
    
    // 4. Summary statistics
    const [orderCount] = await connection.execute('SELECT COUNT(*) as count FROM custom_orders');
    const [imageCount] = await connection.execute('SELECT COUNT(*) as count FROM custom_order_images');
    const [totalValue] = await connection.execute('SELECT SUM(estimated_price) as total FROM custom_orders');
    
    console.log('\n📊 DATABASE SUMMARY:');
    console.log(`   Total Orders: ${orderCount[0].count}`);
    console.log(`   Total Images: ${imageCount[0].count}`);
    console.log(`   Total Value: ₱${(totalValue[0].total || 0).toLocaleString()}`);
    
    // 5. Product type breakdown
    const [productStats] = await connection.execute(`
      SELECT product_type, COUNT(*) as count, SUM(estimated_price) as value
      FROM custom_orders 
      GROUP BY product_type
      ORDER BY count DESC
    `);
    
    console.log('\n🎽 PRODUCT BREAKDOWN:');
    productStats.forEach(stat => {
      console.log(`   ${stat.product_type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}: ${stat.count} orders (₱${stat.value.toLocaleString()})`);
    });
    
  } catch (error) {
    console.error('❌ Error querying database:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the query tool
queryCustomDatabase();
