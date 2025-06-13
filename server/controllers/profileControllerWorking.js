const { query } = require('../config/db');
const path = require('path');
const fs = require('fs').promises;
const sharp = require('sharp');
const crypto = require('crypto');

// Upload profile picture
exports.uploadProfilePicture = async (req, res) => {    try {
        const userId = req.user.id;

        console.log('Upload request received for user:', userId);
        console.log('File info:', req.file ? {
            fieldname: req.file.fieldname,
            originalname: req.file.originalname,
            encoding: req.file.encoding,
            mimetype: req.file.mimetype,
            size: req.file.size,
            hasBuffer: !!req.file.buffer,
            bufferLength: req.file.buffer ? req.file.buffer.length : 0
        } : 'No file');

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }        const file = req.file;

        if (!file.mimetype.startsWith('image/')) {
            return res.status(400).json({
                success: false,
                message: 'Only image files are allowed'
            });
        }

        if (file.size > 5 * 1024 * 1024) {
            return res.status(400).json({
                success: false,
                message: 'File size must be less than 5MB'
            });
        }

        const fileName = `profile_${userId}_${crypto.randomUUID()}.jpg`;
        const outputPath = path.join(__dirname, '../public/uploads/profiles', fileName);

        await sharp(file.buffer)
            .resize(400, 400, {
                fit: 'cover',
                position: 'center'
            })
            .jpeg({
                quality: 85,
                progressive: true
            })
            .toFile(outputPath);

        const currentUser = await query(
            'SELECT profile_picture_url FROM users WHERE user_id = ?',
            [userId]
        );

        const profilePictureUrl = `/uploads/profiles/${fileName}`;        await query(
            'UPDATE users SET profile_picture_url = ? WHERE user_id = ?',
            [profilePictureUrl, userId]
        );

        if (currentUser.length > 0 && currentUser[0].profile_picture_url) {
            const oldFilePath = path.join(__dirname, '../public', currentUser[0].profile_picture_url);
            await fs.unlink(oldFilePath).catch(() => {});
        }

        res.json({
            success: true,
            message: 'Profile picture uploaded successfully',
            data: {
                profile_picture_url: profilePictureUrl
            }
        });    } catch (error) {
        console.error('Upload profile picture error:', error);

        res.status(500).json({
            success: false,
            message: 'Internal server error uploading profile picture'
        });
    }
};
