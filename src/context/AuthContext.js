import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';
import { debugToken } from '../utils/authDebug';
import api from '../utils/api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // API base URL (using the imported api instance now)
    const API_BASE_URL = 'http://localhost:3001';

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        setCurrentUser(null);
        setError(null);
    }, []);    const verifyAndSetUser = useCallback(async (token) => {
        try {
            if (!token) {
                console.log('No token provided for verification');
                return false;
            }

            console.log('Verifying token...');
            
            // Create a clean axios instance for token verification
            // This prevents automatic logout during token verification
            const verifyApi = axios.create({
                baseURL: API_BASE_URL,
                timeout: 10000,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            try {
                // Verify token with server
                const verifyResponse = await verifyApi.get('/api/auth/verify');
                
                if (verifyResponse.data?.success && verifyResponse.data?.data?.user) {
                    console.log('Token verification successful');
                    
                    // Even with basic verification success, set the user
                    setCurrentUser(verifyResponse.data.data.user);
                    setError(null);
                    
                    // Try to get full profile data after successful verification
                    try {
                        console.log('Fetching full profile after verification');
                        const profileResponse = await verifyApi.get('/api/auth/profile');
                        
                        if (profileResponse.data?.success && profileResponse.data?.data?.user) {
                            console.log('Full profile fetched successfully');
                            setCurrentUser(profileResponse.data.data.user);
                        }
                    } catch (profileError) {
                        console.warn('Profile fetch failed after verification, using basic user data:', profileError);
                        // We already set the user from verify response, so we're good
                    }
                    
                    return true;
                } else {
                    console.warn('Token verification response missing user data');
                    throw new Error('Invalid user data received');
                }
            } catch (verifyError) {
                console.error('Token verification request failed:', verifyError);
                
                // Try the profile endpoint directly as a fallback
                try {
                    console.log('Trying profile endpoint as fallback verification');
                    const profileResponse = await verifyApi.get('/api/auth/profile');
                    
                    if (profileResponse.data?.success && profileResponse.data?.data?.user) {
                        console.log('Profile endpoint verification successful');
                        setCurrentUser(profileResponse.data.data.user);
                        setError(null);
                        return true;
                    }
                } catch (profileError) {
                    console.error('Both verification methods failed, must log out');
                    throw verifyError; // Throw the original error
                }
            }
            
            throw new Error('All verification methods failed');
        } catch (error) {
            console.error('Token verification completely failed:', error);
            // Only clear token and user on verified authentication failures
            if (error.response?.status === 401 || error.response?.status === 403) {
                setError('Session expired. Please login again.');
                logout();
            } else {
                // For network or server errors, don't log out - might be temporary
                setError('Verification failed. Please try again later.');
            }
            return false;
        }
    }, [API_BASE_URL, logout]);    // Check authentication on app load
    useEffect(() => {
        const checkAuth = async () => {
            console.log('Checking authentication on app load');
            const token = localStorage.getItem('token');
            
            if (token) {
                try {
                    // Check token validity and debug info
                    debugToken();
                    
                    console.log('Token found in localStorage, verifying...');
                    const verified = await verifyAndSetUser(token);
                    
                    if (!verified) {
                        console.warn('Token verification failed but did not throw an error');
                    }
                } catch (error) {
                    console.error('Error during initial auth check:', error);
                    // Don't remove token on network errors, it might just be temporary
                    if (error.response?.status === 401 || error.response?.status === 403) {
                        console.log('Clearing invalid token');
                        localStorage.removeItem('token');
                    }
                }
            } else {
                console.log('No token found in localStorage');
            }
            
            setLoading(false);
        };
        
        checkAuth();
    }, [verifyAndSetUser]);const login = useCallback(async (credentials) => {
        try {
            setError(null);
            setLoading(true);

            // Create a clean axios instance for login without interceptors
            // This prevents automatic logout on 401 during login attempts
            const loginApi = axios.create({
                baseURL: API_BASE_URL,
                timeout: 10000,
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            // Make the login request with the clean instance
            const loginResponse = await loginApi.post('/api/auth/login', credentials);
            
            if (loginResponse.data?.success && loginResponse.data?.data) {
                const { user, token } = loginResponse.data.data;
                
                // Store token before making any other API calls
                localStorage.setItem('token', token);
                
                // Immediately set the user data from login
                setCurrentUser(user);
                
                console.log('Login successful, token stored, user set in context');
                
                // Use a timeout to avoid race conditions
                setTimeout(async () => {
                    try {
                        console.log('Fetching full profile after login');
                        // Create a new request with the token
                        const authHeader = { headers: { Authorization: `Bearer ${token}` } };
                        const profileResponse = await axios.get(
                            `${API_BASE_URL}/api/auth/profile`, 
                            authHeader
                        );
                        
                        if (profileResponse.data?.success && profileResponse.data?.data?.user) {
                            console.log('Full profile fetched successfully');
                            setCurrentUser(profileResponse.data.data.user);
                        }
                    } catch (profileError) {
                        console.warn('Could not fetch full profile after login:', profileError);
                        // Continue with basic user data if profile fetch fails
                    }
                }, 500);
                
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
        }    }, [API_BASE_URL]);
    
    // Register function - using multiple approaches to ensure reliability
    const register = useCallback(async (userData) => {
        try {
            setError(null);
            setLoading(true);
            console.log('Starting registration process with data:', userData);

            // First, try using our configured API
            try {
                const response = await api.post('/auth/register', userData);
                console.log('Registration API response:', response);
                
                if (response.data?.success && response.data?.data) {
                    const { user, token } = response.data.data;
                    localStorage.setItem('token', token);
                    setCurrentUser(user);
                    console.log('Registration successful!', user);
                    return { success: true, user, token };
                } else {
                    throw new Error('Invalid response from server');
                }
            } catch (apiError) {
                console.error('API registration failed, trying fetch:', apiError);
                
                // If API call fails, try direct fetch as backup
                const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(userData)
                });
                
                const data = await response.json();
                console.log('Fetch registration response:', response.status, data);
                
                if (response.ok && data.success && data.data) {
                    const { user, token } = data.data;
                    localStorage.setItem('token', token);
                    setCurrentUser(user);
                    console.log('Registration successful via fetch!', user);
                    return { success: true, user, token };
                } else {
                    const errorMessage = data.message || 'Registration failed';
                    console.error('Fetch registration failed:', errorMessage);
                    throw new Error(errorMessage);
                }
            }
        } catch (error) {
            console.error('Registration ultimately failed:', error);
            const errorMessage = error.message || 'Registration failed. Please try again.';
            setError(errorMessage);
            throw new Error(errorMessage);        } finally {
            setLoading(false);
        }
    }, [API_BASE_URL]);const getProfile = useCallback(async () => {
        try {
            console.log('AuthContext: Getting user profile...');
            
            // If we already have the current user data, use it first
            if (currentUser) {
                console.log('AuthContext: Using cached user data');
                return currentUser;
            }
            
            const response = await api.get('/api/auth/profile');
            console.log('AuthContext: Profile API response:', response.data);
            
            if (response.data?.success && response.data?.data?.user) {
                // Update the current user in context
                setCurrentUser(response.data.data.user);
                return response.data.data.user;
            } else {
                console.warn('Profile response missing expected data structure:', response.data);
                
                // Return whatever data we have instead of throwing an error
                if (response.data?.data) {
                    return response.data.data;
                }
                
                throw new Error('Invalid profile data received');
            }
        } catch (error) {
            console.error('Failed to get profile:', error);
            
            // If there's an authentication error, log the user out
            if (error.response?.status === 401) {
                logout();
            }
            
            // Return current user as fallback if available
            if (currentUser) {
                console.log('AuthContext: Using current user as fallback');
                return currentUser;
            }
              throw error;
        }
    }, [currentUser, logout]);const updateProfile = useCallback(async (profileData) => {
        try {
            const response = await api.put('/api/auth/profile', profileData);
            if (response.data?.success && response.data?.data?.user) {
                setCurrentUser(response.data.data.user);
                return response.data.data.user;
            }
        } catch (error) {
            console.error('Failed to update profile:', error);            throw error;
        }
    }, []);const uploadProfilePicture = useCallback(async (file) => {
        try {
            const formData = new FormData();
            formData.append('profile_picture', file);  // Make sure this matches the field name expected by the server

            // Try the profile-specific API route first
            try {
                const response = await api.post('/api/profile/profile/picture', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                
                if (response.data?.success) {
                    // Refresh user profile to get updated picture URL
                    const updatedProfile = await getProfile();
                    return updatedProfile;
                } else {
                    throw new Error(response.data?.message || 'Upload failed');
                }
            } catch (primaryError) {
                console.warn('Primary upload route failed, trying fallback route:', primaryError);
                
                // Fallback to the auth route
                const fallbackResponse = await api.post('/api/auth/upload-profile-picture', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                
                if (fallbackResponse.data?.success) {
                    // Refresh user profile to get updated picture URL
                    const updatedProfile = await getProfile();
                    return updatedProfile;
                } else {
                    throw new Error(fallbackResponse.data?.message || 'Failed to upload profile picture');
                }
            }
        } catch (error) {
            console.error('Failed to upload profile picture:', error);            throw error;
        }
    }, [getProfile]);

    const updateUser = useCallback((userData) => {
        setCurrentUser(prev => ({ ...prev, ...userData }));
    }, []);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // Check if user is admin
    const isAdmin = currentUser?.role === 'admin';    const value = {
        currentUser,
        setCurrentUser, // Expose setCurrentUser directly
        loading,
        error,
        login,
        register,
        logout,
        getProfile,
        updateProfile,
        uploadProfilePicture,
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
