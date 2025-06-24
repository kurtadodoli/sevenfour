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
        const uploadDir = path.join(__dirname, '../../uploads/custom-orders');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
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

// Create a new custom order (with optional authentication)
router.post('/', upload.array('images', 10), async (req, res) => {
    console.log('=== CUSTOM ORDER SUBMISSION RECEIVED ===');
    console.log('Request body:', req.body);
    console.log('Files uploaded:', req.files ? req.files.length : 0);
    
    let connection;
    
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Database connected successfully');
        
        await connection.beginTransaction();        const {
            productType,
            productName = '',
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
        } = req.body;        // Get user_id and email from authentication header if available, otherwise use form data
        let userId = null;
        let userEmail = customerEmail; // Default to form data (for non-authenticated users)
        
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            try {
                const token = authHeader.substring(7);
                const jwt = require('jsonwebtoken');
                const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret');
                userId = decoded.id; // The JWT contains 'id', not 'user_id'
                userEmail = decoded.email; // Use authenticated user's email
                console.log('✅ Authenticated user:', userId, 'Email:', userEmail);
            } catch (err) {
                console.log('⚠️ Invalid or expired token, proceeding without authentication');
            }
        }
          // Convert undefined values to null for MySQL compatibility
        const safeUserId = userId || null;
        const safeProductName = productName || null;
        const safeSpecialInstructions = specialInstructions || null;
        const safeCustomerPhone = customerPhone || null;
        const safeHouseNumber = houseNumber || null;
        const safeBarangay = barangay || null;
        const safePostalCode = postalCode || null;        console.log('📝 Form data received:', {
            productType, productName, size, color, quantity, urgency,
            customerName, 
            customerEmail: userEmail, // Show the automatically detected email
            originalCustomerEmail: customerEmail, // Show the original form email for debugging
            province, municipality, streetNumber,
            specialInstructions: safeSpecialInstructions,
            customerPhone: safeCustomerPhone,
            houseNumber: safeHouseNumber,
            barangay: safeBarangay,
            postalCode: safePostalCode,
            userId: safeUserId
        });
          // Validate required fields
        // For authenticated users, email is not required in form data (taken from token)
        // For non-authenticated users, email is required in form data
        const requiredFields = [productType, size, color, customerName, province, municipality, streetNumber];
        if (!userId && !customerEmail) {
            requiredFields.push('customerEmail (required for non-authenticated users)');
        }
        
        if (requiredFields.some(field => !field)) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: productType, size, color, customerName, province, municipality, streetNumber' + 
                         (!userId ? ', customerEmail' : '')
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
            't-shirts': 1050,
            'shorts': 850,
            'hoodies': 1600,
            'jackets': 1800,
            'sweaters': 1400,
            'jerseys': 1000
        };
        
        const urgencyMultiplier = {
            'standard': 1,
            'express': 1.3,
            'rush': 1.6
        };
        
        const estimatedPrice = (basePrice[productType] || 500) * parseInt(quantity) * (urgencyMultiplier[urgency] || 1);        // Insert custom order
        const insertOrderQuery = `
            INSERT INTO custom_orders (
                custom_order_id, user_id, product_type, product_name, size, color, quantity, urgency,
                special_instructions, customer_name, customer_email, customer_phone,
                province, municipality, street_number, house_number, barangay, postal_code,
                estimated_price, status, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())
        `;
          const [orderResult] = await connection.execute(insertOrderQuery, [
            customOrderId, safeUserId, productType, safeProductName, size, color, quantity, urgency,
            safeSpecialInstructions, customerName, userEmail, safeCustomerPhone,
            province, municipality, streetNumber, safeHouseNumber, safeBarangay, safePostalCode,
            estimatedPrice
        ]);
        
        const orderId = orderResult.insertId;
        console.log('✅ Order inserted with ID:', orderId);        // Insert uploaded images
        for (const file of req.files) {
            const insertImageQuery = `
                INSERT INTO custom_order_images (
                    custom_order_id, image_filename, original_filename, image_path, 
                    image_size, mime_type, upload_order, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
            `;
            
            await connection.execute(insertImageQuery, [
                customOrderId,  // Use the string custom_order_id
                file.filename,  // The generated filename
                file.originalname, // Original filename
                file.path,      // Full file path
                file.size || null,     // File size in bytes
                file.mimetype || null, // MIME type
                0              // Upload order (can be enhanced later)
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
        console.log('🔍 Custom orders /me endpoint hit');        console.log('User:', req.user);
        
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Database connection established');
        
        const userId = req.user.id;  // Changed from req.user.user_id to req.user.id
        
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
        const { status, admin_notes } = req.body;        // Validate status
        const validStatuses = ['pending', 'approved', 'rejected', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
            });
        }

        const connection = await mysql.createConnection(dbConfig);

        // Check if order exists
        const [existingOrder] = await connection.execute(`
            SELECT id, status, customer_email FROM custom_orders WHERE custom_order_id = ?
        `, [customOrderId]);

        if (existingOrder.length === 0) {
            await connection.end();
            return res.status(404).json({
                success: false,
                message: 'Custom order not found'
            });
        }        // Update the order
        await connection.execute(`
            UPDATE custom_orders 
            SET status = ?, admin_notes = ?, updated_at = NOW()
            WHERE custom_order_id = ?
        `, [status, admin_notes || null, customOrderId]);

        // If order is approved, create a delivery order in the orders table
        if (status === 'approved') {
            console.log(`🚚 Creating delivery order for approved custom order ${customOrderId}...`);
            
            // Get the custom order details first
            const [orderDetails] = await connection.execute(`
                SELECT co.*, u.email, u.first_name, u.last_name
                FROM custom_orders co
                LEFT JOIN users u ON co.user_id = u.user_id
                WHERE co.custom_order_id = ?
            `, [customOrderId]);
            
            if (orderDetails.length > 0) {
                const order = orderDetails[0];
                
                // Generate order number for delivery
                const deliveryOrderNumber = `CUSTOM-${customOrderId.slice(-8)}-${Date.now().toString().slice(-4)}`;
                
                // Create invoice first
                const invoiceId = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
                  await connection.execute(`
                    INSERT INTO order_invoices (
                        invoice_id, user_id, customer_name, customer_email, customer_phone,
                        total_amount, invoice_status, created_at
                    ) VALUES (?, ?, ?, ?, ?, ?, 'paid', NOW())
                `, [
                    invoiceId,
                    order.user_id,
                    order.customer_name,
                    order.customer_email || order.email,
                    order.customer_phone,
                    order.estimated_price || 0
                ]);
                  // Create order entry for delivery system
                const [orderResult] = await connection.execute(`
                    INSERT INTO orders (
                        order_number, user_id, invoice_id, status, total_amount,
                        shipping_address, notes, created_at, updated_at
                    ) VALUES (?, ?, ?, 'confirmed', ?, ?, ?, NOW(), NOW())
                `, [
                    deliveryOrderNumber,
                    order.user_id,
                    invoiceId,
                    order.estimated_price || 0,
                    `${order.street_number || ''} ${order.barangay || ''}, ${order.municipality || ''}, ${order.province || ''}`.trim(),
                    `Custom Order: ${order.product_type} | Size: ${order.size} | Color: ${order.color} | Qty: ${order.quantity}${order.special_instructions ? ' | Notes: ' + order.special_instructions : ''} | Reference: ${customOrderId}`
                ]);
                
                const orderId = orderResult.insertId;
                
                // Create order item for the custom product
                await connection.execute(`
                    INSERT INTO order_items (
                        order_id, invoice_id, product_id, product_name, 
                        product_price, quantity, color, size, subtotal
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                    orderId,
                    invoiceId,
                    0, // Custom orders don't have product_id, use 0
                    `Custom ${order.product_type} - ${order.product_name || 'Custom Design'}`,
                    order.estimated_price || 0,
                    order.quantity || 1,
                    order.color,
                    order.size,
                    (order.estimated_price || 0) * (order.quantity || 1)
                ]);
                
                console.log(`✅ Delivery order ${deliveryOrderNumber} created for custom order ${customOrderId}`);
            }
        }

        // Get updated order details
        const [updatedOrder] = await connection.execute(`
            SELECT 
                co.*,
                u.first_name,
                u.last_name,
                u.email as user_email
            FROM custom_orders co
            LEFT JOIN users u ON co.user_id = u.user_id
            WHERE co.custom_order_id = ?
        `, [customOrderId]);        await connection.end();

        const successMessage = status === 'approved' 
            ? `Order ${status} and moved to delivery queue`
            : `Order status updated to ${status}`;

        console.log(`✅ Custom order ${customOrderId} status updated to ${status} by admin ${req.user.email}`);

        res.json({
            success: true,
            message: successMessage,
            data: updatedOrder[0]
        });

    } catch (error) {
        console.error('❌ Error updating custom order status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update order status',
            error: error.message
        });
    }
});

// Admin endpoint to get all custom orders for management (with better filtering)
router.get('/admin/all', auth, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }

        const connection = await mysql.createConnection(dbConfig);
          // Get orders first, then fetch images separately to avoid GROUP_CONCAT issues
        const [orders] = await connection.execute(`
            SELECT 
                co.*,
                u.first_name,
                u.last_name,
                u.email as user_email
            FROM custom_orders co
            LEFT JOIN users u ON co.user_id = u.user_id
            ORDER BY co.created_at DESC
        `);

        // Fetch images for each order separately
        const ordersWithImages = await Promise.all(orders.map(async (order) => {
            try {
                const [images] = await connection.execute(`
                    SELECT 
                        id,
                        image_filename as filename,
                        original_filename,
                        image_size,
                        mime_type,
                        upload_order
                    FROM custom_order_images 
                    WHERE custom_order_id = ?
                    ORDER BY upload_order ASC
                `, [order.custom_order_id]);
                
                return {
                    ...order,
                    images: images || [],
                    image_count: images ? images.length : 0,
                    // Format for display
                    product_display_name: order.product_name || order.product_type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
                    status_display: order.status.replace('_', ' ').toUpperCase(),
                    days_since_order: Math.floor((Date.now() - new Date(order.created_at).getTime()) / (1000 * 60 * 60 * 24))
                };
            } catch (imageError) {
                console.warn(`⚠️ Failed to fetch images for order ${order.custom_order_id}:`, imageError.message);
                return {
                    ...order,
                    images: [],
                    image_count: 0,
                    product_display_name: order.product_name || order.product_type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
                    status_display: order.status.replace('_', ' ').toUpperCase(),
                    days_since_order: Math.floor((Date.now() - new Date(order.created_at).getTime()) / (1000 * 60 * 60 * 24))
                };
            }
        }));

        await connection.end();

        console.log(`📊 Admin retrieved ${ordersWithImages.length} custom orders for management`);

        res.json({
            success: true,
            data: ordersWithImages,
            count: ordersWithImages.length
        });

    } catch (error) {
        console.error('❌ Error fetching custom orders for admin:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch custom orders',
            error: error.message
        });
    }
});

// Get custom orders for the current user (fetches by email primarily)
router.get('/my-orders', auth, async (req, res) => {
    let connection;
    try {
        console.log('🔍 Custom orders /my-orders endpoint hit');
        console.log('User ID:', req.user.id);
        console.log('User email:', req.user.email);
        
        connection = await mysql.createConnection(dbConfig);
        
        const userEmail = req.user.email;
        const userId = req.user.id;
          // Get orders by email primarily (since we now auto-assign email from JWT)
        // Also include user_id for backward compatibility with older orders
        const [orders] = await connection.execute(`
            SELECT *
            FROM custom_orders co
            WHERE co.customer_email = ? OR co.user_id = ?
            ORDER BY co.created_at DESC
        `, [userEmail, userId]);
        
        console.log(`✅ Found ${orders.length} custom orders for email: ${userEmail}`);
        
        // Fetch images for each order separately to avoid GROUP_CONCAT JSON issues
        const ordersWithImages = await Promise.all(orders.map(async (order) => {
            try {
                const [images] = await connection.execute(`
                    SELECT 
                        id,
                        image_filename as filename,
                        original_filename,
                        image_size,
                        mime_type,
                        upload_order
                    FROM custom_order_images 
                    WHERE custom_order_id = ?
                    ORDER BY upload_order ASC
                `, [order.custom_order_id]);
                
                return {
                    ...order,
                    images: images || [],
                    image_count: images ? images.length : 0,
                    // Format product name for better display
                    product_display_name: order.product_name || order.product_type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
                    // Format status for display
                    status_display: order.status.replace('_', ' ').toUpperCase(),
                    // Calculate days since order
                    days_since_order: Math.floor((Date.now() - new Date(order.created_at).getTime()) / (1000 * 60 * 60 * 24))
                };
            } catch (imageError) {
                console.warn(`⚠️ Failed to fetch images for order ${order.custom_order_id}:`, imageError.message);
                return {
                    ...order,
                    images: [],
                    image_count: 0,
                    // Format product name for better display
                    product_display_name: order.product_name || order.product_type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
                    // Format status for display
                    status_display: order.status.replace('_', ' ').toUpperCase(),
                    // Calculate days since order
                    days_since_order: Math.floor((Date.now() - new Date(order.created_at).getTime()) / (1000 * 60 * 60 * 24))
                };
            }
        }));        
        await connection.end();
        
        console.log(`📊 Returning ${ordersWithImages.length} orders with images to frontend`);
        res.json({
            success: true,
            data: ordersWithImages,
            count: ordersWithImages.length
        });
        
    } catch (error) {
        console.error('❌ Error fetching custom orders for OrderPage:', error);
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

// Get custom order details by ID
router.get('/:customOrderId', auth, async (req, res) => {
    try {
        const { customOrderId } = req.params;
        const connection = await mysql.createConnection(dbConfig);
          // Get order details
        const [orders] = await connection.execute(`
            SELECT 
                co.*,
                u.first_name,
                u.last_name,
                u.email as user_email
            FROM custom_orders co
            LEFT JOIN users u ON co.user_id = u.user_id
            WHERE co.custom_order_id = ? AND (co.user_id = ? OR ? = 'admin')
        `, [customOrderId, req.user.id, req.user.role]);
        
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

// Temporary public endpoint for testing
router.get('/test/public', async (req, res) => {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        
        const [orders] = await connection.execute(`            SELECT 
                co.*,
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
        console.error('Error fetching custom orders:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch custom orders',
            error: error.message
        });
    }
});

