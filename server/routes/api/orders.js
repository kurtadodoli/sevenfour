const express = require('express');
const router = express.Router();
const orderController = require('../../controllers/orderController');
const { auth, adminAuth } = require('../../middleware/auth');

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

module.exports = router;