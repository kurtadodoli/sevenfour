const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 's3v3n-f0ur-cl0thing*',
  database: 'seven_four_clothing',
  port: 3306
};

async function checkStockStatus() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('📊 CURRENT STOCK STATUS\n');
    
    // Check current stock levels for all products
    const [products] = await connection.execute(`
      SELECT 
        product_id,
        productname,
        productcolor,
        total_stock,
        total_available_stock,
        total_reserved_stock,
        stock_status,
        last_stock_update
      FROM products 
      WHERE (productstatus = 'active' OR status = 'active')
      ORDER BY productname
    `);
    
    console.log('🏪 Current Inventory Status:');
    console.log('━'.repeat(80));
    
    products.forEach(product => {
      const statusIcon = {
        'out_of_stock': '🔴',
        'critical_stock': '🟠',
        'low_stock': '🟡',
        'in_stock': '🟢'
      }[product.stock_status] || '⚪';
      
      console.log(`${statusIcon} ${product.productname} (${product.productcolor})`);
      console.log(`   Total Stock: ${product.total_stock || 0}`);
      console.log(`   Available: ${product.total_available_stock || 0}`);
      console.log(`   Reserved: ${product.total_reserved_stock || 0}`);
      console.log(`   Status: ${product.stock_status}`);
      console.log(`   Last Updated: ${product.last_stock_update || 'Never'}`);
      console.log('');
    });
    
    // Summary
    const summary = {
      total: products.length,
      in_stock: products.filter(p => p.stock_status === 'in_stock').length,
      low_stock: products.filter(p => p.stock_status === 'low_stock').length,
      critical_stock: products.filter(p => p.stock_status === 'critical_stock').length,
      out_of_stock: products.filter(p => p.stock_status === 'out_of_stock').length
    };
    
    console.log('📈 INVENTORY SUMMARY:');
    console.log(`🟢 In Stock: ${summary.in_stock} products`);
    console.log(`🟡 Low Stock: ${summary.low_stock} products`);
    console.log(`🟠 Critical Stock: ${summary.critical_stock} products`);
    console.log(`🔴 Out of Stock: ${summary.out_of_stock} products`);
    console.log(`📦 Total Active Products: ${summary.total}`);
    
    // Check recent order activity
    console.log('\n📋 RECENT ORDER ACTIVITY:');
    const [recentActivity] = await connection.execute(`
      SELECT 
        o.order_number,
        o.status,
        o.order_date,
        GROUP_CONCAT(
          CONCAT(oi.quantity, 'x ', p.productname) 
          SEPARATOR ', '
        ) as items,
        cr.status as cancellation_status
      FROM orders o
      JOIN order_items oi ON o.invoice_id = oi.invoice_id
      JOIN products p ON oi.product_id = p.product_id
      LEFT JOIN cancellation_requests cr ON o.id = cr.order_id AND cr.status = 'pending'
      WHERE o.order_date >= DATE_SUB(NOW(), INTERVAL 1 DAY)
      GROUP BY o.id, o.order_number, o.status, o.order_date, cr.status
      ORDER BY o.order_date DESC
      LIMIT 10
    `);
    
    recentActivity.forEach(activity => {
      const statusIcon = activity.status === 'confirmed' ? '✅' : 
                        activity.status === 'cancelled' ? '❌' : 
                        activity.status === 'pending' ? '⏳' : '❓';
      
      console.log(`${statusIcon} Order ${activity.order_number}: ${activity.status}`);
      console.log(`   Items: ${activity.items}`);
      if (activity.cancellation_status === 'pending') {
        console.log(`   🟡 Cancellation Requested`);
      }
      console.log(`   Date: ${activity.order_date}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

checkStockStatus();
