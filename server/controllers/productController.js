const Product = require('../models/Product');
const fs = require('fs').promises;
const path = require('path');
const { promisify } = require('util');
const { query, pool } = require('../config/db');

// Helper to ensure directories exist
const ensureDirectoryExists = async (dir) => {
  try {
    await fs.access(dir);
  } catch (error) {
    await fs.mkdir(dir, { recursive: true });
  }
};

// Get all active products
exports.getActiveProducts = async (req, res) => {
  try {
    console.log('getActiveProducts called');
    
    // Return hardcoded products for immediate testing
    const dummyProducts = [
      {
        product_id: 1,
        name: 'Classic T-Shirt',
        description: 'A comfortable classic cotton t-shirt',
        price: 29.99,
        category: 'T-Shirts',
        brand: 'Seven Four',
        status: 'active',
        stock_status: 'in_stock',
        is_featured: true,
        is_archived: false,
        colors: ['Black', 'White', 'Red'],
        sizes: ['S', 'M', 'L', 'XL']
      },
      {
        product_id: 2,
        name: 'Basketball Shorts',
        description: 'Lightweight basketball shorts',
        price: 34.99,
        category: 'Shorts',
        brand: 'Seven Four',
        status: 'active',
        stock_status: 'in_stock',
        is_featured: false,
        is_archived: false,
        colors: ['Black', 'Blue'],
        sizes: ['M', 'L', 'XL']
      }
    ];
    
    return res.json({ 
      success: true, 
      products: dummyProducts 
    });
  } catch (error) {
    console.error('Error fetching active products:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message 
    });
  }
};

// Get all products (including archived) - for admin
exports.getAllProducts = async (req, res) => {
  try {
    console.log('getAllProducts - Admin endpoint called');
    
    // Verify admin role
    console.log('User requesting products:', req.user);
    
    const products = await Product.getAll(true); // true to include archived products
    console.log('Products fetched:', products.length);
    
    return res.status(200).json({
      success: true,
      message: 'All products retrieved successfully',
      data: products
    });
  } catch (error) {
    console.error('Error fetching all products:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message 
    });
  }
};

// Get all archived products
exports.getArchivedProducts = async (req, res) => {
  try {
    // Use the dedicated method for fetching archived products
    const archivedProducts = await Product.getArchived();
    
    return res.status(200).json({
      success: true,
      message: 'Archived products retrieved successfully',
      data: archivedProducts
    });
  } catch (error) {
    console.error('Error fetching archived products:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message 
    });
  }
};

// Get a single product by ID
exports.getProduct = async (req, res) => {
  const { id } = req.params;

  try {
    // Use the Product model to get product by ID
    const product = await Product.getById(id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Product retrieved successfully',
      data: product
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Create a new product
exports.createProduct = async (req, res) => {
  try {
    const productData = req.body;
    const userId = req.user ? req.user.id : null;

    // Validate required fields
    if (!productData.name || !productData.price || !productData.category) {
      return res.status(400).json({
        success: false,
        message: 'Name, price, and category are required fields'
      });
    }

    const product = await Product.create(productData, userId);

    // Handle sizes if provided
    if (productData.sizes && Array.isArray(productData.sizes) && productData.sizes.length > 0) {
      await Product.updateProductSizes(product.product_id, productData.sizes);
    }

    // Handle colors if provided
    if (productData.colors && Array.isArray(productData.colors) && productData.colors.length > 0) {
      await Product.updateProductColors(product.product_id, productData.colors);
    }

    return res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (error) {
    console.error('Error creating product:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create product',
      error: error.message
    });
  }
};

// Update an existing product
exports.updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const productData = req.body;
    const userId = req.user ? req.user.id : null;

    // Check if product exists
    const existingProduct = await Product.getById(productId);
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Update the product
    const updatedProduct = await Product.update(productId, productData, userId);

    // Handle sizes if provided
    if (productData.sizes && Array.isArray(productData.sizes)) {
      await Product.updateProductSizes(productId, productData.sizes);
    }

    // Handle colors if provided
    if (productData.colors && Array.isArray(productData.colors)) {
      await Product.updateProductColors(productId, productData.colors);
    }

    return res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: updatedProduct
    });
  } catch (error) {
    console.error('Error updating product:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update product',
      error: error.message
    });
  }
};

// Delete a product (soft delete)
exports.deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const userId = req.user ? req.user.id : null;

    // Check if product exists
    const existingProduct = await Product.getById(productId);
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Soft delete the product
    await Product.delete(productId, userId);

    return res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete product',
      error: error.message
    });
  }
};

// Restore a deleted product
exports.restoreProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const userId = req.user ? req.user.id : null;

    await Product.restore(productId, userId);

    return res.status(200).json({
      success: true,
      message: 'Product restored successfully'
    });
  } catch (error) {
    console.error('Error restoring product:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to restore product',
      error: error.message
    });
  }
};

// Upload product image
exports.uploadProductImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    const productId = req.params.id;
    const userId = req.user ? req.user.id : null;
    
    // Check if product exists
    const existingProduct = await Product.getById(productId);
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Process and save the image
    const uploadsDir = path.join(__dirname, '../uploads/products', productId);
    await ensureDirectoryExists(uploadsDir);

    // Generate a unique filename
    const timestamp = Date.now();
    const filename = `${timestamp}-${req.file.originalname}`;
    const filepath = path.join(uploadsDir, filename);

    // Write the file
    await fs.writeFile(filepath, req.file.buffer);

    // Save image URL to database
    const isPrimary = req.body.isPrimary === 'true';
    const displayOrder = parseInt(req.body.displayOrder) || 0;
    const imageUrl = `/uploads/products/${productId}/${filename}`;
    
    const image = await Product.addImage(productId, imageUrl, isPrimary, displayOrder);

    return res.status(201).json({
      success: true,
      message: 'Product image uploaded successfully',
      data: image
    });
  } catch (error) {
    console.error('Error uploading product image:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to upload product image',
      error: error.message
    });
  }
};

// Update product stock
exports.updateProductStock = async (req, res) => {
  try {
    const productId = req.params.id;
    const { stockStatus } = req.body;
    const userId = req.user ? req.user.id : null;

    if (!['in_stock', 'low_stock', 'out_of_stock'].includes(stockStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid stock status. Must be one of: in_stock, low_stock, out_of_stock'
      });
    }

    const result = await Product.updateStock(productId, stockStatus, userId);

    return res.status(200).json({
      success: true,
      message: 'Product stock updated successfully',
      data: result
    });
  } catch (error) {
    console.error('Error updating product stock:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update product stock',
      error: error.message
    });
  }
};

// Get product audit log
exports.getProductAuditLog = async (req, res) => {
  try {
    const productId = req.params.id;
    
    // Check if product exists
    const existingProduct = await Product.getById(productId);
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const logs = await Product.getAuditLog(productId);

    return res.status(200).json({
      success: true,
      message: 'Product audit log retrieved successfully',
      data: logs
    });
  } catch (error) {
    console.error('Error getting product audit log:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve product audit log',
      error: error.message
    });
  }
};

// Get all product categories
exports.getProductCategories = async (req, res) => {
  try {
    const categories = await Product.getAllCategories();

    return res.status(200).json({
      success: true,
      message: 'Product categories retrieved successfully',
      data: categories
    });
  } catch (error) {
    console.error('Error getting product categories:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve product categories',
      error: error.message
    });
  }
};