const mysql = require('mysql2/promise');

async function checkCurrentStatus() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 's3v3n-f0ur-cl0thing*',
        database: 'seven_four_clothing'
    });

    try {
        console.log('=== CHECKING CURRENT ORDER STATUS ===\n');

        // Check custom orders status
        console.log('📋 CUSTOM ORDERS STATUS:');
        const [customOrders] = await connection.execute(`
            SELECT id, custom_order_id, delivery_status, status, customer_name
            FROM custom_orders 
            ORDER BY id DESC 
            LIMIT 10
        `);

        if (customOrders.length === 0) {
            console.log('❌ No custom orders found');
        } else {
            customOrders.forEach(order => {
                console.log(`🎨 ID: ${order.id}, Order: ${order.custom_order_id}, Customer: ${order.customer_name}, Order Status: ${order.status || 'NULL'}, Delivery Status: ${order.delivery_status || 'NULL'}`);
            });
        }

        console.log('\n📋 ORDERS STATUS:');
        const [orders] = await connection.execute(`
            SELECT id, order_number, delivery_date, status
            FROM orders 
            ORDER BY id DESC 
            LIMIT 10
        `);

        if (orders.length === 0) {
            console.log('❌ No orders found');
        } else {
            orders.forEach(order => {
                console.log(`📦 ID: ${order.id}, Order: ${order.order_number}, Status: ${order.status || 'NULL'}, Delivery Date: ${order.delivery_date || 'NULL'}`);
            });
        }

        console.log('\n📅 DELIVERY SCHEDULES:');
        const [schedules] = await connection.execute(`
            SELECT id, order_id, delivery_status, delivery_date, order_type
            FROM delivery_schedules 
            ORDER BY id DESC 
            LIMIT 10
        `);

        if (schedules.length === 0) {
            console.log('❌ No delivery schedules found');
        } else {
            schedules.forEach(schedule => {
                console.log(`🚚 ID: ${schedule.id}, Order ID: ${schedule.order_id}, Type: ${schedule.order_type}, Status: ${schedule.delivery_status || 'NULL'}, Date: ${schedule.delivery_date || 'NULL'}`);
            });
        }

        // Check for custom orders that need scheduling
        console.log('\n🔍 CUSTOM ORDERS THAT NEED STATUS UPDATES:');
        const [needsScheduling] = await connection.execute(`
            SELECT id, custom_order_id, delivery_status, status, customer_name
            FROM custom_orders
            WHERE status = 'approved' 
            AND (delivery_status IS NULL OR delivery_status = 'pending')
            LIMIT 5
        `);

        if (needsScheduling.length > 0) {
            console.log('⚠️ Found approved custom orders that could be scheduled:');
            needsScheduling.forEach(order => {
                console.log(`🎨 ${order.custom_order_id} (${order.customer_name}): Status = ${order.status}, Delivery = ${order.delivery_status || 'NULL'}`);
            });
        } else {
            console.log('✅ No approved custom orders need scheduling');
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await connection.end();
    }
}

checkCurrentStatus();
