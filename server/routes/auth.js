const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const userController = require('../controllers/userController');

// @route   POST /api/auth/register
// @desc    Register a new user
router.post('/register', userController.register);

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
router.post('/login', userController.login);

// @route   GET /api/auth/verify
// @desc    Verify token and get user data
router.get('/verify', auth, async (req, res) => {
    try {
        res.json({ user: req.user.toJSON() });
    } catch (error) {
        console.error('Verify error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/auth/profile
// @desc    Get user profile
router.get('/profile', auth, async (req, res) => {
    try {
        const user = await req.user;
        res.json({ user: user.toJSON() });
    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
