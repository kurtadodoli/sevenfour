console.log('Starting inventory controller load...');

const { query } = require('../config/db');

// Get inventory overview with stock levels from products table (matches order confirmation system)
const getInventoryOverview = async (req, res) => {
  console.log('🔍 getInventoryOverview called - fetching from products table with real-time stock');
  try {
    // Get all active products with their current stock levels (same fields used by order confirmation)
    const productsSql = `
      SELECT 
        product_id,
        productname,
        productimage,
        productdescription,
        productprice,
        productcolor,
        product_type,
        productstatus,
        status,
        total_available_stock,
        total_reserved_stock,
        total_stock,
        stock_status,
        productquantity,
        sizes,
        last_stock_update,
        created_at,
        updated_at
      FROM products
      WHERE (productstatus = 'active' OR status = 'active')
      ORDER BY productname ASC
    `;
    
    const products = await query(productsSql);
    console.log(`Found ${products.length} active products`);
    
    // Process products with their actual stock data
    const processedProducts = products.map(product => {
      // Use total_available_stock as the primary stock source (this is what order confirmation updates)
      const totalStock = product.total_available_stock || product.total_stock || product.productquantity || 0;
      const reservedStock = product.total_reserved_stock || 0;
      
      // Determine stock level based on available stock
      let stockLevel = 'normal';
      if (totalStock === 0) {
        stockLevel = 'critical';
      } else if (totalStock <= 5) {
        stockLevel = 'critical';
      } else if (totalStock <= 15) {
        stockLevel = 'low';
      }
      
      // Parse sizes JSON for display (but use total_available_stock for actual numbers)
      let sizesData = [];
      if (product.sizes) {
        try {
          sizesData = JSON.parse(product.sizes) || [];
        } catch (error) {
          console.log(`Could not parse sizes for product ${product.product_id}`);
          sizesData = [];
        }
      }
      
      return {
        product_id: product.product_id,
        productname: product.productname,
        productimage: product.productimage,
        productdescription: product.productdescription,
        productprice: product.productprice,
        productcolor: product.productcolor,
        product_type: product.product_type,
        status: product.productstatus || product.status,
        totalStock: totalStock,
        reservedStock: reservedStock,
        stockLevel: stockLevel,
        stock_status: product.stock_status,
        sizes: JSON.stringify(sizesData),
        last_stock_update: product.last_stock_update,
        created_at: product.created_at,
        updated_at: product.updated_at
      };
    });
    
    console.log(`✅ Processed ${processedProducts.length} products with stock levels`);
    
    res.json({ 
      success: true, 
      data: processedProducts,
      message: `Found ${processedProducts.length} products with stock data` 
    });
  } catch (error) {
    console.error('❌ Error fetching inventory overview:', error);
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