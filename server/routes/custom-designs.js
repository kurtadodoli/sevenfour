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
        const uploadDir = path.join(__dirname, '../uploads/custom-designs');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
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

// Generate custom design ID
function generateCustomDesignId() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `DESIGN-${timestamp}-${random}`.toUpperCase();
}

// Map frontend product types to database enum values
function mapProductType(frontendType) {
    const typeMapping = {
        'tshirt': 't-shirts',
        'jacket': 'jackets',
        'sweater': 'sweaters',
        'hoodie': 'hoodies',
        'jersey': 'jerseys',
        'shorts': 'shorts',
        // Handle cases where frontend already sends correct values
        't-shirts': 't-shirts',
        'jackets': 'jackets',
        'sweaters': 'sweaters',
        'hoodies': 'hoodies',
        'jerseys': 'jerseys'
    };
    return typeMapping[frontendType] || frontendType;
}

// Create a new custom design order
// POST route - Create new custom design order (requires authentication)
router.post('/', auth, upload.array('images', 10), async (req, res) => {
    console.log('=== CUSTOM DESIGN ORDER SUBMISSION RECEIVED ===');
    console.log('Authenticated user:', req.user);
    console.log('Request body:', req.body);
    console.log('Uploaded files:', req.files ? req.files.length : 0);

    let connection;      try {
        // Get user information from authentication middleware
        const userId = req.user.id;
        const userEmail = req.user.email;
        
        console.log('👤 Authenticated user:', { userId, userEmail });
        
        // Extract form fields (no email field from frontend - use authenticated user's email)
        const {
            productType,
            firstName, customerName, // Support both firstName and legacy customerName
            lastName,
            customerPhone,
            shippingAddress, streetAddress, // Support both field names
            municipality, city, // Support both municipality and city
            province, // New field from OrderPage.js structure
            postal_code, postalCode, // Support both field names
            productSize,
            productColor,
            productName,
            quantity,
            additionalInfo,
            notes // New field from OrderPage.js structure
        } = req.body;        // Use authenticated user's information
        const finalFirstName = firstName || req.user.first_name || (customerName ? customerName.split(' ')[0] : null) || 'Guest';
        const finalLastName = lastName || req.user.last_name || (customerName ? customerName.split(' ').slice(1).join(' ') : null) || 'User';
        const finalEmail = userEmail; // Always use authenticated user's email
        const finalStreetAddress = shippingAddress || streetAddress;
        const finalCity = municipality || city;
        const finalPostalCode = postal_code || postalCode;
        const finalNotes = additionalInfo || notes;console.log('📋 Validating form data...');
        console.log('🔍 Debug - Received form data:');
        console.log('  productType:', productType);
        console.log('  firstName:', firstName);
        console.log('  finalFirstName:', finalFirstName);
        console.log('  lastName:', lastName);
        console.log('  finalLastName:', finalLastName);
        console.log('  municipality:', municipality);
        console.log('  city:', city);
        console.log('  finalCity:', finalCity);
        console.log('  productSize:', productSize);
        console.log('  productColor:', productColor);
        console.log('  quantity:', quantity);
        console.log('  req.user:', req.user);
        
        // Basic validation (no email validation needed since it comes from auth)
        if (!productType || !finalFirstName || !finalLastName || !finalCity || !productSize || !productColor || !quantity) {
            console.log('❌ Missing required fields');
            console.log('❌ Validation failed for:', {
                productType: !!productType,
                finalFirstName: !!finalFirstName,
                finalLastName: !!finalLastName,
                finalCity: !!finalCity,
                productSize: !!productSize,
                productColor: !!productColor,
                quantity: !!quantity
            });
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: productType, firstName, lastName, city, productSize, productColor, quantity are required'
            });
        }

        // Validate Metro Manila municipality (map to city column)
        const metroManilaCities = [
            'Caloocan', 'Las Piñas', 'Makati', 'Malabon', 'Mandaluyong', 'Manila', 
            'Marikina', 'Muntinlupa', 'Navotas', 'Parañaque', 'Pasay', 'Pasig', 
            'Pateros', 'Quezon City', 'San Juan', 'Taguig', 'Valenzuela'
        ];
        
        if (!metroManilaCities.includes(finalCity)) {
            console.log(`❌ Invalid municipality: ${finalCity}`);
            return res.status(400).json({
                success: false,
                message: 'We currently only serve Metro Manila (NCR). Please select a valid Metro Manila city.'
            });
        }

        // Validate quantity
        const parsedQuantity = parseInt(quantity);
        if (isNaN(parsedQuantity) || parsedQuantity < 1 || parsedQuantity > 100) {
            console.log(`❌ Invalid quantity: ${quantity}`);
            return res.status(400).json({
                success: false,
                message: 'Quantity must be between 1 and 100'
            });
        }        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(finalEmail)) {
            console.log(`❌ Invalid email format: ${finalEmail}`);
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid email address'
            });
        }

        // Validate images
        if (!req.files || req.files.length === 0) {
            console.log('❌ No images uploaded');
            return res.status(400).json({
                success: false,
                message: 'At least one design image is required'
            });
        }

        if (req.files.length > 10) {
            console.log(`❌ Too many images: ${req.files.length}`);
            return res.status(400).json({
                success: false,
                message: 'Maximum 10 images allowed'
            });
        }        console.log('✅ Form validation passed');

        // Map product type to database enum value
        const mappedProductType = mapProductType(productType);
        console.log(`🔄 Mapped product type: '${productType}' -> '${mappedProductType}'`);

        // Create database connection
        connection = await mysql.createConnection(dbConfig);
        console.log('📡 Connected to database');        // Generate unique design ID
        const designId = generateCustomDesignId();
        console.log(`🆔 Generated design ID: ${designId}`);        // Insert custom design record with all required fields
        const insertDesignQuery = `
            INSERT INTO custom_designs (
                design_id, user_id, product_type, product_name, product_color, product_size, quantity,
                additional_info, customer_name, first_name, last_name, email, customer_email, customer_phone,
                street_address, city, house_number, barangay, postal_code,
                status, estimated_price
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 0.00)
        `;        const designValues = [
            designId, // design_id
            userId, // user_id (from authenticated user)
            mappedProductType, // product_type
            productName || `Custom ${mappedProductType}`, // product_name
            productColor, // product_color
            productSize, // product_size            parsedQuantity, // quantity
            finalNotes || null, // additional_info
            `${finalFirstName} ${finalLastName}`.trim(), // customer_name (legacy)
            finalFirstName, // first_name
            finalLastName, // last_name
            finalEmail, // email
            finalEmail, // customer_email (legacy, same as email)
            customerPhone || null, // customer_phone            finalStreetAddress || null, // street_address
            finalCity, // city (maps to municipality)
            null, // house_number (not provided in form)
            null, // barangay (not provided in form)
            finalPostalCode || null // postal_code
        ];

        console.log('💾 Inserting custom design record...');
        const [designResult] = await connection.execute(insertDesignQuery, designValues);
        console.log(`✅ Design record inserted with ID: ${designResult.insertId}`);        // Insert images into custom_design_images table
        const imageInsertQuery = `
            INSERT INTO custom_design_images (design_id, image_filename, original_filename, image_path, image_url, upload_order, created_at)
            VALUES (?, ?, ?, ?, ?, ?, NOW())
        `;

        console.log('📷 Inserting image records...');
        for (let index = 0; index < req.files.length; index++) {
            const file = req.files[index];
            const relativePath = path.relative(path.join(__dirname, '../'), file.path);
            const filename = path.basename(file.path);
            const imageUrl = `/uploads/custom-designs/${filename}`; // URL for frontend access
            
            await connection.execute(imageInsertQuery, [
                designId, // design_id
                filename,
                file.originalname,
                relativePath, // image_path (relative path from server root)
                imageUrl,
                index + 1 // upload_order (1-based)
            ]);
            console.log(`📸 Inserted image: ${file.originalname} -> ${imageUrl}`);
        }

        console.log('✅ All data inserted successfully');

        // Send success response
        res.json({
            success: true,
            message: 'Custom design order submitted successfully!',
            data: {
                designId: designId,
                status: 'pending',
                imageCount: req.files.length,
                estimatedProcessingTime: '3-5 business days'
            }
        });

        console.log('🎉 Custom design order submission completed successfully');    } catch (error) {
        console.error('❌ Custom design submission error:', error);
        console.error('❌ Error stack:', error.stack);
        console.error('❌ Error code:', error.code);
        console.error('❌ Error sqlMessage:', error.sqlMessage);

        // Clean up uploaded files on error
        if (req.files) {
            req.files.forEach(file => {
                try {
                    if (fs.existsSync(file.path)) {
                        fs.unlinkSync(file.path);
                        console.log(`🗑️ Cleaned up file: ${file.path}`);
                    }
                } catch (cleanupError) {
                    console.error('Error cleaning up file:', cleanupError);
                }
            });
        }

        // Handle specific database errors
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                success: false,
                message: 'A design with this ID already exists. Please try again.'
            });
        }

        if (error.code === 'ER_DATA_TOO_LONG') {
            return res.status(400).json({
                success: false,
                message: 'Some of the provided data is too long. Please check your input.'
            });
        }        // Generic error response
        res.status(500).json({
            success: false,
            message: 'Failed to submit custom design order. Please try again later.',
            error: error.message,
            errorCode: error.code,
            sqlMessage: error.sqlMessage,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });

    } finally {
        if (connection) {
            await connection.end();
            console.log('📡 Database connection closed');
        }
    }
});

