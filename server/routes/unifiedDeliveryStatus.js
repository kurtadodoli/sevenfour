// Enhanced delivery status API endpoint that addresses all the root causes
const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const DeliveryStatusFixer = require('../services/deliveryStatusFixer');
const mysql = require('mysql2/promise');
const { dbConfig } = require('../config/db');

// Unified delivery status update endpoint
// This endpoint handles all order types and ensures database consistency
router.put('/orders/:orderId/status', auth, async (req, res) => {
    let connection;
    try {
        const { orderId } = req.params;
        const { delivery_status, order_type, delivery_notes } = req.body;
        
        console.log(`🚚 Unified Status Update Request:`, {
            orderId,
            delivery_status,
            order_type,
            user: req.user?.id,
            timestamp: new Date().toISOString()
        });
        
        // Validate required fields
        if (!delivery_status) {
            return res.status(400).json({
                success: false,
                message: 'delivery_status is required'
            });
        }
        
        // Validate status values
        const validStatuses = ['pending', 'scheduled', 'in_transit', 'delivered', 'delayed', 'cancelled'];
        if (!validStatuses.includes(delivery_status)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
            });
        }
        
        // Get order details - check multiple tables to find the order
        connection = await mysql.createConnection(dbConfig);
        
        let order = null;
        let orderTable = 'orders';
        
        // First try regular orders table
        const [regularOrderDetails] = await connection.execute(`
            SELECT 
                o.*,
                'regular' as determined_order_type
            FROM orders o
            WHERE o.id = ? OR o.order_number = ?
            LIMIT 1
        `, [orderId, orderId]);
        
        if (regularOrderDetails.length > 0) {
            order = regularOrderDetails[0];
            orderTable = 'orders';
        } else {
            // Try custom_orders table
            const [customOrderDetails] = await connection.execute(`
                SELECT 
                    co.*,
                    'custom_order' as determined_order_type
                FROM custom_orders co
                WHERE co.id = ? OR co.custom_order_id = ?
                LIMIT 1
            `, [orderId, orderId]);
            
            if (customOrderDetails.length > 0) {
                order = customOrderDetails[0];
                orderTable = 'custom_orders';
            } else {
                // Try custom_designs table
                const [customDesignDetails] = await connection.execute(`
                    SELECT 
                        cd.*,
                        'custom_design' as determined_order_type
                    FROM custom_designs cd
                    WHERE cd.id = ? OR cd.design_id = ?
                    LIMIT 1
                `, [orderId, orderId]);
                
                if (customDesignDetails.length > 0) {
                    order = customDesignDetails[0];
                    orderTable = 'custom_designs';
                }
            }
        }
        
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }
        
        const finalOrderType = order.determined_order_type || order_type || 'regular';
        
        console.log(`📦 Order Details:`, {
            id: order.id,
            order_number: order.order_number,
            current_status: order.delivery_status,
            determined_type: finalOrderType
        });
        
        // Check if user has permission to update this order
        if (req.user.role !== 'admin' && req.user.role !== 'staff') {
            // For customers, only allow viewing their own orders
            if (order.user_id !== req.user.id) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied. You can only update your own orders.'
                });
            }
            
            // Customers can only mark orders as delivered (for confirmation)
            if (delivery_status !== 'delivered') {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied. Only admin/staff can change order status to ' + delivery_status
                });
            }
        }
        
        // Validate status transitions
        const currentStatus = order.delivery_status || 'pending';
        const validTransitions = {
            'pending': ['scheduled', 'cancelled'],
            'scheduled': ['in_transit', 'delivered', 'delayed', 'cancelled'],
            'in_transit': ['delivered', 'delayed'],
            'delivered': [], // Final state
            'delayed': ['scheduled', 'cancelled'],
            'cancelled': [] // Final state
        };
        
        if (!validTransitions[currentStatus].includes(delivery_status) && delivery_status !== currentStatus) {
            console.warn(`⚠️ Invalid status transition from ${currentStatus} to ${delivery_status}`);
            // Allow the transition with a warning for admin/staff
            if (req.user.role !== 'admin' && req.user.role !== 'staff') {
                return res.status(400).json({
                    success: false,
                    message: `Invalid status transition from ${currentStatus} to ${delivery_status}`
                });
            }
        }
        
        // Use the delivery status fixer service for unified updates
        // SIMPLIFIED: Direct database update (like successful debug version)
        console.log(`💾 Updating order status directly...`);
        const safeDeliveryNotes = delivery_notes || `Status updated to ${delivery_status} via unified API on ${new Date().toISOString()}`;
        
        console.log(`📋 Update parameters:`, {
            delivery_status,
            safeDeliveryNotes,
            order_id: order.id,
            user_id: req.user?.id
        });
        
        // Update the appropriate table based on order type
        let updateResult;
        
        if (orderTable === 'orders') {
            updateResult = await connection.execute(`
                UPDATE orders 
                SET delivery_status = ?, 
                    delivery_notes = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `, [delivery_status, safeDeliveryNotes, order.id]);
        } else if (orderTable === 'custom_orders') {
            updateResult = await connection.execute(`
                UPDATE custom_orders 
                SET delivery_status = ?, 
                    delivery_notes = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `, [delivery_status, safeDeliveryNotes, order.id]);
        } else if (orderTable === 'custom_designs') {
            updateResult = await connection.execute(`
                UPDATE custom_designs 
                SET delivery_status = ?, 
                    delivery_notes = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `, [delivery_status, safeDeliveryNotes, order.id]);
        }
        
        console.log(`✅ ${orderTable} table update result:`, {
            affectedRows: updateResult[0].affectedRows,
            changedRows: updateResult[0].changedRows
        });
        
        // CRITICAL FIX: Update delivery schedules if they exist
        // This is the missing piece that was causing the data persistence issue
        const orderNumber = order.order_number || order.custom_order_id || order.design_id;
        
        try {
            const scheduleUpdateResult = await connection.execute(`
                UPDATE delivery_schedules_enhanced 
                SET delivery_status = ?, 
                    delivery_notes = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE order_id = ? OR order_number = ?
            `, [delivery_status, safeDeliveryNotes, order.id, orderNumber]);
            
            console.log(`📅 Schedule update result:`, {
                affectedRows: scheduleUpdateResult[0].affectedRows,
                changedRows: scheduleUpdateResult[0].changedRows
            });
            
            // If no delivery schedule exists but we're setting status to scheduled or beyond,
            // create a minimal delivery schedule entry
            if (scheduleUpdateResult[0].affectedRows === 0 && 
                ['scheduled', 'in_transit', 'delivered', 'delayed'].includes(delivery_status)) {
                
                console.log(`📅 Creating new delivery schedule entry for order ${orderNumber}`);
                await connection.execute(`
                    INSERT INTO delivery_schedules_enhanced 
                    (order_id, order_number, order_type, delivery_status, delivery_notes, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                `, [order.id, orderNumber, finalOrderType, delivery_status, safeDeliveryNotes]);
                
                console.log(`✅ Created new delivery schedule entry`);
            }
            
        } catch (scheduleError) {
            console.warn(`⚠️ Schedule update failed (may not exist):`, scheduleError.message);
            // Don't fail the whole operation if schedule update fails
        }
        
        // Create a simple result object
        const result = {
            success: true,
            message: `Order ${orderNumber} status updated to ${delivery_status} successfully`,
            orderId: order.id,
            newStatus: delivery_status,
            timestamp: new Date().toISOString()
        };
        
        // Close the connection before sending response
        await connection.end();
        connection = null;
        
        // Return success response
        res.json({
            success: true,
            message: result.message,
            data: {
                order_id: order.id,
                order_number: orderNumber,
                previous_status: currentStatus,
                new_status: delivery_status,
                order_type: finalOrderType,
                updated_at: result.timestamp,
                updated_by: req.user?.username || req.user?.email || 'Unknown User'
            }
        });
        
        console.log(`✅ Successfully updated order ${orderNumber} status to ${delivery_status}`);
        
    } catch (error) {
        console.error('❌ Error updating delivery status:', error);
        
        res.status(500).json({
            success: false,
            message: 'Failed to update delivery status',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    } finally {
        if (connection) {
            try {
                await connection.end();
            } catch (closeError) {
                console.error('Error closing connection:', closeError);
            }
        }
    }
});

