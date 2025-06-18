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
            const invoiceId = generateId('INV');
            const transactionId = generateId('TXN');
            const orderNumber = generateId('ORD');
            
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
            
            // Create transaction
            await connection.execute(`
                INSERT INTO sales_transactions (
                    transaction_id, invoice_id, user_id, amount, payment_method
                ) VALUES (?, ?, ?, ?, 'cash_on_delivery')
            `, [transactionId, invoiceId, req.user.id, totalAmount]);
            
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
        `);
        
        await connection.end();
        
        res.json({
            success: true,
            data: orders
        });
    } catch (error) {
        console.error('Error fetching all orders:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch orders' 
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
