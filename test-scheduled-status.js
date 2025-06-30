const mysql = require('mysql2/promise');

async function testScheduledStatus() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 's3v3n-f0ur-cl0thing*',
        database: 'seven_four_clothing'
    });

    try {
        console.log('=== TESTING SCHEDULED STATUS SCENARIO ===\n');

        // Set custom order 3 (CUSTOM-MCECZZDF-Q5SVA) to scheduled status
        const customOrderId = 3;
        const customOrderIdString = 'CUSTOM-MCECZZDF-Q5SVA';

        console.log(`📅 Setting custom order ${customOrderIdString} to 'scheduled' status...`);

        await connection.execute(`
            UPDATE custom_orders 
            SET delivery_status = 'scheduled'
            WHERE id = ?
        `, [customOrderId]);

        console.log(`✅ Updated custom order ${customOrderIdString} to scheduled`);

        // Check if there's a corresponding entry in orders table
        const [orderRecord] = await connection.execute(`
            SELECT id, order_number, status 
            FROM orders 
            WHERE order_number LIKE '%Q5SVA%'
            LIMIT 1
        `);

        if (orderRecord.length > 0) {
            const orderId = orderRecord[0].id;
            const orderNumber = orderRecord[0].order_number;
            
            console.log(`📦 Found corresponding order: ${orderNumber} (ID: ${orderId})`);
            
            // Create or update delivery schedule for this order
            const [existingSchedule] = await connection.execute(`
                SELECT id FROM delivery_schedules WHERE order_id = ?
            `, [orderId]);

            if (existingSchedule.length === 0) {
                // Create new delivery schedule
                console.log(`📅 Creating delivery schedule for order ${orderNumber}...`);
                
                const deliveryDate = new Date();
                deliveryDate.setDate(deliveryDate.getDate() + 3); // 3 days from now

                await connection.execute(`
                    INSERT INTO delivery_schedules 
                    (order_id, order_type, customer_id, delivery_date, delivery_status, delivery_address, delivery_city, delivery_province)
                    VALUES (?, 'custom', ?, ?, 'scheduled', 'Test Address', 'Test City', 'Test Province')
                `, [orderId, 967502321335176, deliveryDate.toISOString().split('T')[0]]);

                console.log(`✅ Created delivery schedule for ${orderNumber} on ${deliveryDate.toDateString()}`);
            } else {
                // Update existing schedule
                console.log(`📅 Updating existing delivery schedule for order ${orderNumber}...`);
                
                await connection.execute(`
                    UPDATE delivery_schedules 
                    SET delivery_status = 'scheduled'
                    WHERE order_id = ?
                `, [orderId]);

                console.log(`✅ Updated delivery schedule status to 'scheduled'`);
            }
        }

        // Verify the update
        const [verification] = await connection.execute(`
            SELECT id, custom_order_id, delivery_status, status, customer_name
            FROM custom_orders 
            WHERE id = ?
        `, [customOrderId]);

        if (verification.length > 0) {
            const order = verification[0];
            console.log(`\n🔍 VERIFICATION - Custom Order ${order.custom_order_id}:`);
            console.log(`  - Customer: ${order.customer_name}`);
            console.log(`  - Order Status: ${order.status}`);
            console.log(`  - Delivery Status: ${order.delivery_status}`);
            
            if (order.delivery_status === 'scheduled' && order.status === 'approved') {
                console.log(`\n✅ SUCCESS: Order is now properly set up for testing the "Delivered" button!`);
                console.log(`\nNext steps:`);
                console.log(`1. Navigate to the Delivery Page in the frontend`);
                console.log(`2. Look for order ${order.custom_order_id}`);
                console.log(`3. The "Delivered" button should be visible and functional`);
                console.log(`4. Test clicking the "Delivered" button to update status`);
            } else {
                console.log(`\n❌ WARNING: Order status is not optimal for testing`);
            }
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await connection.end();
    }
}

testScheduledStatus();
