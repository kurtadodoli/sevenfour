const mysql = require('mysql2/promise');

async function fixRefundTable() {
    console.log('=== FIXING REFUND TABLE SCHEMA ===');
    
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root', 
        password: 's3v3n-f0ur-cl0thing*',
        database: 'seven_four_clothing'
    });
    
    try {
        // Make order_id nullable since we support both regular and custom orders
        console.log('Making order_id nullable...');
        await connection.execute('ALTER TABLE refund_requests MODIFY order_id int NULL');
        console.log('✅ order_id is now nullable');
        
        // Verify the change
        console.log('Verifying table structure...');
        const [result] = await connection.execute('DESCRIBE refund_requests');
        const orderIdField = result.find(col => col.Field === 'order_id');
        console.log('order_id field:', orderIdField);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await connection.end();
    }
}

fixRefundTable().catch(console.error);
