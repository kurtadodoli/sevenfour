const mysql = require('mysql2/promise');
const { dbConfig } = require('../config/db');

// Generate unique IDs
const generateId = (prefix) => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `${prefix}${timestamp}${random}`;
};

// Enhanced order creation with proper user isolation
exports.createOrderFromCart = async (req, res) => {
    try {
        console.log('=== ENHANCED CREATE ORDER FROM CART ===');
        console.log('User ID:', req.user.id);
        console.log('User Email:', req.user.email);
        
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
        
        // Start transaction for data consistency
        await connection.beginTransaction();
        
        try {
            // 1. Get user's specific cart
            const [carts] = await connection.execute(
                'SELECT id FROM carts WHERE user_id = ?',
                [req.user.id]
            );
            
            if (carts.length === 0) {
                throw new Error('Cart not found for user');
            }
            
            const cartId = carts[0].id;
            console.log('Using cart ID:', cartId, 'for user:', req.user.id);
            
            // 2. Get cart items with proper user isolation check
            const [cartItems] = await connection.execute(`
                SELECT 
                    ci.*, 
                    p.productname, 
                    p.productprice,
                    p.productcolor,
                    p.product_type
                FROM cart_items ci
                JOIN products p ON ci.product_id = p.product_id
                JOIN carts c ON ci.cart_id = c.id
                WHERE ci.cart_id = ? AND c.user_id = ?
            `, [cartId, req.user.id]);
            
            console.log(`Found ${cartItems.length} items in user ${req.user.id}'s cart`);
            
            if (cartItems.length === 0) {
                throw new Error('Cart is empty');
            }
            
            // 3. Calculate total
            const totalAmount = cartItems.reduce((sum, item) => 
                sum + (item.productprice * item.quantity), 0
            );
            
            console.log('Total amount:', totalAmount);
            
            // 4. Generate unique IDs
            const invoiceId = generateId('INV');
            const transactionId = generateId('TXN');
            const orderNumber = generateId('ORD');
            
            console.log('Generated IDs:', { invoiceId, transactionId, orderNumber });
            
            // 5. Create invoice record
            await connection.execute(`
                INSERT INTO order_invoices (
                    invoice_id, user_id, total_amount, customer_name, 
                    customer_email, customer_phone, delivery_address, notes,
                    invoice_status, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW(), NOW())
            `, [
                invoiceId, req.user.id, totalAmount, customer_name || req.user.username,
                customer_email || req.user.email, contact_phone, shipping_address, notes
            ]);
            
            // 6. Create transaction record
            await connection.execute(`
                INSERT INTO sales_transactions (
                    transaction_id, invoice_id, user_id, amount, payment_method,
                    transaction_status, created_at, updated_at
                ) VALUES (?, ?, ?, ?, 'cash_on_delivery', 'pending', NOW(), NOW())
            `, [transactionId, invoiceId, req.user.id, totalAmount]);
            
            // 7. Create main order record
            await connection.execute(`
                INSERT INTO orders (
                    order_number, user_id, invoice_id, transaction_id, 
                    total_amount, shipping_address, contact_phone, notes,
                    status, order_date, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW(), NOW(), NOW())
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
            
            // 8. Create detailed order items for each cart item
            for (const item of cartItems) {
                await connection.execute(`
                    INSERT INTO order_items (
                        invoice_id, product_id, product_name, product_price,
                        quantity, color, size, subtotal, created_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
                `, [
                    invoiceId, item.product_id, item.productname, item.productprice,
                    item.quantity, item.color || 'N/A', item.size || 'N/A',
                    item.productprice * item.quantity
                ]);
                
                console.log(`Added order item: ${item.productname} x${item.quantity}`);
            }
            
            // 9. CRITICAL: Clear only THIS user's cart items
            await connection.execute(
                'DELETE FROM cart_items WHERE cart_id = ?', 
                [cartId]
            );
            
            console.log(`Cleared cart items for user ${req.user.id}, cart ${cartId}`);
            
            // 10. Commit transaction
            await connection.commit();
            await connection.end();
            
            console.log('=== ORDER CREATION SUCCESSFUL ===');
            
            res.json({
                success: true,
                message: 'Order created successfully',
                data: {
                    orderId,
                    orderNumber,
                    invoiceId,
                    transactionId,
                    totalAmount,
                    itemCount: cartItems.length
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

// Enhanced get user orders with proper isolation
exports.getUserOrders = async (req, res) => {
    try {
        console.log('=== GET USER ORDERS (ENHANCED) ===');
        console.log('User ID:', req.user.id);
        
        const connection = await mysql.createConnection(dbConfig);
        
        // Get orders with proper user isolation
        const [orders] = await connection.execute(`
            SELECT 
                o.*,
                oi.total_amount as invoice_total,
                oi.invoice_status,
                st.transaction_status,
                st.payment_method,
                (SELECT COUNT(*) FROM order_items WHERE invoice_id = o.invoice_id) as item_count
            FROM orders o
            LEFT JOIN order_invoices oi ON o.invoice_id = oi.invoice_id
            LEFT JOIN sales_transactions st ON o.transaction_id = st.transaction_id
            WHERE o.user_id = ?
            ORDER BY o.order_date DESC
        `, [req.user.id]);
        
        console.log(`Found ${orders.length} orders for user ID ${req.user.id}`);
        
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

// Enhanced get order items with user verification
exports.getOrderItems = async (req, res) => {
    try {
        const orderId = req.params.id;
        console.log('=== GET ORDER ITEMS (ENHANCED) ===');
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
        
        // Get order items with product details
        const [orderItems] = await connection.execute(`
            SELECT 
                oi.*,
                p.productname,
                p.productdescription,
                p.productcolor,
                p.product_type,
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

module.exports = exports;
