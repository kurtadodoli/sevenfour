const mysql = require('mysql2/promise');
const { dbConfig } = require('../config/db');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Generate unique IDs
const generateId = (prefix) => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `${prefix}${timestamp}${random}`;
};

// Test endpoint to list all orders (no auth required)
exports.testListOrders = async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        
        const [orders] = await connection.execute(`
            SELECT 
                o.*,
                oi.total_amount as invoice_total,
                oi.invoice_status,
                st.transaction_status,
                st.payment_method
            FROM orders o
            LEFT JOIN order_invoices oi ON o.invoice_id = oi.invoice_id
            LEFT JOIN sales_transactions st ON o.transaction_id = st.transaction_id
            ORDER BY o.order_date DESC
            LIMIT 10
        `);
        
        await connection.end();
        
        console.log(`Found ${orders.length} orders in database`);
        res.json({
            success: true,
            data: orders,
            message: `Found ${orders.length} orders`
        });
    } catch (error) {
        console.error('Error fetching orders (test):', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch orders',
            error: error.message
        });
    }
};

// Get user's orders
exports.getUserOrders = async (req, res) => {
    try {
        console.log('=== GET USER ORDERS DEBUG ===');
        console.log('User ID from token:', req.user.id);
        console.log('User email:', req.user.email);
        console.log('User role:', req.user.role);
        
        const connection = await mysql.createConnection(dbConfig);
        
        const [orders] = await connection.execute(`
            SELECT 
                o.*,
                oi.total_amount as invoice_total,
                oi.invoice_status,
                st.transaction_status,
                st.payment_method
            FROM orders o
            LEFT JOIN order_invoices oi ON o.invoice_id = oi.invoice_id
            LEFT JOIN sales_transactions st ON o.transaction_id = st.transaction_id
            WHERE o.user_id = ?
            ORDER BY o.order_date DESC
        `, [req.user.id]);
        
        console.log(`Found ${orders.length} orders for user ID ${req.user.id}`);
        orders.forEach(order => {
            console.log(`Order ${order.order_number}: user_id=${order.user_id}, total=${order.total_amount}`);
        });
        console.log('=== END GET USER ORDERS DEBUG ===');
        
        await connection.end();
        
        res.json({
            success: true,
            data: orders
        });
    } catch (error) {
        console.error('Error fetching user orders:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch orders' 
        });
    }
};

// Create order from cart
exports.createOrderFromCart = async (req, res) => {
    try {
        console.log('=== CREATE ORDER FROM CART DEBUG ===');
        console.log('User ID from token:', req.user.id);
        console.log('User email:', req.user.email);
        console.log('User role:', req.user.role);
        console.log('Request body:', req.body);
        
        const { 
            shipping_address, 
            contact_phone, 
            notes,
            customer_name,
            customer_email 
        } = req.body;
        
        if (!shipping_address || !contact_phone) {
            return res.status(400).json({ 
                success: false, 
                message: 'Shipping address and contact phone are required' 
            });
        }
        
        const connection = await mysql.createConnection(dbConfig);
        
        // Start transaction
        await connection.beginTransaction();
        
        try {
            // Get user's cart
            const [carts] = await connection.execute(
                'SELECT id FROM carts WHERE user_id = ?',
                [req.user.id]
            );
            
            console.log(`Found ${carts.length} carts for user ID ${req.user.id}`);
            
            if (carts.length === 0) {
                throw new Error('Cart not found');
            }
            
            const cartId = carts[0].id;
            console.log('Using cart ID:', cartId);
            
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
            
            console.log(`Found ${cartItems.length} items in cart`);
            
            if (cartItems.length === 0) {
                throw new Error('Cart is empty');
            }
            
            // Calculate total
            const totalAmount = cartItems.reduce((sum, item) => 
                sum + (item.productprice * item.quantity), 0
            );
            
            console.log('Total amount:', totalAmount);
            
            // Generate IDs
            const invoiceId = generateId('INV');
            const transactionId = generateId('TXN');
            const orderNumber = generateId('ORD');
            
            console.log('Generated IDs:', { invoiceId, transactionId, orderNumber });
            
            // Create invoice
            await connection.execute(`
                INSERT INTO order_invoices (
                    invoice_id, user_id, total_amount, customer_name, 
                    customer_email, customer_phone, delivery_address, notes
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                invoiceId, req.user.id, totalAmount, customer_name || req.user.username,
                customer_email || req.user.email, contact_phone, shipping_address, notes
            ]);
            
            console.log('Invoice created with user_id:', req.user.id);
            
            // Create transaction
            await connection.execute(`
                INSERT INTO sales_transactions (
                    transaction_id, invoice_id, user_id, amount, payment_method
                ) VALUES (?, ?, ?, ?, 'cash_on_delivery')
            `, [transactionId, invoiceId, req.user.id, totalAmount]);
            
            console.log('Transaction created with user_id:', req.user.id);
              // Create order
            await connection.execute(`
                INSERT INTO orders (
                    order_number, user_id, invoice_id, transaction_id, 
                    total_amount, shipping_address, contact_phone, notes
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                orderNumber, req.user.id, invoiceId, transactionId,
                totalAmount, shipping_address, contact_phone, notes
            ]);
            
            // Get the created order ID
            const [orderResult] = await connection.execute(
                'SELECT id FROM orders WHERE order_number = ?',
                [orderNumber]
            );
            const orderId = orderResult[0].id;
            
            console.log('Order created with ID:', orderId, 'for user:', req.user.id);
            console.log('=== END CREATE ORDER DEBUG ===');
            
            // Create order items with proper order_id reference
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
            
            // CRITICAL: Clear only THIS user's cart items with proper verification
            await connection.execute(`
                DELETE FROM cart_items 
                WHERE cart_id = ? AND cart_id IN (
                    SELECT id FROM carts WHERE user_id = ?
                )
            `, [cartId, req.user.id]);
            
            console.log(`Cleared cart ${cartId} for user ${req.user.id} after order creation`);
            
            // Commit transaction
            await connection.commit();
            await connection.end();
            
            res.json({
                success: true,
                message: 'Order created successfully',
                data: {
                    orderNumber,
                    invoiceId,
                    transactionId,
                    totalAmount
                }
            });
            
        } catch (error) {
            await connection.rollback();
            await connection.end();
            throw error;
        }
        
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message || 'Failed to create order' 
        });
    }
};

