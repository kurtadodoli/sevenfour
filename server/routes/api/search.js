const express = require('express');
const router = express.Router();
const { pool } = require('../../config/database');
const jwt = require('jsonwebtoken');

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Universal search endpoint
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { category, query, dateFrom, dateTo } = req.query;
    
    if (!category) {
      return res.status(400).json({ error: 'Category is required' });
    }    let connection;
    let results = [];

    try {
      connection = await pool.getConnection();
      
      switch (category) {
        case 'products':
          results = await searchProducts(connection, query);
          break;
        case 'orders':
          results = await searchOrders(connection, query, dateFrom, dateTo, false);
          break;
        case 'custom_orders':
          results = await searchCustomOrders(connection, query, dateFrom, dateTo);
          break;
        case 'completed_orders':
          results = await searchCompletedOrders(connection, query, dateFrom, dateTo);
          break;
        case 'cancelled_orders':
          results = await searchCancelledOrders(connection, query, dateFrom, dateTo);
          break;
        case 'custom_designs':
          results = await searchCustomDesigns(connection, query, dateFrom, dateTo);
          break;
        default:
          return res.status(400).json({ error: 'Invalid category' });
      }

      // Add category to each result
      results = results.map(item => ({ ...item, category }));

      res.json({ 
        results, 
        count: results.length,
        category,
        query: query || null,
        dateRange: dateFrom && dateTo ? { from: dateFrom, to: dateTo } : null
      });

    } finally {
      if (connection) connection.release();
    }

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed', message: error.message });
  }
});

// Get detailed information for a specific item
router.get('/details/:category/:id', authenticateToken, async (req, res) => {
  try {
    const { category, id } = req.params;
      let connection;
    let details = null;

    try {
      connection = await pool.getConnection();
      
      switch (category) {
        case 'products':
          details = await getProductDetails(connection, id);
          break;
        case 'orders':
          details = await getOrderDetails(connection, id);
          break;
        case 'custom_orders':
          details = await getCustomOrderDetails(connection, id);
          break;
        case 'completed_orders':
          details = await getCompletedOrderDetails(connection, id);
          break;
        case 'cancelled_orders':
          details = await getCancelledOrderDetails(connection, id);
          break;
        case 'custom_designs':
          details = await getCustomDesignDetails(connection, id);
          break;
        default:
          return res.status(400).json({ error: 'Invalid category' });
      }

      if (!details) {
        return res.status(404).json({ error: 'Item not found' });
      }

      details.category = category;
      res.json(details);

    } finally {
      if (connection) connection.release();
    }

  } catch (error) {
    console.error('Details fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch details', message: error.message });
  }
});

// Search functions for each category

async function searchProducts(connection, query) {
  let sql = `
    SELECT id, productname as name, product_type, productcolor, price,
           description, created_at
    FROM products 
    WHERE 1=1
  `;
  const params = [];

  if (query) {
    sql += ` AND (
      productname LIKE ? OR 
      product_type LIKE ? OR 
      productcolor LIKE ? OR
      description LIKE ?
    )`;
    const searchTerm = `%${query}%`;
    params.push(searchTerm, searchTerm, searchTerm, searchTerm);
  }

  sql += ` ORDER BY created_at DESC LIMIT 50`;
  
  const [rows] = await connection.execute(sql, params);
  return rows;
}

async function searchOrders(connection, query, dateFrom, dateTo, customOnly = false) {
  let sql = `
    SELECT o.id, o.order_number, o.customer_name, o.total_amount,
           o.status, o.created_at, o.order_date, o.delivery_status,
           u.firstname, u.lastname, u.email
    FROM orders o
    LEFT JOIN users u ON o.user_id = u.id
    WHERE 1=1
  `;
  const params = [];

  if (customOnly) {
    sql += ` AND o.is_custom = 1`;
  } else {
    sql += ` AND (o.is_custom = 0 OR o.is_custom IS NULL)`;
  }

  if (query) {
    sql += ` AND (
      o.order_number LIKE ? OR 
      o.customer_name LIKE ? OR 
      u.firstname LIKE ? OR 
      u.lastname LIKE ? OR 
      u.email LIKE ?
    )`;
    const searchTerm = `%${query}%`;
    params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
  }

  if (dateFrom) {
    sql += ` AND DATE(o.created_at) >= ?`;
    params.push(dateFrom);
  }

  if (dateTo) {
    sql += ` AND DATE(o.created_at) <= ?`;
    params.push(dateTo);
  }

  sql += ` ORDER BY o.created_at DESC LIMIT 50`;
  
  const [rows] = await connection.execute(sql, params);
  return rows.map(row => ({
    ...row,
    customer_name: row.customer_name || `${row.firstname || ''} ${row.lastname || ''}`.trim()
  }));
}

