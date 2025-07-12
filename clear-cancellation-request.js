// Clear existing cancellation request for testing
const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 's3v3n-f0ur-cl0thing*',
    database: 'seven_four_clothing'
};

async function clearCancellationRequest() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        
        console.log('Clearing existing cancellation request...');
        
        const result = await connection.execute(`
            DELETE FROM custom_order_cancellation_requests 
            WHERE custom_order_id = 'CUSTOM-MCSS0ZFM-7LW55'
        `);
        
        console.log('✅ Deleted:', result[0].affectedRows, 'cancellation requests');
        
        await connection.end();
        
    } catch (error) {
        console.error('Database error:', error.message);
    }
}

clearCancellationRequest();