// Confirm order and update status
exports.confirmOrder = async (req, res) => {
    try {
        const orderId = req.params.id; // Use 'id' instead of 'orderId'
        
        console.log('=== CONFIRM ORDER DEBUG ===');
        console.log('req.user:', req.user);
        console.log('req.user.id:', req.user?.id);
        console.log('orderId:', orderId);
        console.log('typeof req.user.id:', typeof req.user?.id);
        
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                success: false,
                message: 'User authentication required'
            });
        }
        
        // Convert user ID to the appropriate type for database queries
        const userId = req.user.id;
        
        console.log('userId for queries:', userId);
        console.log('typeof userId:', typeof userId);
        
        const connection = await mysql.createConnection(dbConfig);
        
        // Update order status
        console.log('Executing order update query...');
        await connection.execute(`
            UPDATE orders 
            SET status = 'confirmed', updated_at = CURRENT_TIMESTAMP 
            WHERE id = ? AND user_id = ?
        `, [orderId, userId]);
        
        console.log('Order update successful');
        
        // Update transaction status
        console.log('Executing transaction update query...');
        await connection.execute(`
            UPDATE sales_transactions st
            JOIN orders o ON st.transaction_id = o.transaction_id
            SET st.transaction_status = 'confirmed'
            WHERE o.id = ? AND o.user_id = ?
        `, [orderId, userId]);
        
        console.log('Transaction update successful');
        
        // Update invoice status
        console.log('Executing invoice update query...');
        await connection.execute(`
            UPDATE order_invoices oi
            JOIN orders o ON oi.invoice_id = o.invoice_id
            SET oi.invoice_status = 'sent'
            WHERE o.id = ? AND o.user_id = ?
        `, [orderId, userId]);
        
        console.log('Invoice update successful');
        
        await connection.end();
        
        res.json({
            success: true,
            message: 'Order confirmed successfully'
        });
        
    } catch (error) {
        console.error('Error confirming order:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to confirm order' 
        });
    }
};

