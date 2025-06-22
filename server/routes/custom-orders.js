const express = require('express');
const mysql = require('mysql2/promise');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { dbConfig } = require('../config/db');
const { auth } = require('../middleware/auth');
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../uploads/custom-orders');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.original_filename));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'));
        }
    }
});

// Generate custom order ID
function generateCustomOrderId() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `CUSTOM-${timestamp}-${random}`.toUpperCase();
}

// Create a new custom order (WITHOUT authentication for testing)
router.post('/', upload.array('images', 10), async (req, res) => {
    console.log('=== CUSTOM ORDER SUBMISSION RECEIVED ===');
    console.log('Request body:', req.body);
    console.log('Files uploaded:', req.files ? req.files.length : 0);
    
    let connection;
    
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Database connected successfully');
        
        await connection.beginTransaction();
        
        const {
            productType,
            size,
            color,
            quantity = 1,
            urgency = 'standard',
            specialInstructions = '',
            customerName,
            customerEmail,
            customerPhone = '',
            province,
            municipality,
            streetNumber,
            houseNumber = '',
            barangay = '',
            postalCode = ''
        } = req.body;
        
        // Validate required fields
        if (!productType || !size || !color || !customerName || !customerEmail || !province || !municipality || !streetNumber) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: productType, size, color, customerName, customerEmail, province, municipality, streetNumber'
            });
        }
        
        if (!req.files || req.files.length === 0) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: 'At least one design image is required'
            });
        }
        
        const customOrderId = generateCustomOrderId();
        
        // Calculate estimated price based on product type and urgency
        const basePrice = {
            't-shirts': 500,
            'shorts': 600,
            'hoodies': 800,
            'jackets': 1000,
            'sweaters': 700,
            'jerseys': 550
        };
        
        const urgencyMultiplier = {
            'standard': 1,
            'express': 1.3,
            'rush': 1.6
        };
        
        const estimatedPrice = (basePrice[productType] || 500) * parseInt(quantity) * (urgencyMultiplier[urgency] || 1);
        
        // Insert custom order
        const insertOrderQuery = `
            INSERT INTO custom_orders (
                custom_order_id, product_type, size, color, quantity, urgency,
                special_instructions, customer_name, customer_email, customer_phone,
                province, municipality, street_number, house_number, barangay, postal_code,
                estimated_price, status, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())
        `;
        
        const [orderResult] = await connection.execute(insertOrderQuery, [
            customOrderId, productType, size, color, quantity, urgency,
            specialInstructions, customerName, customerEmail, customerPhone,
            province, municipality, streetNumber, houseNumber, barangay, postalCode,
            estimatedPrice
        ]);
        
        const orderId = orderResult.insertId;
        console.log('✅ Order inserted with ID:', orderId);
        
        // Insert uploaded images
        for (const file of req.files) {
            const insertImageQuery = `
                INSERT INTO custom_order_images (custom_order_id, image_path, original_filename, uploaded_at)
                VALUES (?, ?, ?, NOW())
            `;
            
            await connection.execute(insertImageQuery, [
                orderId,
                file.path,
                file.originalname
            ]);
        }
        
        console.log('✅ Images inserted successfully');
        
        await connection.commit();
        console.log('✅ Transaction committed successfully');
        
        res.json({
            success: true,
            message: 'Custom order submitted successfully',
            data: {
                customOrderId,
                orderId,
                estimatedPrice,
                imagesUploaded: req.files.length
            }
        });
        
    } catch (error) {
        console.error('❌ Error creating custom order:', error);
        
        if (connection) {
            await connection.rollback();
        }
        
        res.status(500).json({
            success: false,
            message: 'Failed to create custom order: ' + error.message
        });
    } finally {
        if (connection) {
            await connection.end();        }
    }
});

// Get custom orders for the current user (customer view)
router.get('/me', auth, async (req, res) => {
    let connection;
    try {
        console.log('🔍 Custom orders /me endpoint hit');
        console.log('User:', req.user);
        
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Database connection established');
        
        const userId = req.user.user_id;
        
        const [orders] = await connection.execute(`
            SELECT 
                co.*,
                GROUP_CONCAT(
                    JSON_OBJECT(
                        'id', coi.id,
                        'filename', coi.image_filename,
                        'original_filename', coi.original_filename,
                        'url', coi.image_url,
                        'upload_order', coi.upload_order
                    )
                ) as images
            FROM custom_orders co
            LEFT JOIN custom_order_images coi ON co.custom_order_id = coi.custom_order_id
            WHERE co.user_id = ?
            GROUP BY co.id
            ORDER BY co.created_at DESC
        `, [userId]);
        
        // Parse images JSON
        const ordersWithImages = orders.map(order => ({
            ...order,
            images: order.images ? JSON.parse(`[${order.images}]`) : []
        }));
          await connection.end();
        
        res.json({
            success: true,
            data: ordersWithImages
        });
        
    } catch (error) {
        console.error('❌ Error fetching custom orders:', error);
        if (connection) {
            try {
                await connection.end();
            } catch (closeError) {
                console.error('Error closing connection:', closeError);
            }
        }
        res.status(500).json({
            success: false,
            message: 'Failed to fetch custom orders',
            error: error.message
        });
    }
});

