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

// Configure multer for payment proof uploads
const paymentProofStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../../uploads/payment-proofs');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'payment-proof-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const paymentProofUpload = multer({ 
    storage: paymentProofStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed for payment proof!'));
        }
    }
});

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
                cop.full_name as payment_full_name,
                cop.contact_number as payment_contact_number,
                cop.gcash_reference as payment_gcash_reference,
                cop.payment_proof_filename,
                cop.payment_amount as payment_amount_submitted,
                cop.created_at as payment_submitted_at,
                cop.admin_notes as payment_admin_notes,
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
            LEFT JOIN custom_order_payments cop ON co.custom_order_id = cop.custom_order_id
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

// Get confirmed custom orders for transaction page (no auth required for admin dashboard)
router.get('/confirmed', async (req, res) => {
    console.log('=== Getting confirmed custom orders for transaction page ===');
    
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        
        // Get confirmed custom orders (payment verified and ready for delivery)
        const [orders] = await connection.execute(`
            SELECT 
                co.*,
                latest_payment.payment_amount,
                latest_payment.gcash_reference,
                latest_payment.payment_proof_filename,
                latest_payment.verified_at,
                latest_payment.admin_notes as payment_admin_notes,
                u.email as user_email,
                u.first_name,
                u.last_name
            FROM custom_orders co
            LEFT JOIN users u ON co.user_id = u.user_id
            LEFT JOIN (
                SELECT 
                    custom_order_id,
                    payment_amount,
                    gcash_reference,
                    payment_proof_filename,
                    verified_at,
                    admin_notes,
                    ROW_NUMBER() OVER (PARTITION BY custom_order_id ORDER BY verified_at DESC) as rn
                FROM custom_order_payments 
                WHERE payment_status = 'verified'
            ) latest_payment ON co.custom_order_id = latest_payment.custom_order_id AND latest_payment.rn = 1
            WHERE co.status = 'confirmed' AND co.payment_status = 'verified'
            ORDER BY co.updated_at DESC
        `);
        
        // Fetch images for each order separately to avoid duplicates
        const ordersWithImages = await Promise.all(orders.map(async (order) => {
            try {
                const [images] = await connection.execute(`
                    SELECT 
                        id,
                        image_filename as filename,
                        original_filename,
                        image_url as url,
                        upload_order
                    FROM custom_order_images 
                    WHERE custom_order_id = ?
                    ORDER BY upload_order ASC
                `, [order.custom_order_id]);
                
                return {
                    ...order,
                    images: images || []
                };
            } catch (imageError) {
                console.warn(`⚠️ Failed to fetch images for order ${order.custom_order_id}:`, imageError.message);
                return {
                    ...order,
                    images: []
                };
            }
        }));
        
        console.log(`Found ${ordersWithImages.length} confirmed custom orders`);
        
        res.json({
            success: true,
            data: ordersWithImages,
            count: ordersWithImages.length
        });
        
    } catch (error) {
        console.error('❌ Error fetching confirmed custom orders:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch confirmed custom orders'
        });
    } finally {
        if (connection) {
            await connection.end();
        }
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
        console.log('\n🚨 CUSTOM ORDER STATUS UPDATE DEBUG:');
        console.log('='.repeat(50));
        console.log('Timestamp:', new Date().toISOString());
        console.log('Custom Order ID:', req.params.customOrderId);
        console.log('Request Body:', req.body);
        console.log('Admin User:', req.user.email);
        console.log('='.repeat(50));
        
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }

        const { customOrderId } = req.params;
        const { status, admin_notes } = req.body;
        
        // Validate status
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
        }

        console.log('📝 BEFORE UPDATE - Order Status:', existingOrder[0].status);

        // Update the order status
        await connection.execute(`
            UPDATE custom_orders 
            SET status = ?, admin_notes = ?, updated_at = NOW()
            WHERE custom_order_id = ?
        `, [status, admin_notes || null, customOrderId]);

        console.log('✅ AFTER UPDATE - New Status:', status);
        console.log('⚠️  CRITICAL: NO DELIVERY ORDER SHOULD BE CREATED AT THIS POINT!');
        
        // ADDITIONAL SAFETY CHECK: Ensure no delivery orders are created during approval
        if (status === 'approved') {
            console.log('🔒 SAFETY CHECK: Verifying no delivery orders were created...');
            
            // Check if any delivery orders were created for this custom order
            const [deliveryOrderCheck] = await connection.execute(`
                SELECT order_number, created_at 
                FROM orders 
                WHERE notes LIKE ?
            `, [`%Reference: ${customOrderId}%`]);
            
            if (deliveryOrderCheck.length > 0) {
                console.log('🚨 CRITICAL ERROR: Delivery order was created during approval!');
                console.log('Delivery orders found:', deliveryOrderCheck);
                
                // Log this as a serious issue but don't fail the request
                console.error('🚨 SYSTEM INTEGRITY VIOLATION: Delivery order created during design approval');
                console.error('This should NEVER happen. Delivery orders should only be created after payment verification.');
                
                // Could optionally delete the erroneous delivery order here
                // but for now just log it for investigation
            } else {
                console.log('✅ SAFETY CHECK PASSED: No delivery orders created during approval');
            }
        }
        
        // Note: When status is 'approved', we don't create delivery order yet
        // The customer needs to submit payment proof first, then admin verifies payment
        // Only after payment verification should the order move to confirmed status and create delivery order
        
        console.log(`✅ Custom order ${customOrderId} status updated to ${status} by admin ${req.user.email}`);

        await connection.end();

        res.json({
            success: true,
            message: `Custom order ${status} successfully`,
            data: {
                customOrderId,
                status,
                admin_notes
            }
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

// Get approved custom orders (admin view)
router.get('/approved', auth, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }

        const connection = await mysql.createConnection(dbConfig);
        
        // Get approved custom orders with user information
        const [orders] = await connection.execute(`
            SELECT 
                co.*,
                u.first_name,
                u.last_name,
                u.email as user_email
            FROM custom_orders co
            LEFT JOIN users u ON co.user_id = u.user_id
            WHERE co.status = 'approved'
            ORDER BY co.created_at DESC
        `);
        
        console.log(`Found ${orders.length} approved custom orders`);
        
        // For now, return orders without images to get the endpoint working
        const ordersWithImages = orders.map(order => ({
            ...order,
            images: []
        }));
        
        await connection.end();
        
        console.log(`📊 Retrieved ${ordersWithImages.length} approved custom orders`);
        
        res.json({
            success: true,
            data: ordersWithImages,
            count: ordersWithImages.length
        });
        
    } catch (error) {
        console.error('❌ Error fetching approved custom orders:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch approved custom orders',
            error: error.message
        });
    }
});

