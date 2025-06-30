const mysql = require('mysql2/promise');

async function debugUIRefresh() {
    let connection;
    
    try {
        connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 's3v3n-f0ur-cl0thing*',
            database: 'seven_four_clothing'
        });

        console.log('🔍 Checking current status of order CUSTOM-8H-QMZ5R-2498...\n');

        // Check orders table
        const [orders] = await connection.execute(`
            SELECT id, order_number, delivery_status, order_type, status 
            FROM orders 
            WHERE order_number = 'CUSTOM-8H-QMZ5R-2498'
        `);
        
        console.log('📋 Orders table:', orders);

        // Check custom_orders table
        const [customOrders] = await connection.execute(`
            SELECT id, custom_order_id, delivery_status, production_start_date, production_timeline
            FROM custom_orders 
            WHERE custom_order_id = 'CUSTOM-8H-QMZ5R-2498'
        `);
        
        console.log('📋 Custom orders table:', customOrders);

        // Check delivery schedules
        const [deliverySchedules] = await connection.execute(`
            SELECT * FROM delivery_schedules_enhanced 
            WHERE order_id IN (47, 4) OR order_number = 'CUSTOM-8H-QMZ5R-2498'
        `);
        
        console.log('📋 Delivery schedules:', deliverySchedules);

        // Check what the delivery API endpoint returns
        console.log('\n🔍 Checking what delivery API would return...');
        const [deliveryOrders] = await connection.execute(`
            SELECT 
                o.*,
                ds.id as delivery_schedule_id,
                ds.scheduled_delivery_date,
                ds.scheduled_delivery_time,
                ds.delivery_notes,
                ds.courier_name,
                ds.courier_phone
            FROM orders o
            LEFT JOIN delivery_schedules_enhanced ds ON o.id = ds.order_id
            WHERE o.order_number = 'CUSTOM-8H-QMZ5R-2498'
        `);
        
        console.log('📋 What delivery API returns:', deliveryOrders);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

debugUIRefresh();
