// src/context/CartContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Calculate cart statistics
  useEffect(() => {
    const count = cartItems.reduce((total, item) => total + item.quantity, 0);
    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    setCartCount(count);
    setCartTotal(total);
  }, [cartItems]);

  // Fetch cart from server
  const fetchCart = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/cart');
      
      if (response.data.success) {
        setCartItems(response.data.data.items || []);
      } else {
        setCartItems([]);
      }
    } catch (err) {
      console.error('Error fetching cart:', err);
      setError('Failed to load cart');
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };
  // Add item to cart
  const addToCart = async (productId, color, size, quantity = 1) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.post('/cart', {
        product_id: productId,
        color: color,
        size: size,
        quantity: quantity
      });

      if (response.data.success) {
        await fetchCart(); // Refresh cart
        return { success: true, message: 'Item added to cart!' };
      } else {
        throw new Error(response.data.message || 'Failed to add item to cart');
      }
    } catch (err) {
      console.error('Error adding to cart:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to add item to cart';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Update cart item quantity
  const updateCartItem = async (itemId, quantity) => {
    try {
      setLoading(true);
      setError(null);

      if (quantity <= 0) {
        return await removeFromCart(itemId);
      }

      const response = await api.put('/cart/item', {
        item_id: itemId,
        quantity: quantity
      });

      if (response.data.success) {
        await fetchCart(); // Refresh cart
        return { success: true };
      } else {
        throw new Error(response.data.message || 'Failed to update cart item');
      }
    } catch (err) {
      console.error('Error updating cart item:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update cart item';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Remove item from cart
  const removeFromCart = async (itemId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.delete(`/cart/item/${itemId}`);

      if (response.data.success) {
        await fetchCart(); // Refresh cart
        return { success: true, message: 'Item removed from cart' };
      } else {
        throw new Error(response.data.message || 'Failed to remove item from cart');
      }
    } catch (err) {
      console.error('Error removing from cart:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to remove item from cart';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.delete('/cart');

      if (response.data.success) {
        setCartItems([]);
        return { success: true, message: 'Cart cleared' };
      } else {
        throw new Error(response.data.message || 'Failed to clear cart');
      }
    } catch (err) {
      console.error('Error clearing cart:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to clear cart';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Initialize cart on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchCart();
    }
  }, []);

  const value = {
    cartItems,
    cartCount,
    cartTotal,
    loading,
    error,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    fetchCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
