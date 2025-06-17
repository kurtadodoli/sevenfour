const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs').promises;

// Database configuration
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'seven_four_clothing'
};

// Helper function to execute queries
const query = async (sql, params = []) => {
    const connection = await mysql.createConnection(dbConfig);
    try {
        const [results] = await connection.execute(sql, params);
        return results;
    } finally {
        await connection.end();
    }
};

// Submit a custom design request
exports.submitCustomDesign = async (req, res) => {
    try {
        const {
            designName,
            category,
            preferredColor,
            size,
            description,
            specialRequests,
            budget,
            urgency
        } = req.body;

        const userId = req.user.id;

        if (!designName || !category || !description) {
            return res.status(400).json({
                success: false,
                message: 'Design name, category, and description are required'
            });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'At least one design image is required'
            });
        }

        // Process uploaded images
        const imagePaths = req.files.map(file => file.filename);

        // Insert custom design request
        const designId = `CD${Date.now()}${Math.floor(Math.random() * 1000)}`;
        
        await query(`
            INSERT INTO custom_design_requests (
                design_id, user_id, design_name, category, preferred_color,
                size, description, special_requests, budget, urgency,
                images, status, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())
        `, [
            designId, userId, designName, category, preferredColor,
            size, description, specialRequests, budget, urgency,
            JSON.stringify(imagePaths)
        ]);

        res.status(201).json({
            success: true,
            message: 'Custom design request submitted successfully',
            designId: designId
        });

    } catch (error) {
        console.error('Error submitting custom design:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit custom design request'
        });
    }
};

// Get custom design requests for a user
exports.getUserCustomDesigns = async (req, res) => {
    try {
        const userId = req.user.id;

        const designs = await query(`
            SELECT * FROM custom_design_requests 
            WHERE user_id = ? 
            ORDER BY created_at DESC
        `, [userId]);

        // Parse images JSON for each design
        const designsWithImages = designs.map(design => ({
            ...design,
            images: JSON.parse(design.images || '[]')
        }));

        res.json({
            success: true,
            designs: designsWithImages
        });

    } catch (error) {
        console.error('Error fetching user custom designs:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch custom designs'
        });
    }
};

// Get all custom design requests (Admin only)
exports.getAllCustomDesigns = async (req, res) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        let whereClause = '';
        let params = [];

        if (status && status !== 'all') {
            whereClause = 'WHERE cdr.status = ?';
            params.push(status);
        }

        const designs = await query(`
            SELECT 
                cdr.*,
                u.email as user_email,
                u.username as user_name
            FROM custom_design_requests cdr
            JOIN users u ON cdr.user_id = u.user_id
            ${whereClause}
            ORDER BY 
                CASE WHEN cdr.status = 'pending' THEN 1 ELSE 2 END,
                cdr.created_at DESC
            LIMIT ? OFFSET ?
        `, [...params, parseInt(limit), parseInt(offset)]);

        // Get total count
        const totalResult = await query(`
            SELECT COUNT(*) as total 
            FROM custom_design_requests cdr 
            ${whereClause}
        `, params);

        const total = totalResult[0].total;

        // Parse images JSON for each design
        const designsWithImages = designs.map(design => ({
            ...design,
            images: JSON.parse(design.images || '[]')
        }));

        res.json({
            success: true,
            designs: designsWithImages,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: total,
                totalPages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Error fetching all custom designs:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch custom designs'
        });
    }
};

// Update custom design status (Admin only)
exports.updateDesignStatus = async (req, res) => {
    try {
        const { designId } = req.params;
        const { status, adminNotes, estimatedPrice, estimatedDays } = req.body;

        if (!['pending', 'approved', 'rejected', 'in_progress', 'completed'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }

        await query(`
            UPDATE custom_design_requests 
            SET 
                status = ?,
                admin_notes = ?,
                estimated_price = ?,
                estimated_days = ?,
                admin_id = ?,
                updated_at = NOW()
            WHERE design_id = ?
        `, [status, adminNotes, estimatedPrice, estimatedDays, req.user.id, designId]);

        res.json({
            success: true,
            message: 'Design status updated successfully'
        });

    } catch (error) {
        console.error('Error updating design status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update design status'
        });
    }
};

// Get design by ID
exports.getDesignById = async (req, res) => {
    try {
        const { designId } = req.params;

        const designs = await query(`
            SELECT 
                cdr.*,
                u.email as user_email,
                u.username as user_name,
                admin.username as admin_name
            FROM custom_design_requests cdr
            JOIN users u ON cdr.user_id = u.user_id
            LEFT JOIN users admin ON cdr.admin_id = admin.user_id
            WHERE cdr.design_id = ?
        `, [designId]);

        if (designs.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Design not found'
            });
        }

        const design = {
            ...designs[0],
            images: JSON.parse(designs[0].images || '[]')
        };

        res.json({
            success: true,
            design: design
        });

    } catch (error) {
        console.error('Error fetching design:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch design'
        });
    }
};
