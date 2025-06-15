const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { auth } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Create middleware to check if user is admin
const adminCheck = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: 'Access denied. Admin privileges required.'
  });
};

// Public routes - accessible without authentication
router.get('/', productController.getActiveProducts);
router.get('/categories', productController.getProductCategories);

// Admin-only routes - require authentication and admin role
router.get('/admin/all', [auth, adminCheck], productController.getAllProducts);
router.post('/', [auth, adminCheck], productController.createProduct);
router.put('/:id', [auth, adminCheck], productController.updateProduct);
router.delete('/:id', [auth, adminCheck], productController.deleteProduct);
router.post('/:id/restore', [auth, adminCheck], productController.restoreProduct);
router.post('/:id/images', [auth, adminCheck, upload.single('image')], productController.uploadProductImage);
router.put('/:id/stock', [auth, adminCheck], productController.updateProductStock);
router.get('/:id/audit-log', [auth, adminCheck], productController.getProductAuditLog);

// Public route for individual product (must be after specific routes to avoid conflicts)
router.get('/:id', productController.getProduct);

module.exports = router;