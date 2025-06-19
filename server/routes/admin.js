const express = require('express');
const mysql = require('mysql2/promise');
const { dbConfig } = require('../config/db');
const { auth } = require('../middleware/auth');
const router = express.Router();

// NO-AUTH Transaction endpoints - explicitly at the top for development/testing

// Get all transactions
router.get('/transactions', async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        
        console.log('📊 Fetching all transactions');
        
        const [transactions] = await connection.execute(`
            SELECT 
                o.id,
                o.order_number,
                o.customer_id,
                CONCAT(u.first_name, ' ', u.last_name) as customer_name,
                u.email as customer_email,
                o.shipping_address,
                o.contact_phone,
                o.total_amount,
                o.payment_method,
                o.status,
                o.notes,
                o.transaction_id,
                o.created_at,
                o.updated_at
            FROM 
                orders o
            LEFT JOIN 
                users u ON o.customer_id = u.user_id
            ORDER BY 
                o.created_at DESC
        `);
        
        console.log(`✅ Fetched ${transactions.length} transactions successfully`);
        
        await connection.end();
        
        res.json({
            success: true,
            data: transactions
        });
    } catch (error) {
        console.error('❌ Error fetching transactions:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch transactions',
            details: error.message
        });
    }
});
// Approve transaction
router.put('/transactions/:id/approve', async (req, res) => {
    try {
        const { id } = req.params;
        const connection = await mysql.createConnection(dbConfig);
        
        console.log(`🚀 Processing approval for transaction ID: ${id}`);
        
        // Update order status to approved
        await connection.execute(
            'UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?',
            ['approved', id]
        );
        
        // Also update sales transaction status if exists
        await connection.execute(`
            UPDATE sales_transactions st
            JOIN orders o ON st.transaction_id = o.transaction_id
            SET st.transaction_status = 'approved'
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
            error: 'Failed to approve transaction',
            details: error.message 
        });
    }
});

// Reject transaction
router.put('/transactions/:id/reject', async (req, res) => {
    try {
        const { id } = req.params;
        const connection = await mysql.createConnection(dbConfig);
        
        console.log(`🚀 Processing rejection for transaction ID: ${id}`);
        
        // Update order status to rejected
        await connection.execute(
            'UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?',
            ['rejected', id]
        );
        
        // Also update sales transaction status if exists
        await connection.execute(`
            UPDATE sales_transactions st
            JOIN orders o ON st.transaction_id = o.transaction_id
            SET st.transaction_status = 'rejected'
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
            error: 'Failed to reject transaction',
            details: error.message 
        });
    }
});

// Get User Logs Report (TEST - No Auth Required)
router.get('/user-logs-test', async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        
        const [users] = await connection.execute(`
            SELECT 
                user_id as id,
                CONCAT(first_name, ' ', last_name) as username,
                email,
                first_name,
                last_name,
                role,
                is_active as status,
                last_login,
                created_at,
                updated_at
            FROM users 
            ORDER BY created_at DESC
        `);
        
        await connection.end();
        
        console.log(`Found ${users.length} users in database`);
        res.json(users);
    } catch (error) {
        console.error('Error fetching user logs (test):', error);
        res.status(500).json({ error: 'Failed to fetch user logs', details: error.message });
    }
});

// Apply auth middleware to all other admin routes
router.use(auth);

// Middleware to check admin role
const requireAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
};

// Get User Logs Report
router.get('/user-logs', requireAdmin, async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        
        const [users] = await connection.execute(`
            SELECT 
                user_id as id,
                CONCAT(first_name, ' ', last_name) as username,
                email,
                first_name,
                last_name,
                role,
                is_active as status,
                last_login,
                created_at,
                updated_at
            FROM users 
            ORDER BY created_at DESC
        `);
        
        await connection.end();
        
        res.json(users);
    } catch (error) {
        console.error('Error fetching user logs:', error);
        res.status(500).json({ error: 'Failed to fetch user logs' });    }
});

