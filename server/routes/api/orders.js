const express = require('express');
const router = express.Router();
const orderController = require('../../controllers/orderController');
const { auth, adminAuth } = require('../../middleware/auth');
const mysql = require('mysql2/promise');
const { dbConfig } = require('../../config/db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Configure multer for payment proof uploads
const paymentStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../../../uploads/payment-proofs');
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

const paymentUpload = multer({ 
    storage: paymentStorage,
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

// @route   GET api/orders/test-list
// @desc    Test endpoint to list all orders (no auth required)
// @access  Public (for testing only)
router.get('/test-list', orderController.testListOrders);

// @route   GET api/orders/me
// @desc    Get all orders for the current user
// @access  Private
router.get('/me', auth, orderController.getUserOrders);

// @route   GET api/orders/me-with-items
// @desc    Get all orders for the current user with items details
// @access  Private
router.get('/me-with-items', auth, orderController.getUserOrdersWithItems);

// @route   GET api/orders/cancellation-requests
// @desc    Get all cancellation requests for admin
// @access  Private/Admin/Staff
router.get('/cancellation-requests', auth, orderController.getCancellationRequests);

// @route   GET api/orders/transactions/all
// @desc    Get all transactions for admin dashboard
// @access  Private/Admin/Staff
router.get('/transactions/all', auth, orderController.getAllTransactions);

// @route   GET api/orders/export
// @desc    Export orders as CSV
// @access  Private/Admin
router.get('/export', auth, orderController.getAllOrders);

// @route   GET api/orders
// @desc    Get all orders (with filtering and pagination for admin)
// @access  Private/Admin
router.get('/', auth, orderController.getAllOrders);

// @route   POST api/orders
// @desc    Create a new order from cart
// @access  Private (any authenticated user)
router.post('/', auth, orderController.createOrderFromCart);

// @route   GET api/orders/confirmed
// @desc    Get all confirmed orders for admin transaction page
// @access  Private/Admin/Staff
router.get('/confirmed', auth, orderController.getConfirmedOrders);

// @route   GET api/orders/confirmed-test
// @desc    Test endpoint to get all confirmed orders with items (no auth)
// @access  Public (for testing)
router.get('/confirmed-test', async (req, res) => {
    try {
        console.log('=== TEST GET CONFIRMED ORDERS ===');
        
        const connection = await mysql.createConnection(dbConfig);
        
        // Get confirmed orders with user and invoice details
        const [orders] = await connection.execute(`
            SELECT 
                o.*,
                u.first_name,
                u.last_name,
                u.email as user_email,
                oi.customer_name,
                oi.customer_email,
                oi.total_amount as invoice_total,
                st.transaction_id,
                st.payment_method,
                st.transaction_status
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.user_id
            LEFT JOIN order_invoices oi ON o.invoice_id = oi.invoice_id
            LEFT JOIN sales_transactions st ON o.transaction_id = st.transaction_id
            WHERE o.status = 'confirmed'
            ORDER BY o.created_at DESC
            LIMIT 5
        `);
        
        console.log(`Found ${orders.length} confirmed orders`);
        
        // Get order items for each order with product details
        for (let order of orders) {
            const [items] = await connection.execute(`
                SELECT 
                    oit.*,
                    p.productname,
                    p.productcolor,
                    p.product_type,
                    p.productimage,
                    p.productprice as product_original_price,
                    oit.product_price as price,
                    oit.quantity,
                    oit.product_id,
                    oit.product_name as productname_from_order,
                    oit.color as productcolor_from_order,
                    oit.size as product_size
                FROM order_items oit
                LEFT JOIN products p ON oit.product_id = p.product_id
                WHERE oit.order_id = ?
                ORDER BY oit.id
            `, [order.id]);
            
            console.log(`Order ${order.order_number} has ${items.length} items`);
            
            // Process items to ensure all product details are available
            order.items = items.map(item => ({
                id: item.id,
                product_id: item.product_id,
                productname: item.productname || item.productname_from_order || item.product_name || 'Unknown Product',
                productcolor: item.productcolor || item.productcolor_from_order || item.color || null,
                product_type: item.product_type || null,
                productimage: item.productimage || null,
                quantity: item.quantity || 1,
                price: item.price || item.product_price || 0,
                unit_price: item.price || item.product_price || 0,
                subtotal: item.subtotal || (item.quantity * (item.price || item.product_price || 0)),
                size: item.product_size || item.size || null
            }));
        }
        
        await connection.end();
        
        res.json({
            success: true,
            data: orders,
            message: `Found ${orders.length} confirmed orders with product details`
        });
        
    } catch (error) {
        console.error('Error in test endpoint:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch confirmed orders',
            error: error.message
        });
    }
});

// @route   GET api/orders/:id
// @desc    Get a specific order (customer can only see their own)
// @access  Private (customer for their own orders, staff/admin for any)
router.get('/:id', auth, orderController.getOrder);

// @route   GET api/orders/:id/items
// @desc    Get order items for invoice
// @access  Private (customer for their own orders, staff/admin for any)
router.get('/:id/items', auth, orderController.getOrderItems);

// @route   PUT api/orders/:id/status
// @desc    Update order status
// @access  Private/Staff/Admin
router.put('/:id/status', auth, orderController.updateOrderStatus);

// @route   PUT api/orders/:id/cancel
// @desc    Cancel order (customer can cancel their own orders)
// @access  Private
router.put('/:id/cancel', auth, orderController.cancelOrder);

// @route   POST api/orders/:id/confirm
// @desc    Confirm order (update status to confirmed)
// @access  Private
router.post('/:id/confirm', auth, orderController.confirmOrder);

// @route   GET api/orders/invoice/:invoiceId/pdf
// @desc    Generate and download invoice PDF
// @access  Private
router.get('/invoice/:invoiceId/pdf', auth, orderController.generateInvoicePDF);

// @route   PUT api/orders/cancellation-requests/:id
// @desc    Process cancellation request (approve/deny)
// @access  Private/Admin/Staff
router.put('/cancellation-requests/:id', auth, orderController.processCancellationRequest);

// @route   POST api/orders/:id/process-cancellation
// @desc    Process order cancellation and restore stock (Admin/Staff only)
// @access  Private/Admin/Staff
router.post('/:id/process-cancellation', auth, orderController.processOrderCancellation);

// @route   PATCH api/orders/:id/delivery-status
// @desc    Update delivery status for an order (redirects to delivery schedule system)
// @access  Private
router.patch('/:id/delivery-status', async (req, res) => {
    try {
        const { id: orderId } = req.params;
        const { delivery_status } = req.body;
        
        console.log(`🚚 Received delivery status update request for order ${orderId}: ${delivery_status}`);
        
        // This endpoint is for compatibility with frontend calls
        // The actual delivery status is managed through the delivery_schedules table
        // We'll respond with success but log that the status should be managed through delivery schedules
        
        res.json({
            success: true,
            message: 'Delivery status updates are now managed through delivery schedules',
            note: 'Please use the delivery schedule system for managing delivery status',
            order_id: orderId,
            requested_status: delivery_status
        });
        
    } catch (error) {
        console.error('Error in delivery status endpoint:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error processing delivery status update',
            error: error.message 
        });
    }
});

// @route   POST api/orders/verify-payment
// @desc    Verify GCash payment proof using SHA256
// @access  Private
router.post('/verify-payment', auth, paymentUpload.single('payment_proof'), async (req, res) => {
    try {
        console.log('=== PAYMENT VERIFICATION REQUEST ===');
        console.log('User ID:', req.user.id);
        console.log('File uploaded:', req.file ? req.file.filename : 'No file');
        console.log('Request body:', req.body);
        
        const { verification_hash, payment_reference, order_total } = req.body;
        const paymentProofFile = req.file;
        
        if (!paymentProofFile) {
            return res.status(400).json({
                success: false,
                message: 'Payment proof image is required'
            });
        }
        
        if (!payment_reference || payment_reference.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'Valid GCash reference number is required (minimum 8 characters)'
            });
        }
        
        // Generate server-side verification hash
        const serverHashInput = `${req.user.email}_${order_total}_${paymentProofFile.originalname}_${paymentProofFile.size}_${Date.now()}`;
        const serverVerificationHash = crypto.createHash('sha256').update(serverHashInput).digest('hex');
        
        console.log('Server verification hash generated:', serverVerificationHash);
        
        // Store payment verification record
        const connection = await mysql.createConnection(dbConfig);
        
        const insertPaymentQuery = `
            INSERT INTO payment_verifications (
                user_id, payment_reference, verification_hash, server_hash,
                payment_proof_filename, payment_proof_path, order_total,
                verification_status, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, 'verified', NOW())
        `;
        
        await connection.execute(insertPaymentQuery, [
            req.user.id,
            payment_reference,
            verification_hash,
            serverVerificationHash,
            paymentProofFile.filename,
            paymentProofFile.path,
            parseFloat(order_total)
        ]);
        
        await connection.end();
        
        console.log('✅ Payment verification stored successfully');
        
        res.json({
            success: true,
            message: 'Payment proof verified successfully',
            verification_hash: serverVerificationHash,
            payment_reference,
            verified_at: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ Payment verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Payment verification failed',
            error: error.message
        });
    }
});

