const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 's3v3n-f0ur-cl0thing*',
    database: 'seven_four_clothing',
    port: 3306
};

async function checkMetroManilaEntries() {
    try {
        console.log('🔍 Checking Metro Manila entries in database...\n');
        
        const connection = await mysql.createConnection(dbConfig);
        
        // Check orders table
        console.log('=== ORDERS TABLE ===');
        const [orders] = await connection.execute(`
            SELECT COUNT(*) as count FROM orders WHERE province LIKE '%Metro Manila%'
        `);
        console.log(`Orders with "Metro Manila" province: ${orders[0].count}`);
        
        const [ordersShipping] = await connection.execute(`
            SELECT COUNT(*) as count FROM orders WHERE shipping_address LIKE '%Metro Manila%'
        `);
        console.log(`Orders with "Metro Manila" in shipping_address: ${ordersShipping[0].count}`);
        
        // Check custom_orders table
        console.log('\n=== CUSTOM_ORDERS TABLE ===');
        const [customOrders] = await connection.execute(`
            SELECT COUNT(*) as count FROM custom_orders WHERE province LIKE '%Metro Manila%'
        `);
        console.log(`Custom orders with "Metro Manila" province: ${customOrders[0].count}`);
        
        // Check custom_designs table
        console.log('\n=== CUSTOM_DESIGNS TABLE ===');
        const [customDesigns] = await connection.execute(`
            SELECT COUNT(*) as count FROM custom_designs WHERE city LIKE '%Metro Manila%'
        `);
        console.log(`Custom designs with "Metro Manila" in city: ${customDesigns[0].count}`);
        
        // Check delivery_schedules_enhanced table
        console.log('\n=== DELIVERY_SCHEDULES_ENHANCED TABLE ===');
        const [deliverySchedules] = await connection.execute(`
            SELECT COUNT(*) as count FROM delivery_schedules_enhanced WHERE delivery_province LIKE '%Metro Manila%'
        `);
        console.log(`Delivery schedules with "Metro Manila" province: ${deliverySchedules[0].count}`);
        
        // Sample some actual data
        console.log('\n=== SAMPLE DATA ===');
        const [sampleOrders] = await connection.execute(`
            SELECT id, order_number, province, shipping_address 
            FROM orders 
            WHERE province LIKE '%Metro Manila%' OR shipping_address LIKE '%Metro Manila%'
            LIMIT 3
        `);
        
        sampleOrders.forEach(order => {
            console.log(`Order ${order.order_number}:`);
            console.log(`  Province: ${order.province}`);
            console.log(`  Shipping: ${order.shipping_address}`);
        });
        
        await connection.end();
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

checkMetroManilaEntries();