// Get Inventory Report
router.post('/inventory-report', requireAdmin, async (req, res) => {
    try {
        const { startDate, endDate } = req.body;
        const connection = await mysql.createConnection(dbConfig);
        
        let query = `
            SELECT 
                id,
                product_id,
                productname,
                productprice,
                productcolor,
                total_stock,
                productstatus,
                created_at,
                updated_at
            FROM products
        `;
        
        let params = [];
        
        // Add date filtering if provided
        if (startDate && endDate) {
            query += ' WHERE created_at BETWEEN ? AND ?';
            params = [startDate, endDate + ' 23:59:59'];
        } else if (startDate) {
            query += ' WHERE created_at >= ?';
            params = [startDate];
        } else if (endDate) {
            query += ' WHERE created_at <= ?';
            params = [endDate + ' 23:59:59'];
        }
        
        query += ' ORDER BY created_at DESC';
        
        const [products] = await connection.execute(query, params);
        
        await connection.end();
        
        res.json(products);
    } catch (error) {
        console.error('Error fetching inventory report:', error);
        res.status(500).json({ error: 'Failed to fetch inventory report' });
    }
});

// Get Dashboard Statistics (optional - for overview)
router.get('/dashboard-stats', requireAdmin, async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        
        // Get total users
        const [userCount] = await connection.execute('SELECT COUNT(*) as total FROM users');
        
        // Get total products
        const [productCount] = await connection.execute('SELECT COUNT(*) as total FROM products');
        
        // Get active products
        const [activeProducts] = await connection.execute('SELECT COUNT(*) as total FROM products WHERE productstatus = "active"');
        
        // Get recent user registrations (last 30 days)
        const [recentUsers] = await connection.execute(`
            SELECT COUNT(*) as total 
            FROM users 
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        `);
        
        await connection.end();
        
        res.json({
            totalUsers: userCount[0].total,
            totalProducts: productCount[0].total,
            activeProducts: activeProducts[0].total,
            recentUsers: recentUsers[0].total
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
    }
});

// Get all transactions for admin
router.get('/transactions', requireAdmin, async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        
        const [transactions] = await connection.execute(`
            SELECT 
                o.id,
                o.order_number,
                o.user_id,
                o.status,
                o.order_date,
                o.total_amount,
                o.shipping_address,
                o.contact_phone,
                o.notes,
                o.created_at,
                o.updated_at,
                u.first_name,
                u.last_name,
                u.email,
                CONCAT(u.first_name, ' ', u.last_name) as customer_name,
                u.email as customer_email,
                st.payment_method,
                st.transaction_status
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

// Approve transaction
router.put('/transactions/:id/approve', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const connection = await mysql.createConnection(dbConfig);
        
        // Update order status to approved
        await connection.execute(
            'UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?',
            ['approved', id]
        );
        
        // Also update sales transaction status if exists
        await connection.execute(`
            UPDATE sales_transactions st
            JOIN orders o ON st.transaction_id = o.transaction_id
            SET st.transaction_status = 'approved'
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
router.put('/transactions/:id/reject', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const connection = await mysql.createConnection(dbConfig);
        
        // Update order status to rejected
        await connection.execute(
            'UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?',
            ['rejected', id]
        );
        
        // Also update sales transaction status if exists
        await connection.execute(`
            UPDATE sales_transactions st
            JOIN orders o ON st.transaction_id = o.transaction_id
            SET st.transaction_status = 'rejected'
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

// Non-authenticated versions for testing/development
// Approve transaction without auth
router.put('/no-auth/transactions/:id/approve', async (req, res) => {
    try {
        const { id } = req.params;
        const connection = await mysql.createConnection(dbConfig);
        
        // Update order status to approved
        await connection.execute(
            'UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?',
            ['approved', id]
        );
        
        // Also update sales transaction status if exists
        await connection.execute(`
            UPDATE sales_transactions st
            JOIN orders o ON st.transaction_id = o.transaction_id
            SET st.transaction_status = 'approved'
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

module.exports = router;
