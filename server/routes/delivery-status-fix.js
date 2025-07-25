// Complete delivery status fix - backend route
const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const { auth } = require('../middleware/auth'); // Add authentication
const DeliveryController = require('../controllers/deliveryControllerEnhanced');

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'seven_four_clothing',
  port: process.env.DB_PORT || 3306
};

// Middleware to log all requests
router.use((req, res, next) => {
  console.log(`🔧 [DELIVERY-STATUS-FIX] ${req.method} ${req.originalUrl}`);
  console.log(`📦 Body:`, req.body);
  console.log(`👤 User:`, req.user?.id);
  next();
});

// PUT endpoint that finds delivery schedule by order ID and updates using proper controller logic
router.put('/orders/:orderId/status', async (req, res) => {
  let connection;
  
  try {
    const { orderId } = req.params;
    const { delivery_status, delivery_notes, order_type } = req.body;
    
    console.log(`🚚 [DELIVERY-STATUS-FIX] Finding delivery schedule for order ${orderId} to update status to ${delivery_status}`);
    
    // Validate input
    if (!delivery_status) {
      return res.status(400).json({
        success: false,
        message: 'delivery_status is required'
      });
    }
    
    // Create database connection
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connection established');
    
    // Find the delivery schedule for this order (most recent one)
    let deliverySchedule = null;
    
    console.log(`🔍 Looking for delivery schedule for order ${orderId} with type ${order_type}`);
    
    // Search for delivery schedule by order_id and order_type
    const [schedules] = await connection.execute(`
      SELECT * FROM delivery_schedules_enhanced 
      WHERE order_id = ? AND order_type = ?
      ORDER BY created_at DESC
      LIMIT 1
    `, [orderId, order_type || 'regular']);
    
    if (schedules.length > 0) {
      deliverySchedule = schedules[0];
      console.log(`✅ Found delivery schedule: ${deliverySchedule.id} for order ${orderId}`);
    } else {
      console.log(`❌ No delivery schedule found for order ${orderId} with type ${order_type}`);
      return res.status(404).json({
        success: false,
        message: 'Delivery schedule not found for this order. Please schedule delivery first.'
      });
    }
    
    const previousStatus = deliverySchedule.delivery_status;
    
    // Helper function to get status color (same as controller)
    function getStatusColor(status) {
      const colors = {
        'pending': '#ffc107',
        'scheduled': '#007bff',
        'in_transit': '#000000',
        'delivered': '#28a745',
        'delayed': '#dc3545',
        'cancelled': '#6c757d',
        'failed': '#e74c3c'
      };
      return colors[status] || '#6c757d';
    }
    
    // Helper function to get status icon (same as controller)
    function getStatusIcon(status) {
      const icons = {
        'pending': '⏳',
        'scheduled': '📅',
        'in_transit': '🚚',
        'delivered': '✅',
        'delayed': '⚠️',
        'cancelled': '❌',
        'failed': '💥'
      };
      return icons[status] || '📦';
    }
    
    // Prepare update fields with proper timestamps
    const updateFields = {
      delivery_status,
      delivery_notes,
      calendar_color: getStatusColor(delivery_status),
      display_icon: getStatusIcon(delivery_status),
      delivered_at: null,
      dispatched_at: null
    };
    
    if (delivery_status === 'delivered') {
      updateFields.delivered_at = new Date();
    } else if (delivery_status === 'in_transit') {
      updateFields.dispatched_at = new Date();
    }
    
    // 1. First update the delivery_schedules_enhanced table (primary table)
    await connection.execute(`
      UPDATE delivery_schedules_enhanced 
      SET delivery_status = ?, delivery_notes = ?, calendar_color = ?, display_icon = ?,
          delivered_at = ?, dispatched_at = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      delivery_status,
      delivery_notes,
      updateFields.calendar_color,
      updateFields.display_icon,
      updateFields.delivered_at,
      updateFields.dispatched_at,
      deliverySchedule.id
    ]);
    
    console.log(`✅ Updated delivery_schedules_enhanced table for schedule ID ${deliverySchedule.id}`);
    
    // 2. Then update the source order table based on order_type (same logic as controller)
    if (deliverySchedule.order_type === 'regular') {
      await connection.execute(`
        UPDATE orders 
        SET delivery_status = ?, delivery_notes = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [delivery_status, delivery_notes, deliverySchedule.order_id]);
      console.log(`✅ Updated orders table for order ID ${deliverySchedule.order_id}`);
    } else if (deliverySchedule.order_type === 'custom_design') {
      await connection.execute(`
        UPDATE custom_designs 
        SET delivery_status = ?, delivery_notes = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [delivery_status, delivery_notes, deliverySchedule.order_id]);
      console.log(`✅ Updated custom_designs table for order ID ${deliverySchedule.order_id}`);
    } else if (deliverySchedule.order_type === 'custom_order') {
      await connection.execute(`
        UPDATE custom_orders 
        SET delivery_status = ?, delivery_notes = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [delivery_status, delivery_notes, deliverySchedule.order_id]);
      console.log(`✅ Updated custom_orders table for order ID ${deliverySchedule.order_id}`);
    }
    
    // 3. Log the status change (optional but good for audit trail)
    try {
      await connection.execute(`
        INSERT INTO delivery_status_history (
          delivery_schedule_id, order_id, previous_status, new_status, 
          status_notes, changed_by_user_id, changed_by_name, location_address
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        deliverySchedule.id, 
        deliverySchedule.order_id, 
        previousStatus, 
        delivery_status, 
        delivery_notes, 
        req.user?.id || null, 
        req.user?.username || 'System', 
        null
      ]);
      console.log(`✅ Logged status change in delivery_status_history`);
    } catch (historyError) {
      console.log(`⚠️ Could not log status change: ${historyError.message}`);
    }
    
    // Success response
    res.json({
      success: true,
      message: `Delivery status updated successfully`,
      data: {
        delivery_schedule_id: deliverySchedule.id,
        order_id: deliverySchedule.order_id,
        order_number: deliverySchedule.order_number,
        previous_status: previousStatus,
        new_status: delivery_status,
        updated_at: new Date()
      }
    });
    
    console.log(`✅ [DELIVERY-STATUS-FIX] Successfully updated order ${deliverySchedule.order_number} from ${previousStatus} to ${delivery_status}`);
    
  } catch (error) {
    console.error('❌ [DELIVERY-STATUS-FIX] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Database error occurred',
      error: error.message
    });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
});

module.exports = router;
