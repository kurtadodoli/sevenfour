const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const { pool } = require('../../config/database');
const { auth, adminAuth } = require('../../middleware/auth');

// Helper function to format delivery schedule data
const formatDeliverySchedule = (schedule) => {
    return {
        id: schedule.id,
        order_id: schedule.order_id,
        order_type: schedule.order_type,
        customer_id: schedule.customer_id,
        delivery_date: schedule.delivery_date,
        delivery_time_slot: schedule.delivery_time_slot,
        delivery_status: schedule.delivery_status,
        delivery_address: schedule.delivery_address,
        delivery_city: schedule.delivery_city,
        delivery_postal_code: schedule.delivery_postal_code,
        delivery_province: schedule.delivery_province,
        delivery_contact_phone: schedule.delivery_contact_phone,
        delivery_notes: schedule.delivery_notes,
        tracking_number: schedule.tracking_number,
        courier_name: schedule.courier_name,
        estimated_delivery_time: schedule.estimated_delivery_time,
        actual_delivery_time: schedule.actual_delivery_time,
        priority_level: schedule.priority_level,
        delivery_fee: parseFloat(schedule.delivery_fee || 0),
        created_at: schedule.created_at,
        updated_at: schedule.updated_at
    };
};

// @route   GET /api/delivery/schedules
// @desc    Get all delivery schedules with filtering options
// @access  Public (temporarily for testing)
router.get('/schedules', async (req, res) => {
    try {        // Simple query without filters for debugging
        const query = 'SELECT * FROM delivery_schedules ORDER BY delivery_date ASC';
        
        const [schedules] = await pool.execute(query);
        console.log(`Found ${schedules.length} delivery schedules`);

        res.json(schedules.map(formatDeliverySchedule));

    } catch (error) {
        console.error('Error fetching delivery schedules:', error);
        res.status(500).json({ 
            message: 'Failed to fetch delivery schedules',
            error: error.message 
        });
    }
});

// @route   GET /api/delivery/schedules/:id
// @desc    Get delivery schedule by ID with items
// @access  Private (Admin)
router.get('/schedules/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;

        // Get delivery schedule details
        const [schedules] = await pool.execute(`
            SELECT ds.*, 
                   u.first_name, u.last_name, u.email as customer_email,                   u.address, u.city, u.postal_code, u.province, u.phone
            FROM delivery_schedules ds
            LEFT JOIN users u ON ds.customer_id = u.user_id
            WHERE ds.id = ?
        `, [id]);

        if (schedules.length === 0) {
            return res.status(404).json({ message: 'Delivery schedule not found' });
        }

        // Get delivery items
        const [items] = await pool.execute(`
            SELECT di.*
            FROM delivery_items di
            WHERE di.delivery_schedule_id = ?
            ORDER BY di.id ASC
        `, [id]);

        const schedule = formatDeliverySchedule(schedules[0]);
        schedule.customer_info = {
            first_name: schedules[0].first_name,
            last_name: schedules[0].last_name,
            email: schedules[0].customer_email,
            address: schedules[0].address,
            city: schedules[0].city,
            postal_code: schedules[0].postal_code,
            province: schedules[0].province,
            phone: schedules[0].phone
        };
        schedule.items = items;

        res.json(schedule);

    } catch (error) {
        console.error('Error fetching delivery schedule:', error);
        res.status(500).json({ 
            message: 'Failed to fetch delivery schedule',
            error: error.message 
        });
    }
});

