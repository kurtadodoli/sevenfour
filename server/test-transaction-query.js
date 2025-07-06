const mysql = require('mysql2/promise');
const { dbConfig } = require('./config/db');

async function testTransactionQuery() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        
        console.log('Testing transaction query directly...\n');
        
        // Test 1: Simple query without parameters
        console.log('1. Testing simple query without LIMIT...');
        try {
            const [simpleResult] = await connection.execute(`
                SELECT COUNT(*) as count
                FROM sales_transactions st
                LEFT JOIN orders o ON st.transaction_id = o.transaction_id
                LEFT JOIN order_invoices oi ON st.invoice_id = oi.invoice_id
                LEFT JOIN users u ON st.user_id = u.user_id
            `);
            console.log('✅ Simple query works, count:', simpleResult[0].count);
        } catch (error) {
            console.log('❌ Simple query failed:', error.message);
        }
        
        // Test 2: Query with LIMIT but using string concatenation
        console.log('\n2. Testing query with LIMIT using string...');
        try {
            const [limitResult] = await connection.execute(`
                SELECT 
                    st.transaction_id,
                    st.amount,
                    st.transaction_status
                FROM sales_transactions st
                LEFT JOIN orders o ON st.transaction_id = o.transaction_id
                LEFT JOIN order_invoices oi ON st.invoice_id = oi.invoice_id
                LEFT JOIN users u ON st.user_id = u.user_id
                ORDER BY st.created_at DESC
                LIMIT 5 OFFSET 0
            `);
            console.log('✅ LIMIT query works, count:', limitResult.length);
            if (limitResult.length > 0) {
                console.log('Sample record:', limitResult[0]);
            }
        } catch (error) {
            console.log('❌ LIMIT query failed:', error.message);
        }
        
        // Test 3: Query with LIMIT using parameters (the problematic one)
        console.log('\n3. Testing query with LIMIT using parameters...');
        try {
            const [paramResult] = await connection.execute(`
                SELECT 
                    st.transaction_id,
                    st.amount,
                    st.transaction_status
                FROM sales_transactions st
                LEFT JOIN orders o ON st.transaction_id = o.transaction_id
                LEFT JOIN order_invoices oi ON st.invoice_id = oi.invoice_id
                LEFT JOIN users u ON st.user_id = u.user_id
                ORDER BY st.created_at DESC
                LIMIT ? OFFSET ?
            `, [5, 0]);
            console.log('✅ Parameter query works, count:', paramResult.length);
        } catch (error) {
            console.log('❌ Parameter query failed:', error.message);
            console.log('Error code:', error.code);
            console.log('Error errno:', error.errno);
        }
        
        // Test 4: Check if the issue is with the specific field selection
        console.log('\n4. Testing full field selection with parameters...');
        try {
            const [fullResult] = await connection.execute(`
                SELECT 
                    st.transaction_id,
                    st.invoice_id,
                    st.user_id,
                    st.transaction_date,
                    st.amount,
                    st.transaction_status,
                    st.payment_method,
                    st.created_at as transaction_created_at,
                    st.updated_at as transaction_updated_at,
                    o.order_number,
                    o.status as order_status,
                    o.shipping_address,
                    o.contact_phone,
                    o.order_date,
                    oi.customer_name,
                    oi.customer_email,
                    oi.total_amount as invoice_total,
                    oi.invoice_status,
                    CONCAT(u.first_name, ' ', u.last_name) as username,
                    u.email as user_email,
                    u.first_name,
                    u.last_name
                FROM sales_transactions st
                LEFT JOIN orders o ON st.transaction_id = o.transaction_id
                LEFT JOIN order_invoices oi ON st.invoice_id = oi.invoice_id
                LEFT JOIN users u ON st.user_id = u.user_id
                ORDER BY st.created_at DESC
                LIMIT ? OFFSET ?
            `, [5, 0]);
            console.log('✅ Full field query works, count:', fullResult.length);
        } catch (error) {
            console.log('❌ Full field query failed:', error.message);
            console.log('Full error:', error);
        }
        
    } catch (error) {
        console.error('Error testing transaction query:', error);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

testTransactionQuery().then(() => {
    console.log('\nTransaction query test completed');
    process.exit(0);
}).catch(error => {
    console.error('Script error:', error);
    process.exit(1);
});
