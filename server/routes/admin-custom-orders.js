const express = require('express');
const mysql = require('mysql2/promise');
const { dbConfig } = require('../config/db');
const router = express.Router();

// Get all custom orders with images count
router.get('/', async (req, res) => {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    
    const query = `
      SELECT 
        co.id,
        co.custom_order_id,
        co.product_type,
        co.product_name,
        co.size,
        co.color,
        co.quantity,
        co.customer_name,
        co.customer_email,
        co.customer_phone,
        co.municipality,
        co.street_number,
        co.estimated_price,
        co.status,
        co.created_at,
        COUNT(coi.id) as image_count
      FROM custom_orders co
      LEFT JOIN custom_order_images coi ON co.custom_order_id = coi.custom_order_id
      GROUP BY co.id
      ORDER BY co.created_at DESC
    `;
    
    const [orders] = await connection.execute(query);
    
    res.json({
      success: true,
      data: orders
    });
    
  } catch (error) {
    console.error('Error fetching custom orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch custom orders'
    });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
});

// Get specific order with images
router.get('/:orderId', async (req, res) => {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    
    // Get order details
    const [orders] = await connection.execute(
      'SELECT * FROM custom_orders WHERE custom_order_id = ?',
      [req.params.orderId]
    );
    
    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Get order images
    const [images] = await connection.execute(
      `SELECT id, image_filename, original_filename, image_size, mime_type, upload_order, created_at
       FROM custom_order_images 
       WHERE custom_order_id = ? 
       ORDER BY upload_order`,
      [req.params.orderId]
    );
    
    res.json({
      success: true,
      data: {
        order: orders[0],
        images: images
      }
    });
    
  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order details'
    });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
});

// Update order status
router.patch('/:orderId/status', async (req, res) => {
  let connection;
  
  try {
    const { status, adminNotes } = req.body;
    
    const allowedStatuses = [
      'pending', 'under_review', 'approved', 'in_production', 
      'ready_for_delivery', 'completed', 'cancelled'
    ];
    
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }
    
    connection = await mysql.createConnection(dbConfig);
    
    const [result] = await connection.execute(
      'UPDATE custom_orders SET status = ?, admin_notes = ?, updated_at = NOW() WHERE custom_order_id = ?',
      [status, adminNotes || null, req.params.orderId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Order status updated successfully'
    });
    
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status'
    });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
});

module.exports = router;
