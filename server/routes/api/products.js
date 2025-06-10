const express = require('express');
const router = express.Router();
const { upload, processImages, handleUploadErrors } = require('../../middleware/uploadMiddleware');
const productController = require('../../controllers/productController');
const auth = require('../../middleware/auth');

// Public routes
router.get('/active', productController.getActiveProducts);
router.get('/archived', productController.getArchivedProducts);
router.get('/:id', productController.getProduct);
router.get('/:id/delivery-schedule', productController.getDeliverySchedule);

// Protected routes (admin only)
router.use(auth);

// Product management
router.post('/', upload.array('images', 10), processImages, productController.createProduct);
router.put('/:id', upload.array('images', 10), processImages, productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

// Image management
router.post('/:id/images', upload.array('images', 10), processImages, productController.uploadImages);
router.delete('/:id/images/:imageId', productController.removeImage);
router.put('/:id/images/reorder', productController.reorderImages);

// Product archiving
router.post('/:id/archive', productController.archiveProduct);
router.post('/:id/restore', productController.restoreProduct);

// Delivery schedule
router.put('/:id/delivery-schedule', productController.updateDeliverySchedule);

// Backup and restore
router.get('/backup', productController.backupProducts);
router.post('/restore', upload.single('backup'), productController.restoreFromBackup);

// Error handling
router.use(handleUploadErrors);

module.exports = router;