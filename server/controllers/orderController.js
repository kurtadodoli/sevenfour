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
            AND o.order_number NOT LIKE 'CUSTOM-%-%-%'
            AND (o.notes IS NULL OR o.notes NOT LIKE '%Reference: CUSTOM-%')
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

// Get user's orders with items details
exports.getUserOrdersWithItems = async (req, res) => {
    let connection;
    try {
        console.log('=== GET USER ORDERS WITH ITEMS DEBUG ===');
        console.log('User ID from token:', req.user?.id);
        console.log('User object:', req.user);
        
        if (!req.user || !req.user.id) {
            console.error('❌ No user ID found in request');
            return res.status(401).json({
                success: false,
                message: 'User authentication failed'
            });
        }
        
        console.log('🔗 Creating database connection...');
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Database connection created');
        
        // Start with a simple query first to test
        console.log('🔍 Testing basic orders query...');
        const [basicOrders] = await connection.execute(`
            SELECT o.* FROM orders o 
            WHERE o.user_id = ? 
            AND o.order_number NOT LIKE 'CUSTOM-%-%-%'
            AND (o.notes IS NULL OR o.notes NOT LIKE '%Reference: CUSTOM-%')
            ORDER BY o.order_date DESC
        `, [req.user.id]);
        
        console.log(`✅ Found ${basicOrders.length} basic orders`);
        
        if (basicOrders.length === 0) {
            console.log('ℹ️ No orders found for user');
            await connection.end();
            return res.json({
                success: true,
                data: []
            });
        }
        
        // Now try the full query with joins
        console.log('🔍 Executing full query with joins...');
        const [orders] = await connection.execute(`
            SELECT 
                o.*,
                oi.total_amount as invoice_total,
                oi.invoice_status,
                st.transaction_status,
                st.payment_method,
                latest_cr.status as cancellation_request_status,
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
            AND o.order_number NOT LIKE 'CUSTOM-%-%-%'
            AND (o.notes IS NULL OR o.notes NOT LIKE '%Reference: CUSTOM-%')
            ORDER BY o.order_date DESC
        `, [req.user.id]);
        
        console.log(`✅ Full query executed, found ${orders.length} orders`);
        
        // Get items for each order
        console.log('🔍 Fetching items for each order...');
        for (let order of orders) {
            try {
                const [items] = await connection.execute(`
                    SELECT 
                        oi.*,
                        p.productname,
                        p.productimage,
                        p.productdescription
                    FROM order_items oi
                    LEFT JOIN products p ON oi.product_id = p.product_id
                    WHERE oi.order_id = ?
                `, [order.id]);
                
                order.items = items;
                console.log(`✅ Order ${order.order_number}: ${items.length} items`);
            } catch (itemError) {
                console.error(`❌ Error fetching items for order ${order.id}:`, itemError.message);
                order.items = []; // Set empty array if items fetch fails
            }
        }
        
        await connection.end();
        
        res.json({
            success: true,
            data: orders
        });
        
    } catch (error) {
        console.error('❌ Error fetching user orders with items:', error);
        console.error('❌ Error stack:', error.stack);
        
        if (connection) {
            try {
                await connection.end();
            } catch (closeError) {
                console.error('❌ Error closing connection:', closeError.message);
            }
        }
        
        res.status(500).json({ 
            success: false, 
            message: `Failed to fetch orders with items: ${error.message}` 
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
            customer_email,
            street_address,
            city_municipality,
            province,
            zip_code,
            payment_method,
            payment_reference
        } = req.body;
        
        if (!shipping_address || !contact_phone) {
            return res.status(400).json({ 
                success: false, 
                message: 'Shipping address and contact phone are required' 
            });
        }
        
        if (!payment_reference) {
            return res.status(400).json({ 
                success: false, 
                message: 'Payment reference is required' 
            });
        }
        
        if (!req.file) {
            return res.status(400).json({ 
                success: false, 
                message: 'Payment proof is required' 
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
            
            // Create transaction
            await connection.execute(`
                INSERT INTO sales_transactions (
                    transaction_id, invoice_id, user_id, amount, payment_method
                ) VALUES (?, ?, ?, ?, ?)
            `, [transactionId, invoiceId, req.user.id, totalAmount, payment_method || 'gcash']);
            
            // Create order - SIMPLIFIED VERSION WITHOUT customer_fullname
            await connection.execute(`
                INSERT INTO orders (
                    order_number, user_id, invoice_id, transaction_id, 
                    total_amount, shipping_address, contact_phone, notes,
                    street_address, city_municipality, province, zip_code,
                    payment_method, payment_reference, payment_proof_filename,
                    payment_status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                orderNumber, req.user.id, invoiceId, transactionId,
                totalAmount, shipping_address, contact_phone, notes,
                street_address, city_municipality, province, zip_code,
                payment_method || 'gcash', payment_reference, req.file.filename,
                'pending'
            ]);
            
            // Get the created order ID
            
            // Get the created order ID
            const [orderResult] = await connection.execute(
                'SELECT id FROM orders WHERE order_number = ?',
                [orderNumber]
            );
            const orderId = orderResult[0].id;
            
            // 🚨 IMMEDIATE STOCK DEDUCTION - New Feature Implementation
            
            // Check stock availability and deduct immediately
            const insufficientStock = [];
            const stockUpdates = [];
            
            for (const item of cartItems) {
                const finalColor = (item.color && item.color.trim() !== '') ? item.color : item.productcolor;
                
                console.log(`🔍 Checking and deducting stock for ${item.productname} - Size: ${item.size}, Color: ${finalColor}, Qty: ${item.quantity}`);
                
                // Check variant stock first
                const [variantStock] = await connection.execute(`
                    SELECT available_quantity, stock_quantity, reserved_quantity
                    FROM product_variants 
                    WHERE product_id = ? AND size = ? AND color = ?
                `, [item.product_id, item.size || 'N/A', finalColor || 'Default']);
                
                if (variantStock.length > 0) {
                    // Variant exists - check and deduct from variant
                    const variant = variantStock[0];
                    if (variant.available_quantity < item.quantity) {
                        insufficientStock.push({
                            product: item.productname,
                            size: item.size,
                            color: finalColor,
                            requested: item.quantity,
                            available: variant.available_quantity
                        });
                        continue;
                    }
                    
                    // Deduct from variant stock immediately
                    const [variantResult] = await connection.execute(`
                        UPDATE product_variants 
                        SET available_quantity = available_quantity - ?,
                            stock_quantity = stock_quantity - ?,
                            last_updated = CURRENT_TIMESTAMP
                        WHERE product_id = ? AND size = ? AND color = ? AND available_quantity >= ?
                    `, [item.quantity, item.quantity, item.product_id, item.size || 'N/A', finalColor || 'Default', item.quantity]);
                    
                    if (variantResult.affectedRows > 0) {
                        console.log(`✅ Immediately deducted ${item.quantity} units from variant ${item.productname} ${item.size}/${finalColor}`);
                        
                        // 🔥 UPDATE THE SIZES JSON FIELD IN PRODUCTS TABLE
                        console.log(`🔄 Updating sizes JSON field for product ${item.product_id}...`);
                        
                        // Get current sizes JSON
                        const [productData] = await connection.execute(
                            'SELECT sizes FROM products WHERE product_id = ?',
                            [item.product_id]
                        );
                        
                        if (productData.length > 0 && productData[0].sizes) {
                            try {
                                const sizesData = JSON.parse(productData[0].sizes);
                                
                                // Find and update the specific size/color stock
                                let updated = false;
                                for (let sizeObj of sizesData) {
                                    if (sizeObj.size === item.size) {
                                        for (let colorStock of sizeObj.colorStocks) {
                                            if (colorStock.color === finalColor) {
                                                const oldStock = colorStock.stock;
                                                colorStock.stock = Math.max(0, colorStock.stock - item.quantity);
                                                console.log(`📉 Updated ${item.size} ${finalColor}: ${oldStock} → ${colorStock.stock}`);
                                                updated = true;
                                                break;
                                            }
                                        }
                                        if (updated) break;
                                    }
                                }
                                
                                if (updated) {
                                    // Update the sizes JSON in products table
                                    await connection.execute(
                                        'UPDATE products SET sizes = ? WHERE product_id = ?',
                                        [JSON.stringify(sizesData), item.product_id]
                                    );
                                    console.log(`✅ Updated sizes JSON for product ${item.product_id}`);
                                }
                            } catch (jsonError) {
                                console.error('❌ Error updating sizes JSON:', jsonError);
                            }
                        }
                        
                        // Log the stock movement
                        await connection.execute(`
                            INSERT INTO stock_movements 
                            (product_id, movement_type, quantity, size, reason, reference_number, user_id, notes)
                            VALUES (?, 'OUT', ?, ?, 'Order Placed - Immediate Stock Deduction', ?, ?, ?)
                        `, [item.product_id, item.quantity, item.size || 'N/A', 
                            orderId, req.user.id, `Order placed - immediately deducted ${item.quantity} units of ${item.productname} ${item.size}/${finalColor}`]);
                        
                        stockUpdates.push({
                            product_id: item.product_id,
                            product: item.productname,
                            size: item.size,
                            color: finalColor,
                            quantityDeducted: item.quantity
                        });
                    } else {
                        console.log(`❌ Failed to deduct from variant - insufficient stock or concurrent update`);
                        insufficientStock.push({
                            product: item.productname,
                            size: item.size,
                            color: finalColor,
                            requested: item.quantity,
                            available: variant.available_quantity
                        });
                    }
                } else {
                    // No variant found - check and deduct from general product stock
                    const [productStock] = await connection.execute(`
                        SELECT total_available_stock FROM products WHERE product_id = ?
                    `, [item.product_id]);
                    
                    if (productStock.length === 0 || productStock[0].total_available_stock < item.quantity) {
                        insufficientStock.push({
                            product: item.productname,
                            size: item.size,
                            color: finalColor,
                            requested: item.quantity,
                            available: productStock.length > 0 ? productStock[0].total_available_stock : 0
                        });
                        continue;
                    }
                    
                    // Deduct from general product stock
                    await connection.execute(`
                        UPDATE products 
                        SET total_available_stock = total_available_stock - ?,
                            productquantity = GREATEST(0, productquantity - ?),
                            last_stock_update = CURRENT_TIMESTAMP
                        WHERE product_id = ? AND total_available_stock >= ?
                    `, [item.quantity, item.quantity, item.product_id, item.quantity]);
                    
                    console.log(`✅ Immediately deducted ${item.quantity} units from general stock for ${item.productname}`);
                    
                    stockUpdates.push({
                        product_id: item.product_id,
                        product: item.productname,
                        size: item.size,
                        color: finalColor,
                        quantityDeducted: item.quantity
                    });
                }
            }
            
            // If there's insufficient stock, rollback and return error
            if (insufficientStock.length > 0) {
                await connection.rollback();
                await connection.end();
                console.log('❌ Insufficient stock for items:', insufficientStock);
                return res.status(400).json({
                    success: false,
                    message: 'Insufficient stock for some items',
                    insufficientStock
                });
            }
            
            // Update overall product stock totals from variants
            const uniqueProductIds = [...new Set(cartItems.map(item => item.product_id))];
            
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
                
                console.log(`✅ Updated product totals for product ID: ${productId}`);
            }
            
            console.log('🔥 === STOCK IMMEDIATELY DEDUCTED ON ORDER PLACEMENT ===');
            
            // Create order items with proper order_id reference and all required fields
            for (let index = 0; index < cartItems.length; index++) {
                const item = cartItems[index];
                
                // FIXED: Proper color handling - use selected color if it exists and is not empty
                const finalColor = (item.color && item.color.trim() !== '') ? item.color : item.productcolor;
                
                console.log(`Order item ${index + 1}: ${item.productname}`);
                console.log(`  Selected color: "${item.color}"`);
                console.log(`  Default color: "${item.productcolor}"`);
                console.log(`  Final color: "${finalColor}"`);
                
                console.log('🔧 FIXED: Adding all required fields to order_items INSERT...');
                
                await connection.execute(`
                    INSERT INTO order_items (
                        order_id, invoice_id, product_id, product_name, product_price,
                        quantity, color, size, subtotal,
                        customer_fullname, customer_phone, gcash_reference_number,
                        payment_proof_image_path, province, city_municipality, street_address
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                    orderId, invoiceId, item.product_id, item.productname, item.productprice,
                    item.quantity, finalColor, item.size || 'N/A',
                    item.productprice * item.quantity,
                    // Add the missing required fields
                    customer_name || req.user.username || 'Guest Customer',
                    contact_phone || 'N/A',
                    payment_reference || 'N/A',
                    req.file.filename || 'N/A',
                    province || 'N/A',
                    city_municipality || 'N/A',
                    street_address || 'N/A'
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
                message: 'Order created successfully. Stock has been updated immediately.',
                order: {
                    order_number: orderNumber,
                    id: orderId,
                    invoice_id: invoiceId,
                    transaction_id: transactionId,
                    total_amount: totalAmount
                },
                stockUpdates,
                stockUpdateEvent: {
                    type: 'order_placed',
                    orderId: orderId,
                    productIds: uniqueProductIds,
                    timestamp: new Date().toISOString(),
                    immediate: true
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
    const connection = await mysql.createConnection(dbConfig);
    
    try {
        const orderId = req.params.id;
        
        console.log('=== CONFIRM ORDER FOR ADMIN VERIFICATION (DEBUG) ===');
        console.log('req.user:', req.user);
        console.log('orderId:', orderId);
        console.log('typeof orderId:', typeof orderId);
        
        if (!req.user || !req.user.id) {
            console.log('❌ Authentication failed - no user or user.id');
            await connection.end();
            return res.status(401).json({
                success: false,
                message: 'User authentication required'
            });
        }
        
        const userId = req.user.id;
        console.log('userId:', userId, 'typeof:', typeof userId);
        
        try {
            await connection.beginTransaction();
            
            // Check if the order exists and belongs to the user
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
            
            // Verify the order has payment proof
            console.log('Checking if order has payment proof...');
            const [paymentProofCheck] = await connection.execute(`
                SELECT COUNT(*) as items_with_proof
                FROM order_items 
                WHERE order_id = ? 
                AND gcash_reference_number IS NOT NULL 
                AND gcash_reference_number != 'COD_ORDER'
                AND gcash_reference_number != 'N/A'
                AND payment_proof_image_path IS NOT NULL
                AND payment_proof_image_path != 'N/A'
            `, [orderId]);
            
            if (paymentProofCheck[0].items_with_proof === 0) {
                await connection.rollback();
                await connection.end();
                console.log('❌ No payment proof found');
                return res.status(400).json({
                    success: false,
                    message: 'Payment proof is required before confirming the order'
                });
            }
            
            // Get the order items for reference (stock was already deducted during order creation)
            console.log('Getting order items for confirmation...');
            const [orderItems] = await connection.execute(`
                SELECT oi.product_id, oi.quantity, oi.size, oi.color, 
                       p.productname, p.total_available_stock
                FROM order_items oi
                JOIN products p ON oi.product_id = p.product_id
                WHERE oi.order_id = ?
            `, [orderId]);
            
            if (orderItems.length === 0) {
                await connection.rollback();
                await connection.end();
                console.log('❌ No order items found');
                return res.status(400).json({
                    success: false,
                    message: 'No order items found'
                });
            }
            
            console.log('✅ Order items found - stock was already deducted during order placement');

            // Update order to mark it as ready for admin verification (but keep status as 'pending')
            console.log('Marking order as ready for admin verification...');
            await connection.execute(`
                UPDATE orders 
                SET updated_at = CURRENT_TIMESTAMP,
                    user_confirmed_at = CURRENT_TIMESTAMP
                WHERE id = ? AND user_id = ?
            `, [orderId, userId]);
            
            console.log('Order marked for admin verification');
            
            // Update invoice status to indicate user confirmation
            const invoiceId = order.invoice_id;
            await connection.execute(`
                UPDATE order_invoices 
                SET invoice_status = 'pending_verification',
                    updated_at = CURRENT_TIMESTAMP
                WHERE invoice_id = ?
            `, [invoiceId]);
            
            console.log('Invoice status updated to pending_verification');
            
            await connection.commit();
            await connection.end();
            
            res.json({
                success: true,
                message: 'Order submitted for admin verification! Stock was already deducted when order was placed.',
                awaitingVerification: true,
                stockAlreadyDeducted: true,
                stockUpdateEvent: {
                    type: 'order_submitted_for_verification',
                    orderId: orderId,
                    productIds: orderItems.map(item => item.product_id),
                    timestamp: new Date().toISOString(),
                    note: 'Stock was deducted during order placement'
                }
            });
            
        } catch (error) {
            await connection.rollback();
            await connection.end();
            throw error;
        }
        
    } catch (error) {
        console.error('Error confirming order for verification:', error);
        if (error instanceof Error) {
            console.error('Error stack:', error.stack);
        }
        // Log request context for debugging
        try {
            console.error('Request context:', {
                user: req.user,
                params: req.params,
                body: req.body,
                headers: req.headers
            });
        } catch (ctxErr) {
            console.error('Error logging request context:', ctxErr);
        }
        res.status(500).json({ 
            success: false, 
            message: 'Failed to confirm order for verification',
            error: error.message || error
        });
    }
};

// Generate PDF invoice
exports.generateInvoicePDF = async (req, res) => {
    try {
        const { invoiceId } = req.params;
        console.log('📄 Generating PDF for invoice:', invoiceId);
        console.log('🔍 User ID:', req.user.id);
        
        const connection = await mysql.createConnection(dbConfig);
        
        // Get order details with invoice ID
        const [orders] = await connection.execute(`
            SELECT 
                o.*,
                u.first_name,
                u.last_name,
                u.email,
                st.transaction_status,
                st.payment_method
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.user_id
            LEFT JOIN sales_transactions st ON o.transaction_id = st.transaction_id
            WHERE o.invoice_id = ? AND o.user_id = ?
        `, [invoiceId, req.user.id]);
        
        if (orders.length === 0) {
            await connection.end();
            console.log('❌ Invoice not found for user');
            return res.status(404).json({ 
                success: false, 
                message: 'Invoice not found or access denied' 
            });
        }
        
        const order = orders[0];
        console.log('✅ Order found:', order.order_number);
        
        // Get order items
        const [items] = await connection.execute(`
            SELECT 
                oi.*,
                p.productname,
                p.productcolor,
                p.product_type
            FROM order_items oi
            LEFT JOIN products p ON oi.product_id = p.product_id
            WHERE oi.order_id = ?
            ORDER BY oi.sort_order
        `, [order.id]);
        
        console.log(`📦 Found ${items.length} items for invoice`);
        
        await connection.end();
        
        // Create PDF
        const PDFDocument = require('pdfkit');
        const doc = new PDFDocument({ margin: 50 });
        
        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=invoice-${invoiceId}.pdf`);
        
        // Pipe PDF to response
        doc.pipe(res);
        
        // Header
        doc.fillColor('#000000')
           .fontSize(24)
           .text('SEVEN FOUR CLOTHING', 50, 50, { align: 'center' })
           .fontSize(16)
           .text('OFFICIAL INVOICE', 50, 80, { align: 'center' });
        
        // Draw line
        doc.moveTo(50, 110).lineTo(550, 110).stroke();
        
        // Invoice info
        doc.fontSize(12)
           .text(`Invoice ID: ${invoiceId}`, 50, 130)
           .text(`Order Number: ${order.order_number}`, 50, 150)
           .text(`Date: ${new Date(order.order_date || order.created_at).toLocaleDateString()}`, 50, 170)
           .text(`Status: ${order.transaction_status || order.status}`.toUpperCase(), 50, 190);
        
        // Customer details
        doc.fontSize(14)
           .text('BILL TO:', 50, 230)
           .fontSize(12)
           .text(`${order.first_name || 'Customer'} ${order.last_name || ''}`, 50, 250)
           .text(`${order.email}`, 50, 270)
           .text(`${order.contact_phone || 'Phone not provided'}`, 50, 290);
        
        // Shipping address
        if (order.shipping_address) {
            doc.fontSize(14)
               .text('SHIP TO:', 50, 320)
               .fontSize(12)
               .text(order.shipping_address, 50, 340, { width: 400 });
        }
        
        // Items header
        let yPosition = order.shipping_address ? 390 : 340;
        doc.fontSize(14)
           .text('ITEMS ORDERED:', 50, yPosition);
        
        yPosition += 30;
        
        // Items table
        doc.fontSize(10)
           .text('Item', 50, yPosition)
           .text('Size', 200, yPosition)
           .text('Color', 250, yPosition)
           .text('Qty', 350, yPosition)
           .text('Price', 400, yPosition)
           .text('Total', 480, yPosition);
        
        // Draw line under header
        yPosition += 15;
        doc.moveTo(50, yPosition).lineTo(550, yPosition).stroke();
        yPosition += 10;
        
        // List items
        let subtotal = 0;
        items.forEach((item, index) => {
            // Ensure price is a number
            const price = parseFloat(item.product_price || item.price || 0);
            const quantity = parseInt(item.quantity || 1);
            const itemTotal = price * quantity;
            subtotal += itemTotal;
            
            doc.fontSize(10)
               .text(item.product_name || item.productname || 'Product', 50, yPosition, { width: 140 })
               .text(item.size || 'N/A', 200, yPosition)
               .text(item.color || item.productcolor || 'N/A', 250, yPosition, { width: 90 })
               .text(quantity.toString(), 350, yPosition)
               .text(`₱${price.toFixed(2)}`, 400, yPosition)
               .text(`₱${itemTotal.toFixed(2)}`, 480, yPosition);
            
            yPosition += 20;
        });
        
        // Draw line before total
        yPosition += 10;
        doc.moveTo(350, yPosition).lineTo(550, yPosition).stroke();
        yPosition += 15;
        
        // Total
        doc.fontSize(14)
           .text(`TOTAL AMOUNT: ₱${(parseFloat(order.total_amount) || subtotal).toFixed(2)}`, 350, yPosition, { align: 'right' });
        
        yPosition += 40;
        
        // Payment info
        doc.fontSize(12)
           .text('Payment Method:', 50, yPosition)
           .text(order.payment_method || 'Cash on Delivery', 150, yPosition);
        
        yPosition += 20;
        doc.text('Payment Status:', 50, yPosition)
           .text((order.transaction_status || order.status).toUpperCase(), 150, yPosition);
        
        // Footer
        yPosition += 60;
        doc.fontSize(10)
           .fillColor('#666666')
           .text('Thank you for your business with Seven Four Clothing!', 50, yPosition, { align: 'center' })
           .text('For questions about this invoice, please contact us.', 50, yPosition + 15, { align: 'center' });
        
        // Finalize PDF
        doc.end();
        
        console.log('✅ PDF generated successfully');
        
    } catch (error) {
        console.error('❌ Error generating PDF:', error);
        if (!res.headersSent) {
            res.status(500).json({ 
                success: false, 
                message: 'Failed to generate invoice PDF',
                error: error.message
            });
        }
    }
};

// Generate invoice PDF for admin access (no user restriction)
exports.generateAdminInvoicePDF = async (req, res) => {
    try {
        const { invoiceId } = req.params;
        console.log('📄 Admin generating PDF for invoice:', invoiceId);
        console.log('🔍 Admin User ID:', req.user.id);
        
        const connection = await mysql.createConnection(dbConfig);
        
        // Get order details with invoice ID (admin can access any order)
        const [orders] = await connection.execute(`
            SELECT 
                o.*,
                u.first_name,
                u.last_name,
                u.email,
                st.transaction_status,
                st.payment_method
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.user_id
            LEFT JOIN sales_transactions st ON o.transaction_id = st.transaction_id
            WHERE o.invoice_id = ? OR o.order_number = ?
        `, [invoiceId, invoiceId]);
        
        if (orders.length === 0) {
            // Try to find by order ID if invoice_id doesn't work
            const [ordersByOrderId] = await connection.execute(`
                SELECT 
                    o.*,
                    u.first_name,
                    u.last_name,
                    u.email,
                    st.transaction_status,
                    st.payment_method
                FROM orders o
                LEFT JOIN users u ON o.user_id = u.user_id
                LEFT JOIN sales_transactions st ON o.transaction_id = st.transaction_id
                WHERE o.id = ?
            `, [invoiceId]);
            
            if (ordersByOrderId.length === 0) {
                await connection.end();
                console.log('❌ Invoice not found');
                return res.status(404).json({ 
                    success: false, 
                    message: 'Invoice not found' 
                });
            }
            orders.push(...ordersByOrderId);
        }
        
        const order = orders[0];
        console.log('✅ Order found:', order.order_number);
        
        // Get order items
        const [items] = await connection.execute(`
            SELECT 
                oi.*,
                p.productname,
                p.productcolor,
                p.product_type
            FROM order_items oi
            LEFT JOIN products p ON oi.product_id = p.product_id
            WHERE oi.order_id = ?
            ORDER BY oi.sort_order
        `, [order.id]);
        
        console.log(`📦 Found ${items.length} items for invoice`);
        
        await connection.end();
        
        // Create PDF (same as customer version but without user restriction)
        const PDFDocument = require('pdfkit');
        const doc = new PDFDocument({ margin: 50 });
        
        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=invoice-${order.order_number || invoiceId}.pdf`);
        
        // Pipe PDF to response
        doc.pipe(res);
        
        // Header
        doc.fillColor('#000000')
           .fontSize(24)
           .text('SEVEN FOUR CLOTHING', 50, 50, { align: 'center' })
           .fontSize(16)
           .text('OFFICIAL INVOICE', 50, 80, { align: 'center' });
        
        // Draw line
        doc.moveTo(50, 110).lineTo(550, 110).stroke();
        
        // Invoice info
        doc.fontSize(12)
           .text(`Invoice ID: ${order.invoice_id || order.order_number}`, 50, 130)
           .text(`Order Number: ${order.order_number}`, 50, 150)
           .text(`Date: ${new Date(order.order_date || order.created_at).toLocaleDateString()}`, 50, 170)
           .text(`Status: ${order.transaction_status || order.status}`.toUpperCase(), 50, 190);
        
        // Customer details
        doc.fontSize(14)
           .text('BILL TO:', 50, 230)
           .fontSize(12)
           .text(`${order.first_name || 'Customer'} ${order.last_name || ''}`, 50, 250)
           .text(`${order.email}`, 50, 270)
           .text(`${order.contact_phone || 'Phone not provided'}`, 50, 290);
        
        // Shipping address
        if (order.shipping_address) {
            doc.fontSize(14)
               .text('SHIP TO:', 50, 320)
               .fontSize(12)
               .text(order.shipping_address, 50, 340, { width: 400 });
        }
        
        // Items header
        let yPosition = order.shipping_address ? 390 : 340;
        doc.fontSize(14)
           .text('ITEMS ORDERED:', 50, yPosition);
        
        yPosition += 30;
        
        // Items table
        doc.fontSize(10)
           .text('Item', 50, yPosition)
           .text('Size', 200, yPosition)
           .text('Color', 250, yPosition)
           .text('Qty', 350, yPosition)
           .text('Price', 400, yPosition)
           .text('Total', 480, yPosition);
        
        // Draw line under header
        yPosition += 15;
        doc.moveTo(50, yPosition).lineTo(550, yPosition).stroke();
        yPosition += 10;
        
        // List items
        let subtotal = 0;
        items.forEach((item, index) => {
            // Ensure price is a number
            const price = parseFloat(item.product_price || item.price || 0);
            const quantity = parseInt(item.quantity || 1);
            const itemTotal = price * quantity;
            subtotal += itemTotal;
            
            doc.fontSize(10)
               .text(item.product_name || item.productname || 'Product', 50, yPosition, { width: 140 })
               .text(item.size || 'N/A', 200, yPosition)
               .text(item.color || item.productcolor || 'N/A', 250, yPosition, { width: 90 })
               .text(quantity.toString(), 350, yPosition)
               .text(`₱${price.toFixed(2)}`, 400, yPosition)
               .text(`₱${itemTotal.toFixed(2)}`, 480, yPosition);
            
            yPosition += 20;
        });
        
        // Draw line before total
        yPosition += 10;
        doc.moveTo(350, yPosition).lineTo(550, yPosition).stroke();
        yPosition += 15;
        
        // Total
        doc.fontSize(14)
           .text(`TOTAL AMOUNT: ₱${(order.total_amount || subtotal).toFixed(2)}`, 350, yPosition, { align: 'right' });
        
        yPosition += 40;
        
        // Payment info
        doc.fontSize(12)
           .text('Payment Method:', 50, yPosition)
           .text(order.payment_method || 'Cash on Delivery', 150, yPosition);
        
        yPosition += 20;
        doc.text('Payment Status:', 50, yPosition)
           .text((order.transaction_status || order.status).toUpperCase(), 150, yPosition);
        
        // Footer
        yPosition += 60;
        doc.fontSize(10)
           .fillColor('#666666')
           .text('Thank you for your business with Seven Four Clothing!', 50, yPosition, { align: 'center' })
           .text('For questions about this invoice, please contact us.', 50, yPosition + 15, { align: 'center' });
        
        // Finalize PDF
        doc.end();
        
        console.log('✅ Admin PDF generated successfully');
        
    } catch (error) {
        console.error('❌ Error generating admin PDF:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to generate invoice PDF',
            error: error.message
        });
    }
};

// Get all transactions for admin dashboard
exports.getAllTransactions = async (req, res) => {
    let connection;
    try {
        console.log('=== GET ALL TRANSACTIONS DEBUG ===');
        console.log('User:', req.user?.id, req.user?.role);
        console.log('Query params:', req.query);
        
        // Only allow admin/staff to view all transactions
        if (!['admin', 'staff'].includes(req.user.role)) {
            return res.status(403).json({ 
                success: false, 
                message: 'Access denied - Admin/staff only' 
            });
        }
        
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Database connection created');
        
        const { status, page = 1, limit = 10, search } = req.query;
        const offset = (page - 1) * limit;
        
        console.log('Raw params:', { status, page, limit, search });
        console.log('Calculated offset:', offset);
        
        let whereConditions = [];
        let queryParams = [];
        
        // Add status filter
        if (status && status !== 'all') {
            whereConditions.push('st.transaction_status = ?');
            queryParams.push(status);
        }
        
        // Add search filter
        if (search) {
            whereConditions.push(`(
                st.transaction_id LIKE ? OR 
                o.order_number LIKE ? OR 
                u.email LIKE ? OR 
                CONCAT(u.first_name, ' ', u.last_name) LIKE ?
            )`);
            const searchTerm = `%${search}%`;
            queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
        }
        
        // Build WHERE clause properly
        const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
        console.log('WHERE clause:', whereClause);
        
        // Get transactions with order and user details - use string concatenation for LIMIT/OFFSET
        let mainQuery = `
            SELECT 
                st.transaction_id,
                st.invoice_id,
                st.user_id,
                st.transaction_date,
                st.amount,
                st.transaction_status,
                st.payment_method,
                st.created_at as transaction_created_at,
                st.updated_at as transaction_updated_at,
                o.order_number,
                o.status as order_status,
                o.shipping_address,
                o.contact_phone,
                o.order_date,
                oi.customer_name,
                oi.customer_email,
                oi.total_amount as invoice_total,
                oi.invoice_status,
                CONCAT(u.first_name, ' ', u.last_name) as username,
                u.email as user_email,
                u.first_name,
                u.last_name
            FROM sales_transactions st
            LEFT JOIN orders o ON st.transaction_id = o.transaction_id
            LEFT JOIN order_invoices oi ON st.invoice_id = oi.invoice_id
            LEFT JOIN users u ON st.user_id = u.user_id
            ${whereClause}
            ORDER BY st.created_at DESC
            LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`;
            
        console.log('Main query:', mainQuery);
        console.log('Query params (without limit/offset):', queryParams);
        
        const [transactions] = await connection.execute(mainQuery, queryParams);
        console.log(`✅ Found ${transactions.length} transactions`);
        
        // Get total count for pagination - simplified query
        let countQuery = `
            SELECT COUNT(*) as total
            FROM sales_transactions st
            LEFT JOIN orders o ON st.transaction_id = o.transaction_id
            LEFT JOIN order_invoices oi ON st.invoice_id = oi.invoice_id
            LEFT JOIN users u ON st.user_id = u.user_id
            ${whereClause}`;
            
        const [countResult] = await connection.execute(countQuery, queryParams);
        const total = countResult[0].total;
        console.log(`✅ Total count: ${total}`);
        
        await connection.end();
        
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
        
        console.log('=== END GET ALL TRANSACTIONS DEBUG ===');
        
    } catch (error) {
        console.error('❌ Error fetching transactions:', error);
        console.error('❌ Error stack:', error.stack);
        
        if (connection) {
            try {
                await connection.end();
            } catch (closeError) {
                console.error('❌ Error closing connection:', closeError.message);
            }
        }
        
        res.status(500).json({ 
            success: false, 
            message: `Failed to fetch transactions: ${error.message}` 
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
                        available_quantity = available_quantity + ?,
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

// ===========================================
// REFUND REQUEST FUNCTIONS
// ===========================================

// Get all refund requests (Admin/Staff only)
exports.getRefundRequests = async (req, res) => {
    try {
        console.log('=== GET REFUND REQUESTS ===');
        
        // Check if user is admin/staff
        if (req.user.role !== 'admin' && req.user.role !== 'staff') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }
        
        const connection = await mysql.createConnection(dbConfig);
        
        // Query to get refund requests - simplified with better fallbacks
        const [refundRequests] = await connection.execute(`
            SELECT 
                rr.*,
                o.status as order_status,
                COALESCE(oi.product_name, CONCAT('Product from Order #', CAST(rr.order_id AS CHAR))) as product_name,
                COALESCE(oi.product_price, rr.amount) as price,
                COALESCE(oi.quantity, 1) as quantity,
                COALESCE(oi.size, 'N/A') as size,
                COALESCE(oi.color, 'N/A') as color,
                COALESCE(pi.image_filename, 'default-product.png') as product_image,
                COALESCE(oi.customer_phone, rr.customer_phone, 'N/A') as phone_number,
                COALESCE(oi.street_address, 'N/A') as street_address,
                COALESCE(oi.city_municipality, 'N/A') as city_municipality,
                COALESCE(oi.province, 'N/A') as province
            FROM refund_requests rr
            LEFT JOIN orders o ON rr.order_id = o.id
            LEFT JOIN order_items oi ON o.id = oi.order_id
            LEFT JOIN products p ON oi.product_id = p.product_id 
            LEFT JOIN product_images pi ON p.product_id = pi.product_id AND pi.is_thumbnail = 1
            ORDER BY rr.created_at DESC
        `);
        
        await connection.end();
        
        console.log(`Found ${refundRequests.length} refund requests`);
        
        res.json({
            success: true,
            data: refundRequests,
            count: refundRequests.length
        });
        
    } catch (error) {
        console.error('Error fetching refund requests:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch refund requests',
            error: error.message
        });
    }
};

// Create a refund request
exports.createRefundRequest = async (req, res) => {
    try {
        console.log('=== CREATE REFUND REQUEST ===');
        console.log('Request body:', req.body);
        
        const {
            order_id,
            order_number,
            amount,
            reason,
            bank_account_number,
            bank_name,
            account_holder_name,
            refund_method = 'bank_transfer'
        } = req.body;
        
        // Validate required fields
        if (!order_id || !order_number || !amount || !reason) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: order_id, order_number, amount, reason'
            });
        }
        
        const connection = await mysql.createConnection(dbConfig);
        
        // Check if order exists and belongs to user
        const [orders] = await connection.execute(`
            SELECT id, user_id, status, total_amount
            FROM orders 
            WHERE id = ? AND order_number = ?
        `, [order_id, order_number]);
        
        if (orders.length === 0) {
            await connection.end();
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }
        
        const order = orders[0];
        
        // Check if order belongs to user (unless admin)
        if (req.user.role !== 'admin' && order.user_id !== req.user.user_id) {
            await connection.end();
            return res.status(403).json({
                success: false,
                message: 'Access denied. You can only request refunds for your own orders.'
            });
        }
        
        // Check if refund request already exists for this order
        const [existingRequests] = await connection.execute(`
            SELECT id FROM refund_requests WHERE order_id = ?
        `, [order_id]);
        
        if (existingRequests.length > 0) {
            await connection.end();
            return res.status(400).json({
                success: false,
                message: 'A refund request already exists for this order'
            });
        }
        
        // Create refund request
        const [result] = await connection.execute(`
            INSERT INTO refund_requests (
                order_id, order_number, user_id, customer_name, customer_email,
                amount, reason, bank_account_number, bank_name, account_holder_name,
                refund_method, status, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())
        `, [
            order_id,
            order_number,
            req.user.user_id,
            `${req.user.first_name} ${req.user.last_name}`,
            req.user.email,
            amount,
            reason,
            bank_account_number || null,
            bank_name || null,
            account_holder_name || null,
            refund_method
        ]);
        
        await connection.end();
        
        console.log(`✅ Refund request created with ID ${result.insertId}`);
        
        res.json({
            success: true,
            message: 'Refund request submitted successfully',
            data: {
                refund_request_id: result.insertId,
                order_number,
                amount,
                status: 'pending'
            }
        });
        
    } catch (error) {
        console.error('Error creating refund request:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create refund request',
            error: error.message
        });
    }
};

// Process refund request (Admin/Staff only)
exports.processRefundRequest = async (req, res) => {
    try {
        console.log('=== PROCESS REFUND REQUEST ===');
        
        const requestId = req.params.id;
        const { status, admin_notes, refund_reference } = req.body;
        
        // Check if user is admin/staff
        if (req.user.role !== 'admin' && req.user.role !== 'staff') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }
        
        // Validate status
        if (!['approved', 'rejected', 'processed'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Must be approved, rejected, or processed.'
            });
        }
        
        const connection = await mysql.createConnection(dbConfig);
        
        // Check if refund request exists
        const [requests] = await connection.execute(`
            SELECT * FROM refund_requests WHERE id = ?
        `, [requestId]);
        
        if (requests.length === 0) {
            await connection.end();
            return res.status(404).json({
                success: false,
                message: 'Refund request not found'
            });
        }
        
        const request = requests[0];
        
        // Update refund request
        const updateData = [status, admin_notes || null, req.user.user_id, requestId];
        let updateQuery = `
            UPDATE refund_requests 
            SET status = ?, admin_notes = ?, processed_by = ?, processed_at = NOW(), updated_at = NOW()
        `;
        
        // Add refund reference if provided and status is processed
        if (status === 'processed' && refund_reference) {
            updateQuery += `, refund_reference = ?, refund_date = NOW()`;
            updateData.splice(-1, 0, refund_reference);
        }
        
        updateQuery += ` WHERE id = ?`;
        
        await connection.execute(updateQuery, updateData);
        
        await connection.end();
        
        console.log(`✅ Refund request ${requestId} ${status} by admin ${req.user.email}`);
        
        res.json({
            success: true,
            message: `Refund request ${status} successfully`,
            data: {
                refund_request_id: requestId,
                order_number: request.order_number,
                status,
                processed_by: req.user.email,
                processed_at: new Date().toISOString()
            }
        });
        
    } catch (error) {
        console.error('Error processing refund request:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process refund request',
            error: error.message
        });
    }
};

// Mark order as received by customer
exports.markOrderReceived = async (req, res) => {
    try {
        const { id: orderId } = req.params;
        const userId = req.user.id;
        
        const connection = await mysql.createConnection(dbConfig);
        
        // First, verify the order belongs to the user and is delivered
        const [orderCheck] = await connection.execute(
            'SELECT * FROM orders WHERE id = ? AND user_id = ? AND (status = "delivered" OR delivery_status = "delivered")',
            [orderId, userId]
        );
        
        if (orderCheck.length === 0) {
            await connection.end();
            return res.status(404).json({
                success: false,
                message: 'Order not found or not eligible for received confirmation'
            });
        }
        
        // Update order status to "Order Received"
        await connection.execute(
            'UPDATE orders SET status = "Order Received", delivery_status = "Order Received", received_at = CURRENT_TIMESTAMP WHERE id = ?',
            [orderId]
        );
        
        await connection.end();
        
        res.json({
            success: true,
            message: 'Order marked as received successfully'
        });
        
    } catch (error) {
        console.error('Error marking order as received:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark order as received'
        });
    }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const orderId = req.params.id;
        const { status, delivery_status, notes } = req.body;
        const userRole = req.user.role;
        
        // Only admin/staff can update order status
        if (userRole !== 'admin' && userRole !== 'staff') {
            await connection.end();
            return res.status(403).json({
                success: false,
                message: 'Access denied. Only admin/staff can update order status.'
            });
        }
        
        // Check if order exists
        const [orders] = await connection.execute(
            'SELECT id, status, delivery_status FROM orders WHERE id = ?',
            [orderId]
        );
        
        if (orders.length === 0) {
            await connection.end();
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }
        
        // Build update query
        let updateFields = [];
        let updateValues = [];
        
        if (status) {
            updateFields.push('status = ?');
            updateValues.push(status);
        }
        
        if (delivery_status) {
            updateFields.push('delivery_status = ?');
            updateValues.push(delivery_status);
        }
        
        if (notes) {
            updateFields.push('admin_notes = ?');
            updateValues.push(notes);
        }
        
        if (updateFields.length === 0) {
            await connection.end();
            return res.status(400).json({
                success: false,
                message: 'No valid fields to update'
            });
        }
        
        updateFields.push('updated_at = CURRENT_TIMESTAMP');
        updateValues.push(orderId);
        
        await connection.execute(`
            UPDATE orders 
            SET ${updateFields.join(', ')}
            WHERE id = ?
        `, updateValues);
        
        await connection.end();
        
        res.json({
            success: true,
            message: 'Order status updated successfully'
        });
        
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update order status'
        });
    }
};

