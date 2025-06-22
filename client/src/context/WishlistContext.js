// src/context/WishlistContext.js
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  
  // Get auth context
  const { currentUser } = useAuth();

  // Clear wishlist state (for user switches)
  const clearWishlistState = useCallback(() => {
    console.log('WishlistContext: Clearing wishlist state');
    setWishlistItems([]);
  }, []);

  // Get user-specific localStorage key
  const getUserWishlistKey = useCallback((userId) => {
    return userId ? `wishlist_user_${userId}` : 'wishlist';
  }, []);

  // Load wishlist for specific user
  const loadUserWishlist = useCallback((userId) => {
    if (!userId) {
      setWishlistItems([]);
      return;
    }

    const wishlistKey = getUserWishlistKey(userId);
    const savedWishlist = localStorage.getItem(wishlistKey);
    
    if (savedWishlist) {
      try {
        const items = JSON.parse(savedWishlist);
        console.log(`WishlistContext: Loaded ${items.length} items for user ${userId}`);
        setWishlistItems(items);
      } catch (error) {
        console.error('WishlistContext: Error parsing wishlist from localStorage:', error);
        setWishlistItems([]);
      }
    } else {
      console.log(`WishlistContext: No saved wishlist for user ${userId}`);
      setWishlistItems([]);
    }
  }, [getUserWishlistKey]);

  // Handle user authentication changes
  useEffect(() => {
    const newUserId = currentUser?.id;
    
    console.log('WishlistContext: User changed. Previous:', currentUserId, 'New:', newUserId);
    
    // If user changed (login/logout/switch account)
    if (currentUserId !== newUserId) {
      // Save current wishlist for previous user (if any)
      if (currentUserId && wishlistItems.length > 0) {
        const prevWishlistKey = getUserWishlistKey(currentUserId);
        localStorage.setItem(prevWishlistKey, JSON.stringify(wishlistItems));
        console.log(`WishlistContext: Saved ${wishlistItems.length} items for previous user ${currentUserId}`);
      }
      
      // Update current user tracking
      setCurrentUserId(newUserId);
      
      // Load wishlist for new user
      loadUserWishlist(newUserId);
    }
  }, [currentUser?.id, currentUserId, wishlistItems, getUserWishlistKey, loadUserWishlist]);

  // Save wishlist to localStorage whenever it changes (for current user)
  useEffect(() => {
    if (currentUserId) {
      const wishlistKey = getUserWishlistKey(currentUserId);
      localStorage.setItem(wishlistKey, JSON.stringify(wishlistItems));
    }
  }, [wishlistItems, currentUserId, getUserWishlistKey]);

  const addToWishlist = async (productId) => {
    if (wishlistItems.includes(productId)) {
      return { success: false, message: 'Product already in wishlist' };
    }

    setLoading(true);
    try {
      // In a real app, you'd make an API call here
      // For now, we'll just manage locally
      setWishlistItems(prev => [...prev, productId]);
      
      return { success: true, message: 'Added to wishlist' };
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      return { success: false, message: 'Failed to add to wishlist' };
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId) => {
    setLoading(true);
    try {
      // In a real app, you'd make an API call here
      setWishlistItems(prev => prev.filter(id => id !== productId));
      
      return { success: true, message: 'Removed from wishlist' };
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      return { success: false, message: 'Failed to remove from wishlist' };
    } finally {
      setLoading(false);
    }
  };

  const isInWishlist = (productId) => {
    return wishlistItems.includes(productId);
  };

  const clearWishlist = () => {
    setWishlistItems([]);
  };
  const value = {
    wishlistItems,
    loading,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    clearWishlist,
    clearWishlistState,
    wishlistCount: wishlistItems.length
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};
