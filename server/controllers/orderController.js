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
            
            console.log('Order created with user_id:', req.user.id);
            console.log('=== END CREATE ORDER DEBUG ===');
            
            // Create order items
            for (const item of cartItems) {
                await connection.execute(`
                    INSERT INTO order_items (
                        invoice_id, product_id, product_name, product_price,
                        quantity, color, size, subtotal
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                    invoiceId, item.product_id, item.productname, item.productprice,
                    item.quantity, item.productcolor, item.size || 'N/A',
                    item.productprice * item.quantity
                ]);
            }
            
            // Clear cart
            await connection.execute('DELETE FROM cart_items WHERE cart_id = ?', [cartId]);
            
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
        const { orderId } = req.params;
        
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
                await connection.end();
                return res.status(403).json({ 
                    success: false, 
                    message: 'Access denied' 
                });
            }
        }
        
        // Get order items with product details
        const [orderItems] = await connection.execute(`
            SELECT 
                oi.*,
                p.productname,
                p.productdescription,
                p.productcolor,
                p.product_type,
                oi.price as price,
                oi.quantity,
                (oi.price * oi.quantity) as total_price
            FROM order_items oi
            LEFT JOIN products p ON oi.product_id = p.product_id
            WHERE oi.order_id = ?
            ORDER BY oi.id
        `, [orderId]);
        
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
