// Make sure all required modules are imported at the top
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, 'server', '.env') });
const jwt = require('jsonwebtoken');

const app = express();

// CORS setup
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database configuration
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 's3v3n-f0ur-cl0thing*',
    database: 'seven_four_clothing'
};

// Revert to single image upload
const upload = multer({ dest: 'uploads/' });

// Serve uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Test endpoint
app.get('/api/test', (req, res) => {
    res.json({ message: 'Server is working!', timestamp: new Date() });
});

// CRITICAL TRANSACTION ROUTES - MUST BE FIRST TO AVOID CONFLICTS
app.put('/api/admin-no-auth/transactions/:id/approve', async (req, res) => {
    const { id } = req.params;
    console.log(`🟢 ADMIN APPROVING TRANSACTION ${id}`);
    
    try {
        const connection = await mysql.createConnection(dbConfig);
        await connection.execute('UPDATE orders SET status = ? WHERE id = ?', ['confirmed', id]);
        await connection.end();
        
        console.log(`✅ TRANSACTION ${id} APPROVED`);
        res.json({ success: true, message: 'Transaction approved' });
    } catch (error) {
        console.error('❌ APPROVE ERROR:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.put('/api/admin-no-auth/transactions/:id/reject', async (req, res) => {
    const { id } = req.params;
    console.log(`🔴 ADMIN REJECTING TRANSACTION ${id}`);
    
    try {
        const connection = await mysql.createConnection(dbConfig);
        await connection.execute('UPDATE orders SET status = ? WHERE id = ?', ['cancelled', id]);
        await connection.end();
        
        console.log(`✅ TRANSACTION ${id} REJECTED`);
        res.json({ success: true, message: 'Transaction rejected' });
    } catch (error) {
        console.error('❌ REJECT ERROR:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

console.log('🔥 TRANSACTION ROUTES ADDED TO SIMPLE SERVER');

// Authentication middleware (simplified for this server)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';

const auth = (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }
        
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

const requireAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
};

// Enhanced request logging
app.use((req, res, next) => {
    console.log(`📥 ${new Date().toISOString()} - ${req.method} ${req.path}`);
    if (req.path.includes('/admin-no-auth/transactions/')) {
        console.log(`🎯 Admin transaction request detected: ${req.method} ${req.path}`);
    }
    next();
});

// GET products - Fix this to match your database
app.get('/api/maintenance/products', async (req, res) => {
    console.log('🔄 GET /api/maintenance/products called');
    
    try {
        const connection = await mysql.createConnection(dbConfig);
        console.log('✅ Database connected');
        
        const [products] = await connection.execute('SELECT * FROM products ORDER BY id DESC');
        await connection.end();
        
        console.log(`📊 Found ${products.length} products in database`);
        console.log('📋 Products:', products.map(p => ({ id: p.id, name: p.productname })));
        
        res.setHeader('Content-Type', 'application/json');
        res.json(products);
        
    } catch (error) {
        console.error('❌ Database error in GET products:', error);
        res.status(500).json({ error: error.message });
    }
});

// ADD product with single image
app.post('/api/maintenance/products', upload.single('productimage'), async (req, res) => {
    try {
        console.log('Adding product:', req.body);
        const connection = await mysql.createConnection(dbConfig);
        
        const productId = Math.floor(100000000000 + Math.random() * 899999999999);
        
        const [result] = await connection.execute(
            'INSERT INTO products (product_id, productname, productimage, productdescription, productprice, productsize, productcolor, productquantity, productstatus) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
                productId,
                req.body.productname,
                req.file ? req.file.filename : null,
                req.body.productdescription || '',
                parseFloat(req.body.productprice) || 0,
                req.body.productsize || '',
                req.body.productcolor || '',
                parseInt(req.body.productquantity) || 0,
                'active'
            ]
        );
        
        await connection.end();
        res.json({ message: 'Product added successfully', id: result.insertId });
    } catch (error) {
        console.error('Add product error:', error);
        res.status(500).json({ error: error.message });
    }
});

// DELETE specific image from product
app.delete('/api/maintenance/products/:id/image/:filename', async (req, res) => {
    try {
        const { id, filename } = req.params;
        
        const connection = await mysql.createConnection(dbConfig);
        
        // Get current product images
        const [product] = await connection.execute('SELECT productimage FROM products WHERE id = ?', [id]);
        
        if (product.length > 0) {
            const currentImages = JSON.parse(product[0].productimage || '[]');
            const updatedImages = currentImages.filter(img => img !== filename);
            
            // Update database
            await connection.execute(
                'UPDATE products SET productimage = ? WHERE id = ?',
                [JSON.stringify(updatedImages), id]
            );
            
            // Delete physical file
            const imagePath = path.join(__dirname, 'uploads', filename);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
            
            await connection.end();
            res.json({ message: 'Image deleted successfully' });
        } else {
            res.status(404).json({ error: 'Product not found' });
        }
    } catch (error) {
        console.error('Delete image error:', error);
        res.status(500).json({ error: error.message });
    }
});

// COMPLETE DATABASE SYNC - UPDATE PRODUCT
app.put('/api/maintenance/products/:id', upload.single('productimage'), async (req, res) => {
    try {
        console.log('🔄 UPDATING PRODUCT IN DATABASE');
        console.log('Product ID:', req.params.id);
        console.log('Update data from MaintenancePage:', req.body);
        
        const connection = await mysql.createConnection(dbConfig);
        
        // Get current product to handle image deletion
        const [currentProduct] = await connection.execute(
            'SELECT productimage FROM products WHERE id = ?',
            [req.params.id]
        );
        
        let updateQuery, updateParams;
        
        if (req.file) {
            // Delete old image if exists
            if (currentProduct[0]?.productimage) {
                const oldImagePath = path.join(__dirname, 'uploads', currentProduct[0].productimage);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
            
            updateQuery = `
                UPDATE products 
                SET productname=?, productimage=?, productdescription=?, productprice=?, 
                    productsize=?, productcolor=?, productquantity=?, updated_at=CURRENT_TIMESTAMP 
                WHERE id=?
            `;
            updateParams = [
                req.body.productname,
                req.file.filename,
                req.body.productdescription || '',
                parseFloat(req.body.productprice) || 0,
                req.body.productsize || '',
                req.body.productcolor || '',
                parseInt(req.body.productquantity) || 0,
                req.params.id
            ];
        } else {
            updateQuery = `
                UPDATE products 
                SET productname=?, productdescription=?, productprice=?, 
                    productsize=?, productcolor=?, productquantity=?, updated_at=CURRENT_TIMESTAMP 
                WHERE id=?
            `;
            updateParams = [
                req.body.productname,
                req.body.productdescription || '',
                parseFloat(req.body.productprice) || 0,
                req.body.productsize || '',
                req.body.productcolor || '',
                parseInt(req.body.productquantity) || 0,
                req.params.id
            ];
        }
        
        await connection.execute(updateQuery, updateParams);
        await connection.end();
        
        console.log('✅ Product updated in database');
        res.json({ message: 'Product updated successfully' });
        
    } catch (error) {
        console.error('❌ Database update error:', error);
        res.status(500).json({ error: 'Failed to update product: ' + error.message });
    }
});

// COMPLETE DATABASE SYNC - DELETE PRODUCT
app.delete('/api/maintenance/products/:id', async (req, res) => {
    try {
        console.log('🔄 DELETING PRODUCT FROM DATABASE');
        console.log('Product ID:', req.params.id);
        
        const connection = await mysql.createConnection(dbConfig);
        
        // Get product details first
        const [product] = await connection.execute(
            'SELECT productimage FROM products WHERE id = ?',
            [req.params.id]
        );
        
        if (product.length === 0) {
            await connection.end();
            return res.status(404).json({ error: 'Product not found' });
        }
        
        // Delete image file
        if (product[0].productimage) {
            const imagePath = path.join(__dirname, 'uploads', product[0].productimage);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
                console.log('🗑️ Image deleted:', product[0].productimage);
            }
        }
        
        // Delete from database
        await connection.execute('DELETE FROM products WHERE id = ?', [req.params.id]);
        await connection.end();
        
        console.log('✅ Product deleted from database');
        res.json({ message: 'Product deleted successfully' });
        
    } catch (error) {
        console.error('❌ Database delete error:', error);
        res.status(500).json({ error: 'Failed to delete product: ' + error.message });
    }
});

// COMPLETE DATABASE SYNC - ARCHIVE PRODUCT
app.post('/api/maintenance/products/:id/archive', async (req, res) => {
    try {
        console.log('🔄 ARCHIVING PRODUCT IN DATABASE');
        
        const connection = await mysql.createConnection(dbConfig);
        
        // Update status to archived
        await connection.execute(
            'UPDATE products SET productstatus = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            ['archived', req.params.id]
        );
        
        // Add to archives table
        const [product] = await connection.execute(
            'SELECT product_id FROM products WHERE id = ?',
            [req.params.id]
        );
        
        if (product.length > 0) {
            // You may want to get the user from req.body or session; here we use a placeholder
            const archivedBy = req.body.archived_by || 'system';
            const [archiveResult] = await connection.execute(
                'INSERT INTO product_archives (product_id, archived_by) VALUES (?, ?)',
                [product[0].product_id, archivedBy]
            );
        }
        await connection.end();
        console.log('✅ Product archived in database');
        res.json({ message: 'Product archived in database successfully' });
        
    } catch (error) {
        console.error('❌ Database archive error:', error);
        res.status(500).json({ error: 'Failed to archive product in database: ' + error.message });
    }
});

// RESTORE PRODUCT - updates status in database
app.post('/api/maintenance/products/:id/restore', async (req, res) => {
    try {
        console.log('=== RESTORING PRODUCT IN DATABASE ===');
        
        const connection = await mysql.createConnection(dbConfig);
        
        // Update product status to active
        const [result] = await connection.execute(
            'UPDATE products SET productstatus = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            ['active', req.params.id]
        );
        
        await connection.end();
        
        console.log('✅ Product restored in database, affected rows:', result.affectedRows);
        res.json({ message: 'Product restored in database successfully' });
        
    } catch (error) {
        console.error('❌ Database restore error:', error);
        res.status(500).json({ error: 'Failed to restore product in database: ' + error.message });
    }
});

// Add a simple test endpoint to verify database connection
app.get('/api/test-products', async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [products] = await connection.execute('SELECT id, productname, productprice FROM products');
        await connection.end();
        
        res.json({
            success: true,
            count: products.length,
            products: products
        });
    } catch (error) {
        res.json({
            success: false,
            error: error.message
        });
    }
});

// Completely rewrite the products endpoint
app.get('/api/maintenance/products', async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [products] = await connection.execute('SELECT * FROM products ORDER BY id DESC');
        await connection.end();
        
        res.json(products);
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: error.message });
    }
});

