import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

// Create the auth context
export const AuthContext = createContext();

// Base URL for API
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is logged in on page load
  useEffect(() => {
    const checkLoggedIn = async () => {
      if (localStorage.token) {
        setAuthToken(localStorage.token);
        try {
          const res = await axios.get(`${API_URL}/users/me`);
          setCurrentUser(res.data.data);
        } catch (err) {
          localStorage.removeItem('token');
          setError('Session expired. Please log in again.');
        }
      }
      setLoading(false);
    };

    checkLoggedIn();
  }, []);

  // Set token in axios headers
  const setAuthToken = token => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
    }
  };

  // Register user
  const register = async formData => {
    try {
      setError(null);
      const res = await axios.post(`${API_URL}/users/register`, formData);
      setAuthToken(res.data.token);
      setCurrentUser(res.data.user);
      return res.data;
    } catch (err) {
      setError(
        err.response && err.response.data.message
          ? err.response.data.message
          : 'Registration failed'
      );
      throw err;
    }
  };

  // Login user
  const login = async formData => {
    try {
      setError(null);
      const res = await axios.post(`${API_URL}/users/login`, formData);
      setAuthToken(res.data.token);
      setCurrentUser(res.data.user);
      return res.data;
    } catch (err) {
      setError(
        err.response && err.response.data.message
          ? err.response.data.message
          : 'Invalid credentials'
      );
      throw err;
    }
  };

  // Logout user
  const logout = async () => {
    try {
      await axios.get(`${API_URL}/users/logout`);
      setAuthToken(null);
      setCurrentUser(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Forgot password
  const forgotPassword = async (email) => {
    try {
      setError(null);
      const res = await axios.post(`${API_URL}/users/forgotpassword`, { email });
      return res.data;
    } catch (err) {
      setError(
        err.response && err.response.data.message
          ? err.response.data.message
          : 'Error processing request'
      );
      throw err;
    }
  };

  // Reset password
  const resetPassword = async (resetToken, password) => {
    try {
      setError(null);
      const res = await axios.put(`${API_URL}/users/resetpassword/${resetToken}`, { password });
      return res.data;
    } catch (err) {
      setError(
        err.response && err.response.data.message
          ? err.response.data.message
          : 'Error resetting password'
      );
      throw err;
    }
  };

  // Check if user has a specific role
  const hasRole = (roles) => {
    if (!currentUser) return false;
    if (typeof roles === 'string') {
      return currentUser.role === roles;
    }
    return roles.includes(currentUser.role);
  };

  // Check if user is Admin
  const isAdmin = () => {
    return currentUser && currentUser.role === 'admin';
  };

  // Check if user is Staff
  const isStaff = () => {
    return currentUser && currentUser.role === 'staff';
  };

  // Check if user is Customer
  const isCustomer = () => {
    return currentUser && currentUser.role === 'customer';
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        error,
        register,
        login,
        logout,
        forgotPassword,
        resetPassword,
        hasRole,
        isAdmin,
        isStaff,
        isCustomer,
        setError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};