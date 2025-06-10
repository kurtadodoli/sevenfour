const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middleware/auth');
const profileController = require('../../controllers/profileController');
const upload = require('../../utils/upload');

// Using configured upload middleware from utils/upload.js

// Get user profile
router.get('/profile', authMiddleware.authenticateUser, profileController.getProfile);

// Update user profile
router.put('/profile', authMiddleware.authenticateUser, profileController.updateProfile);

// Update user preferences
router.put('/profile/preferences', authMiddleware.authenticateUser, profileController.updatePreferences);

// Change password
router.post('/profile/change-password', authMiddleware.authenticateUser, profileController.changePassword);

// Upload profile picture
router.post('/profile/picture', 
    authMiddleware.authenticateUser,
    upload.single('profile_picture'),
    profileController.uploadProfilePicture
);

module.exports = router;
