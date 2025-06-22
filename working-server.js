const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

console.log('🚀 Starting Seven Four Clothing Server...');

const app = express();
const PORT = 3001;

// CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3002'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Database configuration
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 's3v3n-f0ur-cl0thing*',
  database: 'seven_four_clothing',
  port: 3306
};

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, 'uploads/custom-orders');
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

// Generate custom order ID
function generateCustomOrderId() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `CUSTOM-${timestamp}-${random}`.toUpperCase();
}

// Test endpoint
app.get('/api/test', (req, res) => {
    res.json({ 
        success: true, 
        message: 'Seven Four Clothing API is running!', 
        timestamp: new Date().toISOString(),
        endpoints: [
            'GET /api/test',
            'GET /api/custom-orders/test', 
            'POST /api/custom-orders'
        ]
    });
});

// Custom orders test endpoint
app.get('/api/custom-orders/test', (req, res) => {
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

// Custom orders endpoint
app.post('/api/custom-orders', upload.array('images', 10), async (req, res) => {
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
            await connection.end();
        }
    }
});

// Error handling middleware
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File too large. Maximum size is 10MB per file.'
            });
        }
        if (error.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                success: false,
                message: 'Too many files. Maximum 10 files allowed.'
            });
        }
    }
    
    if (error.message === 'Only image files are allowed!') {
        return res.status(400).json({
            success: false,
            message: 'Invalid file type. Only image files are allowed.'
        });
    }
    
    console.error('Unhandled error:', error);
    res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Seven Four Clothing Server running on port ${PORT}`);
    console.log(`📝 Test endpoint: http://localhost:${PORT}/api/test`);
    console.log(`📦 Custom orders endpoint: http://localhost:${PORT}/api/custom-orders`);
    console.log(`🧪 Custom orders test: http://localhost:${PORT}/api/custom-orders/test`);
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use. Please stop other processes using this port.`);
        process.exit(1);
    } else {
        console.error('❌ Server error:', err);
        process.exit(1);
    }
});
