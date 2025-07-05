// Test script to verify approve payment endpoint fix
const mysql = require('mysql2/promise');

async function testApprovePaymentEndpoint() {
    console.log('=== Testing Approve Payment Endpoint Fix ===');
    
    try {
        const dbConfig = {
            host: 'localhost',
            user: 'root',
            password: 'admin123',
            database: 'sfc_database'
        };
        
        const connection = await mysql.createConnection(dbConfig);
        
        // Test order lookup by order number
        const testOrderNumber = 'ORD17516767720582673';
        console.log(`Testing order lookup for: ${testOrderNumber}`);
        
        const [orders] = await connection.execute(`
            SELECT id, order_number, status, total_amount, user_id
            FROM orders 
            WHERE order_number = ?
            LIMIT 1
        `, [testOrderNumber]);
        
        if (orders.length > 0) {
            console.log('✅ Order found:', {
                id: orders[0].id,
                order_number: orders[0].order_number,
                status: orders[0].status,
                total_amount: orders[0].total_amount
            });
        } else {
            console.log('❌ Order not found with order number:', testOrderNumber);
            
            // Try to find any orders with similar pattern
            const [similarOrders] = await connection.execute(`
                SELECT id, order_number, status, total_amount, user_id
                FROM orders 
                WHERE order_number LIKE 'ORD%'
                ORDER BY created_at DESC
                LIMIT 5
            `);
            
            console.log('Similar orders found:', similarOrders.map(o => ({
                id: o.id,
                order_number: o.order_number,
                status: o.status
            })));
        }
        
        await connection.end();
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testApprovePaymentEndpoint();
