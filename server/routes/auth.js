const express = require('express');
const router = express.Router();
const { auth, adminAuth } = require('../middleware/auth');
const userController = require('../controllers/userController');
const profileController = require('../controllers/profileControllerWorking');
const profileUpload = require('../utils/profileUpload');

// @route   POST /api/auth/register
// @desc    Register a new user
router.post('/register', userController.register);

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
router.post('/login', userController.login);

// @route   GET /api/auth/verify
// @desc    Verify token and get user data
router.get('/verify', auth, (req, res) => {
    res.json({
        success: true,
        data: {
            user: req.user
        }
    });
});

// @route   GET /api/auth/health-check
// @desc    Check API health (no auth required)
router.get('/health-check', (req, res) => {
    res.json({
        success: true,
        message: 'API is healthy',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// @route   GET /api/auth/profile
// @desc    Get user profile
router.get('/profile', auth, userController.getProfile);

// @route   PUT /api/auth/profile
// @desc    Update user profile
router.put('/profile', auth, userController.updateProfile);

// @route   PUT /api/auth/change-password
// @desc    Change user password
router.put('/change-password', auth, userController.changePassword);

// @route   POST /api/auth/forgot-password
// @desc    Send OTP for password reset
router.post('/forgot-password', userController.forgotPassword);

// @route   POST /api/auth/resend-otp
// @desc    Resend OTP for password reset
router.post('/resend-otp', userController.resendOTP);

// @route   POST /api/auth/reset-password
// @desc    Reset password with OTP verification
router.post('/reset-password', userController.resetPassword);

// @route   POST /api/auth/verify-otp
// @desc    Verify OTP without marking as used
router.post('/verify-otp', userController.verifyOTP);

// @route   POST /api/auth/upload-profile-picture
// @desc    Upload profile picture
router.post('/upload-profile-picture', auth, profileUpload.single('profilePicture'), profileController.uploadProfilePicture);

// Admin routes
// @route   GET /api/auth/admin/users
// @desc    Get all users (admin only)
router.get('/admin/users', adminAuth, userController.getAllUsers);

// @route   PUT /api/auth/admin/users/:userId/status
// @desc    Toggle user active status (admin only)
router.put('/admin/users/:userId/status', adminAuth, userController.toggleUserStatus);

module.exports = router;
