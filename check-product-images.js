const mysql = require('mysql2/promise');
const { dbConfig } = require('./server/config/db');

async function checkProductImageStructure() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    
    console.log('🖼️ Checking product image structure and availability...\n');
    
    // Check products table structure
    console.log('📊 Products table structure:');
    const [productColumns] = await connection.execute(`DESCRIBE products`);
    
    productColumns.forEach(col => {
      if (col.Field.toLowerCase().includes('image') || col.Field.toLowerCase().includes('photo')) {
        console.log(`🖼️  ${col.Field}: ${col.Type} (${col.Null === 'YES' ? 'nullable' : 'not null'})`);
      } else {
        console.log(`   ${col.Field}: ${col.Type}`);
      }
    });
    
    // Check if products have images
    console.log('\n📊 Products with images:');
    const [productsWithImages] = await connection.execute(`
      SELECT product_id, productname, productcolor, productimage 
      FROM products 
      WHERE productimage IS NOT NULL AND productimage != '' 
      LIMIT 10
    `);
    
    if (productsWithImages.length > 0) {
      productsWithImages.forEach((product, index) => {
        console.log(`\n--- Product ${index + 1} ---`);
        console.log('Product ID:', product.product_id);
        console.log('Name:', product.productname);
        console.log('Color:', product.productcolor);
        console.log('Image:', product.productimage);
        
        const image = product.productimage;
        if (image) {
          if (image.startsWith('http')) {
            console.log('  → Type: External URL');
          } else if (image.startsWith('/')) {
            console.log('  → Type: Absolute path');
          } else if (image.includes('.')) {
            console.log('  → Type: Filename/relative path');
          } else {
            console.log('  → Type: Unknown format');
          }
        }
      });
    } else {
      console.log('No products found with images.');
    }
    
    // Check order items with product info
    console.log('\n📊 Sample order items with product data:');
    const [orderItems] = await connection.execute(`
      SELECT 
        oi.order_id,
        oi.product_id,
        oi.product_name,
        oi.quantity,
        p.productname,
        p.productcolor,
        p.product_type,
        p.productimage
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.product_id
      LIMIT 10
    `);
    
    if (orderItems.length > 0) {
      orderItems.forEach((item, index) => {
        console.log(`\n--- Order Item ${index + 1} ---`);
        console.log('Order ID:', item.order_id);
        console.log('Product ID:', item.product_id);
        console.log('Product Name:', item.product_name || item.productname);
        console.log('Color:', item.productcolor);
        console.log('Type:', item.product_type);
        console.log('Image:', item.productimage);
        console.log('Quantity:', item.quantity);
      });
    } else {
      console.log('No order items found.');
    }
    
    // Check custom orders for image fields
    console.log('\n📊 Custom orders image structure:');
    const [customOrderColumns] = await connection.execute(`DESCRIBE custom_orders`);
    
    const imageFields = customOrderColumns.filter(col => 
      col.Field.toLowerCase().includes('image') || 
      col.Field.toLowerCase().includes('photo') ||
      col.Field.toLowerCase().includes('file')
    );
    
    if (imageFields.length > 0) {
      console.log('Custom order image fields:');
      imageFields.forEach(col => {
        console.log(`🖼️  ${col.Field}: ${col.Type} (${col.Null === 'YES' ? 'nullable' : 'not null'})`);
      });
      
      // Get sample custom orders with images
      const imageFieldNames = imageFields.map(field => field.Field).join(', ');
      const [customOrdersWithImages] = await connection.execute(`
        SELECT id, product_name, product_type, ${imageFieldNames}
        FROM custom_orders 
        LIMIT 5
      `);
      
      if (customOrdersWithImages.length > 0) {
        console.log('\nSample custom orders:');
        customOrdersWithImages.forEach((order, index) => {
          console.log(`\n--- Custom Order ${index + 1} ---`);
          console.log('ID:', order.id);
          console.log('Product Name:', order.product_name);
          console.log('Product Type:', order.product_type);
          imageFields.forEach(field => {
            console.log(`${field.Field}:`, order[field.Field]);
          });
        });
      }
    } else {
      console.log('No image fields found in custom_orders table.');
    }
    
    // Check custom designs for image fields
    console.log('\n📊 Custom designs image structure:');
    const [customDesignColumns] = await connection.execute(`DESCRIBE custom_designs`);
    
    const designImageFields = customDesignColumns.filter(col => 
      col.Field.toLowerCase().includes('image') || 
      col.Field.toLowerCase().includes('photo') ||
      col.Field.toLowerCase().includes('file')
    );
    
    if (designImageFields.length > 0) {
      console.log('Custom design image fields:');
      designImageFields.forEach(col => {
        console.log(`🖼️  ${col.Field}: ${col.Type} (${col.Null === 'YES' ? 'nullable' : 'not null'})`);
      });
    } else {
      console.log('No image fields found in custom_designs table.');
    }
    
  } catch (error) {
    console.error('❌ Error checking product image structure:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkProductImageStructure();
