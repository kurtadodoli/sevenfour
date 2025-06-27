const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get all delivery schedules
router.get('/schedules', async (req, res) => {
  try {
    const { status, date, courier_id } = req.query;
    
    // First check if delivery_schedules table exists
    try {
      await db.query("SHOW TABLES LIKE 'delivery_schedules'");
    } catch (error) {
      console.error('delivery_schedules table check failed:', error);
      return res.status(500).json({
        success: false,
        message: 'Delivery schedules table not found. Please run database setup.',
        error: 'Table does not exist'
      });
    }
    
    let query = `
      SELECT 
        ds.*,
        c.name as courier_name,
        c.phone_number as courier_phone,  
        c.vehicle_type
      FROM delivery_schedules ds
      LEFT JOIN couriers c ON ds.courier_id = c.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (status) {
      query += ' AND ds.delivery_status = ?';
      params.push(status);
    }
    
    if (date) {
      query += ' AND DATE(ds.delivery_date) = ?';
      params.push(date);
    }
    
    if (courier_id) {
      query += ' AND ds.courier_id = ?';
      params.push(courier_id);
    }
    
    query += ' ORDER BY ds.delivery_date ASC, ds.delivery_time_slot ASC';
    
    console.log('Executing delivery query:', query);
    console.log('With parameters:', params);
    
    const schedules = await db.query(query, params);
    
    res.json({
      success: true,
      schedules: schedules
    });
  } catch (error) {
    console.error('Error fetching delivery schedules:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching delivery schedules',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Create new delivery schedule
router.post('/schedules', async (req, res) => {
  try {
    const {
      order_id,
      order_type,
      customer_id,
      delivery_date,
      delivery_time_slot,
      delivery_address,
      delivery_city,
      delivery_postal_code,
      delivery_province,
      delivery_contact_phone,
      delivery_notes,
      courier_id,
      priority_level,
      delivery_fee
    } = req.body;

    // Validate required fields
    if (!order_id || !customer_id || !delivery_date || !delivery_address) {
      return res.status(400).json({
        success: false,
        message: 'Order ID, customer ID, delivery date, and delivery address are required'
      });
    }

    // Check if order already has a delivery schedule
    const existingSchedule = await db.query(
      'SELECT id FROM delivery_schedules WHERE order_id = ? AND order_type = ?',
      [order_id, order_type || 'regular']
    );

    if (existingSchedule.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'This order already has a delivery schedule'
      });
    }

    // Generate tracking number
    const trackingNumber = `SFC${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    const result = await db.query(`
      INSERT INTO delivery_schedules (
        order_id,
        order_type,
        customer_id,
        delivery_date,
        delivery_time_slot,
        delivery_address,
        delivery_city,
        delivery_postal_code,
        delivery_province,
        delivery_contact_phone,
        delivery_notes,
        courier_id,
        tracking_number,
        priority_level,
        delivery_fee,
        scheduled_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      order_id,
      order_type || 'regular',
      customer_id,
      delivery_date,
      delivery_time_slot,
      delivery_address,
      delivery_city,
      delivery_postal_code,
      delivery_province,
      delivery_contact_phone,
      delivery_notes,
      courier_id,
      trackingNumber,
      priority_level || 'normal',
      delivery_fee || 0.00,
      req.user?.id || null // If authentication middleware is used
    ]);

    // If courier is assigned, update their delivery count
    if (courier_id) {
      await db.query(
        'UPDATE couriers SET total_deliveries = total_deliveries + 1 WHERE id = ?',
        [courier_id]
      );
    }

    // Fetch the created schedule with courier details
    const newSchedule = await db.query(`
      SELECT 
        ds.*,
        c.name as courier_name,
        c.phone_number as courier_phone
      FROM delivery_schedules ds
      LEFT JOIN couriers c ON ds.courier_id = c.id
      WHERE ds.id = ?
    `, [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Delivery scheduled successfully',
      schedule: newSchedule[0]
    });
  } catch (error) {
    console.error('Error creating delivery schedule:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating delivery schedule',
      error: error.message
    });
  }
});

// Update delivery schedule (including courier assignment)
router.put('/schedules/:id', async (req, res) => {
  try {
    const scheduleId = req.params.id;
    const {
      delivery_date,
      delivery_time_slot,
      delivery_status,
      courier_id,
      delivery_notes,
      priority_level,
      delivery_fee
    } = req.body;

    // Check if schedule exists
    const existingSchedule = await db.query(
      'SELECT * FROM delivery_schedules WHERE id = ?',
      [scheduleId]
    );

    if (existingSchedule.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Delivery schedule not found'
      });
    }

    const currentSchedule = existingSchedule[0];

    // If courier is being changed, update delivery counts
    if (courier_id && courier_id !== currentSchedule.courier_id) {
      // Remove from old courier
      if (currentSchedule.courier_id) {
        await db.query(
          'UPDATE couriers SET total_deliveries = GREATEST(total_deliveries - 1, 0) WHERE id = ?',
          [currentSchedule.courier_id]
        );
      }
      
      // Add to new courier
      await db.query(
        'UPDATE couriers SET total_deliveries = total_deliveries + 1 WHERE id = ?',
        [courier_id]
      );
    }

    // Update delivery schedule
    await db.query(`
      UPDATE delivery_schedules SET
        delivery_date = COALESCE(?, delivery_date),
        delivery_time_slot = COALESCE(?, delivery_time_slot),
        delivery_status = COALESCE(?, delivery_status),
        courier_id = ?,
        delivery_notes = COALESCE(?, delivery_notes),
        priority_level = COALESCE(?, priority_level),
        delivery_fee = COALESCE(?, delivery_fee),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      delivery_date,
      delivery_time_slot,
      delivery_status,
      courier_id,
      delivery_notes,
      priority_level,
      delivery_fee,
      scheduleId
    ]);

    // If delivery is marked as delivered, update courier success count
    if (delivery_status === 'delivered' && currentSchedule.delivery_status !== 'delivered') {
      if (courier_id || currentSchedule.courier_id) {
        const finalCourierId = courier_id || currentSchedule.courier_id;
        await db.query(
          'UPDATE couriers SET successful_deliveries = successful_deliveries + 1 WHERE id = ?',
          [finalCourierId]
        );
      }
    }

    // Fetch updated schedule
    const updatedSchedule = await db.query(`
      SELECT 
        ds.*,
        c.name as courier_name,
        c.phone_number as courier_phone,
        c.vehicle_type
      FROM delivery_schedules ds
      LEFT JOIN couriers c ON ds.courier_id = c.id
      WHERE ds.id = ?
    `, [scheduleId]);

    res.json({
      success: true,
      message: 'Delivery schedule updated successfully',
      schedule: updatedSchedule[0]
    });
  } catch (error) {
    console.error('Error updating delivery schedule:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating delivery schedule',
      error: error.message
    });
  }
});

