import React, { useContext } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

// Component for protecting routes that require authentication
export const PrivateRoute = () => {
  const { auth, loading } = useContext(AuthContext);
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

  if (!auth.isAuthenticated) {
    // Redirect to login page with return URL
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

// Component for protecting routes that require admin role
export const AdminRoute = () => {
  const { auth, loading } = useContext(AuthContext);

  if (loading) {
    return <div>Loading...</div>;
  }

  return auth.isAuthenticated && auth.user.role === 'admin' ? (
    <Outlet />
  ) : (
    <Navigate to="/unauthorized" />
  );
};

// Component for protecting routes that require staff or admin role
export const StaffRoute = () => {
  const { auth, loading } = useContext(AuthContext);

  if (loading) {
    return <div>Loading...</div>;
  }

  return auth.isAuthenticated && ['admin', 'staff'].includes(auth.user.role) ? (
    <Outlet />
  ) : (
    <Navigate to="/unauthorized" />
  );
};