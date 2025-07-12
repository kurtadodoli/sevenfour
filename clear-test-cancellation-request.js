// Clear the test cancellation request so user can test the feature
const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 's3v3n-f0ur-cl0thing*',
    database: 'seven_four_clothing'
};

async function clearTestCancellationRequest() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        
        console.log('🧹 Clearing test cancellation request...');
        
        // Delete the test cancellation request
        const [result] = await connection.execute(`
            DELETE FROM custom_order_cancellation_requests 
            WHERE custom_order_id = 'CUSTOM-MCSS0ZFM-7LW55' 
            AND reason LIKE '%Test cancellation%'
        `);
        
        console.log(`✅ Deleted ${result.affectedRows} test cancellation request(s)`);
        
        // Verify it's gone
        const [remaining] = await connection.execute(`
            SELECT COUNT(*) as count 
            FROM custom_order_cancellation_requests 
            WHERE custom_order_id = 'CUSTOM-MCSS0ZFM-7LW55'
        `);
        
        console.log(`📊 Remaining cancellation requests for this order: ${remaining[0].count}`);
        
        await connection.end();
        
        console.log('\n✅ The user can now try to cancel the custom order again!');
        
    } catch (error) {
        console.error('Database error:', error.message);
    }
}

clearTestCancellationRequest();
