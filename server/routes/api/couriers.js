const express = require('express');
const router = express.Router();
const { pool } = require('../../config/database');
// Temporarily comment out auth middleware to test
// const { auth, adminAuth } = require('../../middleware/auth');

// Helper function to format courier data
const formatCourier = (courier) => {
    return {
        id: courier.id,
        name: courier.name,
        phone_number: courier.phone_number,
        email: courier.email,
        license_number: courier.license_number,
        vehicle_type: courier.vehicle_type,
        status: courier.status,
        max_deliveries_per_day: courier.max_deliveries_per_day,
        service_areas: courier.service_areas,
        rating: parseFloat(courier.rating || 0),
        total_deliveries: courier.total_deliveries,
        successful_deliveries: courier.successful_deliveries,
        notes: courier.notes,
        created_at: courier.created_at,
        updated_at: courier.updated_at
    };
};

// @route   GET /api/couriers
// @desc    Get all couriers
// @access  Public (for now)
router.get('/', async (req, res) => {
    try {
        const { status } = req.query;
        
        let query = 'SELECT * FROM couriers';
        let params = [];
        
        if (status) {
            query += ' WHERE status = ?';
            params.push(status);
        }
        
        query += ' ORDER BY name ASC';
        
        const [couriers] = await pool.execute(query, params);
        
        res.json(couriers.map(formatCourier));
    } catch (error) {
        console.error('Error fetching couriers:', error);
        res.status(500).json({ 
            message: 'Failed to fetch couriers',
            error: error.message 
        });
    }
});

// @route   GET /api/couriers/:id
// @desc    Get courier by ID
// @access  Public (for testing)
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const [couriers] = await pool.execute(
            'SELECT * FROM couriers WHERE id = ?',
            [id]
        );
        
        if (couriers.length === 0) {
            return res.status(404).json({ message: 'Courier not found' });
        }
        
        res.json(formatCourier(couriers[0]));
    } catch (error) {
        console.error('Error fetching courier:', error);
        res.status(500).json({ 
            message: 'Failed to fetch courier',
            error: error.message 
        });
    }
});

// @route   POST /api/couriers
// @desc    Create new courier
// @access  Admin
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
                message: 'Name and phone number are required'
            });
        }

        // Check if courier with same phone number already exists
        const [existingCourier] = await pool.execute(
            'SELECT id FROM couriers WHERE phone_number = ?',
            [phone_number]
        );

        if (existingCourier.length > 0) {
            return res.status(400).json({
                message: 'Courier with this phone number already exists'
            });
        }

        // Insert new courier
        const [result] = await pool.execute(`
            INSERT INTO couriers 
            (name, phone_number, email, license_number, vehicle_type, 
             max_deliveries_per_day, service_areas, notes) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            name,
            phone_number,
            email || null,
            license_number || null,
            vehicle_type || 'motorcycle',
            max_deliveries_per_day || 10,
            service_areas || null,
            notes || null
        ]);

        // Fetch the newly created courier
        const [newCourier] = await pool.execute(
            'SELECT * FROM couriers WHERE id = ?',
            [result.insertId]
        );

        res.status(201).json({
            message: 'Courier created successfully',
            courier: formatCourier(newCourier[0])
        });

    } catch (error) {
        console.error('Error creating courier:', error);
        res.status(500).json({ 
            message: 'Failed to create courier',
            error: error.message 
        });
    }
});

// @route   PUT /api/couriers/:id
// @desc    Update courier
// @access  Admin
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
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
        const [existingCourier] = await pool.execute(
            'SELECT id FROM couriers WHERE id = ?',
            [id]
        );

        if (existingCourier.length === 0) {
            return res.status(404).json({ message: 'Courier not found' });
        }

        // Check if phone number is already used by another courier
        if (phone_number) {
            const [phoneCheck] = await pool.execute(
                'SELECT id FROM couriers WHERE phone_number = ? AND id != ?',
                [phone_number, id]
            );

            if (phoneCheck.length > 0) {
                return res.status(400).json({
                    message: 'Phone number already used by another courier'
                });
            }
        }

        // Update courier
        await pool.execute(`
            UPDATE couriers SET 
                name = COALESCE(?, name),
                phone_number = COALESCE(?, phone_number),
                email = COALESCE(?, email),
                license_number = COALESCE(?, license_number),
                vehicle_type = COALESCE(?, vehicle_type),
                status = COALESCE(?, status),
                max_deliveries_per_day = COALESCE(?, max_deliveries_per_day),
                service_areas = COALESCE(?, service_areas),
                notes = COALESCE(?, notes),
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
            service_areas,
            notes,
            id
        ]);

        // Fetch updated courier
        const [updatedCourier] = await pool.execute(
            'SELECT * FROM couriers WHERE id = ?',
            [id]
        );

        res.json({
            message: 'Courier updated successfully',
            courier: formatCourier(updatedCourier[0])
        });

    } catch (error) {
        console.error('Error updating courier:', error);
        res.status(500).json({ 
            message: 'Failed to update courier',
            error: error.message 
        });
    }
});

// @route   DELETE /api/couriers/:id
// @desc    Delete courier
// @access  Admin
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Check if courier exists
        const [existingCourier] = await pool.execute(
            'SELECT id FROM couriers WHERE id = ?',
            [id]
        );

        if (existingCourier.length === 0) {
            return res.status(404).json({ message: 'Courier not found' });
        }

        // Check if courier is assigned to any active deliveries
        const [activeDeliveries] = await pool.execute(
            'SELECT id FROM delivery_schedules WHERE courier_id = ? AND delivery_status != "delivered"',
            [id]
        );

        if (activeDeliveries.length > 0) {
            return res.status(400).json({
                message: 'Cannot delete courier with active deliveries'
            });
        }

        // Delete courier
        await pool.execute('DELETE FROM couriers WHERE id = ?', [id]);

        res.json({ message: 'Courier deleted successfully' });

    } catch (error) {
        console.error('Error deleting courier:', error);
        res.status(500).json({ 
            message: 'Failed to delete courier',
            error: error.message 
        });
    }
});

module.exports = router;
