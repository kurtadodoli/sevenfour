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

async function traceOrderCreationTimeline() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Connected to database');
        
        console.log('\n📋 DETAILED TIMELINE FOR H5DP7 ORDER:');
        console.log('='.repeat(60));
        
        // Get custom order details
        const [customOrder] = await connection.execute(`
            SELECT 
                custom_order_id,
                customer_name,
                status,
                payment_status,
                created_at,
                updated_at,
                admin_notes
            FROM custom_orders 
            WHERE custom_order_id LIKE '%H5DP7%'
        `);
        
        if (customOrder.length > 0) {
            const order = customOrder[0];
            console.log(`🆔 Custom Order: ${order.custom_order_id}`);
            console.log(`   Status: ${order.status}`);
            console.log(`   Payment Status: ${order.payment_status}`);
            console.log(`   Created: ${order.created_at}`);
            console.log(`   Updated: ${order.updated_at}`);
            console.log(`   Admin Notes: ${order.admin_notes || 'None'}`);
            console.log(`   Time Diff: ${new Date(order.updated_at) - new Date(order.created_at)} ms`);
        }
        
        // Get delivery order details
        const [deliveryOrder] = await connection.execute(`
            SELECT 
                order_number,
                status,
                total_amount,
                notes,
                created_at,
                updated_at
            FROM orders 
            WHERE notes LIKE '%H5DP7%'
        `);
        
        if (deliveryOrder.length > 0) {
            const order = deliveryOrder[0];
            console.log(`\n🚚 Delivery Order: ${order.order_number}`);
            console.log(`   Status: ${order.status}`);
            console.log(`   Amount: ${order.total_amount}`);
            console.log(`   Created: ${order.created_at}`);
            console.log(`   Updated: ${order.updated_at}`);
            console.log(`   Notes: ${order.notes}`);
        }
        
        // Check for payments
        const [payments] = await connection.execute(`
            SELECT 
                id,
                custom_order_id,
                payment_status,
                created_at,
                verified_at,
                verified_by
            FROM custom_order_payments 
            WHERE custom_order_id LIKE '%H5DP7%'
        `);
        
        console.log(`\n💰 Payments: ${payments.length} found`);
        payments.forEach(payment => {
            console.log(`   Payment ID: ${payment.id}`);
            console.log(`   Status: ${payment.payment_status}`);
            console.log(`   Created: ${payment.created_at}`);
            console.log(`   Verified: ${payment.verified_at}`);
            console.log(`   Verified By: ${payment.verified_by}`);
        });
        
        console.log('\n🔍 ANALYSIS:');
        console.log('='.repeat(30));
        
        if (customOrder.length > 0 && deliveryOrder.length > 0) {
            const customCreated = new Date(customOrder[0].updated_at);
            const deliveryCreated = new Date(deliveryOrder[0].created_at);
            const timeDiff = deliveryCreated - customCreated;
            
            console.log(`⏱️  Time between custom order update and delivery order creation: ${timeDiff} ms`);
            
            if (timeDiff < 2000) { // Less than 2 seconds
                console.log(`⚠️  SUSPICIOUS: Delivery order created too quickly after approval!`);
                console.log(`   This suggests automatic order creation during approval.`);
                console.log(`   The delivery order should only be created after payment verification.`);
            }
            
            if (payments.length === 0) {
                console.log(`🚨 PROBLEM CONFIRMED: Delivery order exists but NO payment submitted!`);
                console.log(`   This proves the delivery order was created during approval, not payment verification.`);
            }
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

traceOrderCreationTimeline();
