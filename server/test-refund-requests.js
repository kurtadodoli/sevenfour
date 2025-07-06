const mysql = require('mysql2/promise');
const { dbConfig } = require('./config/db');

async function testRefundRequests() {
    try {
        console.log('Testing refund requests query...');
        
        const connection = await mysql.createConnection(dbConfig);
        
        // Test the updated query with fallback values
        const [refundRequests] = await connection.execute(`
            SELECT DISTINCT
                rr.*,
                o.order_number,
                o.status as order_status,
                CONCAT(u.first_name, ' ', u.last_name) as customer_name,
                u.email as customer_email,
                u.phone as phone_number,
                u.address as street_address,
                u.city as city_municipality,
                u.province,
                CONCAT(admin_user.first_name, ' ', admin_user.last_name) as processed_by_name,
                COALESCE(oi.product_name, 'Unknown Product') as product_name,
                COALESCE(oi.product_price, rr.amount) as price,
                COALESCE(oi.quantity, 1) as quantity,
                COALESCE(oi.size, 'N/A') as size,
                COALESCE(oi.color, 'N/A') as color,
                (SELECT pi.image_filename 
                 FROM order_items oi2 
                 JOIN products p ON oi2.product_id = p.product_id 
                 JOIN product_images pi ON p.product_id = pi.product_id 
                 WHERE oi2.order_id = rr.order_id 
                 LIMIT 1) as product_image,
                NULL as custom_order_id
            FROM refund_requests rr
            LEFT JOIN orders o ON rr.order_id = o.id
            LEFT JOIN users u ON rr.user_id = u.user_id
            LEFT JOIN users admin_user ON rr.processed_by = admin_user.user_id
            LEFT JOIN order_items oi ON o.id = oi.order_id
            ORDER BY rr.created_at DESC
        `);
        
        await connection.end();
        
        console.log(`Found ${refundRequests.length} refund requests`);
        console.log('Sample refund request:', refundRequests[0]);
        
        return refundRequests;
    } catch (error) {
        console.error('Error testing refund requests:', error);
        throw error;
    }
}

testRefundRequests()
    .then(() => console.log('Test completed successfully'))
    .catch(error => console.error('Test failed:', error));
