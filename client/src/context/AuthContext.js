import React, { createContext, useState } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [auth, setAuth] = useState({
        isAuthenticated: false,
        user: null
    });

    const login = async (formData) => {
        try {
            console.log('Login attempt:', {
                email: formData.email,
                hasPassword: !!formData.password
            });

            const response = await axios.post('http://localhost:5001/api/auth/login', formData);
            console.log('Server response:', response.data);

            if (response.data.success) {
                console.log('Login successful:', response.data.user);
                setAuth({
                    isAuthenticated: true,
                    user: response.data.user
                });
                return { success: true, user: response.data.user };
            }

            console.log('Login failed:', response.data);
            return response.data;

        } catch (error) {
            console.error('Login error:', error.response?.data || error.message);
            return {
                success: false,
                message: error.response?.data?.message || 'Login failed'
            };
        }
    };

    const logout = () => {
        setAuth({
            isAuthenticated: false,
            user: null
        });
    };

    return (
        <AuthContext.Provider value={{ auth, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};