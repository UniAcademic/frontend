import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';

const roleRedirects = {
  admin: '/admin',
  coordenador: '/coordenador',
  professor: '/professor',
  student: '/student'
};

const ProtectedRoute = ({ allowedRoles }) => {
  const { isAuthenticated, role, user, logout } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check token expiry
  if (user?.tokenExp) {
    const now = Math.floor(Date.now() / 1000);
    if (user.tokenExp < now) {
      logout();
      return <Navigate to="/login" replace />;
    }
  }

  // Enforce role-based access: only the exact role from JWT is allowed
  if (allowedRoles && !allowedRoles.includes(role)) {
    const redirectTo = roleRedirects[role] || '/login';
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