// Get custom order cancellation requests (ADMIN ONLY)
router.get('/cancellation-requests', auth, async (req, res) => {
    console.log('🔍 GET /cancellation-requests called');
    console.log('🔍 User:', req.user);
    
    let connection;
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            console.log('❌ Access denied - user is not admin');
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }
        
        console.log('✅ Admin access granted');
        connection = await mysql.createConnection(dbConfig);
        
        // Get custom order cancellation requests
        const [requests] = await connection.execute(`
            SELECT 
                cor.*,
                co.custom_order_id,
                co.customer_name,
                co.customer_email,
                co.customer_phone,
                co.product_type,
                co.product_name,
                co.size,
                co.color,
                co.quantity,
                co.estimated_price,
                co.final_price,
                co.status as order_status,
                co.province,
                co.municipality,
                co.street_number,
                co.house_number,
                co.barangay,
                co.postal_code,
                co.special_instructions,
                co.created_at as order_created_at,
                u.first_name,
                u.last_name,
                u.email as user_email
            FROM custom_order_cancellation_requests cor
            JOIN custom_orders co ON cor.custom_order_id = co.custom_order_id
            LEFT JOIN users u ON co.user_id = u.user_id
            ORDER BY cor.created_at DESC
        `);
        
        console.log(`✅ Found ${requests.length} custom order cancellation requests`);
        
        res.json({
            success: true,
            data: requests,
            count: requests.length
        });
        
    } catch (error) {
        console.error('❌ Error fetching custom order cancellation requests:', error);
        
        // If the table doesn't exist, return empty array
        if (error.code === 'ER_NO_SUCH_TABLE') {
            console.log('📝 Custom order cancellation requests table does not exist, returning empty array');
            return res.json({
                success: true,
                data: [],
                count: 0
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Failed to fetch custom order cancellation requests',
            error: error.message
        });
    } finally {
        if (connection) {
            await connection.end();
        }
    }
});

