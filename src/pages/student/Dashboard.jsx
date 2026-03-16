import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const StudentDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const studentData = await api.getStudentDashboard(user.id);
        setData(studentData);
      } catch (error) {
        console.error("Error fetching student dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading || !data) {
    return (
      <div className="bg-[#f8f9fa] dark:bg-[#0B0F19] min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#F59E0B] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const { aluno, cra, semestre, disciplinas } = data;

  return (
    <div className="bg-[#f8f9fa] dark:bg-[#0B0F19] min-h-screen font-sans pb-16">
      <main className="max-w-[1400px] mx-auto px-6 py-10 flex flex-col gap-10">
        
        {/* Welcome Area */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
           <div>
              <h1 className="text-4xl font-black uppercase tracking-tight text-slate-900 dark:text-white">PORTAL DO ALUNO</h1>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#F59E0B] mt-2">
                 BEM-VINDO, {aluno.name} • {semestre} • STATUS: {aluno.status}
              </p>
           </div>
           
           <div className="flex items-center gap-10 bg-white dark:bg-[#020617] border border-slate-200 dark:border-slate-800 px-8 py-4 rounded-xl shadow-sm">
              <div className="text-center">
                 <p className="text-[9px] font-black tracking-widest text-slate-400 uppercase mb-1">CRA ATUAL</p>
                 <p className="text-2xl font-black text-slate-900 dark:text-white">{cra}</p>
              </div>
              <div className="w-px h-8 bg-slate-100 dark:bg-slate-800"></div>
              <div className="text-center">
                 <p className="text-[9px] font-black tracking-widest text-slate-400 uppercase mb-1">DISCIPLINAS ATIVAS</p>
                 <p className="text-2xl font-black text-slate-900 dark:text-white">{disciplinas.length}</p>
              </div>
           </div>
        </div>

        {/* Dashboard 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
           
           {/* Lateral Menu / Actions - 3/12 Columns */}
           <div className="lg:col-span-3 flex flex-col gap-6">
              
              <div className="flex flex-col gap-3">
                 <h2 className="text-xs font-black uppercase tracking-[0.20em] text-slate-500 mb-2">AÇÕES RÁPIDAS</h2>
                 
                 <button 
                   onClick={() => navigate('/student/horario')}
                   className="w-full bg-[#020617] dark:bg-white text-white dark:text-[#020617] p-4 rounded-xl flex items-center gap-4 hover:bg-slate-900 dark:hover:bg-slate-100 transition-colors border border-transparent shadow-sm"
                 >
                    <div className="w-10 h-10 rounded bg-white/10 dark:bg-[#020617]/10 flex items-center justify-center">
                       <span className="material-symbols-outlined text-[#F59E0B]">calendar_month</span>
                    </div>
                    <div className="text-left">
                       <span className="block text-[11px] font-black uppercase tracking-widest">Ver Horário</span>
                       <span className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">Semanal e Diário</span>
                    </div>
                 </button>

                 <button 
                   onClick={() => navigate('/student/boletim')}
                   className="w-full bg-white dark:bg-[#020617] p-4 rounded-xl flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors border border-slate-200 dark:border-slate-800"
                 >
                    <div className="w-10 h-10 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                       <span className="material-symbols-outlined text-slate-600 dark:text-slate-300">description</span>
                    </div>
                    <div className="text-left">
                       <span className="block text-[11px] font-black uppercase tracking-widest text-slate-900 dark:text-white">Notas & Faltas</span>
                       <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Meu Boletim</span>
                    </div>
                 </button>

                 <button className="w-full bg-white dark:bg-[#020617] p-4 rounded-xl flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors border border-slate-200 dark:border-slate-800">
                    <div className="w-10 h-10 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                       <span className="material-symbols-outlined text-slate-600 dark:text-slate-300">menu_book</span>
                    </div>
                    <div className="text-left">
                       <span className="block text-[11px] font-black uppercase tracking-widest text-slate-900 dark:text-white">Ementas</span>
                       <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Plano de Ensino</span>
                    </div>
                 </button>

                 <button className="w-full bg-white dark:bg-[#020617] p-4 rounded-xl flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors border border-slate-200 dark:border-slate-800">
                    <div className="w-10 h-10 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                       <span className="material-symbols-outlined text-slate-600 dark:text-slate-300">groups</span>
                    </div>
                    <div className="text-left">
                       <span className="block text-[11px] font-black uppercase tracking-widest text-slate-900 dark:text-white">Teams / Lives</span>
                       <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Acesso Rápido</span>
                    </div>
                 </button>
              </div>

              {/* Atividades Recentes (Feed Lateral) */}
              <div className="flex flex-col gap-3 mt-4">
                 <h2 className="text-xs font-black uppercase tracking-[0.20em] text-slate-500 mb-2">ÚLTIMAS ATIVIDADES</h2>
                 
                 <div className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
                    <div className="p-4 flex items-start gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors cursor-pointer group">
                       <div className="w-8 h-8 shrink-0 rounded bg-[#F59E0B]/10 text-[#F59E0B] flex items-center justify-center">
                          <span className="material-symbols-outlined text-[18px]">assignment</span>
                       </div>
                       <div>
                          <p className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-tight leading-tight">Nova nota lançada</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Cálculo II • Há 2 horas</p>
                       </div>
                    </div>

                    <div className="p-4 flex items-start gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors cursor-pointer group">
                       <div className="w-8 h-8 shrink-0 rounded bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
                          <span className="material-symbols-outlined text-[18px]">folder</span>
                       </div>
                       <div>
                          <p className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-tight leading-tight">Material de aula</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Estruturas de Dados • 5h</p>
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           {/* Main Content Area / Grid de Disciplinas - 9/12 Columns */}
           <div className="lg:col-span-9 flex flex-col gap-6">
              
              <div className="flex justify-between items-center mb-2">
                 <h2 className="text-xs font-black uppercase tracking-[0.20em] text-slate-500">MINHAS DISCIPLINAS</h2>
                 <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">FILTRAR:</span>
                    <select className="text-[10px] font-black uppercase tracking-widest bg-white dark:bg-[#1A2235] border border-slate-200 dark:border-slate-800 py-1.5 px-3 rounded text-slate-700 dark:text-slate-300 outline-none focus:ring-1 focus:ring-[#F59E0B]">
                       <option>TURMA ATUAL (2024.1)</option>
                       <option>FALTAM CURSAR</option>
                    </select>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                 {disciplinas.map((disc, idx) => (
                    <div 
                      key={disc.id}
                      onClick={() => navigate(`/student/disciplina/${disc.id}`)}
                      className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden flex flex-col group hover:border-[#F59E0B]/50 transition-colors cursor-pointer"
                    >
                       <div className={`h-20 relative overflow-hidden border-b ${idx === 0 ? 'bg-slate-900 dark:bg-[#020617] border-[#F59E0B]' : 'bg-gradient-to-br from-slate-100 to-white dark:from-[#1A2235] dark:to-[#0B0F19] border-slate-200 dark:border-slate-800'}`}>
                          <div className={`absolute inset-0 opacity-20 [background-image:linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] [background-size:12px_12px]`}></div>
                          <div className="p-4 relative z-10 flex justify-between items-start">
                             <span className={`inline-block px-2 py-1 ${idx === 0 ? 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20' : 'bg-white/50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700'} text-[9px] font-black uppercase tracking-widest rounded-sm border backdrop-blur-sm`}>
                                CÓDIGO: {disc.code}
                             </span>
                          </div>
                          {idx === 0 && <div className="absolute top-0 right-0 w-16 h-16 bg-[#F59E0B]/10 rounded-bl-full"></div>}
                       </div>
                       
                       <div className="p-5 flex-1 flex flex-col relative">
                          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight leading-tight mb-4">
                             {disc.name}
                          </h3>
                          
                          <div className="flex-1">
                             <div className="flex justify-between items-end mb-2">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">SITUAÇÃO (NOTAS)</span>
                                <span className={`text-[12px] font-black ${typeof disc.nota === 'number' && disc.nota >= 7 ? 'text-emerald-500' : 'text-[#F59E0B]'}`}>
                                   {disc.nota || '-'}
                                </span>
                             </div>
                             <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mb-4">
                                <div className={`h-full ${typeof disc.nota === 'number' && disc.nota >= 7 ? 'bg-emerald-500' : 'bg-[#F59E0B]'}`} style={{ width: disc.nota ? `${(disc.nota / 10) * 100}%` : '0%' }}></div>
                             </div>
                          </div>
                          
                          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                             <div className="flex flex-col">
                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">FALTAS</span>
                                <span className="text-[11px] font-black text-slate-900 dark:text-white">{disc.faltas}</span>
                             </div>
                             <div className="w-px h-6 bg-slate-200 dark:bg-slate-700"></div>
                             <div className="flex flex-col items-end">
                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">TURMA</span>
                                <span className="text-[11px] font-black text-slate-900 dark:text-white">T191</span>
                             </div>
                          </div>
                          
                          <div className="mt-5 w-full uppercase text-[9px] font-black tracking-widest text-[#F59E0B] flex items-center justify-center gap-1 group-hover:text-[#D97706] transition-colors">
                             ACESSAR MATÉRIA <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                          </div>
                       </div>
                    </div>
                 ))}
              </div>
              
              <button className="mt-4 w-full py-4 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all">
                 VER HISTÓRICO COMPLETO
              </button>
           </div>
           
        </div>

      </main>
    </div>
  );
};

export default StudentDashboard;
