const mysql = require('mysql2/promise');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, 'server', '.env') });

// Database configuration
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'seven_four_clothing'
};

async function findSpecificOrder() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Connected to database');
        
        // Search for order with similar ID pattern
        const [customOrders] = await connection.execute(`
            SELECT 
                co.custom_order_id,
                co.customer_name,
                co.status as order_status,
                co.payment_status,
                co.created_at,
                co.updated_at,
                COUNT(cop.id) as payment_count,
                MAX(cop.payment_status) as latest_payment_status,
                MAX(cop.verified_at) as latest_verified_at
            FROM custom_orders co
            LEFT JOIN custom_order_payments cop ON co.custom_order_id = cop.custom_order_id
            WHERE co.custom_order_id LIKE '%YETGF%' OR co.custom_order_id LIKE '%1279%'
            GROUP BY co.custom_order_id
        `);
        
        console.log('🔍 SEARCHING FOR ORDER SIMILAR TO: CUSTOM-5Y-YETGF-1279');
        console.log('='.repeat(60));
        
        if (customOrders.length === 0) {
            console.log('❌ No orders found matching the pattern');
            
            // Let's also check delivery orders that might reference this custom order
            console.log('\n🚚 Checking delivery orders for any references...');
            const [deliveryOrders] = await connection.execute(`
                SELECT 
                    order_number,
                    status,
                    total_amount,
                    notes,
                    created_at
                FROM orders 
                WHERE notes LIKE '%YETGF%' OR notes LIKE '%1279%' OR order_number LIKE '%YETGF%'
                ORDER BY created_at DESC
            `);
            
            if (deliveryOrders.length > 0) {
                console.log(`Found ${deliveryOrders.length} delivery orders with similar references:`);
                deliveryOrders.forEach(order => {
                    console.log(`   🚚 Order: ${order.order_number}`);
                    console.log(`      Status: ${order.status}`);
                    console.log(`      Amount: ${order.total_amount}`);
                    console.log(`      Notes: ${order.notes}`);
                    console.log(`      Created: ${order.created_at}`);
                    console.log('');
                });
            } else {
                console.log('   No delivery orders found');
            }
        } else {
            customOrders.forEach(order => {
                console.log(`\n🆔 Found Order: ${order.custom_order_id}`);
                console.log(`   Customer: ${order.customer_name}`);
                console.log(`   Order Status: ${order.order_status}`);
                console.log(`   Payment Status: ${order.payment_status}`);
                console.log(`   Payment Count: ${order.payment_count}`);
                console.log(`   Latest Payment Status: ${order.latest_payment_status}`);
                console.log(`   Latest Verified At: ${order.latest_verified_at}`);
                console.log(`   Created: ${order.created_at}`);
                console.log(`   Updated: ${order.updated_at}`);
                
                if (order.order_status === 'confirmed' && order.latest_payment_status === 'verified') {
                    console.log(`   ✅ Status: CORRECT - This order should show delivery tracking`);
                } else if (order.order_status === 'approved') {
                    console.log(`   ✅ Status: CORRECT - This order should NOT show delivery tracking yet`);
                } else {
                    console.log(`   ⚠️  Status: ${order.order_status} - Check if this is correct`);
                }
            });
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

findSpecificOrder();