// Create custom order cancellation request (authenticated user)
router.post('/cancellation-requests', auth, async (req, res) => {
    console.log('🔍 POST /cancellation-requests called');
    console.log('🔍 User:', req.user);
    console.log('🔍 Request body:', req.body);
    
    let connection;
    try {
        const { customOrderId, reason } = req.body;
        
        // Validate required fields
        if (!customOrderId || !reason) {
            return res.status(400).json({
                success: false,
                message: 'Custom order ID and reason are required'
            });
        }
        
        // Validate reason length
        if (reason.trim().length < 10) {
            return res.status(400).json({
                success: false,
                message: 'Cancellation reason must be at least 10 characters long'
            });
        }
        
        connection = await mysql.createConnection(dbConfig);
        
        // Check if the custom order exists and belongs to the user (or user is admin)
        const [orderCheck] = await connection.execute(`
            SELECT custom_order_id, status, user_id, customer_email, customer_name
            FROM custom_orders 
            WHERE custom_order_id = ?
        `, [customOrderId]);
        
        if (orderCheck.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Custom order not found'
            });
        }
        
        const order = orderCheck[0];
        
        // Check if user has permission to cancel this order
        if (req.user.role !== 'admin' && order.user_id !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to cancel this order'
            });
        }
        
        // Check if order can be cancelled
        if (order.status === 'cancelled' || order.status === 'completed' || order.status === 'delivered') {
            return res.status(400).json({
                success: false,
                message: 'This order cannot be cancelled as it has already been completed, delivered, or cancelled'
            });
        }
        
        // Check if there's already a pending cancellation request
        const [existingRequest] = await connection.execute(`
            SELECT id, status 
            FROM custom_order_cancellation_requests 
            WHERE custom_order_id = ? AND status = 'pending'
        `, [customOrderId]);
        
        if (existingRequest.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'A cancellation request for this order is already pending'
            });
        }
        
        // Create the cancellation request
        const [result] = await connection.execute(`
            INSERT INTO custom_order_cancellation_requests 
            (custom_order_id, user_id, reason, status, created_at, updated_at)
            VALUES (?, ?, ?, 'pending', NOW(), NOW())
        `, [customOrderId, req.user.id, reason.trim()]);
        
        console.log(`✅ Created cancellation request for custom order ${customOrderId} by user ${req.user.id}`);
        
        res.json({
            success: true,
            message: 'Cancellation request submitted successfully',
            data: {
                requestId: result.insertId,
                customOrderId: customOrderId,
                reason: reason.trim(),
                status: 'pending'
            }
        });
        
    } catch (error) {
        console.error('❌ Error creating custom order cancellation request:', error);
        
        // Handle specific MySQL errors
        if (error.code === 'ER_NO_SUCH_TABLE') {
            console.log('📝 Custom order cancellation requests table does not exist');
            return res.status(500).json({
                success: false,
                message: 'Cancellation requests feature is not available. Please contact support.'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Failed to create cancellation request',
            error: error.message
        });
    } finally {
        if (connection) {
            await connection.end();
        }
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

// Simple test endpoint (no auth required)
router.get('/test-public', (req, res) => {
    console.log('✅ Test public endpoint hit');
    res.json({ 
        success: true, 
        message: 'Public endpoint working',
        timestamp: new Date().toISOString()
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
            province: 'National Capital Region', // Default since custom_designs stores city
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
        const validStatuses = ['pending', 'scheduled', 'in_transit', 'delivered', 'delayed', 'cancelled'];
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

// Resolve custom order ID from order number mapping
router.get('/resolve-mapping/:orderNumber', auth, async (req, res) => {
    let connection;

    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }

        const { orderNumber } = req.params;
        connection = await mysql.createConnection(dbConfig);

        console.log(`🔍 Resolving mapping for order number: ${orderNumber}`);

        // First check if this exists in the orders table
        const [ordersResult] = await connection.execute(`
            SELECT id, order_number, user_id, notes 
            FROM orders 
            WHERE order_number = ?
        `, [orderNumber]);

        if (ordersResult.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Order not found in orders table'
            });
        }

        const order = ordersResult[0];
        console.log(`📋 Found in orders table: ID ${order.id}, Notes: ${order.notes}`);

        // Extract the reference from notes
        const referenceMatch = order.notes.match(/Reference: (CUSTOM-[A-Z0-9-]+)/);
        if (!referenceMatch) {
            return res.status(404).json({
                success: false,
                message: 'No custom order reference found in order notes'
            });
        }

        const customOrderReference = referenceMatch[1];
        console.log(`🔍 Looking for custom order with reference: ${customOrderReference}`);

        // Look for this reference in custom_orders table
        const [customOrdersResult] = await connection.execute(`
            SELECT id, custom_order_id, customer_name, status, delivery_status 
            FROM custom_orders 
            WHERE custom_order_id = ?
        `, [customOrderReference]);

        if (customOrdersResult.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Matching custom order not found in custom_orders table'
            });
        }

        const customOrder = customOrdersResult[0];
        console.log(`✅ Found matching custom order: ID ${customOrder.id}, Reference: ${customOrder.custom_order_id}`);

        res.json({
            success: true,
            message: 'Mapping resolved successfully',
            data: {
                orders_table: {
                    id: order.id,
                    order_number: order.order_number,
                    user_id: order.user_id
                },
                custom_orders_table: {
                    id: customOrder.id,
                    custom_order_id: customOrder.custom_order_id,
                    customer_name: customOrder.customer_name,
                    status: customOrder.status,
                    delivery_status: customOrder.delivery_status
                },
                resolved_custom_order_id: customOrder.id
            }
        });

    } catch (error) {
        console.error('Error resolving order mapping:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to resolve order mapping'
        });
    } finally {
        if (connection) {
            await connection.end();
        }
    }
});

