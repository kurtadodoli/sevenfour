// Check what custom orders exist and what the structure looks like
const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 's3v3n-f0ur-cl0thing*',
    database: 'seven_four_clothing'
};

async function checkCustomOrders() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        
        console.log('📊 Checking custom orders...');
        
        // Check if any custom orders exist
        const [orders] = await connection.execute(`
            SELECT id, custom_order_id, customer_name, customer_email, status, user_id
            FROM custom_orders 
            ORDER BY created_at DESC 
            LIMIT 10
        `);
        
        console.log(`Found ${orders.length} custom orders:`);
        orders.forEach((order, index) => {
            console.log(`${index + 1}. ID: ${order.id}, Order ID: ${order.custom_order_id}, User ID: ${order.user_id}, Status: ${order.status}`);
        });
        
        // Check if cancellation requests table exists and has the right structure
        console.log('\n📋 Checking cancellation requests table structure...');
        const [tableInfo] = await connection.execute(`
            DESCRIBE custom_order_cancellation_requests
        `);
        
        console.log('Table structure:');
        tableInfo.forEach(column => {
            console.log(`- ${column.Field}: ${column.Type} (${column.Null === 'YES' ? 'nullable' : 'not null'})`);
        });
        
        // Check existing cancellation requests
        console.log('\n📋 Checking existing cancellation requests...');
        const [requests] = await connection.execute(`
            SELECT * FROM custom_order_cancellation_requests 
            ORDER BY created_at DESC 
            LIMIT 5
        `);
        
        console.log(`Found ${requests.length} existing requests:`);
        requests.forEach((request, index) => {
            console.log(`${index + 1}. Request ID: ${request.id}, Custom Order ID: ${request.custom_order_id}, Status: ${request.status}`);
        });
        
        await connection.end();
        
    } catch (error) {
        console.error('Database error:', error.message);
        console.error('Error details:', error);
    }
}

checkCustomOrders();
