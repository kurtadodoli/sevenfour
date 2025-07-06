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

async function comprehensiveCleanup() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Connected to database');
        
        console.log('\n🧹 COMPREHENSIVE CLEANUP OF ERRONEOUS DELIVERY ORDERS:');
        console.log('='.repeat(70));
        
        // Find all approved orders that have delivery orders (but no payment verification)
        const [problematicOrders] = await connection.execute(`
            SELECT 
                co.custom_order_id,
                co.status,
                co.payment_status,
                o.id as order_id,
                o.order_number,
                o.invoice_id,
                o.created_at as delivery_created
            FROM custom_orders co
            JOIN orders o ON o.notes LIKE CONCAT('%Reference: ', co.custom_order_id, '%')
            LEFT JOIN custom_order_payments cop ON co.custom_order_id = cop.custom_order_id AND cop.payment_status = 'verified'
            WHERE co.status = 'approved' 
            AND co.payment_status = 'pending'
            AND cop.id IS NULL
            ORDER BY o.created_at DESC
        `);
        
        console.log(`Found ${problematicOrders.length} erroneous delivery orders to clean up:`);
        
        if (problematicOrders.length === 0) {
            console.log('✅ No cleanup needed - system integrity is good');
            return;
        }
        
        // Group by custom order ID to handle potential duplicates
        const ordersByCustomId = {};
        problematicOrders.forEach(order => {
            if (!ordersByCustomId[order.custom_order_id]) {
                ordersByCustomId[order.custom_order_id] = [];
            }
            ordersByCustomId[order.custom_order_id].push(order);
        });
        
        let totalOrdersToDelete = 0;
        let totalInvoicesToDelete = 0;
        let totalItemsToDelete = 0;
        
        // Preview what will be deleted
        console.log('\n📋 CLEANUP PREVIEW:');
        for (const [customOrderId, deliveryOrders] of Object.entries(ordersByCustomId)) {
            console.log(`\n🆔 ${customOrderId} (approved, pending payment):`);
            
            for (const order of deliveryOrders) {
                console.log(`   🗑️  Will delete delivery order: ${order.order_number}`);
                console.log(`      Created: ${order.delivery_created}`);
                console.log(`      Order ID: ${order.order_id}`);
                console.log(`      Invoice ID: ${order.invoice_id}`);
                
                totalOrdersToDelete++;
                if (order.invoice_id) totalInvoicesToDelete++;
                
                // Count order items
                const [itemCount] = await connection.execute(`
                    SELECT COUNT(*) as count FROM order_items WHERE order_id = ?
                `, [order.order_id]);
                
                totalItemsToDelete += itemCount[0].count;
                console.log(`      Order items: ${itemCount[0].count}`);
            }
        }
        
        console.log('\n📊 CLEANUP SUMMARY:');
        console.log(`   Delivery orders to delete: ${totalOrdersToDelete}`);
        console.log(`   Invoices to delete: ${totalInvoicesToDelete}`);
        console.log(`   Order items to delete: ${totalItemsToDelete}`);
        console.log(`   Custom orders affected: ${Object.keys(ordersByCustomId).length}`);
        
        console.log('\n⚠️  WARNING: This will clean up ALL erroneous delivery orders!');
        console.log('   Custom orders will remain intact and will be in correct "approved" state.');
        console.log('   Delivery orders will only be created after payment verification.');
        
        // Proceed with cleanup
        console.log('\n🧹 Starting comprehensive cleanup...');
        
        let deletedOrders = 0;
        let deletedInvoices = 0;
        let deletedItems = 0;
        
        for (const [customOrderId, deliveryOrders] of Object.entries(ordersByCustomId)) {
            console.log(`\n🔄 Processing ${customOrderId}...`);
            
            for (const order of deliveryOrders) {
                try {
                    // Delete order items first (foreign key constraint)
                    const [deletedItemsResult] = await connection.execute(`
                        DELETE FROM order_items WHERE order_id = ?
                    `, [order.order_id]);
                    
                    deletedItems += deletedItemsResult.affectedRows;
                    
                    // Delete invoice if exists
                    if (order.invoice_id) {
                        await connection.execute(`
                            DELETE FROM order_invoices WHERE invoice_id = ?
                        `, [order.invoice_id]);
                        deletedInvoices++;
                    }
                    
                    // Delete the delivery order
                    await connection.execute(`
                        DELETE FROM orders WHERE id = ?
                    `, [order.order_id]);
                    
                    deletedOrders++;
                    console.log(`   ✅ Deleted ${order.order_number}`);
                    
                } catch (error) {
                    console.error(`   ❌ Error deleting ${order.order_number}:`, error.message);
                }
            }
        }
        
        console.log('\n✅ COMPREHENSIVE CLEANUP COMPLETE!');
        console.log('='.repeat(50));
        console.log(`   ✅ Deleted delivery orders: ${deletedOrders}`);
        console.log(`   ✅ Deleted invoices: ${deletedInvoices}`);
        console.log(`   ✅ Deleted order items: ${deletedItems}`);
        console.log(`   ✅ Custom orders cleaned: ${Object.keys(ordersByCustomId).length}`);
        
        console.log('\n🎯 SYSTEM STATE AFTER CLEANUP:');
        console.log('   - All approved custom orders are now in correct state');
        console.log('   - No delivery orders exist for approved orders');
        console.log('   - Customers can submit payment proof for approved orders');
        console.log('   - Delivery orders will only be created after payment verification');
        console.log('   - The workflow integrity is restored');
        
    } catch (error) {
        console.error('❌ Error during comprehensive cleanup:', error);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

comprehensiveCleanup();