// Temporary test endpoint for approved custom orders (no auth required for testing)
router.get('/test-approved', async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        
        // Get approved custom orders with user information
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
            WHERE co.status = 'approved'
            GROUP BY co.id, u.user_id
            ORDER BY co.created_at DESC
        `);
        
        // Parse images JSON
        const ordersWithImages = orders.map(order => ({
            ...order,
            images: order.images ? JSON.parse(`[${order.images}]`) : []
        }));
        
        await connection.end();
        
        console.log(`📊 Retrieved ${ordersWithImages.length} approved custom orders (test endpoint)`);
        
        res.json({
            success: true,
            data: ordersWithImages,
            count: ordersWithImages.length
        });
        
    } catch (error) {
        console.error('❌ Error fetching approved custom orders (test):', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch approved custom orders',
            error: error.message
        });
    }
});

// Submit payment for approved custom order
router.post('/payment', auth, paymentProofUpload.single('paymentProof'), async (req, res) => {
    console.log('=== PAYMENT SUBMISSION RECEIVED ===');
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    console.log('User ID:', req.user.id);
    
    let connection;
    try {
        const { customOrderId, fullName, contactNumber, gcashReference } = req.body;
        
        // Validate required fields
        if (!customOrderId || !fullName || !contactNumber || !gcashReference || !req.file) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required including payment proof'
            });
        }
        
        connection = await mysql.createConnection(dbConfig);
        
        // Verify that the order exists, is approved, and belongs to the user
        const [orderCheck] = await connection.execute(`
            SELECT id, status, final_price, estimated_price, user_id 
            FROM custom_orders 
            WHERE custom_order_id = ? AND user_id = ?
        `, [customOrderId, req.user.id]);
        
        if (orderCheck.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Order not found or does not belong to you'
            });
        }
        
        const order = orderCheck[0];
        
        if (order.status !== 'approved') {
            return res.status(400).json({
                success: false,
                message: 'Order must be approved before payment can be submitted'
            });
        }
        
        // Insert payment information
        const paymentAmount = order.final_price || order.estimated_price;
        
        await connection.execute(`
            INSERT INTO custom_order_payments 
            (custom_order_id, user_id, full_name, contact_number, gcash_reference, 
             payment_proof_filename, payment_amount, payment_status, created_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, 'submitted', NOW())
        `, [
            customOrderId,
            req.user.id,
            fullName,
            contactNumber,
            gcashReference,
            req.file.filename,
            paymentAmount
        ]);
        
        // Update order status to indicate payment submitted
        await connection.execute(`
            UPDATE custom_orders 
            SET payment_status = 'submitted', 
                payment_submitted_at = NOW(),
                updated_at = NOW()
            WHERE custom_order_id = ?
        `, [customOrderId]);
        
        console.log('✅ Payment submitted successfully for order:', customOrderId);
        
        res.json({
            success: true,
            message: 'Payment submitted successfully',
            data: {
                customOrderId,
                paymentAmount,
                paymentProofFilename: req.file.filename
            }
        });
        
    } catch (error) {
        console.error('❌ Error submitting payment:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit payment'
        });
    } finally {
        if (connection) {
            await connection.end();
        }
    }
});

// Admin endpoint to get orders pending payment verification
router.get('/admin/pending-verification', auth, async (req, res) => {
    console.log('=== ADMIN: Getting orders pending payment verification ===');
    
    let connection;
    try {
        // Check if user is admin
        if (req.user.role !== 'admin' && req.user.role !== 'staff') {
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }
        
        connection = await mysql.createConnection(dbConfig);
        
        // Get custom orders with submitted payments pending verification
        const [orders] = await connection.execute(`
            SELECT 
                co.custom_order_id,
                co.customer_name,
                co.customer_email,
                co.product_type,
                co.quantity,
                co.final_price,
                co.status as order_status,
                co.payment_status,
                co.payment_submitted_at,
                cop.id as payment_id,
                cop.full_name as payment_full_name,
                cop.contact_number,
                cop.gcash_reference,
                cop.payment_proof_filename,
                cop.payment_amount,
                cop.payment_status as payment_verification_status,
                cop.created_at as payment_submitted_date,
                u.email as user_email,
                u.first_name,
                u.last_name
            FROM custom_orders co
            JOIN custom_order_payments cop ON co.custom_order_id = cop.custom_order_id
            LEFT JOIN users u ON co.user_id = u.user_id
            WHERE cop.payment_status = 'submitted'
            ORDER BY cop.created_at DESC
        `);
        
        console.log(`Found ${orders.length} orders pending payment verification`);
        
        res.json({
            success: true,
            data: orders,
            count: orders.length
        });
        
    } catch (error) {
        console.error('❌ Error fetching pending verification orders:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch pending verification orders'
        });
    } finally {
        if (connection) {
            await connection.end();
        }
    }
});

// Admin endpoint to approve custom order payment
router.put('/admin/approve-payment/:paymentId', auth, async (req, res) => {
    console.log('=== ADMIN: Approving custom order payment ===');
    console.log('Payment ID:', req.params.paymentId);
    console.log('Admin user:', req.user.email);
    
    let connection;
    try {
        // Check if user is admin
        if (req.user.role !== 'admin' && req.user.role !== 'staff') {
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }
        
        const paymentId = req.params.paymentId;
        const { notes } = req.body;
        
        connection = await mysql.createConnection(dbConfig);
        
        // Get payment details
        const [payments] = await connection.execute(`
            SELECT cop.*, co.custom_order_id, co.customer_name
            FROM custom_order_payments cop
            JOIN custom_orders co ON cop.custom_order_id = co.custom_order_id
            WHERE cop.id = ?
        `, [paymentId]);
        
        if (payments.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }
        
        const payment = payments[0];
        
        // Update payment status to verified
        await connection.execute(`
            UPDATE custom_order_payments 
            SET payment_status = 'verified',
                verified_by = ?,
                verified_at = NOW(),
                admin_notes = ?
            WHERE id = ?
        `, [req.user.id, notes || '', paymentId]);
        
        // Check if delivery order already exists to prevent duplicates
        const [existingDeliveryOrders] = await connection.execute(`
            SELECT order_number FROM orders WHERE notes LIKE ?
        `, [`%${payment.custom_order_id}%`]);
        
        // Update custom order status and payment verification
        await connection.execute(`
            UPDATE custom_orders 
            SET payment_status = 'verified',
                payment_verified_at = NOW(),
                status = 'confirmed',
                final_price = estimated_price,
                payment_notes = ?
            WHERE custom_order_id = ?
        `, [notes || '', payment.custom_order_id]);
        
        // Create delivery order ONLY if it doesn't already exist
        if (existingDeliveryOrders.length === 0) {
            console.log(`🚚 Creating delivery order for payment-approved custom order ${payment.custom_order_id}...`);
            
            // Get the custom order details
            const [orderDetails] = await connection.execute(`
                SELECT co.*, u.email, u.first_name, u.last_name
                FROM custom_orders co
                LEFT JOIN users u ON co.user_id = u.user_id
                WHERE co.custom_order_id = ?
            `, [payment.custom_order_id]);
            
            if (orderDetails.length > 0) {
                const order = orderDetails[0];
                
                // Generate order number for delivery
                const deliveryOrderNumber = `CUSTOM-${payment.custom_order_id.slice(-8)}-${Date.now().toString().slice(-4)}`;
                
                // Create invoice first
                const invoiceId = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
                await connection.execute(`
                    INSERT INTO order_invoices (
                        invoice_id, user_id, customer_name, customer_email, customer_phone,
                        total_amount, delivery_address, invoice_status, created_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, 'paid', NOW())
                `, [
                    invoiceId,
                    order.user_id,
                    order.customer_name || `${order.first_name || ''} ${order.last_name || ''}`.trim() || 'Unknown Customer',
                    order.customer_email || order.email,
                    order.customer_phone,
                    order.estimated_price || 0,
                    `${order.street_number || ''}, ${order.municipality || ''}, Metro Manila`.trim()
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
                    `Custom Order: ${order.product_type} | Size: ${order.size} | Color: ${order.color} | Qty: ${order.quantity}${order.special_instructions ? ' | Notes: ' + order.special_instructions : ''} | Reference: ${payment.custom_order_id}`
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
                
                console.log(`✅ Delivery order ${deliveryOrderNumber} created for payment-approved custom order ${payment.custom_order_id}`);
            }
        } else {
            console.log(`⚠️ Delivery order already exists for ${payment.custom_order_id}:`, existingDeliveryOrders.map(o => o.order_number));
            console.log(`✅ Payment approved without creating duplicate delivery order`);
        }
        
        console.log(`✅ Payment approved for order: ${payment.custom_order_id}`);
        
        res.json({
            success: true,
            message: 'Payment approved successfully',
            data: {
                customOrderId: payment.custom_order_id,
                customerName: payment.customer_name,
                paymentAmount: payment.payment_amount
            }
        });
        
    } catch (error) {
        console.error('❌ Error approving payment:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to approve payment'
        });
    } finally {
        if (connection) {
            await connection.end();
        }
    }
});

// Admin endpoint to reject custom order payment
router.put('/admin/reject-payment/:paymentId', auth, async (req, res) => {
    console.log('=== ADMIN: Rejecting custom order payment ===');
    console.log('Payment ID:', req.params.paymentId);
    
    let connection;
    try {
        // Check if user is admin
        if (req.user.role !== 'admin' && req.user.role !== 'staff') {
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }
        
        const paymentId = req.params.paymentId;
        const { reason } = req.body;
        
        if (!reason) {
            return res.status(400).json({
                success: false,
                message: 'Rejection reason is required'
            });
        }
        
        connection = await mysql.createConnection(dbConfig);
        
        // Get payment details
        const [payments] = await connection.execute(`
            SELECT cop.*, co.custom_order_id, co.customer_name
            FROM custom_order_payments cop
            JOIN custom_orders co ON cop.custom_order_id = co.custom_order_id
            WHERE cop.id = ?
        `, [paymentId]);
        
        if (payments.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }
        
        const payment = payments[0];
        
        // Update payment status to rejected
        await connection.execute(`
            UPDATE custom_order_payments 
            SET payment_status = 'rejected',
                verified_by = ?,
                verified_at = NOW(),
                admin_notes = ?
            WHERE id = ?
        `, [req.user.id, reason, paymentId]);
        
        // Update custom order to reset payment status to pending
        await connection.execute(`
            UPDATE custom_orders 
            SET payment_status = 'pending',
                payment_submitted_at = NULL,
                payment_notes = ?
            WHERE custom_order_id = ?
        `, [reason, payment.custom_order_id]);
        
        console.log(`❌ Payment rejected for order: ${payment.custom_order_id} - Reason: ${reason}`);
        
        res.json({
            success: true,
            message: 'Payment rejected successfully',
            data: {
                customOrderId: payment.custom_order_id,
                customerName: payment.customer_name,
                rejectionReason: reason
            }
        });
        
    } catch (error) {
        console.error('❌ Error rejecting payment:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to reject payment'
        });
    } finally {
        if (connection) {
            await connection.end();
        }
    }
});

// @route   POST /custom-orders/:customOrderId/mark-received
// @desc    Mark custom order as received by customer
// @access  Private
router.post('/:customOrderId/mark-received', auth, async (req, res) => {
    try {
        console.log('=== MARK CUSTOM ORDER AS RECEIVED ===');
        console.log('Custom Order ID:', req.params.customOrderId);
        console.log('User ID:', req.user.id);
        
        const { customOrderId } = req.params;
        const userId = req.user.id;
        
        const connection = await mysql.createConnection(dbConfig);
        
        try {
            // Add debugging for the query
            console.log('🔍 Query parameters:');
            console.log('  - customOrderId:', customOrderId);
            console.log('  - userId:', userId);
            
            // Get user email for debugging
            const [userInfo] = await connection.execute(`
                SELECT email FROM users WHERE user_id = ?
            `, [userId]);
            
            console.log('  - User email:', userInfo.length > 0 ? userInfo[0].email : 'NOT FOUND');
            
            // First, verify the custom order exists and is in deliverable status
            let orderCheckQuery;
            let orderCheckParams;
            let orderCheck = [];
            
            if (userInfo.length > 0 && userInfo[0].email) {
                const currentUserEmail = userInfo[0].email;
                
                // Check if current user is admin or owns the order
                if (req.user.role === 'admin') {
                    console.log('🔑 Admin user detected - checking order exists and is delivered');
                    orderCheckQuery = `
                        SELECT co.*
                        FROM custom_orders co
                        WHERE co.custom_order_id = ? 
                        AND (co.status = 'delivered' OR co.delivery_status = 'delivered')
                    `;
                    orderCheckParams = [customOrderId];
                } else {
                    console.log('👤 Regular user detected - checking ownership and delivery status');
                    orderCheckQuery = `
                        SELECT co.*
                        FROM custom_orders co
                        WHERE co.custom_order_id = ? 
                        AND (co.customer_email = ? OR co.user_id = ?)
                        AND (co.status = 'delivered' OR co.delivery_status = 'delivered')
                    `;
                    orderCheckParams = [customOrderId, currentUserEmail, userId];
                }
                
                [orderCheck] = await connection.execute(orderCheckQuery, orderCheckParams);
                
                console.log('🔍 Order check results:', orderCheck.length, 'orders found');
                
                if (orderCheck.length > 0) {
                    console.log('✅ Found order:', {
                        custom_order_id: orderCheck[0].custom_order_id,
                        customer_email: orderCheck[0].customer_email,
                        status: orderCheck[0].status,
                        delivery_status: orderCheck[0].delivery_status
                    });
                } else {
                    console.log('❌ No matching orders found');
                    
                    // Debug: Check if order exists at all
                    const [orderExists] = await connection.execute(`
                        SELECT custom_order_id, customer_email, status, delivery_status, user_id
                        FROM custom_orders 
                        WHERE custom_order_id = ?
                    `, [customOrderId]);
                    
                    if (orderExists.length > 0) {
                        console.log('🔍 Order exists but failed ownership/status check:');
                        console.log('  - Order user_id:', orderExists[0].user_id);
                        console.log('  - Order customer_email:', orderExists[0].customer_email);
                        console.log('  - Order status:', orderExists[0].status);
                        console.log('  - Order delivery_status:', orderExists[0].delivery_status);
                        console.log('  - Current user_id:', userId);
                        console.log('  - Current user_email:', currentUserEmail);
                    } else {
                        console.log('❌ Order does not exist with ID:', customOrderId);
                    }
                }
            } else {
                console.log('❌ Could not get user email for user_id:', userId);
            }
            
            if (orderCheck.length === 0) {
                await connection.end();
                return res.status(404).json({
                    success: false,
                    message: 'Custom order not found or not eligible for received confirmation'
                });
            }
            
            console.log('✅ Custom order found and verified for user');
            
            // Update custom order to mark as customer-confirmed received
            // Note: We keep status as 'delivered' since 'received' is not a valid enum value
            // This action records that the customer confirmed receipt of their delivered order
            const currentDate = new Date().toISOString().replace('T', ' ').substring(0, 19);
            const receiptNote = `Customer marked as received on ${currentDate}`;
            
            await connection.execute(`
                UPDATE custom_orders 
                SET delivery_notes = CONCAT(IFNULL(delivery_notes, ''), 
                    CASE WHEN delivery_notes IS NOT NULL AND delivery_notes != '' 
                         THEN ' | ' ELSE '' END, ?),
                    updated_at = CURRENT_TIMESTAMP
                WHERE custom_order_id = ?
            `, [receiptNote, customOrderId]);
            
            console.log('✅ Custom order marked as received successfully');
            
            await connection.end();
            
            res.json({
                success: true,
                message: 'Custom order marked as received successfully'
            });
            
        } catch (error) {
            await connection.end();
            throw error;
        }
        
    } catch (error) {
        console.error('❌ Error marking custom order as received:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark custom order as received',
            error: error.message
        });
    }
});

// Process custom order cancellation request (admin only)
router.put('/cancellation-requests/:requestId', auth, async (req, res) => {
    try {
        console.log('🔍 CANCELLATION REQUEST ENDPOINT HIT');
        console.log('🔍 Request ID:', req.params.requestId);
        console.log('🔍 Request body:', JSON.stringify(req.body, null, 2));
        console.log('🔍 User role:', req.user?.role);
        console.log('🔍 Raw body keys:', Object.keys(req.body));
        console.log('🔍 Action value:', JSON.stringify(req.body.action));
        console.log('🔍 Action type:', typeof req.body.action);
        console.log('🔍 Action length:', req.body.action?.length);
        if (req.body.action) {
            console.log('🔍 Action character codes:', Array.from(req.body.action).map(c => c.charCodeAt(0)));
        }
        
        // Check if user is admin
        if (req.user.role !== 'admin') {
            console.log('❌ Access denied - not admin');
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }
        
        const { requestId } = req.params;
        const { action, admin_notes } = req.body;
        
        console.log('🔍 Validation check - action:', action);
        console.log('🔍 Valid actions:', ['approve', 'reject']);
        console.log('🔍 Action includes check:', ['approve', 'reject'].includes(action));
        
        if (!action || !['approve', 'reject'].includes(action)) {
            console.log('❌ VALIDATION FAILED - Invalid action:', action);
            return res.status(400).json({
                success: false,
                message: 'Action must be either "approve" or "reject"'
            });
        }
        
        const connection = await mysql.createConnection(dbConfig);
        
        // Get cancellation request details
        const [requestCheck] = await connection.execute(`
            SELECT cor.*, co.custom_order_id, co.status as order_status
            FROM custom_order_cancellation_requests cor
            JOIN custom_orders co ON cor.custom_order_id = co.custom_order_id
            WHERE cor.id = ?
        `, [requestId]);
        
        if (requestCheck.length === 0) {
            await connection.end();
            return res.status(404).json({
                success: false,
                message: 'Cancellation request not found'
            });
        }
        
        const request = requestCheck[0];
        
        if (request.status !== 'pending') {
            await connection.end();
            return res.status(400).json({
                success: false,
                message: 'Cancellation request has already been processed'
            });
        }
        
        // Update cancellation request status
        await connection.execute(`
            UPDATE custom_order_cancellation_requests 
            SET status = ?, admin_notes = ?, processed_at = NOW(), processed_by = ?
            WHERE id = ?
        `, [action === 'approve' ? 'approved' : 'rejected', admin_notes || '', req.user.id, requestId]);
        
        // If approved, update the custom order status
        if (action === 'approve') {
            await connection.execute(`
                UPDATE custom_orders 
                SET status = 'cancelled', updated_at = NOW()
                WHERE custom_order_id = ?
            `, [request.custom_order_id]);
            
            console.log(`✅ Custom order ${request.custom_order_id} cancelled via approved cancellation request`);
        }
        
        console.log(`✅ Cancellation request ${requestId} ${action}d by admin`);
        
        await connection.end();
        
        res.json({
            success: true,
            message: `Cancellation request ${action}d successfully`,
            data: {
                requestId,
                customOrderId: request.custom_order_id,
                action,
                admin_notes
            }
        });
        
    } catch (error) {
        console.error('❌ Error processing custom order cancellation request:', error);
        
        // If the table doesn't exist, return error
        if (error.code === 'ER_NO_SUCH_TABLE') {
            return res.status(500).json({
                success: false,
                message: 'Cancellation request feature not available for custom orders yet'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Failed to process cancellation request',
            error: error.message
        });
    }
});

module.exports = router;
