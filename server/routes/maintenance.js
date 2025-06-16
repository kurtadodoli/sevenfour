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
    res.json({ message: 'Maintenance API is working', timestamp: new Date().toISOString() });
});

// Update the archive product route
router.post('/products/:id/archive', async (req, res) => {
    try {
        const { id } = req.params;
        const connection = await mysql.createConnection(dbConfig);
        
        // Get product details first
        const [product] = await connection.execute(
            'SELECT product_id FROM products WHERE id = ?',
            [id]
        );
        
        if (product.length === 0) {
            await connection.end();
            return res.status(404).json({ error: 'Product not found' });
        }
        
        // Update product status to archived
        await connection.execute(
            'UPDATE products SET productstatus = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            ['archived', id]
        );
        
        // Add entry to archives table
        await connection.execute(
            'INSERT INTO product_archives (product_id, archived_by) VALUES (?, ?)',
            [product[0].product_id, 'admin']
        );
        
        await connection.end();
        res.json({ message: 'Product archived successfully' });
    } catch (error) {
        console.error('Error archiving product:', error);
        res.status(500).json({ error: 'Failed to archive product' });
    }
});

// Update the backup route
router.post('/backup', async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        
        // Get all products
        const [products] = await connection.execute('SELECT * FROM products');
        
        const backupData = {
            timestamp: new Date().toISOString(),
            products: products,
            total_products: products.length,
            backup_type: 'full'
        };
        
        // Create backup directory if it doesn't exist
        const backupDir = path.join(__dirname, '../../backups');
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }
        
        // Generate backup filename
        const filename = `products_backup_${Date.now()}.json`;
        const filepath = path.join(backupDir, filename);
        
        // Write backup file
        fs.writeFileSync(filepath, JSON.stringify(backupData, null, 2));
        
        // Record backup in database
        await connection.execute(
            'INSERT INTO data_backups (datatype, filelocation, backup_size, created_by) VALUES (?, ?, ?, ?)',
            ['products', filepath, Buffer.byteLength(JSON.stringify(backupData)), 'admin']
        );
        
        await connection.end();
        
        res.json({ 
            message: 'Backup created successfully', 
            filename,
            total_products: products.length,
            backup_size: Buffer.byteLength(JSON.stringify(backupData))
        });
    } catch (error) {
        console.error('Error creating backup:', error);
        res.status(500).json({ error: 'Failed to create backup' });
    }
});

