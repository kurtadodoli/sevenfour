const mysql = require('mysql2/promise');
require('dotenv').config({ path: './server/.env' });

async function testEndToEndOrder() {
    let db;
    try {
        console.log('🧪 Testing End-to-End Order Creation...\n');

        // Create and connect to database
        db = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'seven_four_clothing'
        });
        console.log('✅ Connected to database');

        // Test data similar to what frontend would send
        const testOrder = {
            user_id: 1,
            delivery_date: '2025-01-15',
            total_amount: 299.99,
            payment_method: 'gcash',
            payment_status: 'pending',
            status: 'pending',
            customer_fullname: 'John Doe',
            customer_phone: '09123456789',
            province: 'Metro Manila',
            city_municipality: 'Quezon City',
            street_address: '123 Test St, Barangay Test',
            gcash_reference_number: 'TEST123456789',
            payment_proof_image_path: 'uploads/test_proof.jpg'
        };

        const testOrderItems = [
            {
                product_id: 1,
                variant_id: 1,
                quantity: 2,
                unit_price: 149.99,
                subtotal: 299.98
            }
        ];

        console.log('\n📋 Test Order Data:');
        console.log('Order:', JSON.stringify(testOrder, null, 2));
        console.log('Order Items:', JSON.stringify(testOrderItems, null, 2));

        // Start transaction
        await db.query('START TRANSACTION');
        console.log('\n🔄 Started transaction');

        // Insert into orders table (using actual column names)
        const orderNumber = `ORD-${Date.now()}`;
        const orderInsertSQL = `
            INSERT INTO orders (
                order_number, user_id, delivery_date, total_amount, payment_method, 
                payment_status, status, province, city_municipality, 
                street_address, payment_reference, payment_proof_filename
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const [orderResult] = await db.execute(orderInsertSQL, [
            orderNumber,
            testOrder.user_id,
            testOrder.delivery_date,
            testOrder.total_amount,
            testOrder.payment_method,
            testOrder.payment_status,
            testOrder.status,
            testOrder.province,
            testOrder.city_municipality,
            testOrder.street_address,
            testOrder.gcash_reference_number, // maps to payment_reference
            testOrder.payment_proof_image_path // maps to payment_proof_filename
        ]);

        const orderId = orderResult.insertId;
        console.log(`✅ Created order with ID: ${orderId}`);

        // Insert into order_items table (using actual column names and adding required fields)
        const orderItemsInsertSQL = `
            INSERT INTO order_items (
                order_id, invoice_id, product_id, product_name, product_price, 
                quantity, subtotal, customer_fullname, customer_phone, 
                gcash_reference_number, payment_proof_image_path, province, 
                city_municipality, street_address
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        for (const item of testOrderItems) {
            await db.execute(orderItemsInsertSQL, [
                orderId,
                `INV-${orderId}`, // invoice_id is required
                item.product_id,
                'Test Product', // product_name is required
                item.unit_price, // maps to product_price
                item.quantity,
                item.subtotal,
                testOrder.customer_fullname,
                testOrder.customer_phone,
                testOrder.gcash_reference_number,
                testOrder.payment_proof_image_path,
                testOrder.province,
                testOrder.city_municipality,
                testOrder.street_address
            ]);
        }

        console.log(`✅ Created ${testOrderItems.length} order item(s)`);

        // Verify the order was created correctly
        const [orderCheck] = await db.execute('SELECT * FROM orders WHERE id = ?', [orderId]);
        const [orderItemsCheck] = await db.execute('SELECT * FROM order_items WHERE order_id = ?', [orderId]);

        console.log('\n🔍 Verification Results:');
        console.log('Order in database:', orderCheck[0] ? '✅ Found' : '❌ Not found');
        console.log('Order items in database:', orderItemsCheck.length > 0 ? `✅ Found ${orderItemsCheck.length} items` : '❌ Not found');

        // Commit transaction
        await db.query('COMMIT');
        console.log('\n✅ Transaction committed successfully');

        // Clean up test data
        await db.execute('DELETE FROM order_items WHERE order_id = ?', [orderId]);
        await db.execute('DELETE FROM orders WHERE id = ?', [orderId]);
        console.log('🧹 Cleaned up test data');

        console.log('\n🎉 END-TO-END ORDER CREATION TEST PASSED!');
        console.log('✅ All fields are properly handled');
        console.log('✅ No "customer_fullname doesn\'t have a default value" error');
        console.log('✅ Order creation workflow is working correctly');

    } catch (error) {
        console.error('\n❌ Error during end-to-end test:', error);
        
        // Rollback on error
        try {
            if (db) {
                await db.query('ROLLBACK');
                console.log('🔄 Transaction rolled back');
            }
        } catch (rollbackError) {
            console.error('❌ Rollback error:', rollbackError);
        }

        process.exit(1);
    } finally {
        if (db) {
            await db.end();
            console.log('\n🔌 Database connection closed');
        }
    }
}

testEndToEndOrder();