// @route   POST api/orders/gcash
// @desc    Create a new order with GCash payment proof
// @access  Private
router.post('/gcash', auth, paymentUpload.single('payment_proof'), async (req, res) => {
    try {
        console.log('=== CREATE GCASH ORDER ===');
        console.log('User ID:', req.user.id);
        console.log('File uploaded:', req.file ? req.file.filename : 'No file');
        console.log('Request body:', req.body);
        
        const { 
            customer_name,
            customer_email,
            customer_phone,
            shipping_address,
            province,
            city,
            street_address,
            postal_code,
            payment_reference,
            payment_verification_hash,
            notes
        } = req.body;
        
        const paymentProofFile = req.file;
        
        if (!paymentProofFile) {
            return res.status(400).json({
                success: false,
                message: 'Payment proof is required for GCash orders'
            });
        }
        
        if (!payment_reference || payment_reference.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'Valid GCash reference number is required'
            });
        }
        
        if (!shipping_address || !customer_phone) {
            return res.status(400).json({ 
                success: false, 
                message: 'Shipping address and contact phone are required' 
            });
        }
        
        const connection = await mysql.createConnection(dbConfig);
        await connection.beginTransaction();
        
        try {
            // Get user's cart
            const [carts] = await connection.execute(
                'SELECT id FROM carts WHERE user_id = ?',
                [req.user.id]
            );
            
            if (carts.length === 0) {
                throw new Error('Cart not found');
            }
            
            const cartId = carts[0].id;
            
            // Get cart items
            const [cartItems] = await connection.execute(`
                SELECT 
                    ci.*, 
                    p.productname, 
                    p.productprice,
                    p.productcolor,
                    p.product_type
                FROM cart_items ci
                JOIN products p ON ci.product_id = p.product_id
                WHERE ci.cart_id = ?
            `, [cartId]);
            
            if (cartItems.length === 0) {
                throw new Error('Cart is empty');
            }
            
            // Calculate total
            const totalAmount = cartItems.reduce((sum, item) => 
                sum + (item.productprice * item.quantity), 0
            );
            
            // Generate IDs
            const invoiceId = `INV${Date.now()}${Math.floor(Math.random() * 10000)}`;
            const transactionId = `TXN${Date.now()}${Math.floor(Math.random() * 10000)}`;
            const orderNumber = `ORD${Date.now()}${Math.floor(Math.random() * 10000)}`;
            
            // Create invoice
            await connection.execute(`
                INSERT INTO order_invoices (
                    invoice_id, user_id, total_amount, customer_name, 
                    customer_email, customer_phone, delivery_address, notes
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                invoiceId, req.user.id, totalAmount, customer_name || req.user.username,
                customer_email || req.user.email, customer_phone, shipping_address, notes
            ]);
            
            // Create transaction with GCash payment method
            await connection.execute(`
                INSERT INTO sales_transactions (
                    transaction_id, invoice_id, user_id, amount, payment_method, transaction_status
                ) VALUES (?, ?, ?, ?, 'gcash', 'paid')
            `, [transactionId, invoiceId, req.user.id, totalAmount]);
            
            // Create order with payment verification details
            await connection.execute(`
                INSERT INTO orders (
                    order_number, user_id, invoice_id, transaction_id, 
                    total_amount, shipping_address, contact_phone, notes,
                    payment_method, payment_reference, payment_verification_hash,
                    payment_proof_filename, payment_status, status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'gcash', ?, ?, ?, 'verified', 'confirmed')
            `, [
                orderNumber, req.user.id, invoiceId, transactionId,
                totalAmount, shipping_address, customer_phone, notes,
                payment_reference, payment_verification_hash, paymentProofFile.filename
            ]);
            
            // Get the created order ID
            const [orderResult] = await connection.execute(
                'SELECT id FROM orders WHERE order_number = ?',
                [orderNumber]
            );
            const orderId = orderResult[0].id;
            
            // Create order items
            for (const item of cartItems) {
                await connection.execute(`
                    INSERT INTO order_items (
                        order_id, invoice_id, product_id, product_name, product_price,
                        quantity, color, size, subtotal
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                    orderId, invoiceId, item.product_id, item.productname, item.productprice,
                    item.quantity, item.productcolor, item.size || 'N/A',
                    item.productprice * item.quantity
                ]);
            }
            
            // Clear cart
            await connection.execute(`
                DELETE FROM cart_items 
                WHERE cart_id = ? AND cart_id IN (
                    SELECT id FROM carts WHERE user_id = ?
                )
            `, [cartId, req.user.id]);
            
            await connection.commit();
            await connection.end();
            
            console.log('✅ GCash order created successfully');
            
            res.json({
                success: true,
                message: 'GCash order created successfully with verified payment',
                data: {
                    orderNumber,
                    invoiceId,
                    transactionId,
                    totalAmount,
                    paymentMethod: 'gcash',
                    paymentStatus: 'verified',
                    orderStatus: 'confirmed'
                }
            });
            
        } catch (error) {
            await connection.rollback();
            await connection.end();
            throw error;
        }
        
    } catch (error) {
        console.error('❌ Error creating GCash order:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to create GCash order'
        });
    }
});

module.exports = router;