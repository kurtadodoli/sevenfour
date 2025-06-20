const express = require('express');
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const router = express.Router();
const { dbConfig } = require('../config/db');

// Configure multer for multiple file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../../uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
        fieldSize: 25 * 1024 * 1024, // 25MB field size limit
        fields: 20 // Maximum number of non-file fields
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

// Test route
router.get('/test', (req, res) => {
    res.json({ message: 'Enhanced Maintenance API is working', timestamp: new Date().toISOString() });
});

// GET all products with size-color variants
router.get('/products', async (req, res) => {
    try {
        console.log('📡 Enhanced maintenance API: Getting products...');
        const connection = await mysql.createConnection(dbConfig);        // Get all products (including archived products)
        // First, let's try to get products from the existing table structure
        console.log('📊 Executing query...');
        const [products] = await connection.execute(`
            SELECT * FROM products 
            ORDER BY 
                CASE WHEN productstatus = 'archived' THEN 1 ELSE 0 END,
                id DESC
        `);
        
        console.log('📦 Raw products received:', products.length);
        if (products.length > 0) {
            console.log('📋 Sample product:', products[0]);
        }
          // Process the products to add enhanced functionality while maintaining compatibility
        const processedProducts = products.map(product => {
            // Create basic size-color variants from existing data
            let sizeColorVariants = [];
            
            // Parse sizes and colors from existing fields
            if (product.sizes && product.productcolor) {
                try {
                    // Parse sizes (could be JSON array or comma-separated)
                    let sizesArray = [];
                    if (product.sizes.startsWith('[')) {
                        sizesArray = JSON.parse(product.sizes);
                    } else {
                        sizesArray = product.sizes.split(',').map(s => s.trim());
                    }
                    
                    // Parse colors (could be JSON array or comma-separated)
                    let colorsArray = [];
                    if (product.productcolor.startsWith('[')) {
                        colorsArray = JSON.parse(product.productcolor);
                    } else {
                        colorsArray = product.productcolor.split(',').map(c => c.trim());
                    }
                    
                    // Create size-color variants
                    sizesArray.forEach(size => {
                        const colorStocks = colorsArray.map(color => ({
                            color: color,
                            stock: Math.floor((product.total_stock || 0) / (sizesArray.length * colorsArray.length))
                        }));
                        
                        sizeColorVariants.push({
                            size: size,
                            colorStocks: colorStocks
                        });
                    });
                } catch (e) {
                    console.log('Creating default size-color variant for product', product.product_id);
                    // Create a default variant if parsing fails
                    sizeColorVariants = [{
                        size: 'One Size',
                        colorStocks: [{
                            color: product.productcolor || 'Default',
                            stock: product.total_stock || 0
                        }]
                    }];
                }
            } else {
                // Create a default variant
                sizeColorVariants = [{
                    size: 'One Size', 
                    colorStocks: [{
                        color: product.productcolor || 'Default',
                        stock: product.total_stock || 0
                    }]
                }];
            }
            
            // Handle images - parse from productimage field
            let imageArray = [];
            if (product.productimage) {
                // If productimage contains multiple images (comma-separated)
                if (product.productimage.includes(',')) {
                    imageArray = product.productimage.split(',').map(img => img.trim()).filter(img => img);
                } else {
                    imageArray = [product.productimage];
                }
            }
            
            // Add additional images if they exist
            ['image1', 'image2', 'image3', 'image4', 'image5', 'image6'].forEach(imgField => {
                if (product[imgField]) {
                    imageArray.push(product[imgField]);
                }
            });
            
            return {
                ...product,
                sizeColorVariants,
                images: imageArray,
                // Map status fields for consistency
                status: product.productstatus || 'active',
                is_archived: product.productstatus === 'archived'
            };        });
        
        console.log('✅ Processed products:', processedProducts.length);
        await connection.end();
        res.json(processedProducts);
        
    } catch (error) {
        console.error('❌ Error fetching products:', error);
        res.status(500).json({ error: 'Failed to fetch products', details: error.message });
    }
});

