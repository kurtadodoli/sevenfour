import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    },
    validateStatus: status => status >= 200 && status < 500  // Handle HTTP errors in catch block
});

// Add interceptors
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {    const [loading, setLoading] = useState(true);
    const [auth, setAuth] = useState(() => {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user') || 'null');
        return {
            isAuthenticated: !!token && !!user,
            user,
            token
        };
    });    // Verify auth state on mount
    useEffect(() => {
        const verifyAuth = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setAuth({
                    isAuthenticated: false,
                    user: null,
                    token: null
                });
                setLoading(false);
                return;
            }            try {
                const response = await api.get('/profile');
                if (response.data.success) {
                    const user = response.data.data;
                    setAuth({
                        isAuthenticated: true,
                        user,
                        token
                    });
                    localStorage.setItem('user', JSON.stringify(user));
                }
            } catch (error) {
                console.error('Auth verification failed:', error);
                setAuth({
                    isAuthenticated: false,
                    user: null,
                    token: null
                });
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            } finally {
                setLoading(false);
            }
        };

        verifyAuth();
    }, []);    const login = async (credentials) => {
        try {
            console.log('Attempting login with:', credentials.email);
            const response = await api.post('/auth/login', credentials);
            console.log('Login response:', response.data);
            
            if (!response.data.success) {
                throw new Error(response.data.message || 'Login failed');
            }
            
            // Validate that we received the expected data
            if (!response.data.token || !response.data.user) {
                throw new Error('Invalid server response - missing token or user data');
            }

            const { token, user } = response.data;
            
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            
            setAuth({
                isAuthenticated: true,
                user,
                token
            });

            return response.data;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setAuth({
            isAuthenticated: false,
            user: null,
            token: null
        });
    };

    const register = async (userData) => {
        try {
            const response = await api.post('/auth/register', userData);
            return response.data;
        } catch (error) {
            throw error;
        }
    };

    const updateUser = useCallback((userData) => {
        setAuth(prev => ({
            ...prev,
            user: {
                ...prev.user,
                ...userData
            }
        }));
    }, []);

    const value = useMemo(() => ({
        auth,
        login,
        logout,
        updateUser
    }), [auth, login, logout, updateUser]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// Export the context as well for components that need direct access
export { AuthContext };