const mysql = require('mysql2/promise');
const { dbConfig } = require('./config/db');

async function testRefundRequestsAPI() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        
        console.log('Testing refund requests API...\n');
        
        // Test the updated query used in the controller
        const [refundRequests] = await connection.execute(`
            SELECT 
                rr.*,
                o.status as order_status,
                COALESCE(oi.product_name, CONCAT('Product from Order #', CAST(rr.order_id AS CHAR))) as product_name,
                COALESCE(oi.product_price, rr.amount) as price,
                COALESCE(oi.quantity, 1) as quantity,
                COALESCE(oi.size, 'N/A') as size,
                COALESCE(oi.color, 'N/A') as color,
                COALESCE(pi.image_filename, 'default-product.png') as product_image,
                COALESCE(oi.customer_phone, rr.customer_phone, 'N/A') as phone_number,
                COALESCE(oi.street_address, 'N/A') as street_address,
                COALESCE(oi.city_municipality, 'N/A') as city_municipality,
                COALESCE(oi.province, 'N/A') as province
            FROM refund_requests rr
            LEFT JOIN orders o ON rr.order_id = o.id
            LEFT JOIN order_items oi ON o.id = oi.order_id
            LEFT JOIN products p ON oi.product_id = p.product_id 
            LEFT JOIN product_images pi ON p.product_id = pi.product_id AND pi.is_thumbnail = 1
            ORDER BY rr.created_at DESC
            LIMIT 3
        `);
        
        console.log(`Found ${refundRequests.length} refund requests:`);
        
        refundRequests.forEach((request, index) => {
            console.log(`${index + 1}. ID: ${request.id}`);
            console.log(`   Customer: ${request.customer_name}`);
            console.log(`   Reason: ${request.reason?.substring(0, 50)}...`);
            console.log(`   Product: ${request.product_name}`);
            console.log(`   Image: ${request.product_image}`);
            console.log('');
        });
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

testRefundRequestsAPI().then(() => {
    console.log('✅ Test completed');
    process.exit(0);
}).catch(error => {
    console.error('❌ Script error:', error);
    process.exit(1);
});
