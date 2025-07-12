require('dotenv').config();
const mysql = require('mysql2/promise');

async function clearAllTestCancellationRequests() {
    console.log('🧹 Clearing all test cancellation requests...');
    
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        // Delete all cancellation requests for testing
        const [result] = await connection.execute(
            'DELETE FROM custom_order_cancellation_requests WHERE 1=1'
        );
        
        console.log(`✅ Deleted ${result.affectedRows} cancellation request(s)`);
        
        // Verify no requests remain
        const [remainingRequests] = await connection.execute(
            'SELECT COUNT(*) as count FROM custom_order_cancellation_requests'
        );
        
        console.log(`📊 Remaining cancellation requests: ${remainingRequests[0].count}`);
        console.log('✅ All test cancellation requests cleared!');
        
    } catch (error) {
        console.error('❌ Error clearing cancellation requests:', error);
    } finally {
        await connection.end();
    }
}

clearAllTestCancellationRequests();
