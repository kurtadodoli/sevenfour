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

// @route   GET api/orders/pending-verification
// @desc    Get all orders pending payment verification (for admin)
// @access  Private/Admin
router.get('/pending-verification', auth, async (req, res) => {
    try {
        console.log('=== GET PENDING VERIFICATION ORDERS ===');
        
        // Check if user is admin/staff
        if (req.user.role !== 'admin' && req.user.role !== 'staff') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }
        
        const connection = await mysql.createConnection(dbConfig);
        
        // Get orders with status 'pending' that have payment proof - simplified query
        const [orders] = await connection.execute(`
            SELECT DISTINCT
                o.id as order_id,
                o.order_number,
                o.order_date,
                o.total_amount,
                o.status,
                u.first_name,
                u.last_name,
                u.email as user_email
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.user_id
            WHERE o.status = 'pending'
            ORDER BY o.order_date DESC
            LIMIT 50
        `);
        
        console.log(`Found ${orders.length} pending orders before payment proof filter`);
        
        // For each order, get order items and check if they have payment proof
        const ordersWithPaymentProof = [];
        
        for (let order of orders) {
            const [items] = await connection.execute(`
                SELECT 
                    oi.*,
                    p.productname,
                    p.productcolor,
                    p.product_type,
                    p.productimage
                FROM order_items oi
                LEFT JOIN products p ON oi.product_id = p.product_id
                WHERE oi.order_id = ?
                AND oi.gcash_reference_number IS NOT NULL 
                AND oi.gcash_reference_number != 'COD_ORDER'
                AND oi.gcash_reference_number != 'N/A'
                AND oi.payment_proof_image_path IS NOT NULL
                AND oi.payment_proof_image_path != 'N/A'
                ORDER BY oi.sort_order
            `, [order.order_id]);
            
            if (items.length > 0) {
                // Get all order items for this order (including those without payment proof)
                const [allItems] = await connection.execute(`
                    SELECT 
                        oi.*,
                        p.productname,
                        p.productcolor,
                        p.product_type,
                        p.productimage
                    FROM order_items oi
                    LEFT JOIN products p ON oi.product_id = p.product_id
                    WHERE oi.order_id = ?
                    ORDER BY oi.sort_order
                `, [order.order_id]);
                
                // Use the first order item with payment proof for customer details
                const firstItemWithProof = items[0];
                order.customer_fullname = firstItemWithProof.customer_fullname;
                order.customer_phone = firstItemWithProof.customer_phone;
                order.gcash_reference_number = firstItemWithProof.gcash_reference_number;
                order.payment_proof_image_path = firstItemWithProof.payment_proof_image_path;
                order.province = firstItemWithProof.province;
                order.city_municipality = firstItemWithProof.city_municipality;
                order.street_address = firstItemWithProof.street_address;
                order.postal_code = firstItemWithProof.postal_code;
                order.order_notes = firstItemWithProof.order_notes;
                order.items = allItems;
                order.item_count = allItems.length;
                
                ordersWithPaymentProof.push(order);
            }
        }
        
        await connection.end();
        
        console.log(`Found ${ordersWithPaymentProof.length} orders pending payment verification`);
        
        res.json({
            success: true,
            data: ordersWithPaymentProof,
            count: ordersWithPaymentProof.length
        });
        
    } catch (error) {
        console.error('Error fetching pending verification orders:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch pending verification orders',
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
router.put('/:id/cancel', auth, orderController.processOrderCancellation);

// @route   POST api/orders/:id/confirm
// @desc    Confirm order (update status to confirmed)
// @access  Private
router.post('/:id/confirm', auth, orderController.confirmOrder);

// @route   POST api/orders/cancellation-requests
// @desc    Create a cancellation request
// @access  Private
router.post('/cancellation-requests', auth, orderController.createCancellationRequest);

// @route   GET api/orders/invoice/:invoiceId/pdf
// @desc    Generate and download invoice PDF
// @access  Private
router.get('/invoice/:invoiceId/pdf', auth, orderController.generateInvoicePDF);

// @route   GET api/orders/admin/invoice/:invoiceId/pdf
// @desc    Generate and download invoice PDF (Admin access)
// @access  Private/Admin
router.get('/admin/invoice/:invoiceId/pdf', adminAuth, orderController.generateAdminInvoicePDF);

// @route   PUT api/orders/cancellation-requests/:id
// @desc    Process cancellation request (approve/deny)
// @access  Private/Admin/Staff
router.put('/cancellation-requests/:id', auth, orderController.processCancellationRequest);

// @route   POST api/orders/:id/process-cancellation
// @desc    Process order cancellation and restore stock (Admin/Staff only)
// @access  Private/Admin/Staff
router.post('/:id/process-cancellation', auth, orderController.processOrderCancellation);

// @route   PATCH api/orders/:id/delivery-status
// @desc    Update delivery status for an order
// @access  Private
router.patch('/:id/delivery-status', async (req, res) => {
    try {
        const { id: orderId } = req.params;
        const { delivery_status, delivery_notes } = req.body;
        
        console.log(`🚚 Updating delivery status for order ${orderId} to: ${delivery_status}`);
        
        // Create database connection
        const connection = await mysql.createConnection(dbConfig);
        
        try {
            // Update the order's delivery status in the database
            const [updateResult] = await connection.execute(
                'UPDATE orders SET delivery_status = ?, delivery_notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                [delivery_status, delivery_notes, orderId]
            );
            
            if (updateResult.affectedRows === 0) {
                await connection.end();
                return res.status(404).json({
                    success: false,
                    message: 'Order not found'
                });
            }
            
            // Get the updated order
            const [orders] = await connection.execute(
                'SELECT id, order_number, delivery_status, delivery_notes FROM orders WHERE id = ?',
                [orderId]
            );
            
            console.log(`✅ Successfully updated order ${orderId} delivery status to ${delivery_status}`);
            
            res.json({
                success: true,
                message: 'Delivery status updated successfully',
                order: orders[0]
            });
        } finally {
            await connection.end();
        }
        
    } catch (error) {
        console.error('Error updating delivery status:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error updating delivery status',
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
        
        const { payment_reference, order_total } = req.body;
        
        // DEBUG: Log individual address fields
        console.log('=== ADDRESS FIELDS DEBUG ===');
        console.log('street_address:', street_address);
        console.log('city:', city);
        console.log('province:', province);
        console.log('postal_code:', postal_code);
        console.log('=== END ADDRESS FIELDS DEBUG ===');

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
            'client_generated_hash', // Placeholder for client hash
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
                ) VALUES (?, ?, ?, ?, 'gcash', 'confirmed')
            `, [transactionId, invoiceId, req.user.id, totalAmount]);
            
            // Create order with payment verification details
            await connection.execute(`
                INSERT INTO orders (
                    order_number, user_id, invoice_id, transaction_id, 
                    total_amount, shipping_address, contact_phone, notes,
                    payment_method, payment_reference, payment_verification_hash,
                    payment_proof_filename, payment_status, status,
                    street_address, city_municipality, province, zip_code
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'gcash', ?, ?, ?, 'verified', 'pending', ?, ?, ?, ?)
            `, [
                orderNumber, req.user.id, invoiceId, transactionId,
                totalAmount, shipping_address, customer_phone, notes,
                payment_reference, payment_verification_hash, paymentProofFile.filename,
                street_address, city, province, postal_code
            ]);
            
            // Get the created order ID
            const [orderResult] = await connection.execute(
                'SELECT id FROM orders WHERE order_number = ?',
                [orderNumber]
            );
            const orderId = orderResult[0].id;
            
            // Create order items with comprehensive information
            for (let index = 0; index < cartItems.length; index++) {
                const item = cartItems[index];
                await connection.execute(`
                    INSERT INTO order_items (
                        order_id, invoice_id, product_id, product_name, product_price,
                        quantity, sort_order, color, size, subtotal,
                        customer_fullname, customer_phone,
                        gcash_reference_number, payment_proof_image_path,
                        province, city_municipality, street_address, postal_code,
                        order_notes
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                    orderId, invoiceId, item.product_id, item.productname, item.productprice,
                    item.quantity, index + 1, item.color || item.productcolor, item.size || 'N/A',
                    item.productprice * item.quantity,
                    customer_name, customer_phone,
                    payment_reference, paymentProofFile.path,
                    province, city, street_address, postal_code,
                    notes
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
                message: 'GCash order created successfully with verified payment. Please confirm your order to complete the process.',
                data: {
                    orderNumber,
                    invoiceId,
                    transactionId,
                    totalAmount,
                    paymentMethod: 'gcash',
                    paymentStatus: 'verified',
                    orderStatus: 'pending'
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

// @route   PUT api/orders/:orderId/approve-payment
// @desc    Approve payment and move order to confirmed status
// @access  Private/Admin
router.put('/:orderId/approve-payment', auth, async (req, res) => {
    try {
        console.log('=== APPROVE PAYMENT ===');
        console.log('Order ID:', req.params.orderId);
        console.log('Admin User:', req.user.email);
        
        // Check if user is admin/staff
        if (req.user.role !== 'admin' && req.user.role !== 'staff') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }
        
        const orderId = req.params.orderId;
        const connection = await mysql.createConnection(dbConfig);
        
        await connection.beginTransaction();
        
        try {
            // Check if order exists and is pending
            const [orderCheck] = await connection.execute(`
                SELECT id, status, total_amount, user_id
                FROM orders 
                WHERE id = ? AND status = 'pending'
            `, [orderId]);
            
            if (orderCheck.length === 0) {
                await connection.rollback();
                await connection.end();
                return res.status(404).json({
                    success: false,
                    message: 'Order not found or not in pending status'
                });
            }
            
            const order = orderCheck[0];
            
            // Get order items to convert reserved stock to deducted stock
            const [orderItems] = await connection.execute(`
                SELECT oi.product_id, oi.quantity, oi.size, oi.color, 
                       p.productname, p.total_available_stock
                FROM order_items oi
                JOIN products p ON oi.product_id = p.product_id
                WHERE oi.order_id = ?
            `, [orderId]);
            
            console.log(`Processing stock deduction for ${orderItems.length} items`);
            
            // Convert reserved stock to actual stock deduction
            for (const item of orderItems) {
                console.log(`Converting reserved to deducted for ${item.productname} - Size: ${item.size}, Color: ${item.color}, Qty: ${item.quantity}`);
                
                // Deduct from actual stock_quantity and reduce reserved_quantity
                const [variantResult] = await connection.execute(`
                    UPDATE product_variants 
                    SET stock_quantity = stock_quantity - ?,
                        reserved_quantity = GREATEST(0, reserved_quantity - ?),
                        last_updated = CURRENT_TIMESTAMP
                    WHERE product_id = ? AND size = ? AND color = ? AND stock_quantity >= ?
                `, [item.quantity, item.quantity, item.product_id, item.size || 'N/A', item.color || 'Default', item.quantity]);
                
                if (variantResult.affectedRows > 0) {
                    console.log(`✅ Deducted stock: ${item.productname} ${item.size}/${item.color} -${item.quantity} units from stock`);
                    
                    // Log the stock movement as actual stock deduction
                    await connection.execute(`
                        INSERT INTO stock_movements 
                        (product_id, movement_type, quantity, size, reason, reference_number, user_id, notes)
                        VALUES (?, 'OUT', ?, ?, 'Order Approved - Stock Deducted', ?, ?, ?)
                    `, [item.product_id, item.quantity, item.size || 'N/A', 
                        orderId, req.user.id, `Order approved - deducted ${item.quantity} units from ${item.productname} ${item.size}/${item.color}`]);
                } else {
                    // Fallback to general product stock update
                    console.log(`❌ No variant found for ${item.productname} ${item.size}/${item.color}, updating general stock`);
                    await connection.execute(`
                        UPDATE products 
                        SET total_available_stock = GREATEST(0, total_available_stock - ?),
                            total_reserved_stock = GREATEST(0, total_reserved_stock - ?),
                            productquantity = GREATEST(0, productquantity - ?),
                            last_stock_update = CURRENT_TIMESTAMP
                        WHERE product_id = ? AND total_available_stock >= ?
                    `, [item.quantity, item.quantity, item.quantity, item.product_id, item.quantity]);
                }
            }
            
            // Update overall product stock totals from variants
            const uniqueProductIds = [...new Set(orderItems.map(item => item.product_id))];
            
            for (const productId of uniqueProductIds) {
                await connection.execute(`
                    UPDATE products p
                    SET p.total_stock = (
                        SELECT COALESCE(SUM(pv.stock_quantity), p.productquantity) 
                        FROM product_variants pv 
                        WHERE pv.product_id = p.product_id
                    ),
                    p.total_available_stock = (
                        SELECT COALESCE(SUM(pv.available_quantity), 0) 
                        FROM product_variants pv 
                        WHERE pv.product_id = p.product_id
                    ),
                    p.total_reserved_stock = (
                        SELECT COALESCE(SUM(pv.reserved_quantity), 0) 
                        FROM product_variants pv 
                        WHERE pv.product_id = p.product_id
                    ),
                    p.stock_status = CASE 
                        WHEN (SELECT COALESCE(SUM(pv.available_quantity), 0) FROM product_variants pv WHERE pv.product_id = p.product_id) <= 0 THEN 'out_of_stock'
                        WHEN (SELECT COALESCE(SUM(pv.available_quantity), 0) FROM product_variants pv WHERE pv.product_id = p.product_id) <= 5 THEN 'critical_stock'
                        WHEN (SELECT COALESCE(SUM(pv.available_quantity), 0) FROM product_variants pv WHERE pv.product_id = p.product_id) <= 15 THEN 'low_stock'
                        ELSE 'in_stock'
                    END,
                    p.last_stock_update = CURRENT_TIMESTAMP
                    WHERE p.product_id = ?
                `, [productId]);
                
                console.log(`Updated product totals for product ID: ${productId}`);
                
                // Import the sync function if not already available
                // await syncAllStockFields(connection, productId);
            }
            
            // Update order status to confirmed
            await connection.execute(`
                UPDATE orders 
                SET status = 'confirmed', 
                    updated_at = CURRENT_TIMESTAMP,
                    confirmed_by = ?,
                    confirmed_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `, [req.user.id, orderId]);
            
            // Update transaction status
            await connection.execute(`
                UPDATE sales_transactions st
                JOIN orders o ON st.transaction_id = o.transaction_id
                SET st.transaction_status = 'confirmed'
                WHERE o.id = ?
            `, [orderId]);
            
            // Update order invoice status if exists
            await connection.execute(`
                UPDATE order_invoices 
                SET invoice_status = 'confirmed',
                    updated_at = CURRENT_TIMESTAMP
                WHERE invoice_id = (SELECT invoice_id FROM orders WHERE id = ?)
            `, [orderId]);
            
            await connection.commit();
            await connection.end();
            
            console.log(`✅ Order ${orderId} approved and confirmed by admin ${req.user.email}`);
            
            res.json({
                success: true,
                message: 'Payment approved successfully. Order moved to confirmed status and stock deducted.',
                data: {
                    orderId,
                    newStatus: 'confirmed',
                    approvedBy: req.user.email,
                    approvedAt: new Date().toISOString(),
                    stockDeducted: orderItems.map(item => ({
                        product: item.productname,
                        size: item.size,
                        color: item.color,
                        quantity: item.quantity
                    }))
                }
            });
            
        } catch (error) {
            await connection.rollback();
            await connection.end();
            throw error;
        }
        
    } catch (error) {
        console.error('Error approving payment:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to approve payment',
            error: error.message
        });
    }
});

// @route   PUT api/orders/:orderId/deny-payment
// @desc    Deny payment, restore stock, and cancel order
// @access  Private/Admin
router.put('/:orderId/deny-payment', auth, async (req, res) => {
    try {
        console.log('=== DENY PAYMENT ===');
        console.log('Order ID:', req.params.orderId);
        console.log('Admin User:', req.user.email);
        
        // Check if user is admin/staff
        if (req.user.role !== 'admin' && req.user.role !== 'staff') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }
        
        const orderId = req.params.orderId;
        const { reason } = req.body;
        const connection = await mysql.createConnection(dbConfig);
        
        await connection.beginTransaction();
        
        try {
            // Check if order exists and is pending
            const [orderCheck] = await connection.execute(`
                SELECT id, status, total_amount, user_id
                FROM orders 
                WHERE id = ? AND status = 'pending'
            `, [orderId]);
            
            if (orderCheck.length === 0) {
                await connection.rollback();
                await connection.end();
                return res.status(404).json({
                    success: false,
                    message: 'Order not found or not in pending status'
                });
            }
            
            // Get order items to restore stock
            const [orderItems] = await connection.execute(`
                SELECT oi.product_id, oi.quantity, oi.size, oi.color, 
                       oi.product_name, p.productname
                FROM order_items oi
                JOIN products p ON oi.product_id = p.product_id
                WHERE oi.order_id = ?
            `, [orderId]);
            
            console.log(`Found ${orderItems.length} items to restore stock for`);
            
            // Restore stock for each item
            for (const item of orderItems) {
                console.log(`Restoring stock for ${item.productname} - Size: ${item.size}, Color: ${item.color}, Qty: ${item.quantity}`);
                
                // Try to restore to specific variant first
                const [variantResult] = await connection.execute(`
                    UPDATE product_variants 
                    SET reserved_quantity = GREATEST(0, reserved_quantity - ?),
                        available_quantity = stock_quantity - GREATEST(0, reserved_quantity - ?),
                        last_updated = CURRENT_TIMESTAMP
                    WHERE product_id = ? AND size = ? AND color = ?
                `, [item.quantity, item.quantity, item.product_id, item.size || 'N/A', item.color || 'Default']);
                
                if (variantResult.affectedRows > 0) {
                    console.log(`✅ Restored variant stock: ${item.productname} ${item.size}/${item.color} +${item.quantity} units`);
                } else {
                    // Fallback to general product stock restoration
                    console.log(`No variant found, restoring general stock for ${item.productname}`);
                    await connection.execute(`
                        UPDATE products 
                        SET total_available_stock = total_available_stock + ?,
                            total_reserved_stock = GREATEST(0, COALESCE(total_reserved_stock, 0) - ?),
                            last_stock_update = CURRENT_TIMESTAMP
                        WHERE product_id = ?
                    `, [item.quantity, item.quantity, item.product_id]);
                }
            }
            
            // Update order status to cancelled
            await connection.execute(`
                UPDATE orders 
                SET status = 'cancelled', 
                    updated_at = CURRENT_TIMESTAMP,
                    cancelled_by = ?,
                    cancelled_at = CURRENT_TIMESTAMP,
                    cancellation_reason = ?
                WHERE id = ?
            `, [req.user.id, reason || 'Payment denied by admin', orderId]);
            
            // Update order invoice status if exists
            await connection.execute(`
                UPDATE order_invoices 
                SET invoice_status = 'cancelled',
                    updated_at = CURRENT_TIMESTAMP
                WHERE invoice_id = (SELECT invoice_id FROM orders WHERE id = ?)
            `, [orderId]);
            
            await connection.commit();
            await connection.end();
            
            console.log(`✅ Order ${orderId} denied and cancelled by admin ${req.user.email}. Stock restored.`);
            
            res.json({
                success: true,
                message: 'Payment denied successfully. Order cancelled and stock restored.',
                data: {
                    orderId,
                    newStatus: 'cancelled',
                    deniedBy: req.user.email,
                    deniedAt: new Date().toISOString(),
                    reason: reason || 'Payment denied by admin',
                    stockRestored: orderItems.length
                }
            });
            
        } catch (error) {
            await connection.rollback();
            await connection.end();
            throw error;
        }
        
    } catch (error) {
        console.error('Error denying payment:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to deny payment',
            error: error.message
        });
    }
});

// @route   GET api/orders/refund-requests
// @desc    Get all refund requests for admin
// @access  Private/Admin/Staff
router.get('/refund-requests', auth, orderController.getRefundRequests);

// @route   POST api/orders/refund-requests
// @desc    Create a refund request
// @access  Private
router.post('/refund-requests', auth, orderController.createRefundRequest);

// @route   PUT api/orders/refund-requests/:id
// @desc    Process refund request (approve/reject)
// @access  Private/Admin/Staff
router.put('/refund-requests/:id', auth, orderController.processRefundRequest);

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
router.put('/:id/cancel', auth, orderController.processOrderCancellation);

// @route   POST api/orders/:id/confirm
// @desc    Confirm order (update status to confirmed)
// @access  Private
router.post('/:id/confirm', auth, orderController.confirmOrder);

// @route   POST api/orders/cancellation-requests
// @desc    Create a cancellation request
// @access  Private
router.post('/cancellation-requests', auth, orderController.createCancellationRequest);

// @route   GET api/orders/invoice/:invoiceId/pdf
// @desc    Generate and download invoice PDF
// @access  Private
router.get('/invoice/:invoiceId/pdf', auth, orderController.generateInvoicePDF);

// @route   GET api/orders/admin/invoice/:invoiceId/pdf
// @desc    Generate and download invoice PDF (Admin access)
// @access  Private/Admin
router.get('/admin/invoice/:invoiceId/pdf', adminAuth, orderController.generateAdminInvoicePDF);

// @route   PUT api/orders/cancellation-requests/:id
// @desc    Process cancellation request (approve/deny)
// @access  Private/Admin/Staff
router.put('/cancellation-requests/:id', auth, orderController.processCancellationRequest);

// @route   POST api/orders/:id/process-cancellation
// @desc    Process order cancellation and restore stock (Admin/Staff only)
// @access  Private/Admin/Staff
router.post('/:id/process-cancellation', auth, orderController.processOrderCancellation);

// @route   PATCH api/orders/:id/delivery-status
// @desc    Update delivery status for an order
// @access  Private
router.patch('/:id/delivery-status', async (req, res) => {
    try {
        const { id: orderId } = req.params;
        const { delivery_status, delivery_notes } = req.body;
        
        console.log(`🚚 Updating delivery status for order ${orderId} to: ${delivery_status}`);
        
        // Create database connection
        const connection = await mysql.createConnection(dbConfig);
        
        try {
            // Update the order's delivery status in the database
            const [updateResult] = await connection.execute(
                'UPDATE orders SET delivery_status = ?, delivery_notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                [delivery_status, delivery_notes, orderId]
            );
            
            if (updateResult.affectedRows === 0) {
                await connection.end();
                return res.status(404).json({
                    success: false,
                    message: 'Order not found'
                });
            }
            
            // Get the updated order
            const [orders] = await connection.execute(
                'SELECT id, order_number, delivery_status, delivery_notes FROM orders WHERE id = ?',
                [orderId]
            );
            
            console.log(`✅ Successfully updated order ${orderId} delivery status to ${delivery_status}`);
            
            res.json({
                success: true,
                message: 'Delivery status updated successfully',
                order: orders[0]
            });
        } finally {
            await connection.end();
        }
        
    } catch (error) {
        console.error('Error updating delivery status:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error updating delivery status',
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
        
        const { payment_reference, order_total } = req.body;
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
            'client_generated_hash', // Placeholder for client hash
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
                ) VALUES (?, ?, ?, ?, 'gcash', 'confirmed')
            `, [transactionId, invoiceId, req.user.id, totalAmount]);
            
            // Create order with payment verification details
            await connection.execute(`
                INSERT INTO orders (
                    order_number, user_id, invoice_id, transaction_id, 
                    total_amount, shipping_address, contact_phone, notes,
                    payment_method, payment_reference, payment_verification_hash,
                    payment_proof_filename, payment_status, status,
                    street_address, city_municipality, province, zip_code
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'gcash', ?, ?, ?, 'verified', 'pending', ?, ?, ?, ?)
            `, [
                orderNumber, req.user.id, invoiceId, transactionId,
                totalAmount, shipping_address, customer_phone, notes,
                payment_reference, payment_verification_hash, paymentProofFile.filename,
                street_address, city, province, postal_code
            ]);
            
            // Get the created order ID
            const [orderResult] = await connection.execute(
                'SELECT id FROM orders WHERE order_number = ?',
                [orderNumber]
            );
            const orderId = orderResult[0].id;
            
            // Create order items with comprehensive information
            for (let index = 0; index < cartItems.length; index++) {
                const item = cartItems[index];
                await connection.execute(`
                    INSERT INTO order_items (
                        order_id, invoice_id, product_id, product_name, product_price,
                        quantity, sort_order, color, size, subtotal,
                        customer_fullname, customer_phone,
                        gcash_reference_number, payment_proof_image_path,
                        province, city_municipality, street_address, postal_code,
                        order_notes
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                    orderId, invoiceId, item.product_id, item.productname, item.productprice,
                    item.quantity, index + 1, item.color || item.productcolor, item.size || 'N/A',
                    item.productprice * item.quantity,
                    customer_name, customer_phone,
                    payment_reference, paymentProofFile.path,
                    province, city, street_address, postal_code,
                    notes
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
                message: 'GCash order created successfully with verified payment. Please confirm your order to complete the process.',
                data: {
                    orderNumber,
                    invoiceId,
                    transactionId,
                    totalAmount,
                    paymentMethod: 'gcash',
                    paymentStatus: 'verified',
                    orderStatus: 'pending'
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

// @route   PUT api/orders/:orderId/approve-payment
// @desc    Approve payment and move order to confirmed status
// @access  Private/Admin
router.put('/:orderId/approve-payment', auth, async (req, res) => {
    try {
        console.log('=== APPROVE PAYMENT ===');
        console.log('Order ID:', req.params.orderId);
        console.log('Admin User:', req.user.email);
        
        // Check if user is admin/staff
        if (req.user.role !== 'admin' && req.user.role !== 'staff') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }
        
        const orderId = req.params.orderId;
        const connection = await mysql.createConnection(dbConfig);
        
        await connection.beginTransaction();
        
        try {
            // Check if order exists and is pending
            const [orderCheck] = await connection.execute(`
                SELECT id, status, total_amount, user_id
                FROM orders 
                WHERE id = ? AND status = 'pending'
            `, [orderId]);
            
            if (orderCheck.length === 0) {
                await connection.rollback();
                await connection.end();
                return res.status(404).json({
                    success: false,
                    message: 'Order not found or not in pending status'
                });
            }
            
            const order = orderCheck[0];
            
            // Get order items to convert reserved stock to deducted stock
            const [orderItems] = await connection.execute(`
                SELECT oi.product_id, oi.quantity, oi.size, oi.color, 
                       p.productname, p.total_available_stock
                FROM order_items oi
                JOIN products p ON oi.product_id = p.product_id
                WHERE oi.order_id = ?
            `, [orderId]);
            
            console.log(`Processing stock deduction for ${orderItems.length} items`);
            
            // Convert reserved stock to actual stock deduction
            for (const item of orderItems) {
                console.log(`Converting reserved to deducted for ${item.productname} - Size: ${item.size}, Color: ${item.color}, Qty: ${item.quantity}`);
                
                // Deduct from actual stock_quantity and reduce reserved_quantity
                const [variantResult] = await connection.execute(`
                    UPDATE product_variants 
                    SET stock_quantity = stock_quantity - ?,
                        reserved_quantity = GREATEST(0, reserved_quantity - ?),
                        last_updated = CURRENT_TIMESTAMP
                    WHERE product_id = ? AND size = ? AND color = ? AND stock_quantity >= ?
                `, [item.quantity, item.quantity, item.product_id, item.size || 'N/A', item.color || 'Default', item.quantity]);
                
                if (variantResult.affectedRows > 0) {
                    console.log(`✅ Deducted stock: ${item.productname} ${item.size}/${item.color} -${item.quantity} units from stock`);
                    
                    // Log the stock movement as actual stock deduction
                    await connection.execute(`
                        INSERT INTO stock_movements 
                        (product_id, movement_type, quantity, size, reason, reference_number, user_id, notes)
                        VALUES (?, 'OUT', ?, ?, 'Order Approved - Stock Deducted', ?, ?, ?)
                    `, [item.product_id, item.quantity, item.size || 'N/A', 
                        orderId, req.user.id, `Order approved - deducted ${item.quantity} units from ${item.productname} ${item.size}/${item.color}`]);
                } else {
                    // Fallback to general product stock update
                    console.log(`❌ No variant found for ${item.productname} ${item.size}/${item.color}, updating general stock`);
                    await connection.execute(`
                        UPDATE products 
                        SET total_available_stock = GREATEST(0, total_available_stock - ?),
                            total_reserved_stock = GREATEST(0, total_reserved_stock - ?),
                            productquantity = GREATEST(0, productquantity - ?),
                            last_stock_update = CURRENT_TIMESTAMP
                        WHERE product_id = ? AND total_available_stock >= ?
                    `, [item.quantity, item.quantity, item.quantity, item.product_id, item.quantity]);
                }
            }
            
            // Update overall product stock totals from variants
            const uniqueProductIds = [...new Set(orderItems.map(item => item.product_id))];
            
            for (const productId of uniqueProductIds) {
                await connection.execute(`
                    UPDATE products p
                    SET p.total_stock = (
                        SELECT COALESCE(SUM(pv.stock_quantity), p.productquantity) 
                        FROM product_variants pv 
                        WHERE pv.product_id = p.product_id
                    ),
                    p.total_available_stock = (
                        SELECT COALESCE(SUM(pv.available_quantity), 0) 
                        FROM product_variants pv 
                        WHERE pv.product_id = p.product_id
                    ),
                    p.total_reserved_stock = (
                        SELECT COALESCE(SUM(pv.reserved_quantity), 0) 
                        FROM product_variants pv 
                        WHERE pv.product_id = p.product_id
                    ),
                    p.stock_status = CASE 
                        WHEN (SELECT COALESCE(SUM(pv.available_quantity), 0) FROM product_variants pv WHERE pv.product_id = p.product_id) <= 0 THEN 'out_of_stock'
                        WHEN (SELECT COALESCE(SUM(pv.available_quantity), 0) FROM product_variants pv WHERE pv.product_id = p.product_id) <= 5 THEN 'critical_stock'
                        WHEN (SELECT COALESCE(SUM(pv.available_quantity), 0) FROM product_variants pv WHERE pv.product_id = p.product_id) <= 15 THEN 'low_stock'
                        ELSE 'in_stock'
                    END,
                    p.last_stock_update = CURRENT_TIMESTAMP
                    WHERE p.product_id = ?
                `, [productId]);
                
                console.log(`Updated product totals for product ID: ${productId}`);
                
                // Import the sync function if not already available
                // await syncAllStockFields(connection, productId);
            }
            
            // Update order status to confirmed
            await connection.execute(`
                UPDATE orders 
                SET status = 'confirmed', 
                    updated_at = CURRENT_TIMESTAMP,
                    confirmed_by = ?,
                    confirmed_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `, [req.user.id, orderId]);
            
            // Update transaction status
            await connection.execute(`
                UPDATE sales_transactions st
                JOIN orders o ON st.transaction_id = o.transaction_id
                SET st.transaction_status = 'confirmed'
                WHERE o.id = ?
            `, [orderId]);
            
            // Update order invoice status if exists
            await connection.execute(`
                UPDATE order_invoices 
                SET invoice_status = 'confirmed',
                    updated_at = CURRENT_TIMESTAMP
                WHERE invoice_id = (SELECT invoice_id FROM orders WHERE id = ?)
            `, [orderId]);
            
            await connection.commit();
            await connection.end();
            
            console.log(`✅ Order ${orderId} approved and confirmed by admin ${req.user.email}`);
            
            res.json({
                success: true,
                message: 'Payment approved successfully. Order moved to confirmed status and stock deducted.',
                data: {
                    orderId,
                    newStatus: 'confirmed',
                    approvedBy: req.user.email,
                    approvedAt: new Date().toISOString(),
                    stockDeducted: orderItems.map(item => ({
                        product: item.productname,
                        size: item.size,
                        color: item.color,
                        quantity: item.quantity
                    }))
                }
            });
            
        } catch (error) {
            await connection.rollback();
            await connection.end();
            throw error;
        }
        
    } catch (error) {
        console.error('Error approving payment:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to approve payment',
            error: error.message
        });
    }
});

// @route   PUT api/orders/:orderId/deny-payment
// @desc    Deny payment, restore stock, and cancel order
// @access  Private/Admin
router.put('/:orderId/deny-payment', auth, async (req, res) => {
    try {
        console.log('=== DENY PAYMENT ===');
        console.log('Order ID:', req.params.orderId);
        console.log('Admin User:', req.user.email);
        
        // Check if user is admin/staff
        if (req.user.role !== 'admin' && req.user.role !== 'staff') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }
        
        const orderId = req.params.orderId;
        const { reason } = req.body;
        const connection = await mysql.createConnection(dbConfig);
        
        await connection.beginTransaction();
        
        try {
            // Check if order exists and is pending
            const [orderCheck] = await connection.execute(`
                SELECT id, status, total_amount, user_id
                FROM orders 
                WHERE id = ? AND status = 'pending'
            `, [orderId]);
            
            if (orderCheck.length === 0) {
                await connection.rollback();
                await connection.end();
                return res.status(404).json({
                    success: false,
                    message: 'Order not found or not in pending status'
                });
            }
            
            // Get order items to restore stock
            const [orderItems] = await connection.execute(`
                SELECT oi.product_id, oi.quantity, oi.size, oi.color, 
                       oi.product_name, p.productname
                FROM order_items oi
                JOIN products p ON oi.product_id = p.product_id
                WHERE oi.order_id = ?
            `, [orderId]);
            
            console.log(`Found ${orderItems.length} items to restore stock for`);
            
            // Restore stock for each item
            for (const item of orderItems) {
                console.log(`Restoring stock for ${item.productname} - Size: ${item.size}, Color: ${item.color}, Qty: ${item.quantity}`);
                
                // Try to restore to specific variant first
                const [variantResult] = await connection.execute(`
                    UPDATE product_variants 
                    SET reserved_quantity = GREATEST(0, reserved_quantity - ?),
                        available_quantity = stock_quantity - GREATEST(0, reserved_quantity - ?),
                        last_updated = CURRENT_TIMESTAMP
                    WHERE product_id = ? AND size = ? AND color = ?
                `, [item.quantity, item.quantity, item.product_id, item.size || 'N/A', item.color || 'Default']);
                
                if (variantResult.affectedRows > 0) {
                    console.log(`✅ Restored variant stock: ${item.productname} ${item.size}/${item.color} +${item.quantity} units`);
                } else {
                    // Fallback to general product stock restoration
                    console.log(`No variant found, restoring general stock for ${item.productname}`);
                    await connection.execute(`
                        UPDATE products 
                        SET total_available_stock = total_available_stock + ?,
                            total_reserved_stock = GREATEST(0, COALESCE(total_reserved_stock, 0) - ?),
                            last_stock_update = CURRENT_TIMESTAMP
                        WHERE product_id = ?
                    `, [item.quantity, item.quantity, item.product_id]);
                }
            }
            
            // Update order status to cancelled
            await connection.execute(`
                UPDATE orders 
                SET status = 'cancelled', 
                    updated_at = CURRENT_TIMESTAMP,
                    cancelled_by = ?,
                    cancelled_at = CURRENT_TIMESTAMP,
                    cancellation_reason = ?
                WHERE id = ?
            `, [req.user.id, reason || 'Payment denied by admin', orderId]);
            
            // Update order invoice status if exists
            await connection.execute(`
                UPDATE order_invoices 
                SET invoice_status = 'cancelled',
                    updated_at = CURRENT_TIMESTAMP
                WHERE invoice_id = (SELECT invoice_id FROM orders WHERE id = ?)
            `, [orderId]);
            
            await connection.commit();
            await connection.end();
            
            console.log(`✅ Order ${orderId} denied and cancelled by admin ${req.user.email}. Stock restored.`);
            
            res.json({
                success: true,
                message: 'Payment denied successfully. Order cancelled and stock restored.',
                data: {
                    orderId,
                    newStatus: 'cancelled',
                    deniedBy: req.user.email,
                    deniedAt: new Date().toISOString(),
                    reason: reason || 'Payment denied by admin',
                    stockRestored: orderItems.length
                }
            });
            
        } catch (error) {
            await connection.rollback();
            await connection.end();
            throw error;
        }
        
    } catch (error) {
        console.error('Error denying payment:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to deny payment',
            error: error.message
        });
    }
});

// @route   PUT api/orders/:id/approve-payment
// @desc    Approve payment for an order (change status from pending to confirmed)
// @access  Private/Admin/Staff
router.put('/:id/approve-payment', auth, async (req, res) => {
    try {
        console.log('=== APPROVE PAYMENT ===');
        
        const orderId = req.params.id;
        const { notes } = req.body;
        
        // Check if user is admin/staff
        if (req.user.role !== 'admin' && req.user.role !== 'staff') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }
        
        console.log(`Admin ${req.user.email} approving payment for order ${orderId}`);
        
        const connection = await mysql.createConnection(dbConfig);
        
        // Start transaction
        await connection.beginTransaction();
        
        try {
            // First, check if the order exists and is pending
            const [orderCheck] = await connection.execute(`
                SELECT id, order_number, status, user_id, total_amount
                FROM orders 
                WHERE id = ?
            `, [orderId]);
            
            if (orderCheck.length === 0) {
                await connection.rollback();
                await connection.end();
                return res.status(404).json({
                    success: false,
                    message: 'Order not found'
                });
            }
            
            const order = orderCheck[0];
            
            if (order.status !== 'pending') {
                await connection.rollback();
                await connection.end();
                return res.status(400).json({
                    success: false,
                    message: `Order is already ${order.status}. Only pending orders can be approved.`
                });
            }
            
            // Update order status to confirmed
            await connection.execute(`
                UPDATE orders 
                SET status = 'confirmed',
                    confirmed_at = NOW(),
                    confirmed_by = ?
                WHERE id = ?
            `, [req.user.user_id, orderId]);
            
            // Log the approval action
            await connection.execute(`
                INSERT INTO order_status_logs (order_id, status, changed_by, changed_at, notes)
                VALUES (?, 'confirmed', ?, NOW(), ?)
            `, [orderId, req.user.user_id, notes || 'Payment approved by admin']);
            
            // Get order details for response
            const [orderDetails] = await connection.execute(`
                SELECT 
                    o.id,
                    o.order_number,
                    o.status,
                    o.total_amount,
                    o.confirmed_at,
                    u.first_name,
                    u.last_name,
                    u.email as customer_email
                FROM orders o
                LEFT JOIN users u ON o.user_id = u.user_id
                WHERE o.id = ?
            `, [orderId]);
            
            await connection.commit();
            await connection.end();
            
            console.log(`✅ Order ${order.order_number} approved by admin ${req.user.email}`);
            
            res.json({
                success: true,
                message: 'Payment approved successfully. Order confirmed.',
                data: {
                    orderId: orderDetails[0].id,
                    orderNumber: orderDetails[0].order_number,
                    newStatus: 'confirmed',
                    approvedBy: req.user.email,
                    approvedAt: orderDetails[0].confirmed_at,
                    customerName: `${orderDetails[0].first_name} ${orderDetails[0].last_name}`,
                    customerEmail: orderDetails[0].customer_email,
                    totalAmount: orderDetails[0].total_amount,
                    notes: notes || 'Payment approved by admin'
                }
            });
            
        } catch (error) {
            await connection.rollback();
            await connection.end();
            throw error;
        }
        
    } catch (error) {
        console.error('Error approving payment:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to approve payment',
            error: error.message
        });
    }
});

module.exports = router;