// @route   POST /api/delivery/schedules
// @desc    Create new delivery schedule
// @access  Private (Admin)
router.post('/schedules', async (req, res) => {
    try {
        console.log('📥 Received delivery schedule creation request');
        console.log('📋 Request body:', JSON.stringify(req.body, null, 2));
        
        const {
            order_id,
            order_type = 'regular',
            customer_id,
            delivery_date,
            delivery_time_slot,
            delivery_address,
            delivery_city,
            delivery_postal_code,
            delivery_province,
            delivery_contact_phone,
            delivery_notes,
            priority_level = 'normal',
            delivery_fee = 0.00,
            items = []
        } = req.body;

        // Enhanced validation with specific error messages
        const validationErrors = [];
        
        if (!order_id) validationErrors.push('order_id is required');
        if (!customer_id) validationErrors.push('customer_id is required');
        if (!delivery_date) validationErrors.push('delivery_date is required');
        if (!delivery_address) validationErrors.push('delivery_address is required');
        if (!delivery_city) validationErrors.push('delivery_city is required');
        
        // Additional type validations
        if (order_id && (isNaN(order_id) || order_id <= 0)) {
            validationErrors.push('order_id must be a positive number');
        }
        if (customer_id && (isNaN(customer_id) || customer_id <= 0)) {
            validationErrors.push('customer_id must be a positive number');
        }
        if (delivery_date && !/^\d{4}-\d{2}-\d{2}$/.test(delivery_date)) {
            validationErrors.push('delivery_date must be in YYYY-MM-DD format');
        }
        
        if (validationErrors.length > 0) {
            console.log('❌ Validation errors:', validationErrors);
            return res.status(400).json({ 
                message: 'Validation failed',
                errors: validationErrors,
                received_data: req.body
            });
        }

        console.log('✅ Validation passed, checking for existing schedule...');

        // Check if schedule already exists for this order
        const [existingSchedule] = await pool.execute(`
            SELECT id FROM delivery_schedules 
            WHERE order_id = ? AND order_type = ?
        `, [order_id, order_type]);        if (existingSchedule.length > 0) {
            console.log('❌ Delivery schedule already exists for order:', order_id);
            return res.status(400).json({ 
                message: 'Delivery schedule already exists for this order',
                existing_schedule_id: existingSchedule[0].id
            });
        }

        console.log('✅ No existing schedule found, creating new one...');

        // Generate tracking number
        const tracking_number = `TN${Date.now()}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
        
        console.log('📦 Generated tracking number:', tracking_number);

        // Create delivery schedule
        console.log('💾 Inserting delivery schedule into database...');
        const [result] = await pool.execute(`
            INSERT INTO delivery_schedules (
                order_id, order_type, customer_id, delivery_date, delivery_time_slot,
                delivery_address, delivery_city, delivery_postal_code, delivery_province,
                delivery_contact_phone, delivery_notes, priority_level, delivery_fee,
                tracking_number, scheduled_by, delivery_status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            order_id, order_type, customer_id, delivery_date, delivery_time_slot,
            delivery_address, delivery_city, delivery_postal_code, delivery_province,
            delivery_contact_phone, delivery_notes, priority_level, delivery_fee,
            tracking_number, 1, 'scheduled'
        ]);

        console.log('Insert result:', result);
        const scheduleId = result.insertId;

        // Add delivery items if provided
        if (items && items.length > 0) {
            const itemInsertQuery = `
                INSERT INTO delivery_items (
                    delivery_schedule_id, product_id, custom_design_id, product_name,
                    product_type, size, color, quantity, unit_price, total_price,
                    custom_instructions, production_status
                ) VALUES ?
            `;

            const itemValues = items.map(item => [
                scheduleId,
                item.product_id || null,
                item.custom_design_id || null,
                item.product_name,
                item.product_type || null,
                item.size || null,
                item.color || null,
                item.quantity || 1,
                item.unit_price || 0.00,
                item.total_price || 0.00,
                item.custom_instructions || null,
                item.production_status || 'pending'
            ]);

            await pool.execute(itemInsertQuery, [itemValues]);
        }        // Get the created schedule with details
        const [createdSchedule] = await pool.execute(`
            SELECT ds.*
            FROM delivery_schedules ds
            WHERE ds.id = ?
        `, [scheduleId]);

        res.status(201).json({
            message: 'Delivery schedule created successfully',
            schedule: formatDeliverySchedule(createdSchedule[0]),
            tracking_number
        });

    } catch (error) {
        console.error('Error creating delivery schedule:', error);
        res.status(500).json({ 
            message: 'Failed to create delivery schedule',
            error: error.message 
        });
    }
});

