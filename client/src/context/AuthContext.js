import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode'; // Updated import

export const AuthContext = createContext(null); // Export the context directly

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                await verifyAndSetUser(token);
            } else {
                setLoading(false);
            }
        };
        checkAuth();
    }, []);

    const verifyAndSetUser = async (token) => {
        try {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            
            const decoded = jwtDecode(token);
            
            const response = await axios.get('/api/auth/verify');
            
            if (response.data.user) {
                setCurrentUser(response.data.user);
            } else {
                logout();
            }
        } catch (error) {
            console.error('Token verification failed:', error);
            logout();
        } finally {
            setLoading(false);
        }
    };

    const login = async (token) => {
        localStorage.setItem('token', token);
        await verifyAndSetUser(token);
    };

    const logout = () => {
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        setCurrentUser(null);
    };

    const updateUser = (userData) => {
        setCurrentUser(prev => ({ ...prev, ...userData }));
    };

    return (
        <AuthContext.Provider 
            value={{
                currentUser,
                login,
                logout,
                updateUser,
                isAdmin: currentUser?.role === 'admin',
                isAuthenticated: !!currentUser,
                loading
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};