// Generate PDF invoice
exports.generateInvoicePDF = async (req, res) => {
    try {
        const { invoiceId } = req.params;
        
        const connection = await mysql.createConnection(dbConfig);
        
        // Get invoice details
        const [invoices] = await connection.execute(`
            SELECT oi.*, o.order_number, o.order_date, st.transaction_id, st.transaction_status
            FROM order_invoices oi
            JOIN orders o ON oi.invoice_id = o.invoice_id
            JOIN sales_transactions st ON o.transaction_id = st.transaction_id
            WHERE oi.invoice_id = ? AND oi.user_id = ?
        `, [invoiceId, req.user.id]);
        
        if (invoices.length === 0) {
            await connection.end();
            return res.status(404).json({ 
                success: false, 
                message: 'Invoice not found' 
            });
        }
        
        const invoice = invoices[0];
        
        // Get order items
        const [items] = await connection.execute(`
            SELECT * FROM order_items WHERE invoice_id = ?
        `, [invoiceId]);
        
        await connection.end();
        
        // Create PDF
        const doc = new PDFDocument();
        
        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=invoice-${invoiceId}.pdf`);
        
        // Pipe PDF to response
        doc.pipe(res);
        
        // Add content to PDF
        doc.fontSize(20).text('SEVEN FOUR CLOTHING', { align: 'center' });
        doc.fontSize(16).text('INVOICE', { align: 'center' });
        doc.moveDown();
        
        // Invoice details
        doc.fontSize(12);
        doc.text(`Invoice ID: ${invoice.invoice_id}`);
        doc.text(`Order Number: ${invoice.order_number}`);
        doc.text(`Date: ${new Date(invoice.date).toLocaleDateString()}`);
        doc.text(`Transaction ID: ${invoice.transaction_id}`);
        doc.text(`Status: ${invoice.transaction_status.toUpperCase()}`);
        doc.moveDown();
        
        // Customer details
        doc.text('BILL TO:');
        doc.text(`${invoice.customer_name}`);
        doc.text(`${invoice.customer_email}`);
        doc.text(`${invoice.customer_phone}`);
        doc.text(`${invoice.delivery_address}`);
        doc.moveDown();
        
        // Items table header
        doc.text('ITEMS:', { underline: true });
        doc.moveDown(0.5);
        
        let yPosition = doc.y;
        
        // Items
        items.forEach((item, index) => {
            doc.text(`${index + 1}. ${item.product_name}`);
            doc.text(`   Color: ${item.color} | Size: ${item.size}`);
            doc.text(`   Qty: ${item.quantity} x ₱${item.product_price} = ₱${item.subtotal}`);
            doc.moveDown(0.5);
        });
        
        // Total
        doc.moveDown();
        doc.fontSize(14).text(`TOTAL AMOUNT: ₱${invoice.total_amount}`, { align: 'right' });
        doc.moveDown();
        
        // Payment method
        doc.fontSize(12).text('Payment Method: Cash on Delivery');
        doc.text('Thank you for your business!');
        
        // Finalize PDF
        doc.end();
        
    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to generate invoice PDF' 
        });
    }
};

// Request order cancellation (customer creates cancellation request)
exports.cancelOrder = async (req, res) => {
    try {
        const orderId = req.params.id;
        const { reason } = req.body;
        
        console.log('=== CREATE CANCELLATION REQUEST ===');
        console.log('Order ID:', orderId);
        console.log('User ID:', req.user.id);
        console.log('Cancellation reason:', reason);
        
        if (!reason || !reason.trim()) {
            return res.status(400).json({ 
                success: false, 
                message: 'Cancellation reason is required' 
            });
        }
        
        const connection = await mysql.createConnection(dbConfig);
        
        try {
            // First verify the order belongs to the user and can be cancelled
            const [orderCheck] = await connection.execute(`
                SELECT user_id, status, total_amount, order_number 
                FROM orders 
                WHERE id = ?
            `, [orderId]);
            
            if (orderCheck.length === 0) {
                await connection.end();
                return res.status(404).json({ 
                    success: false, 
                    message: 'Order not found' 
                });
            }
            
            const order = orderCheck[0];
            
            // Only allow users to cancel their own orders
            if (order.user_id !== req.user.id) {
                await connection.end();
                return res.status(403).json({ 
                    success: false, 
                    message: 'Access denied - Order does not belong to this user' 
                });
            }
            
            // Check if order can be cancelled
            const cancellableStatuses = ['pending', 'confirmed', 'processing'];
            if (!cancellableStatuses.includes(order.status)) {
                await connection.end();
                return res.status(400).json({ 
                    success: false, 
                    message: `Cannot cancel order with status: ${order.status}` 
                });
            }
            
            // Check if there's already a pending cancellation request
            const [existingRequest] = await connection.execute(`
                SELECT id, status FROM cancellation_requests 
                WHERE order_id = ? AND status = 'pending'
            `, [orderId]);
            
            if (existingRequest.length > 0) {
                await connection.end();
                return res.status(400).json({ 
                    success: false, 
                    message: 'A cancellation request for this order is already pending' 
                });
            }
            
            // Create cancellation request
            await connection.execute(`
                INSERT INTO cancellation_requests (
                    order_id, user_id, order_number, reason, status
                ) VALUES (?, ?, ?, ?, 'pending')
            `, [orderId, req.user.id, order.order_number, reason.trim()]);
            
            await connection.end();
            
            console.log(`Cancellation request created for order ${orderId} by user ${req.user.id}`);
            
            res.json({
                success: true,
                message: 'Cancellation request submitted successfully. An admin will review your request.',
                data: {
                    orderId,
                    orderNumber: order.order_number,
                    reason: reason.trim(),
                    status: 'pending'
                }
            });
            
        } catch (error) {
            await connection.end();
            throw error;
        }
        
    } catch (error) {
        console.error('Error creating cancellation request:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to submit cancellation request' 
        });
    }
};

// Get all transactions for admin dashboard
exports.getAllTransactions = async (req, res) => {
    try {
        console.log('=== GET ALL TRANSACTIONS ===');
        console.log('User role:', req.user.role);
        
        // Only allow admin/staff to view all transactions
        if (!['admin', 'staff'].includes(req.user.role)) {
            return res.status(403).json({ 
                success: false, 
                message: 'Access denied - Admin/staff only' 
            });
        }
        
        const connection = await mysql.createConnection(dbConfig);
        
        const { status, page = 1, limit = 10, search } = req.query;
        const offset = (page - 1) * limit;
        
        let whereClause = '1=1';
        let queryParams = [];
        
        // Add status filter
        if (status && status !== 'all') {
            whereClause += ' AND st.transaction_status = ?';
            queryParams.push(status);
        }
        
        // Add search filter
        if (search) {
            whereClause += ` AND (
                st.transaction_id LIKE ? OR 
                o.order_number LIKE ? OR 
                u.email LIKE ? OR 
                u.username LIKE ?
            )`;
            const searchTerm = `%${search}%`;
            queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
        }
          // Get transactions with order and user details
        const [transactions] = await connection.execute(`
            SELECT 
                st.*,
                o.order_number,
                o.status as order_status,
                o.shipping_address,
                o.contact_phone,
                o.order_date,
                oi.customer_name,
                oi.customer_email,
                oi.total_amount as invoice_total,
                oi.invoice_status,
                u.username,
                u.email as user_email,
                u.first_name,
                u.last_name
            FROM sales_transactions st
            LEFT JOIN orders o ON st.transaction_id = (
                SELECT transaction_id FROM orders WHERE transaction_id = st.transaction_id LIMIT 1
            )
            LEFT JOIN order_invoices oi ON st.invoice_id = oi.invoice_id
            LEFT JOIN users u ON st.user_id = u.user_id
            WHERE ${whereClause}
            ORDER BY st.created_at DESC
            LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}
        `, queryParams);
          // Get total count for pagination
        const [countResult] = await connection.execute(`
            SELECT COUNT(*) as total
            FROM sales_transactions st
            LEFT JOIN orders o ON st.transaction_id = (
                SELECT transaction_id FROM orders WHERE transaction_id = st.transaction_id LIMIT 1
            )
            LEFT JOIN order_invoices oi ON st.invoice_id = oi.invoice_id
            LEFT JOIN users u ON st.user_id = u.user_id
            WHERE ${whereClause}
        `, queryParams);
        
        const total = countResult[0].total;
        
        await connection.end();
        
        console.log(`Found ${transactions.length} transactions (${total} total)`);
        
        res.json({
            success: true,
            data: {
                transactions,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    totalItems: total,
                    itemsPerPage: parseInt(limit)
                }
            }
        });
        
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch transactions' 
        });
    }
};

// Get confirmed orders for admin transaction page
exports.getConfirmedOrders = async (req, res) => {
    try {
        console.log('=== GET CONFIRMED ORDERS ===');
        console.log('User role:', req.user.role);
        
        // Only allow admin/staff to view all confirmed orders
        if (!['admin', 'staff'].includes(req.user.role)) {
            return res.status(403).json({ 
                success: false, 
                message: 'Access denied - Admin/staff only' 
            });
        }
        
        const connection = await mysql.createConnection(dbConfig);
        
        const { page = 1, limit = 20, search = '' } = req.query;
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 20;
        const offset = (pageNum - 1) * limitNum;
        
        let whereClause = "o.status = 'confirmed'";
        let queryParams = [];
        
        // Add search filter
        if (search) {
            whereClause += ` AND (
                o.order_number LIKE ? OR 
                u.first_name LIKE ? OR 
                u.last_name LIKE ? OR
                u.email LIKE ? OR
                oi.customer_name LIKE ? OR
                oi.customer_email LIKE ?
            )`;
            const searchTerm = `%${search}%`;
            queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
        }
        
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
            WHERE ${whereClause}
            ORDER BY o.created_at DESC
            LIMIT ${limitNum} OFFSET ${offset}
        `, queryParams);
        
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
            
            console.log(`📦 Order ${order.order_number} has ${order.items.length} items:`, 
                order.items.map(item => ({
                    name: item.productname,
                    color: item.productcolor,
                    type: item.product_type,
                    qty: item.quantity,
                    id: item.product_id
                }))
            );
        }
        
        // Get total count for pagination
        const [countResult] = await connection.execute(`
            SELECT COUNT(*) as total
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.user_id
            LEFT JOIN order_invoices oi ON o.invoice_id = oi.invoice_id
            WHERE ${whereClause}
        `, queryParams);
        
        await connection.end();
        
        console.log(`✅ Found ${orders.length} confirmed orders with items (total: ${countResult[0].total})`);
        
        res.json({
            success: true,
            data: orders,
            pagination: {
                total: countResult[0].total,
                page: pageNum,
                limit: limitNum,
                pages: Math.ceil(countResult[0].total / limitNum)
            }
        });
        
    } catch (error) {
        console.error('Error fetching confirmed orders:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch confirmed orders' 
        });
    }
};

