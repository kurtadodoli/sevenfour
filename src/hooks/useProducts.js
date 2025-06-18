// src/hooks/useProducts.js
import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

export const useProducts = (refreshInterval = 30000) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchProducts = useCallback(async () => {
    try {
      setError(null);
      
      // Fetch products
      const productsResponse = await api.get('/products');
      
      // Fetch categories
      const categoriesResponse = await api.get('/products/categories');
      
      setProducts(productsResponse.data.products || []);
      setCategories(categoriesResponse.data.data || []);
      setLastUpdate(new Date());
      
      return true;
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products. Please try again later.');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshProducts = useCallback(async () => {
    console.log('Refreshing products...');
    return await fetchProducts();
  }, [fetchProducts]);

  // Initial fetch
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Set up periodic refresh if enabled
  useEffect(() => {
    if (refreshInterval > 0) {
      const interval = setInterval(() => {
        fetchProducts();
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [fetchProducts, refreshInterval]);

  // Listen for storage events (for cross-tab communication)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'products_updated') {
        console.log('Products updated in another tab, refreshing...');
        fetchProducts();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [fetchProducts]);

  return {
    products,
    categories,
    loading,
    error,
    lastUpdate,
    refreshProducts,
    isStale: lastUpdate && (Date.now() - lastUpdate.getTime()) > refreshInterval
  };
};

// Utility function to trigger product refresh across tabs
export const triggerProductRefresh = () => {
  localStorage.setItem('products_updated', Date.now().toString());
  localStorage.removeItem('products_updated');
};
