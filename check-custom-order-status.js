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

async function checkCustomOrderStatus() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Connected to database');
        
        // Get all custom orders with their payment status
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
            GROUP BY co.custom_order_id
            ORDER BY co.created_at DESC
        `);
        
        console.log('\n📊 CUSTOM ORDER STATUS REPORT');
        console.log('='.repeat(50));
        
        let approvedCount = 0;
        let confirmedCount = 0;
        let confirmedWithoutPaymentProof = 0;
        let confirmedWithoutVerification = 0;
        
        customOrders.forEach(order => {
            console.log(`\n🆔 Order: ${order.custom_order_id}`);
            console.log(`   Customer: ${order.customer_name}`);
            console.log(`   Order Status: ${order.order_status}`);
            console.log(`   Payment Status: ${order.payment_status}`);
            console.log(`   Payment Count: ${order.payment_count}`);
            console.log(`   Latest Payment Status: ${order.latest_payment_status}`);
            console.log(`   Latest Verified At: ${order.latest_verified_at}`);
            console.log(`   Created: ${order.created_at}`);
            console.log(`   Updated: ${order.updated_at}`);
            
            if (order.order_status === 'approved') {
                approvedCount++;
                console.log(`   ✅ Status: CORRECT - Approved and waiting for payment`);
            } else if (order.order_status === 'confirmed') {
                confirmedCount++;
                if (order.payment_count === 0) {
                    confirmedWithoutPaymentProof++;
                    console.log(`   ⚠️  WARNING: Confirmed but NO payment proof submitted`);
                } else if (order.latest_payment_status !== 'verified') {
                    confirmedWithoutVerification++;
                    console.log(`   ⚠️  WARNING: Confirmed but payment NOT verified (${order.latest_payment_status})`);
                } else {
                    console.log(`   ✅ Status: CORRECT - Confirmed with verified payment`);
                }
            } else {
                console.log(`   📝 Status: ${order.order_status}`);
            }
        });
        
        console.log('\n📈 SUMMARY');
        console.log('='.repeat(30));
        console.log(`Total Custom Orders: ${customOrders.length}`);
        console.log(`Approved (awaiting payment): ${approvedCount}`);
        console.log(`Confirmed (should have verified payment): ${confirmedCount}`);
        console.log(`⚠️  Confirmed WITHOUT payment proof: ${confirmedWithoutPaymentProof}`);
        console.log(`⚠️  Confirmed WITHOUT payment verification: ${confirmedWithoutVerification}`);
        
        if (confirmedWithoutPaymentProof > 0 || confirmedWithoutVerification > 0) {
            console.log('\n🚨 ISSUES FOUND:');
            console.log('Some confirmed custom orders do not have proper payment verification.');
            console.log('These orders should be reverted to "approved" status until payment is verified.');
        } else {
            console.log('\n✅ ALL GOOD: All confirmed orders have proper payment verification.');
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

checkCustomOrderStatus();