async function searchCustomOrders(connection, query, dateFrom, dateTo) {
  let sql = `
    SELECT co.id, co.order_number, co.customer_name, co.total_amount,
           co.status, co.created_at, co.order_date, co.delivery_status,
           co.production_start_date, co.production_completion_date,
           co.design_description, co.product_type,
           u.firstname, u.lastname, u.email
    FROM custom_orders co
    LEFT JOIN users u ON co.user_id = u.id
    WHERE 1=1
  `;
  const params = [];

  if (query) {
    sql += ` AND (
      co.order_number LIKE ? OR 
      co.customer_name LIKE ? OR 
      co.design_description LIKE ? OR
      co.product_type LIKE ? OR
      u.firstname LIKE ? OR 
      u.lastname LIKE ? OR 
      u.email LIKE ?
    )`;
    const searchTerm = `%${query}%`;
    params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
  }

  if (dateFrom) {
    sql += ` AND DATE(co.created_at) >= ?`;
    params.push(dateFrom);
  }

  if (dateTo) {
    sql += ` AND DATE(co.created_at) <= ?`;
    params.push(dateTo);
  }

  sql += ` ORDER BY co.created_at DESC LIMIT 50`;
  
  const [rows] = await connection.execute(sql, params);
  return rows.map(row => ({
    ...row,
    customer_name: row.customer_name || `${row.firstname || ''} ${row.lastname || ''}`.trim()
  }));
}

async function searchCompletedOrders(connection, query, dateFrom, dateTo) {
  let sql = `
    SELECT o.id, o.order_number, o.customer_name, o.total_amount,
           o.status, o.created_at, o.order_date, o.delivery_status,
           o.delivery_date, o.delivery_address,
           u.firstname, u.lastname, u.email
    FROM orders o
    LEFT JOIN users u ON o.user_id = u.id
    WHERE o.delivery_status = 'completed'
  `;
  const params = [];

  if (query) {
    sql += ` AND (
      o.order_number LIKE ? OR 
      o.customer_name LIKE ? OR 
      u.firstname LIKE ? OR 
      u.lastname LIKE ? OR 
      u.email LIKE ?
    )`;
    const searchTerm = `%${query}%`;
    params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
  }

  if (dateFrom) {
    sql += ` AND DATE(o.delivery_date) >= ?`;
    params.push(dateFrom);
  }

  if (dateTo) {
    sql += ` AND DATE(o.delivery_date) <= ?`;
    params.push(dateTo);
  }

  sql += ` ORDER BY o.delivery_date DESC LIMIT 50`;
  
  const [rows] = await connection.execute(sql, params);
  return rows.map(row => ({
    ...row,
    customer_name: row.customer_name || `${row.firstname || ''} ${row.lastname || ''}`.trim()
  }));
}

async function searchCancelledOrders(connection, query, dateFrom, dateTo) {
  let sql = `
    SELECT o.id, o.order_number, o.customer_name, o.total_amount,
           o.status, o.created_at, o.order_date, o.delivery_status,
           o.cancellation_date, o.cancellation_reason,
           u.firstname, u.lastname, u.email
    FROM orders o
    LEFT JOIN users u ON o.user_id = u.id
    WHERE o.status = 'cancelled' OR o.delivery_status = 'cancelled'
  `;
  const params = [];

  if (query) {
    sql += ` AND (
      o.order_number LIKE ? OR 
      o.customer_name LIKE ? OR 
      o.cancellation_reason LIKE ? OR
      u.firstname LIKE ? OR 
      u.lastname LIKE ? OR 
      u.email LIKE ?
    )`;
    const searchTerm = `%${query}%`;
    params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
  }

  if (dateFrom) {
    sql += ` AND DATE(o.cancellation_date) >= ?`;
    params.push(dateFrom);
  }

  if (dateTo) {
    sql += ` AND DATE(o.cancellation_date) <= ?`;
    params.push(dateTo);
  }

  sql += ` ORDER BY o.cancellation_date DESC LIMIT 50`;
  
  const [rows] = await connection.execute(sql, params);
  return rows.map(row => ({
    ...row,
    customer_name: row.customer_name || `${row.firstname || ''} ${row.lastname || ''}`.trim()
  }));
}

