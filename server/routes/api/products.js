const express = require('express');
const router = express.Router();
const productController = require('../../controllers/productController');
const { authenticateUser, authorizeAdmin } = require('../../middleware/auth');

// @route   GET api/products
// @desc    Get all products with optional filtering
// @access  Public
router.get('/', productController.getProducts);

// @route   GET api/products/:id
// @desc    Get a single product by ID
// @access  Public
router.get('/:id', productController.getProductById);

// @route   POST api/products
// @desc    Create a new product (admin only)
// @access  Private/Admin
router.post('/', authenticateUser, authorizeAdmin, productController.createProduct);

// @route   PUT api/products/:id
// @desc    Update a product (admin only)
// @access  Private/Admin
router.put('/:id', authenticateUser, authorizeAdmin, productController.updateProduct);

// @route   DELETE api/products/:id
// @desc    Delete a product (admin only)
// @access  Private/Admin
router.delete('/:id', authenticateUser, authorizeAdmin, productController.deleteProduct);

module.exports = router;