console.log('Testing simple node execution...');
console.log('Process version:', process.version);
console.log('Current directory:', process.cwd());

// Test database connection
console.log('Testing database connection...');

const mysql = require('mysql2/promise');

async function quickTest() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 's3v3n-f0ur-cl0thing*',
            database: 'seven_four_clothing'
        });
        
        console.log('Database connected successfully');
        
        const [result] = await connection.execute('SELECT COUNT(*) as count FROM products');
        console.log('Products in database:', result[0].count);
        
        await connection.end();
        console.log('Test completed successfully');
        
    } catch (error) {
        console.error('Test failed:', error.message);
    }
}

quickTest();