// LIST ARCHIVED PRODUCTS
app.get('/api/maintenance/products/archives', async (req, res) => {
    try {
        console.log('=== FETCHING ARCHIVED PRODUCTS FROM DATABASE ===');
        
        const connection = await mysql.createConnection(dbConfig);
        
        const [results] = await connection.execute('SELECT * FROM product_archives');
        await connection.end();
        
        console.log('✅ Archived products fetched from database, count:', results.length);
        res.json({ archivedProducts: results });
        
    } catch (error) {
        console.error('❌ Database fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch archived products from database: ' + error.message });
    }
});

// Admin transaction routes
app.get('/api/admin/transactions', auth, requireAdmin, async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        
        const [transactions] = await connection.execute(`
            SELECT 
                o.id,
                o.order_number,
                o.user_id,
                o.transaction_id,
                o.status,
                o.order_date,
                o.total_amount,
                o.shipping_address,
                o.contact_phone,
                o.created_at,
                u.first_name,
                u.last_name,
                u.email,
                st.transaction_status,
                st.payment_method
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.user_id
            LEFT JOIN sales_transactions st ON o.transaction_id = st.transaction_id
            ORDER BY o.created_at DESC
        `);
        
        await connection.end();
        
        res.json({
            success: true,
            data: transactions
        });
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch transactions' 
        });
    }
});

