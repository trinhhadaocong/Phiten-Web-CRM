import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AccessDenied from './AccessDenied';

const ProtectedRoute = ({ children, permission, role }) => {
  const { isAuthenticated, hasPermission, hasRole } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (permission && !hasPermission(permission)) {
    return <AccessDenied />;
  }

  if (role && !hasRole(role)) {
    return <AccessDenied />;
  }

  return children;
};

export default ProtectedRoute;
