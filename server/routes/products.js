const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const auth = require('../middleware/auth');
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
router.get('/:id', productController.getProduct);
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

module.exports = router;

        const newProduct = {
            id: nextId++,
            name,
            description,
            price: parseFloat(price),
            sizes: Array.isArray(sizes) ? sizes : sizes.split(',').map(s => s.trim()),
            stock: parseInt(stock)
        };

        products.push(newProduct);
        
        res.status(201).json({
            success: true,
            product: newProduct
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Failed to add product'
        });
    }
});

module.exports = router;

/*
In your MySQL database
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    sizes JSON,
    stock INT NOT NULL,
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
*/