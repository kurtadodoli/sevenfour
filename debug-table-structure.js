const mysql = require('mysql2/promise');

async function debugTableStructure() {
    let connection;
    
    try {
        connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 's3v3n-f0ur-cl0thing*',
            database: 'seven_four_clothing'
        });

        console.log('🔍 Checking table structures...\n');

        // Check orders table structure
        console.log('📋 ORDERS table structure:');
        const [ordersStructure] = await connection.execute('DESCRIBE orders');
        console.table(ordersStructure);

        // Check custom_orders table structure
        console.log('\n📋 CUSTOM_ORDERS table structure:');
        const [customOrdersStructure] = await connection.execute('DESCRIBE custom_orders');
        console.table(customOrdersStructure);

        // Check delivery_schedules_enhanced table structure
        console.log('\n📋 DELIVERY_SCHEDULES_ENHANCED table structure:');
        const [deliverySchedulesStructure] = await connection.execute('DESCRIBE delivery_schedules_enhanced');
        console.table(deliverySchedulesStructure);

        console.log('\n🔍 Checking current data for our test order...');

        // Check orders table
        const [orders] = await connection.execute(`
            SELECT * FROM orders 
            WHERE order_number = 'CUSTOM-8H-QMZ5R-2498'
        `);
        
        console.log('\n📋 Orders table data:', orders);

        // Check custom_orders table
        const [customOrders] = await connection.execute(`
            SELECT * FROM custom_orders 
            WHERE custom_order_id = 'CUSTOM-8H-QMZ5R-2498'
        `);
        
        console.log('\n📋 Custom orders table data:', customOrders);

        // Check delivery schedules
        if (orders.length > 0) {
            const [deliverySchedules] = await connection.execute(`
                SELECT * FROM delivery_schedules_enhanced 
                WHERE order_id = ?
            `, [orders[0].id]);
            
            console.log('\n📋 Delivery schedules data:', deliverySchedules);
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

debugTableStructure();
