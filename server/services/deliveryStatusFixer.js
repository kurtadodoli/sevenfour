// Comprehensive fix for delivery status update issues
// This file addresses the root causes of status updates not persisting

const mysql = require('mysql2/promise');
const { dbConfig } = require('../config/db');

class DeliveryStatusFixer {
    
    // 1. DATABASE SYNCHRONIZATION FIX
    static async syncOrderStatusAcrossTables(orderId, orderType, newStatus, deliveryNotes = null) {
        let connection;
        try {
            connection = await mysql.createConnection(dbConfig);
            await connection.beginTransaction();
            
            console.log(`🔄 Syncing status ${newStatus} for order ${orderId} of type ${orderType}`);
            
            // Update main orders table
            await connection.execute(`
                UPDATE orders 
                SET delivery_status = ?, updated_at = NOW()
                WHERE id = ? OR order_number = ?
            `, [newStatus, orderId, orderId]);
            
            // Update custom_orders table if applicable
            if (orderType === 'custom' || orderType === 'custom_order') {
                await connection.execute(`
                    UPDATE custom_orders 
                    SET delivery_status = ?, updated_at = NOW()
                    WHERE id = ? OR order_number = ?
                `, [newStatus, orderId, orderId]);
            }
            
            // Update custom_designs table if applicable
            if (orderType === 'custom_design') {
                await connection.execute(`
                    UPDATE custom_designs 
                    SET delivery_status = ?, updated_at = NOW()
                    WHERE id = ? OR order_number = ?
                `, [newStatus, orderId, orderId]);
            }
            
            // Update delivery_schedules_enhanced table
            await connection.execute(`
                UPDATE delivery_schedules_enhanced 
                SET delivery_status = ?, 
                    delivery_notes = COALESCE(?, delivery_notes),
                    updated_at = NOW()
                WHERE order_id = ?
            `, [newStatus, deliveryNotes, orderId]);
            
            // Update order_invoices table
            await connection.execute(`
                UPDATE order_invoices 
                SET invoice_status = CASE 
                    WHEN ? = 'delivered' THEN 'completed'
                    WHEN ? = 'cancelled' THEN 'cancelled'
                    ELSE invoice_status
                END,
                updated_at = NOW()
                WHERE invoice_id IN (
                    SELECT invoice_id FROM orders WHERE id = ? OR order_number = ?
                )
            `, [newStatus, newStatus, orderId, orderId]);
            
            await connection.commit();
            console.log(`✅ Successfully synced status across all tables for order ${orderId}`);
            
        } catch (error) {
            if (connection) await connection.rollback();
            console.error(`❌ Failed to sync status for order ${orderId}:`, error);
            throw error;
        } finally {
            if (connection) await connection.end();
        }
    }
    
    // 2. API ENDPOINT CONSOLIDATION
    static async updateDeliveryStatusUnified(orderId, orderType, newStatus, userId = null, deliveryNotes = null) {
        try {
            // First sync across all database tables
            await this.syncOrderStatusAcrossTables(orderId, orderType, newStatus, deliveryNotes);
            
            // Log the status change for audit
            await this.logStatusChange(orderId, newStatus, userId, deliveryNotes);
            
            // Handle special status logic
            if (newStatus === 'delivered') {
                await this.handleDeliveredStatus(orderId, orderType);
            } else if (newStatus === 'delayed') {
                await this.handleDelayedStatus(orderId, orderType);
            } else if (newStatus === 'cancelled') {
                await this.handleCancelledStatus(orderId, orderType);
            }
            
            return {
                success: true,
                message: `Order ${orderId} status updated to ${newStatus} successfully`,
                orderId,
                newStatus,
                timestamp: new Date().toISOString()
            };
            
        } catch (error) {
            console.error(`❌ Failed to update delivery status for order ${orderId}:`, error);
            throw error;
        }
    }
    
    // 3. AUDIT LOGGING
    static async logStatusChange(orderId, newStatus, userId, notes) {
        let connection;
        try {
            connection = await mysql.createConnection(dbConfig);
            
            await connection.execute(`
                INSERT INTO delivery_status_history 
                (order_id, previous_status, new_status, changed_by_user_id, status_notes, created_at)
                SELECT 
                    ?, 
                    COALESCE(delivery_status, 'pending'), 
                    ?, 
                    ?, 
                    ?, 
                    NOW()
                FROM orders WHERE id = ? OR order_number = ?
                LIMIT 1
            `, [orderId, newStatus, userId, notes, orderId, orderId]);
            
        } catch (error) {
            console.error('Failed to log status change:', error);
            // Don't throw - logging is non-critical
        } finally {
            if (connection) await connection.end();
        }
    }
    
