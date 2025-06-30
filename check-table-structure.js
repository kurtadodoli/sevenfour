const mysql = require('mysql2/promise');

async function checkTableStructure() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 's3v3n-f0ur-cl0thing*',
        database: 'seven_four_clothing'
    });

    try {
        console.log('=== CHECKING TABLE STRUCTURES ===\n');

        // Check custom_orders table structure
        console.log('📋 CUSTOM_ORDERS TABLE STRUCTURE:');
        const [customOrdersColumns] = await connection.execute(`DESCRIBE custom_orders`);
        customOrdersColumns.forEach(col => {
            console.log(`  ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(nullable)' : '(not null)'} ${col.Key ? `[${col.Key}]` : ''}`);
        });

        console.log('\n📋 ORDERS TABLE STRUCTURE:');
        const [ordersColumns] = await connection.execute(`DESCRIBE orders`);
        ordersColumns.forEach(col => {
            console.log(`  ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(nullable)' : '(not null)'} ${col.Key ? `[${col.Key}]` : ''}`);
        });

        console.log('\n📋 DELIVERY_SCHEDULES TABLE STRUCTURE:');
        const [deliveryColumns] = await connection.execute(`DESCRIBE delivery_schedules`);
        deliveryColumns.forEach(col => {
            console.log(`  ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(nullable)' : '(not null)'} ${col.Key ? `[${col.Key}]` : ''}`);
        });

        // Check actual data
        console.log('\n=== SAMPLE DATA ===\n');

        console.log('📋 SAMPLE CUSTOM_ORDERS:');
        const [customSample] = await connection.execute(`SELECT * FROM custom_orders LIMIT 3`);
        if (customSample.length === 0) {
            console.log('❌ No custom orders found');
        } else {
            customSample.forEach((order, index) => {
                console.log(`🎨 Custom Order ${index + 1}:`, order);
            });
        }

        console.log('\n📋 SAMPLE ORDERS:');
        const [ordersSample] = await connection.execute(`SELECT * FROM orders WHERE order_type IN ('custom', 'custom_order', 'custom_design') LIMIT 3`);
        if (ordersSample.length === 0) {
            console.log('❌ No custom-type orders found');
        } else {
            ordersSample.forEach((order, index) => {
                console.log(`📦 Order ${index + 1}:`, order);
            });
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await connection.end();
    }
}

checkTableStructure();
