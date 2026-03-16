import React from 'react';

const Logo = ({ className = "", textColor = "text-slate-900 dark:text-white" }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="w-10 h-10 rounded bg-accent flex items-center justify-center text-[#020617] shadow-[0_0_20px_rgba(245,158,11,0.2)] transition-transform hover:scale-105 duration-300">
        <span className="material-symbols-outlined text-2xl">insights</span>
      </div>
      <h1 className={`text-2xl font-black uppercase tracking-tighter italic ${textColor}`}>
        UniAcademic
      </h1>
    </div>
  );
};

export default Logo;

