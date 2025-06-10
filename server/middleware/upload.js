const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

// File type validation
const allowedMimeTypes = new Set([
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp'
]);

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../public/uploads/'));
    },
    filename: function (req, file, cb) {
        // Generate a secure random filename
        crypto.randomBytes(16, (err, raw) => {
            if (err) {
                cb(err, null);
                return;
            }
            const extension = path.extname(file.originalname).toLowerCase();
            const filename = raw.toString('hex') + extension;
            cb(null, filename);
        });
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    // Check file type
    if (!allowedMimeTypes.has(file.mimetype)) {
        req.fileValidationError = 'Invalid file type. Only images are allowed.';
        return cb(new Error('Invalid file type. Only images are allowed.'), false);
    }

    // Check file extension
    const ext = path.extname(file.originalname).toLowerCase();
    if (!['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) {
        req.fileValidationError = 'Invalid file extension. Only .jpg, .jpeg, .png, .gif, and .webp are allowed.';
        return cb(new Error('Invalid file extension'), false);
    }

    // File is valid
    cb(null, true);
};

// Error handling middleware
const handleUploadError = (error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ 
                message: 'File too large. Maximum size is 5MB.'
            });
        }
        return res.status(400).json({ message: error.message });
    }
    next(error);
};

// Configure multer
const upload = multer({
    storage: storage,
    limits: {
        fileSize: process.env.MAX_FILE_SIZE || 5 * 1024 * 1024, // Use env var or default to 5MB
        files: 10 // Maximum 10 files per upload
    },
    fileFilter: fileFilter
});

module.exports = {
    upload,
    handleUploadError,
    singleUpload: upload.single('image'),
    multipleUpload: upload.array('images', 10)
};
