const mysql = require('mysql2/promise');
const { dbConfig } = require('./server/config/db');

async function clearCustomOrders() {
    console.log('🗑️ CLEARING CUSTOM ORDERS DATABASE\n');
    
    try {
        const connection = await mysql.createConnection(dbConfig);
        
        // First, let's see what we have before clearing
        console.log('1. Checking current custom orders...');
        const [ordersBefore] = await connection.execute(`
            SELECT COUNT(*) as count FROM custom_orders
        `);
        
        const [imagesBefore] = await connection.execute(`
            SELECT COUNT(*) as count FROM custom_order_images
        `);
        
        console.log(`📊 Current state:`);
        console.log(`   - Custom orders: ${ordersBefore[0].count}`);
        console.log(`   - Custom order images: ${imagesBefore[0].count}`);
        
        if (ordersBefore[0].count === 0) {
            console.log('✅ Database is already empty!');
            await connection.end();
            return;
        }
        
        // Clear custom order images first (foreign key constraint)
        console.log('\n2. Clearing custom order images...');
        const [imagesResult] = await connection.execute(`
            DELETE FROM custom_order_images
        `);
        console.log(`✅ Deleted ${imagesResult.affectedRows} image records`);
        
        // Clear custom orders
        console.log('\n3. Clearing custom orders...');
        const [ordersResult] = await connection.execute(`
            DELETE FROM custom_orders
        `);
        console.log(`✅ Deleted ${ordersResult.affectedRows} order records`);
        
        // Reset auto-increment if needed
        console.log('\n4. Resetting auto-increment counters...');
        await connection.execute(`ALTER TABLE custom_orders AUTO_INCREMENT = 1`);
        await connection.execute(`ALTER TABLE custom_order_images AUTO_INCREMENT = 1`);
        console.log('✅ Auto-increment counters reset');
        
        // Verify the tables are empty
        console.log('\n5. Verifying tables are empty...');
        const [ordersAfter] = await connection.execute(`
            SELECT COUNT(*) as count FROM custom_orders
        `);
        
        const [imagesAfter] = await connection.execute(`
            SELECT COUNT(*) as count FROM custom_order_images
        `);
        
        console.log(`📊 Final state:`);
        console.log(`   - Custom orders: ${ordersAfter[0].count}`);
        console.log(`   - Custom order images: ${imagesAfter[0].count}`);
        
        if (ordersAfter[0].count === 0 && imagesAfter[0].count === 0) {
            console.log('\n🎉 SUCCESS! Custom orders database cleared completely.');
            console.log('\n📝 What happens now:');
            console.log('- All custom orders have been removed');
            console.log('- All custom order images have been removed');
            console.log('- The frontend will show "No pending orders" message');
            console.log('- Users can start creating new custom orders from scratch');
        } else {
            console.log('\n⚠️ Warning: Some records may still exist');
        }
        
        await connection.end();
        
    } catch (error) {
        console.error('❌ Error clearing custom orders:', error.message);
    }
}

clearCustomOrders();
