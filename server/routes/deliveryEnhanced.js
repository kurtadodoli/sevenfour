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
// @access  Private/Admin
router.get('/calendar', auth, DeliveryController.getCalendarData);

// @route   PUT /delivery/calendar/:date
// @desc    Update calendar day availability and settings
// @access  Private/Admin
router.put('/calendar/:date', auth, DeliveryController.updateCalendarDay);

// =============================================
// ORDER MANAGEMENT ROUTES
// =============================================

// @route   GET /delivery/orders
// @desc    Get all orders available for delivery scheduling
// @access  Private/Admin
router.get('/orders', auth, DeliveryController.getOrdersForDelivery);

// =============================================
// DELIVERY SCHEDULING ROUTES
// =============================================

// @route   POST /delivery/schedule
// @desc    Schedule a delivery for an order
// @access  Private/Admin
router.post('/schedule', auth, DeliveryController.scheduleDelivery);

// @route   PUT /delivery/schedule/:id/status
// @desc    Update delivery status (delivered, in_transit, delayed, etc.)
// @access  Private/Admin
router.put('/schedule/:id/status', auth, DeliveryController.updateDeliveryStatus);

// =============================================
// LEGACY COMPATIBILITY ROUTES
// =============================================

// Maintain compatibility with existing delivery routes
// Note: Legacy routes will be handled by the main delivery.js file

module.exports = router;