// Get custom design by ID
router.get('/:designId', async (req, res) => {
    const { designId } = req.params;
    let connection;

    try {
        connection = await mysql.createConnection(dbConfig);

        // Get design details with images
        const query = `
            SELECT 
                cd.*,
                GROUP_CONCAT(
                    JSON_OBJECT(
                        'id', cdi.id,
                        'imagePath', cdi.image_path,
                        'originalFilename', cdi.original_filename,
                        'fileSize', cdi.file_size,
                        'createdAt', cdi.created_at
                    )
                ) as images
            FROM custom_designs cd
            LEFT JOIN custom_design_images cdi ON cd.design_id = cdi.design_id
            WHERE cd.design_id = ?
            GROUP BY cd.design_id
        `;

        const [rows] = await connection.execute(query, [designId]);

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Custom design not found'
            });
        }

        const design = rows[0];
        if (design.images) {
            design.images = JSON.parse(`[${design.images}]`);
        } else {
            design.images = [];
        }

        res.json({
            success: true,
            data: design
        });

    } catch (error) {
        console.error('Error fetching custom design:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch custom design'
        });
    } finally {
        if (connection) {
            await connection.end();
        }
    }
});

// Get all custom designs (admin endpoint)
router.get('/', auth, async (req, res) => {
    let connection;

    try {
        console.log('🔍 GET /api/custom-designs called');
        
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }
        
        connection = await mysql.createConnection(dbConfig);
        console.log('📡 Database connected for GET request');

        const { page = 1, limit = 20, status } = req.query;
        const offset = (page - 1) * limit;
        console.log(`📋 Query params - page: ${page}, limit: ${limit}, offset: ${offset}, status: ${status}`);

        let whereClause = '';
        let queryParams = [];
        
        if (status) {
            whereClause = 'WHERE cd.status = ?';
            queryParams.push(status);
        }
        
        // Use string interpolation for LIMIT and OFFSET to avoid mysql2 parameter binding issues
        const query = `
            SELECT cd.*, 0 as image_count
            FROM custom_designs cd
            ${whereClause}
            ORDER BY cd.created_at DESC
            LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}
        `;

        console.log('📋 Executing query with params:', queryParams);
        console.log('📋 Full query:', query);
        
        const [rows] = await connection.execute(query, queryParams);
        console.log(`✅ Query executed successfully, found ${rows.length} records`);

        // Get total count
        const countQuery = `SELECT COUNT(*) as total FROM custom_designs cd ${whereClause}`;
        const countParams = status ? [status] : [];
        const [countResult] = await connection.execute(countQuery, countParams);
        const total = countResult[0].total;
        console.log(`📊 Total records: ${total}`);

        res.json({
            success: true,
            data: {
                designs: rows,
                pagination: {
                    current_page: parseInt(page),
                    per_page: parseInt(limit),
                    total: total,
                    total_pages: Math.ceil(total / limit)
                }
            }
        });

    } catch (error) {
        console.error('Error fetching custom designs:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch custom designs'
        });
    } finally {
        if (connection) {
            await connection.end();
        }
    }
});

