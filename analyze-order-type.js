const mysql = require('mysql2/promise');

async function analyzeOrderType() {
    let connection;
    
    try {
        connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 's3v3n-f0ur-cl0thing*',
            database: 'seven_four_clothing'
        });

        console.log('🔍 Analyzing order CUSTOM-8H-QMZ5R-2498...\n');

        // Check if it exists in orders table
        const [orders] = await connection.execute(`
            SELECT * FROM orders 
            WHERE order_number = 'CUSTOM-8H-QMZ5R-2498'
        `);
        
        console.log('📋 Found in ORDERS table:', orders.length > 0 ? 'YES' : 'NO');
        if (orders.length > 0) {
            console.log('   - Order type based on notes:', orders[0].notes.includes('Custom Order') ? 'CUSTOM ORDER NOTES' : 'REGULAR');
            console.log('   - Status:', orders[0].status);
            console.log('   - Notes:', orders[0].notes);
        }

        // Check if it exists in custom_orders table
        const [customOrders] = await connection.execute(`
            SELECT * FROM custom_orders 
            WHERE custom_order_id = 'CUSTOM-8H-QMZ5R-2498'
        `);
        
        console.log('\n📋 Found in CUSTOM_ORDERS table:', customOrders.length > 0 ? 'YES' : 'NO');

        // Check delivery schedules
        const [deliverySchedules] = await connection.execute(`
            SELECT * FROM delivery_schedules_enhanced 
            WHERE order_number = 'CUSTOM-8H-QMZ5R-2498'
        `);
        
        console.log('\n📋 Found in DELIVERY_SCHEDULES_ENHANCED table:', deliverySchedules.length > 0 ? 'YES' : 'NO');
        if (deliverySchedules.length > 0) {
            console.log('   - Order type in delivery schedule:', deliverySchedules[0].order_type);
            console.log('   - Delivery status:', deliverySchedules[0].delivery_status);
            console.log('   - Order ID used:', deliverySchedules[0].order_id);
        }

        // Check what the delivery API would return for this order
        console.log('\n🔍 Testing delivery API query for regular orders...');
        const [regularOrderResult] = await connection.execute(`
            SELECT 
              o.id,
              o.order_number,
              o.status,
              'regular' as order_type,
              ds.delivery_status,
              ds.delivery_date as scheduled_delivery_date,
              ds.delivery_time_slot as scheduled_delivery_time,
              ds.delivery_notes,
              ds.id as delivery_schedule_id
            FROM orders o
            LEFT JOIN delivery_schedules_enhanced ds ON o.id = ds.order_id AND ds.order_type = 'regular'
            WHERE o.order_number = 'CUSTOM-8H-QMZ5R-2498'
        `);
        
        console.log('📋 Regular orders query result:', regularOrderResult);

        console.log('\n🔍 Testing delivery API query for custom orders...');
        const [customOrderResult] = await connection.execute(`
            SELECT 
              co.id,
              co.custom_order_id as order_number,
              co.status,
              'custom_order' as order_type,
              ds.delivery_status
            FROM custom_orders co
            LEFT JOIN delivery_schedules_enhanced ds ON co.id = ds.order_id AND ds.order_type = 'custom_order'
            WHERE co.custom_order_id = 'CUSTOM-8H-QMZ5R-2498'
        `);
        
        console.log('📋 Custom orders query result:', customOrderResult);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

analyzeOrderType();
