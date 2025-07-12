// Check cancellation request table structures
require('dotenv').config({ path: './server/.env' });
const mysql2 = require('mysql2/promise');

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'sfc_db',
    port: process.env.DB_PORT || 3306
};

const checkTables = async () => {
    try {
        const connection = await mysql2.createConnection(dbConfig);
        
        // Check regular cancellation_requests table
        console.log('🔍 Checking cancellation_requests table structure...');
        try {
            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');
            console.log('✅ Regular cancellation_requests table structure:');
            console.table(regularStructure);
            
            // Get sample data
            const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');
            console.log('📋 Sample regular cancellation requests:');
            console.table(regularSample);
            
        } catch (error) {
            console.log('❌ Error with regular cancellation_requests table:', error.message);
        }
        
        // Check custom_order_cancellation_requests table
        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');
        try {
            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');
            console.log('✅ Custom order cancellation_requests table structure:');
            console.table(customStructure);
            
            // Get sample data
            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');
            console.log('📋 Sample custom order cancellation requests:');
            console.table(customSample);
            
        } catch (error) {
            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);
        }
        
        await connection.end();
        
    } catch (error) {
        console.error('❌ Database connection error:', error.message);
    }
};

checkTables();
