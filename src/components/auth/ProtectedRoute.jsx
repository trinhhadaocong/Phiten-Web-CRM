import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AccessDenied from './AccessDenied';

const ProtectedRoute = ({ children, permission }) => {
  const { isAuthenticated, hasPermission } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login but save the current location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (permission && !hasPermission(permission)) {
    // If user is logged in but doesn't have permission
    return <AccessDenied />;
  }

  return children;
};

export default ProtectedRoute;
