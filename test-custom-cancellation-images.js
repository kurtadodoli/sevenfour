const mysql = require('mysql2/promise');
const { dbConfig } = require('./server/config/db');

async function testCustomCancellationImages() {
    try {
        console.log('🔍 Testing custom order cancellation request images...');
        
        const connection = await mysql.createConnection(dbConfig);
        
        // Test the corrected query
        const [requests] = await connection.execute(`
            SELECT 
                cr.id,
                cr.order_id,
                o.order_number,
                -- Enhanced image logic
                COALESCE(
                    -- Try to get image from regular order items first
                    (SELECT CASE 
                        WHEN pi.image_filename IS NOT NULL THEN 
                            CASE 
                                WHEN pi.image_filename LIKE '%.%' THEN pi.image_filename
                                ELSE CONCAT(pi.image_filename, '.jpg')
                            END
                        WHEN p.productimage IS NOT NULL THEN p.productimage
                        ELSE NULL
                     END
                     FROM order_items oit2 
                     LEFT JOIN products p ON oit2.product_id = p.product_id
                     LEFT JOIN product_images pi ON p.product_id = pi.product_id AND pi.is_thumbnail = 1
                     WHERE oit2.order_id = o.id 
                     LIMIT 1),
                    -- If no regular order image, try to get custom order image
                    (SELECT 
                        CASE 
                            WHEN coi.image_filename IS NOT NULL THEN 
                                CONCAT('custom-orders/', coi.image_filename)
                            ELSE NULL
                        END
                     FROM custom_order_images coi
                     WHERE coi.custom_order_id = o.order_number
                     ORDER BY coi.upload_order ASC, coi.created_at ASC
                     LIMIT 1),
                    -- Default fallback
                    'default-product.png'
                ) as product_image,
                -- Also get custom order image info for debugging
                (SELECT coi.image_filename 
                 FROM custom_order_images coi 
                 WHERE coi.custom_order_id = o.order_number 
                 ORDER BY coi.upload_order ASC, coi.created_at ASC 
                 LIMIT 1) as custom_image_filename
            FROM cancellation_requests cr
            LEFT JOIN orders o ON cr.order_id = o.id
            ORDER BY cr.created_at DESC
            LIMIT 10
        `);
        
        console.log(`📊 Found ${requests.length} cancellation requests to test:`);
        
        requests.forEach((request, index) => {
            console.log(`\n🔍 Request ${index + 1}:`);
            console.log(`   ID: ${request.id}`);
            console.log(`   Order Number: ${request.order_number}`);
            console.log(`   Is Custom: ${request.order_number?.startsWith('CUSTOM') ? 'YES' : 'NO'}`);
            console.log(`   Product Image: ${request.product_image}`);
            console.log(`   Custom Image Filename: ${request.custom_image_filename}`);
        });
        
        // Also check custom order images directly
        console.log('\n🖼️ Checking custom order images directly:');
        const [customImages] = await connection.execute(`
            SELECT coi.custom_order_id, coi.image_filename, coi.original_filename
            FROM custom_order_images coi
            ORDER BY coi.created_at DESC
            LIMIT 5
        `);
        
        customImages.forEach((image, index) => {
            console.log(`\n🎨 Custom Image ${index + 1}:`);
            console.log(`   Order ID: ${image.custom_order_id}`);
            console.log(`   Filename: ${image.image_filename}`);
            console.log(`   Original: ${image.original_filename}`);
        });
        
        await connection.end();
        console.log('\n✅ Test completed!');
        
    } catch (error) {
        console.error('❌ Error testing custom cancellation images:', error);
    }
}

testCustomCancellationImages();
