const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 's3v3n-f0ur-cl0thing*',
    database: 'seven_four_clothing'
};

async function fixScheduledCustomOrders() {
    let connection;
    try {
        console.log('=== FIXING SCHEDULED CUSTOM ORDERS ===\n');
        
        connection = await mysql.createConnection(dbConfig);
        
        // Find custom orders that have scheduled_delivery_date but status is still pending
        const [customOrders] = await connection.execute(`
            SELECT id, custom_order_id, delivery_status, estimated_delivery_date
            FROM custom_orders 
            WHERE delivery_status = 'pending'
        `);
        
        console.log(`Found ${customOrders.length} custom orders with pending status`);
        
        // Check if any have scheduled delivery in the delivery_schedules_enhanced table
        for (const order of customOrders) {
            const [schedules] = await connection.execute(`
                SELECT * FROM delivery_schedules_enhanced 
                WHERE order_id = ? AND order_type = 'custom_order'
            `, [order.id]);
            
            if (schedules.length > 0) {
                console.log(`\n📦 Found scheduled custom order: ${order.custom_order_id}`);
                console.log(`   - Current status: ${order.delivery_status}`);
                console.log(`   - Has delivery schedule: YES`);
                console.log(`   - Schedule date: ${schedules[0].delivery_date}`);
                
                // Update the custom order status to 'scheduled'
                await connection.execute(`
                    UPDATE custom_orders 
                    SET delivery_status = 'scheduled', 
                        estimated_delivery_date = ?
                    WHERE id = ?
                `, [schedules[0].delivery_date, order.id]);
                
                console.log(`   ✅ Updated status to 'scheduled'`);
            }
        }
        
        // Verify the fix
        console.log('\n=== VERIFICATION ===');
        const [verifyOrders] = await connection.execute(`
            SELECT custom_order_id, delivery_status, estimated_delivery_date
            FROM custom_orders 
            WHERE custom_order_id IN ('CUSTOM-MCNQQ7NW-GQEOI', 'CUSTOM-MCNQFDBQ-YQPWJ')
        `);
        
        verifyOrders.forEach(order => {
            console.log(`${order.custom_order_id}: ${order.delivery_status} (${order.estimated_delivery_date || 'no date'})`);
        });
        
        console.log('\n🎉 Custom order scheduling status fixed!');
        console.log('The action buttons should now appear in DeliveryPage.js');
        
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

fixScheduledCustomOrders();
