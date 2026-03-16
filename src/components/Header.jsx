import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Logo from './Logo';
import { useAuth } from '../contexts/AuthContext';

const Header = ({ 
  user: initialUser, 
  role = 'ALUNO', 
  navItems = [], 
  showSearch = true,
  onLogout = null 
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user: authUser, logout } = useAuth();
  const menuRef = useRef(null);

  const user = initialUser || authUser;

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      logout();
      navigate('/login');
    }
  };

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  return (
    <header className="h-[72px] bg-[#020617] text-white flex items-center justify-between px-6 border-b border-[#1E293B] sticky top-0 z-50">
      <div className="flex items-center gap-10">
        <Link 
          to={role === 'PROFESSOR' ? '/professor' : '/student'} 
          className="hover:opacity-80 transition-opacity"
        >
          <Logo textColor="text-white" />
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item, idx) => (
            <Link 
              key={idx}
              to={item.path} 
              className={`text-[11px] font-black uppercase tracking-widest transition-colors ${
                window.location.pathname === item.path ? 'text-[#F59E0B]' : 'text-slate-400 hover:text-white'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-6">
        {showSearch && (
          <div className="relative hidden lg:block">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
            <input 
              type="text" 
              placeholder="Buscar..." 
              className="w-[240px] bg-[#1E293B] text-white placeholder-slate-400 pl-10 pr-4 py-1.5 rounded text-sm border-none focus:ring-1 focus:ring-[#F59E0B] outline-none transition-shadow"
            />
          </div>
        )}

        <button className="relative text-slate-400 hover:text-white transition-colors">
          <span className="material-symbols-outlined text-xl">notifications</span>
          <span className="absolute top-0 right-0 w-2 h-2 bg-[#F59E0B] rounded-full border border-[#020617]"></span>
        </button>

        <div className="relative" ref={menuRef}>
          <div 
            className="flex items-center gap-3 pl-4 border-l border-slate-800 cursor-pointer group"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <div className="text-right hidden sm:block">
              <p className="text-[10px] font-bold text-white leading-tight uppercase tracking-tight group-hover:text-[#F59E0B] transition-colors">
                {user.name}
              </p>
              <p className="text-[8px] font-black uppercase tracking-widest text-slate-500">
                {role === 'PROFESSOR' ? role : `RA: ${user.ra || '...'}`}
              </p>
            </div>
            <div className={`w-10 h-10 rounded-lg overflow-hidden border-2 transition-all ${isMenuOpen ? 'border-[#F59E0B] scale-95 shadow-lg shadow-[#F59E0B]/20' : 'border-slate-800 group-hover:border-slate-600'}`}>
              <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
            </div>
            <span className={`material-symbols-outlined text-slate-500 text-sm transition-transform duration-300 ${isMenuOpen ? 'rotate-180 text-[#F59E0B]' : ''}`}>
              keyboard_arrow_down
            </span>
          </div>

          {/* User Dropdown Menu */}
          {isMenuOpen && (
            <div className="absolute right-0 mt-3 w-48 bg-[#0B0F19] border border-[#1E293B] rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] py-2 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
               <div className="px-4 py-3 border-b border-[#1E293B] bg-[#020617]/50 mb-1">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">SESSÃO ATIVA</p>
                  <p className="text-[11px] font-bold text-white truncate">{user.name}</p>
               </div>
               
               <button className="w-full flex items-center gap-3 px-4 py-2.5 text-[11px] font-bold text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors uppercase tracking-widest">
                  <span className="material-symbols-outlined text-lg">person</span>
                  Meu Perfil
               </button>
               <button className="w-full flex items-center gap-3 px-4 py-2.5 text-[11px] font-bold text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors uppercase tracking-widest">
                  <span className="material-symbols-outlined text-lg">settings</span>
                  Configurações
               </button>
               
               <div className="h-px bg-[#1E293B] my-1"></div>
               
               <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-[11px] font-black text-red-500 hover:bg-red-500/10 transition-colors uppercase tracking-widest"
               >
                  <span className="material-symbols-outlined text-lg">logout</span>
                  Sair do Sistema
               </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
