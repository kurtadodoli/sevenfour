const mysql = require('mysql2/promise');

async function createInventoryStockDemo() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 's3v3n-f0ur-cl0thing*',
    database: 'seven_four_clothing'
  });

  try {
    console.log('🎯 Creating Inventory Stock Status Demo Data...\n');
    
    // First, clear any existing demo products
    await connection.execute(`DELETE FROM products WHERE productname LIKE 'Demo %'`);
    
    // Create demo products with different stock levels
    const demoProducts = [
      {
        name: 'Demo Critical Stock T-Shirt',
        color: 'Red',
        price: 299.99,
        sizes: JSON.stringify([
          { size: 'S', stock: 0 },
          { size: 'M', stock: 2 },
          { size: 'L', stock: 1 },
          { size: 'XL', stock: 0 }
        ]),
        totalStock: 3 // Critical (≤ 10)
      },
      {
        name: 'Demo Low Stock Hoodie',
        color: 'Blue',
        price: 599.99,
        sizes: JSON.stringify([
          { size: 'S', stock: 8 },
          { size: 'M', stock: 12 },
          { size: 'L', stock: 5 },
          { size: 'XL', stock: 0 }
        ]),
        totalStock: 25 // Low (≤ 25)
      },
      {
        name: 'Demo Normal Stock Shorts',
        color: 'Black',
        price: 399.99,
        sizes: JSON.stringify([
          { size: 'S', stock: 50 },
          { size: 'M', stock: 75 },
          { size: 'L', stock: 60 },
          { size: 'XL', stock: 40 }
        ]),
        totalStock: 225 // Normal (> 25)
      },
      {
        name: 'Demo Out of Stock Jersey',
        color: 'White',
        price: 799.99,
        sizes: JSON.stringify([
          { size: 'S', stock: 0 },
          { size: 'M', stock: 0 },
          { size: 'L', stock: 0 },
          { size: 'XL', stock: 0 }
        ]),
        totalStock: 0 // Critical (out of stock)
      },
      {
        name: 'Demo Mixed Stock Jacket',
        color: 'Green',
        price: 899.99,
        sizes: JSON.stringify([
          { size: 'S', stock: 0 },    // Critical
          { size: 'M', stock: 3 },    // Critical
          { size: 'L', stock: 15 },   // Low
          { size: 'XL', stock: 2 }    // Critical
        ]),
        totalStock: 20 // Low stock overall
      }
    ];
    
    console.log('📦 Creating demo products with different stock levels...\n');
      for (const product of demoProducts) {
      // Generate a unique product_id
      const productId = Date.now() + Math.floor(Math.random() * 1000);
      
      await connection.execute(`
        INSERT INTO products (product_id, productname, productcolor, productprice, sizes, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, NOW(), NOW())
      `, [productId, product.name, product.color, product.price, product.sizes]);
      
      // Determine stock status
      let status;
      if (product.totalStock === 0) status = '🔴 OUT OF STOCK';
      else if (product.totalStock <= 10) status = '🔴 CRITICAL STOCK';
      else if (product.totalStock <= 25) status = '🟡 LOW STOCK';
      else status = '🟢 NORMAL STOCK';
      
      console.log(`✅ ${product.name}`);
      console.log(`   Color: ${product.color} | Price: ₱${product.price}`);
      console.log(`   Total Stock: ${product.totalStock} units`);
      console.log(`   Status: ${status}`);
      console.log('   Size Breakdown:');
      
      const sizes = JSON.parse(product.sizes);
      sizes.forEach(size => {
        let sizeStatus;
        if (size.stock === 0) sizeStatus = '🔴 OUT';
        else if (size.stock <= 5) sizeStatus = '🟡 LOW';
        else sizeStatus = '🟢 OK';
        console.log(`     ${size.size}: ${size.stock} units ${sizeStatus}`);
      });
      console.log('');
    }
    
    // Get summary statistics
    const [products] = await connection.execute(`
      SELECT productname, sizes FROM products WHERE productname LIKE 'Demo %'
    `);
    
    let criticalCount = 0;
    let lowStockCount = 0;
    let normalCount = 0;
    let totalStock = 0;
    
    products.forEach(product => {
      const sizes = JSON.parse(product.sizes || '[]');
      const stock = sizes.reduce((total, size) => total + (size.stock || 0), 0);
      totalStock += stock;
      
      if (stock === 0 || stock <= 10) criticalCount++;
      else if (stock <= 25) lowStockCount++;
      else normalCount++;
    });
    
    console.log('📊 INVENTORY SUMMARY:');
    console.log(`Total Products: ${products.length}`);
    console.log(`Total Stock Units: ${totalStock}`);
    console.log(`🔴 Critical Stock Products: ${criticalCount}`);
    console.log(`🟡 Low Stock Products: ${lowStockCount}`);
    console.log(`🟢 Normal Stock Products: ${normalCount}`);
    
    console.log('\n🎯 STOCK STATUS INDICATORS EXPLAINED:');
    console.log('🔴 CRITICAL STOCK: 0-10 units (Red background, warning icons)');
    console.log('🟡 LOW STOCK: 11-25 units (Orange background, warning icons)');
    console.log('🟢 NORMAL STOCK: 26+ units (Green background, normal icons)');
    
    console.log('\n📱 UI FEATURES:');
    console.log('- Stats cards at top show alert badges when critical/low stock detected');
    console.log('- Product table shows color-coded stock status badges');
    console.log('- Individual size breakdowns show warning icons for low/out of stock');
    console.log('- Filter dropdown allows viewing by stock status');
    console.log('- Sort by stock level to prioritize restocking');
    
    console.log('\n✅ Demo data created! Visit InventoryPage to see the enhanced stock indicators.');
    
  } catch (error) {
    console.error('❌ Error creating demo data:', error.message);
  } finally {
    await connection.end();
  }
}

createInventoryStockDemo();
