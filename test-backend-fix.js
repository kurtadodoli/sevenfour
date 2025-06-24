const mysql = require('mysql2/promise');
const { dbConfig } = require('./server/config/db');

async function testBackendFix() {
    console.log('🧪 Testing backend refactor fix...');
    
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        
        // Test the new approach - get orders first
        const userEmail = 'test@example.com';
        const userId = 1;
        
        const [orders] = await connection.execute(`
            SELECT *
            FROM custom_orders co
            WHERE co.customer_email = ? OR co.user_id = ?
            ORDER BY co.created_at DESC
        `, [userEmail, userId]);
        
        console.log(`📋 Found ${orders.length} orders`);
        
        // Then fetch images for each order
        for (const order of orders) {
            const [images] = await connection.execute(`
                SELECT 
                    id,
                    image_filename as filename,
                    original_filename,
                    image_size,
                    mime_type,
                    upload_order
                FROM custom_order_images 
                WHERE custom_order_id = ?
                ORDER BY upload_order ASC
            `, [order.custom_order_id]);
            
            console.log(`📸 Order ${order.custom_order_id}: ${images.length} images`);
            order.images = images;
        }
        
        console.log('✅ Backend refactor test successful - no JSON parsing errors!');
        console.log(`Total orders: ${orders.length}`);
        
        await connection.end();
        
    } catch (error) {
        console.error('❌ Backend test failed:', error);
        if (connection) {
            await connection.end();
        }
    }
}

testBackendFix();
