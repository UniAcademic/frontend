import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

const ProfessorCurso = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const dashboardData = await api.getProfessorDashboard(user.id);
        const professor = dashboardData?.professor || user;
        
        const allTurmas = await api.getTurmasAdmin();
        const turmasDoCurso = allTurmas.filter(t => Number(t.cursoId) === Number(id));
        
        const courseName = parseInt(id) === 1 ? "Ciência da Computação" : "Engenharia de Software";
        const courseCode = parseInt(id) === 1 ? "CC" : "ES";

        setData({
          professor,
          curso: { id: parseInt(id), name: courseName, code: courseCode },
          turmas: turmasDoCurso,
          stats: {
             totalStudents: "142",
             activeClasses: turmasDoCurso.length,
             avgGrade: "8.4",
             hoursWeek: "12h"
          }
        });
      } catch (error) {
        console.error("Error fetching course data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, user]);

  if (loading || !data) {
    return (
      <div className="bg-[#f8f9fa] dark:bg-[#0B0F19] min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#F59E0B] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-[#f8f9fa] dark:bg-[#0B0F19] min-h-screen font-sans overflow-y-auto overflow-x-hidden">
      
      {/* Breadcrumb Area */}
      <div className="max-w-[1200px] mx-auto px-6 pt-6 -mb-4 flex items-center gap-3">
        <Link to="/professor" className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">MEUS CURSOS</Link>
        <span className="text-slate-300 dark:text-slate-700">›</span>
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white">{data.curso.name}</span>
      </div>

      <main className="max-w-[1200px] mx-auto px-6 py-10 flex flex-col gap-8">
        
        {/* Title & Actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{data.curso.name}</h1>
            <div className="flex items-center gap-3 mt-3">
              <span className="bg-[#0B0F19] dark:bg-white text-white dark:text-[#0B0F19] text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded">CÓDIGO: {data.curso.code}</span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">SEMESTRE ATUAL</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
            <button className="flex-1 md:flex-none uppercase text-[11px] font-bold tracking-widest text-slate-700 dark:text-slate-300 bg-white dark:bg-[#1A2235] border border-slate-200 dark:border-slate-800 py-3 px-6 rounded flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm">
              <span className="material-symbols-outlined text-[16px]">description</span>
              PLANO DE ENSINO
            </button>
            <button className="flex-1 md:flex-none uppercase text-[11px] font-bold tracking-widest text-[#0B0F19] bg-[#F59E0B] hover:bg-[#D97706] py-3 px-6 rounded flex items-center justify-center gap-2 transition-colors shadow-sm">
              <span className="material-symbols-outlined text-[18px]">add</span>
              NOVA ATIVIDADE
            </button>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-xl p-8 shadow-sm">
          <div className="flex items-center border-l-4 border-[#F59E0B] pl-4 mb-8">
            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium italic leading-relaxed">
              Resumo geral do curso englobando todas as turmas ativas sob sua supervisão neste semestre letivo.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded bg-slate-900 dark:bg-white text-[#F59E0B] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined">group</span>
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">ALUNOS MATRICULADOS</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white leading-none mt-1">{data.stats.totalStudents}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded bg-slate-900 dark:bg-white text-[#F59E0B] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined">grid_view</span>
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">TURMAS ATIVAS</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white leading-none mt-1">{data.stats.activeClasses}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded bg-slate-900 dark:bg-white text-[#F59E0B] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined">bar_chart</span>
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">MÉDIA GERAL (N1)</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white leading-none mt-1">{data.stats.avgGrade}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded bg-slate-900 dark:bg-white text-[#F59E0B] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined">schedule</span>
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">CARGA HORÁRIA TOTAL</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white leading-none mt-1">{data.stats.hoursWeek}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Classes Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mt-6 border-b border-transparent">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">TURMAS VINCULADAS</h2>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:flex-none">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
              <input 
                type="text" 
                placeholder="BUSCAR TURMA..." 
                className="w-full md:w-[240px] bg-white dark:bg-[#1A2235] text-slate-900 dark:text-white placeholder-slate-400 pl-10 pr-4 py-2.5 rounded text-[11px] font-bold uppercase tracking-widest border border-slate-200 dark:border-slate-800 focus:ring-1 focus:ring-[#F59E0B] outline-none transition-shadow"
              />
            </div>
          </div>
        </div>

        {/* Grid of Class Groups */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {data.turmas.map((turma, idx) => {
            const isOnline = turma.shift === "EAD" || turma.location === "Online";
            return (
              <div key={turma.id} className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden flex flex-col hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                <div className={`h-32 ${isOnline ? 'bg-[#475569]' : 'bg-[#1A2235]'} relative overflow-hidden flex items-start justify-start p-4 border-b border-slate-200 dark:border-slate-800`}>
                  <div className="absolute inset-0 opacity-10 [background-image:linear-gradient(to_right,#ffffff12_1px,transparent_1px),linear-gradient(to_bottom,#ffffff12_1px,transparent_1px)] [background-size:16px_16px]"></div>
                  <span className={`${isOnline ? 'bg-orange-900/80 text-orange-400 border-orange-800' : 'bg-emerald-900/80 text-emerald-400 border-emerald-800'} border text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded backdrop-blur-sm z-10`}>
                    {isOnline ? 'REMOTO / EAD' : 'PRESENCIAL'}
                  </span>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight mb-5">{turma.name} - {turma.shift}</h3>
                  
                  <div className="space-y-4 mb-8 flex-1">
                    <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                      <span className="material-symbols-outlined text-[#F59E0B] text-[18px]">calendar_today</span>
                      <span className="font-bold text-xs uppercase tracking-widest">{turma.semester}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                      <span className="material-symbols-outlined text-[#F59E0B] text-[18px]">{isOnline ? 'videocam' : 'location_on'}</span>
                      <span className="font-bold text-xs uppercase tracking-widest">{turma.location}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex -space-x-2">
                      <img className="w-8 h-8 rounded border-2 border-white dark:border-[#0B0F19] object-cover" src={`https://i.pravatar.cc/150?img=${11 + idx}`} alt="student" />
                      <div className="w-8 h-8 rounded border-2 border-white dark:border-[#0B0F19] bg-slate-900 dark:bg-slate-700 text-white flex items-center justify-center text-[10px] font-bold z-10">+38</div>
                    </div>
                    <button 
                      onClick={() => navigate(`/professor/turma/${turma.id}`)}
                      className="uppercase text-[10px] font-black tracking-widest bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 py-2.5 px-6 rounded transition-colors"
                    >
                      ACESSAR DISCIPLINA
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

        </div>

      </main>
    </div>
  );
};

export default ProfessorCurso;
