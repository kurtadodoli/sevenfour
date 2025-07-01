// Debug version of unified delivery status API for troubleshooting
const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const { dbConfig } = require('../config/db');

// Debug endpoint without authentication for testing
router.put('/debug/orders/:orderId/status', async (req, res) => {
    let connection;
    try {
        const { orderId } = req.params;
        const { delivery_status, order_type, delivery_notes } = req.body;
        
        console.log(`🚚 DEBUG Status Update Request:`, {
            orderId,
            delivery_status,
            order_type,
            timestamp: new Date().toISOString()
        });
        
        // Validate required fields
        if (!delivery_status) {
            return res.status(400).json({
                success: false,
                message: 'delivery_status is required',
                debug: { orderId, body: req.body }
            });
        }
        
        // Validate status values
        const validStatuses = ['pending', 'scheduled', 'in_transit', 'delivered', 'delayed', 'cancelled'];
        if (!validStatuses.includes(delivery_status)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
                debug: { received_status: delivery_status, valid_statuses: validStatuses }
            });
        }
        
        // Get order details to determine correct type if not provided
        console.log(`🔍 Connecting to database...`);
        connection = await mysql.createConnection(dbConfig);
        console.log(`✅ Database connected`);
        
        console.log(`📋 Looking up order with ID: ${orderId}`);
        const [orderDetails] = await connection.execute(`
            SELECT 
                o.*,
                co.id as custom_order_id,
                cd.id as custom_design_id,
                CASE 
                    WHEN co.id IS NOT NULL THEN 'custom_order'
                    WHEN cd.id IS NOT NULL THEN 'custom_design'
                    ELSE 'regular'
                END as determined_order_type
            FROM orders o
            LEFT JOIN custom_orders co ON o.order_number = co.custom_order_id
            LEFT JOIN custom_designs cd ON o.order_number = cd.design_id
            WHERE o.id = ? OR o.order_number = ?
            LIMIT 1
        `, [orderId, orderId]);
        
        console.log(`📊 Order lookup result:`, {
            found: orderDetails.length > 0,
            count: orderDetails.length
        });
        
        if (orderDetails.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Order not found',
                debug: { searched_id: orderId, query_result: orderDetails }
            });
        }
        
        const order = orderDetails[0];
        const finalOrderType = order_type || order.determined_order_type || 'regular';
        
        console.log(`📦 Order Details:`, {
            id: order.id,
            order_number: order.order_number,
            current_status: order.delivery_status,
            determined_type: finalOrderType
        });
        
        // Simple status update for debugging
        console.log(`💾 Updating order status...`);
        const safeDeliveryNotes = delivery_notes || `Status updated to ${delivery_status} on ${new Date().toISOString()}`;
        
        console.log(`📋 Update parameters:`, {
            delivery_status,
            safeDeliveryNotes,
            order_id: order.id
        });
        
        const updateResult = await connection.execute(`
            UPDATE orders 
            SET delivery_status = ?, 
                delivery_notes = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `, [delivery_status, safeDeliveryNotes, order.id]);
        
        console.log(`✅ Update result:`, {
            affectedRows: updateResult[0].affectedRows,
            changedRows: updateResult[0].changedRows
        });
        
        // Also try to update delivery schedules if they exist
        try {
            const scheduleUpdateResult = await connection.execute(`
                UPDATE delivery_schedules_enhanced 
                SET delivery_status = ?, 
                    status = ?,
                    delivery_notes = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE order_id = ? OR order_number = ?
            `, [delivery_status, delivery_status, safeDeliveryNotes, order.id, order.order_number]);
            
            console.log(`📅 Schedule update result:`, {
                affectedRows: scheduleUpdateResult[0].affectedRows,
                changedRows: scheduleUpdateResult[0].changedRows
            });
        } catch (scheduleError) {
            console.warn(`⚠️ Schedule update failed (may not exist):`, scheduleError.message);
        }
        
        // Log to audit table
        try {
            await connection.execute(`
                INSERT INTO delivery_status_history 
                (order_id, previous_status, new_status, status_notes, changed_by_name) 
                VALUES (?, ?, ?, ?, ?)
            `, [order.id, order.delivery_status, delivery_status, safeDeliveryNotes, 'DEBUG_USER']);
            console.log(`📝 Audit log created`);
        } catch (auditError) {
            console.warn(`⚠️ Audit logging failed:`, auditError.message);
        }
        
        // Close the connection before sending response
        await connection.end();
        connection = null;
        
        // Return success response
        const response = {
            success: true,
            message: `Order ${order.order_number} status updated to ${delivery_status}`,
            data: {
                order_id: order.id,
                order_number: order.order_number,
                previous_status: order.delivery_status,
                new_status: delivery_status,
                order_type: finalOrderType,
                updated_at: new Date().toISOString()
            },
            debug: {
                database_update: updateResult[0],
                order_found: true,
                connection_successful: true
            }
        };
        
        console.log(`✅ Sending success response:`, response);
        res.json(response);
        
    } catch (error) {
        console.error('❌ DEBUG: Error updating delivery status:', error);
        console.error('❌ DEBUG: Error stack:', error.stack);
        
        const errorResponse = {
            success: false,
            message: 'Failed to update delivery status',
            error: error.message,
            debug: {
                error_type: error.constructor.name,
                error_code: error.code,
                sql_state: error.sqlState,
                error_stack: error.stack
            }
        };
        
        console.log(`❌ Sending error response:`, errorResponse);
        res.status(500).json(errorResponse);
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

module.exports = router;
