const mysql = require('mysql2/promise');

async function fixImagePaths() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 's3v3n-f0ur-cl0thing*',
    database: 'seven_four_clothing'
  });
  
  console.log('🔄 Fixing image paths in custom_order_images table...');
  
  // Check current paths
  const [currentImages] = await connection.execute('SELECT * FROM custom_order_images');
  console.log(`Found ${currentImages.length} images to fix`);
  
  for (const image of currentImages) {
    console.log(`Current path: ${image.image_path}`);
    
    // Update path from server/uploads to uploads
    const newPath = image.image_path.replace('C:\\sevenfour\\server\\uploads\\custom-orders\\', 'C:\\sevenfour\\uploads\\custom-orders\\');
    const newUrl = `/uploads/custom-orders/${image.image_filename}`;
    
    console.log(`New path: ${newPath}`);
    console.log(`New URL: ${newUrl}`);
    
    await connection.execute(
      'UPDATE custom_order_images SET image_path = ?, image_url = ? WHERE id = ?',
      [newPath, newUrl, image.id]
    );
  }
  
  console.log('✅ Updated all image paths');
  
  // Verify the changes
  const [updatedImages] = await connection.execute('SELECT id, image_filename, image_path, image_url FROM custom_order_images LIMIT 5');
  console.log('\nUpdated images:');
  updatedImages.forEach(img => {
    console.log(`ID: ${img.id}, File: ${img.image_filename}`);
    console.log(`  Path: ${img.image_path}`);
    console.log(`  URL: ${img.image_url}`);
  });
  
  await connection.end();
}

fixImagePaths().catch(console.error);
