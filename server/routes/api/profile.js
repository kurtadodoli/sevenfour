const express = require('express');
const router = express.Router();
const { auth } = require('../../middleware/auth');
const profileController = require('../../controllers/profileController');
const upload = require('../../utils/upload');

// Using configured upload middleware from utils/upload.js

// Get user profile
router.get('/profile', auth, profileController.getProfile);

// Update user profile
router.put('/profile', auth, profileController.updateProfile);

// Update user preferences
router.put('/profile/preferences', auth, profileController.updatePreferences);

// Change password
router.post('/profile/change-password', auth, profileController.changePassword);

// Upload profile picture
router.post('/profile/picture', 
    auth,
    upload.single('profile_picture'),
    profileController.uploadProfilePicture
);

module.exports = router;