async function searchCustomDesigns(connection, query, dateFrom, dateTo) {
  let sql = `
    SELECT cd.id, cd.customer_name, cd.product_type, cd.design_description,
           cd.status, cd.created_at, cd.image_path, cd.notes,
           cd.price_estimate, cd.completion_date,
           u.firstname, u.lastname, u.email
    FROM custom_designs cd
    LEFT JOIN users u ON cd.user_id = u.id
    WHERE 1=1
  `;
  const params = [];

  if (query) {
    sql += ` AND (
      cd.customer_name LIKE ? OR 
      cd.design_description LIKE ? OR 
      cd.product_type LIKE ? OR
      cd.notes LIKE ? OR
      u.firstname LIKE ? OR 
      u.lastname LIKE ? OR 
      u.email LIKE ?
    )`;
    const searchTerm = `%${query}%`;
    params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
  }

  if (dateFrom) {
    sql += ` AND DATE(cd.created_at) >= ?`;
    params.push(dateFrom);
  }

  if (dateTo) {
    sql += ` AND DATE(cd.created_at) <= ?`;
    params.push(dateTo);
  }

  sql += ` ORDER BY cd.created_at DESC LIMIT 50`;
  
  const [rows] = await connection.execute(sql, params);
  return rows.map(row => ({
    ...row,
    customer_name: row.customer_name || `${row.firstname || ''} ${row.lastname || ''}`.trim()
  }));
}

// Detail functions for each category

async function getProductDetails(connection, id) {
  const sql = `
    SELECT * FROM products WHERE id = ?
  `;
  const [rows] = await connection.execute(sql, [id]);
  return rows[0] || null;
}

async function getOrderDetails(connection, id) {
  const sql = `
    SELECT o.*, u.firstname, u.lastname, u.email, u.phone,
           GROUP_CONCAT(
             CONCAT(oi.product_name, ' (', oi.quantity, 'x ₱', oi.price, ')')
             SEPARATOR ', '
           ) as order_items
    FROM orders o
    LEFT JOIN users u ON o.user_id = u.id
    LEFT JOIN order_items oi ON o.id = oi.order_id
    WHERE o.id = ?
    GROUP BY o.id
  `;
  const [rows] = await connection.execute(sql, [id]);
  return rows[0] || null;
}

async function getCustomOrderDetails(connection, id) {
  const sql = `
    SELECT co.*, u.firstname, u.lastname, u.email, u.phone
    FROM custom_orders co
    LEFT JOIN users u ON co.user_id = u.id
    WHERE co.id = ?
  `;
  const [rows] = await connection.execute(sql, [id]);
  return rows[0] || null;
}

async function getCompletedOrderDetails(connection, id) {
  const sql = `
    SELECT o.*, u.firstname, u.lastname, u.email, u.phone,
           GROUP_CONCAT(
             CONCAT(oi.product_name, ' (', oi.quantity, 'x ₱', oi.price, ')')
             SEPARATOR ', '
           ) as order_items
    FROM orders o
    LEFT JOIN users u ON o.user_id = u.id
    LEFT JOIN order_items oi ON o.id = oi.order_id
    WHERE o.id = ? AND o.delivery_status = 'completed'
    GROUP BY o.id
  `;
  const [rows] = await connection.execute(sql, [id]);
  return rows[0] || null;
}

async function getCancelledOrderDetails(connection, id) {
  const sql = `
    SELECT o.*, u.firstname, u.lastname, u.email, u.phone,
           GROUP_CONCAT(
             CONCAT(oi.product_name, ' (', oi.quantity, 'x ₱', oi.price, ')')
             SEPARATOR ', '
           ) as order_items
    FROM orders o
    LEFT JOIN users u ON o.user_id = u.id
    LEFT JOIN order_items oi ON o.id = oi.order_id
    WHERE o.id = ? AND (o.status = 'cancelled' OR o.delivery_status = 'cancelled')
    GROUP BY o.id
  `;
  const [rows] = await connection.execute(sql, [id]);
  return rows[0] || null;
}

async function getCustomDesignDetails(connection, id) {
  const sql = `
    SELECT cd.*, u.firstname, u.lastname, u.email, u.phone
    FROM custom_designs cd
    LEFT JOIN users u ON cd.user_id = u.id
    WHERE cd.id = ?
  `;
  const [rows] = await connection.execute(sql, [id]);
  return rows[0] || null;
}

module.exports = router;
