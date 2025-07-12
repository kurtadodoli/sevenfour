const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 's3v3n-f0ur-cl0thing*',
    database: 'seven_four_clothing'
};

async function checkCustomOrderCancellationTable() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        
        console.log('🔍 Checking custom_order_cancellation_requests table...');
        
        // Check if table exists
        const [tables] = await connection.execute(`
            SHOW TABLES LIKE 'custom_order_cancellation_requests'
        `);
        
        if (tables.length > 0) {
            console.log('✅ Table exists!');
            
            // Show table structure
            const [columns] = await connection.execute(`
                DESCRIBE custom_order_cancellation_requests
            `);
            
            console.log('Table columns:');
            columns.forEach(col => {
                console.log(`- ${col.Field}: ${col.Type}`);
            });
            
            // Check existing records
            const [records] = await connection.execute(`
                SELECT COUNT(*) as count FROM custom_order_cancellation_requests
            `);
            
            console.log(`📊 Existing records: ${records[0].count}`);
        } else {
            console.log('❌ Table does not exist!');
            console.log('Creating table...');
            
            // Create the table
            await connection.execute(`
                CREATE TABLE custom_order_cancellation_requests (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    custom_order_id VARCHAR(50) NOT NULL,
                    user_id BIGINT,
                    reason TEXT NOT NULL,
                    status ENUM('pending', 'approved', 'denied') DEFAULT 'pending',
                    admin_notes TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    INDEX idx_custom_order_id (custom_order_id),
                    INDEX idx_user_id (user_id),
                    INDEX idx_status (status)
                )
            `);
            
            console.log('✅ Table created successfully!');
        }
        
        await connection.end();
    } catch (error) {
        console.error('Error:', error.message);
    }
}

checkCustomOrderCancellationTable();
