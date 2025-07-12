// Test the fixed getCancellationRequests query
require('dotenv').config({ path: './server/.env' });
const mysql2 = require('mysql2/promise');

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'sfc_db',
    port: process.env.DB_PORT || 3306
};

const testCancellationQuery = async () => {
    try {
        const connection = await mysql2.createConnection(dbConfig);
        
        console.log('🔍 Testing the fixed getCancellationRequests query...');
        
        // This is the fixed query from the backend
        const [requests] = await connection.execute(`
            SELECT 
                cr.*,
                -- Prioritize order_number from cancellation_requests table, fallback to orders table
                COALESCE(cr.order_number, o.order_number) as order_number,
                -- Handle amount for both regular and custom orders
                CASE 
                    WHEN cr.order_number LIKE 'CUSTOM-%' THEN
                        COALESCE(
                            (SELECT COALESCE(co.final_price, co.estimated_price, 0) 
                             FROM custom_orders co 
                             WHERE co.custom_order_id = cr.order_number),
                            0
                        )
                    ELSE
                        COALESCE(o.total_amount, 0)
                END as total_amount,
                u.first_name,
                u.last_name,
                u.email as customer_email,
                CONCAT(u.first_name, ' ', u.last_name) as user_name,
                oi.customer_name,
                oi.customer_email as invoice_customer_email,
                -- Add order type indicator for frontend
                CASE 
                    WHEN cr.order_number LIKE 'CUSTOM-%' THEN 'custom'
                    ELSE 'regular'
                END as order_type
            FROM cancellation_requests cr
            LEFT JOIN orders o ON cr.order_id = o.id
            LEFT JOIN users u ON o.user_id = u.user_id
            LEFT JOIN order_invoices oi ON o.invoice_id = oi.invoice_id
            ORDER BY cr.created_at DESC
        `);
        
        console.log(`✅ Found ${requests.length} cancellation requests`);
        
        // Test each request's order number
        requests.forEach((request, index) => {
            console.log(`\n📋 Request ${index + 1}:`);
            console.log(`   - ID: ${request.id}`);
            console.log(`   - Original cr.order_number: ${request.order_number}`);
            console.log(`   - Order type: ${request.order_type}`);
            console.log(`   - Customer: ${request.user_name}`);
            console.log(`   - Status: ${request.status}`);
            console.log(`   - Total amount: ${request.total_amount}`);
        });
        
        await connection.end();
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
};

testCancellationQuery();
