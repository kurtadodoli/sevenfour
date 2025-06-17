const express = require('express');
const router = express.Router();
const orderController = require('../../controllers/orderController');
const { auth, adminAuth } = require('../../middleware/auth');

// @route   POST api/orders
// @desc    Create a new order from cart
// @access  Private (any authenticated user)
router.post('/', auth, orderController.createOrderFromCart);

// @route   GET api/orders/me
// @desc    Get all orders for the current user
// @access  Private
router.get('/me', auth, orderController.getUserOrders);

// @route   GET api/orders/:id
// @desc    Get a specific order (customer can only see their own)
// @access  Private (customer for their own orders, staff/admin for any)
router.get('/:id', auth, orderController.getOrder);

// @route   GET api/orders
// @desc    Get all orders (with filtering)
// @access  Private/Staff/Admin
router.get('/', auth, orderController.getAllOrders);

// @route   PUT api/orders/:id/status
// @desc    Update order status
// @access  Private/Staff/Admin
router.put('/:id/status', auth, orderController.updateOrderStatus);

// @route   POST api/orders/:id/confirm
// @desc    Confirm order (update status to confirmed)
// @access  Private
router.post('/:id/confirm', auth, orderController.confirmOrder);

// @route   GET api/orders/invoice/:invoiceId/pdf
// @desc    Generate and download invoice PDF
// @access  Private
router.get('/invoice/:invoiceId/pdf', auth, orderController.generateInvoicePDF);

module.exports = router;