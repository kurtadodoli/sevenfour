// Check what cancellation requests exist for this user's custom orders
const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 's3v3n-f0ur-cl0thing*',
    database: 'seven_four_clothing'
};

async function checkExistingCancellationRequests() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        
        console.log('📋 Checking existing cancellation requests...');
        
        // Check all cancellation requests
        const [requests] = await connection.execute(`
            SELECT 
                ccr.id,
                ccr.custom_order_id,
                ccr.user_id,
                ccr.reason,
                ccr.status,
                ccr.created_at,
                co.customer_name,
                co.customer_email,
                co.status as order_status
            FROM custom_order_cancellation_requests ccr
            LEFT JOIN custom_orders co ON ccr.custom_order_id = co.custom_order_id
            ORDER BY ccr.created_at DESC
        `);
        
        console.log(`Found ${requests.length} cancellation requests:`);
        
        requests.forEach((request, index) => {
            console.log(`${index + 1}. Request ID: ${request.id}`);
            console.log(`   Custom Order ID: ${request.custom_order_id}`);
            console.log(`   Customer: ${request.customer_name} (${request.customer_email})`);
            console.log(`   Status: ${request.status}`);
            console.log(`   Reason: ${request.reason}`);
            console.log(`   Created: ${request.created_at}`);
            console.log(`   Order Status: ${request.order_status}`);
            console.log('   ---');
        });
        
        // Check which ones are pending
        const pendingRequests = requests.filter(req => req.status === 'pending');
        console.log(`\n🔍 Pending cancellation requests: ${pendingRequests.length}`);
        
        if (pendingRequests.length > 0) {
            console.log('\n⚠️  These orders cannot be cancelled again until the existing request is processed:');
            pendingRequests.forEach(req => {
                console.log(`   - ${req.custom_order_id} (Request ID: ${req.id})`);
            });
        }
        
        await connection.end();
        
    } catch (error) {
        console.error('Database error:', error.message);
    }
}

checkExistingCancellationRequests();