// Check database consistency endpoint
router.get('/consistency-check', auth, async (req, res) => {
    try {
        // Only allow admin to check consistency
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin access required.'
            });
        }
        
        const result = await DeliveryStatusFixer.checkDatabaseConsistency();
        
        res.json({
            success: true,
            data: result
        });
        
    } catch (error) {
        console.error('Error checking database consistency:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to check database consistency',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// Get delivery status history for an order
router.get('/orders/:orderId/status-history', auth, async (req, res) => {
    let connection;
    try {
        const { orderId } = req.params;
        
        connection = await mysql.createConnection(dbConfig);
        
        const [history] = await connection.execute(`
            SELECT 
                dsh.*,
                u.username as changed_by_username
            FROM delivery_status_history dsh
            LEFT JOIN users u ON dsh.changed_by_user_id = u.id
            WHERE dsh.order_id = ?
            ORDER BY dsh.created_at DESC
        `, [orderId]);
        
        res.json({
            success: true,
            data: history
        });
        
    } catch (error) {
        console.error('Error fetching status history:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch status history'
        });
    } finally {
        if (connection) await connection.end();
    }
});

// Test endpoint to verify the API is working
router.get('/test', (req, res) => {
    res.json({
        success: true,
        message: 'Unified delivery status API is working',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
