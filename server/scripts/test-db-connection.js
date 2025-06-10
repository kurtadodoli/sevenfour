require('dotenv').config();
const mysql = require('mysql2/promise');

async function testConnection() {
    const config = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'seven_four_clothing'
    };

    console.log('Testing database connection with config:', {
        host: config.host,
        user: config.user,
        database: config.database
        // Don't log password
    });

    try {
        const connection = await mysql.createConnection(config);
        console.log('✅ Successfully connected to database');
        
        // Test query
        const [rows] = await connection.execute('SHOW TABLES');
        console.log('\nDatabase tables:');
        console.table(rows);
        
        await connection.end();
    } catch (error) {
        console.error('❌ Database connection error:', {
            code: error.code,
            errno: error.errno,
            sqlMessage: error.sqlMessage,
            sqlState: error.sqlState
        });
    }
}

testConnection();
