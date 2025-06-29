const mysql = require('mysql2/promise');

async function setupCustomOrderForDeliveryTest() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 's3v3n-f0ur-cl0thing*',
        database: 'seven_four_clothing'
    });

    try {
        console.log('=== SETTING UP CUSTOM ORDER FOR DELIVERY TEST ===\n');

        // Get our test custom order details
        const [customOrder] = await connection.execute(`
            SELECT * FROM custom_orders WHERE custom_order_id = 'CUSTOM-MCECZZDF-Q5SVA'
        `);

        if (customOrder.length === 0) {
            console.log('❌ Test custom order not found');
            return;
        }

        const order = customOrder[0];
        console.log(`📋 Found custom order: ${order.custom_order_id} (DB ID: ${order.id})`);

        // Step 1: Set the custom order to approved and pending delivery status
        console.log('\n🔄 Step 1: Setting custom order to approved status...');
        await connection.execute(`
            UPDATE custom_orders 
            SET status = 'approved', delivery_status = 'pending'
            WHERE id = ?
        `, [order.id]);

        // Step 2: Create entry in delivery_schedules_enhanced with 'pending' status
        console.log('\n🔄 Step 2: Creating delivery schedule entry...');
        
        // First, check if there's already an entry
        const [existingSchedule] = await connection.execute(`
            SELECT * FROM delivery_schedules_enhanced 
            WHERE order_id = ? AND order_type = 'custom_order'
        `, [order.id]);

        if (existingSchedule.length > 0) {
            console.log('📅 Updating existing delivery schedule...');
            await connection.execute(`
                UPDATE delivery_schedules_enhanced 
                SET delivery_status = 'pending',
                    delivery_date = CURDATE() + INTERVAL 3 DAY
                WHERE id = ?
            `, [existingSchedule[0].id]);
            console.log(`✅ Updated existing schedule ID ${existingSchedule[0].id}`);
        } else {
            console.log('📅 Creating new delivery schedule...');
            const deliveryDate = new Date();
            deliveryDate.setDate(deliveryDate.getDate() + 3); // 3 days from now

            await connection.execute(`
                INSERT INTO delivery_schedules_enhanced 
                (order_id, order_number, order_type, customer_name, customer_email, customer_phone,
                 delivery_date, delivery_status, delivery_address, delivery_city, delivery_province,
                 delivery_postal_code, delivery_contact_phone, created_at)
                VALUES (?, ?, 'custom_order', ?, ?, ?, ?, 'pending', ?, ?, ?, ?, ?, NOW())
            `, [
                order.id,
                order.custom_order_id,
                order.customer_name,
                order.customer_email,
                order.customer_phone,
                deliveryDate.toISOString().split('T')[0],
                `${order.street_number}, ${order.municipality}, ${order.province}`,
                order.municipality,
                order.province,
                order.postal_code,
                order.customer_phone
            ]);
            console.log(`✅ Created new delivery schedule for ${deliveryDate.toDateString()}`);
        }

        // Step 3: Verify the setup
        console.log('\n🔍 Step 3: Verifying setup...');
        
        const [verifyCustomOrder] = await connection.execute(`
            SELECT id, custom_order_id, status, delivery_status, customer_name
            FROM custom_orders WHERE id = ?
        `, [order.id]);

        const [verifySchedule] = await connection.execute(`
            SELECT id, order_id, order_type, delivery_status, delivery_date
            FROM delivery_schedules_enhanced 
            WHERE order_id = ? AND order_type = 'custom_order'
        `, [order.id]);

        if (verifyCustomOrder.length > 0 && verifySchedule.length > 0) {
            const customOrderVerify = verifyCustomOrder[0];
            const scheduleVerify = verifySchedule[0];
            
            console.log('\n✅ SETUP COMPLETE - VERIFICATION:');
            console.log(`🎨 Custom Order: ${customOrderVerify.custom_order_id}`);
            console.log(`  - Status: ${customOrderVerify.status}`);
            console.log(`  - Delivery Status: ${customOrderVerify.delivery_status}`);
            console.log(`  - Customer: ${customOrderVerify.customer_name}`);
            
            console.log(`📅 Delivery Schedule: ID ${scheduleVerify.id}`);
            console.log(`  - Order ID: ${scheduleVerify.order_id}`);
            console.log(`  - Order Type: ${scheduleVerify.order_type}`);
            console.log(`  - Delivery Status: ${scheduleVerify.delivery_status}`);
            console.log(`  - Delivery Date: ${scheduleVerify.delivery_date}`);
            
            console.log('\n🧪 READY FOR TESTING:');
            console.log('1. The custom order should now appear in the frontend');
            console.log('2. It should show as "pending" delivery status');
            console.log('3. "Set Production Start" button should be available');
            console.log('4. After setting production start, status should change to "scheduled"');
            console.log('5. "Delivered" button should then become available');
        } else {
            console.log('❌ Setup verification failed');
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await connection.end();
    }
}

setupCustomOrderForDeliveryTest();
