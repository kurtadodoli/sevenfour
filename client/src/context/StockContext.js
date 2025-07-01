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
  
  // Generate a unique session ID to prevent self-triggered events
  const sessionId = useState(() => `session_${Date.now()}_${Math.random()}`)[0];

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
        
        // Notify other tabs about stock update (with session ID to prevent self-triggering)
        localStorage.setItem('stock_updated', JSON.stringify({
          timestamp: Date.now(),
          sessionId: sessionId
        }));
        
        console.log('📦 Stock data updated:', Object.keys(stockMap).length, 'products');
      }
    } catch (error) {
      console.error('Error fetching stock data:', error);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

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
        
        // Notify other tabs
        // Notify other tabs about the update
        localStorage.setItem('stock_updated', JSON.stringify({
          timestamp: Date.now(),
          sessionId: sessionId
        }));
        localStorage.setItem('product_stock_updated', productId.toString());
        
        console.log('📦 Updated stock for product:', productId);
      }
    } catch (error) {
      console.error('Error updating product stock:', error);
    }
  }, [sessionId]);

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
      
      // Notify other tabs
      localStorage.setItem('stock_updated', JSON.stringify({
        timestamp: Date.now(),
        sessionId: sessionId
      }));
      localStorage.setItem('multiple_products_updated', productIds.join(','));
      
      console.log('📦 Updated stock for multiple products:', productIds);
    } catch (error) {
      console.error('Error updating multiple products stock:', error);
    }
  }, [sessionId]);

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

  // Listen for stock updates from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e) => {
      // Only listen for storage events from OTHER windows/tabs, not from this current window
      if (e.storageArea === localStorage && e.key === 'stock_updated' && e.newValue !== e.oldValue) {
        try {
          const updateData = JSON.parse(e.newValue);
          // Only refresh if the update came from a different session (different tab/window)
          if (updateData.sessionId !== sessionId) {
            console.log('📦 Stock updated in another tab, refreshing...');
            fetchStockData();
          }
        } catch (error) {
          // Fallback for old format - assume it's from another tab
          console.log('📦 Stock updated in another tab, refreshing...');
          fetchStockData();
        }
      } else if (e.key === 'product_stock_updated') {
        const productId = parseInt(e.newValue);
        if (productId) {
          updateProductStock(productId);
        }
      } else if (e.key === 'multiple_products_updated') {
        const productIds = e.newValue.split(',').map(id => parseInt(id));
        updateMultipleProductsStock(productIds);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [sessionId, fetchStockData, updateProductStock, updateMultipleProductsStock]);

  // Initial fetch
  useEffect(() => {
    fetchStockData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Auto-refresh every 5 minutes (reduced frequency to prevent spam)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchStockData();
    }, 300000); // 5 minutes instead of 30 seconds

    return () => clearInterval(interval);
  }, [fetchStockData]);

  const value = {
    stockData,
    loading,
    lastUpdate,
    fetchStockData,
    updateProductStock,
    updateMultipleProductsStock,
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
