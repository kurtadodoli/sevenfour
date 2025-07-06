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

let lastOrderCount = 0;

async function monitorDeliveryOrderCreation() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        
        // Get current count of delivery orders
        const [orders] = await connection.execute(`
            SELECT COUNT(*) as count FROM orders 
            WHERE notes LIKE '%Reference: CUSTOM-%'
        `);
        
        const currentCount = orders[0].count;
        
        if (currentCount > lastOrderCount) {
            console.log('\n🚨 NEW DELIVERY ORDER DETECTED!');
            console.log('='.repeat(50));
            console.log('Timestamp:', new Date().toISOString());
            console.log('Previous count:', lastOrderCount);
            console.log('Current count:', currentCount);
            
            // Get the newest delivery orders
            const [newOrders] = await connection.execute(`
                SELECT 
                    order_number,
                    status,
                    total_amount,
                    notes,
                    created_at
                FROM orders 
                WHERE notes LIKE '%Reference: CUSTOM-%'
                ORDER BY created_at DESC
                LIMIT 3
            `);
            
            console.log('\nNewest delivery orders:');
            newOrders.forEach((order, index) => {
                console.log(`${index + 1}. ${order.order_number} (${order.status}) - ${order.created_at}`);
                console.log(`   Notes: ${order.notes}`);
            });
            
            // Check corresponding custom orders
            console.log('\nChecking custom order statuses...');
            const customOrderIds = [];
            newOrders.forEach(order => {
                const match = order.notes.match(/Reference: (CUSTOM-[A-Z0-9-]+)/);
                if (match) {
                    customOrderIds.push(match[1]);
                }
            });
            
            for (const customOrderId of customOrderIds) {
                const [customOrder] = await connection.execute(`
                    SELECT custom_order_id, status, payment_status, updated_at
                    FROM custom_orders 
                    WHERE custom_order_id = ?
                `, [customOrderId]);
                
                if (customOrder.length > 0) {
                    const order = customOrder[0];
                    console.log(`   📋 ${order.custom_order_id}: ${order.status} / ${order.payment_status} (updated: ${order.updated_at})`);
                    
                    if (order.status === 'approved' && order.payment_status === 'pending') {
                        console.log(`   🚨 PROBLEM: Delivery order created for approved order without payment!`);
                    }
                }
            }
            
            lastOrderCount = currentCount;
        } else if (currentCount < lastOrderCount) {
            console.log(`📉 Delivery order count decreased: ${lastOrderCount} → ${currentCount} (cleanup happened)`);
            lastOrderCount = currentCount;
        }
        
    } catch (error) {
        console.error('❌ Monitor error:', error.message);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

// Initialize
async function initialize() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        const [orders] = await connection.execute(`
            SELECT COUNT(*) as count FROM orders 
            WHERE notes LIKE '%Reference: CUSTOM-%'
        `);
        lastOrderCount = orders[0].count;
        console.log(`🔍 Monitoring started. Current delivery orders: ${lastOrderCount}`);
    } catch (error) {
        console.error('❌ Init error:', error.message);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

// Start monitoring
initialize().then(() => {
    console.log('👀 Watching for new delivery order creation...');
    console.log('   Press Ctrl+C to stop monitoring');
    
    setInterval(monitorDeliveryOrderCreation, 2000); // Check every 2 seconds
});

// Handle cleanup on exit
process.on('SIGINT', () => {
    console.log('\n👋 Monitoring stopped');
    process.exit(0);
});
