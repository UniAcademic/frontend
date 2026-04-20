import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProfessorLayout from '@/layouts/ProfessorLayout';
import ProfessorDashboard from '@/pages/professor/Dashboard';
import ProfessorCurso from '@/pages/professor/Curso';
import ProfessorTurma from '@/pages/professor/Turma';
import ProfessorDisciplinas from '@/pages/professor/Disciplinas';
import ProfessorFrequencia from '@/pages/professor/Frequencia';
import ProfessorNotas from '@/pages/professor/Notas';
import ProfessorHorario from '@/pages/professor/Horario';

const ProfessorRoutes = () => {
  return (
    <Routes>
      <Route element={<ProfessorLayout />}>
        <Route index element={<ProfessorDashboard />} />
        <Route path="curso/:id" element={<ProfessorCurso />} />
        <Route path="turma/:id" element={<ProfessorTurma />} />
        <Route path="disciplina/:id" element={<ProfessorDisciplinas />} />
        <Route path="disciplina/:id/frequencia" element={<ProfessorFrequencia />} />
        <Route path="aula/:id" element={<ProfessorNotas />} />
        <Route path="horario" element={<ProfessorHorario />} />
      </Route>
    </Routes>
  );
};

export default ProfessorRoutes;
