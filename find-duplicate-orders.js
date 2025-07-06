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

async function findDuplicateOrders() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Connected to database');
        
        console.log('\n🔍 SEARCHING FOR DUPLICATE ORDERS WITH H5DP7 PATTERN:');
        console.log('='.repeat(60));
        
        // Search for orders with H5DP7 pattern
        const [customOrders] = await connection.execute(`
            SELECT 
                co.custom_order_id,
                co.customer_name,
                co.status,
                co.payment_status,
                co.created_at,
                co.updated_at,
                co.user_id,
                co.product_type,
                co.estimated_price
            FROM custom_orders co
            WHERE co.custom_order_id LIKE '%H5DP7%'
            ORDER BY co.created_at ASC
        `);
        
        console.log(`Found ${customOrders.length} custom orders with H5DP7:`);
        customOrders.forEach((order, index) => {
            console.log(`\n${index + 1}. 🆔 ${order.custom_order_id}`);
            console.log(`   Customer: ${order.customer_name}`);
            console.log(`   User ID: ${order.user_id}`);
            console.log(`   Status: ${order.status}`);
            console.log(`   Payment Status: ${order.payment_status}`);
            console.log(`   Product: ${order.product_type}`);
            console.log(`   Price: ${order.estimated_price}`);
            console.log(`   Created: ${order.created_at}`);
            console.log(`   Updated: ${order.updated_at}`);
        });
        
        // Also check delivery orders that might reference these custom orders
        console.log('\n🚚 CHECKING DELIVERY ORDERS FOR H5DP7 REFERENCES:');
        console.log('='.repeat(60));
        
        const [deliveryOrders] = await connection.execute(`
            SELECT 
                id,
                order_number,
                user_id,
                status,
                total_amount,
                notes,
                created_at,
                updated_at
            FROM orders 
            WHERE notes LIKE '%H5DP7%' OR order_number LIKE '%H5DP7%'
            ORDER BY created_at ASC
        `);
        
        console.log(`Found ${deliveryOrders.length} delivery orders with H5DP7:`);
        deliveryOrders.forEach((order, index) => {
            console.log(`\n${index + 1}. 🚚 ${order.order_number}`);
            console.log(`   User ID: ${order.user_id}`);
            console.log(`   Status: ${order.status}`);
            console.log(`   Amount: ${order.total_amount}`);
            console.log(`   Notes: ${order.notes}`);
            console.log(`   Created: ${order.created_at}`);
            console.log(`   Updated: ${order.updated_at}`);
        });
        
        // Check for payments
        console.log('\n💰 CHECKING PAYMENTS FOR H5DP7 REFERENCES:');
        console.log('='.repeat(60));
        
        const [payments] = await connection.execute(`
            SELECT 
                id,
                custom_order_id,
                user_id,
                full_name,
                payment_amount,
                payment_status,
                created_at,
                verified_at
            FROM custom_order_payments 
            WHERE custom_order_id LIKE '%H5DP7%'
            ORDER BY created_at ASC
        `);
        
        console.log(`Found ${payments.length} payments with H5DP7:`);
        payments.forEach((payment, index) => {
            console.log(`\n${index + 1}. 💰 Payment ID: ${payment.id}`);
            console.log(`   Custom Order ID: ${payment.custom_order_id}`);
            console.log(`   User ID: ${payment.user_id}`);
            console.log(`   Full Name: ${payment.full_name}`);
            console.log(`   Amount: ${payment.payment_amount}`);
            console.log(`   Status: ${payment.payment_status}`);
            console.log(`   Created: ${payment.created_at}`);
            console.log(`   Verified: ${payment.verified_at}`);
        });
        
        console.log('\n🔍 ANALYSIS:');
        console.log('='.repeat(30));
        if (customOrders.length > 1) {
            console.log(`⚠️  DUPLICATE ISSUE CONFIRMED: ${customOrders.length} custom orders found with similar IDs`);
            console.log('   This suggests duplicate order creation during approval process');
            console.log('   The approval logic needs to be fixed to prevent creating new orders');
        } else {
            console.log('✅ No duplicate custom orders found');
        }
        
        if (deliveryOrders.length > 1) {
            console.log(`⚠️  MULTIPLE DELIVERY ORDERS: ${deliveryOrders.length} delivery orders reference the same custom order`);
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

findDuplicateOrders();
