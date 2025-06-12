const express = require('express');
const router = express.Router();
const orderController = require('../../controllers/orderController');
const { auth, adminAuth } = require('../../middleware/auth');

// @route   POST api/orders
// @desc    Create a new order
// @access  Private (any authenticated user)
router.post('/', auth, orderController.createOrder);

// @route   GET api/orders/me
// @desc    Get all orders for the current user
// @access  Private
router.get('/me', auth, orderController.getMyOrders);

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

module.exports = router;