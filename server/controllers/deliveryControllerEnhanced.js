// Enhanced Delivery Controller for DeliveryPage.js
// This controller handles all delivery management operations with the new database schema

const mysql = require('mysql2/promise');
const { dbConfig } = require('../config/db');

class DeliveryController {
  
  // =============================================
  // CALENDAR MANAGEMENT
  // =============================================
  
  /**
   * Get calendar data for a specific month with delivery schedules
   */
  static async getCalendarData(req, res) {
    let connection;
    try {
      const { year, month } = req.query;
      const startDate = `${year}-${month.padStart(2, '0')}-01`;
      const endDate = `${year}-${(parseInt(month) + 1).toString().padStart(2, '0')}-01`;
      
      connection = await mysql.createConnection(dbConfig);
      
      // Get calendar entries for the month
      const [calendarData] = await connection.execute(`
        SELECT 
          dc.*,
          COUNT(ds.id) as scheduled_deliveries
        FROM delivery_calendar dc
        LEFT JOIN delivery_schedules_enhanced ds ON dc.calendar_date = ds.delivery_date
        WHERE dc.calendar_date >= ? AND dc.calendar_date < ?
        GROUP BY dc.id, dc.calendar_date
        ORDER BY dc.calendar_date
      `, [startDate, endDate]);
      
      // Get detailed delivery schedules for the month
      const [deliverySchedules] = await connection.execute(`
        SELECT 
          ds.*,
          c.name as courier_name,
          c.phone_number as courier_phone,
          c.vehicle_type
        FROM delivery_schedules_enhanced ds
        LEFT JOIN couriers c ON ds.courier_id = c.id
        WHERE ds.delivery_date >= ? AND ds.delivery_date < ?
        ORDER BY ds.delivery_date, ds.delivery_time_slot
      `, [startDate, endDate]);
      
      // Group schedules by date
      const schedulesByDate = {};
      deliverySchedules.forEach(schedule => {
        const dateKey = schedule.delivery_date.toISOString().split('T')[0];
        if (!schedulesByDate[dateKey]) {
          schedulesByDate[dateKey] = [];
        }
        schedulesByDate[dateKey].push(schedule);
      });
      
      // Combine calendar data with schedules
      const calendarWithSchedules = calendarData.map(day => ({
        ...day,
        deliveries: schedulesByDate[day.calendar_date.toISOString().split('T')[0]] || []
      }));
      
      res.json({
        success: true,
        data: {
          calendar: calendarWithSchedules,
          summary: {
            totalDays: calendarData.length,
            totalDeliveries: deliverySchedules.length,
            availableDays: calendarData.filter(d => d.is_available).length
          }
        }
      });
      
    } catch (error) {
      console.error('Error fetching calendar data:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch calendar data',
        error: error.message
      });
    } finally {
      if (connection) await connection.end();
    }
  }
  
  /**
   * Update calendar day availability
   */
  static async updateCalendarDay(req, res) {
    let connection;
    try {
      const { date } = req.params;
      const { is_available, special_notes, max_deliveries } = req.body;
      
      connection = await mysql.createConnection(dbConfig);
      
      await connection.execute(`
        INSERT INTO delivery_calendar (calendar_date, is_available, special_notes, max_deliveries)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
        is_available = VALUES(is_available),
        special_notes = VALUES(special_notes),
        max_deliveries = VALUES(max_deliveries),
        updated_at = CURRENT_TIMESTAMP
      `, [date, is_available, special_notes, max_deliveries]);
      
      res.json({
        success: true,
        message: 'Calendar day updated successfully'
      });
      
    } catch (error) {
      console.error('Error updating calendar day:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update calendar day',
        error: error.message
      });
    } finally {
      if (connection) await connection.end();
    }
  }
  
  // =============================================
  // ORDER MANAGEMENT FOR DELIVERY
  // =============================================
  
  /**
   * Get all orders available for delivery scheduling
   */
  static async getOrdersForDelivery(req, res) {
    let connection;
    try {
      connection = await mysql.createConnection(dbConfig);
      
      // Get regular orders from orders table
      const [regularOrders] = await connection.execute(`
        SELECT 
          o.id,
          o.order_number,
          o.customer_name,
          o.customer_email,
          o.customer_phone,
          o.total_amount,
          o.status,
          o.order_date,
          o.shipping_address,
          o.shipping_city,
          o.shipping_province,
          o.shipping_postal_code,
          o.shipping_phone,
          o.shipping_notes,
          'regular' as order_type,
          ds.delivery_status,
          ds.delivery_date as scheduled_delivery_date,
          ds.delivery_time_slot as scheduled_delivery_time,
          ds.delivery_notes,
          ds.id as delivery_schedule_id,
          c.name as courier_name,
          c.phone_number as courier_phone
        FROM orders o
        LEFT JOIN delivery_schedules_enhanced ds ON o.id = ds.order_id AND ds.order_type = 'regular'
        LEFT JOIN couriers c ON ds.courier_id = c.id
        WHERE o.status IN ('confirmed', 'processing')
        ORDER BY o.order_date DESC
      `);
      
      // Get custom designs approved for delivery
      const [customDesigns] = await connection.execute(`
        SELECT 
          CONCAT('custom-design-', cd.id) as id,
          cd.design_id as order_number,
          cd.customer_name,
          cd.customer_email,
          cd.customer_phone,
          cd.final_price as total_amount,
          cd.status,
          cd.created_at as order_date,
          cd.shipping_address,
          cd.shipping_city,
          cd.shipping_province,
          cd.shipping_postal_code,
          cd.shipping_phone,
          cd.shipping_notes,
          'custom_design' as order_type,
          cd.delivery_status,
          cd.delivery_date as scheduled_delivery_date,
          ds.delivery_time_slot as scheduled_delivery_time,
          ds.delivery_notes,
          ds.id as delivery_schedule_id,
          c.name as courier_name,
          c.phone_number as courier_phone
        FROM custom_designs cd
        LEFT JOIN delivery_schedules_enhanced ds ON cd.id = ds.order_id AND ds.order_type = 'custom_design'
        LEFT JOIN couriers c ON ds.courier_id = c.id
        WHERE cd.status = 'approved'
        ORDER BY cd.created_at DESC
      `);
      
      // Get custom orders approved for delivery
      const [customOrders] = await connection.execute(`
        SELECT 
          CONCAT('custom-order-', co.id) as id,
          co.custom_order_id as order_number,
          co.customer_name,
          co.customer_email,
          co.customer_phone,
          co.final_price as total_amount,
          co.status,
          co.created_at as order_date,
          co.shipping_address,
          co.shipping_city,
          co.shipping_province,
          co.shipping_postal_code,
          co.shipping_phone,
          co.shipping_notes,
          'custom_order' as order_type,
          co.delivery_status,
          co.delivery_date as scheduled_delivery_date,
          ds.delivery_time_slot as scheduled_delivery_time,
          ds.delivery_notes,
          ds.id as delivery_schedule_id,
          c.name as courier_name,
          c.phone_number as courier_phone
        FROM custom_orders co
        LEFT JOIN delivery_schedules_enhanced ds ON co.id = ds.order_id AND ds.order_type = 'custom_order'
        LEFT JOIN couriers c ON ds.courier_id = c.id
        WHERE co.status = 'approved'
        ORDER BY co.created_at DESC
      `);
      
      // Combine all orders
      const allOrders = [...regularOrders, ...customDesigns, ...customOrders];
      
      // Get order items for each order
      for (let order of allOrders) {
        if (order.order_type === 'regular') {
          const [items] = await connection.execute(`
            SELECT 
              oi.*,
              p.productname,
              p.productdescription,
              p.productcolor,
              p.product_type,
              p.productimage
            FROM order_items oi
            LEFT JOIN products p ON oi.product_id = p.product_id
            WHERE oi.order_id = ?
          `, [order.id]);
          order.items = items;
        } else if (order.order_type === 'custom_design') {
          // For custom designs, create a mock item
          const designId = order.id.replace('custom-design-', '');
          const [designDetails] = await connection.execute(`
            SELECT product_type, product_color, quantity, final_price 
            FROM custom_designs 
            WHERE id = ?
          `, [designId]);
          
          if (designDetails.length > 0) {
            const design = designDetails[0];
            order.items = [{
              id: 1,
              product_name: `Custom ${design.product_type}`,
              product_color: design.product_color,
              quantity: design.quantity || 1,
              unit_price: design.final_price,
              total_price: design.final_price
            }];
          }
        } else if (order.order_type === 'custom_order') {
          // For custom orders, create a mock item
          const customOrderId = order.id.replace('custom-order-', '');
          const [orderDetails] = await connection.execute(`
            SELECT product_type, product_color, quantity, final_price 
            FROM custom_orders 
            WHERE id = ?
          `, [customOrderId]);
          
          if (orderDetails.length > 0) {
            const customOrder = orderDetails[0];
            order.items = [{
              id: 1,
              product_name: `Custom ${customOrder.product_type}`,
              product_color: customOrder.product_color,
              quantity: customOrder.quantity || 1,
              unit_price: customOrder.final_price,
              total_price: customOrder.final_price
            }];
          }
        }
      }
      
      res.json({
        success: true,
        data: allOrders,
        summary: {
          total: allOrders.length,
          regular: regularOrders.length,
          custom_designs: customDesigns.length,
          custom_orders: customOrders.length,
          scheduled: allOrders.filter(o => o.delivery_status && o.delivery_status !== 'pending').length,
          pending: allOrders.filter(o => !o.delivery_status || o.delivery_status === 'pending').length
        }
      });
      
    } catch (error) {
      console.error('Error fetching orders for delivery:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch orders for delivery',
        error: error.message
      });
    } finally {
      if (connection) await connection.end();
    }
  }
  
  // =============================================
  // DELIVERY SCHEDULING
  // =============================================
  
  /**
   * Schedule a delivery for an order
   */
  static async scheduleDelivery(req, res) {
    let connection;
    try {
      const {
        order_id,
        order_type,
        delivery_date,
        delivery_time_slot,
        courier_id,
        delivery_notes,
        priority_level
      } = req.body;
      
      connection = await mysql.createConnection(dbConfig);
      
      // Get order details based on type
      let orderDetails;
      if (order_type === 'regular') {
        const [orders] = await connection.execute(`
          SELECT * FROM orders WHERE id = ?
        `, [order_id]);
        orderDetails = orders[0];
      } else if (order_type === 'custom_design') {
        const [designs] = await connection.execute(`
          SELECT *, design_id as order_number FROM custom_designs WHERE id = ?
        `, [order_id.replace('custom-design-', '')]);
        orderDetails = designs[0];
      } else if (order_type === 'custom_order') {
        const [customOrders] = await connection.execute(`
          SELECT *, custom_order_id as order_number FROM custom_orders WHERE id = ?
        `, [order_id.replace('custom-order-', '')]);
        orderDetails = customOrders[0];
      }
      
      if (!orderDetails) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }
      
      // Create delivery schedule
      const [result] = await connection.execute(`
        INSERT INTO delivery_schedules_enhanced (
          order_id, order_number, order_type,
          customer_name, customer_email, customer_phone,
          delivery_date, delivery_time_slot, delivery_status,
          delivery_address, delivery_city, delivery_province, delivery_postal_code,
          delivery_contact_phone, delivery_notes,
          courier_id, priority_level,
          calendar_color, display_icon
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'scheduled', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
        delivery_date = VALUES(delivery_date),
        delivery_time_slot = VALUES(delivery_time_slot),
        delivery_status = 'scheduled',
        courier_id = VALUES(courier_id),
        delivery_notes = VALUES(delivery_notes),
        priority_level = VALUES(priority_level),
        updated_at = CURRENT_TIMESTAMP
      `, [
        order_type === 'regular' ? order_id : order_id.replace(/^custom-(design|order)-/, ''),
        orderDetails.order_number,
        order_type,
        orderDetails.customer_name,
        orderDetails.customer_email,
        orderDetails.customer_phone,
        delivery_date,
        delivery_time_slot,
        orderDetails.shipping_address,
        orderDetails.shipping_city,
        orderDetails.shipping_province,
        orderDetails.shipping_postal_code,
        orderDetails.shipping_phone || orderDetails.customer_phone,
        delivery_notes,
        courier_id,
        priority_level || 'normal',
        this.getStatusColor('scheduled'),
        this.getStatusIcon('scheduled')
      ]);
      
      // Update delivery status in source table
      if (order_type === 'custom_design') {
        await connection.execute(`
          UPDATE custom_designs 
          SET delivery_status = 'scheduled', delivery_date = ?, delivery_notes = ?
          WHERE id = ?
        `, [delivery_date, delivery_notes, order_id.replace('custom-design-', '')]);
      } else if (order_type === 'custom_order') {
        await connection.execute(`
          UPDATE custom_orders 
          SET delivery_status = 'scheduled', delivery_date = ?, delivery_notes = ?
          WHERE id = ?
        `, [delivery_date, delivery_notes, order_id.replace('custom-order-', '')]);
      }
      
      // Update calendar booking count
      await connection.execute(`
        UPDATE delivery_calendar 
        SET current_bookings = current_bookings + 1 
        WHERE calendar_date = ?
      `, [delivery_date]);
      
      // Log status change
      await this.logStatusChange(connection, result.insertId, order_id, null, 'scheduled', 'Order scheduled for delivery', req.user?.id, req.user?.username);
      
      res.json({
        success: true,
        message: 'Delivery scheduled successfully',
        data: {
          delivery_schedule_id: result.insertId,
          order_id,
          delivery_date,
          delivery_status: 'scheduled'
        }
      });
      
    } catch (error) {
      console.error('Error scheduling delivery:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to schedule delivery',
        error: error.message
      });
    } finally {
      if (connection) await connection.end();
    }
  }
  
  /**
   * Update delivery status
   */
  static async updateDeliveryStatus(req, res) {
    let connection;
    try {
      const { id } = req.params;
      const { delivery_status, delivery_notes, location_address } = req.body;
      
      connection = await mysql.createConnection(dbConfig);
      
      // Get current delivery schedule
      const [currentSchedule] = await connection.execute(`
        SELECT * FROM delivery_schedules_enhanced WHERE id = ?
      `, [id]);
      
      if (currentSchedule.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Delivery schedule not found'
        });
      }
      
      const schedule = currentSchedule[0];
      const previousStatus = schedule.delivery_status;
      
      // Update delivery schedule
      const updateFields = {
        delivery_status,
        delivery_notes,
        calendar_color: this.getStatusColor(delivery_status),
        display_icon: this.getStatusIcon(delivery_status),
        updated_at: new Date()
      };
      
      if (delivery_status === 'delivered') {
        updateFields.delivered_at = new Date();
      } else if (delivery_status === 'in_transit') {
        updateFields.dispatched_at = new Date();
      }
      
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
        updateFields.delivered_at || null,
        updateFields.dispatched_at || null,
        id
      ]);
      
      // Update status in source table
      if (schedule.order_type === 'custom_design') {
        await connection.execute(`
          UPDATE custom_designs 
          SET delivery_status = ?, delivery_notes = ?
          WHERE id = ?
        `, [delivery_status, delivery_notes, schedule.order_id]);
      } else if (schedule.order_type === 'custom_order') {
        await connection.execute(`
          UPDATE custom_orders 
          SET delivery_status = ?, delivery_notes = ?
          WHERE id = ?
        `, [delivery_status, delivery_notes, schedule.order_id]);
      }
      
      // Log status change
      await this.logStatusChange(connection, id, schedule.order_id, previousStatus, delivery_status, delivery_notes, req.user?.id, req.user?.username, location_address);
      
      res.json({
        success: true,
        message: 'Delivery status updated successfully',
        data: {
          delivery_schedule_id: id,
          previous_status: previousStatus,
          new_status: delivery_status,
          updated_at: updateFields.updated_at
        }
      });
      
    } catch (error) {
      console.error('Error updating delivery status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update delivery status',
        error: error.message
      });
    } finally {
      if (connection) await connection.end();
    }
  }
  
  // =============================================
  // HELPER METHODS
  // =============================================
  
  static getStatusColor(status) {
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
  
  static getStatusIcon(status) {
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
  
  static async logStatusChange(connection, deliveryScheduleId, orderId, previousStatus, newStatus, notes, userId, userName, locationAddress = null) {
    try {
      await connection.execute(`
        INSERT INTO delivery_status_history (
          delivery_schedule_id, order_id, previous_status, new_status, 
          status_notes, changed_by_user_id, changed_by_name, location_address
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [deliveryScheduleId, orderId, previousStatus, newStatus, notes, userId, userName, locationAddress]);
    } catch (error) {
      console.error('Error logging status change:', error);
    }
  }
}

module.exports = DeliveryController;
