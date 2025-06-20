// src/context/CartContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from './AuthContext';

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
  const [currentUserId, setCurrentUserId] = useState(null);
  
  // Get auth context
  const { currentUser } = useAuth();
  // Calculate cart statistics
  useEffect(() => {
    const count = cartItems.reduce((total, item) => total + item.quantity, 0);
    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    setCartCount(count);
    setCartTotal(total);
  }, [cartItems]);

  // Clear cart state (for user switches)
  const clearCartState = () => {
    console.log('CartContext: Clearing cart state');
    setCartItems([]);
    setCartCount(0);
    setCartTotal(0);
    setError(null);
  };

  // Fetch cart from server
  const fetchCart = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('CartContext: Fetching cart for user:', currentUser?.id);
      const response = await api.get('/cart');
      
      if (response.data.success) {
        console.log('CartContext: Cart fetched successfully:', response.data.data.items);
        setCartItems(response.data.data.items || []);
      } else {
        console.log('CartContext: No cart data or fetch failed');
        setCartItems([]);
      }
    } catch (err) {
      console.error('CartContext: Error fetching cart:', err);
      setError('Failed to load cart');
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle user authentication changes
  useEffect(() => {
    const newUserId = currentUser?.id;
    
    console.log('CartContext: User changed. Previous:', currentUserId, 'New:', newUserId);
    
    // If user changed (login/logout/switch account)
    if (currentUserId !== newUserId) {
      // Clear existing cart state first
      clearCartState();
      
      // Update current user tracking
      setCurrentUserId(newUserId);
      
      // If there's a new user, fetch their cart
      if (newUserId && localStorage.getItem('token')) {
        console.log('CartContext: New user logged in, fetching their cart');
        fetchCart();
      } else {
        console.log('CartContext: User logged out or no token, cart cleared');
      }
    }
  }, [currentUser?.id, currentUserId]);

  // Legacy effect for initial load (keeping for backwards compatibility)
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && currentUser?.id && !currentUserId) {
      console.log('CartContext: Initial cart fetch for authenticated user');
      fetchCart();
    }
  }, [currentUser?.id, currentUserId]);  // Add item to cart
  const addToCart = async (productId, color, size, quantity = 1) => {
    try {
      setLoading(true);
      setError(null);

      console.log('CartContext: Adding item to cart for user:', currentUser?.id);
      const response = await api.post('/cart', {
        product_id: productId,
        color: color,
        size: size,
        quantity: quantity
      });

      if (response.data.success) {
        console.log('CartContext: Item added successfully, refreshing cart');
        await fetchCart(); // Refresh cart
        return { success: true, message: 'Item added to cart!' };
      } else {
        throw new Error(response.data.message || 'Failed to add item to cart');
      }
    } catch (err) {
      console.error('CartContext: Error adding to cart:', err);
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

      console.log('CartContext: Updating cart item for user:', currentUser?.id);
      const response = await api.put('/cart/item', {
        item_id: itemId,
        quantity: quantity
      });

      if (response.data.success) {
        console.log('CartContext: Item updated successfully, refreshing cart');
        await fetchCart(); // Refresh cart
        return { success: true };
      } else {
        throw new Error(response.data.message || 'Failed to update cart item');      }
    } catch (err) {
      console.error('CartContext: Error updating cart item:', err);
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

      console.log('CartContext: Removing cart item for user:', currentUser?.id);
      const response = await api.delete(`/cart/item/${itemId}`);

      if (response.data.success) {
        console.log('CartContext: Item removed successfully, refreshing cart');
        await fetchCart(); // Refresh cart
        return { success: true, message: 'Item removed from cart' };
      } else {
        throw new Error(response.data.message || 'Failed to remove item from cart');
      }
    } catch (err) {
      console.error('CartContext: Error removing from cart:', err);
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

      console.log('CartContext: Clearing cart for user:', currentUser?.id);
      const response = await api.delete('/cart');

      if (response.data.success) {
        console.log('CartContext: Cart cleared successfully');
        setCartItems([]);
        return { success: true, message: 'Cart cleared' };
      } else {
        throw new Error(response.data.message || 'Failed to clear cart');
      }
    } catch (err) {
      console.error('CartContext: Error clearing cart:', err);
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
    clearCartState, // Expose for manual clearing if needed
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