// Get current user's custom orders
router.get('/me', async (req, res) => {
    const userId = req.user.id; // Assuming user ID is available in req.user
    let connection;

    try {
        connection = await mysql.createConnection(dbConfig);

        // Get custom orders for the user
        const query = `
            SELECT cd.*, 0 as image_count
            FROM custom_designs cd
            WHERE cd.customer_id = ?
            ORDER BY cd.created_at DESC
        `;

        const [rows] = await connection.execute(query, [userId]);

        res.json({
            success: true,
            data: rows
        });

    } catch (error) {
        console.error('Error fetching custom orders:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch custom orders'
        });
    } finally {
        if (connection) {
            await connection.end();
        }
    }
});

// Update custom order status
router.patch('/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    let connection;

    try {
        connection = await mysql.createConnection(dbConfig);

        // Update custom design status
        const query = `
            UPDATE custom_designs
            SET status = ?, updated_at = NOW()
            WHERE design_id = ?
        `;

        await connection.execute(query, [status, id]);

        res.json({
            success: true,
            message: 'Custom order status updated successfully'
        });

    } catch (error) {
        console.error('Error updating custom order status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update custom order status'
        });
    } finally {
        if (connection) {
            await connection.end();
        }
    }
});

// GET /custom-orders/me - Get custom orders for current user
router.get('/custom-orders/me', async (req, res) => {
    let connection = null;
    
    try {
        console.log('🔍 Fetching custom orders for current user');
        
        connection = await mysql.createConnection(dbConfig);
        
        // Get user ID from request (assuming authentication middleware sets req.user)
        const userId = req.user?.id || req.session?.userId;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        const query = `
            SELECT 
                cd.*,
                GROUP_CONCAT(cdi.image_path) as image_paths,
                COUNT(cdi.id) as image_count
            FROM custom_designs cd
            LEFT JOIN custom_design_images cdi ON cd.id = cdi.custom_design_id
            WHERE cd.user_id = ?
            GROUP BY cd.id
            ORDER BY cd.created_at DESC
        `;

        console.log('📋 Executing user orders query for user ID:', userId);
        
        const [rows] = await connection.execute(query, [userId]);
        console.log(`✅ Found ${rows.length} custom orders for user`);

        // Process the results to include images as an array
        const orders = rows.map(order => ({
            ...order,
            images: order.image_paths ? order.image_paths.split(',') : [],
            image_paths: undefined // Remove this field
        }));

        res.json({
            success: true,
            data: orders
        });

    } catch (error) {
        console.error('Error fetching user custom orders:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch custom orders'
        });
    } finally {
        if (connection) {
            await connection.end();
        }
    }
});