// Legacy functions for compatibility
exports.createOrder = exports.createOrderFromCart;
exports.getMyOrders = exports.getUserOrders;
exports.getOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const connection = await mysql.createConnection(dbConfig);
        
        const [orders] = await connection.execute(`
            SELECT 
                o.*,
                oi.total_amount as invoice_total,
                oi.invoice_status,
                st.transaction_status,
                st.payment_method
            FROM orders o
            LEFT JOIN order_invoices oi ON o.invoice_id = oi.invoice_id
            LEFT JOIN sales_transactions st ON o.transaction_id = st.transaction_id
            WHERE o.id = ? AND o.user_id = ?
        `, [orderId, req.user.id]);
        
        if (orders.length === 0) {
            await connection.end();
            return res.status(404).json({ 
                success: false, 
                message: 'Order not found' 
            });
        }
        
        // Get order items
        const [items] = await connection.execute(`
            SELECT * FROM order_items WHERE invoice_id = ?
        `, [orders[0].invoice_id]);
        
        await connection.end();
        
        res.json({
            success: true,
            data: {
                ...orders[0],
                items
            }
        });
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch order' 
        });
    }
};

exports.getAllOrders = async (req, res) => {
    try {
        // Only allow admin access
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }

        const connection = await mysql.createConnection(dbConfig);
        
        // Extract query parameters
        const {
            page = 1,
            limit = 20,
            search = '',
            status = '',
            dateFrom = '',
            dateTo = '',
            minAmount = '',
            maxAmount = '',
            sortBy = 'order_date',
            sortOrder = 'desc',
            export: isExport = false
        } = req.query;

        // Build WHERE clause
        let whereConditions = [];
        let queryParams = [];

        if (search) {
            whereConditions.push(`(o.order_number LIKE ? OR o.customer_name LIKE ? OR o.customer_email LIKE ?)`);
            const searchPattern = `%${search}%`;
            queryParams.push(searchPattern, searchPattern, searchPattern);
        }

        if (status) {
            whereConditions.push('o.status = ?');
            queryParams.push(status);
        }

        if (dateFrom) {
            whereConditions.push('DATE(o.order_date) >= ?');
            queryParams.push(dateFrom);
        }

        if (dateTo) {
            whereConditions.push('DATE(o.order_date) <= ?');
            queryParams.push(dateTo);
        }

        if (minAmount) {
            whereConditions.push('o.total_amount >= ?');
            queryParams.push(parseFloat(minAmount));
        }

        if (maxAmount) {
            whereConditions.push('o.total_amount <= ?');
            queryParams.push(parseFloat(maxAmount));
        }

        const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
        
        // Validate sort parameters
        const validSortColumns = ['order_number', 'order_date', 'customer_name', 'total_amount', 'status'];
        const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'order_date';
        const sortDirection = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

        // If exporting, don't use pagination
        if (isExport === 'csv') {
            const [orders] = await connection.execute(`
                SELECT 
                    o.order_number,
                    o.order_date,
                    o.customer_name,
                    o.customer_email,
                    o.contact_phone,
                    o.shipping_address,
                    o.total_amount,
                    o.status,
                    oi.invoice_status,
                    st.transaction_status,
                    st.payment_method,
                    o.notes
                FROM orders o
                LEFT JOIN order_invoices oi ON o.invoice_id = oi.invoice_id
                LEFT JOIN sales_transactions st ON o.transaction_id = st.transaction_id
                ${whereClause}
                ORDER BY o.${sortColumn} ${sortDirection}
            `, queryParams);

            // Generate CSV
            const csvHeaders = [
                'Order Number', 'Order Date', 'Customer Name', 'Customer Email', 
                'Phone', 'Shipping Address', 'Total Amount', 'Status', 
                'Invoice Status', 'Transaction Status', 'Payment Method', 'Notes'
            ];
            
            let csvContent = csvHeaders.join(',') + '\n';
            
            orders.forEach(order => {
                const row = [
                    order.order_number,
                    new Date(order.order_date).toLocaleDateString(),
                    `"${order.customer_name || ''}"`,
                    order.customer_email || '',
                    order.contact_phone || '',
                    `"${(order.shipping_address || '').replace(/"/g, '""')}"`,
                    order.total_amount || 0,
                    order.status || '',
                    order.invoice_status || '',
                    order.transaction_status || '',
                    order.payment_method || '',
                    `"${(order.notes || '').replace(/"/g, '""')}"`
                ].join(',');
                csvContent += row + '\n';
            });

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=orders-export.csv');
            return res.send(csvContent);
        }

        // Regular pagination query
        const offset = (parseInt(page) - 1) * parseInt(limit);
        const limitClause = `LIMIT ${parseInt(limit)} OFFSET ${offset}`;

        // Get total count for pagination
        const [countResult] = await connection.execute(`
            SELECT COUNT(*) as total
            FROM orders o
            LEFT JOIN order_invoices oi ON o.invoice_id = oi.invoice_id
            LEFT JOIN sales_transactions st ON o.transaction_id = st.transaction_id
            ${whereClause}
        `, queryParams);

        const totalOrders = countResult[0].total;
        const totalPages = Math.ceil(totalOrders / parseInt(limit));

        // Get orders with count of items
        const [orders] = await connection.execute(`
            SELECT 
                o.*,
                oi.total_amount as invoice_total,
                oi.invoice_status,
                st.transaction_status,
                st.payment_method,
                COALESCE(item_counts.item_count, 0) as item_count
            FROM orders o
            LEFT JOIN order_invoices oi ON o.invoice_id = oi.invoice_id
            LEFT JOIN sales_transactions st ON o.transaction_id = st.transaction_id
            LEFT JOIN (
                SELECT order_id, COUNT(*) as item_count 
                FROM order_items 
                GROUP BY order_id
            ) item_counts ON o.id = item_counts.order_id
            ${whereClause}
            ORDER BY o.${sortColumn} ${sortDirection}
            ${limitClause}
        `, queryParams);
        
        await connection.end();
        
        res.json({
            success: true,
            data: {
                orders,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    totalOrders,
                    itemsPerPage: parseInt(limit)
                }
            }
        });
    } catch (error) {
        console.error('Error fetching all orders:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch orders',
            error: error.message
        });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;
        
        const connection = await mysql.createConnection(dbConfig);
        
        await connection.execute(`
            UPDATE orders 
            SET status = ?, updated_at = CURRENT_TIMESTAMP 
            WHERE id = ?
        `, [status, orderId]);
        
        await connection.end();
        
        res.json({
            success: true,
            message: 'Order status updated successfully'
        });
    } catch (error) {        console.error('Error updating order status:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to update order status' 
        });
    }
};

