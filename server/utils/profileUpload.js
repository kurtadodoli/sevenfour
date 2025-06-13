const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Create uploads directory if it doesn't exist
const createUploadDir = async () => {
    const uploadDir = path.join(__dirname, '..', 'public', 'uploads', 'profiles');
    try {
        await fs.mkdir(uploadDir, { recursive: true });
    } catch (error) {
        console.error('Error creating upload directory:', error);
    }
};

// Initialize upload directory
createUploadDir();

// Configure multer for memory storage (we'll process the file before saving)
const storage = multer.memoryStorage();

// File filter for profile pictures
const fileFilter = (req, file, cb) => {
    // Check file type
    const allowedMimeTypes = [
        'image/jpeg',
        'image/jpg', 
        'image/png',
        'image/gif',
        'image/webp'
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
        const error = new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.');
        error.statusCode = 400;
        return cb(error, false);
    }

    // Check file extension
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    
    if (!allowedExtensions.includes(ext)) {
        const error = new Error('Invalid file extension.');
        error.statusCode = 400;
        return cb(error, false);
    }

    cb(null, true);
};

// Configure multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
        fieldSize: 5 * 1024 * 1024
    }
});

module.exports = upload;
