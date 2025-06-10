const express = require('express');
const router = express.Router();
const cartController = require('../../controllers/cartController');
const { authenticateUser } = require('../../middleware/auth'); 
console.log('cartController.getCart:', typeof cartController.getCart);
console.log('authenticateUser:', typeof authenticateUser);


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

router.get('/test', (req, res) => res.send('Cart test route working!'));

router.get('/cart', authenticateUser, cartController.getCart);



module.exports = router;