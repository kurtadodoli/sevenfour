const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 's3v3n-f0ur-cl0thing*',
    database: 'seven_four_clothing',
    port: 3306
};

async function fixMetroManilaStructure() {
    try {
        console.log('🔧 Fixing Metro Manila geographical structure...\n');
        console.log('📍 Correct structure should be:');
        console.log('   Region: National Capital Region (NCR)');
        console.log('   Metropolitan Area: Metro Manila');
        console.log('   Cities: Quezon City, Manila, Makati, etc.\n');
        
        const connection = await mysql.createConnection(dbConfig);
        
        // Start transaction
        await connection.beginTransaction();
        
        try {
            // Fix orders table - revert province back to Metro Manila and add region field if needed
            console.log('=== FIXING ORDERS TABLE ===');
            
            // First, let's see what we have
            const [ordersSample] = await connection.execute(`
                SELECT id, province, shipping_address FROM orders LIMIT 5
            `);
            console.log('Current orders sample:', ordersSample);
            
            // Update province field back to Metro Manila (since it represents the metropolitan area)
            const [ordersUpdate] = await connection.execute(`
                UPDATE orders 
                SET province = 'Metro Manila'
                WHERE province = 'National Capital Region'
            `);
            console.log(`✅ Updated ${ordersUpdate.affectedRows} orders province field to Metro Manila`);
            
            // Update shipping addresses - replace "National Capital Region" with "Metro Manila"
            const [ordersShippingUpdate] = await connection.execute(`
                UPDATE orders 
                SET shipping_address = REPLACE(shipping_address, 'National Capital Region', 'Metro Manila')
                WHERE shipping_address LIKE '%National Capital Region%'
            `);
            console.log(`✅ Updated ${ordersShippingUpdate.affectedRows} orders shipping_address field`);
            
            // Fix custom_orders table
            console.log('\n=== FIXING CUSTOM_ORDERS TABLE ===');
            const [customOrdersUpdate] = await connection.execute(`
                UPDATE custom_orders 
                SET province = 'Metro Manila'
                WHERE province = 'National Capital Region'
            `);
            console.log(`✅ Updated ${customOrdersUpdate.affectedRows} custom orders province to Metro Manila`);
            
            // Fix delivery_schedules_enhanced table
            console.log('\n=== FIXING DELIVERY_SCHEDULES_ENHANCED TABLE ===');
            const [deliveryUpdate] = await connection.execute(`
                UPDATE delivery_schedules_enhanced 
                SET delivery_province = 'Metro Manila'
                WHERE delivery_province = 'National Capital Region'
            `);
            console.log(`✅ Updated ${deliveryUpdate.affectedRows} delivery schedules province to Metro Manila`);
            
            const [deliveryAddressUpdate] = await connection.execute(`
                UPDATE delivery_schedules_enhanced 
                SET delivery_address = REPLACE(delivery_address, 'National Capital Region', 'Metro Manila')
                WHERE delivery_address LIKE '%National Capital Region%'
            `);
            console.log(`✅ Updated ${deliveryAddressUpdate.affectedRows} delivery addresses`);
            
            // Check users table
            console.log('\n=== FIXING USERS TABLE ===');
            const [usersCheck] = await connection.execute(`
                SELECT COUNT(*) as count FROM users WHERE province = 'National Capital Region'
            `);
            
            if (usersCheck[0].count > 0) {
                const [usersUpdate] = await connection.execute(`
                    UPDATE users 
                    SET province = 'Metro Manila'
                    WHERE province = 'National Capital Region'
                `);
                console.log(`✅ Updated ${usersUpdate.affectedRows} users province to Metro Manila`);
            } else {
                console.log('✅ No users with National Capital Region found');
            }
            
            // Commit transaction
            await connection.commit();
            console.log('\n🎉 Successfully fixed Metro Manila geographical structure!');
            
            // Verification
            console.log('\n=== VERIFICATION ===');
            const [ordersVerify] = await connection.execute(`
                SELECT COUNT(*) as count FROM orders WHERE province = 'Metro Manila'
            `);
            console.log(`Orders with Metro Manila: ${ordersVerify[0].count}`);
            
            const [customOrdersVerify] = await connection.execute(`
                SELECT COUNT(*) as count FROM custom_orders WHERE province = 'Metro Manila'
            `);
            console.log(`Custom orders with Metro Manila: ${customOrdersVerify[0].count}`);
            
            const [deliveryVerify] = await connection.execute(`
                SELECT COUNT(*) as count FROM delivery_schedules_enhanced WHERE delivery_province = 'Metro Manila'
            `);
            console.log(`Delivery schedules with Metro Manila: ${deliveryVerify[0].count}`);
            
            // Check for any remaining "National Capital Region" entries
            const [ncrCheck] = await connection.execute(`
                SELECT COUNT(*) as count FROM orders WHERE province = 'National Capital Region' OR shipping_address LIKE '%National Capital Region%'
            `);
            console.log(`Remaining NCR entries in orders: ${ncrCheck[0].count}`);
            
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            await connection.end();
        }
        
    } catch (error) {
        console.error('❌ Error fixing Metro Manila structure:', error.message);
        process.exit(1);
    }
}

fixMetroManilaStructure();
