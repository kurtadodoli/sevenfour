// Clear the pending cancellation request for testing
const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 's3v3n-f0ur-cl0thing*',
    database: 'seven_four_clothing'
};

async function clearPendingCancellation() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        
        console.log('🧹 Clearing pending cancellation request...');
        
        // Delete the pending cancellation request
        const [result] = await connection.execute(`
            DELETE FROM custom_order_cancellation_requests 
            WHERE custom_order_id = 'CUSTOM-MCSS0ZFM-7LW55' 
            AND status = 'pending'
        `);
        
        console.log(`✅ Deleted ${result.affectedRows} pending cancellation request(s)`);
        
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

clearPendingCancellation();
