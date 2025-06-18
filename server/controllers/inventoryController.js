console.log('Starting inventory controller load...');

const { query } = require('../config/db');

// Get inventory overview with stock levels
const getInventoryOverview = async (req, res) => {
  console.log('getInventoryOverview called');
  try {
    const sql = `
      SELECT 
        product_id,
        productname,
        productimage,
        productdescription,
        productprice,
        productsize,
        productcolor,
        product_type,
        productquantity,
        productstatus,
        sizes,
        total_stock,
        created_at,
        updated_at
      FROM products 
      WHERE productstatus = 'active'
      ORDER BY productname ASC
    `;
    
    const products = await query(sql);
    console.log(`Found ${products.length} products in database`);
    
    res.json({ 
      success: true, 
      data: products,
      message: `Found ${products.length} products` 
    });
  } catch (error) {
    console.error('Error fetching inventory overview:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch inventory data',
      error: error.message 
    });
  }
};

// Get critical stock items
const getCriticalStock = async (req, res) => {
  console.log('getCriticalStock called');
  res.json({ 
    success: true, 
    data: [],
    message: 'Critical stock endpoint working' 
  });
};

// Get low stock items
const getLowStock = async (req, res) => {
  console.log('getLowStock called');
  res.json({ 
    success: true, 
    data: [],
    message: 'Low stock endpoint working' 
  });
};

// Get inventory statistics
const getInventoryStats = async (req, res) => {
  console.log('getInventoryStats called');
  try {
    const statsQuery = `
      SELECT 
        COUNT(*) as totalProducts,
        SUM(CASE WHEN productquantity IS NOT NULL THEN productquantity ELSE 0 END) as totalStock,
        COUNT(CASE WHEN productquantity <= 5 AND productquantity > 0 THEN 1 END) as lowStockCount,
        COUNT(CASE WHEN productquantity = 0 THEN 1 END) as criticalCount
      FROM products 
      WHERE productstatus = 'active'
    `;
    
    const [stats] = await query(statsQuery);
    
    res.json({ 
      success: true, 
      data: {
        totalProducts: stats.totalProducts || 0,
        totalStock: stats.totalStock || 0,
        criticalCount: stats.criticalCount || 0,
        lowStockCount: stats.lowStockCount || 0
      },
      message: 'Stats retrieved successfully' 
    });
  } catch (error) {
    console.error('Error fetching inventory stats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch inventory stats',
      error: error.message 
    });
  }
};

// Update inventory settings
const updateInventorySettings = async (req, res) => {
  console.log('updateInventorySettings called');
  res.json({ 
    success: true, 
    message: 'Settings endpoint working' 
  });
};

// Export all functions
module.exports = {
  getInventoryOverview,
  getCriticalStock,
  getLowStock,
  getInventoryStats,
  updateInventorySettings
};

console.log('Inventory controller exports defined');