// Get all custom orders (admin view)
router.get('/', auth, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }
        
        const connection = await mysql.createConnection(dbConfig);
        
        const [orders] = await connection.execute(`
            SELECT 
                co.*,
                u.username,
                u.first_name,
                u.last_name,
                u.email as user_email,
                GROUP_CONCAT(
                    JSON_OBJECT(
                        'id', coi.id,
                        'filename', coi.image_filename,
                        'original_filename', coi.original_filename,
                        'url', coi.image_url,
                        'upload_order', coi.upload_order
                    )
                ) as images
            FROM custom_orders co
            LEFT JOIN users u ON co.user_id = u.user_id
            LEFT JOIN custom_order_images coi ON co.custom_order_id = coi.custom_order_id
            GROUP BY co.id, u.user_id
            ORDER BY co.created_at DESC
        `);
        
        // Parse images JSON
        const ordersWithImages = orders.map(order => ({
            ...order,
            images: order.images ? JSON.parse(`[${order.images}]`) : []
        }));
        
        await connection.end();
        
        res.json({
            success: true,
            data: ordersWithImages
        });
        
    } catch (error) {
        console.error('Error fetching all custom orders:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch custom orders',
            error: error.message
        });
    }
});

// Update custom order status (admin only)
router.put('/:customOrderId/status', auth, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }
        
        const { customOrderId } = req.params;
        const { status, adminNotes, finalPrice, estimatedDeliveryDate } = req.body;
        
        const connection = await mysql.createConnection(dbConfig);
        
        // Get current status
        const [currentOrder] = await connection.execute(
            'SELECT status FROM custom_orders WHERE custom_order_id = ?',
            [customOrderId]
        );
        
        if (currentOrder.length === 0) {
            await connection.end();
            return res.status(404).json({
                success: false,
                message: 'Custom order not found'
            });
        }
        
        const oldStatus = currentOrder[0].status;
        
        // Update order
        let updateQuery = 'UPDATE custom_orders SET status = ?, updated_at = NOW()';
        let updateParams = [status];
        
        if (adminNotes) {
            updateQuery += ', admin_notes = ?';
            updateParams.push(adminNotes);
        }
        
        if (finalPrice) {
            updateQuery += ', final_price = ?';
            updateParams.push(finalPrice);
        }
        
        if (estimatedDeliveryDate) {
            updateQuery += ', estimated_delivery_date = ?';
            updateParams.push(estimatedDeliveryDate);
        }
        
        updateQuery += ' WHERE custom_order_id = ?';
        updateParams.push(customOrderId);
        
        await connection.execute(updateQuery, updateParams);
        
        // Add status history
        await connection.execute(`
            INSERT INTO custom_order_status_history (
                custom_order_id, old_status, new_status, changed_by, change_reason
            ) VALUES (?, ?, ?, ?, ?)
        `, [customOrderId, oldStatus, status, req.user.user_id, 'Status updated by admin']);
        
        await connection.end();
        
        res.json({
            success: true,
            message: 'Custom order status updated successfully'
        });
        
    } catch (error) {
        console.error('Error updating custom order status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update custom order status',
            error: error.message
        });
    }
});

// Get custom order details by ID
router.get('/:customOrderId', auth, async (req, res) => {
    try {
        const { customOrderId } = req.params;
        const connection = await mysql.createConnection(dbConfig);
        
        // Get order details
        const [orders] = await connection.execute(`
            SELECT 
                co.*,
                u.username,
                u.first_name,
                u.last_name,
                u.email as user_email
            FROM custom_orders co
            LEFT JOIN users u ON co.user_id = u.user_id
            WHERE co.custom_order_id = ? AND (co.user_id = ? OR ? = 'admin')
        `, [customOrderId, req.user.user_id, req.user.role]);
        
        if (orders.length === 0) {
            await connection.end();
            return res.status(404).json({
                success: false,
                message: 'Custom order not found or access denied'
            });
        }
        
        // Get images
        const [images] = await connection.execute(`
            SELECT * FROM custom_order_images 
            WHERE custom_order_id = ? 
            ORDER BY upload_order
        `, [customOrderId]);
        
        // Get status history
        const [statusHistory] = await connection.execute(`
            SELECT 
                cosh.*,
                u.username,
                u.first_name,
                u.last_name
            FROM custom_order_status_history cosh
            LEFT JOIN users u ON cosh.changed_by = u.user_id
            WHERE cosh.custom_order_id = ?
            ORDER BY cosh.created_at DESC
        `, [customOrderId]);
        
        await connection.end();
        
        res.json({
            success: true,
            data: {
                ...orders[0],
                images,
                statusHistory
            }
        });
        
    } catch (error) {
        console.error('Error fetching custom order details:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch custom order details',
            error: error.message
        });
    }
});

// Test endpoint
router.get('/test', (req, res) => {
    res.json({ 
        success: true, 
        message: 'Custom orders API is working!',
        timestamp: new Date().toISOString(),
        endpoints: [
            'GET /api/custom-orders/test',
            'POST /api/custom-orders'
        ]
    });
});

module.exports = router;