// GET transactions endpoint for TransactionPage to fetch data
app.get('/api/admin/transactions', async (req, res) => {
    try {
        console.log('📋 Fetching all transactions for admin');
        const connection = await mysql.createConnection(dbConfig);
        
        const [transactions] = await connection.execute(`
            SELECT 
                o.id,
                o.order_number,
                o.user_id,
                o.transaction_id,
                o.status,
                o.order_date,
                o.total_amount,
                o.shipping_address,
                o.contact_phone,
                o.created_at,
                u.first_name,
                u.last_name,
                u.email,
                st.transaction_status,
                st.payment_method
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.user_id
            LEFT JOIN sales_transactions st ON o.transaction_id = st.transaction_id
            ORDER BY o.created_at DESC
        `);
        
        await connection.end();
        
        console.log(`📊 Found ${transactions.length} transactions`);
        res.json({
            success: true,
            data: transactions
        });
    } catch (error) {
        console.error('❌ Error fetching transactions:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch transactions' 
        });
    }
});

// Approve transaction
app.put('/api/admin/transactions/:id/approve', auth, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const connection = await mysql.createConnection(dbConfig);
          // Update order status to confirmed (approved)
        await connection.execute(
            'UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?',
            ['confirmed', id]
        );
          // Also update sales transaction status if exists (approved = confirmed)
        await connection.execute(`
            UPDATE sales_transactions st
            JOIN orders o ON st.transaction_id = o.transaction_id
            SET st.transaction_status = 'confirmed'
            WHERE o.id = ?
        `, [id]);
        
        await connection.end();
        
        res.json({
            success: true,
            message: 'Transaction approved successfully'
        });
    } catch (error) {
        console.error('Error approving transaction:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to approve transaction' 
        });
    }
});

