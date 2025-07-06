const mysql = require('mysql2/promise');
const { dbConfig } = require('./config/db');

async function addMissingColumns() {
    console.log('Adding missing columns to refund_requests table...');
    const connection = await mysql.createConnection(dbConfig);
    
    try {
        // Add the missing columns
        const alterQueries = [
            'ALTER TABLE refund_requests ADD COLUMN custom_order_id INT NULL AFTER order_id',
            'ALTER TABLE refund_requests ADD COLUMN product_name VARCHAR(255) NULL AFTER customer_phone',
            'ALTER TABLE refund_requests ADD COLUMN product_image VARCHAR(255) NULL AFTER product_name',
            'ALTER TABLE refund_requests ADD COLUMN price DECIMAL(10,2) NULL AFTER product_image',
            'ALTER TABLE refund_requests ADD COLUMN quantity INT NULL AFTER price',
            'ALTER TABLE refund_requests ADD COLUMN size VARCHAR(50) NULL AFTER quantity',
            'ALTER TABLE refund_requests ADD COLUMN color VARCHAR(50) NULL AFTER size',
            'ALTER TABLE refund_requests ADD COLUMN phone_number VARCHAR(20) NULL AFTER color',
            'ALTER TABLE refund_requests ADD COLUMN street_address VARCHAR(255) NULL AFTER phone_number',
            'ALTER TABLE refund_requests ADD COLUMN city_municipality VARCHAR(100) NULL AFTER street_address',
            'ALTER TABLE refund_requests ADD COLUMN province VARCHAR(100) NULL AFTER city_municipality'
        ];
        
        for (const query of alterQueries) {
            try {
                await connection.execute(query);
                console.log('✅ Executed:', query.substring(0, 80) + '...');
            } catch (err) {
                if (err.code === 'ER_DUP_FIELDNAME') {
                    console.log('⚠️  Column already exists:', query.substring(0, 80) + '...');
                } else {
                    console.error('❌ Error:', err.message);
                }
            }
        }
        
        console.log('\n✅ Database update completed');
        
        // Show updated table structure
        const [columns] = await connection.execute('DESCRIBE refund_requests');
        console.log('\nUpdated table structure:');
        columns.forEach(col => {
            console.log('- ' + col.Field + ': ' + col.Type);
        });
        
    } finally {
        await connection.end();
    }
}

addMissingColumns().then(() => {
    console.log('\n✅ Script completed');
    process.exit(0);
}).catch(error => {
    console.error('❌ Script error:', error);
    process.exit(1);
});
