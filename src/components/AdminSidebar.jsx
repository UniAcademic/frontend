import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const AdminSidebar = () => {
  const { user, logout } = useAuth();
  const role = user?.role || 'coordenador';
  const isAdmin = role === 'admin';
  const basePath = isAdmin ? '/admin' : '/coordenador';

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
          to={basePath} 
          end
          className={({ isActive }) => `flex items-center gap-3 px-4 py-2 transition-colors text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-accent' : 'text-slate-400 hover:text-accent'}`}
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
          <span className="text-sm font-medium">Dashboard</span>
        </NavLink>
        
        <NavLink 
          to={`${basePath}/alunos`} 
          className={({ isActive }) => `flex items-center gap-3 px-4 py-2 transition-colors text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-accent' : 'text-slate-400 hover:text-accent'}`}
        >
          <span className="material-symbols-outlined">group</span>
          <span className="text-sm font-medium">Alunos</span>
        </NavLink>
        
        <NavLink 
          to={`${basePath}/professores`} 
          className={({ isActive }) => `flex items-center gap-3 px-4 py-2 transition-colors text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-accent' : 'text-slate-400 hover:text-accent'}`}
        >
          <span className="material-symbols-outlined">person_pin_circle</span>
          <span className="text-sm font-medium">Professores</span>
        </NavLink>
        
        <NavLink 
          to={`${basePath}/turmas`} 
          className={({ isActive }) => `flex items-center gap-3 px-4 py-2 transition-colors text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-accent' : 'text-slate-400 hover:text-accent'}`}
        >
          <span className="material-symbols-outlined">class</span>
          <span className="text-sm font-medium">Turmas</span>
        </NavLink>
        
        <NavLink 
          to={`${basePath}/disciplinas`} 
          className={({ isActive }) => `flex items-center gap-3 px-4 py-2 transition-colors text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-accent' : 'text-slate-400 hover:text-accent'}`}
        >
          <span className="material-symbols-outlined">menu_book</span>
          <span className="text-sm font-medium">Disciplinas</span>
        </NavLink>

        {/* Admin-exclusive menu items */}
        {isAdmin && (
          <>
            <div className="pt-4 pb-2 px-4">
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-600">Sistema</span>
            </div>
            
            <NavLink 
              to={`${basePath}/usuarios`} 
              className={({ isActive }) => `flex items-center gap-3 px-4 py-2 transition-colors text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-accent' : 'text-slate-400 hover:text-accent'}`}
            >
              <span className="material-symbols-outlined">manage_accounts</span>
              <span className="text-sm font-medium">Usuários</span>
            </NavLink>
            
            <NavLink 
              to={`${basePath}/roles`} 
              className={({ isActive }) => `flex items-center gap-3 px-4 py-2 transition-colors text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-accent' : 'text-slate-400 hover:text-accent'}`}
            >
              <span className="material-symbols-outlined">admin_panel_settings</span>
              <span className="text-sm font-medium">Roles</span>
            </NavLink>
            
            <NavLink 
              to={`${basePath}/acessos`} 
              className={({ isActive }) => `flex items-center gap-3 px-4 py-2 transition-colors text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-accent' : 'text-slate-400 hover:text-accent'}`}
            >
              <span className="material-symbols-outlined">vpn_key</span>
              <span className="text-sm font-medium">Acessos</span>
            </NavLink>
          </>
        )}
      </nav>
      
      <div className="p-4 border-t border-slate-800">
        <NavLink 
          to={`${basePath}/configuracoes`} 
          className="flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-white rounded-lg transition-colors"
        >
          <span className="material-symbols-outlined">settings</span>
          <span className="text-sm font-medium">Configurações</span>
        </NavLink>
        
        <Link 
          to="/login" 
          onClick={(e) => { e.preventDefault(); logout(); }}
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