    // 4. SPECIAL STATUS HANDLERS
    static async handleDeliveredStatus(orderId, orderType) {
        let connection;
        try {
            connection = await mysql.createConnection(dbConfig);
            
            const deliveryDate = new Date().toISOString().split('T')[0];
            const deliveryTime = new Date().toISOString();
            
            // Update delivery date and time
            await connection.execute(`
                UPDATE delivery_schedules_enhanced 
                SET delivered_at = ?, 
                    actual_delivery_time = ?,
                    calendar_color = '#28a745',
                    display_icon = '✅'
                WHERE order_id = ?
            `, [deliveryTime, deliveryTime, orderId]);
            
            // Update order payment status to completed for COD
            await connection.execute(`
                UPDATE sales_transactions 
                SET transaction_status = 'completed',
                    payment_date = NOW()
                WHERE invoice_id IN (
                    SELECT invoice_id FROM orders WHERE id = ? OR order_number = ?
                )
            `, [orderId, orderId]);
            
        } catch (error) {
            console.error('Failed to handle delivered status:', error);
        } finally {
            if (connection) await connection.end();
        }
    }
    
    static async handleDelayedStatus(orderId, orderType) {
        let connection;
        try {
            connection = await mysql.createConnection(dbConfig);
            
            // Clear scheduled dates for delayed orders
            await connection.execute(`
                UPDATE delivery_schedules_enhanced 
                SET delivery_status = 'delayed',
                    calendar_color = '#ffc107',
                    display_icon = '⚠️',
                    delivery_notes = CONCAT(COALESCE(delivery_notes, ''), ' | Delayed on ', NOW())
                WHERE order_id = ?
            `, [orderId]);
            
        } catch (error) {
            console.error('Failed to handle delayed status:', error);
        } finally {
            if (connection) await connection.end();
        }
    }
    
    static async handleCancelledStatus(orderId, orderType) {
        let connection;
        try {
            connection = await mysql.createConnection(dbConfig);
            
            // Update cancellation details
            await connection.execute(`
                UPDATE delivery_schedules_enhanced 
                SET delivery_status = 'cancelled',
                    calendar_color = '#dc3545',
                    display_icon = '❌',
                    delivery_notes = CONCAT(COALESCE(delivery_notes, ''), ' | Cancelled on ', NOW())
                WHERE order_id = ?
            `, [orderId]);
            
            // Cancel related transactions
            await connection.execute(`
                UPDATE sales_transactions 
                SET transaction_status = 'cancelled'
                WHERE invoice_id IN (
                    SELECT invoice_id FROM orders WHERE id = ? OR order_number = ?
                )
            `, [orderId, orderId]);
            
        } catch (error) {
            console.error('Failed to handle cancelled status:', error);
        } finally {
            if (connection) await connection.end();
        }
    }
    
    // 5. DATABASE CONSISTENCY CHECK
    static async checkDatabaseConsistency() {
        let connection;
        try {
            connection = await mysql.createConnection(dbConfig);
            
            console.log('🔍 Checking database consistency for delivery statuses...');
            
            // Check for mismatched statuses between tables
            const [mismatches] = await connection.execute(`
                SELECT 
                    o.id as order_id,
                    o.order_number,
                    o.delivery_status as orders_status,
                    ds.delivery_status as schedule_status,
                    co.delivery_status as custom_orders_status
                FROM orders o
                LEFT JOIN delivery_schedules_enhanced ds ON o.id = ds.order_id
                LEFT JOIN custom_orders co ON o.order_number = co.order_number
                WHERE (
                    (ds.delivery_status IS NOT NULL AND o.delivery_status != ds.delivery_status) OR
                    (co.delivery_status IS NOT NULL AND o.delivery_status != co.delivery_status)
                )
            `);
            
            if (mismatches.length > 0) {
                console.warn(`⚠️ Found ${mismatches.length} status mismatches:`, mismatches);
                return { consistent: false, mismatches };
            }
            
            console.log('✅ Database consistency check passed');
            return { consistent: true, mismatches: [] };
            
        } catch (error) {
            console.error('Database consistency check failed:', error);
            throw error;
        } finally {
            if (connection) await connection.end();
        }
    }
}

module.exports = DeliveryStatusFixer;
