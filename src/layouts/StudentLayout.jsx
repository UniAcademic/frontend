import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import { useAuth } from '../contexts/AuthContext';

const StudentLayout = () => {
  const { user } = useAuth();
  
  const navItems = [
    { label: 'DASHBOARD', path: '/student' },
    { label: 'MEU BOLETIM', path: '/student/boletim' },
    { label: 'HORÁRIO', path: '/student/horario' },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#020617] font-display text-slate-900 dark:text-white flex-col">
      <Header 
        user={user} 
        role="ALUNO" 
        navItems={navItems} 
      />
      <main className="flex-1 w-full max-w-[1400px] mx-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default StudentLayout;
