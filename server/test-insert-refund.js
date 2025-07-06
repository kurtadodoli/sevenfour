const mysql = require('mysql2/promise');
const { dbConfig } = require('./config/db');

async function testInsert() {
    console.log('Testing INSERT query for refund_requests...');
    const connection = await mysql.createConnection(dbConfig);
    
    try {
        // Test the exact INSERT query
        const insertQuery = `
            INSERT INTO refund_requests (
                user_id, order_id, custom_order_id, order_number, customer_name, customer_email,
                product_name, product_image, price, quantity, size, color, 
                phone_number, street_address, city_municipality, province, 
                amount, reason, status, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())
        `;
        
        console.log('INSERT Query:');
        console.log(insertQuery);
        
        const values = [
            967502321335226, // user_id (from test admin)
            1, // order_id
            null, // custom_order_id
            'TEST-ORDER-123', // order_number
            'Test Admin', // customer_name
            'test@admin.com', // customer_email
            'Test Product', // product_name
            'test-image.jpg', // product_image
            1500.00, // price
            1, // quantity
            'M', // size
            'Red', // color
            '09123456789', // phone_number
            '123 Test Street', // street_address
            'Test City', // city_municipality
            'Test Province', // province
            1500.00, // amount
            'Product was damaged during delivery' // reason
        ];
        
        console.log('Values count:', values.length);
        console.log('Values:', values);
        
        await connection.execute(insertQuery, values);
        console.log('✅ INSERT successful');
        
    } catch (error) {
        console.error('❌ INSERT failed:', error.message);
        console.error('Error code:', error.code);
        console.error('SQL State:', error.sqlState);
    } finally {
        await connection.end();
    }
}

testInsert().then(() => {
    console.log('\n✅ Test completed');
    process.exit(0);
}).catch(error => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
});
