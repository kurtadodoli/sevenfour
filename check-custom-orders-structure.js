const mysql = require('mysql2/promise');
const { dbConfig } = require('./server/config/db');

async function checkCustomOrdersStructure() {
    try {
        console.log('🔍 Checking custom_orders table structure...');
        
        const connection = await mysql.createConnection(dbConfig);
        
        // Check if custom_orders table exists and its structure
        const [tables] = await connection.execute("SHOW TABLES LIKE 'custom_orders'");
        if (tables.length === 0) {
            console.log('❌ custom_orders table does not exist');
            await connection.end();
            return;
        }
        
        console.log('✅ custom_orders table exists');
        
        // Get table structure
        const [columns] = await connection.execute('DESCRIBE custom_orders');
        console.log('\n📋 Custom Orders Table Structure:');
        columns.forEach(column => {
            console.log(`  - ${column.Field}: ${column.Type} ${column.Null === 'YES' ? '(nullable)' : '(not null)'}`);
        });
        
        // Get sample data
        console.log('\n📊 Sample custom orders:');
        const [samples] = await connection.execute(`
            SELECT * FROM custom_orders 
            ORDER BY created_at DESC 
            LIMIT 3
        `);
        
        samples.forEach((order, index) => {
            console.log(`\n🎨 Custom Order ${index + 1}:`);
            Object.keys(order).forEach(key => {
                if (key.toLowerCase().includes('image') || key.toLowerCase().includes('path')) {
                    console.log(`   ${key}: ${order[key]}`);
                }
            });
            console.log(`   custom_order_id: ${order.custom_order_id || order.id}`);
            console.log(`   status: ${order.status}`);
        });
        
        await connection.end();
        console.log('\n✅ Structure check completed!');
        
    } catch (error) {
        console.error('❌ Error checking custom orders structure:', error);
    }
}

checkCustomOrdersStructure();
