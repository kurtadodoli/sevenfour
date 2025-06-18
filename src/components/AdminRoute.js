import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Route component that only allows admin users to access the wrapped routes
 */
const AdminRoute = () => {
  const { currentUser, loading } = useAuth();
  
  // If auth is still loading, show nothing or a loading spinner
  if (loading) {
    return <div>Loading...</div>;
  }
  
  // Check if user is admin
  if (currentUser && currentUser.role === 'admin') {
    return <Outlet />;
  }
  
  // Redirect to unauthorized page if not admin
  return <Navigate to="/unauthorized" replace />;
};

export default AdminRoute;
