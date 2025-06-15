const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 's3v3n-f0ur-cl0thing*',
  database: 'seven_four_clothing',
  port: 3306
};

async function quickTest() {
  const connection = await mysql.createConnection(dbConfig);
  
  console.log('Connected to database');
  
  const [categories] = await connection.query('SELECT * FROM product_categories');
  console.log('Categories:', categories.length);
  
  const [products] = await connection.query('SELECT COUNT(*) as count FROM products');
  console.log('Products:', products[0].count);
  
  const [tables] = await connection.query('SHOW TABLES');
  console.log('Tables:', tables.map(t => Object.values(t)[0]));
  
  await connection.end();
  console.log('Test completed successfully!');
}

quickTest().catch(console.error);
