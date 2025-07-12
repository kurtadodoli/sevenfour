// Simple test to check custom design data structure
const path = require('path');
const fs = require('fs');
const { Pool } = require('pg');

async function testCustomDesignData() {
    const pool = new Pool({
        user: 'postgres',
        host: 'localhost',
        database: 'sfc',
        password: 'admin',
        port: 5432,
    });

    try {
        console.log('🔍 Testing custom design data...');

        // Test 1: Get all custom orders
        const result1 = await pool.query(`
            SELECT 
                id,
                custom_order_id,
                customer_name,
                estimated_price,
                final_price,
                product_type,
                created_at,
                status
            FROM custom_orders 
            ORDER BY created_at DESC 
            LIMIT 3
        `);

        console.log('📊 Custom orders found:', result1.rows.length);
        
        if (result1.rows.length > 0) {
            console.log('🔍 First custom order:');
            const firstOrder = result1.rows[0];
            console.log('  - ID:', firstOrder.id);
            console.log('  - Custom Order ID:', firstOrder.custom_order_id);
            console.log('  - Customer:', firstOrder.customer_name);
            console.log('  - Estimated Price:', firstOrder.estimated_price, '(type:', typeof firstOrder.estimated_price, ')');
            console.log('  - Final Price:', firstOrder.final_price, '(type:', typeof firstOrder.final_price, ')');
            console.log('  - Product Type:', firstOrder.product_type);
            console.log('  - Status:', firstOrder.status);
            console.log('  - Created:', firstOrder.created_at);

            // Test 2: Get images for this order
            const result2 = await pool.query(`
                SELECT 
                    id,
                    image_filename,
                    original_filename,
                    upload_order
                FROM custom_order_images 
                WHERE custom_order_id = $1
                ORDER BY upload_order ASC
            `, [firstOrder.custom_order_id]);

            console.log('\n🖼️ Images for this order:', result2.rows.length);
            if (result2.rows.length > 0) {
                result2.rows.forEach((img, index) => {
                    console.log(`  Image ${index + 1}:`, {
                        id: img.id,
                        filename: img.image_filename,
                        original: img.original_filename,
                        order: img.upload_order
                    });
                });
            } else {
                console.log('  No images found for this order');
            }

            // Test 3: Check if images exist on filesystem
            if (result2.rows.length > 0) {
                console.log('\n📁 Checking filesystem for images...');
                const uploadPath = path.join(__dirname, 'server', 'uploads', 'custom-orders');
                console.log('  Upload path:', uploadPath);
                
                result2.rows.forEach((img, index) => {
                    const imagePath = path.join(uploadPath, img.image_filename);
                    const exists = fs.existsSync(imagePath);
                    console.log(`  Image ${index + 1} (${img.image_filename}):`, exists ? '✅ EXISTS' : '❌ NOT FOUND');
                });
            }
        }

        // Test 4: Check if there are any orders with non-zero prices
        const result4 = await pool.query(`
            SELECT 
                custom_order_id,
                customer_name,
                estimated_price,
                final_price,
                status
            FROM custom_orders 
            WHERE estimated_price > 0 OR final_price > 0
            ORDER BY created_at DESC 
            LIMIT 3
        `);

        console.log('\n💰 Orders with non-zero prices:', result4.rows.length);
        result4.rows.forEach((order, index) => {
            console.log(`  Order ${index + 1}:`, {
                id: order.custom_order_id,
                customer: order.customer_name,
                estimated: order.estimated_price,
                final: order.final_price,
                status: order.status
            });
        });

        await pool.end();
        console.log('\n✅ Test completed successfully');

    } catch (error) {
        console.error('❌ Error:', error.message);
        await pool.end();
    }
}

testCustomDesignData();