// @route   PUT /api/delivery/schedules/:id
// @desc    Update delivery schedule
// @access  Private (Admin)
router.put('/schedules/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const {
            delivery_date,
            delivery_time_slot,
            delivery_status,
            delivery_address,
            delivery_city,
            delivery_postal_code,
            delivery_province,
            delivery_contact_phone,
            delivery_notes,
            priority_level,
            delivery_fee,
            courier_name,
            estimated_delivery_time,
            actual_delivery_time
        } = req.body;

        // Check if schedule exists
        const [existingSchedule] = await pool.execute(`
            SELECT id FROM delivery_schedules WHERE id = ?
        `, [id]);

        if (existingSchedule.length === 0) {
            return res.status(404).json({ message: 'Delivery schedule not found' });
        }

        // Build update query dynamically
        const updateFields = [];
        const updateValues = [];

        if (delivery_date !== undefined) {
            updateFields.push('delivery_date = ?');
            updateValues.push(delivery_date);
        }
        if (delivery_time_slot !== undefined) {
            updateFields.push('delivery_time_slot = ?');
            updateValues.push(delivery_time_slot);
        }
        if (delivery_status !== undefined) {
            updateFields.push('delivery_status = ?');
            updateValues.push(delivery_status);
        }
        if (delivery_address !== undefined) {
            updateFields.push('delivery_address = ?');
            updateValues.push(delivery_address);
        }
        if (delivery_city !== undefined) {
            updateFields.push('delivery_city = ?');
            updateValues.push(delivery_city);
        }
        if (delivery_postal_code !== undefined) {
            updateFields.push('delivery_postal_code = ?');
            updateValues.push(delivery_postal_code);
        }
        if (delivery_province !== undefined) {
            updateFields.push('delivery_province = ?');
            updateValues.push(delivery_province);
        }
        if (delivery_contact_phone !== undefined) {
            updateFields.push('delivery_contact_phone = ?');
            updateValues.push(delivery_contact_phone);
        }
        if (delivery_notes !== undefined) {
            updateFields.push('delivery_notes = ?');
            updateValues.push(delivery_notes);
        }
        if (priority_level !== undefined) {
            updateFields.push('priority_level = ?');
            updateValues.push(priority_level);
        }
        if (delivery_fee !== undefined) {
            updateFields.push('delivery_fee = ?');
            updateValues.push(delivery_fee);
        }
        if (courier_name !== undefined) {
            updateFields.push('courier_name = ?');
            updateValues.push(courier_name);
        }
        if (estimated_delivery_time !== undefined) {
            updateFields.push('estimated_delivery_time = ?');
            updateValues.push(estimated_delivery_time);
        }
        if (actual_delivery_time !== undefined) {
            updateFields.push('actual_delivery_time = ?');
            updateValues.push(actual_delivery_time);
        }

        if (updateFields.length === 0) {
            return res.status(400).json({ message: 'No fields to update' });
        }

        updateFields.push('updated_at = CURRENT_TIMESTAMP');
        updateValues.push(id);

        const updateQuery = `
            UPDATE delivery_schedules 
            SET ${updateFields.join(', ')}
            WHERE id = ?
        `;

        await pool.execute(updateQuery, updateValues);        // Get updated schedule
        const [updatedSchedule] = await pool.execute(`
            SELECT ds.*, 
                   u.first_name, u.last_name, u.email as customer_email
            FROM delivery_schedules ds
            LEFT JOIN users u ON ds.customer_id = u.user_id
            WHERE ds.id = ?
        `, [id]);

        res.json({
            message: 'Delivery schedule updated successfully',
            schedule: formatDeliverySchedule(updatedSchedule[0])
        });

    } catch (error) {
        console.error('Error updating delivery schedule:', error);
        res.status(500).json({ 
            message: 'Failed to update delivery schedule',
            error: error.message 
        });
    }
});

// @route   DELETE /api/delivery/schedules/:id
// @desc    Delete delivery schedule
// @access  Private (Admin)
router.delete('/schedules/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;

        // Check if schedule exists
        const [existingSchedule] = await pool.execute(`
            SELECT id FROM delivery_schedules WHERE id = ?
        `, [id]);

        if (existingSchedule.length === 0) {
            return res.status(404).json({ message: 'Delivery schedule not found' });
        }

        // Delete delivery schedule (items will be deleted via CASCADE)
        await pool.execute('DELETE FROM delivery_schedules WHERE id = ?', [id]);

        res.json({ message: 'Delivery schedule deleted successfully' });

    } catch (error) {
        console.error('Error deleting delivery schedule:', error);
        res.status(500).json({ 
            message: 'Failed to delete delivery schedule',
            error: error.message 
        });
    }
});

// @route   GET /api/delivery/calendar
// @desc    Get delivery calendar data
// @access  Private (Admin)
router.get('/calendar', auth, async (req, res) => {
    try {
        const { month, year } = req.query;
        
        let dateFilter = '';
        const params = [];
        
        if (month && year) {
            dateFilter = 'WHERE MONTH(dc.calendar_date) = ? AND YEAR(dc.calendar_date) = ?';
            params.push(month, year);
        } else {
            // Default to current month and next month
            const now = new Date();
            const nextMonth = new Date(now.getFullYear(), now.getMonth() + 2, 0);
            dateFilter = 'WHERE dc.calendar_date BETWEEN CURDATE() AND ?';
            params.push(nextMonth.toISOString().split('T')[0]);
        }

        const [calendarData] = await pool.execute(`
            SELECT 
                dc.*,
                COUNT(ds.id) as scheduled_deliveries,
                GROUP_CONCAT(
                    CONCAT(ds.delivery_status, ':', ds.priority_level) 
                    SEPARATOR '|'
                ) as delivery_statuses
            FROM delivery_calendar dc
            LEFT JOIN delivery_schedules ds ON DATE(ds.delivery_date) = dc.calendar_date
            ${dateFilter}
            GROUP BY dc.calendar_date
            ORDER BY dc.calendar_date ASC
        `, params);

        // Process the data to include delivery statistics
        const processedData = calendarData.map(day => ({
            date: day.calendar_date,
            is_available: Boolean(day.is_available),
            max_deliveries: day.max_deliveries,
            current_deliveries: day.scheduled_deliveries || 0,
            is_holiday: Boolean(day.is_holiday),
            is_blackout_date: Boolean(day.is_blackout_date),
            special_notes: day.special_notes,
            morning_slot_available: Boolean(day.morning_slot_available),
            afternoon_slot_available: Boolean(day.afternoon_slot_available),
            evening_slot_available: Boolean(day.evening_slot_available),
            delivery_breakdown: day.delivery_statuses ? 
                day.delivery_statuses.split('|').reduce((acc, status) => {
                    const [deliveryStatus, priority] = status.split(':');
                    acc[deliveryStatus] = (acc[deliveryStatus] || 0) + 1;
                    return acc;
                }, {}) : {}
        }));

        res.json(processedData);

    } catch (error) {
        console.error('Error fetching delivery calendar:', error);
        res.status(500).json({ 
            message: 'Failed to fetch delivery calendar',
            error: error.message 
        });
    }
});

