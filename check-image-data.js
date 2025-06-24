const mysql = require('mysql2/promise');

async function checkData() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root', 
    password: 's3v3n-f0ur-cl0thing*',
    database: 'seven_four_clothing'
  });
  
  console.log('=== CUSTOM DESIGN REQUESTS ===');
  const [designRequests] = await connection.execute('SELECT design_id, design_name, status, images FROM custom_design_requests ORDER BY created_at DESC LIMIT 5');
  designRequests.forEach(req => {
    console.log(`ID: ${req.design_id}, Name: ${req.design_name}, Status: ${req.status}`);
    console.log(`Images: ${req.images}`);
    console.log('---');
  });
  
  console.log('\n=== CUSTOM DESIGN IMAGES ===');
  const [designImages] = await connection.execute('SELECT design_id, image_filename, image_path, image_url FROM custom_design_images ORDER BY created_at DESC LIMIT 5');
  designImages.forEach(img => {
    console.log(`Design ID: ${img.design_id}, Filename: ${img.image_filename}`);
    console.log(`Path: ${img.image_path}, URL: ${img.image_url}`);
    console.log('---');
  });

  console.log('\n=== CUSTOM ORDER IMAGES ===');
  const [orderImages] = await connection.execute('SELECT custom_order_id, image_filename, image_path, image_url FROM custom_order_images ORDER BY created_at DESC LIMIT 5');
  orderImages.forEach(img => {
    console.log(`Order ID: ${img.custom_order_id}, Filename: ${img.image_filename}`);
    console.log(`Path: ${img.image_path}, URL: ${img.image_url}`);
    console.log('---');
  });
  
  await connection.end();
}

checkData().catch(console.error);
