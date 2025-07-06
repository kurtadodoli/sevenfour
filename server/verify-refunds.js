const mysql = require('mysql2/promise');

async function verifyRefundRequests() {
    const connection = await mysql.createConnection({
        host: 'localhost', 
        user: 'root', 
        password: 's3v3n-f0ur-cl0thing*', 
        database: 'seven_four_clothing'
    });
    
    const [refunds] = await connection.execute('SELECT * FROM refund_requests ORDER BY created_at DESC LIMIT 5');
    
    console.log('=== LATEST REFUND REQUESTS ===');
    refunds.forEach((refund, index) => {
        console.log(`${index + 1}. ID: ${refund.id}`);
        console.log(`   Order: ${refund.order_number}`);
        console.log(`   Product: ${refund.product_name}`);
        console.log(`   Amount: $${refund.amount}`);
        console.log(`   Status: ${refund.status}`);
        console.log(`   Reason: ${refund.reason}`);
        console.log(`   Created: ${refund.created_at}`);
        console.log('');
    });
    
    await connection.end();
}

verifyRefundRequests().catch(console.error);
