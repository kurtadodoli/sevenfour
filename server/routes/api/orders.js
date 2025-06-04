const express = require('express');
const router = express.Router();
const orderController = require('../../controllers/orderController');
const { authenticateUser, authorizeStaff } = require('../../middleware/auth');

// @route   POST api/orders
// @desc    Create a new order
// @access  Private (any authenticated user)
router.post('/', authenticateUser, orderController.createOrder);

// @route   GET api/orders/me
// @desc    Get all orders for the current user
// @access  Private
router.get('/me', authenticateUser, orderController.getMyOrders);

// @route   GET api/orders/:id
// @desc    Get a specific order (customer can only see their own)
// @access  Private (customer for their own orders, staff/admin for any)
router.get('/:id', authenticateUser, orderController.getOrder);

// @route   GET api/orders
// @desc    Get all orders (with filtering)
// @access  Private/Staff/Admin
router.get('/', authenticateUser, authorizeStaff, orderController.getAllOrders);

// @route   PUT api/orders/:id/status
// @desc    Update order status
// @access  Private/Staff/Admin
router.put('/:id/status', authenticateUser, authorizeStaff, orderController.updateOrderStatus);

module.exports = router;