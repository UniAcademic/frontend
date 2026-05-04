import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ROLE_HOME_ROUTES, ROUTES } from '@/config/routes.config';

const ProtectedRoute = ({ allowedRoles }) => {
  const { isAuthenticated, role, user, logout } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  // Check token expiry
  if (user?.tokenExp) {
    const now = Math.floor(Date.now() / 1000);
    if (user.tokenExp < now) {
      logout();
      return <Navigate to={ROUTES.LOGIN} replace />;
    }
  }

  // Enforce role-based access: only the exact role from JWT is allowed
  if (allowedRoles && !allowedRoles.includes(role)) {
    const redirectTo = ROLE_HOME_ROUTES[role] || ROUTES.LOGIN;
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
