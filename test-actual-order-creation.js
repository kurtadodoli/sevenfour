const mysql = require('mysql2/promise');

async function testActualOrderCreation() {
    console.log('🧪 TESTING ACTUAL ORDER CREATION PROCESS');
    
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 's3v3n-f0ur-cl0thing*',
        database: 'seven_four_clothing',
        charset: 'utf8mb4'
    });

    try {
        // Simulate the exact same order creation that the frontend is trying to do
        console.log('\n1. Testing the EXACT order creation process...');
        
        // First, let's see what a real order creation looks like
        const orderNumber = `TEST_${Date.now()}`;
        const userID = 1; // Assuming user ID 1 exists
        const invoiceId = `INV_${Date.now()}`;
        const transactionId = `TXN_${Date.now()}`;
        
        console.log('\n2. Creating test order with the exact same parameters...');
        
        // This is the INSERT that should be happening in orderController.js
        try {
            await connection.execute(`
                INSERT INTO orders (
                    order_number, user_id, invoice_id, transaction_id, 
                    total_amount, shipping_address, contact_phone, notes,
                    street_address, city_municipality, province, zip_code,
                    payment_method, payment_reference, payment_proof_filename,
                    payment_status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                orderNumber, userID, invoiceId, transactionId,
                100.00, '123 Test Street', '09123456789', 'Test order',
                '123 Test Street', 'Test City', 'Test Province', '1234',
                'gcash', 'REF123', 'test.jpg',
                'pending'
            ]);
            
            console.log('✅ Order creation successful using orderController.js pattern');
            
        } catch (error) {
            console.log('❌ Order creation failed:', error.message);
            if (error.message.includes('customer_fullname')) {
                console.log('🚨 FOUND THE ISSUE: This INSERT is still expecting customer_fullname!');
            }
        }
        
        // Clean up
        await connection.execute('DELETE FROM orders WHERE order_number = ?', [orderNumber]);
        
        // Now let's try to replicate the exact API call that the frontend is making
        console.log('\n3. Testing API endpoint simulation...');
        
        // Check what the /api/orders endpoint actually does
        // Let me check if there's a createOrderFromCart function being called
        
        console.log('\n4. Checking for any ORM or abstraction layers...');
        
        // Check if there are any database models or schemas that define customer_fullname
        const [tableInfo] = await connection.execute(`
            SELECT COLUMN_NAME, COLUMN_DEFAULT, IS_NULLABLE, DATA_TYPE
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = 'seven_four_clothing' 
            AND TABLE_NAME = 'orders'
            ORDER BY ORDINAL_POSITION
        `);
        
        console.log('\n📊 Current orders table schema:');
        tableInfo.forEach(col => {
            const indicator = col.COLUMN_NAME === 'customer_fullname' ? '⚠️ ' : '   ';
            console.log(`${indicator}${col.COLUMN_NAME} | ${col.DATA_TYPE} | Nullable: ${col.IS_NULLABLE} | Default: ${col.COLUMN_DEFAULT || 'NULL'}`);
        });
        
        const hasCustomerFullname = tableInfo.find(col => col.COLUMN_NAME === 'customer_fullname');
        if (hasCustomerFullname) {
            console.log('\n🚨 PROBLEM FOUND: customer_fullname column still exists in database!');
            console.log('This could be the source of the error.');
        } else {
            console.log('\n✅ customer_fullname column does not exist - this is correct.');
        }

    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await connection.end();
    }
}

testActualOrderCreation().catch(console.error);
