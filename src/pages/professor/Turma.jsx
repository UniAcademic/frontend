import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const ProfessorTurma = () => {
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
        
        // Get turma details directly by ID
        const turma = await api.getTurma(parseInt(id));
        
        if (!turma) throw new Error("Turma não encontrada");

        // Get all disciplinas for this professor and filter by turma
        const professorDisciplinas = await api.getProfessorDisciplinas(user.id);
        const disciplinasDaTurma = professorDisciplinas.filter(d => Number(d.turmaId) === Number(turma.id));

        setData({
          professor,
          turma,
          disciplinas: disciplinasDaTurma
        });
      } catch (error) {
        console.error("Error fetching turma data:", error);
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
    <div className="bg-[#f8f9fa] dark:bg-[#0B0F19] min-h-screen font-sans pb-16">
      
      {/* Breadcrumb Area */}
      <div className="max-w-[1200px] mx-auto px-6 pt-6 -mb-4 flex items-center gap-3">
        <Link to="/professor" className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">MEUS CURSOS</Link>
        <span className="text-slate-300 dark:text-slate-700">›</span>
        <Link to={`/professor/curso/${data.turma.cursoId}`} className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">CURSO</Link>
        <span className="text-slate-300 dark:text-slate-700">›</span>
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white">{data.turma.name}</span>
      </div>

      <main className="max-w-[1200px] mx-auto px-6 py-10 flex flex-col gap-8">
        
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{data.turma.name}</h1>
          <div className="flex items-center gap-3 mt-3">
            <span className="bg-[#0B0F19] dark:bg-white text-white dark:text-[#0B0F19] text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded">{data.turma.semester}</span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">{data.turma.location}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.disciplinas.map((disciplina) => (
            <div key={disciplina.id} className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden flex flex-col hover:border-[#F59E0B]/50 transition-colors group">
              <div className="h-2 bg-[#F59E0B]"></div>
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{disciplina.code}</span>
                  <span className="text-[10px] font-black text-[#F59E0B] uppercase tracking-widest">{disciplina.workload}</span>
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-6">{disciplina.name}</h3>
                
                <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-slate-400 text-sm">groups</span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">38 Alunos</span>
                  </div>
                  <button 
                    onClick={() => navigate(`/professor/disciplina/${disciplina.id}`)}
                    className="uppercase text-[10px] font-black tracking-widest bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 py-2.5 px-6 rounded transition-colors shadow-sm"
                  >
                    GERENCIAR
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* New Discipline Shortcut/Placeholder */}
          <div className="border border-dashed border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50/50 dark:bg-[#0B0F19]/50 flex flex-col items-center justify-center p-6 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all cursor-pointer">
            <span className="material-symbols-outlined text-3xl mb-2">add</span>
            <span className="text-[10px] font-black uppercase tracking-widest">SOLICITAR NOVA DISCIPLINA</span>
          </div>
        </div>

      </main>
    </div>
  );
};

export default ProfessorTurma;