// Add new product with multiple images
router.post('/products', (req, res, next) => {
    console.log('📝 POST /products - Before multer');
    console.log('Content-Type:', req.get('Content-Type'));
    console.log('Content-Length:', req.get('Content-Length'));
    
    upload.any()(req, res, (err) => {
        if (err) {
            console.error('❌ Multer error:', err);
            return res.status(400).json({ error: 'File upload error: ' + err.message });
        }
        console.log('✅ Multer processed successfully');
        console.log('📁 Files received:', req.files ? req.files.length : 0);
        next();
    });
}, async (req, res) => {
    try {
        console.log('=== ADD PRODUCT REQUEST ===');
        console.log('Request body:', req.body);
        console.log('Request files:', req.files);
        console.log('Files field names:', req.files ? req.files.map(f => f.fieldname) : 'No files');
        
        const {
            productname,
            productdescription,
            productprice,
            productcolor,
            sizes,
            total_stock
        } = req.body;
        
        const generatedProductId = Math.floor(100000000000 + Math.random() * 899999999999);
        
        if (!productname || !productprice) {
            return res.status(400).json({ error: 'Missing required fields: productname, productprice' });
        }
        
        const connection = await mysql.createConnection(dbConfig);
        
        // Parse sizes if it's a string
        let parsedSizes;
        try {
            parsedSizes = typeof sizes === 'string' ? JSON.parse(sizes) : sizes;
        } catch (error) {
            parsedSizes = [];
        }
        
        // Insert product
        const insertQuery = `
            INSERT INTO products 
            (product_id, productname, productdescription, productprice, productcolor, sizes, total_stock, productstatus) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const insertParams = [
            generatedProductId,
            productname,
            productdescription || '',
            parseFloat(productprice) || 0,
            productcolor || '',
            JSON.stringify(parsedSizes),
            parseInt(total_stock) || 0,
            'active'
        ];
        
        console.log('Executing product insert query:', insertQuery);
        console.log('With params:', insertParams);
        
        const [result] = await connection.execute(insertQuery, insertParams);
        const productDbId = result.insertId;
          // Insert images if any
        if (req.files && req.files.length > 0) {
            let thumbnailFilename = null;
            
            for (let i = 0; i < req.files.length; i++) {
                const file = req.files[i];
                const isFirstImage = i === 0; // First image is thumbnail
                
                if (isFirstImage) {
                    thumbnailFilename = file.filename;
                }
                
                const imageInsertQuery = `
                    INSERT INTO product_images 
                    (product_id, image_filename, image_order, is_thumbnail) 
                    VALUES (?, ?, ?, ?)
                `;
                
                await connection.execute(imageInsertQuery, [
                    generatedProductId,
                    file.filename,
                    i,
                    isFirstImage
                ]);
            }
            
            // Update the products table with the thumbnail image
            if (thumbnailFilename) {
                await connection.execute(
                    'UPDATE products SET productimage = ? WHERE product_id = ?',
                    [thumbnailFilename, generatedProductId]
                );
            }
        }
        
        await connection.end();
        
        console.log('Product added successfully, ID:', productDbId);
        res.json({ 
            message: 'Product added successfully', 
            productId: productDbId,
            product_id: generatedProductId
        });
        
    } catch (error) {
        console.error('Error adding product:', error);
        res.status(500).json({ 
            error: 'Failed to add product', 
            details: error.message        });
    }
});

// Get all products (include images)
router.get('/products', async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        
        // Get products with their images
        const [products] = await connection.execute(`
            SELECT p.*, 
                   GROUP_CONCAT(pi.image_filename ORDER BY pi.image_order) as images,
                   MIN(CASE WHEN pi.is_thumbnail = 1 THEN pi.image_filename END) as thumbnail
            FROM products p
            LEFT JOIN product_images pi ON p.product_id = pi.product_id
            GROUP BY p.id
            ORDER BY p.created_at DESC
        `);
        
        await connection.end();
        
        // Process the products to include image arrays
        const processedProducts = products.map(product => ({
            ...product,
            images: product.images ? product.images.split(',') : [],
            productimage: product.thumbnail || (product.images ? product.images.split(',')[0] : null)
        }));
        
        res.json(processedProducts);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

// Get images for a specific product
router.get('/products/:productId/images', async (req, res) => {
    try {
        const { productId } = req.params;
        const connection = await mysql.createConnection(dbConfig);
        
        const [images] = await connection.execute(
            'SELECT * FROM product_images WHERE product_id = ? ORDER BY image_order',
            [productId]
        );
        
        await connection.end();
        res.json(images);
    } catch (error) {
        console.error('Error fetching product images:', error);
        res.status(500).json({ error: 'Failed to fetch product images' });
    }
});

// Delete a specific image
router.delete('/images/:imageId', async (req, res) => {
    try {
        const { imageId } = req.params;
        const connection = await mysql.createConnection(dbConfig);
        
        // Get image details first
        const [imageResult] = await connection.execute(
            'SELECT * FROM product_images WHERE image_id = ?',
            [imageId]
        );
        
        if (imageResult.length === 0) {
            await connection.end();
            return res.status(404).json({ error: 'Image not found' });
        }
        
        const image = imageResult[0];
        
        // Delete file from filesystem
        const imagePath = path.join(__dirname, '../../uploads', image.image_filename);
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }
        
        // Delete from database
        await connection.execute('DELETE FROM product_images WHERE image_id = ?', [imageId]);
        
        // If this was a thumbnail, make the next image the thumbnail
        if (image.is_thumbnail) {
            await connection.execute(
                'UPDATE product_images SET is_thumbnail = 1 WHERE product_id = ? ORDER BY image_order LIMIT 1',
                [image.product_id]
            );
        }
        
        await connection.end();
        res.json({ message: 'Image deleted successfully' });
    } catch (error) {
        console.error('Error deleting image:', error);
        res.status(500).json({ error: 'Failed to delete image' });
    }
});

// Update product
router.put('/products/:id', upload.array('images', 10), async (req, res) => {
    try {
        const { id } = req.params;
        const {
            productname,
            productdescription,
            productprice,
            productcolor,
            sizes,
            total_stock
        } = req.body;
        
        const connection = await mysql.createConnection(dbConfig);
        
        // Parse sizes if it's a string
        let parsedSizes;
        try {
            parsedSizes = typeof sizes === 'string' ? JSON.parse(sizes) : sizes;
        } catch (error) {
            parsedSizes = [];
        }
        
        // Get the product_id for this database id
        const [productResult] = await connection.execute(
            'SELECT product_id FROM products WHERE id = ?',
            [id]
        );
        
        if (productResult.length === 0) {
            await connection.end();
            return res.status(404).json({ error: 'Product not found' });
        }
        
        const productId = productResult[0].product_id;
        
        // Update product
        const updateQuery = `
            UPDATE products 
            SET productname = ?, productdescription = ?, productprice = ?, 
                productcolor = ?, sizes = ?, total_stock = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;
        
        await connection.execute(updateQuery, [
            productname,
            productdescription || '',
            parseFloat(productprice) || 0,
            productcolor || '',
            JSON.stringify(parsedSizes),
            parseInt(total_stock) || 0,
            id
        ]);
        
        // Add new images if any
        if (req.files && req.files.length > 0) {
            // Get current image count
            const [currentImages] = await connection.execute(
                'SELECT COUNT(*) as count FROM product_images WHERE product_id = ?',
                [productId]
            );
            
            const currentCount = currentImages[0].count;
            
            for (let i = 0; i < req.files.length; i++) {
                const file = req.files[i];
                const imageOrder = currentCount + i;
                const isFirstImage = currentCount === 0 && i === 0; // First image if no existing images
                
                const imageInsertQuery = `
                    INSERT INTO product_images 
                    (product_id, image_filename, image_order, is_thumbnail) 
                    VALUES (?, ?, ?, ?)
                `;
                
                await connection.execute(imageInsertQuery, [
                    productId,
                    file.filename,
                    imageOrder,
                    isFirstImage
                ]);
            }
        }
        
        await connection.end();
        res.json({ message: 'Product updated successfully' });
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ error: 'Failed to update product' });
    }
});

