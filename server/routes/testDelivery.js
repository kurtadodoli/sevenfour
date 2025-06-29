// Simple test API endpoint to verify the enhanced delivery functionality
const express = require('express');
const mysql = require('mysql2/promise');
const router = express.Router();

// Load environment config
const { dbConfig } = require('../config/db');

// Test endpoint for delivery orders (no auth required for testing)
router.get('/test-orders', async (req, res) => {
  let connection;
  try {
    console.log('🧪 Testing enhanced delivery orders endpoint...');
    connection = await mysql.createConnection(dbConfig);
    
    // Get just regular orders first
    console.log('Fetching regular orders...');
    const [regularOrders] = await connection.execute(`
      SELECT 
        o.id,
        o.order_number,
        oi.customer_name,
        oi.customer_email,
        o.contact_phone as customer_phone,
        o.total_amount,
        o.status,
        o.order_date,
        o.shipping_address,
        'regular' as order_type
      FROM orders o
      LEFT JOIN order_invoices oi ON o.invoice_id = oi.invoice_id
      WHERE o.status IN ('confirmed', 'processing')
      ORDER BY o.order_date DESC
      LIMIT 10
    `);
    
    console.log(`Found ${regularOrders.length} regular orders`);
    
    res.json({
      success: true,
      data: regularOrders,
      message: `Found ${regularOrders.length} orders for delivery`
    });
    
  } catch (error) {
    console.error('Test endpoint error:', error);
    res.status(500).json({
      success: false,
      message: 'Test endpoint failed',
      error: error.message
    });
  } finally {
    if (connection) await connection.end();
  }
});

module.exports = router;
