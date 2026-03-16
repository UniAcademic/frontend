import React from 'react';
import { NavLink, Link } from 'react-router-dom';

const AdminSidebar = () => {
  return (
    <aside className="w-64 bg-[#020617] text-white flex flex-col shrink-0 fixed h-full z-50">
      <div className="p-6 flex items-center gap-2 cursor-pointer">
        <div className="w-8 h-8 rounded bg-accent flex items-center justify-center text-[#020617]">
          <span className="material-symbols-outlined text-xl">school</span>
        </div>
        <span className="font-black text-xl tracking-tighter uppercase italic">UniAcademic</span>
      </div>
      
      <nav className="flex-1 px-4 space-y-1">
        <NavLink 
          to="/admin" 
          end
          className={({ isActive }) => `flex items-center gap-3 px-4 py-2 transition-colors text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-accent' : 'text-slate-400 hover:text-accent'}`}
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
          <span className="text-sm font-medium">Dashboard</span>
        </NavLink>
        
        <NavLink 
          to="/admin/alunos" 
          className={({ isActive }) => `flex items-center gap-3 px-4 py-2 transition-colors text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-accent' : 'text-slate-400 hover:text-accent'}`}
        >
          <span className="material-symbols-outlined">group</span>
          <span className="text-sm font-medium">Alunos</span>
        </NavLink>
        
        <NavLink 
          to="/admin/professores" 
          className={({ isActive }) => `flex items-center gap-3 px-4 py-2 transition-colors text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-accent' : 'text-slate-400 hover:text-accent'}`}
        >
          <span className="material-symbols-outlined">person_pin_circle</span>
          <span className="text-sm font-medium">Professores</span>
        </NavLink>
        
        <NavLink 
          to="/admin/turmas" 
          className={({ isActive }) => `flex items-center gap-3 px-4 py-2 transition-colors text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-accent' : 'text-slate-400 hover:text-accent'}`}
        >
          <span className="material-symbols-outlined">class</span>
          <span className="text-sm font-medium">Turmas</span>
        </NavLink>
        
        <NavLink 
          to="/admin/disciplinas" 
          className={({ isActive }) => `flex items-center gap-3 px-4 py-2 transition-colors text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-accent' : 'text-slate-400 hover:text-accent'}`}
        >
          <span className="material-symbols-outlined">menu_book</span>
          <span className="text-sm font-medium">Disciplinas</span>
        </NavLink>
      </nav>
      
      <div className="p-4 border-t border-slate-800">
        <NavLink 
          to="/admin/configuracoes" 
          className="flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-white rounded-lg transition-colors"
        >
          <span className="material-symbols-outlined">settings</span>
          <span className="text-sm font-medium">Configurações</span>
        </NavLink>
        
        <Link 
          to="/login" 
          className="flex items-center gap-3 px-3 py-2 text-red-400 hover:text-red-500 rounded-lg transition-colors mt-1"
        >
          <span className="material-symbols-outlined">logout</span>
          <span className="text-sm font-medium">Sair</span>
        </Link>
      </div>
    </aside>
  );
};

export default AdminSidebar;