// Restore archived product
router.post('/products/:id/restore', async (req, res) => {
    try {
        const { id } = req.params;
        const connection = await mysql.createConnection(dbConfig);
        
        await connection.execute(
            'UPDATE products SET productstatus = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            ['active', id]
        );
        
        await connection.end();
        res.json({ message: 'Product restored successfully' });
    } catch (error) {
        console.error('Error restoring product:', error);
        res.status(500).json({ error: 'Failed to restore product' });
    }
});

// Delete product permanently
router.delete('/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const connection = await mysql.createConnection(dbConfig);
        
        // Get product details first
        const [productResult] = await connection.execute(
            'SELECT * FROM products WHERE id = ?',
            [id]
        );
        
        if (productResult.length === 0) {
            await connection.end();
            return res.status(404).json({ error: 'Product not found' });
        }
        
        const product = productResult[0];
        
        // Get all images for this product
        const [images] = await connection.execute(
            'SELECT * FROM product_images WHERE product_id = ?',
            [product.product_id]
        );
        
        // Delete image files from filesystem
        images.forEach(image => {
            const imagePath = path.join(__dirname, '../../uploads', image.image_filename);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        });
        
        // Delete product images from database
        await connection.execute(
            'DELETE FROM product_images WHERE product_id = ?',
            [product.product_id]
        );
        
        // Delete product from database
        await connection.execute('DELETE FROM products WHERE id = ?', [id]);
        
        await connection.end();
        res.json({ message: 'Product deleted permanently' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ error: 'Failed to delete product' });
    }
});

module.exports = router;