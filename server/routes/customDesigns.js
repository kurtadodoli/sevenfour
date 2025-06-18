const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const adminCheck = require('../middleware/adminCheck');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../uploads/custom-designs');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `design-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

const { 
    submitCustomDesign,
    getUserCustomDesigns,
    getAllCustomDesigns,
    approveCustomDesign,
    rejectCustomDesign,
    createOrderFromDesign,
    getCustomOrder
} = require('../controllers/customDesignController');

// Customer routes
router.post('/submit', auth, upload.fields([
    { name: 'conceptImage', maxCount: 1 },
    { name: 'referenceImage1', maxCount: 1 },
    { name: 'referenceImage2', maxCount: 1 },
    { name: 'referenceImage3', maxCount: 1 }
]), submitCustomDesign);

router.get('/user', auth, getUserCustomDesigns);
router.post('/order/:designId', auth, createOrderFromDesign);
router.get('/order/:orderNumber', auth, getCustomOrder);

// Admin routes
router.get('/admin/all', auth, adminCheck, getAllCustomDesigns);
router.put('/admin/:designId/approve', auth, adminCheck, approveCustomDesign);
router.put('/admin/:designId/reject', auth, adminCheck, rejectCustomDesign);

module.exports = router;
