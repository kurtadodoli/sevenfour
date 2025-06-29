const mysql = require('mysql2/promise');

async function resetOrderToScheduled() {
    let connection;
    
    try {
        connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 's3v3n-f0ur-cl0thing*',
            database: 'seven_four_clothing'
        });

        console.log('🔄 Resetting order CUSTOM-8H-QMZ5R-2498 to "scheduled" status...\n');

        const orderId = 47;
        const orderNumber = 'CUSTOM-8H-QMZ5R-2498';

        // Update the delivery schedule to "scheduled" status
        const [result] = await connection.execute(`
            UPDATE delivery_schedules_enhanced 
            SET delivery_status = 'scheduled',
                delivered_at = NULL,
                updated_at = NOW()
            WHERE order_id = ? AND order_type = 'regular'
        `, [orderId]);

        console.log(`✅ Updated delivery schedule - Rows affected: ${result.affectedRows}`);

        // Verify the change
        const [updatedSchedule] = await connection.execute(`
            SELECT id, order_id, order_number, order_type, delivery_status, delivery_date, delivered_at
            FROM delivery_schedules_enhanced 
            WHERE order_id = ? AND order_type = 'regular'
        `, [orderId]);

        if (updatedSchedule.length > 0) {
            console.log('\n📋 Updated schedule details:');
            console.log(`   - Schedule ID: ${updatedSchedule[0].id}`);
            console.log(`   - Order ID: ${updatedSchedule[0].order_id}`);
            console.log(`   - Order Number: ${updatedSchedule[0].order_number}`);
            console.log(`   - Order Type: ${updatedSchedule[0].order_type}`);
            console.log(`   - Delivery Status: ${updatedSchedule[0].delivery_status}`);
            console.log(`   - Delivery Date: ${updatedSchedule[0].delivery_date}`);
            console.log(`   - Delivered At: ${updatedSchedule[0].delivered_at}`);
        }

        console.log('\n🎯 TESTING INSTRUCTIONS:');
        console.log('1. Refresh the frontend page');
        console.log('2. Find order CUSTOM-8H-QMZ5R-2498');
        console.log('3. You should now see the "✅ Delivered" button');
        console.log('4. Click the button to test the delivery status update');
        console.log('5. The order should update to "delivered" status and the button should disappear');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

resetOrderToScheduled();
