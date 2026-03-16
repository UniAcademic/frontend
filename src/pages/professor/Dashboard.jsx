import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const ProfessorDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const dashboardData = await api.getProfessorDashboard(user.id);
        const disciplines = await api.getProfessorDisciplinas(user.id);
        
        // Group by course from actual discipline data
        const uniqueCourses = [];
        const seenCourseIds = new Set();
        
        disciplines.forEach(d => {
          if (d.turma && d.turma.cursoId && !seenCourseIds.has(d.turma.cursoId)) {
            seenCourseIds.add(d.turma.cursoId);
            uniqueCourses.push({
              id: d.turma.cursoId,
              name: d.turma.cursoName || "Curso Acadêmico",
              code: d.turma.cursoCode || "UNKN"
            });
          }
        });

        setData({
           professor: dashboardData?.professor || user,
           cursos: uniqueCourses,
           proximasAulas: dashboardData?.proximasAulas || [
             { id: 101, title: "Estruturas de Controle", time: "09:45:00", date: "HOJE", duration: "120MIN", type: "Prática", status: "EM ANDAMENTO", color: "#F59E0B" }
           ]
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
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

  return (
    <div className="bg-[#f8f9fa] dark:bg-[#0B0F19] min-h-screen font-sans">
      <main className="max-w-[1400px] mx-auto px-6 py-8 flex flex-col gap-8">
        
        {/* Page Header Area */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">PAINEL DO PROFESSOR</h1>
            <div className="flex items-center gap-2 mt-2 text-[10px] font-black uppercase tracking-[0.1em] text-slate-500">
              <span className="material-symbols-outlined text-[16px] text-[#F59E0B]">dashboard</span>
              <span>SEMESTRE ATIVO 2024.1 • TODAS AS TURMAS ONLINE</span>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button 
              onClick={() => navigate('/professor/horario')}
              className="flex-1 md:flex-none uppercase text-[11px] font-bold tracking-widest text-[#0B0F19] bg-[#F59E0B] hover:bg-[#D97706] py-3 px-5 rounded flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px]">calendar_month</span>
              MEU HORÁRIO COMPLETO
            </button>
          </div>
        </div>

        {/* Cronograma Resumido */}
        <div className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <h2 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500">
              <span className="material-symbols-outlined text-[16px]">schedule</span>
              CRONOGRAMA RESUMIDO (PRÓXIMAS AULAS)
            </h2>
            <Link to="/professor/horario" className="text-[10px] font-black text-slate-400 hover:text-[#F59E0B] uppercase tracking-widest flex items-center gap-1">
              VER HORÁRIO COMPLETO <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </Link>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {data.proximasAulas.map((aula, idx) => (
              <div key={aula.id} className={`flex flex-col md:flex-row p-6 relative ${idx > 0 ? 'opacity-70' : ''}`}>
                {idx === 0 && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#F59E0B]"></div>}
                
                <div className="w-[180px] shrink-0 mb-4 md:mb-0">
                  <span className={`text-[9px] font-black uppercase tracking-widest ${idx === 0 ? 'text-[#F59E0B]' : 'text-slate-400'}`}>STATUS: {aula.status}</span>
                  <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">{aula.time}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">DURAÇÃO: {aula.duration}</p>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-0.5 ${idx === 0 ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'} text-[10px] font-black uppercase tracking-widest rounded-sm`}>
                      {aula.type}
                    </span>
                    {idx === 0 && <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]"></span>}
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{aula.date}</span>
                  </div>
                  <h3 className={`text-xl font-bold ${idx === 0 ? 'text-slate-900 dark:text-white' : 'italic text-slate-800 dark:text-slate-200'} mb-2`}>
                    {aula.title}
                  </h3>
                  <button className="text-[10px] font-black uppercase tracking-widest text-[#F59E0B] hover:text-[#D97706]">
                    JUNTAR-SE À AULA (TEAMS)
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Meus Cursos */}
        <div className="pt-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-500">MEUS CURSOS</h2>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">FILTRAR POR:</span>
              <select className="text-[10px] font-black uppercase tracking-widest bg-white dark:bg-[#1A2235] border border-slate-200 dark:border-slate-800 py-2 px-3 rounded text-slate-700 dark:text-slate-300 outline-none focus:ring-1 focus:ring-[#F59E0B]">
                <option>SEMESTRE ATUAL</option>
                <option>TODOS OS SEMESTRES</option>
              </select>
            </div>
          </div>

          {data.cursos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {data.cursos.map((curso, idx) => (
                <div key={curso.id} className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden flex flex-col group hover:border-[#F59E0B]/50 transition-colors">
                  <div className={`h-24 relative overflow-hidden border-b ${idx === 0 ? 'bg-[#0B0F19] border-[#F59E0B]' : 'bg-gradient-to-br from-slate-200 to-slate-50 dark:from-[#1A2235] dark:to-[#0B0F19] border-slate-200 dark:border-slate-800'}`}>
                    <div className={`absolute inset-0 opacity-20 [background-image:linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] [background-size:12px_12px]`}></div>
                    <div className="p-4 relative z-10">
                      <span className={`inline-block px-2 py-1 ${idx === 0 ? 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20' : 'bg-white/50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700'} text-[9px] font-black uppercase tracking-widest rounded-sm border backdrop-blur-sm`}>
                        CÓDIGO: {curso.code}
                      </span>
                    </div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight mb-1">{curso.name}</h3>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-6">BACHARELADO PRESENCIAL</p>
                    
                    <div className="mb-6 flex-1">
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">ENGAJAMENTO DA TURMA</span>
                        <span className={`text-[11px] font-black ${idx === 0 ? 'text-[#F59E0B]' : 'text-teal-600 dark:text-teal-400'}`}>ALTO</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className={`${idx === 0 ? 'bg-[#F59E0B]' : 'bg-slate-700 dark:bg-slate-400'} h-full`} style={{ width: idx === 0 ? '90%' : '75%' }}></div>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => navigate(`/professor/curso/${curso.id}`)}
                      className="w-full uppercase text-[10px] font-black tracking-widest bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 py-3 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700 group-hover:bg-[#0B0F19] group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-[#0B0F19]"
                    >
                      ACESSAR TURMAS DO CURSO
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center border border-dashed border-slate-300 dark:border-slate-700 rounded-xl">
              <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Nenhum curso associado a sua conta.</p>
            </div>
          )}
        </div>

      </main>
    </div>
  );
};

export default ProfessorDashboard;
