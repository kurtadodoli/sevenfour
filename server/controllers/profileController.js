const bcrypt = require('bcrypt');
const { query } = require('../config/db');
const path = require('path');
const fs = require('fs').promises;
const sharp = require('sharp');
const crypto = require('crypto');

// Get user profile
exports.getProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        const users = await query(
            'SELECT user_id, first_name, last_name, email, gender, profile_picture_url, birthday, role, created_at, last_login FROM users WHERE user_id = ?',
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const user = users[0];

        res.json({
            success: true,
            data: {
                user: {
                    id: user.user_id,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    email: user.email,
                    gender: user.gender,
                    profile_picture_url: user.profile_picture_url,
                    birthday: user.birthday,
                    role: user.role,
                    created_at: user.created_at,
                    last_login: user.last_login
                }
            }
        });

    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error retrieving profile'
        });
    }
};

// Update user profile
exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { first_name, last_name, gender, birthday } = req.body;

        await query(
            'UPDATE users SET first_name = ?, last_name = ?, gender = ?, birthday = ? WHERE user_id = ?',
            [first_name, last_name, gender, birthday, userId]
        );

        res.json({
            success: true,
            message: 'Profile updated successfully'
        });

    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error updating profile'
        });
    }
};

// Update user preferences
exports.updatePreferences = async (req, res) => {
    try {
        const userId = req.user.id;
        const { preferences } = req.body;

        // For now, just send success - preferences can be added to database later
        res.json({
            success: true,
            message: 'Preferences updated successfully'
        });

    } catch (error) {
        console.error('Update preferences error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error updating preferences'
        });
    }
};

// Change password
exports.changePassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;

        // Get current password hash
        const users = await query(
            'SELECT password FROM users WHERE user_id = ?',
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Verify current password
        const isValidPassword = await bcrypt.compare(currentPassword, users[0].password);
        if (!isValidPassword) {
            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Hash new password
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        // Update password
        await query(
            'UPDATE users SET password = ? WHERE user_id = ?',
            [hashedPassword, userId]
        );

        res.json({
            success: true,
            message: 'Password changed successfully'
        });

    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error changing password'
        });
    }
};

// Upload profile picture
exports.uploadProfilePicture = async (req, res) => {
    try {
        const userId = req.user.id;

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        // Generate unique filename
        const fileExtension = path.extname(req.file.originalname);
        const fileName = `profile_${userId}_${Date.now()}${fileExtension}`;
        const filePath = path.join(__dirname, '../public/uploads/profile-pictures', fileName);

        // Ensure directory exists
        const uploadDir = path.dirname(filePath);
        await fs.mkdir(uploadDir, { recursive: true });

        // Process and save image
        await sharp(req.file.buffer)
            .resize(200, 200)
            .jpeg({ quality: 80 })
            .toFile(filePath);

        // Update database
        const profilePictureUrl = `/uploads/profile-pictures/${fileName}`;
        await query(
            'UPDATE users SET profile_picture_url = ? WHERE user_id = ?',
            [profilePictureUrl, userId]
        );

        res.json({
            success: true,
            message: 'Profile picture uploaded successfully',
            data: {
                profile_picture_url: profilePictureUrl
            }
        });

    } catch (error) {
        console.error('Upload profile picture error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error uploading profile picture'
        });
    }
};
