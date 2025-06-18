import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // API base URL
    const API_BASE_URL = 'http://localhost:5000';

    // Create axios instance with base configuration
    const api = axios.create({
        baseURL: API_BASE_URL,
        timeout: 10000,
        headers: {
            'Content-Type': 'application/json',
        }
    });

    // Add token to requests if it exists
    api.interceptors.request.use(
        (config) => {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        },
        (error) => Promise.reject(error)
    );

    // Handle response errors
    api.interceptors.response.use(
        (response) => response,
        (error) => {
            if (error.response?.status === 401) {
                // Token expired or invalid
                logout();
            }
            return Promise.reject(error);
        }
    );

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        setCurrentUser(null);
        setError(null);
    }, []);

    const verifyAndSetUser = useCallback(async (token) => {
        try {
            if (!token) {
                throw new Error('No token provided');
            }

            // Store token
            localStorage.setItem('token', token);

            // Verify token with server
            const response = await api.get('/api/auth/verify');
            
            if (response.data?.success && response.data?.data?.user) {
                setCurrentUser(response.data.data.user);
                setError(null);
                return true;
            } else {
                throw new Error('Invalid user data received');
            }
        } catch (error) {
            console.error('Token verification failed:', error);
            if (error.response?.status === 401) {
                setError('Session expired. Please login again.');
            } else {
                setError('Authentication failed. Please try again.');
            }
            logout();
            return false;
        }
    }, [logout]);

    // Check authentication on app load
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                await verifyAndSetUser(token);
            }
            setLoading(false);
        };
        checkAuth();
    }, [verifyAndSetUser]);

    const login = useCallback(async (credentials) => {
        try {
            setError(null);
            setLoading(true);

            const response = await api.post('/api/auth/login', credentials);
            
            if (response.data?.success && response.data?.data) {
                const { user, token } = response.data.data;
                localStorage.setItem('token', token);
                setCurrentUser(user);
                return { success: true, user, token };
            } else {
                throw new Error('Invalid response from server');
            }
        } catch (error) {
            console.error('Login failed:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Login failed. Please try again.';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    const register = useCallback(async (userData) => {
        try {
            setError(null);
            setLoading(true);

            const response = await api.post('/api/auth/register', userData);
            
            if (response.data?.success && response.data?.data) {
                const { user, token } = response.data.data;
                localStorage.setItem('token', token);
                setCurrentUser(user);
                return { success: true, user, token };
            } else {
                throw new Error('Invalid response from server');
            }
        } catch (error) {
            console.error('Registration failed:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Registration failed. Please try again.';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    const getProfile = useCallback(async () => {
        try {
            const response = await api.get('/api/auth/profile');
            if (response.data?.success && response.data?.data?.user) {
                setCurrentUser(response.data.data.user);
                return response.data.data.user;
            }
        } catch (error) {
            console.error('Failed to get profile:', error);
            throw error;
        }
    }, []);

    const updateProfile = useCallback(async (profileData) => {
        try {
            const response = await api.put('/api/auth/profile', profileData);
            if (response.data?.success && response.data?.data?.user) {
                setCurrentUser(response.data.data.user);
                return response.data.data.user;
            }
        } catch (error) {
            console.error('Failed to update profile:', error);
            throw error;
        }
    }, []);

    const updateUser = useCallback((userData) => {
        setCurrentUser(prev => ({ ...prev, ...userData }));
    }, []);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // Check if user is admin
    const isAdmin = currentUser?.role === 'admin';

    const value = {
        currentUser,
        loading,
        error,
        login,
        register,
        logout,
        getProfile,
        updateProfile,
        updateUser,
        clearError,
        isAdmin,
        api // Expose api instance for other components
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to use auth context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
