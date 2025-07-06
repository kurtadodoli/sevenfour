const mysql = require('mysql2/promise');

async function testDirectRefundCreation() {
    console.log('=== DIRECT REFUND CREATION TEST ===');
    
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root', 
        password: 's3v3n-f0ur-cl0thing*',
        database: 'seven_four_clothing'
    });
    
    try {
        // Test data - using the same structure as the backend
        const orderNumber = `REF-${Date.now()}`;
        const userId = 1750448349269; // Valid user ID
        const customerName = 'Test Admin';
        const customerEmail = 'testadmin@example.com';
        
        const values = [
            null,                                    // order_id
            null,                                    // custom_order_id 
            orderNumber,                            // order_number (NOT NULL)
            userId,                                 // user_id (NOT NULL)
            customerName,                           // customer_name (NOT NULL)
            customerEmail,                          // customer_email (NOT NULL)
            '09123456789',                          // customer_phone
            'Test Product',                         // product_name
            null,                                   // product_image
            99.99,                                  // price
            1,                                      // quantity
            'M',                                    // size
            'Blue',                                 // color
            '09123456789',                          // phone_number
            '123 Test Street',                      // street_address
            'Test City',                            // city_municipality
            'Test Province',                        // province
            99.99,                                  // amount (NOT NULL)
            'Product defective'                     // reason (NOT NULL)
        ];

        console.log('Values to insert:', values);
        console.log('Values count:', values.length);

        // Insert refund request with all required fields
        const insertQuery = `
            INSERT INTO refund_requests (
                order_id, custom_order_id, order_number, user_id, customer_name, customer_email,
                customer_phone, product_name, product_image, price, quantity, size, color, 
                phone_number, street_address, city_municipality, province, 
                amount, reason
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        console.log('Executing query...');
        const result = await connection.execute(insertQuery, values);
        console.log('✅ INSERT successful:', result[0]);
        
        // Verify the insertion
        const [inserted] = await connection.execute('SELECT * FROM refund_requests WHERE order_number = ?', [orderNumber]);
        console.log('✅ Verification - inserted record:', inserted[0]);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Error code:', error.code);
        console.error('SQL State:', error.sqlState);
    } finally {
        await connection.end();
    }
}

testDirectRefundCreation().catch(console.error);
