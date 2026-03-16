import React from 'react';

const AdminHeader = () => {
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0 sticky top-0 z-40">
      <div className="flex-1 max-w-md">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
          <input 
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border-gray-200 rounded-lg focus:ring-primary focus:border-primary text-sm" 
            placeholder="Pesquisar por aluno, professor ou disciplina..." 
            type="text"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors relative">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        <div className="h-8 w-px bg-gray-200"></div>
        
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-[#111318]">Ricardo Mendes</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Diretor Acadêmico</p>
          </div>
          <div 
            className="w-8 h-8 rounded-full border border-gray-200 bg-center bg-cover" 
            style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuA3xyzUT0qwIGDOphqRGHYX4EyBM-otjssLw2HlGkue3WnZ02N2oswbG1AQtbxP-A1Qq70XYSftQhJ3HazgTEgBepfFkFwGw6WjXxx5Bu5GCa04mnyZusjGp8Az_X3jXolk7S62yLjPLDQ8RsuEcR7RgfPloVx8cGM-jkng87lmU17jXs9kXvRzjZbb0mkJwk4v7WgSdTHYt1ovFyDAUm6LD8anQTLYgFU1O_mFb6103utxyvJZS8M6nAohnxGhPKKRfDtItwBzWyAe")' }}>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
