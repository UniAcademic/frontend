import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const Schedule = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState('Segunda');
  const [viewMode, setViewMode] = useState('Semanal');
  const { user: authUser } = useAuth();

  const isProfessor = pathname.includes('/professor');

  useEffect(() => {
    if (!authUser) return;

    const fetchData = async () => {
      try {
        const scheduleData = await api.getSchedule(isProfessor ? 'PROFESSOR' : 'ALUNO', authUser.id);
        
        setData({
          schedule: scheduleData,
          user: authUser
        });
      } catch (error) {
        console.error("Erro ao carregar dados do calendário:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isProfessor, authUser]);

  if (loading || !data) {
    return (
      <div className="bg-[#f8f9fa] dark:bg-[#0B0F19] min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#F59E0B] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const { schedule, user } = data;

  const days = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];

  // Helper to get items sorted by time for List view
  const allItemsSorted = [...schedule].sort((a, b) => {
    const dayIndexA = days.indexOf(a.day);
    const dayIndexB = days.indexOf(b.day);
    if (dayIndexA !== dayIndexB) return dayIndexA - dayIndexB;
    return a.time.localeCompare(b.time);
  });

  const times = ["08:00", "10:00", "12:00", "14:00", "19:00"];

  return (
    <div className="bg-[#f8f9fa] dark:bg-[#0B0F19] min-h-screen font-sans text-slate-900 dark:text-white pb-16 w-full">
      <main className="max-w-[1400px] mx-auto px-6 py-10 flex flex-col gap-8">
        
        {/* Page Header Area */}
        <div className="flex flex-col gap-6">
           <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
              {viewMode === 'Semanal' ? 'Grade Semanal' : viewMode === 'Diário' ? 'Grade Diária' : 'Lista Interativa'}
           </h1>
           <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              {/* Left Side: Badges */}
              <div className="flex gap-4">
                <div className="bg-white dark:bg-[#1A2235] border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-xl flex items-center gap-3 shadow-sm">
                   <span className="text-[11px] font-black uppercase tracking-widest text-[#F59E0B]">
                      {isProfessor ? 'Departamento' : 'Curso'}
                   </span>
                   <span className="text-[11px] font-black uppercase tracking-widest text-slate-700 dark:text-white">
                      {isProfessor ? (user.department || "Ciência da Computação") : (user.curso || "Ciência da Computação")}
                   </span>
                </div>
                <div className="bg-white dark:bg-[#1A2235] border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-xl flex items-center gap-3 shadow-sm">
                   <span className="text-[11px] font-black uppercase tracking-widest text-[#F59E0B]">Período</span>
                   <span className="text-[11px] font-black uppercase tracking-widest text-slate-700 dark:text-white">2024.1</span>
                </div>
              </div>
              
              {/* Right Side: View Switcher */}
              <div className="flex bg-white dark:bg-[#1A2235] p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm self-stretch md:self-auto">
                {['Semanal', 'Diário', 'Lista'].map(mode => (
                  <button 
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all ${viewMode === mode ? 'bg-[#F59E0B] text-[#020617] shadow-md' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
           </div>
        </div>

        {/* View Content */}
        {viewMode === 'Semanal' && (
          <div className="flex flex-col pt-4">
            
            {/* Grid Header (Days) */}
            <div className="grid grid-cols-[100px_repeat(5,1fr)] gap-2 mb-2">
               <div></div> {/* Empty top-left cell */}
               {days.map(day => (
                 <h3 key={day} className={`text-[10px] font-black uppercase tracking-[0.2em] text-center ${day === 'Hoje' ? 'text-[#F59E0B]' : 'text-slate-500 dark:text-slate-300'}`}>
                   {day}
                 </h3>
               ))}
            </div>

            {/* Grid Body */}
            <div className="flex flex-col gap-1">
               {times.map((time, tIdx) => (
                 <div key={time} className="grid grid-cols-[100px_repeat(5,1fr)] gap-2">
                    {/* Time Label */}
                    <div className="flex items-start justify-end pt-3 pr-4">
                       <span className="text-[14px] font-black text-slate-500 dark:text-slate-400">{time}</span>
                    </div>
                    
                    {/* Day Cells */}
                    {days.map(day => {
                       const item = schedule.find(s => s.day === day && s.time === time);
                       if (item) {
                          return (
                            <div key={`${day}-${time}`} className={`bg-white dark:bg-[#020617] border ${item.isActive ? 'border-slate-300 dark:border-slate-700 shadow-sm dark:shadow-[0_0_15px_rgba(245,158,11,0.1)]' : 'border-slate-200 dark:border-slate-800'} rounded-xl p-3 flex flex-col justify-between min-h-[100px] relative group hover:border-[#F59E0B]/50 transition-colors cursor-pointer`}>
                               
                               {item.isActive && <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-[#F59E0B] shadow-[0_0_8px_rgba(245,158,11,0.8)]"></div>}

                               <div className="flex flex-col gap-1">
                                  <div className="flex items-center gap-2">
                                     <span className="text-[8px] font-black uppercase tracking-widest text-[#F59E0B]">{item.code}</span>
                                     {item.isEAD && (
                                        <span className="bg-[#F59E0B]/20 text-[#F59E0B] px-1 py-0.5 rounded text-[7px] font-black tracking-widest">EAD</span>
                                     )}
                                  </div>
                                  <h4 className="text-[13px] font-black text-slate-800 dark:text-slate-100 leading-tight uppercase">
                                     {item.title}
                                  </h4>
                               </div>

                               <div className="flex flex-col gap-1 mt-2">
                                  <div className="flex items-center gap-1.5 text-slate-400">
                                     <span className="material-symbols-outlined text-[12px]">location_on</span>
                                     <span className="text-[9px] font-bold uppercase tracking-widest truncate">
                                        {item.room}
                                     </span>
                                  </div>
                                  {!isProfessor && (
                                    <div className="flex items-center gap-1.5 text-slate-400">
                                       <span className="material-symbols-outlined text-[12px]">person</span>
                                       <span className="text-[9px] font-bold uppercase tracking-widest truncate">
                                          {item.professor}
                                       </span>
                                    </div>
                                  )}
                               </div>
                            </div>
                          );
                       } else {
                          // Empty slot
                          return (
                            <div key={`${day}-${time}`} className="border border-dashed border-slate-300 dark:border-slate-800/50 rounded-xl flex items-center justify-center min-h-[100px] opacity-20 hover:opacity-40 transition-opacity">
                               <span className="material-symbols-outlined text-xl text-slate-500">block</span>
                            </div>
                          );
                       }
                    })}
                 </div>
               ))}
            </div>
            
            {/* Footer Legend */}
            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
               <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                     <span className="w-2 h-2 rounded-full bg-[#F59E0B]"></span>
                     <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Aula em Andamento</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <span className="w-2 h-2 border border-dashed border-slate-400 rounded-sm"></span>
                     <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Horário Vago</span>
                  </div>
               </div>
               
               <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest text-slate-400">
                  <span>Grade Consolidada - 2024</span>
                  <span className="text-[#F59E0B]">•</span>
                  <span>Última Atualização: Hoje 08:30</span>
               </div>
            </div>

          </div>
        )}

        {/* Adapted Daily View */}
        {viewMode === 'Diário' && (
          <div className="flex flex-col gap-8 max-w-[800px] mx-auto w-full pt-4">
            <div className="flex overflow-x-auto pb-4 gap-3 no-scrollbar">
               {days.map(day => (
                  <button 
                    key={day}
                    onClick={() => setActiveDay(day)}
                    className={`flex-none px-8 py-3 rounded-lg border text-[10px] font-black uppercase tracking-widest transition-all ${activeDay === day ? 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 dark:bg-[#1A2235] dark:border-slate-800 dark:text-slate-400 dark:hover:border-slate-700'}`}
                  >
                    {day}
                  </button>
               ))}
            </div>

            <div className="flex flex-col gap-6 relative">
              {/* Timeline line */}
              <div className="absolute left-[87px] top-4 bottom-4 w-0.5 bg-slate-200 dark:bg-slate-800 hidden sm:block"></div>
              
              {schedule.filter(item => item.day === activeDay).map((item, idx) => (
                  <div key={item.id} className="relative flex flex-col sm:flex-row gap-4 sm:gap-6 sm:items-start group">
                    {/* Time node */}
                    <div className="sm:w-24 sm:pt-1 sm:text-right shrink-0 relative z-10 flex items-center sm:block">
                        <span className="text-xl font-black text-[#F59E0B] tracking-tight pr-4">{item.time}</span>
                    </div>

                    {/* Timeline dot */}
                    <div className={`hidden sm:block absolute left-[83px] top-3.5 w-[10px] h-[10px] rounded-full z-10 ${item.isActive ? 'bg-[#F59E0B] shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'bg-slate-300 dark:bg-slate-600'} border-2 border-[#f8f9fa] dark:border-[#0B0F19]`}></div>

                    {/* Content Card */}
                    <div className={`flex-1 bg-white dark:bg-[#020617] border ${item.isActive ? 'border-[#F59E0B]/30 shadow-sm' : 'border-slate-200 dark:border-slate-800'} p-6 rounded-2xl relative hover:shadow-md hover:border-[#F59E0B]/50 transition-all`}>
                      
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex flex-col gap-1">
                           <div className="flex items-center gap-2 mb-1">
                              <span className="text-[10px] font-black uppercase tracking-widest text-[#F59E0B]">{item.code}</span>
                              {item.isEAD && <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-300 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest">EAD</span>}
                           </div>
                           <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">{item.title}</h4>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-4 border-t border-slate-100 dark:border-slate-800/50">
                        <div className="flex items-center gap-2">
                           <span className="material-symbols-outlined text-[16px] text-slate-400">location_on</span>
                           <div className="flex flex-col">
                              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">Local</span>
                              <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">{item.room}</span>
                           </div>
                        </div>
                        {!isProfessor && (
                          <>
                            <div className="hidden sm:block w-px h-6 bg-slate-200 dark:bg-slate-700"></div>
                            <div className="flex items-center gap-2">
                               <span className="material-symbols-outlined text-[16px] text-slate-400">person</span>
                               <div className="flex flex-col">
                                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">Docente</span>
                                  <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">{item.professor}</span>
                               </div>
                            </div>
                          </>
                        )}
                      </div>

                    </div>
                  </div>
              ))}
              {schedule.filter(item => item.day === activeDay).length === 0 && (
                  <div className="py-24 text-center bg-white dark:bg-[#020617] rounded-2xl border border-slate-200 dark:border-slate-800 border-dashed flex flex-col items-center gap-4">
                     <span className="material-symbols-outlined text-4xl text-slate-400">calendar_today</span>
                     <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">Nenhuma atividade para este dia.</p>
                  </div>
              )}
            </div>
          </div>
        )}

        {/* Adapted List View */}
        {viewMode === 'Lista' && (
          <div className="max-w-[1000px] mx-auto w-full flex flex-col gap-6 pt-4">
            
            <div className="bg-white dark:bg-[#1A2235] px-6 py-4 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between items-center shadow-sm">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Fluxo Contínuo de Aulas</span>
               <span className="text-[10px] font-black text-[#F59E0B] uppercase tracking-widest">{schedule.length} ATIVIDADES</span>
            </div>

            <div className="flex flex-col gap-4">
              {allItemsSorted.map((item, idx) => (
                <div key={idx} className={`bg-white dark:bg-[#020617] border ${item.isActive ? 'border-[#F59E0B]/30' : 'border-slate-200 dark:border-slate-800'} rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md hover:border-[#F59E0B]/50 transition-all group cursor-pointer`}>
                  
                  <div className="flex items-start md:items-center gap-6">
                    <div className="w-16 h-16 rounded-xl bg-slate-50 dark:bg-[#1A2235] border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center shrink-0 shadow-sm">
                      <span className="text-[11px] font-black text-[#F59E0B] uppercase leading-none mb-1 tracking-widest">{item.day.substring(0, 3)}</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.time}</span>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                       <div className="flex items-center gap-2">
                          <span className="text-[9px] font-black text-[#F59E0B] uppercase tracking-widest">{item.code}</span>
                          <h4 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">{item.title}</h4>
                       </div>
                       <div className="flex items-center gap-4 text-slate-400">
                         <span className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                           <span className="material-symbols-outlined text-[14px]">location_on</span>
                           {item.room}
                         </span>
                         {!isProfessor && (
                           <span className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 border-l border-slate-700 pl-4">
                             {item.professor}
                           </span>
                         )}
                       </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 px-4 md:px-0 opacity-0 group-hover:opacity-100 transition-opacity">
                     <span className="text-[10px] font-black text-[#F59E0B] uppercase tracking-widest hover:underline flex items-center gap-1">
                        Acessar Área <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                     </span>
                  </div>

                </div>
              ))}
            </div>
            
          </div>
        )}

      </main>
    </div>
  );
};

export default Schedule;
