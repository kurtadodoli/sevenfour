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
        const connection = await mysql.createConnection(dbConfig);
        
        // Get products with their variants
        const [products] = await connection.execute(`
            SELECT 
                p.*,
                GROUP_CONCAT(
                    DISTINCT CONCAT(
                        '{"variant_id":', pv.variant_id, 
                        ',"size":"', pv.size, 
                        '","color":"', pv.color,
                        '","stock":', pv.stock_quantity, '}'
                    ) SEPARATOR ','
                ) as variants,
                GROUP_CONCAT(DISTINCT pi.image_filename ORDER BY pi.image_order) as images
            FROM products p
            LEFT JOIN product_variants pv ON p.product_id = pv.product_id
            LEFT JOIN product_images pi ON p.product_id = pi.product_id
            WHERE p.is_archived = FALSE
            GROUP BY p.product_id
            ORDER BY p.created_at DESC
        `);
        
        // Process the products to format the data properly
        const processedProducts = products.map(product => {            // Parse variants
            let sizeColorVariants = [];
            if (product.variants) {
                try {
                    // Fix JSON format - add brackets around the comma-separated objects
                    const variantJson = '[' + product.variants + ']';
                    const variants = JSON.parse(variantJson);
                    
                    // Group by size
                    const sizeGroups = {};
                    variants.forEach(variant => {
                        if (!sizeGroups[variant.size]) {
                            sizeGroups[variant.size] = {
                                size: variant.size,
                                colorStocks: []
                            };
                        }
                        sizeGroups[variant.size].colorStocks.push({
                            color: variant.color,
                            stock: parseInt(variant.stock) || 0
                        });
                    });
                    
                    sizeColorVariants = Object.values(sizeGroups);                } catch (e) {
                    console.error('Error parsing variants for product', product.product_id, ':', e.message);
                    console.error('Raw variant data:', product.variants);
                    console.error('Attempted JSON:', '[' + product.variants + ']');
                    sizeColorVariants = [];
                }
            }
            
            // Calculate total stock
            const total_stock = sizeColorVariants.reduce((total, sizeVariant) => {
                return total + sizeVariant.colorStocks.reduce((sizeTotal, colorStock) => {
                    return sizeTotal + (parseInt(colorStock.stock) || 0);
                }, 0);
            }, 0);
              // Parse images - handle both single productimage and images array
            let imageArray = [];
            if (product.images) {
                imageArray = product.images.split(',').filter(img => img && img.trim());
            } else if (product.productimage) {
                imageArray = [product.productimage];
            }
            
            return {
                ...product,
                sizeColorVariants,
                total_stock,
                images: imageArray,
                // Keep legacy fields for backward compatibility
                productname: product.name,
                productdescription: product.description,
                productprice: product.price,
                productcolor: sizeColorVariants.length > 0 ? sizeColorVariants[0].colorStocks[0]?.color || '' : '',
                productquantity: total_stock,
                productstatus: product.status
            };
        });
        
        await connection.end();
        res.json(processedProducts);
        
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
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
