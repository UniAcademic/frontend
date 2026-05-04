import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const ROLE_LABELS = {
  admin: 'Administrador',
  coordenador: 'Coordenador',
  professor: 'Professor',
  student: 'Estudante',
};

const AdminHeader = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const basePath = user?.role === 'admin' ? '/admin' : `/${user?.role || 'coordenador'}`;

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0 sticky top-0 z-40">
      <div className="flex-1" />
      
      <div className="flex items-center gap-4">
        <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors relative">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        <div className="h-8 w-px bg-gray-200"></div>
        
        <button 
          onClick={() => navigate(`${basePath}/perfil`)}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer"
        >
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-[#111318]">{user?.name || 'Usuário'}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{ROLE_LABELS[user?.role] || 'Usuário'}</p>
          </div>
          <div 
            className="w-8 h-8 rounded-full border border-gray-200 bg-center bg-cover" 
            style={{ backgroundImage: `url("${user?.avatar || ''}")` }}>
          </div>
        </button>
      </div>
    </header>
  );
};

export default AdminHeader;