// POST new product with size-color variants
router.post('/products', upload.array('images', 10), async (req, res) => {
    try {
        console.log('📦 Creating new product with size-color variants');
        console.log('Request body:', req.body);
        
        const {
            productname,
            productdescription,
            productprice,
            product_type,
            sizeColorVariants
        } = req.body;
        
        if (!productname || !productprice) {
            return res.status(400).json({ error: 'Missing required fields: productname, productprice' });
        }
        
        // Parse sizeColorVariants if it's a string
        let parsedVariants;
        try {
            parsedVariants = typeof sizeColorVariants === 'string' ? JSON.parse(sizeColorVariants) : sizeColorVariants;
        } catch (error) {
            console.error('Error parsing sizeColorVariants:', error);
            return res.status(400).json({ error: 'Invalid sizeColorVariants format' });
        }
        
        const connection = await mysql.createConnection(dbConfig);
        await connection.beginTransaction();
        
        try {            // Insert product using existing column names
            const productId = Math.floor(100000000000 + Math.random() * 899999999999);
            const [productResult] = await connection.execute(`
                INSERT INTO products (
                    product_id, productname, productdescription, productprice, 
                    product_type, productstatus, created_at, total_stock,
                    name, description, price, category, status
                )
                VALUES (?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?, ?, ?, ?)
            `, [
                productId, 
                productname, 
                productdescription || '', 
                parseFloat(productprice),
                product_type || 'jackets', 
                'active',
                // Calculate total stock from variants
                parsedVariants ? parsedVariants.reduce((total, sizeVariant) => {
                    return total + (sizeVariant.colorStocks || []).reduce((sizeTotal, colorStock) => {
                        return sizeTotal + (parseInt(colorStock.stock) || 0);
                    }, 0);
                }, 0) : 0,
                // Also populate new standardized columns
                productname,
                productdescription || '',
                parseFloat(productprice),
                product_type || 'jackets',
                'active'
            ]);
            
            // Insert size-color variants
            if (parsedVariants && Array.isArray(parsedVariants)) {
                for (const sizeVariant of parsedVariants) {
                    if (sizeVariant.colorStocks && Array.isArray(sizeVariant.colorStocks)) {
                        for (const colorStock of sizeVariant.colorStocks) {
                            if (colorStock.color && colorStock.color.trim() !== '') {
                                await connection.execute(`
                                    INSERT INTO product_variants (product_id, size, color, stock_quantity)
                                    VALUES (?, ?, ?, ?)
                                `, [productId, sizeVariant.size, colorStock.color, parseInt(colorStock.stock) || 0]);
                            }
                        }
                    }
                }
            }
              // Handle image uploads
            if (req.files && req.files.length > 0) {
                for (let i = 0; i < req.files.length; i++) {
                    const file = req.files[i];
                    await connection.execute(`
                        INSERT INTO product_images (product_id, image_filename, image_order, is_thumbnail)
                        VALUES (?, ?, ?, ?)
                    `, [productId, file.filename, i, i === 0]);
                }
                
                // Update the main productimage field with the first image
                const firstImage = req.files[0].filename;
                await connection.execute(`
                    UPDATE products SET productimage = ? WHERE product_id = ?
                `, [firstImage, productId]);
            }
            
            await connection.commit();
            await connection.end();
            
            console.log('✅ Product created successfully with ID:', productId);
            res.json({ 
                success: true, 
                message: 'Product created successfully',
                productId: productId
            });
            
        } catch (error) {
            await connection.rollback();
            await connection.end();
            throw error;
        }
        
    } catch (error) {
        console.error('❌ Error creating product:', error);
        res.status(500).json({ 
            error: 'Failed to create product',
            details: error.message 
        });
    }
});

// PUT update product with size-color variants
router.put('/products/:id', upload.array('images', 10), async (req, res) => {
    try {
        const productId = req.params.id;
        console.log('📝 Updating product:', productId);
        
        const {
            productname,
            productdescription,
            productprice,
            product_type,
            sizeColorVariants
        } = req.body;
        
        // Parse sizeColorVariants if it's a string
        let parsedVariants;
        try {
            parsedVariants = typeof sizeColorVariants === 'string' ? JSON.parse(sizeColorVariants) : sizeColorVariants;
        } catch (error) {
            console.error('Error parsing sizeColorVariants:', error);
            return res.status(400).json({ error: 'Invalid sizeColorVariants format' });
        }
        
        const connection = await mysql.createConnection(dbConfig);
        await connection.beginTransaction();
        
        try {            // Update product basic info using existing column names
            const totalStock = parsedVariants ? parsedVariants.reduce((total, sizeVariant) => {
                return total + (sizeVariant.colorStocks || []).reduce((sizeTotal, colorStock) => {
                    return sizeTotal + (parseInt(colorStock.stock) || 0);
                }, 0);
            }, 0) : 0;

            await connection.execute(`
                UPDATE products 
                SET productname = ?, productdescription = ?, productprice = ?, 
                    product_type = ?, total_stock = ?, updated_at = NOW(),
                    name = ?, description = ?, price = ?, category = ?
                WHERE product_id = ?
            `, [
                productname, 
                productdescription || '', 
                parseFloat(productprice), 
                product_type || 'jackets',
                totalStock,
                // Also update standardized columns
                productname,
                productdescription || '',
                parseFloat(productprice),
                product_type || 'jackets',
                productId
            ]);
            
            // Delete existing variants
            await connection.execute('DELETE FROM product_variants WHERE product_id = ?', [productId]);
            
            // Insert new variants
            if (parsedVariants && Array.isArray(parsedVariants)) {
                for (const sizeVariant of parsedVariants) {
                    if (sizeVariant.colorStocks && Array.isArray(sizeVariant.colorStocks)) {
                        for (const colorStock of sizeVariant.colorStocks) {
                            if (colorStock.color && colorStock.color.trim() !== '') {
                                await connection.execute(`
                                    INSERT INTO product_variants (product_id, size, color, stock_quantity)
                                    VALUES (?, ?, ?, ?)
                                `, [productId, sizeVariant.size, colorStock.color, parseInt(colorStock.stock) || 0]);
                            }
                        }
                    }
                }
            }
              // Handle new image uploads
            if (req.files && req.files.length > 0) {
                // Get current max image order
                const [maxOrder] = await connection.execute(
                    'SELECT COALESCE(MAX(image_order), -1) as max_order FROM product_images WHERE product_id = ?', 
                    [productId]
                );
                let nextOrder = (maxOrder[0]?.max_order || -1) + 1;
                
                for (const file of req.files) {
                    await connection.execute(`
                        INSERT INTO product_images (product_id, image_filename, image_order, is_thumbnail)
                        VALUES (?, ?, ?, ?)
                    `, [productId, file.filename, nextOrder, false]);
                    nextOrder++;
                }
            }
            
            await connection.commit();
            await connection.end();
            
            console.log('✅ Product updated successfully');
            res.json({ success: true, message: 'Product updated successfully' });
            
        } catch (error) {
            await connection.rollback();
            await connection.end();
            throw error;
        }
        
    } catch (error) {
        console.error('❌ Error updating product:', error);
        res.status(500).json({ 
            error: 'Failed to update product',
            details: error.message 
        });
    }
});

