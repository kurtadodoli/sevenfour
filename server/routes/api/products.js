const express = require('express');
const router = express.Router();
const upload = require('../../middleware/upload-memory');
const productController = require('../../controllers/productController');
const { auth } = require('../../middleware/auth');
const adminCheck = require('../../middleware/adminCheck');

// Public routes
router.get('/', productController.getActiveProducts);
router.get('/archived', productController.getArchivedProducts);
router.get('/categories', productController.getProductCategories);

// Protected routes (admin only)
router.use(auth);

// Admin-only routes - add adminCheck middleware
router.get('/admin/all', adminCheck, productController.getAllProducts);
router.get('/admin/inventory', adminCheck, productController.getInventoryOverview);

// This route must come after more specific routes
router.get('/:id', productController.getProduct);
router.post('/', adminCheck, productController.createProduct);
router.put('/:id', adminCheck, productController.updateProduct);
router.delete('/:id', adminCheck, productController.deleteProduct);

// Image management
router.post('/:id/images', adminCheck, upload.single('image'), productController.uploadProductImage);
router.put('/:id/stock', adminCheck, productController.updateProductStock);

// Product archiving and audit
router.post('/:id/restore', adminCheck, productController.restoreProduct);
router.get('/:id/audit-log', adminCheck, productController.getProductAuditLog);

module.exports = router;