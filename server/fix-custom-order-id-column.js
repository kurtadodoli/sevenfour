const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 's3v3n-f0ur-cl0thing*',
    database: 'seven_four_clothing'
};

async function fixCustomOrderIdColumn() {
    console.log('Fixing custom_order_id column type...\n');
    
    const connection = await mysql.createConnection(dbConfig);
    
    try {
        // First, let's see what data is currently in the table
        console.log('🔍 Checking existing data...');
        const [existing] = await connection.execute('SELECT id, order_id, custom_order_id FROM refund_requests LIMIT 10');
        console.log('Current records:');
        existing.forEach(record => {
            console.log(`  ID: ${record.id}, order_id: ${record.order_id}, custom_order_id: ${record.custom_order_id}`);
        });
        
        console.log('\n🔧 Modifying custom_order_id column to VARCHAR...');
        
        // Change the column type from INT to VARCHAR
        await connection.execute(`
            ALTER TABLE refund_requests 
            MODIFY COLUMN custom_order_id VARCHAR(255) NULL
        `);
        
        console.log('✅ Column type changed successfully');
        
        // Verify the change
        console.log('\n🔍 Verifying the change...');
        const [columns] = await connection.execute('DESCRIBE refund_requests');
        const customOrderIdCol = columns.find(col => col.Field === 'custom_order_id');
        
        if (customOrderIdCol) {
            console.log(`✅ custom_order_id is now: ${customOrderIdCol.Type} (${customOrderIdCol.Null})`);
        }
        
    } catch (error) {
        console.error('❌ Error fixing column:', error.message);
        throw error;
    } finally {
        await connection.end();
    }
}

fixCustomOrderIdColumn().catch(console.error);