// DELETE product image
router.delete('/images/:id', async (req, res) => {
    try {
        const imageId = req.params.id;
        const connection = await mysql.createConnection(dbConfig);
          // Get image info before deleting
        const [images] = await connection.execute(
            'SELECT * FROM product_images WHERE image_id = ?', 
            [imageId]
        );
        
        if (images.length === 0) {
            await connection.end();
            return res.status(404).json({ error: 'Image not found' });
        }
        
        const image = images[0];
        
        // Delete from database
        await connection.execute('DELETE FROM product_images WHERE image_id = ?', [imageId]);
        
        // Delete physical file
        const imagePath = path.join(__dirname, '../../uploads', image.image_filename);
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }
        
        await connection.end();
        res.json({ success: true, message: 'Image deleted successfully' });
        
    } catch (error) {
        console.error('Error deleting image:', error);
        res.status(500).json({ error: 'Failed to delete image' });
    }
});

// Archive product
router.post('/products/:id/archive', async (req, res) => {
    try {
        const productId = req.params.id;
        const connection = await mysql.createConnection(dbConfig);
        
        await connection.execute(
            'UPDATE products SET is_archived = TRUE, updated_at = NOW() WHERE product_id = ?',
            [productId]
        );
        
        await connection.end();
        res.json({ success: true, message: 'Product archived successfully' });
        
    } catch (error) {
        console.error('Error archiving product:', error);
        res.status(500).json({ error: 'Failed to archive product' });
    }
});

// Restore product
router.post('/products/:id/restore', async (req, res) => {
    try {
        const productId = req.params.id;
        const connection = await mysql.createConnection(dbConfig);
        
        await connection.execute(
            'UPDATE products SET is_archived = FALSE, updated_at = NOW() WHERE product_id = ?',
            [productId]
        );
        
        await connection.end();
        res.json({ success: true, message: 'Product restored successfully' });
        
    } catch (error) {
        console.error('Error restoring product:', error);
        res.status(500).json({ error: 'Failed to restore product' });
    }
});

// Delete product permanently
router.delete('/products/:id', async (req, res) => {
    try {
        const productId = req.params.id;
        const connection = await mysql.createConnection(dbConfig);
        
        await connection.beginTransaction();
        
        try {            // Get all images for this product
            const [images] = await connection.execute(
                'SELECT image_filename FROM product_images WHERE product_id = ?',
                [productId]
            );
            
            // Delete product (cascade will handle variants and images in DB)
            await connection.execute('DELETE FROM products WHERE product_id = ?', [productId]);
            
            // Delete physical image files
            for (const image of images) {
                const imagePath = path.join(__dirname, '../../uploads', image.image_filename);
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                }
            }
            
            await connection.commit();
            await connection.end();
            
            res.json({ success: true, message: 'Product deleted permanently' });
            
        } catch (error) {
            await connection.rollback();
            await connection.end();
            throw error;
        }
        
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ error: 'Failed to delete product' });
    }
});

module.exports = router;
