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

    // Build dynamic update query for only provided fields
    const updateFields = [];
    const updateValues = [];
    
    if (name !== undefined) {
      updateFields.push('name = ?');
      updateValues.push(name);
    }
    if (phone_number !== undefined) {
      updateFields.push('phone_number = ?');
      updateValues.push(phone_number);
    }
    if (email !== undefined) {
      updateFields.push('email = ?');
      updateValues.push(email);
    }
    if (license_number !== undefined) {
      updateFields.push('license_number = ?');
      updateValues.push(license_number);
    }
    if (vehicle_type !== undefined) {
      updateFields.push('vehicle_type = ?');
      updateValues.push(vehicle_type);
    }
    if (status !== undefined) {
      updateFields.push('status = ?');
      updateValues.push(status);
    }
    if (max_deliveries_per_day !== undefined) {
      updateFields.push('max_deliveries_per_day = ?');
      updateValues.push(max_deliveries_per_day);
    }
    if (service_areas !== undefined) {
      updateFields.push('service_areas = ?');
      updateValues.push(Array.isArray(service_areas) ? JSON.stringify(service_areas) : service_areas);
    }
    if (notes !== undefined) {
      updateFields.push('notes = ?');
      updateValues.push(notes);
    }
    
    // Always update the timestamp
    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    
    if (updateFields.length === 1) { // Only timestamp was added
      return res.status(400).json({
        success: false,
        message: 'No fields provided for update'
      });
    }

    // Add courier ID for WHERE clause at the end
    updateValues.push(courierId);

    await db.query(`
      UPDATE couriers SET ${updateFields.join(', ')}
      WHERE id = ?
    `, updateValues);

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

    // Check if courier has active deliveries in both tables
    const activeDeliveries = await db.query(`
      SELECT COUNT(*) as active_count 
      FROM delivery_schedules 
      WHERE courier_id = ? AND delivery_status IN ('pending', 'scheduled', 'in_transit', 'delayed')
    `, [courierId]);

    const enhancedActiveDeliveries = await db.query(`
      SELECT COUNT(*) as active_count 
      FROM delivery_schedules_enhanced 
      WHERE courier_id = ? AND delivery_status IN ('pending', 'scheduled', 'in_transit', 'delayed')
    `, [courierId]);

    const totalActiveDeliveries = activeDeliveries[0].active_count + enhancedActiveDeliveries[0].active_count;

    if (totalActiveDeliveries > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete courier with active deliveries. Please reassign or complete deliveries first.'
      });
    }

    // Actually delete the courier record
    await db.query(
      'DELETE FROM couriers WHERE id = ?',
      [courierId]
    );

    res.json({
      success: true,
      message: `Courier ${existingCourier[0].name} has been permanently deleted`
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
