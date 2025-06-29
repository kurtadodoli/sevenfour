const mysql = require('mysql2/promise');

async function fixOrderDeliverySchedule() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 's3v3n-f0ur-cl0thing*',
        database: 'seven_four_clothing'
    });

    try {
        console.log('=== FIXING DELIVERY SCHEDULE FOR CUSTOM ORDER ===\n');

        // The order from the log: ID 47, CUSTOM-8H-QMZ5R-2498
        // But it maps to custom_orders.id = 4 (CUSTOM-MCED998H-QMZ5R)
        
        const orderId = 47; // This is the orders table ID
        const customOrderId = 4; // This is the custom_orders table ID
        const orderNumber = 'CUSTOM-8H-QMZ5R-2498';

        console.log(`📋 Setting up delivery schedule for order ${orderNumber}...`);
        console.log(`   - Orders table ID: ${orderId}`);
        console.log(`   - Custom orders table ID: ${customOrderId}`);

        // Check if delivery schedule already exists
        const [existingSchedule] = await connection.execute(`
            SELECT * FROM delivery_schedules_enhanced 
            WHERE order_id = ? AND order_type = 'custom_order'
        `, [customOrderId]);

        if (existingSchedule.length > 0) {
            console.log('📅 Updating existing delivery schedule...');
            await connection.execute(`
                UPDATE delivery_schedules_enhanced 
                SET delivery_status = 'delivered',
                    delivered_at = NOW()
                WHERE order_id = ? AND order_type = 'custom_order'
            `, [customOrderId]);
            console.log(`✅ Updated existing schedule ID ${existingSchedule[0].id}`);
        } else {
            console.log('📅 Creating new delivery schedule...');
            
            // Get custom order details
            const [customOrderDetails] = await connection.execute(`
                SELECT * FROM custom_orders WHERE id = ?
            `, [customOrderId]);

            if (customOrderDetails.length > 0) {
                const details = customOrderDetails[0];
                
                await connection.execute(`
                    INSERT INTO delivery_schedules_enhanced 
                    (order_id, order_number, order_type, customer_name, customer_email, customer_phone,
                     delivery_date, delivery_status, delivery_address, delivery_city, delivery_province,
                     delivery_postal_code, delivered_at, created_at)
                    VALUES (?, ?, 'custom_order', ?, ?, ?, CURDATE(), 'delivered', ?, ?, ?, ?, NOW(), NOW())
                `, [
                    customOrderId,
                    details.custom_order_id,
                    details.customer_name,
                    details.customer_email,
                    details.customer_phone,
                    `${details.street_number}, ${details.municipality}, ${details.province}`,
                    details.municipality,
                    details.province,
                    details.postal_code
                ]);
                console.log(`✅ Created new delivery schedule with 'delivered' status`);
            } else {
                console.log('❌ Could not find custom order details');
                return;
            }
        }

        // Also create/update delivery schedule for the orders table ID (47)
        // This is what the frontend is looking for
        const [existingOrderSchedule] = await connection.execute(`
            SELECT * FROM delivery_schedules_enhanced 
            WHERE order_id = ? AND order_type = 'regular'
        `, [orderId]);

        if (existingOrderSchedule.length === 0) {
            console.log('📅 Creating delivery schedule entry for orders table ID...');
            
            await connection.execute(`
                INSERT INTO delivery_schedules_enhanced 
                (order_id, order_number, order_type, customer_name, customer_email,
                 delivery_date, delivery_status, delivery_address, delivery_city, delivery_province,
                 delivered_at, created_at)
                VALUES (?, ?, 'regular', 'kurt', 'krutadodoli@gmail.com', CURDATE(), 'delivered', 
                        'Kamias Ext. adsasd, Quezon City, Metro Manila', 'Quezon City', 'Metro Manila',
                        NOW(), NOW())
            `, [orderId, orderNumber]);
            console.log(`✅ Created delivery schedule for orders table ID ${orderId}`);
        } else {
            await connection.execute(`
                UPDATE delivery_schedules_enhanced 
                SET delivery_status = 'delivered',
                    delivered_at = NOW()
                WHERE order_id = ? AND order_type = 'regular'
            `, [orderId]);
            console.log(`✅ Updated delivery schedule for orders table ID ${orderId}`);
        }

        // Verify the setup
        console.log('\n🔍 VERIFICATION:');
        
        const [customOrderSchedule] = await connection.execute(`
            SELECT id, order_id, order_type, delivery_status, delivered_at
            FROM delivery_schedules_enhanced 
            WHERE order_id = ? AND order_type = 'custom_order'
        `, [customOrderId]);

        const [orderSchedule] = await connection.execute(`
            SELECT id, order_id, order_type, delivery_status, delivered_at
            FROM delivery_schedules_enhanced 
            WHERE order_id = ? AND order_type = 'regular'
        `, [orderId]);

        if (customOrderSchedule.length > 0) {
            console.log(`✅ Custom Order Schedule: ID ${customOrderSchedule[0].id}, Status: ${customOrderSchedule[0].delivery_status}`);
        }
        
        if (orderSchedule.length > 0) {
            console.log(`✅ Orders Table Schedule: ID ${orderSchedule[0].id}, Status: ${orderSchedule[0].delivery_status}`);
        }

        console.log('\n🧪 READY FOR TESTING:');
        console.log('1. Refresh the frontend page');
        console.log('2. The order should now show as "delivered" status');
        console.log('3. Try updating the status again - it should work properly now');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await connection.end();
    }
}

fixOrderDeliverySchedule();
