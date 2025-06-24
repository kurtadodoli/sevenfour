const mysql = require('mysql2/promise');

async function testMyOrdersQuery() {
    console.log('🔍 Testing my-orders query directly...\n');
    
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 's3v3n-f0ur-cl0thing*',
        database: 'seven_four_clothing'
    });
    
    try {
        const userId = 229491642395434;
        const userEmail = 'kurtadodoli@gmail.com';
        
        console.log(`Testing query with userId: ${userId}, email: ${userEmail}`);
        
        // Test the exact query from the route
        const [orders] = await connection.execute(`
            SELECT 
                co.*,
                COUNT(coi.id) as image_count,
                GROUP_CONCAT(
                    JSON_OBJECT(
                        'id', coi.id,
                        'filename', coi.image_filename,
                        'original_filename', coi.original_filename,
                        'image_size', coi.image_size,
                        'mime_type', coi.mime_type,
                        'upload_order', coi.upload_order
                    )
                ) as images
            FROM custom_orders co
            LEFT JOIN custom_order_images coi ON co.custom_order_id = coi.custom_order_id
            WHERE co.user_id = ? OR co.customer_email = ?
            GROUP BY co.id
            ORDER BY co.created_at DESC
        `, [userId, userEmail]);
        
        console.log(`✅ Query successful! Found ${orders.length} orders`);
        
        orders.forEach((order, index) => {
            console.log(`\n--- Order ${index + 1} ---`);
            console.log(`ID: ${order.id}, Custom Order ID: ${order.custom_order_id}`);
            console.log(`Product: ${order.product_type}, User ID: ${order.user_id}`);
            console.log(`Customer: ${order.customer_name} (${order.customer_email})`);
            console.log(`Image count: ${order.image_count}`);
            console.log(`Images raw: ${order.images ? order.images.substring(0, 100) + '...' : 'null'}`);
            
            // Test JSON parsing
            try {
                if (order.images) {
                    const parsedImages = JSON.parse(`[${order.images}]`).filter(img => img.id);
                    console.log(`✅ JSON parsing successful, filtered images: ${parsedImages.length}`);
                } else {
                    console.log('✅ No images to parse');
                }
            } catch (jsonError) {
                console.log('❌ JSON parsing failed:', jsonError.message);
            }
        });
        
    } catch (error) {
        console.error('❌ Query failed:', error.message);
        console.error('Full error:', error);
    } finally {
        await connection.end();
    }
}

testMyOrdersQuery();
