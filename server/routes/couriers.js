const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get all couriers
router.get('/', async (req, res) => {
  try {
    const couriers = await db.query(`
      SELECT 
        id,
        name,
        phone_number,
        email,
        license_number,
        vehicle_type,
        status,
        max_deliveries_per_day,
        service_areas,
        rating,
        total_deliveries,
        successful_deliveries,
        notes,
        created_at,
        updated_at
      FROM couriers 
      ORDER BY status ASC, name ASC
    `);

    // Return array directly for frontend compatibility
    res.json(couriers);
  } catch (error) {
    console.error('Error fetching couriers:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching couriers',
      error: error.message
    });
  }
});

// Get active couriers only
router.get('/active', async (req, res) => {
  try {
    const activeCouriers = await db.query(`
      SELECT 
        id,
        name,
        phone_number,
        email,
        vehicle_type,
        status,
        max_deliveries_per_day,
        service_areas,
        rating,
        total_deliveries,
        successful_deliveries
      FROM couriers 
      WHERE status = 'active'
      ORDER BY rating DESC, name ASC
    `);

    res.json({
      success: true,
      couriers: activeCouriers
    });
  } catch (error) {
    console.error('Error fetching active couriers:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching active couriers',
      error: error.message
    });
  }
});

// Create new courier
router.post('/', async (req, res) => {
  try {
    const {
      name,
      phone_number,
      email,
      license_number,
      vehicle_type,
      max_deliveries_per_day,
      service_areas,
      notes
    } = req.body;

    // Validate required fields
    if (!name || !phone_number) {
      return res.status(400).json({
        success: false,
        message: 'Name and phone number are required'
      });
    }

    // Check if phone number already exists
    const existingCourier = await db.query(
      'SELECT id FROM couriers WHERE phone_number = ?',
      [phone_number]
    );

    if (existingCourier.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'A courier with this phone number already exists'
      });
    }

    // Check if email already exists (if provided)
    if (email) {
      const existingEmail = await db.query(
        'SELECT id FROM couriers WHERE email = ?',
        [email]
      );

      if (existingEmail.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'A courier with this email already exists'
        });
      }
    }

    const result = await db.query(`
      INSERT INTO couriers (
        name,
        phone_number,
        email,
        license_number,
        vehicle_type,
        max_deliveries_per_day,
        service_areas,
        notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      name,
      phone_number,
      email || null,
      license_number || null,
      vehicle_type || 'motorcycle',
      max_deliveries_per_day || 10,
      service_areas ? JSON.stringify(service_areas) : null,
      notes || null
    ]);

    // Fetch the created courier
    const newCourier = await db.query(
      'SELECT * FROM couriers WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Courier created successfully',
      courier: newCourier[0]
    });
  } catch (error) {
    console.error('Error creating courier:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating courier',
      error: error.message
    });
  }
});

// Update courier
router.put('/:id', async (req, res) => {
  try {
    const courierId = req.params.id;
    const {
      name,
      phone_number,
      email,
      license_number,
      vehicle_type,
      status,
      max_deliveries_per_day,
      service_areas,
      notes
    } = req.body;

    // Check if courier exists
    const existingCourier = await db.query(
      'SELECT id FROM couriers WHERE id = ?',
      [courierId]
    );

    if (existingCourier.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Courier not found'
      });
    }

    // Check for duplicate phone number (excluding current courier)
    if (phone_number) {
      const duplicatePhone = await db.query(
        'SELECT id FROM couriers WHERE phone_number = ? AND id != ?',
        [phone_number, courierId]
      );

      if (duplicatePhone.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Another courier with this phone number already exists'
        });
      }
    }

    // Check for duplicate email (excluding current courier)
    if (email) {
      const duplicateEmail = await db.query(
        'SELECT id FROM couriers WHERE email = ? AND id != ?',
        [email, courierId]
      );

      if (duplicateEmail.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Another courier with this email already exists'
        });
      }
    }

    await db.query(`
      UPDATE couriers SET
        name = COALESCE(?, name),
        phone_number = COALESCE(?, phone_number),
        email = ?,
        license_number = ?,
        vehicle_type = COALESCE(?, vehicle_type),
        status = COALESCE(?, status),
        max_deliveries_per_day = COALESCE(?, max_deliveries_per_day),
        service_areas = ?,
        notes = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      name,
      phone_number,
      email,
      license_number,
      vehicle_type,
      status,
      max_deliveries_per_day,
      service_areas ? JSON.stringify(service_areas) : null,
      notes,
      courierId
    ]);

    // Fetch updated courier
    const updatedCourier = await db.query(
      'SELECT * FROM couriers WHERE id = ?',
      [courierId]
    );

    res.json({
      success: true,
      message: 'Courier updated successfully',
      courier: updatedCourier[0]
    });
  } catch (error) {
    console.error('Error updating courier:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating courier',
      error: error.message
    });
  }
});

// Delete courier (soft delete by setting status to inactive)
router.delete('/:id', async (req, res) => {
  try {
    const courierId = req.params.id;

    // Check if courier exists
    const existingCourier = await db.query(
      'SELECT id, name FROM couriers WHERE id = ?',
      [courierId]
    );

    if (existingCourier.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Courier not found'
      });
    }

    // Check if courier has active deliveries
    const activeDeliveries = await db.query(`
      SELECT COUNT(*) as active_count 
      FROM delivery_schedules 
      WHERE courier_id = ? AND delivery_status IN ('scheduled', 'in_transit')
    `, [courierId]);

    if (activeDeliveries[0].active_count > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete courier with active deliveries. Please reassign or complete deliveries first.'
      });
    }

    // Soft delete by setting status to inactive
    await db.query(
      'UPDATE couriers SET status = "inactive", updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [courierId]
    );

    res.json({
      success: true,
      message: `Courier ${existingCourier[0].name} has been deactivated`
    });
  } catch (error) {
    console.error('Error deleting courier:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting courier',
      error: error.message
    });
  }
});

// Get courier statistics
router.get('/:id/stats', async (req, res) => {
  try {
    const courierId = req.params.id;

    const stats = await db.query(`
      SELECT 
        c.name,
        c.total_deliveries,
        c.successful_deliveries,
        c.rating,
        COUNT(ds.id) as scheduled_deliveries,
        COUNT(CASE WHEN ds.delivery_status = 'delivered' THEN 1 END) as completed_today,
        COUNT(CASE WHEN ds.delivery_status = 'in_transit' THEN 1 END) as in_progress
      FROM couriers c
      LEFT JOIN delivery_schedules ds ON c.id = ds.courier_id 
        AND DATE(ds.delivery_date) = CURDATE()
      WHERE c.id = ?
      GROUP BY c.id
    `, [courierId]);

    if (stats.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Courier not found'
      });
    }

    res.json({
      success: true,
      stats: stats[0]
    });
  } catch (error) {
    console.error('Error fetching courier stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching courier statistics',
      error: error.message
    });
  }
});

module.exports = router;
