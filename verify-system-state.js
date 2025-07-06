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

async function verifySystemState() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Connected to database');
        
        console.log('\n📊 CURRENT SYSTEM STATE VERIFICATION:');
        console.log('='.repeat(60));
        
        // Check the H5DP7 order status
        const [customOrder] = await connection.execute(`
            SELECT 
                custom_order_id,
                customer_name,
                status,
                payment_status,
                created_at,
                updated_at
            FROM custom_orders 
            WHERE custom_order_id LIKE '%H5DP7%'
        `);
        
        if (customOrder.length > 0) {
            const order = customOrder[0];
            console.log(`🆔 H5DP7 Custom Order Status:`);
            console.log(`   ID: ${order.custom_order_id}`);
            console.log(`   Status: ${order.status}`);
            console.log(`   Payment Status: ${order.payment_status}`);
            console.log(`   Updated: ${order.updated_at}`);
            
            if (order.status === 'approved' && order.payment_status === 'pending') {
                console.log(`   ✅ CORRECT: Order is approved and waiting for payment`);
            } else {
                console.log(`   ⚠️  Status may need attention`);
            }
        }
        
        // Check if any delivery orders exist for H5DP7
        const [deliveryOrders] = await connection.execute(`
            SELECT order_number, created_at 
            FROM orders 
            WHERE notes LIKE '%H5DP7%'
        `);
        
        console.log(`\n🚚 H5DP7 Delivery Orders: ${deliveryOrders.length} found`);
        if (deliveryOrders.length === 0) {
            console.log(`   ✅ CORRECT: No delivery orders exist (as expected for approved order)`);
        } else {
            console.log(`   ⚠️  Found delivery orders that shouldn't exist:`);
            deliveryOrders.forEach(order => {
                console.log(`      - ${order.order_number} (${order.created_at})`);
            });
        }
        
        // Check overall system stats
        console.log('\n📈 OVERALL SYSTEM STATS:');
        console.log('='.repeat(40));
        
        const [stats] = await connection.execute(`
            SELECT 
                (SELECT COUNT(*) FROM custom_orders WHERE status = 'pending') as pending_designs,
                (SELECT COUNT(*) FROM custom_orders WHERE status = 'approved') as approved_designs,
                (SELECT COUNT(*) FROM custom_orders WHERE status = 'confirmed') as confirmed_orders,
                (SELECT COUNT(*) FROM custom_order_payments WHERE payment_status = 'submitted') as pending_payments,
                (SELECT COUNT(*) FROM orders WHERE notes LIKE '%Reference: CUSTOM-%') as delivery_orders
        `);
        
        const s = stats[0];
        console.log(`   Pending design requests: ${s.pending_designs}`);
        console.log(`   Approved designs (waiting for payment): ${s.approved_designs}`);
        console.log(`   Confirmed orders (with verified payment): ${s.confirmed_orders}`);
        console.log(`   Payments pending verification: ${s.pending_payments}`);
        console.log(`   Total delivery orders for custom orders: ${s.delivery_orders}`);
        
        // Verify the workflow integrity
        console.log('\n🔍 WORKFLOW INTEGRITY CHECK:');
        console.log('='.repeat(40));
        
        // Check for any approved orders that have delivery orders (which shouldn't exist)
        const [problematicOrders] = await connection.execute(`
            SELECT 
                co.custom_order_id,
                co.status,
                co.payment_status,
                o.order_number
            FROM custom_orders co
            JOIN orders o ON o.notes LIKE CONCAT('%Reference: ', co.custom_order_id, '%')
            WHERE co.status = 'approved' AND co.payment_status = 'pending'
        `);
        
        if (problematicOrders.length === 0) {
            console.log(`   ✅ INTEGRITY GOOD: No approved orders have delivery orders`);
        } else {
            console.log(`   🚨 INTEGRITY ISSUES: ${problematicOrders.length} approved order(s) have delivery orders:`);
            problematicOrders.forEach(order => {
                console.log(`      - ${order.custom_order_id} (approved) → ${order.order_number} (delivery)`);
            });
        }
        
        console.log('\n✅ SYSTEM VERIFICATION COMPLETE');
        console.log('   You can now test the approval workflow safely.');
        console.log('   The debugging and safety checks are in place.');
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

verifySystemState();
