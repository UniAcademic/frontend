import React from 'react';
import { Routes, Route } from 'react-router-dom';
import StudentLayout from '../layouts/StudentLayout';
import StudentDashboard from '../pages/student/Dashboard';
import StudentDisciplina from '../pages/student/Disciplina';
import StudentBoletim from '../pages/student/Boletim';
import StudentHorario from '../pages/student/Horario';

const StudentRoutes = () => {
  return (
    <Routes>
      <Route element={<StudentLayout />}>
        <Route index element={<StudentDashboard />} />
        <Route path="disciplina/:id" element={<StudentDisciplina />} />
        <Route path="boletim" element={<StudentBoletim />} />
        <Route path="horario" element={<StudentHorario />} />
      </Route>
    </Routes>
  );
};

export default StudentRoutes;
