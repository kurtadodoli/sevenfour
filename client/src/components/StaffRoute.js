import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Route component that only allows staff or admin users to access the wrapped routes
 */
const StaffRoute = () => {
  const { currentUser, loading } = useAuth();
  
  // If auth is still loading, show nothing or a loading spinner
  if (loading) {
    return <div>Loading...</div>;
  }
  
  // Check if user is staff or admin
  if (currentUser && (currentUser.role === 'staff' || currentUser.role === 'admin')) {
    return <Outlet />;
  }
  
  // Redirect to unauthorized page if not staff or admin
  return <Navigate to="/unauthorized" replace />;
};

export default StaffRoute;
