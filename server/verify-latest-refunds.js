const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 's3v3n-f0ur-cl0thing*',
    database: 'seven_four_clothing'
};

async function verifyLatestRefundRequests() {
    console.log('Verifying latest refund requests...\n');
    
    const connection = await mysql.createConnection(dbConfig);
    
    try {
        // Get the latest refund requests
        const [requests] = await connection.execute(`
            SELECT 
                id, order_id, custom_order_id, order_number, 
                product_name, price, quantity, reason, 
                created_at
            FROM refund_requests 
            ORDER BY created_at DESC 
            LIMIT 5
        `);
        
        console.log('📋 Latest refund requests:');
        requests.forEach((req, index) => {
            console.log(`\n${index + 1}. Request ID: ${req.id}`);
            console.log(`   Order ID: ${req.order_id}`);
            console.log(`   Custom Order ID: ${req.custom_order_id}`);
            console.log(`   Order Number: ${req.order_number}`);
            console.log(`   Product: ${req.product_name}`);
            console.log(`   Price: ${req.price}`);
            console.log(`   Quantity: ${req.quantity}`);
            console.log(`   Reason: ${req.reason}`);
            console.log(`   Created: ${req.created_at}`);
        });
        
        console.log('\n🔍 Analysis:');
        const regularOrders = requests.filter(r => r.order_id !== null);
        const customOrders = requests.filter(r => r.custom_order_id !== null);
        
        console.log(`   - Regular orders: ${regularOrders.length}`);
        console.log(`   - Custom orders: ${customOrders.length}`);
        
        if (customOrders.length > 0) {
            console.log('   - Custom order IDs stored:');
            customOrders.forEach(order => {
                console.log(`     * ${order.custom_order_id}`);
            });
        }
        
    } finally {
        await connection.end();
    }
}

verifyLatestRefundRequests().catch(console.error);
