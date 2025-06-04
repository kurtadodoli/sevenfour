import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

// Component for protecting routes that require authentication
export const PrivateRoute = () => {
  const { currentUser, loading } = useContext(AuthContext);

  if (loading) {
    return <div>Loading...</div>;
  }

  return currentUser ? <Outlet /> : <Navigate to="/login" />;
};

// Component for protecting routes that require admin role
export const AdminRoute = () => {
  const { currentUser, loading, isAdmin } = useContext(AuthContext);

  if (loading) {
    return <div>Loading...</div>;
  }

  return currentUser && isAdmin() ? (
    <Outlet />
  ) : (
    <Navigate to="/unauthorized" />
  );
};

// Component for protecting routes that require staff or admin role
export const StaffRoute = () => {
  const { currentUser, loading, isAdmin, isStaff } = useContext(AuthContext);

  if (loading) {
    return <div>Loading...</div>;
  }

  return currentUser && (isAdmin() || isStaff()) ? (
    <Outlet />
  ) : (
    <Navigate to="/unauthorized" />
  );
};