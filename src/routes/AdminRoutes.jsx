import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminLayout from '@/layouts/AdminLayout';
import AdminDashboard from '@/pages/admin/Dashboard';
import AdminEntityList from '@/pages/admin/EntityList';
import AdminEntityForm from '@/pages/admin/EntityForm';
import AlunoForm from '@/pages/admin/AlunoForm';
import ProfessorForm from '@/pages/admin/ProfessorForm';
import CoordenadorForm from '@/pages/admin/CoordenadorForm';

// Admin-exclusive pages (system management)
import Usuarios from '@/pages/administrador/Usuarios';
import Roles from '@/pages/administrador/Roles';
import Acessos from '@/pages/administrador/Acessos';
import Perfil from '@/pages/shared/Perfil';

const AdminRoutes = () => {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        {/* Academic pages (shared with coordenador) */}
        <Route path="alunos" element={<AdminEntityList entityType="alunos" />} />
        <Route path="alunos/novo" element={<AlunoForm />} />
        <Route path="alunos/editar/:id" element={<AlunoForm />} />
        <Route path="professores" element={<AdminEntityList entityType="professores" />} />
        <Route path="professores/novo" element={<ProfessorForm />} />
        <Route path="professores/editar/:id" element={<ProfessorForm />} />
        <Route path="coordenadores" element={<AdminEntityList entityType="coordenadores" />} />
        <Route path="coordenadores/novo" element={<CoordenadorForm />} />
        <Route path="coordenadores/editar/:id" element={<CoordenadorForm />} />
        <Route path="turmas" element={<AdminEntityList entityType="turmas" />} />
        <Route path="turmas/novo" element={<AdminEntityForm entityType="turmas" mode="create" />} />
        <Route path="turmas/editar/:id" element={<AdminEntityForm entityType="turmas" mode="edit" />} />
        <Route path="disciplinas" element={<AdminEntityList entityType="disciplinas" />} />
        <Route path="disciplinas/novo" element={<AdminEntityForm entityType="disciplinas" mode="create" />} />
        <Route path="disciplinas/editar/:id" element={<AdminEntityForm entityType="disciplinas" mode="edit" />} />
        {/* Admin-exclusive pages (system management) */}
        <Route path="usuarios" element={<Usuarios />} />
        <Route path="roles" element={<Roles />} />
        <Route path="acessos" element={<Acessos />} />
        <Route path="perfil" element={<Perfil />} />
      </Route>
    </Routes>
  );
};

export default AdminRoutes;