// Get order items for invoice
exports.getOrderItems = async (req, res) => {
    try {
        const orderId = req.params.id;
        console.log('=== GET ORDER ITEMS (FIXED) ===');
        console.log('Order ID:', orderId);
        console.log('User ID:', req.user.id);
        
        const connection = await mysql.createConnection(dbConfig);
        
        // First verify the order belongs to the user (unless admin)
        if (req.user.role !== 'admin') {
            const [orderCheck] = await connection.execute(
                'SELECT user_id FROM orders WHERE id = ?',
                [orderId]
            );
            
            if (orderCheck.length === 0) {
                await connection.end();
                return res.status(404).json({ 
                    success: false, 
                    message: 'Order not found' 
                });
            }
            
            if (orderCheck[0].user_id !== req.user.id) {
                console.log(`Access denied: Order ${orderId} belongs to user ${orderCheck[0].user_id}, not ${req.user.id}`);
                await connection.end();
                return res.status(403).json({ 
                    success: false, 
                    message: 'Access denied - Order does not belong to this user' 
                });
            }
        }
          // Get order items with product details using invoice_id
        const [orderItems] = await connection.execute(`
            SELECT 
                oi.*,
                p.productname,
                p.productdescription,
                p.productcolor,
                p.product_type,
                p.productimage,
                oi.product_price as price,
                oi.quantity,
                oi.subtotal as total_price
            FROM order_items oi
            LEFT JOIN products p ON oi.product_id = p.product_id
            WHERE oi.invoice_id = (SELECT invoice_id FROM orders WHERE id = ?)
            ORDER BY oi.id
        `, [orderId]);
        
        console.log(`Found ${orderItems.length} items for order ${orderId}`);
        
        await connection.end();
        
        res.json({
            success: true,
            data: orderItems
        });
    } catch (error) {
        console.error('Error fetching order items:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch order items' 
        });
    }
};

