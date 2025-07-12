// Test to verify the order number fix works end-to-end
require('dotenv').config({ path: './server/.env' });
const mysql2 = require('mysql2/promise');

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'sfc_db',
    port: process.env.DB_PORT || 3306
};

const testEndToEndFix = async () => {
    try {
        console.log('🔍 Testing end-to-end order number fix...');
        console.log('This simulates the exact flow from DB → Backend → Frontend\n');
        
        const connection = await mysql2.createConnection(dbConfig);
        
        // This is the exact query from the fixed backend
        console.log('1. Testing fixed backend query...');
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
            WHERE cr.status = 'pending'
            ORDER BY cr.created_at DESC
        `);
        
        console.log(`✅ Backend query returned ${requests.length} pending requests`);
        
        if (requests.length === 0) {
            console.log('ℹ️  No pending cancellation requests found');
            await connection.end();
            return;
        }
        
        // Simulate frontend processing
        console.log('\n2. Simulating frontend processing...');
        const processedRequests = requests.map(request => ({
            ...request,
            order_type: request.order_type || 'regular',
            request_type: 'regular_order_cancellation',
            
            // This is the exact mapping from TransactionPage.js
            order_number: request.order_number || request.order_id || request.transaction_id || request.id,
            
            customer_name: request.customer_name || request.user_name || request.full_name,
            customer_email: request.customer_email || request.user_email || request.email,
            customer_phone: request.customer_phone || request.phone || request.contact_phone,
            
            product_type: request.product_type || request.product_name || 'Regular Order',
            total_amount: request.total_amount || request.amount || request.order_total || 0
        }));
        
        console.log('📋 After frontend mapping:');
        processedRequests.forEach((request, index) => {
            console.log(`   ${index + 1}. ID: ${request.id}, Order Number: "${request.order_number}", Type: ${request.order_type}`);
        });
        
        // Simulate safeDisplayValue function
        console.log('\n3. Simulating UI display with safeDisplayValue...');
        const safeDisplayValue = (value, fallback = '') => {
            if (value === null || value === undefined || value === '' || value === 'null' || value === 'undefined') {
                return fallback;
            }
            return value;
        };
        
        processedRequests.forEach((request, index) => {
            const displayValue = safeDisplayValue(request.order_number || request.custom_order_id, 'No Order Number');
            console.log(`   ${index + 1}. ID: ${request.id}, Final Display: "${displayValue}"`);
        });
        
        // Check for any issues
        const issuesFound = processedRequests.filter(req => {
            const displayValue = safeDisplayValue(req.order_number || req.custom_order_id, 'No Order Number');
            return displayValue === 'No Order Number' || displayValue === '';
        });
        
        if (issuesFound.length > 0) {
            console.log('\n❌ Issues found:');
            issuesFound.forEach(req => {
                console.log(`   - Request ID: ${req.id}, Issue: Order number is blank`);
            });
        } else {
            console.log('\n✅ All order numbers are properly displayed!');
            console.log('🎉 The fix is working correctly!');
        }
        
        await connection.end();
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
};

testEndToEndFix();