// Get specific order by ID
exports.getOrder = async (req, res) => {
    try {
        const orderId = req.params.id;
        const connection = await mysql.createConnection(dbConfig);
        
        // Get order with user details
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
            WHERE o.id = ?
        `, [orderId]);
        
        if (orders.length === 0) {
            await connection.end();
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }
        
        const order = orders[0];
        
        // Check if user can access this order
        if (req.user.role !== 'admin' && req.user.role !== 'staff' && order.user_id !== req.user.id) {
            await connection.end();
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }
        
        await connection.end();
        
        res.json({
            success: true,
            data: order
        });
        
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch order'
        });
    }
};

// Get order items for specific order
exports.getOrderItems = async (req, res) => {
    try {
        const orderId = req.params.id;
        const connection = await mysql.createConnection(dbConfig);
        
        // First check if order exists and user has access
        const [orders] = await connection.execute(`
            SELECT id, user_id FROM orders WHERE id = ?
        `, [orderId]);
        
        if (orders.length === 0) {
            await connection.end();
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }
        
        const order = orders[0];
        
        // Check if user can access this order
        if (req.user.role !== 'admin' && req.user.role !== 'staff' && order.user_id !== req.user.id) {
            await connection.end();
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }
        
        // Get order items with product details
        const [items] = await connection.execute(`
            SELECT 
                oi.*,
                p.productname,
                p.productcolor,
                p.product_type,
                p.productimage,
                p.productprice as product_original_price
            FROM order_items oi
            LEFT JOIN products p ON oi.product_id = p.product_id
            WHERE oi.order_id = ?
            ORDER BY oi.sort_order, oi.id
        `, [orderId]);
        
        await connection.end();
        
        res.json({
            success: true,
            data: items
        });
        
    } catch (error) {
        console.error('Error fetching order items:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch order items'
        });
    }
};

// Create cancellation request
exports.createCancellationRequest = async (req, res) => {
    try {
        const { order_id, order_number, reason } = req.body;
        
        if (!order_id || !reason) {
            return res.status(400).json({
                success: false,
                message: 'Order ID and reason are required'
            });
        }
        
        const connection = await mysql.createConnection(dbConfig);
        
        // Check if order exists and belongs to user
        const [orders] = await connection.execute(`
            SELECT id, user_id, status FROM orders WHERE id = ?
        `, [order_id]);
        
        if (orders.length === 0) {
            await connection.end();
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }
        
        const order = orders[0];
        
        // Check if user owns the order (unless admin)
        if (req.user.role !== 'admin' && order.user_id !== req.user.id) {
            await connection.end();
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }
        
        // Check if order can be cancelled
        if (order.status === 'delivered' || order.status === 'cancelled') {
            await connection.end();
            return res.status(400).json({
                success: false,
                message: 'Cannot cancel order that is already delivered or cancelled'
            });
        }
        
        // Check if cancellation request already exists
        const [existing] = await connection.execute(`
            SELECT id FROM cancellation_requests WHERE order_id = ? AND status = 'pending'
        `, [order_id]);
        
        if (existing.length > 0) {
            await connection.end();
            return res.status(400).json({
                success: false,
                message: 'A cancellation request for this order is already pending'
            });
        }
        
        // Create cancellation request
        await connection.execute(`
            INSERT INTO cancellation_requests (order_id, order_number, user_id, reason, status, created_at)
            VALUES (?, ?, ?, ?, 'pending', NOW())
        `, [order_id, order_number || '', req.user.id, reason]);
        
        await connection.end();
        
        res.json({
            success: true,
            message: 'Cancellation request submitted successfully'
        });
        
    } catch (error) {
        console.error('Error creating cancellation request:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create cancellation request'
        });
    }
};

// Process cancellation request (admin only)
exports.processCancellationRequest = async (req, res) => {
    try {
        const requestId = req.params.id;
        const { action, admin_notes } = req.body;
        
        // Check if user is admin
        if (req.user.role !== 'admin' && req.user.role !== 'staff') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }
        
        if (!action || !['approve', 'reject'].includes(action)) {
            return res.status(400).json({
                success: false,
                message: 'Action must be either "approve" or "reject"'
            });
        }
        
        const connection = await mysql.createConnection(dbConfig);
        
        // Get cancellation request details
        const [requests] = await connection.execute(`
            SELECT cr.*, o.status as order_status
            FROM cancellation_requests cr
            JOIN orders o ON cr.order_id = o.id
            WHERE cr.id = ?
        `, [requestId]);
        
        if (requests.length === 0) {
            await connection.end();
            return res.status(404).json({
                success: false,
                message: 'Cancellation request not found'
            });
        }
        
        const request = requests[0];
        
        if (request.status !== 'pending') {
            await connection.end();
            return res.status(400).json({
                success: false,
                message: 'Cancellation request has already been processed'
            });
        }
        
        // Update cancellation request
        await connection.execute(`
            UPDATE cancellation_requests 
            SET status = ?, admin_notes = ?, processed_at = NOW(), processed_by = ?
            WHERE id = ?
        `, [action === 'approve' ? 'approved' : 'rejected', admin_notes || '', req.user.id, requestId]);
        
        // If approved, cancel the order
        if (action === 'approve') {
            await connection.execute(`
                UPDATE orders SET status = 'cancelled', updated_at = NOW() WHERE id = ?
            `, [request.order_id]);
        }
        
        await connection.end();
        
        res.json({
            success: true,
            message: `Cancellation request ${action}d successfully`
        });
        
    } catch (error) {
        console.error('Error processing cancellation request:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process cancellation request'
        });
    }
};

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

// Get all cancellation requests for admin
exports.getCancellationRequests = async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        
        const [requests] = await connection.execute(`
            SELECT 
                cr.*,
                -- Prioritize order_number from cancellation_requests table, fallback to orders table
                COALESCE(cr.order_number, o.order_number) as order_number,
                -- Handle amount for both regular and custom orders
                CASE 
                    WHEN cr.order_number LIKE 'CUSTOM-%' THEN
                        COALESCE(
                            (SELECT COALESCE(co.final_price, co.estimated_price, 0) 
                             FROM custom_orders co 
                             WHERE co.custom_order_id = cr.order_number),
                            0
                        )
                    ELSE
                        COALESCE(o.total_amount, 0)
                END as total_amount,
                u.first_name,
                u.last_name,
                u.email as customer_email,
                CONCAT(u.first_name, ' ', u.last_name) as user_name,
                oi.customer_name,
                oi.customer_email as invoice_customer_email,
                -- Handle both regular orders and custom orders for product images
                CASE 
                    -- Check if this is a custom order by pattern
                    WHEN cr.order_number LIKE 'CUSTOM-%' THEN
                        COALESCE(
                            -- Try to get custom order image first
                            (SELECT 
                                CASE 
                                    WHEN coi.image_filename IS NOT NULL THEN 
                                        CONCAT('custom-orders/', coi.image_filename)
                                    ELSE NULL
                                END
                             FROM custom_order_images coi
                             WHERE coi.custom_order_id = cr.order_number
                             ORDER BY coi.upload_order ASC, coi.created_at ASC
                             LIMIT 1),
                            -- Fallback: check if custom order exists and return null for proper frontend handling
                            (SELECT 
                                CASE 
                                    WHEN co.custom_order_id IS NOT NULL THEN NULL
                                    ELSE NULL
                                END
                             FROM custom_orders co 
                             WHERE co.custom_order_id = cr.order_number
                             LIMIT 1),
                            -- Default fallback for custom orders without images
                            NULL
                        )
                    ELSE
                        -- Handle regular orders
                        COALESCE(
                            -- Try to get image from regular order items
                            (SELECT CASE 
                                WHEN pi.image_filename IS NOT NULL THEN 
                                    CASE 
                                        WHEN pi.image_filename LIKE '%.%' THEN pi.image_filename
                                        ELSE CONCAT(pi.image_filename, '.jpg')
                                    END
                                WHEN p.productimage IS NOT NULL THEN p.productimage
                                ELSE NULL
                             END
                             FROM order_items oit2 
                             LEFT JOIN products p ON oit2.product_id = p.product_id
                             LEFT JOIN product_images pi ON p.product_id = pi.product_id AND pi.is_thumbnail = 1
                             WHERE oit2.order_id = o.id 
                             LIMIT 1),
                            -- Default fallback for regular orders
                            'default-product.png'
                        )
                END as product_image,
                -- Add order type indicator for frontend
                CASE 
                    WHEN cr.order_number LIKE 'CUSTOM-%' THEN 'custom'
                    ELSE 'regular'
                END as order_type,
                -- Add custom order details for better admin review
                CASE 
                    WHEN cr.order_number LIKE 'CUSTOM-%' THEN
                        (SELECT CONCAT(
                            COALESCE(co.product_type, 'Unknown'), ' - ',
                            COALESCE(co.product_name, 'Custom Design'), ' (',
                            COALESCE(co.size, 'N/A'), ', ',
                            COALESCE(co.color, 'N/A'), ')'
                        ) FROM custom_orders co WHERE co.custom_order_id = cr.order_number)
                    ELSE
                        (SELECT CONCAT(p.productname, ' (', oi.size, ')')
                         FROM order_items oi
                         LEFT JOIN products p ON oi.product_id = p.product_id
                         WHERE oi.order_id = o.id
                         LIMIT 1)
                END as product_details
            FROM cancellation_requests cr
            LEFT JOIN orders o ON cr.order_id = o.id
            LEFT JOIN users u ON o.user_id = u.user_id
            LEFT JOIN order_invoices oi ON o.invoice_id = oi.invoice_id
            ORDER BY cr.created_at DESC
        `);
        
        await connection.end();
        
        res.json({
            success: true,
            data: requests
        });
        
    } catch (error) {
        console.error('Error fetching cancellation requests:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch cancellation requests'
        });
    }
};

// Get all rejected payments for admin
exports.getRejectedPayments = async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        
        // Get both regular orders and custom orders with rejected payment status
        const [rejectedPayments] = await connection.execute(`
            SELECT 
                'regular' as order_type,
                o.id,
                o.order_number,
                o.total_amount,
                u.first_name,
                u.last_name,
                u.email as customer_email,
                CONCAT(u.first_name, ' ', u.last_name) as customer_name,
                o.order_date as created_at,
                'rejected' as payment_status,
                st.payment_method,
                st.gcash_reference_number,
                st.payment_proof_image,
                'Payment was rejected by admin' as rejection_reason
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.user_id
            LEFT JOIN sales_transactions st ON o.transaction_id = st.transaction_id
            WHERE st.transaction_status = 'rejected'
            
            UNION ALL
            
            SELECT 
                'custom' as order_type,
                co.id,
                co.custom_order_id as order_number,
                COALESCE(co.final_price, co.estimated_price, 0) as total_amount,
                u.first_name,
                u.last_name,
                u.email as customer_email,
                co.customer_name,
                co.created_at,
                'rejected' as payment_status,
                co.payment_method,
                co.gcash_reference_number,
                co.payment_proof_image,
                'Payment was rejected by admin' as rejection_reason
            FROM custom_orders co
            LEFT JOIN users u ON co.user_id = u.user_id
            WHERE co.payment_status = 'rejected'
            
            ORDER BY created_at DESC
        `);
        
        await connection.end();
        
        res.json({
            success: true,
            data: rejectedPayments
        });
        
    } catch (error) {
        console.error('Error fetching rejected payments:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch rejected payments'
        });
    }
};

// Get all orders for admin with pagination and filtering
exports.getAllOrders = async (req, res) => {
    let connection;
    try {
        console.log('=== GET ALL ORDERS DEBUG ===');
        console.log('User:', req.user?.id, req.user?.role);
        console.log('Query params:', req.query);
        
        // Only allow admin/staff to view all orders
        if (!['admin', 'staff'].includes(req.user.role)) {
            return res.status(403).json({ 
                success: false, 
                message: 'Access denied - Admin/staff only' 
            });
        }
        
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Database connection created');
        
        const { status, page = 1, limit = 10, search } = req.query;
        const offset = (page - 1) * limit;
        
        let whereConditions = [];
        let queryParams = [];
        
        // Add status filter
        if (status && status !== 'all') {
            whereConditions.push('o.status = ?');
            queryParams.push(status);
        }
        
        // Add search filter
        if (search) {
            whereConditions.push(`(
                o.order_number LIKE ? OR 
                u.email LIKE ? OR 
                CONCAT(u.first_name, ' ', u.last_name) LIKE ?
            )`);
            const searchTerm = `%${search}%`;
            queryParams.push(searchTerm, searchTerm, searchTerm);
        }
        
        // Build WHERE clause
        const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
        
        // Get orders with user details
        let mainQuery = `
            SELECT 
                o.id,
                o.order_number,
                o.user_id,
                o.status,
                o.total_amount,
                o.order_date,
                o.shipping_address,
                o.contact_phone,
                o.created_at,
                o.updated_at,
                CONCAT(u.first_name, ' ', u.last_name) as customer_name,
                u.email as customer_email,
                u.first_name,
                u.last_name
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.user_id
            ${whereClause}
            ORDER BY o.created_at DESC
            LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`;
            
        const [orders] = await connection.execute(mainQuery, queryParams);
        
        // Get total count for pagination
        let countQuery = `
            SELECT COUNT(*) as total
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.user_id
            ${whereClause}`;
            
        const [countResult] = await connection.execute(countQuery, queryParams);
        const total = countResult[0].total;
        
        await connection.end();
        
        res.json({
            success: true,
            data: {
                orders,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    totalItems: total,
                    itemsPerPage: parseInt(limit)
                }
            }
        });
        
    } catch (error) {
        console.error('❌ Error fetching orders:', error);
        
        if (connection) {
            try {
                await connection.end();
            } catch (closeError) {
                console.error('❌ Error closing connection:', closeError.message);
            }
        }
        
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch orders' 
        });
    }
};
