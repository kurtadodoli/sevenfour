import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);

    const login = async (userData) => {
        setCurrentUser(userData);
        // Add login logic here
    };

    const logout = async () => {
        setCurrentUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };

    const resetPassword = async (email) => {
        // Add password reset logic here
    };

    const register = async (userData) => {
        try {
            const response = await axios.post('http://localhost:5001/api/auth/register', userData);
            return response.data;
        } catch (error) {
            throw error;
        }
    };

    const value = {
        currentUser,
        login,
        logout,
        register,
        resetPassword
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// Export the context as well for components that need direct access
export { AuthContext };