// server/routes/api/db-setup.js
const express = require('express');
const router = express.Router();
const { query } = require('../../config/db');
const path = require('path');
const fs = require('fs').promises;
const { auth } = require('../../middleware/auth');
const adminCheck = require('../../middleware/adminCheck');

// Check if product tables exist
router.get('/check-product-tables', async (req, res) => {
  try {
    const checkTablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'seven_four_clothing' 
      AND table_name IN ('products', 'product_images', 'product_colors', 'product_sizes', 'product_audit_log')
    `;

    const tables = await query(checkTablesQuery);
    
    const existingTables = tables.map(t => t.table_name);
    const requiredTables = ['products', 'product_images', 'product_colors', 'product_sizes', 'product_audit_log'];
    
    const missingTables = requiredTables.filter(table => !existingTables.includes(table));
    
    res.json({
      success: true,
      data: {
        existingTables,
        missingTables,
        isComplete: missingTables.length === 0
      }
    });
  } catch (error) {
    console.error('Error checking product tables:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check product tables',
      error: error.message
    });
  }
});

// Initialize product tables - Admin only
router.post('/init-product-tables', [auth, adminCheck], async (req, res) => {
  try {
    // Read and execute the SQL script
    const sqlFilePath = path.join(__dirname, '../../database/product_schema.sql');
    const sql = await fs.readFile(sqlFilePath, 'utf8');
    
    // Split by delimiter to handle triggers
    const statements = sql.split('DELIMITER //');
    
    // Execute the first part (table creation)
    if (statements.length > 0) {
      await query(statements[0]);
    }
    
    // Handle any trigger definitions
    if (statements.length > 1) {
      // Split by end delimiter
      const triggerParts = statements[1].split('DELIMITER ;');
      if (triggerParts.length > 0) {
        // Split by individual triggers
        const triggers = triggerParts[0].split('END //');
        for (const trigger of triggers) {
          if (trigger.trim()) {
            await query(trigger + 'END');
          }
        }
      }
      
      // Execute any remaining SQL after the DELIMITER ; section
      if (triggerParts.length > 1) {
        await query(triggerParts[1]);
      }
    }
    
    res.json({
      success: true,
      message: 'Product tables initialized successfully'
    });
  } catch (error) {
    console.error('Error initializing product tables:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initialize product tables',
      error: error.message
    });
  }
});

module.exports = router;
