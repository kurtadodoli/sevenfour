// Enhanced Delivery Routes for DeliveryPage.js
const express = require('express');
const router = express.Router();
const DeliveryController = require('../controllers/deliveryControllerEnhanced');
const { auth, adminAuth } = require('../middleware/auth');

// =============================================
// CALENDAR ROUTES
// =============================================

// @route   GET /delivery/calendar
// @desc    Get calendar data for specific month with delivery schedules
// @access  Public (temporarily for testing - remove auth later)
router.get('/calendar', DeliveryController.getCalendarData);

// @route   PUT /delivery/calendar/:date
// @desc    Update calendar day availability and settings
// @access  Private/Admin
router.put('/calendar/:date', auth, DeliveryController.updateCalendarDay);

// =============================================
// ORDER MANAGEMENT ROUTES
// =============================================

// @route   GET /delivery/orders
// @desc    Get all orders available for delivery scheduling
// @access  Public (temporarily for testing - remove auth later)
router.get('/orders', DeliveryController.getOrdersForDelivery);

// @route   GET /delivery/orders-test
// @desc    Test endpoint to get all orders for delivery scheduling (no auth)
// @access  Public (for testing)
router.get('/orders-test', DeliveryController.getOrdersForDelivery);

// =============================================
// DELIVERY SCHEDULING ROUTES
// =============================================

// @route   POST /delivery/schedule
// @desc    Schedule a delivery for an order
// @access  Public (temporarily for testing - remove auth later)
router.post('/schedule', DeliveryController.scheduleDelivery);

// @route   PUT /delivery/schedule/:id/status
// @desc    Update delivery status (delivered, in_transit, delayed, etc.)
// @access  Private/Admin
router.put('/schedule/:id/status', auth, DeliveryController.updateDeliveryStatus);

// @route   PUT /delivery/orders/:orderId/remove-from-delivery
// @desc    Remove order from delivery management (doesn't delete order)
// @access  Public (temporarily for testing - remove auth later)
router.put('/orders/:orderId/remove-from-delivery', DeliveryController.removeOrderFromDelivery);

// =============================================
// LEGACY COMPATIBILITY ROUTES
// =============================================

// Maintain compatibility with existing delivery routes
// Note: Legacy routes will be handled by the main delivery.js file

module.exports = router;
