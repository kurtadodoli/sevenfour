const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 's3v3n-f0ur-cl0thing*',
    database: 'seven_four_clothing'
};

async function checkRefundRequestsSchema() {
    console.log('Checking refund_requests table schema...\n');
    
    const connection = await mysql.createConnection(dbConfig);
    
    try {
        // Get table structure
        const [columns] = await connection.execute('DESCRIBE refund_requests');
        
        console.log('📋 refund_requests table structure:');
        columns.forEach(col => {
            console.log(`  - ${col.Field}: ${col.Type} | Null: ${col.Null} | Key: ${col.Key} | Default: ${col.Default} | Extra: ${col.Extra}`);
        });
        
        console.log('\n🔍 Key observations:');
        const orderIdCol = columns.find(col => col.Field === 'order_id');
        const customOrderIdCol = columns.find(col => col.Field === 'custom_order_id');
        
        if (orderIdCol) {
            console.log(`   - order_id: ${orderIdCol.Type} (${orderIdCol.Null})`);
        }
        
        if (customOrderIdCol) {
            console.log(`   - custom_order_id: ${customOrderIdCol.Type} (${customOrderIdCol.Null})`);
        } else {
            console.log('   - custom_order_id: COLUMN NOT FOUND');
        }
        
    } finally {
        await connection.end();
    }
}

checkRefundRequestsSchema().catch(console.error);