// Get user's orders with items
exports.getUserOrdersWithItems = async (req, res) => {
    try {
        console.log('=== GET USER ORDERS WITH ITEMS ===');
        console.log('User ID from token:', req.user.id);
        
        const connection = await mysql.createConnection(dbConfig);        // Get user's orders with user details
        const [orders] = await connection.execute(`
            SELECT 
                o.*,
                oi.total_amount as invoice_total,
                oi.invoice_status,
                oi.customer_name,
                oi.customer_email,
                st.transaction_status,
                st.payment_method,
                u.first_name,
                u.last_name,
                u.email as user_email
            FROM orders o
            LEFT JOIN order_invoices oi ON o.invoice_id = oi.invoice_id
            LEFT JOIN sales_transactions st ON o.transaction_id = st.transaction_id
            LEFT JOIN users u ON o.user_id = u.user_id
            WHERE o.user_id = ?
            ORDER BY o.order_date DESC
        `, [req.user.id]);
        
        // For each order, get its items with product details
        for (let order of orders) {
            const [items] = await connection.execute(`
                SELECT 
                    oitems.*,
                    p.productname,
                    p.productdescription,
                    p.productcolor,
                    p.product_type,
                    p.productimage,
                    oitems.product_price as price,
                    oitems.quantity,
                    oitems.subtotal as total_price
                FROM order_items oitems
                LEFT JOIN products p ON oitems.product_id = p.product_id
                WHERE oitems.invoice_id = ?
                ORDER BY oitems.id
            `, [order.invoice_id]);
            
            order.items = items;
        }
        
        console.log(`Found ${orders.length} orders with items for user ID ${req.user.id}`);
        
        await connection.end();
        
        res.json({
            success: true,
            data: orders
        });
    } catch (error) {
        console.error('Error fetching user orders with items:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch orders with items' 
        });
    }
};

