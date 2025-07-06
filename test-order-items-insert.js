const mysql = require('mysql2/promise');

async function testOrderItemsInsert() {
    console.log('🧪 TESTING ORDER_ITEMS INSERT WITH ALL REQUIRED FIELDS');
    
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 's3v3n-f0ur-cl0thing*',
        database: 'seven_four_clothing',
        charset: 'utf8mb4'
    });

    try {
        // Test the exact INSERT statement that should now work
        const orderId = 999999; // Test order ID
        const invoiceId = `TEST_INV_${Date.now()}`;
        const productId = 1; // Assuming product ID 1 exists
        
        console.log('\n🔍 Testing INSERT with all required fields...');
        
        await connection.execute(`
            INSERT INTO order_items (
                order_id, invoice_id, product_id, product_name, product_price,
                quantity, color, size, subtotal,
                customer_fullname, customer_phone, gcash_reference_number,
                payment_proof_image_path, province, city_municipality, street_address
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            orderId, invoiceId, productId, 'Test Product', 100.00,
            1, 'Red', 'M', 100.00,
            'Test Customer', '09123456789', 'REF123456789',
            'test-payment.jpg', 'Metro Manila', 'Test City', 'Test Street'
        ]);
        
        console.log('✅ SUCCESS! order_items INSERT works with all required fields');
        
        // Clean up test record
        await connection.execute('DELETE FROM order_items WHERE order_id = ?', [orderId]);
        console.log('🧹 Test record cleaned up');
        
        console.log('\n🎉 THE FIX IS WORKING!');
        console.log('The customer_fullname error should now be resolved.');
        console.log('You can now try creating an order from the frontend.');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.message.includes('customer_fullname')) {
            console.log('🚨 The customer_fullname error is still occurring');
        }
    } finally {
        await connection.end();
    }
}

testOrderItemsInsert().catch(console.error);
