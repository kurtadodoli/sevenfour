import React, { useContext } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

// Component for protecting routes that require authentication
export const PrivateRoute = () => {
  const { currentUser, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        Loading...
      </div>
    );
  }

  if (!currentUser) {
    // Redirect to login page with return URL
    return <Navigate to="/login" state={{ from: location }} replace />;  }
  return <Outlet />;
};