// GET /custom-orders - Get all custom orders (admin only)
router.get('/custom-orders', async (req, res) => {
    let connection = null;
    
    try {
        console.log('🔍 Fetching all custom orders (admin)');
        
        // Check if user is admin (you might want to add proper middleware for this)
        const userRole = req.user?.role || req.session?.userRole;
        if (userRole !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin only.'
            });
        }
        
        connection = await mysql.createConnection(dbConfig);
        
        const { page = 1, limit = 10, status } = req.query;
        const offset = (page - 1) * limit;

        let whereClause = '';
        let queryParams = [];

        if (status) {
            whereClause = 'WHERE cd.status = ?';
            queryParams.push(status);
        }

        const query = `
            SELECT 
                cd.*,
                GROUP_CONCAT(cdi.image_path) as image_paths,
                COUNT(cdi.id) as image_count
            FROM custom_designs cd
            LEFT JOIN custom_design_images cdi ON cd.id = cdi.custom_design_id
            ${whereClause}
            GROUP BY cd.id
            ORDER BY cd.created_at DESC
            LIMIT ? OFFSET ?
        `;

        queryParams.push(parseInt(limit), parseInt(offset));
        console.log('📋 Executing admin query with params:', queryParams);
        
        const [rows] = await connection.execute(query, queryParams);
        console.log(`✅ Found ${rows.length} custom orders total`);

        // Process the results to include images as an array
        const orders = rows.map(order => ({
            ...order,
            images: order.image_paths ? order.image_paths.split(',') : [],
            image_paths: undefined // Remove this field
        }));

        // Get total count
        const countQuery = `SELECT COUNT(*) as total FROM custom_designs cd ${whereClause}`;
        const countParams = status ? [status] : [];
        const [countResult] = await connection.execute(countQuery, countParams);
        const total = countResult[0].total;

        res.json({
            success: true,
            data: orders,
            pagination: {
                current_page: parseInt(page),
                per_page: parseInt(limit),
                total: total,
                total_pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Error fetching all custom orders:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch custom orders'
        });
    } finally {
        if (connection) {
            await connection.end();
        }
    }
});

