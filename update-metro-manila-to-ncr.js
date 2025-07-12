const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 's3v3n-f0ur-cl0thing*',
    database: 'seven_four_clothing',
    port: 3306
};

async function updateMetroManilaToNCR() {
    try {
        console.log('🔄 Updating Metro Manila to National Capital Region...\n');
        
        const connection = await mysql.createConnection(dbConfig);
        
        // Start transaction
        await connection.beginTransaction();
        
        try {
            // Update orders table - province field
            console.log('=== UPDATING ORDERS TABLE (province) ===');
            const [ordersProvince] = await connection.execute(`
                UPDATE orders 
                SET province = 'National Capital Region' 
                WHERE province LIKE '%Metro Manila%'
            `);
            console.log(`✅ Updated ${ordersProvince.affectedRows} orders province field`);
            
            // Update orders table - shipping_address field
            console.log('\n=== UPDATING ORDERS TABLE (shipping_address) ===');
            const [ordersShipping] = await connection.execute(`
                UPDATE orders 
                SET shipping_address = REPLACE(shipping_address, 'Metro Manila', 'National Capital Region')
                WHERE shipping_address LIKE '%Metro Manila%'
            `);
            console.log(`✅ Updated ${ordersShipping.affectedRows} orders shipping_address field`);
            
            // Update custom_orders table
            console.log('\n=== UPDATING CUSTOM_ORDERS TABLE ===');
            const [customOrders] = await connection.execute(`
                UPDATE custom_orders 
                SET province = 'National Capital Region' 
                WHERE province LIKE '%Metro Manila%'
            `);
            console.log(`✅ Updated ${customOrders.affectedRows} custom orders`);
            
            // Update delivery_schedules_enhanced table
            console.log('\n=== UPDATING DELIVERY_SCHEDULES_ENHANCED TABLE ===');
            const [deliverySchedules] = await connection.execute(`
                UPDATE delivery_schedules_enhanced 
                SET delivery_province = 'National Capital Region' 
                WHERE delivery_province LIKE '%Metro Manila%'
            `);
            console.log(`✅ Updated ${deliverySchedules.affectedRows} delivery schedules`);
            
            // Update delivery_schedules_enhanced table - delivery_address field
            const [deliveryAddress] = await connection.execute(`
                UPDATE delivery_schedules_enhanced 
                SET delivery_address = REPLACE(delivery_address, 'Metro Manila', 'National Capital Region')
                WHERE delivery_address LIKE '%Metro Manila%'
            `);
            console.log(`✅ Updated ${deliveryAddress.affectedRows} delivery addresses`);
            
            // Check if there are any other tables that might have Metro Manila
            console.log('\n=== CHECKING OTHER TABLES ===');
            
            // Check users table
            const [usersCount] = await connection.execute(`
                SELECT COUNT(*) as count FROM users WHERE province LIKE '%Metro Manila%'
            `);
            if (usersCount[0].count > 0) {
                const [usersUpdate] = await connection.execute(`
                    UPDATE users 
                    SET province = 'National Capital Region' 
                    WHERE province LIKE '%Metro Manila%'
                `);
                console.log(`✅ Updated ${usersUpdate.affectedRows} users`);
            } else {
                console.log('No users with Metro Manila found');
            }
            
            // Commit transaction
            await connection.commit();
            console.log('\n🎉 Successfully updated all Metro Manila entries to National Capital Region!');
            
            // Verify the changes
            console.log('\n=== VERIFICATION ===');
            const [verifyOrders] = await connection.execute(`
                SELECT COUNT(*) as count FROM orders WHERE province = 'National Capital Region'
            `);
            console.log(`Orders with NCR: ${verifyOrders[0].count}`);
            
            const [verifyCustomOrders] = await connection.execute(`
                SELECT COUNT(*) as count FROM custom_orders WHERE province = 'National Capital Region'
            `);
            console.log(`Custom orders with NCR: ${verifyCustomOrders[0].count}`);
            
            const [verifyDelivery] = await connection.execute(`
                SELECT COUNT(*) as count FROM delivery_schedules_enhanced WHERE delivery_province = 'National Capital Region'
            `);
            console.log(`Delivery schedules with NCR: ${verifyDelivery[0].count}`);
            
        } catch (error) {
            await connection.rollback();
            throw error;
        }
        
        await connection.end();
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

updateMetroManilaToNCR();
