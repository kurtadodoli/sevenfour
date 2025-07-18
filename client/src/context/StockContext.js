import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

const StockContext = createContext();

export const useStock = () => {
  const context = useContext(StockContext);
  if (!context) {
    throw new Error('useStock must be used within a StockProvider');
  }
  return context;
};

export const StockProvider = ({ children }) => {
  const [stockData, setStockData] = useState({});
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  // Fetch current stock levels for all products
  const fetchStockData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/maintenance/products');
      
      if (response.data) {
        const stockMap = {};
        response.data.forEach(product => {
          if (product.product_id) {
            stockMap[product.product_id] = {
              product_id: product.product_id,
              productname: product.productname,
              total_available_stock: product.total_available_stock || 0,
              total_reserved_stock: product.total_reserved_stock || 0,
              total_stock: product.total_stock || 0,
              stock_status: product.stock_status || 'in_stock',
              last_stock_update: product.last_stock_update,
              sizeColorVariants: product.sizeColorVariants || []
            };
          }
        });
        
        setStockData(stockMap);
        setLastUpdate(new Date());
        
        console.log('📦 Stock data updated:', Object.keys(stockMap).length, 'products');
      }
    } catch (error) {
      console.error('Error fetching stock data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update stock for a specific product (used after order confirmation/cancellation)
  const updateProductStock = useCallback(async (productId) => {
    try {
      const response = await api.get(`/maintenance/products`);
      const product = response.data.find(p => p.product_id === productId);
      
      if (product) {
        setStockData(prev => ({
          ...prev,
          [productId]: {
            product_id: product.product_id,
            productname: product.productname,
            total_available_stock: product.total_available_stock || 0,
            total_reserved_stock: product.total_reserved_stock || 0,
            total_stock: product.total_stock || 0,
            stock_status: product.stock_status || 'in_stock',
            last_stock_update: product.last_stock_update,
            sizeColorVariants: product.sizeColorVariants || []
          }
        }));
        
        console.log('📦 Updated stock for product:', productId);
      }
    } catch (error) {
      console.error('Error updating product stock:', error);
    }
  }, []);

  // Bulk update stock (used after orders with multiple items)
  const updateMultipleProductsStock = useCallback(async (productIds) => {
    try {
      const response = await api.get('/maintenance/products');
      const updatedProducts = response.data.filter(p => 
        productIds.includes(p.product_id)
      );
      
      const updates = {};
      updatedProducts.forEach(product => {
        updates[product.product_id] = {
          product_id: product.product_id,
          productname: product.productname,
          total_available_stock: product.total_available_stock || 0,
          total_reserved_stock: product.total_reserved_stock || 0,
          total_stock: product.total_stock || 0,
          stock_status: product.stock_status || 'in_stock',
          last_stock_update: product.last_stock_update,
          sizeColorVariants: product.sizeColorVariants || []
        };
      });
      
      setStockData(prev => ({ ...prev, ...updates }));
      
      console.log('📦 Updated stock for multiple products:', productIds);
    } catch (error) {
      console.error('Error updating multiple products stock:', error);
    }
  }, []);

  // Get stock for a specific product
  const getProductStock = useCallback((productId) => {
    return stockData[productId] || null;
  }, [stockData]);

  // Get all products with low stock
  const getLowStockProducts = useCallback(() => {
    return Object.values(stockData).filter(product => 
      product.stock_status === 'low_stock' || product.stock_status === 'critical_stock'
    );
  }, [stockData]);

  // Get all products that are out of stock
  const getOutOfStockProducts = useCallback(() => {
    return Object.values(stockData).filter(product => 
      product.stock_status === 'out_of_stock'
    );
  }, [stockData]);

  // Calculate total stock across all products
  const getTotalStock = useCallback(() => {
    return Object.values(stockData).reduce((total, product) => 
      total + (product.total_available_stock || 0), 0
    );
  }, [stockData]);

  // Calculate stock statistics
  const getStockStats = useCallback(() => {
    const products = Object.values(stockData);
    const totalProducts = products.length;
    const inStock = products.filter(p => p.stock_status === 'in_stock').length;
    const lowStock = products.filter(p => p.stock_status === 'low_stock').length;
    const criticalStock = products.filter(p => p.stock_status === 'critical_stock').length;
    const outOfStock = products.filter(p => p.stock_status === 'out_of_stock').length;
    
    return {
      totalProducts,
      inStock,
      lowStock,
      criticalStock,
      outOfStock,
      totalAvailableStock: getTotalStock(),
      totalReservedStock: products.reduce((total, p) => total + (p.total_reserved_stock || 0), 0)
    };
  }, [stockData, getTotalStock]);

  // Listen for stock updates from other tabs/windows (simplified to prevent loops)
  useEffect(() => {
    const handleStorageChange = (e) => {
      // Only process localStorage events for stock-related keys
      if (e.storageArea !== localStorage) return;
      
      // For now, we'll disable cross-tab communication to prevent infinite loops
      // This can be re-enabled later with better debouncing logic if needed
      console.log('📦 Storage event detected, but cross-tab sync is disabled to prevent loops');
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchStockData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Auto-refresh every 10 minutes (reduced frequency to prevent spam)
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('📦 Auto-refreshing stock data (10-minute interval)');
      fetchStockData();
    }, 600000); // 10 minutes instead of 5 minutes

    return () => clearInterval(interval);
  }, [fetchStockData]);

  // Update stock after order placement
  const updateStockAfterOrder = useCallback((stockUpdates) => {
    if (!stockUpdates || stockUpdates.length === 0) return;
    
    console.log('📦 Updating stock after order placement:', stockUpdates);
    
    const updates = {};
    stockUpdates.forEach(update => {
      if (update.product_id) {
        updates[update.product_id] = {
          ...stockData[update.product_id],
          // Reduce available stock by the deducted quantity
          total_available_stock: Math.max(0, 
            (stockData[update.product_id]?.total_available_stock || 0) - (update.quantityDeducted || 0)
          ),
          last_stock_update: new Date().toISOString()
        };
      }
    });
    
    setStockData(prev => ({ ...prev, ...updates }));
    setLastUpdate(new Date());
    
    console.log('📦 Stock updated after order for products:', Object.keys(updates));
  }, [stockData]);

  const value = {
    stockData,
    loading,
    lastUpdate,
    fetchStockData,
    updateProductStock,
    updateMultipleProductsStock,
    updateStockAfterOrder,
    getProductStock,
    getLowStockProducts,
    getOutOfStockProducts,
    getTotalStock,
    getStockStats
  };

  return (
    <StockContext.Provider value={value}>
      {children}
    </StockContext.Provider>
  );
};
