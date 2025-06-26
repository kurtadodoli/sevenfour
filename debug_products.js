const mysql = require('mysql2/promise');
const { dbConfig } = require('./server/config/db');

async function listProducts() {
    const conn = await mysql.createConnection(dbConfig);
    
    // Get all products
    const [products] = await conn.execute(`
        SELECT product_id, productname, total_stock, total_available_stock, total_reserved_stock 
        FROM products 
        ORDER BY product_id
    `);
    
    console.log('All products in database:');
    products.forEach(p => {
        console.log(`ID: ${p.product_id}, Name: ${p.productname}, Available: ${p.total_available_stock}`);
    });
    
    // Check if there's a product with a similar name that could match
    const [similarProducts] = await conn.execute(`
        SELECT product_id, productname 
        FROM products 
        WHERE productname LIKE '%kobe%' OR productname LIKE '%NBA%'
    `);
    
    console.log('\nProducts with similar names:');
    console.log(similarProducts);
    
    await conn.end();
}

listProducts().catch(console.error);