// PUT /custom-orders/:id/status - Update custom order status
router.put('/custom-orders/:id/status', async (req, res) => {
    let connection = null;
    
    try {
        const { id } = req.params;
        const { status, admin_notes, final_price } = req.body;
        
        console.log(`🔄 Updating custom order ${id} status to ${status}`);
        
        // Validate status
        const validStatuses = ['pending', 'in_progress', 'completed', 'cancelled', 'rejected'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
            });
        }
        
        connection = await mysql.createConnection(dbConfig);
        
        // Build update query dynamically
        let updateFields = ['status = ?'];
        let updateValues = [status];
        
        if (admin_notes !== undefined) {
            updateFields.push('admin_notes = ?');
            updateValues.push(admin_notes);
        }
        
        if (final_price !== undefined) {
            updateFields.push('final_price = ?');
            updateValues.push(final_price);
        }
        
        updateFields.push('updated_at = NOW()');
        updateValues.push(id);

        const query = `
            UPDATE custom_designs 
            SET ${updateFields.join(', ')}
            WHERE custom_order_id = ?
        `;

        console.log('📝 Executing update query:', query);
        console.log('📝 With values:', updateValues);
        
        const [result] = await connection.execute(query, updateValues);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Custom order not found'
            });
        }

        console.log(`✅ Successfully updated custom order ${id}`);

        res.json({
            success: true,
            message: 'Custom order status updated successfully'
        });

    } catch (error) {
        console.error('Error updating custom order status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update custom order status'
        });
    } finally {
        if (connection) {
            await connection.end();
        }
    }
});

// PUT endpoint to update custom design status (including cancellation)
router.put('/status/:designId', async (req, res) => {
    let connection = null;
    
    try {
        const { designId } = req.params;
        const { status, admin_notes } = req.body;
        
        console.log(`🔄 Updating custom design ${designId} status to ${status}`);
        
        // Validate status
        const validStatuses = ['pending', 'under_review', 'approved', 'in_production', 'ready_for_pickup', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
            });
        }
        
        connection = await mysql.createConnection(dbConfig);
        
        // Update the custom design status
        const updateQuery = `
            UPDATE custom_designs 
            SET status = ?, admin_notes = ?, updated_at = NOW()
            WHERE design_id = ?
        `;

        console.log('📝 Executing update query with values:', [status, admin_notes || null, designId]);
        
        const [result] = await connection.execute(updateQuery, [status, admin_notes || null, designId]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Custom design not found'
            });
        }

        console.log(`✅ Successfully updated custom design ${designId} to ${status}`);

        res.json({
            success: true,
            message: `Custom design ${status === 'cancelled' ? 'cancelled' : 'updated'} successfully`
        });

    } catch (error) {
        console.error('Error updating custom design status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update custom design status'
        });
    } finally {
        if (connection) {
            await connection.end();
        }
    }
});

