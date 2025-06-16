const express = require('express');
const mysql = require('mysql2/promise');
const { dbConfig } = require('../config/db');
const { auth } = require('../middleware/auth');
const router = express.Router();

// Apply auth middleware to all admin routes
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
        res.status(500).json({ error: 'Failed to fetch user logs' });
    }
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

module.exports = router;
