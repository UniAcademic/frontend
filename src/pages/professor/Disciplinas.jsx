import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const ProfessorDisciplinas = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const details = await api.getDisciplinaDetails(parseInt(id));
        const dashboardData = await api.getProfessorDashboard(user.id);
        
        if (!details || !details.disciplina) {
          throw new Error("Disciplina não encontrada");
        }

        setData({
          ...details,
          professor: dashboardData?.professor || user
        });
      } catch (error) {
        console.error("Error fetching disciplina details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, user]);

  if (loading || !data) {
    return (
      <div className="bg-[#f8f9fa] dark:bg-[#0B0F19] min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-[#F59E0B] border-t-transparent rounded-full animate-spin"></div>
          {!loading && !data && <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Erro ao carregar dados. Verifique a URL.</p>}
        </div>
      </div>
    );
  }

  const { disciplina, turma, aulas, materiais, alunos, professor } = data;

  return (
    <div className="bg-[#f8f9fa] dark:bg-[#0B0F19] min-h-screen font-sans pb-16">
      
      {/* Breadcrumb Area */}
      <div className="max-w-[1200px] mx-auto px-6 pt-6 -mb-4 flex items-center gap-2 text-[10px] uppercase tracking-widest font-black text-slate-500">
          <Link to="/professor" className="hover:text-slate-900 dark:hover:text-white transition-colors">MEUS CURSOS</Link>
          <span className="text-slate-300 dark:text-slate-700">/</span>
          <Link to={`/professor/turma/${turma.id}`} className="hover:text-slate-900 dark:hover:text-white transition-colors">{turma.name}</Link>
          <span className="text-slate-300 dark:text-slate-700">/</span>
          <span className="text-slate-900 dark:text-white">{disciplina.name}</span>
      </div>

      <main className="max-w-[1200px] mx-auto px-6 py-8 flex flex-col gap-6">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{disciplina.name} ({disciplina.code})</h1>
            <p className="text-[10px] font-black uppercase tracking-widest text-[#F59E0B] mt-1">
              {turma.semester} • {turma.name} • {turma.shift}
            </p>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button className="flex-1 md:flex-none uppercase text-[11px] font-bold tracking-widest text-slate-700 dark:text-slate-300 bg-white dark:bg-[#1A2235] border border-slate-200 dark:border-slate-800 py-2.5 px-4 rounded flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm">
              <span className="material-symbols-outlined text-[16px]">equalizer</span>
              ANALYTICS B.I.
            </button>
            <button className="flex-1 md:flex-none uppercase text-[11px] font-bold tracking-widest text-[#020617] bg-[#F59E0B] hover:bg-[#D97706] py-2.5 px-4 rounded flex items-center justify-center gap-2 transition-colors shadow-sm">
              <span className="material-symbols-outlined text-[16px]">add</span>
              PLANEJAR AULA
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
          
          <div className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-5">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">MÉDIA DA TURMA</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-1.5 py-0.5 rounded">+2.1%</span>
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white mb-4">7.8 <span className="text-sm font-bold text-slate-400">/ 10</span></p>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-slate-900 dark:bg-[#F59E0B] h-full" style={{ width: '78%' }}></div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-5">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">FREQUÊNCIA MÉDIA</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-red-500 bg-red-50 dark:bg-red-900/20 px-1.5 py-0.5 rounded">-0.5%</span>
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white mb-4">92%</p>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-teal-500 h-full" style={{ width: '92%' }}></div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-5">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">AULAS REALIZADAS</span>
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white mb-4">{aulas.filter(a => a.status === 'Realizada').length} <span className="text-sm font-bold text-slate-400">/ {aulas.length}</span></p>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-slate-900 dark:bg-white h-full" style={{ width: `${(aulas.filter(a => a.status === 'Realizada').length / aulas.length) * 100}%` }}></div>
            </div>
          </div>

          <div className="bg-[#020617] text-white border border-[#1E293B] rounded-xl shadow-sm p-5 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#F59E0B]">MATERIAIS DE APOIO</span>
              <span className="material-symbols-outlined text-slate-500 text-sm">folder_open</span>
            </div>
            <div>
               <p className="text-2xl font-black mb-1">{materiais.length}</p>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ARQUIVOS CONSOLIDADOS</p>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Lessons Column */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">CRONOGRAMA DE AULAS</h2>
              <button className="text-[10px] font-black uppercase tracking-widest text-[#F59E0B] hover:underline">Ver semestre completo</button>
            </div>

            <div className="space-y-4">
              {aulas.map((aula) => (
                <div key={aula.id} className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden hover:border-[#F59E0B]/50 transition-colors flex group">
                  <div className={`w-[80px] shrink-0 border-r border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-[#0B0F19]`}>
                    <p className="text-[9px] font-black text-slate-400 uppercase leading-none mb-1">{aula.date.split('-')[1]}/{aula.date.split('-')[2]}</p>
                    <p className="text-lg font-black text-slate-900 dark:text-white leading-none">A{aula.id}</p>
                  </div>
                  <div className="p-5 flex-1 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-sm ${aula.status === 'Realizada' ? 'bg-slate-100 dark:bg-slate-800 text-slate-500' : 'bg-[#F59E0B] text-[#020617]'}`}>
                           {aula.status}
                        </span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{aula.type}</span>
                      </div>
                      <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">{aula.title}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                       <button 
                         onClick={() => navigate(`/professor/aula/${aula.id}`)}
                         className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                       >
                         DETALHES
                       </button>
                       <button className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-[#020617] rounded text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors">
                         FREQUÊNCIA
                       </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Students Sidebar Column */}
          <div className="flex flex-col gap-6">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">GESTÃO DE ALUNOS</h2>
            
            <div className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
               <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">RANKING DE PERFORMANCE</span>
                  <span className="material-symbols-outlined text-slate-400 text-sm">sort</span>
               </div>
               <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {alunos.map((aluno) => (
                    <div key={aluno.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors group cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden shrink-0">
                          <img src={aluno.avatar} alt={aluno.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{aluno.name}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">RA: {aluno.ra}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-xs font-black ${aluno.nota >= 7 ? 'text-emerald-500' : 'text-red-500'}`}>{aluno.nota.toFixed(1)}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{aluno.faltas} FALTAS</p>
                      </div>
                    </div>
                  ))}
               </div>
               <div className="p-4 border-t border-slate-100 dark:border-slate-800">
                  <button className="w-full py-2.5 bg-slate-50 dark:bg-slate-800 rounded text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                    EXPEDIR RELATÓRIO CONSOLIDADO
                  </button>
               </div>
            </div>

            {/* Micro Metrics Placeholder */}
            {alunos && alunos.length > 0 && (
              <div className="bg-[#F59E0B] p-6 rounded-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 opacity-20">
                    <span className="material-symbols-outlined text-4xl">emoji_events</span>
                </div>
                <h4 className="text-[10px] font-black text-[#020617] uppercase tracking-widest mb-1">DESTAQUE PERFORMANCE</h4>
                <p className="text-xl font-black text-[#020617] leading-tight mb-4">{alunos[0].name}</p>
                <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black px-2 py-0.5 bg-[#020617] text-white rounded-sm">TOP 1</span>
                    <span className="text-[9px] font-black text-[#020617] tracking-widest">SCORE: {alunos[0].nota.toFixed(1)}</span>
                </div>
              </div>
            )}
          </div>

        </div>

      </main>
    </div>
  );
};

export default ProfessorDisciplinas;