// Update custom order delivery status
router.patch('/:id/delivery-status', auth, async (req, res) => {
    const { id } = req.params;
    const { delivery_status, delivery_date, delivery_notes } = req.body;
    let connection;

    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }

        // Validate delivery status
        const validStatuses = ['pending', 'in_transit', 'delivered', 'delayed'];
        if (!validStatuses.includes(delivery_status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid delivery status. Must be one of: ' + validStatuses.join(', ')
            });
        }

        connection = await mysql.createConnection(dbConfig);

        // Update custom design delivery status
        const query = `
            UPDATE custom_designs
            SET delivery_status = ?, 
                delivery_date = ?, 
                delivery_notes = ?, 
                updated_at = NOW()
            WHERE design_id = ?
        `;

        const [result] = await connection.execute(query, [
            delivery_status, 
            delivery_date || null, 
            delivery_notes || null, 
            id
        ]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Custom design not found'
            });
        }

        // Get updated design info
        const [updatedDesign] = await connection.execute(`
            SELECT design_id, customer_name, product_type, delivery_status, delivery_date
            FROM custom_designs 
            WHERE design_id = ?
        `, [id]);

        console.log(`✅ Updated delivery status for design ${id} to ${delivery_status} by admin ${req.user.email}`);

        res.json({
            success: true,
            message: `Delivery status updated to ${delivery_status}`,
            data: updatedDesign[0]
        });

    } catch (error) {
        console.error('Error updating custom design delivery status:', error);
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

// Get custom designs with delivery status for admin delivery management
router.get('/admin/delivery-queue', auth, async (req, res) => {
    let connection;

    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }

        connection = await mysql.createConnection(dbConfig);

        // Get approved custom designs for delivery management
        const query = `
            SELECT 
                cd.*,
                u.first_name,
                u.last_name,
                u.email as user_email
            FROM custom_designs cd
            LEFT JOIN users u ON cd.user_id = u.user_id
            WHERE cd.status = 'approved'
            ORDER BY 
                CASE cd.delivery_status
                    WHEN 'delayed' THEN 1
                    WHEN 'pending' THEN 2
                    WHEN 'in_transit' THEN 3
                    WHEN 'delivered' THEN 4
                    ELSE 5
                END,
                cd.created_at ASC
        `;

        const [designs] = await connection.execute(query);        // Transform data for delivery management
        const deliveryQueue = designs.map(design => ({
            id: design.id,
            design_id: design.design_id,
            order_number: design.design_id,
            customer_name: design.customer_name,
            customer_email: design.customer_email,
            customer_phone: design.customer_phone,
            product_type: design.product_type,
            product_color: design.product_color,
            product_size: design.product_size,
            quantity: design.quantity,
            shipping_address: `${design.street_address}, ${design.city}`,
            estimated_price: design.estimated_price,
            final_price: design.final_price,
            status: design.status,
            delivery_status: design.delivery_status || 'pending',
            delivery_date: design.delivery_date,
            delivery_notes: design.delivery_notes,
            design_description: design.additional_info, // Map additional_info to design_description for frontend
            design_notes: design.admin_notes, // Map admin_notes to design_notes for frontend
            created_at: design.created_at,
            updated_at: design.updated_at,
            order_type: 'custom_design'
        }));

        console.log(`✅ Retrieved ${deliveryQueue.length} custom designs for delivery queue`);

        res.json({
            success: true,
            data: deliveryQueue
        });

    } catch (error) {
        console.error('Error fetching custom designs delivery queue:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch delivery queue'
        });
    } finally {
        if (connection) {
            await connection.end();
        }
    }
});

module.exports = router;
