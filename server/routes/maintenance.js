const express = require('express');
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const dbConfig = require('../../config/database');

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

// Add new product
router.post('/products', upload.single('productimage'), async (req, res) => {
  try {
    console.log('=== ADD PRODUCT REQUEST ===');
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    
    const {
      product_id,
      productname,
      productdescription,
      productprice,
      productsize,
      productcolor,
      productquantity
    } = req.body;
    
    const productimage = req.file ? req.file.filename : null;
    const generatedProductId = product_id || Math.floor(100000000000 + Math.random() * 899999999999);
    
    if (!productname || !productprice || !productquantity) {
      return res.status(400).json({ error: 'Missing required fields: productname, productprice, productquantity' });
    }
    
    const connection = await mysql.createConnection(dbConfig);
    
    const insertQuery = `
      INSERT INTO products 
      (product_id, productname, productimage, productdescription, productprice, productsize, productcolor, productquantity, productstatus) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const insertParams = [
      generatedProductId,
      productname, 
      productimage,
      productdescription || '',
      parseFloat(productprice) || 0,
      productsize || '',
      productcolor || '',
      parseInt(productquantity) || 0,
      'active'
    ];
    
    console.log('Executing query:', insertQuery);
    console.log('With params:', insertParams);
    
    const [result] = await connection.execute(insertQuery, insertParams);
    await connection.end();
    
    console.log('Product added successfully, ID:', result.insertId);
    res.json({ 
      message: 'Product added successfully', 
      productId: result.insertId,
      product_id: generatedProductId
    });
    
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ 
      error: 'Failed to add product', 
      details: error.message 
    });
  }
});

module.exports = router;