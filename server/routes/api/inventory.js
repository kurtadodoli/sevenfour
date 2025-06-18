const express = require('express');
const router = express.Router();
const inventoryController = require('../../controllers/inventoryController');
const { auth } = require('../../middleware/auth');

// @route   GET api/inventory/overview
// @desc    Get inventory overview with stock levels
// @access  Private (Staff/Admin)
router.get('/overview', auth, inventoryController.getInventoryOverview);

// @route   GET api/inventory/overview-test
// @desc    Get inventory overview with stock levels (NO AUTH for testing)
// @access  Public (for testing only)
router.get('/overview-test', inventoryController.getInventoryOverview);

// @route   GET api/inventory/critical
// @desc    Get critical stock items
// @access  Private (Staff/Admin)
router.get('/critical', auth, inventoryController.getCriticalStock);

// @route   GET api/inventory/low-stock
// @desc    Get low stock items
// @access  Private (Staff/Admin)
router.get('/low-stock', auth, inventoryController.getLowStock);

// @route   GET api/inventory/stats
// @desc    Get inventory statistics
// @access  Private (Staff/Admin)
router.get('/stats', auth, inventoryController.getInventoryStats);

// @route   PUT api/inventory/settings
// @desc    Update inventory settings for a product
// @access  Private (Admin only)
router.put('/settings', auth, inventoryController.updateInventorySettings);

module.exports = router;