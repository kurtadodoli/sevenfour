const mysql = require('mysql2/promise');
const express = require('express');
const multer = require('multer');
const path = require('path');

// Database configuration
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 's3v3n-f0ur-cl0thing*',
    database: 'seven_four_clothing'
};

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, 'uploads/payment-proofs/'));
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'payment-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Simple working order creation endpoint
app.post('/api/orders/simple', upload.single('payment_proof'), async (req, res) => {
    console.log('🚀 SIMPLE ORDER CREATION STARTED');
    console.log('Request body:', req.body);
    console.log('File:', req.file);
    
    let connection;
    
    try {
        // Connect to database
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Database connected');
        
        await connection.beginTransaction();
        console.log('✅ Transaction started');
        
        // Extract data from request
        const {
            customer_name = 'Guest Customer',
            customer_email = 'guest@example.com',
            contact_phone = '09000000000',
            shipping_address = 'Metro Manila',
            street_address = '',
            city_municipality = '',
            province = '',
            zip_code = '',
            notes = '',
            payment_reference = ''
        } = req.body;
        
        const userId = 1; // Default user ID for testing
        
        // Generate unique IDs
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 10000);
        const orderNumber = `ORD${timestamp}${random}`;
        const invoiceId = `INV${timestamp}${random}`;
        const transactionId = `TXN${timestamp}${random}`;
        
        console.log('Generated IDs:', { orderNumber, invoiceId, transactionId });
        
        // Create invoice first
        console.log('📄 Creating invoice...');
        await connection.execute(`
            INSERT INTO order_invoices (
                invoice_id, user_id, total_amount, customer_name, 
                customer_email, customer_phone, delivery_address, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            invoiceId, userId, 4500.00, customer_name,
            customer_email, contact_phone, shipping_address, notes
        ]);
        console.log('✅ Invoice created');
        
        // Create transaction
        console.log('💰 Creating transaction...');
        await connection.execute(`
            INSERT INTO sales_transactions (
                transaction_id, invoice_id, user_id, amount, payment_method, transaction_status
            ) VALUES (?, ?, ?, ?, 'gcash', 'confirmed')
        `, [transactionId, invoiceId, userId, 4500.00]);
        console.log('✅ Transaction created');
        
        // Create order WITHOUT customer_fullname
        console.log('📦 Creating order...');
        await connection.execute(`
            INSERT INTO orders (
                order_number, user_id, invoice_id, transaction_id, 
                total_amount, shipping_address, contact_phone, notes,
                street_address, city_municipality, province, zip_code,
                payment_method, payment_reference, payment_proof_filename,
                payment_status, status, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `, [
            orderNumber, userId, invoiceId, transactionId,
            4500.00, shipping_address, contact_phone, notes,
            street_address, city_municipality, province, zip_code,
            'gcash', payment_reference, req.file ? req.file.filename : 'no-file.jpg',
            'verified', 'pending'
        ]);
        console.log('✅ Order created');
        
        // Get order ID
        const [orderResult] = await connection.execute(
            'SELECT id FROM orders WHERE order_number = ?',
            [orderNumber]
        );
        const orderId = orderResult[0].id;
        console.log('✅ Order ID:', orderId);
        
        // Create a dummy order item
        console.log('📋 Creating order item...');
        await connection.execute(`
            INSERT INTO order_items (
                order_id, invoice_id, product_id, product_name, product_price,
                quantity, color, size, subtotal
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            orderId, invoiceId, 1, 'Test Product', 4500.00,
            1, 'Black', 'L', 4500.00
        ]);
        console.log('✅ Order item created');
        
        await connection.commit();
        console.log('✅ Transaction committed');
        
        res.json({
            success: true,
            message: 'Order created successfully!',
            order: {
                order_number: orderNumber,
                order_id: orderId,
                total_amount: 4500.00,
                status: 'pending'
            }
        });
        
        console.log('🎉 ORDER CREATION COMPLETED SUCCESSFULLY!');
        
    } catch (error) {
        console.error('❌ Order creation failed:', error);
        
        if (connection) {
            try {
                await connection.rollback();
                console.log('↩️ Transaction rolled back');
            } catch (rollbackError) {
                console.error('❌ Rollback failed:', rollbackError);
            }
        }
        
        res.status(500).json({
            success: false,
            message: 'Order creation failed',
            error: error.message
        });
    } finally {
        if (connection) {
            await connection.end();
            console.log('🔌 Database connection closed');
        }
    }
});

// Start server
const PORT = 5001; // Use different port to avoid conflicts
app.listen(PORT, () => {
    console.log(`🚀 SIMPLE ORDER SERVER RUNNING ON PORT ${PORT}`);
    console.log(`Test endpoint: http://localhost:${PORT}/api/orders/simple`);
    console.log('This server bypasses ALL customer_fullname issues!');
});

module.exports = app;
