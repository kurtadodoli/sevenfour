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
                st.payment_method,
                latest_cr.status as cancellation_status,
                latest_cr.reason as cancellation_reason,
                latest_cr.created_at as cancellation_requested_at,
                latest_cr.admin_notes as cancellation_admin_notes,
                latest_cr.processed_at as cancellation_processed_at
            FROM orders o
            LEFT JOIN order_invoices oi ON o.invoice_id = oi.invoice_id
            LEFT JOIN sales_transactions st ON o.transaction_id = st.transaction_id
            LEFT JOIN (
                SELECT cr1.*
                FROM cancellation_requests cr1
                INNER JOIN (
                    SELECT order_id, MAX(id) as max_id
                    FROM cancellation_requests
                    GROUP BY order_id
                ) cr2 ON cr1.order_id = cr2.order_id AND cr1.id = cr2.max_id
            ) latest_cr ON o.id = latest_cr.order_id
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
            
            // Create order items with proper order_id reference and all required fields
            for (let index = 0; index < cartItems.length; index++) {
                const item = cartItems[index];
                await connection.execute(`
                    INSERT INTO order_items (
                        order_id, invoice_id, product_id, product_name, product_price,
                        quantity, sort_order, color, size, subtotal, customer_fullname, customer_phone,
                        gcash_reference_number, payment_proof_image_path, 
                        province, city_municipality, street_address, postal_code, order_notes
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                    orderId, invoiceId, item.product_id, item.productname, item.productprice,
                    item.quantity, index + 1, item.color || item.productcolor, item.size || 'N/A',
                    item.productprice * item.quantity,
                    customer_name || req.user.username || 'N/A',
                    contact_phone || 'N/A',
                    'COD_ORDER', // Default reference for cash on delivery
                    'N/A', // No payment proof for COD
                    'Metro Manila', // Default province
                    'Manila', // Default city
                    shipping_address || 'N/A',
                    '1000', // Default postal code
                    notes || 'N/A'
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
        
        console.log('=== CONFIRM ORDER DEBUG (ENHANCED) ===');
        console.log('req.headers:', JSON.stringify(req.headers, null, 2));
        console.log('req.user:', req.user);
        console.log('req.user.id:', req.user?.id);
        console.log('orderId:', orderId);
        console.log('typeof req.user.id:', typeof req.user?.id);
        console.log('Request from:', req.ip);
        console.log('User agent:', req.headers['user-agent']);
        console.log('Authorization header:', req.headers.authorization ? 'Present' : 'Missing');
        
        if (!req.user || !req.user.id) {
            console.log('❌ Authentication failed - no user or user.id');
            console.log('Full req.user object:', req.user);
            return res.status(401).json({
                success: false,
                message: 'User authentication required'
            });
        }
        
        // Convert user ID to the appropriate type for database queries
        const userId = req.user.id;
        
        console.log('userId for queries:', userId);
        console.log('typeof userId:', typeof userId);
        console.log('orderId for queries:', orderId);
        console.log('typeof orderId:', typeof orderId);
        
        const connection = await mysql.createConnection(dbConfig);
        
        try {
            await connection.beginTransaction();
            
            // First, check if the order exists and belongs to the user
            console.log('Checking if order exists and belongs to user...');
            const [orderCheck] = await connection.execute(`
                SELECT id, status, user_id, invoice_id 
                FROM orders 
                WHERE id = ? AND user_id = ?
            `, [orderId, userId]);
            
            if (orderCheck.length === 0) {
                await connection.rollback();
                await connection.end();
                console.log('❌ Order not found or access denied');
                return res.status(400).json({
                    success: false,
                    message: 'Order not found or access denied'
                });
            }
            
            const order = orderCheck[0];
            console.log('✅ Order found:', order);
            
            if (order.status !== 'pending') {
                await connection.rollback();
                await connection.end();
                console.log('❌ Order status is not pending:', order.status);
                return res.status(400).json({
                    success: false,
                    message: `Cannot confirm order with status: ${order.status}`
                });
            }
            
            // Get the order items to update inventory (using order_id directly)
            console.log('Getting order items for inventory update...');
            const [orderItems] = await connection.execute(`
                SELECT oi.product_id, oi.quantity, oi.size, oi.color, 
                       p.productname, p.total_available_stock
                FROM order_items oi
                JOIN products p ON oi.product_id = p.product_id
                WHERE oi.order_id = ?
            `, [orderId]);
            
            console.log(`Found ${orderItems.length} items in order`);
            
            if (orderItems.length === 0) {
                await connection.rollback();
                await connection.end();
                console.log('❌ No order items found');
                return res.status(400).json({
                    success: false,
                    message: 'No order items found'
                });
            }
            
            // Check stock for each specific size/color variant
            const insufficientStock = [];
            for (const item of orderItems) {
                console.log(`Checking variant stock for ${item.productname} - Size: ${item.size}, Color: ${item.color}, Qty: ${item.quantity}`);
                
                // Check if specific size/color variant exists and has enough stock
                const [variantStock] = await connection.execute(`
                    SELECT available_quantity, stock_quantity, reserved_quantity
                    FROM product_variants 
                    WHERE product_id = ? AND size = ? AND color = ?
                `, [item.product_id, item.size || 'N/A', item.color || 'Default']);
                
                if (variantStock.length === 0) {
                    // No variant found - check general product stock as fallback
                    console.log(`No variant found for ${item.productname} ${item.size}/${item.color}, checking general stock`);
                    if (item.total_available_stock < item.quantity) {
                        insufficientStock.push({
                            product: item.productname,
                            size: item.size,
                            color: item.color,
                            requested: item.quantity,
                            available: item.total_available_stock
                        });
                    }
                } else {
                    // Check variant-specific stock
                    const variant = variantStock[0];
                    console.log(`Variant stock: available=${variant.available_quantity}, requested=${item.quantity}`);
                    
                    if (variant.available_quantity < item.quantity) {
                        insufficientStock.push({
                            product: item.productname,
                            size: item.size,
                            color: item.color,
                            requested: item.quantity,
                            available: variant.available_quantity
                        });
                    }
                }
            }
            
            if (insufficientStock.length > 0) {
                await connection.rollback();
                await connection.end();
                console.log('❌ Insufficient stock for variants:', insufficientStock);
                return res.status(400).json({
                    success: false,
                    message: 'Insufficient stock for some item variants',
                    insufficientStock
                });
            }
            
            console.log('✅ All variants have sufficient stock');
            
            // Update inventory - subtract ordered quantities from specific variants
            console.log('Updating variant-specific inventory for confirmed order...');
            
            for (const item of orderItems) {
                console.log(`Processing item: ${item.productname} - Size: ${item.size}, Color: ${item.color}, Qty: ${item.quantity}, Product ID: ${item.product_id}`);
                
                // Actually subtract from stock_quantity (not just reserve) when confirming order
                const [variantResult] = await connection.execute(`
                    UPDATE product_variants 
                    SET stock_quantity = stock_quantity - ?,
                        reserved_quantity = GREATEST(0, reserved_quantity - ?),
                        available_quantity = available_quantity - ?,
                        last_updated = CURRENT_TIMESTAMP
                    WHERE product_id = ? AND size = ? AND color = ? AND stock_quantity >= ?
                `, [item.quantity, item.quantity, item.quantity, item.product_id, item.size || 'N/A', item.color || 'Default', item.quantity]);
                
                console.log(`Variant stock subtraction affected rows: ${variantResult.affectedRows}`);
                
                if (variantResult.affectedRows > 0) {
                    console.log(`✅ Subtracted stock: ${item.productname} ${item.size}/${item.color} -${item.quantity} units`);
                    
                    // Log the stock movement as actual stock reduction
                    await connection.execute(`
                        INSERT INTO stock_movements 
                        (product_id, movement_type, quantity, size, reason, reference_number, user_id, notes)
                        VALUES (?, 'OUT', ?, ?, 'Order Confirmed - Stock Deducted', ?, ?, ?)
                    `, [item.product_id, item.quantity, item.size || 'N/A', 
                        orderId, userId, `Order confirmed - deducted ${item.quantity} units from ${item.productname} ${item.size}/${item.color}`]);
                } else {
                    // Fallback to general product stock update - actually subtract from available stock
                    console.log(`❌ No variant found for ${item.productname} ${item.size}/${item.color}, updating general stock`);
                    await connection.execute(`
                        UPDATE products 
                        SET total_available_stock = GREATEST(0, total_available_stock - ?),
                            productquantity = GREATEST(0, productquantity - ?),
                            last_stock_update = CURRENT_TIMESTAMP
                        WHERE product_id = ? AND total_available_stock >= ?
                    `, [item.quantity, item.quantity, item.product_id, item.quantity]);
                }
            }
            
            // Update overall product stock totals from variants
            console.log('Updating overall product stock totals...');
            
            // Get unique product IDs from order items
            const uniqueProductIds = [...new Set(orderItems.map(item => item.product_id))];
            
            // Update each product individually to recalculate totals
            for (const productId of uniqueProductIds) {
                await connection.execute(`
                    UPDATE products p
                    SET p.total_stock = (
                        SELECT COALESCE(SUM(pv.stock_quantity), p.productquantity) 
                        FROM product_variants pv 
                        WHERE pv.product_id = p.product_id
                    ),
                    p.total_available_stock = (
                        SELECT COALESCE(SUM(pv.stock_quantity), p.productquantity) 
                        FROM product_variants pv 
                        WHERE pv.product_id = p.product_id
                    ),
                    p.total_reserved_stock = (
                        SELECT COALESCE(SUM(pv.reserved_quantity), 0) 
                        FROM product_variants pv 
                        WHERE pv.product_id = p.product_id
                    ),
                    p.stock_status = CASE 
                        WHEN (SELECT COALESCE(SUM(pv.stock_quantity), p.productquantity) FROM product_variants pv WHERE pv.product_id = p.product_id) <= 0 THEN 'out_of_stock'
                        WHEN (SELECT COALESCE(SUM(pv.stock_quantity), p.productquantity) FROM product_variants pv WHERE pv.product_id = p.product_id) <= 5 THEN 'critical_stock'
                        WHEN (SELECT COALESCE(SUM(pv.stock_quantity), p.productquantity) FROM product_variants pv WHERE pv.product_id = p.product_id) <= 15 THEN 'low_stock'
                        ELSE 'in_stock'
                    END,
                    p.last_stock_update = CURRENT_TIMESTAMP
                    WHERE p.product_id = ?
                `, [productId]);
                
                console.log(`Updated product totals for product ID: ${productId}`);
                
                // Sync all stock fields (totals + sizes JSON) with current variant data
                await syncAllStockFields(connection, productId);
            }

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
            
            // Update invoice status (avoid collation issue by using the known invoice_id)
            console.log('Executing invoice update query...');
            const invoiceId = order.invoice_id; // We have this from the order check above
            await connection.execute(`
                UPDATE order_invoices 
                SET invoice_status = 'sent'
                WHERE invoice_id = ?
            `, [invoiceId]);
            
            console.log('Invoice update successful');
            
            await connection.commit();
            await connection.end();
            
            // Prepare stock update data for real-time notifications
            const stockUpdates = orderItems.map(item => ({
                product_id: item.product_id,
                product: item.productname,
                quantityReserved: item.quantity,
                newAvailableStock: item.total_available_stock - item.quantity
            }));
            
            res.json({
                success: true,
                message: 'Order confirmed successfully and inventory updated',
                inventoryUpdated: stockUpdates,
                stockUpdateEvent: {
                    type: 'order_confirmed',
                    orderId: orderId,
                    productIds: orderItems.map(item => item.product_id),
                    timestamp: new Date().toISOString()
                }
            });
            
        } catch (error) {
            await connection.rollback();
            await connection.end();
            throw error;
        }
        
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
            JOIN orders o ON oi.invoice_id COLLATE utf8mb4_unicode_ci = o.invoice_id COLLATE utf8mb4_unicode_ci
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
                ORDER BY oit.sort_order, oit.id
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

// Process order cancellation and restore stock
exports.processOrderCancellation = async (req, res) => {
    try {
        const orderId = req.params.id;
        
        console.log('=== PROCESS ORDER CANCELLATION ===');
        console.log('Order ID:', orderId);
        console.log('User ID:', req.user?.id);
        
        const connection = await mysql.createConnection(dbConfig);
        
        try {
            await connection.beginTransaction();
            
            // Get order details
            const [orderCheck] = await connection.execute(`
                SELECT o.id, o.user_id, o.status, o.order_number, o.invoice_id
                FROM orders o
                WHERE o.id = ?
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
            
            // Check if order can be cancelled
            if (!['pending', 'confirmed'].includes(order.status)) {
                await connection.rollback();
                await connection.end();
                return res.status(400).json({
                    success: false,
                    message: `Cannot cancel order with status: ${order.status}`
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
                    
                    // Log the stock movement
                    await connection.execute(`
                        INSERT INTO stock_movements 
                        (product_id, movement_type, quantity, size, reason, reference_number, user_id, notes)
                        VALUES (?, 'IN', ?, ?, 'Order Cancellation', ?, ?, ?)
                    `, [item.product_id, item.quantity, item.size || 'N/A', 
                        orderId, req.user?.id || 0, `Order cancelled - restored ${item.quantity} units for ${item.productname} ${item.size}/${item.color}`]);
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
            
            // Update overall product stock totals from variants
            console.log('Updating overall product stock totals after restoration...');
            await connection.execute(`
                UPDATE products p
                SET p.total_stock = (
                    SELECT COALESCE(SUM(pv.stock_quantity), 0) 
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
                WHERE p.product_id IN (${orderItems.map(() => '?').join(',')})
            `, orderItems.map(item => item.product_id));
            
            // Sync all stock fields for all affected products
            console.log('Syncing all stock fields for all affected products...');
            const uniqueProductIds = [...new Set(orderItems.map(item => item.product_id))];
            for (const productId of uniqueProductIds) {
                await syncAllStockFields(connection, productId);
            }
            
            // Update order status to cancelled
            await connection.execute(`
                UPDATE orders 
                SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP 
                WHERE id = ?
            `, [orderId]);
            
            // Update related transactions and invoices
            await connection.execute(`
                UPDATE sales_transactions st
                JOIN orders o ON st.transaction_id = o.transaction_id
                SET st.transaction_status = 'cancelled'
                WHERE o.id = ?
            `, [orderId]);
            
            await connection.execute(`
                UPDATE order_invoices oi
                JOIN orders o ON oi.invoice_id COLLATE utf8mb4_unicode_ci = o.invoice_id COLLATE utf8mb4_unicode_ci
                SET oi.invoice_status = 'cancelled'
                WHERE o.id = ?
            `, [orderId]);
            
            // Update any pending cancellation requests
            await connection.execute(`
                UPDATE cancellation_requests
                SET status = 'approved', processed_at = CURRENT_TIMESTAMP
                WHERE order_id = ? AND status = 'pending'
            `, [orderId]);
            
            await connection.commit();
            await connection.end();
            
            console.log(`✅ Order ${orderId} cancelled successfully and stock restored`);
            
            // Prepare response with stock restoration data
            const stockUpdates = orderItems.map(item => ({
                product_id: item.product_id,
                product: item.productname,
                quantityRestored: item.quantity,
                size: item.size,
                color: item.color
            }));
            
            res.json({
                success: true,
                message: 'Order cancelled successfully and stock restored',
                data: {
                    orderId,
                    orderNumber: order.order_number,
                    status: 'cancelled'
                },
                inventoryRestored: stockUpdates,
                stockUpdateEvent: {
                    type: 'order_cancelled',
                    orderId: orderId,
                    productIds: orderItems.map(item => item.product_id),
                    timestamp: new Date().toISOString()
                }
            });
            
        } catch (error) {
            await connection.rollback();
            await connection.end();
            throw error;
        }
        
    } catch (error) {
        console.error('Error processing order cancellation:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to process order cancellation' 
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
            ORDER BY oi.sort_order, oi.id
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
        
        const connection = await mysql.createConnection(dbConfig);        // Get user's orders with user details, delivery status, and latest cancellation request
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
                u.email as user_email,
                latest_cr.status as cancellation_request_status,
                latest_cr.reason as cancellation_reason,
                latest_cr.created_at as cancellation_requested_at,
                latest_cr.admin_notes as cancellation_admin_notes,
                latest_cr.processed_at as cancellation_processed_at,
                ds.delivery_status,
                ds.delivery_date as scheduled_delivery_date,
                ds.delivery_time_slot as scheduled_delivery_time,
                ds.delivery_notes,
                ds.courier_id,
                c.name as courier_name,
                c.phone_number as courier_phone
            FROM orders o
            LEFT JOIN order_invoices oi ON o.invoice_id = oi.invoice_id
            LEFT JOIN sales_transactions st ON o.transaction_id = st.transaction_id
            LEFT JOIN users u ON o.user_id = u.user_id
            LEFT JOIN (
                SELECT cr1.*
                FROM cancellation_requests cr1
                INNER JOIN (
                    SELECT order_id, MAX(id) as max_id
                    FROM cancellation_requests
                    GROUP BY order_id
                ) cr2 ON cr1.order_id = cr2.order_id AND cr1.id = cr2.max_id
            ) latest_cr ON o.id = latest_cr.order_id
            LEFT JOIN delivery_schedules ds ON o.id = ds.order_id
            LEFT JOIN couriers c ON ds.courier_id = c.id
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

// Create a cancellation request
exports.createCancellationRequest = async (req, res) => {
    try {
        const { order_id, order_number, reason } = req.body;
        const userId = req.user.id;
        
        console.log('=== CREATE CANCELLATION REQUEST ===');
        console.log('User ID:', userId);
        console.log('Order ID:', order_id);
        console.log('Order Number:', order_number);
        console.log('Reason:', reason);
        
        // Validate required fields
        if (!order_id || !reason) {
            return res.status(400).json({ 
                success: false, 
                message: 'Order ID and reason are required' 
            });
        }
        
        if (reason.trim().length < 10) {
            return res.status(400).json({ 
                success: false, 
                message: 'Cancellation reason must be at least 10 characters long' 
            });
        }
        
        const connection = await mysql.createConnection(dbConfig);
        
        try {
            // Check if order exists and belongs to the user
            const [orderResult] = await connection.execute(`
                SELECT id, order_number, status, user_id
                FROM orders 
                WHERE id = ? AND user_id = ?
            `, [order_id, userId]);
            
            if (orderResult.length === 0) {
                await connection.end();
                return res.status(404).json({ 
                    success: false, 
                    message: 'Order not found or you do not have permission to cancel this order' 
                });
            }
            
            const order = orderResult[0];
            
            // Check if order can be cancelled (pending or confirmed orders)
            if (!['pending', 'confirmed'].includes(order.status)) {
                await connection.end();
                return res.status(400).json({ 
                    success: false, 
                    message: `Cannot cancel order with status: ${order.status}. Only pending or confirmed orders can be cancelled.` 
                });
            }
            
            // Check if there's already a cancellation request for this order
            const [existingRequest] = await connection.execute(`
                SELECT id, status FROM cancellation_requests 
                WHERE order_id = ?
            `, [order_id]);
            
            if (existingRequest.length > 0) {
                await connection.end();
                return res.status(400).json({ 
                    success: false, 
                    message: `A cancellation request already exists for this order (Status: ${existingRequest[0].status})` 
                });
            }
            
            // Create the cancellation request
            const [result] = await connection.execute(`
                INSERT INTO cancellation_requests (
                    order_id, user_id, order_number, reason, status, created_at, updated_at
                ) VALUES (?, ?, ?, ?, 'pending', NOW(), NOW())
            `, [order_id, userId, order.order_number, reason.trim()]);
            
            console.log('✅ Cancellation request created with ID:', result.insertId);
            
            // Get the created request details
            const [newRequest] = await connection.execute(`
                SELECT cr.*, o.order_number, u.first_name, u.last_name, u.email
                FROM cancellation_requests cr
                JOIN orders o ON cr.order_id = o.id
                JOIN users u ON cr.user_id = u.user_id
                WHERE cr.id = ?
            `, [result.insertId]);
            
            await connection.end();
            
            res.status(201).json({
                success: true,
                message: 'Cancellation request submitted successfully. Admin will review your request.',
                data: newRequest[0]
            });
            
        } catch (dbError) {
            await connection.end();
            throw dbError;
        }
        
    } catch (error) {
        console.error('❌ Error creating cancellation request:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create cancellation request'
        });
    }
};

// Get all cancellation requests for admin
exports.getCancellationRequests = async (req, res) => {
    try {
        console.log('=== GET CANCELLATION REQUESTS ===');
        console.log('User role:', req.user?.role);
        
        // Only allow admin/staff to view cancellation requests
        if (!req.user || !['admin', 'staff'].includes(req.user.role)) {
            return res.status(403).json({ 
                success: false, 
                message: 'Access denied - Admin/staff only' 
            });
        }

        const connection = await mysql.createConnection(dbConfig);
        
        // Check if cancellation_requests table exists
        const [tables] = await connection.execute(
            "SHOW TABLES LIKE 'cancellation_requests'"
        );
        
        if (tables.length === 0) {
            console.log('ℹ️ Cancellation requests table does not exist yet');
            await connection.end();
            return res.json({
                success: true,
                data: [],
                pagination: {
                    total: 0,
                    page: 1,
                    limit: 20,
                    pages: 0
                }
            });
        }
        
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
        
        // For each cancellation request, get the order items (product details)
        for (let i = 0; i < requests.length; i++) {
            const request = requests[i];
            
            const [orderItems] = await connection.execute(`
                SELECT 
                    oi.product_id,
                    oi.product_name,
                    oi.quantity,
                    oi.color,
                    oi.size,
                    oi.product_price,
                    oi.subtotal,
                    p.productname,
                    p.productimage,
                    p.productdescription
                FROM order_items oi
                JOIN orders o ON CAST(oi.invoice_id AS CHAR) = CAST(o.invoice_id AS CHAR)
                LEFT JOIN products p ON CAST(oi.product_id AS UNSIGNED) = CAST(p.product_id AS UNSIGNED)
                WHERE o.id = ?
            `, [request.order_id]);
            
            // Add order items to the request object
            requests[i].order_items = orderItems;
        }
        
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
                // First, check the original order status to determine if stock was ever subtracted
                console.log('Checking original order status...');
                const [originalOrder] = await connection.execute(`
                    SELECT o.status, o.order_number
                    FROM orders o
                    WHERE o.id = ?
                `, [request.order_id]);
                
                if (originalOrder.length === 0) {
                    throw new Error('Order not found');
                }
                
                const originalStatus = originalOrder[0].status;
                const orderNumber = originalOrder[0].order_number;
                console.log(`Original order status: ${originalStatus} (Order: ${orderNumber})`);
                
                // Only restore inventory if the order was previously confirmed
                // Orders in 'pending' status never had stock subtracted, so no need to restore
                const shouldRestoreStock = ['confirmed', 'processing', 'shipped'].includes(originalStatus);
                
                if (shouldRestoreStock) {
                    console.log('Order was confirmed - restoring inventory...');
                    
                    // Get the order items to restore inventory with variant details
                    // First try to get items with valid products (JOIN with products table)
                    const [orderItems] = await connection.execute(`
                        SELECT oi.product_id, oi.quantity, oi.color, oi.size, p.productname, 
                               p.total_available_stock, p.total_reserved_stock
                        FROM order_items oi
                        JOIN orders o ON oi.invoice_id COLLATE utf8mb4_unicode_ci = o.invoice_id COLLATE utf8mb4_unicode_ci
                        JOIN products p ON oi.product_id = p.product_id
                        WHERE o.id = ?
                    `, [request.order_id]);
                    
                    // Also check for orphaned order items (items with invalid product_id)
                    const [orphanedItems] = await connection.execute(`
                        SELECT oi.product_id, oi.quantity, oi.color, oi.size, oi.product_name,
                               'orphaned' as productname, 0 as total_available_stock, 0 as total_reserved_stock
                        FROM order_items oi
                        JOIN orders o ON oi.invoice_id COLLATE utf8mb4_unicode_ci = o.invoice_id COLLATE utf8mb4_unicode_ci
                        LEFT JOIN products p ON oi.product_id = p.product_id
                        WHERE o.id = ? AND p.product_id IS NULL
                    `, [request.order_id]);
                    
                    console.log(`Found ${orderItems.length} valid items and ${orphanedItems.length} orphaned items in cancelled order`);
                    
                    if (orphanedItems.length > 0) {
                        console.log('⚠️ WARNING: Found orphaned order items (product_id not in products table):');
                        orphanedItems.forEach(item => {
                            console.log(`  - Product ID ${item.product_id}: ${item.product_name} (${item.color}/${item.size}) x${item.quantity}`);
                        });
                        console.log('These items will be skipped for stock restoration due to missing product data.');
                    }
                    
                    // Log each item details before restoration
                    for (const item of orderItems) {
                        console.log(`Order Item: ${item.productname} - Size: "${item.size}" Color: "${item.color}" Qty: ${item.quantity}`);
                        
                        // Check current variant stock before restoration
                        const [currentVariant] = await connection.execute(`
                            SELECT stock_quantity, available_quantity, reserved_quantity
                            FROM product_variants 
                            WHERE product_id = ? AND size = ? AND color = ?
                        `, [item.product_id, item.size || 'N/A', item.color || 'Default']);
                        
                        if (currentVariant.length > 0) {
                            console.log(`Before restoration - Stock: ${currentVariant[0].stock_quantity}, Available: ${currentVariant[0].available_quantity}, Reserved: ${currentVariant[0].reserved_quantity}`);
                        } else {
                            console.log(`⚠️ No variant found for ${item.productname} Size: "${item.size || 'N/A'}" Color: "${item.color || 'Default'}"`);
                        }
                    }
                    
                    // Restore inventory - add back to stock_quantity that was subtracted during confirmation
                    for (const item of orderItems) {
                        console.log(`Restoring variant stock for ${item.productname} ${item.color || 'Default'}/${item.size || 'N/A'}: adding back ${item.quantity} units`);
                        
                        // Restore the variant stock by adding back to stock_quantity and available_quantity
                        const [variantResult] = await connection.execute(`
                            UPDATE product_variants 
                            SET stock_quantity = stock_quantity + ?,
                                available_quantity = available_quantity + ?,
                                last_updated = CURRENT_TIMESTAMP
                            WHERE product_id = ? AND size = ? AND color = ?
                        `, [item.quantity, item.quantity, item.product_id, item.size || 'N/A', item.color || 'Default']);
                        
                        if (variantResult.affectedRows > 0) {
                            console.log(`✅ Restored variant stock: ${item.productname} ${item.size}/${item.color} +${item.quantity} units`);
                        } else {
                            // Fallback to general product stock update
                            console.log(`❌ No variant found for ${item.productname} ${item.size}/${item.color}, updating general stock`);
                            await connection.execute(`
                                UPDATE products 
                                SET total_available_stock = total_available_stock + ?,
                                    productquantity = productquantity + ?,
                                    last_stock_update = CURRENT_TIMESTAMP
                                WHERE product_id = ?
                            `, [item.quantity, item.quantity, item.product_id]);
                        }
                        
                        console.log(`Restored variant stock for ${item.productname} ${item.color || 'Default'} ${item.size || 'N/A'}: added back ${item.quantity} units`);
                        
                        // Check variant stock after restoration for verification
                        const [updatedVariant] = await connection.execute(`
                            SELECT stock_quantity, available_quantity, reserved_quantity
                            FROM product_variants 
                            WHERE product_id = ? AND size = ? AND color = ?
                        `, [item.product_id, item.size || 'N/A', item.color || 'Default']);
                        
                        if (updatedVariant.length > 0) {
                            console.log(`After restoration - Stock: ${updatedVariant[0].stock_quantity}, Available: ${updatedVariant[0].available_quantity}, Reserved: ${updatedVariant[0].reserved_quantity}`);
                        }
                        
                        // Record stock movement for variant restoration
                        await connection.execute(`
                            INSERT INTO stock_movements (
                                product_id, movement_type, quantity, size, reason, 
                                reference_number, user_id, notes
                            ) VALUES (?, 'IN', ?, ?, 'Order Cancellation - Stock Restored', ?, ?, ?)
                        `, [
                            item.product_id, 
                            item.quantity, 
                            item.size || 'N/A', 
                            request.order_id, 
                            req.user?.user_id || null,
                            `Order cancelled - restored ${item.quantity} units to ${item.productname} ${item.size || 'N/A'}/${item.color || 'Default'}`
                        ]);
                    }
                    
                    // Now sync product-level totals from variants
                    console.log('Syncing product-level stock from variants...');
                    for (const item of orderItems) {
                        await syncAllStockFields(connection, item.product_id);
                        console.log(`Synced all stock fields for ${item.productname}`);
                    }
                } else {
                    console.log(`Order was in '${originalStatus}' status - no stock to restore (stock was never subtracted)`);
                }
                
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
                
                console.log(`Order cancelled successfully. Stock restoration: ${shouldRestoreStock ? 'YES' : 'NO'}`);
                
                // Prepare response data for notifications
                var stockUpdateEvent = {
                    type: 'order_cancelled',
                    orderId: request.order_id,
                    originalStatus: originalStatus,
                    stockRestored: shouldRestoreStock,
                    timestamp: new Date().toISOString()
                };
                
                if (shouldRestoreStock) {
                    // Get the order items for the response (we have them from the restoration logic)
                    const [responseOrderItems] = await connection.execute(`
                        SELECT oi.product_id, oi.quantity, oi.color, oi.size, p.productname
                        FROM order_items oi
                        JOIN orders o ON oi.invoice_id COLLATE utf8mb4_unicode_ci = o.invoice_id COLLATE utf8mb4_unicode_ci
                        JOIN products p ON oi.product_id = p.product_id
                        WHERE o.id = ?
                    `, [request.order_id]);
                    
                    // Get updated stock levels for notifications
                    const [updatedStock] = await connection.execute(`
                        SELECT p.product_id, p.productname, p.total_available_stock, p.total_stock
                        FROM products p
                        WHERE p.product_id IN (${responseOrderItems.map(() => '?').join(',')})
                    `, responseOrderItems.map(item => item.product_id));
                    
                    // Prepare stock restoration data
                    const stockRestorations = responseOrderItems.map(item => {
                        const updatedProduct = updatedStock.find(p => p.product_id === item.product_id);
                        return {
                            product_id: item.product_id,
                            product: item.productname,
                            color: item.color,
                            size: item.size,
                            quantityRestored: item.quantity,
                            newAvailableStock: updatedProduct ? updatedProduct.total_available_stock : 0,
                            newTotalStock: updatedProduct ? updatedProduct.total_stock : 0
                        };
                    });
                    
                    stockUpdateEvent.productIds = responseOrderItems.map(item => item.product_id);
                    stockUpdateEvent.stockRestorations = stockRestorations;
                } else {
                    stockUpdateEvent.message = `Order was in '${originalStatus}' status - no stock restoration needed`;
                }
            }
            
            await connection.commit();
            await connection.end();
            
            const message = action === 'approve' 
                ? 'Cancellation request approved and order cancelled successfully'
                : 'Cancellation request denied successfully';
            
            const responseData = {
                requestId,
                action,
                status: newStatus,
                adminNotes
            };
            
            // Add stock update event if cancellation was approved
            if (action === 'approve' && typeof stockUpdateEvent !== 'undefined') {
                responseData.stockUpdateEvent = stockUpdateEvent;
                if (stockUpdateEvent.stockRestored && stockUpdateEvent.stockRestorations) {
                    responseData.inventoryRestored = stockUpdateEvent.stockRestorations;
                } else {
                    responseData.inventoryRestored = [];
                    responseData.message = stockUpdateEvent.message;
                }
            }
            
            res.json({
                success: true,
                message,
                data: responseData
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

// Helper function to sync product sizes JSON with variant data
async function syncProductSizesWithVariants(connection, productId) {
    try {
        console.log(`Syncing sizes JSON for product ${productId}...`);
        
        // Get current variants for this product
        const [variants] = await connection.execute(
            'SELECT size, color, available_quantity FROM product_variants WHERE product_id = ? ORDER BY size, color',
            [productId]
        );
        
        if (variants.length > 0) {
            // Build the new sizes JSON structure
            const sizesMap = {};
            variants.forEach(variant => {
                if (!sizesMap[variant.size]) {
                    sizesMap[variant.size] = {
                        size: variant.size,
                        colorStocks: []
                    };
                }
                sizesMap[variant.size].colorStocks.push({
                    color: variant.color,
                    stock: variant.available_quantity
                });
            });
            
            const newSizesArray = Object.values(sizesMap);
            const newSizesJSON = JSON.stringify(newSizesArray);
            
            // Update the products table
            await connection.execute(
                'UPDATE products SET sizes = ? WHERE product_id = ?',
                [newSizesJSON, productId]
            );
            
            console.log(`✅ Synced sizes JSON for product ${productId}`);
        }
    } catch (error) {
        console.error(`Error syncing sizes JSON for product ${productId}:`, error);
    }
}

// Helper function to sync all stock fields (totals + sizes JSON)
async function syncAllStockFields(connection, productId) {
    try {
        console.log(`Syncing all stock fields for product ${productId}...`);
        
        // Update all stock totals from variants
        await connection.execute(`
            UPDATE products p
            SET p.total_stock = (
                SELECT COALESCE(SUM(pv.stock_quantity), 0) 
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
        
        // Also sync the sizes JSON
        await syncProductSizesWithVariants(connection, productId);
        
        console.log(`✅ All stock fields synced for product ${productId}`);
    } catch (error) {
        console.error(`Error syncing all stock fields for product ${productId}:`, error);
    }
}
