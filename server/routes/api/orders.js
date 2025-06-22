const express = require('express');
const router = express.Router();
const orderController = require('../../controllers/orderController');
const { auth, adminAuth } = require('../../middleware/auth');
const mysql = require('mysql2/promise');
const { dbConfig } = require('../../config/db');

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

module.exports = router;