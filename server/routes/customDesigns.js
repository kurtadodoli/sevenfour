const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { auth, adminAuth } = require('../middleware/auth');
const customDesignController = require('../controllers/customDesignController');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads/designs');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        // Create unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'design-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
        files: 10 // Maximum 10 files
    }
});

// Customer routes
router.post('/', auth, upload.array('designImages', 10), customDesignController.submitCustomDesign);
router.get('/my-designs', auth, customDesignController.getUserCustomDesigns);

// Admin routes
router.get('/admin/all', adminAuth, customDesignController.getAllCustomDesigns);
router.put('/admin/:designId/status', adminAuth, customDesignController.updateDesignStatus);
router.get('/admin/:designId', adminAuth, customDesignController.getDesignById);

// Serve design images
router.get('/images/:filename', (req, res) => {
    const filename = req.params.filename;
    const filepath = path.join(uploadsDir, filename);
    
    // Check if file exists
    if (fs.existsSync(filepath)) {
        res.sendFile(filepath);
    } else {
        res.status(404).json({ message: 'Image not found' });
    }
});

module.exports = router;
