import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Route Guard
import ProtectedRoute from './ProtectedRoute';

// Entity Routes
import AdminRoutes from './AdminRoutes';
import ProfessorRoutes from './ProfessorRoutes';
import StudentRoutes from './StudentRoutes';

// Auth Pages
import Login from '../pages/auth/Login';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Navigate to="/login" replace />} />
      <Route path="/forgot-password" element={<Navigate to="/login" replace />} />

      {/* Admin Routes */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route path="/admin/*" element={<AdminRoutes />} />
      </Route>

      {/* Professor Routes */}
      <Route element={<ProtectedRoute allowedRoles={['professor']} />}>
        <Route path="/professor/*" element={<ProfessorRoutes />} />
      </Route>

      {/* Student Routes */}
      <Route element={<ProtectedRoute allowedRoles={['student']} />}>
        <Route path="/student/*" element={<StudentRoutes />} />
      </Route>

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;