// TEMPORARY: Test endpoint for custom orders without auth (for testing frontend display)
router.get('/test-all', async (req, res) => {
    let connection;
    try {
        console.log('🔍 Test endpoint: fetching all custom orders (no auth)');
        
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Database connection established');
        
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
            GROUP BY co.id
            ORDER BY co.created_at DESC
        `);
        
        // Parse images JSON
        const ordersWithImages = orders.map(order => ({
            ...order,
            images: order.images ? JSON.parse(`[${order.images}]`) : []
        }));
        
        await connection.end();
        
        console.log(`✅ Retrieved ${ordersWithImages.length} custom orders`);
        
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

// TEMPORARY: Test endpoint for custom DESIGNS without auth (for testing frontend display)
router.get('/designs-test', async (req, res) => {
    let connection;
    try {
        console.log('🔍 Test endpoint: fetching all custom DESIGNS (no auth)');
        
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Database connection established');
        
        const [designs] = await connection.execute(`
            SELECT 
                cd.*,
                GROUP_CONCAT(
                    JSON_OBJECT(
                        'id', cdi.id,
                        'filename', cdi.image_filename,
                        'original_filename', cdi.original_filename,
                        'url', cdi.image_url,
                        'upload_order', cdi.upload_order
                    )
                ) as images
            FROM custom_designs cd
            LEFT JOIN custom_design_images cdi ON cd.design_id = cdi.design_id
            GROUP BY cd.id
            ORDER BY cd.created_at DESC
        `);
        
        // Parse images JSON and transform data to match frontend expectations
        const ordersWithImages = designs.map(design => ({
            // Map custom_designs fields to match what frontend expects
            id: design.id,
            custom_order_id: design.design_id, // Map design_id to custom_order_id
            user_id: design.user_id,
            product_type: design.product_type,
            size: design.product_size, // Map product_size to size
            color: design.product_color, // Map product_color to color
            quantity: design.quantity,
            urgency: 'standard', // Default since custom_designs doesn't have urgency
            special_instructions: design.additional_info, // Map additional_info
            customer_name: design.customer_name,
            customer_email: design.customer_email,
            customer_phone: design.customer_phone,
            province: 'Metro Manila', // Default since custom_designs stores city
            municipality: design.city, // Map city to municipality
            street_number: design.street_address, // Map street_address
            house_number: design.house_number,
            barangay: design.barangay,
            postal_code: design.postal_code,
            status: design.status,
            estimated_price: design.estimated_price,
            final_price: design.final_price,
            payment_status: 'pending', // Default
            payment_method: 'cash_on_delivery', // Default
            admin_notes: design.admin_notes,
            production_notes: null, // Not in custom_designs
            estimated_delivery_date: null,
            actual_delivery_date: null,
            created_at: design.created_at,
            updated_at: design.updated_at,
            images: design.images ? JSON.parse(`[${design.images}]`) : []
        }));
        
        await connection.end();
        
        console.log(`✅ Retrieved ${ordersWithImages.length} custom designs`);
        
        res.json({
            success: true,
            data: ordersWithImages
        });
        
    } catch (error) {
        console.error('❌ Error fetching custom designs:', error);
        if (connection) {
            try {
                await connection.end();
            } catch (closeError) {
                console.error('Error closing connection:', closeError);
            }
        }
        res.status(500);
    }
});

// Update custom order delivery status (Admin only)
router.patch('/:id/delivery-status', auth, async (req, res) => {
    let connection;

    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }

        const customOrderId = req.params.id;
        const { delivery_status, delivery_date, delivery_notes } = req.body;

        // Validate delivery status
        const validStatuses = ['pending', 'scheduled', 'in_transit', 'delivered', 'delayed'];
        if (!validStatuses.includes(delivery_status)) {
            return res.status(400).json({
                success: false,
                message: `Invalid delivery status. Must be one of: ${validStatuses.join(', ')}`
            });
        }

        connection = await mysql.createConnection(dbConfig);

        // Check if custom order exists
        const [orders] = await connection.execute(
            'SELECT id, custom_order_id, customer_name FROM custom_orders WHERE id = ? OR custom_order_id = ?',
            [customOrderId, customOrderId]
        );

        if (orders.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Custom order not found'
            });
        }

        const order = orders[0];

        // Update delivery status
        const updateQuery = `
            UPDATE custom_orders 
            SET delivery_status = ?, 
                delivery_notes = ?,
                actual_delivery_date = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;

        const deliveryDateValue = delivery_status === 'delivered' && delivery_date 
            ? delivery_date 
            : (delivery_status === 'delivered' ? new Date().toISOString().split('T')[0] : null);

        await connection.execute(updateQuery, [
            delivery_status,
            delivery_notes || null,
            deliveryDateValue,
            order.id
        ]);

        console.log(`✅ Updated custom order ${order.custom_order_id} delivery status to: ${delivery_status}`);

        res.json({
            success: true,
            message: `Custom order delivery status updated to ${delivery_status}`,
            data: {
                id: order.id,
                custom_order_id: order.custom_order_id,
                delivery_status: delivery_status,
                delivery_date: deliveryDateValue,
                delivery_notes: delivery_notes || null
            }
        });

    } catch (error) {
        console.error('Error updating custom order delivery status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update delivery status'
        });
    } finally {
        if (connection) {
            await connection.end();
        }
    }
});

module.exports = router;
