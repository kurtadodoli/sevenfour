const mysql = require('mysql2/promise');
const { dbConfig } = require('../config/db');

// Returns sales data for each product, grouped by day
exports.getSalesReport = async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        
        // Get sales per product per day with proper collation handling
        const [rows] = await connection.execute(`
            SELECT 
                oi.product_id,
                p.productname,
                DATE(o.order_date) as sale_date,
                SUM(oi.quantity) as total_sold,
                SUM(oi.subtotal) as total_revenue
            FROM order_items oi
            JOIN orders o ON oi.invoice_id COLLATE utf8mb4_unicode_ci = o.invoice_id COLLATE utf8mb4_unicode_ci
            JOIN products p ON oi.product_id = p.product_id
            WHERE o.status IN ('confirmed', 'completed', 'cancelled')
            GROUP BY oi.product_id, sale_date
            ORDER BY sale_date DESC, oi.product_id
        `);
        
        await connection.end();
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Error fetching sales report:', error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch sales report' });
    }
};