// Get all cancellation requests for admin
exports.getCancellationRequests = async (req, res) => {
    try {
        console.log('=== GET CANCELLATION REQUESTS ===');
        console.log('User role:', req.user.role);
        
        // Only allow admin/staff to view cancellation requests
        if (!['admin', 'staff'].includes(req.user.role)) {
            return res.status(403).json({ 
                success: false, 
                message: 'Access denied - Admin/staff only' 
            });
        }        const connection = await mysql.createConnection(dbConfig);
        
        const { status = 'all', page = 1, limit = 20 } = req.query;
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 20;
        const offset = (pageNum - 1) * limitNum;
        
        let whereClause = '1=1';
        let whereParams = [];
        
        // Add status filter
        if (status && status !== 'all') {
            whereClause += ' AND cr.status = ?';
            whereParams.push(status);
        }
          // Query for the actual data with pagination
        const [requests] = await connection.execute(`
            SELECT 
                cr.*,
                u.first_name as customer_first_name,
                u.last_name as customer_last_name,
                u.email as customer_email,
                o.total_amount as order_total,
                o.status as order_status,
                admin_user.first_name as admin_first_name,
                admin_user.last_name as admin_last_name
            FROM cancellation_requests cr
            JOIN users u ON cr.user_id = u.user_id
            JOIN orders o ON cr.order_id = o.id
            LEFT JOIN users admin_user ON cr.processed_by = admin_user.user_id
            WHERE ${whereClause}
            ORDER BY cr.created_at DESC
            LIMIT ${limitNum} OFFSET ${offset}
        `, whereParams);
        
        // Get total count using only where parameters (no pagination)
        const [countResult] = await connection.execute(`
            SELECT COUNT(*) as total
            FROM cancellation_requests cr
            JOIN users u ON cr.user_id = u.user_id
            JOIN orders o ON cr.order_id = o.id
            WHERE ${whereClause}
        `, whereParams);
        
        await connection.end();
        
        console.log(`✅ Found ${requests.length} cancellation requests (total: ${countResult[0].total})`);
        
        res.json({
            success: true,            data: requests,
            pagination: {
                total: countResult[0].total,
                page: pageNum,
                limit: limitNum,
                pages: Math.ceil(countResult[0].total / limitNum)
            }
        });
        
    } catch (error) {
        console.error('Error fetching cancellation requests:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch cancellation requests' 
        });
    }
};

