const mysql = require('mysql2/promise');
const { dbConfig } = require('./server/config/db');

async function createCancellationRequest() {
    const conn = await mysql.createConnection(dbConfig);
    
    try {
        console.log('=== CREATING CANCELLATION REQUEST FOR ORDER 32 ===');
        
        // Get order number first
        const [order] = await conn.execute(`
            SELECT order_number FROM orders WHERE id = 32
        `);
        
        if (order.length === 0) {
            console.log('❌ Order 32 not found');
            return;
        }
        
        const orderNumber = order[0].order_number;
        console.log(`Order number: ${orderNumber}`);
        
        // Create cancellation request
        await conn.execute(`
            INSERT INTO cancellation_requests (
                order_id, user_id, order_number, reason, status, created_at
            ) VALUES (32, 967502321335176, ?, 'Testing cancellation stock restoration', 'pending', NOW())
        `, [orderNumber]);
        
        // Get the created request ID
        const [request] = await conn.execute(`
            SELECT id FROM cancellation_requests 
            WHERE order_id = 32 AND status = 'pending'
            ORDER BY created_at DESC LIMIT 1
        `);
        
        if (request.length > 0) {
            console.log(`✅ Cancellation request created with ID: ${request[0].id}`);
            return request[0].id;
        }
        
    } catch (error) {
        console.error('❌ Error creating cancellation request:', error);
    }
    
    await conn.end();
}

createCancellationRequest().catch(console.error);
