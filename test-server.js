const mysql = require('mysql2/promise');

async function testServerAndDatabase() {
    console.log('🔍 Testing server and database connection...');
    
    // Test 1: Check if server is running
    try {
        const response = await fetch('http://localhost:3001/api/test');
        if (response.ok) {
            console.log('✅ Server is running on port 3001');
        }
    } catch (error) {
        console.log('❌ Server is NOT running on port 3001');
        console.log('Start server with: node simple-server.js');
        return;
    }
    
    // Test 2: Direct database connection
    try {
        const dbConfig = {
            host: 'localhost',
            user: 'root',
            password: 's3v3n-f0ur-cl0thing*',
            database: 'seven_four_clothing'
        };
        
        const connection = await mysql.createConnection(dbConfig);
        const [products] = await connection.execute('SELECT * FROM products');
        await connection.end();
        
        console.log(`✅ Database has ${products.length} products:`);
        products.forEach(p => console.log(`  - ${p.productname} (ID: ${p.id})`));
        
    } catch (error) {
        console.log('❌ Database connection failed:', error.message);
    }
    
    // Test 3: API endpoint
    try {
        const response = await fetch('http://localhost:3001/api/maintenance/products');
        const data = await response.json();
        console.log(`✅ API returns ${data.length} products`);
    } catch (error) {
        console.log('❌ API endpoint failed:', error.message);
    }
}

testServerAndDatabase();
