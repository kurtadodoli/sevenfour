const mysql = require('mysql2/promise');

async function testProductionScheduling() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 's3v3n-f0ur-cl0thing*',
        database: 'seven_four_clothing'
    });

    try {
        console.log('=== TESTING PRODUCTION SCHEDULING FLOW ===\n');

        // Reset custom order 3 to pending status to test the full flow
        const customOrderId = 3;
        const customOrderIdString = 'CUSTOM-MCECZZDF-Q5SVA';

        console.log(`🔄 Resetting custom order ${customOrderIdString} for production scheduling test...`);

        await connection.execute(`
            UPDATE custom_orders 
            SET delivery_status = 'pending'
            WHERE id = ?
        `, [customOrderId]);

        // Remove any existing delivery schedule
        const [orderRecord] = await connection.execute(`
            SELECT id FROM orders WHERE order_number LIKE '%Q5SVA%' LIMIT 1
        `);

        if (orderRecord.length > 0) {
            const orderId = orderRecord[0].id;
            await connection.execute(`
                DELETE FROM delivery_schedules WHERE order_id = ?
            `, [orderId]);
            console.log(`🗑️ Removed existing delivery schedule for order ID ${orderId}`);
        }

        console.log(`✅ Reset complete. Order ${customOrderIdString} is now ready for production scheduling test`);

        // Verify the reset
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
            
            console.log(`\n✅ ORDER READY FOR TESTING PRODUCTION SCHEDULING FLOW:`);
            console.log(`\nTest Steps:`);
            console.log(`1. Navigate to the Delivery Page in the frontend`);
            console.log(`2. Find custom order ${order.custom_order_id} (should show as 'pending' delivery status)`);
            console.log(`3. Click "Set Production Start" button`);
            console.log(`4. Select a date in the calendar`);
            console.log(`5. Verify that delivery status automatically changes to 'scheduled'`);
            console.log(`6. After status changes to 'scheduled', the "Delivered" button should appear`);
            console.log(`7. Test clicking the "Delivered" button to complete the flow`);
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await connection.end();
    }
}

testProductionScheduling();