// Reject transaction
app.put('/api/admin/transactions/:id/reject', auth, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const connection = await mysql.createConnection(dbConfig);
          // Update order status to cancelled (rejected)
        await connection.execute(
            'UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?',
            ['cancelled', id]
        );
          // Also update sales transaction status if exists (rejected = cancelled)
        await connection.execute(`
            UPDATE sales_transactions st
            JOIN orders o ON st.transaction_id = o.transaction_id
            SET st.transaction_status = 'cancelled'
            WHERE o.id = ?
        `, [id]);
        
        await connection.end();
        
        res.json({
            success: true,
            message: 'Transaction rejected successfully'
        });
    } catch (error) {
        console.error('Error rejecting transaction:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to reject transaction' 
        });
    }
});

// Admin transaction routes without authentication - WORKING VERSION
app.get('/api/admin-no-auth/test', (req, res) => {
    console.log('🧪 Test endpoint called - frontend can reach backend');
    res.json({ 
        success: true, 
        message: 'Backend communication working',
        timestamp: new Date().toISOString()
    });
});

app.put('/api/admin-no-auth/transactions/:id/approve', async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`🎯 ADMIN APPROVING TRANSACTION ${id}`);
        
        const connection = await mysql.createConnection(dbConfig);
        
        // Update order status to confirmed (approved)
        await connection.execute(
            'UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?',
            ['confirmed', id]
        );
        
        // Also update sales transaction status if exists (approved = confirmed)
        await connection.execute(`
            UPDATE sales_transactions st
            JOIN orders o ON st.transaction_id = o.transaction_id
            SET st.transaction_status = 'confirmed'
            WHERE o.id = ?
        `, [id]);
        
        await connection.end();
        
        console.log(`✅ Transaction ${id} approved successfully`);
        res.json({
            success: true,
            message: 'Transaction approved successfully'
        });
    } catch (error) {
        console.error('❌ Error approving transaction:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to approve transaction' 
        });
    }
});

app.put('/api/admin-no-auth/transactions/:id/reject', async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`🎯 ADMIN REJECTING TRANSACTION ${id}`);
        
        const connection = await mysql.createConnection(dbConfig);
        
        // Update order status to cancelled (rejected)
        await connection.execute(
            'UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?',
            ['cancelled', id]
        );
        
        // Also update sales transaction status if exists (rejected = cancelled)
        await connection.execute(`
            UPDATE sales_transactions st
            JOIN orders o ON st.transaction_id = o.transaction_id
            SET st.transaction_status = 'cancelled'
            WHERE o.id = ?
        `, [id]);
        
        await connection.end();
        
        console.log(`✅ Transaction ${id} rejected successfully`);
        res.json({
            success: true,
            message: 'Transaction rejected successfully'
        });
    } catch (error) {
        console.error('❌ Error rejecting transaction:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to reject transaction' 
        });
    }
});

// Log all registered routes for debugging
console.log('📋 Registering admin transaction routes:');
console.log('   PUT /api/admin-no-auth/transactions/:id/approve');
console.log('   PUT /api/admin-no-auth/transactions/:id/reject');
console.log('   GET /api/admin-no-auth/test');

// Force port 3001 and add error handling
const PORT = 3001;

app.listen(PORT, () => {
    console.log('=================================');
    console.log(`🚀 SERVER RUNNING ON PORT ${PORT}`);
    console.log(`📊 Test: http://localhost:${PORT}/api/test`);
    console.log(`📋 Products: http://localhost:${PORT}/api/maintenance/products`);
    console.log('=================================');
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use!`);
        console.log('Kill the process or restart your computer');
    }
});