// Assign courier to delivery
router.post('/schedules/:id/assign-courier', async (req, res) => {
  try {
    const scheduleId = req.params.id;
    const { courier_id } = req.body;

    if (!courier_id) {
      return res.status(400).json({
        success: false,
        message: 'Courier ID is required'
      });
    }

    // Check if schedule exists
    const schedule = await db.query(
      'SELECT * FROM delivery_schedules WHERE id = ?',
      [scheduleId]
    );

    if (schedule.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Delivery schedule not found'
      });
    }

    // Check if courier exists and is active
    const courier = await db.query(
      'SELECT * FROM couriers WHERE id = ? AND status = "active"',
      [courier_id]
    );

    if (courier.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Courier not found or not active'
      });
    }

    // Check courier's daily delivery limit
    const todayDeliveries = await db.query(`
      SELECT COUNT(*) as today_count 
      FROM delivery_schedules 
      WHERE courier_id = ? 
        AND DATE(delivery_date) = DATE(?)
        AND delivery_status IN ('scheduled', 'in_transit')
    `, [courier_id, schedule[0].delivery_date]);

    if (todayDeliveries[0].today_count >= courier[0].max_deliveries_per_day) {
      return res.status(400).json({
        success: false,
        message: `Courier ${courier[0].name} has reached the daily delivery limit of ${courier[0].max_deliveries_per_day}`
      });
    }

    // Update the old courier count if there was one
    if (schedule[0].courier_id) {
      await db.query(
        'UPDATE couriers SET total_deliveries = GREATEST(total_deliveries - 1, 0) WHERE id = ?',
        [schedule[0].courier_id]
      );
    }

    // Assign courier and update delivery count
    await db.query(
      'UPDATE delivery_schedules SET courier_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [courier_id, scheduleId]
    );

    await db.query(
      'UPDATE couriers SET total_deliveries = total_deliveries + 1 WHERE id = ?',
      [courier_id]
    );

    // Create courier delivery history entry
    await db.query(`
      INSERT INTO courier_delivery_history (courier_id, delivery_schedule_id, status)
      VALUES (?, ?, 'assigned')
    `, [courier_id, scheduleId]);

    res.json({
      success: true,
      message: `Courier ${courier[0].name} assigned successfully`
    });
  } catch (error) {
    console.error('Error assigning courier:', error);
    res.status(500).json({
      success: false,
      message: 'Error assigning courier',
      error: error.message
    });
  }
});

// Get delivery calendar data
router.get('/calendar', async (req, res) => {
  try {
    const { month, year } = req.query;
    
    let dateFilter = '';
    const params = [];
    
    if (month && year) {
      dateFilter = 'WHERE MONTH(delivery_date) = ? AND YEAR(delivery_date) = ?';
      params.push(month, year);
    }
    
    const deliveries = await db.query(`
      SELECT 
        delivery_date,
        delivery_status,
        COUNT(*) as delivery_count,
        GROUP_CONCAT(DISTINCT c.name) as couriers
      FROM delivery_schedules ds
      LEFT JOIN couriers c ON ds.courier_id = c.id
      ${dateFilter}
      GROUP BY delivery_date, delivery_status
      ORDER BY delivery_date ASC
    `, params);
    
    res.json({
      success: true,
      calendar_data: deliveries
    });
  } catch (error) {
    console.error('Error fetching calendar data:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching calendar data',
      error: error.message
    });
  }
});

module.exports = router;
