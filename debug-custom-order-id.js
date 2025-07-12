const mysql = require('mysql2/promise');
const { dbConfig } = require('./server/config/db');

async function debugCustomOrderMapping() {
    console.log('=== DEBUGGING CUSTOM ORDER ID MAPPING ===');
    
    const connection = await mysql.createConnection(dbConfig);
    
    try {
        // Get the specific custom order that's causing issues
        const [customOrders] = await connection.execute(`
            SELECT custom_order_id, customer_email, status, delivery_status 
            FROM custom_orders 
            WHERE custom_order_id LIKE '%SNSHEW%'
        `);
        
        console.log('📋 Found custom orders with SNSHEW:');
        customOrders.forEach((order, index) => {
            console.log(`${index + 1}. Full ID: "${order.custom_order_id}"`);
            console.log(`   Email: ${order.customer_email}`);
            console.log(`   Status: ${order.status}`);
            console.log(`   Delivery: ${order.delivery_status}`);
            
            // Show what the frontend would extract
            const extractedId = order.custom_order_id; // This is what should be passed to API
            console.log(`   Would use for API: "${extractedId}"`);
            console.log('   API endpoint would be: /api/custom-orders/' + extractedId + '/mark-received');
            console.log('');
        });
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await connection.end();
    }
}

debugCustomOrderMapping();
