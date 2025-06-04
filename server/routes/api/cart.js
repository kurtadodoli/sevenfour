const express = require('express');
const router = express.Router();
const cartController = require('../../controllers/cartController');
const { authenticateUser } = require('../../middleware/auth');

// @route   GET api/cart
// @desc    Get the user's cart
// @access  Private
router.get('/', authenticateUser, cartController.getCart);

// @route   POST api/cart
// @desc    Add item to cart
// @access  Private
router.post('/', authenticateUser, cartController.addToCart);

// @route   PUT api/cart/item
// @desc    Update cart item quantity
// @access  Private
router.put('/item', authenticateUser, cartController.updateCartItem);

// @route   DELETE api/cart/item/:itemId
// @desc    Remove item from cart
// @access  Private
router.delete('/item/:itemId', authenticateUser, cartController.removeFromCart);

// @route   DELETE api/cart
// @desc    Clear cart
// @access  Private
router.delete('/', authenticateUser, cartController.clearCart);

module.exports = router;