// @route   POST /api/delivery/calendar/unavailable
// @desc    Set date as unavailable
// @access  Private (Admin)
router.post('/calendar/unavailable', auth, async (req, res) => {
    try {
        const { date, reason } = req.body;

        if (!date) {
            return res.status(400).json({ message: 'Date is required' });
        }

        // Insert or update calendar entry
        await pool.execute(`
            INSERT INTO delivery_calendar (
                calendar_date, is_available, is_blackout_date, 
                admin_notes, set_by_admin_id, max_deliveries
            ) VALUES (?, FALSE, TRUE, ?, ?, 0)
            ON DUPLICATE KEY UPDATE
                is_available = FALSE,
                is_blackout_date = TRUE,
                admin_notes = ?,
                set_by_admin_id = ?,
                updated_at = CURRENT_TIMESTAMP
        `, [date, reason, req.user.id, reason, req.user.id]);

        res.json({ 
            message: 'Date marked as unavailable successfully',
            date,
            reason
        });

    } catch (error) {
        console.error('Error setting unavailable date:', error);
        res.status(500).json({ 
            message: 'Failed to set unavailable date',
            error: error.message 
        });
    }
});

// @route   GET /api/delivery/analytics
// @desc    Get delivery analytics and statistics
// @access  Private (Admin)
router.get('/analytics', auth, async (req, res) => {
    try {
        const { start_date, end_date } = req.query;
        
        // Default to last 30 days if no dates provided
        const endDate = end_date || new Date().toISOString().split('T')[0];
        const startDate = start_date || new Date(new Date(endDate).getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        // Get delivery statistics
        const [stats] = await pool.execute(`
            SELECT 
                COUNT(*) as total_deliveries,
                COUNT(CASE WHEN delivery_status = 'scheduled' THEN 1 END) as scheduled,
                COUNT(CASE WHEN delivery_status = 'in_transit' THEN 1 END) as in_transit,
                COUNT(CASE WHEN delivery_status = 'delivered' THEN 1 END) as delivered,
                COUNT(CASE WHEN delivery_status = 'delayed' THEN 1 END) as delayed,
                COUNT(CASE WHEN delivery_status = 'cancelled' THEN 1 END) as cancelled,
                COUNT(CASE WHEN order_type = 'regular' THEN 1 END) as regular_orders,
                COUNT(CASE WHEN order_type = 'custom' THEN 1 END) as custom_orders,
                AVG(delivery_fee) as avg_delivery_fee,
                SUM(delivery_fee) as total_delivery_revenue
            FROM delivery_schedules 
            WHERE DATE(delivery_date) BETWEEN ? AND ?
        `, [startDate, endDate]);

        // Get daily delivery trends
        const [dailyTrends] = await pool.execute(`
            SELECT 
                DATE(delivery_date) as date,
                COUNT(*) as total_deliveries,
                COUNT(CASE WHEN delivery_status = 'delivered' THEN 1 END) as completed_deliveries,
                AVG(delivery_fee) as avg_fee
            FROM delivery_schedules 
            WHERE DATE(delivery_date) BETWEEN ? AND ?
            GROUP BY DATE(delivery_date)
            ORDER BY date ASC
        `, [startDate, endDate]);

        // Get priority distribution
        const [priorityStats] = await pool.execute(`
            SELECT 
                priority_level,
                COUNT(*) as count,
                COUNT(CASE WHEN delivery_status = 'delivered' THEN 1 END) as completed
            FROM delivery_schedules 
            WHERE DATE(delivery_date) BETWEEN ? AND ?
            GROUP BY priority_level
        `, [startDate, endDate]);

        res.json({
            summary: stats[0],
            daily_trends: dailyTrends,
            priority_distribution: priorityStats,
            date_range: { start_date: startDate, end_date: endDate }
        });

    } catch (error) {
        console.error('Error fetching delivery analytics:', error);
        res.status(500).json({ 
            message: 'Failed to fetch delivery analytics',
            error: error.message 
        });
    }
});

module.exports = router;
