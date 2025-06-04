const express = require('express');
const router = express.Router();
const inventoryController = require('../../controllers/inventoryController');
const { authenticateUser, authorizeAdmin, authorizeStaff } = require('../../middleware/auth');

// @route   GET api/inventory
// @desc    Get all inventory with product info (staff or admin)
// @access  Private/Staff/Admin
router.get('/', authenticateUser, authorizeStaff, inventoryController.getInventory);

// @route   GET api/inventory/low-stock
// @desc    Get low stock items (staff or admin)
// @access  Private/Staff/Admin
router.get('/low-stock', authenticateUser, authorizeStaff, inventoryController.getLowStock);

// @route   PUT api/inventory/quantity
// @desc    Update inventory quantity (staff or admin)
// @access  Private/Staff/Admin
router.put('/quantity', authenticateUser, authorizeStaff, inventoryController.updateInventory);

// @route   PUT api/inventory/critical-level
// @desc    Update critical level threshold (admin only)
// @access  Private/Admin
router.put('/critical-level', authenticateUser, authorizeAdmin, inventoryController.updateCriticalLevel);

module.exports = router;