// Process cancellation request (approve/deny)
exports.processCancellationRequest = async (req, res) => {
    try {
        const requestId = req.params.id;
        const { action, adminNotes } = req.body; // action: 'approve' or 'deny'
        
        console.log('=== PROCESS CANCELLATION REQUEST ===');
        console.log('Request ID:', requestId);
        console.log('Action:', action);
        console.log('Admin ID:', req.user.id);
        console.log('Admin Notes:', adminNotes);
        
        // Only allow admin/staff to process cancellation requests
        if (!['admin', 'staff'].includes(req.user.role)) {
            return res.status(403).json({ 
                success: false, 
                message: 'Access denied - Admin/staff only' 
            });
        }
        
        if (!['approve', 'deny'].includes(action)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid action. Must be approve or deny' 
            });
        }
        
        const connection = await mysql.createConnection(dbConfig);
        
        try {
            await connection.beginTransaction();
            
            // Get the cancellation request
            const [requestResult] = await connection.execute(`
                SELECT cr.*, o.status as order_status
                FROM cancellation_requests cr
                JOIN orders o ON cr.order_id = o.id
                WHERE cr.id = ? AND cr.status = 'pending'
            `, [requestId]);
            
            if (requestResult.length === 0) {
                await connection.rollback();
                await connection.end();
                return res.status(404).json({ 
                    success: false, 
                    message: 'Cancellation request not found or already processed' 
                });
            }
            
            const request = requestResult[0];
            
            // Update the cancellation request
            const newStatus = action === 'approve' ? 'approved' : 'denied';
            await connection.execute(`
                UPDATE cancellation_requests 
                SET status = ?, admin_notes = ?, processed_by = ?, processed_at = NOW()
                WHERE id = ?
            `, [newStatus, adminNotes || null, req.user.id, requestId]);
            
            // If approved, update the order status to cancelled
            if (action === 'approve') {
                await connection.execute(`
                    UPDATE orders 
                    SET status = 'cancelled', updated_at = NOW()
                    WHERE id = ?
                `, [request.order_id]);
                
                // Also update the invoice status if it exists
                await connection.execute(`
                    UPDATE order_invoices 
                    SET invoice_status = 'cancelled', updated_at = NOW()
                    WHERE invoice_id = (SELECT invoice_id FROM orders WHERE id = ?)
                `, [request.order_id]);
                
                // Update sales transaction status
                await connection.execute(`
                    UPDATE sales_transactions 
                    SET transaction_status = 'cancelled', updated_at = NOW()
                    WHERE transaction_id = (SELECT transaction_id FROM orders WHERE id = ?)
                `, [request.order_id]);
            }
            
            await connection.commit();
            await connection.end();
            
            const message = action === 'approve' 
                ? 'Cancellation request approved and order cancelled successfully'
                : 'Cancellation request denied successfully';
            
            res.json({
                success: true,
                message,
                data: {
                    requestId,
                    action,
                    status: newStatus,
                    adminNotes
                }
            });
            
        } catch (error) {
            await connection.rollback();
            await connection.end();
            throw error;
        }
        
    } catch (error) {
        console.error('Error processing cancellation request:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to process cancellation request' 
        });
    }
};
