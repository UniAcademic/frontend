import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

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
        
        // Get turma details
        const turma = await api.getTurma(parseInt(id));
        if (!turma) throw new Error("Turma não encontrada");

        // Get all disciplinas for this professor and filter by turma
        const professorDisciplinas = await api.getProfessorDisciplinas(user.id);
        const disciplinasDaTurma = professorDisciplinas.filter(d => Number(d.turmaId) === Number(turma.id));

        // Get all alunos and all notas to find who is enrolled in these disciplines
        const [alunos, allNotas] = await Promise.all([
          api.getAlunos(),
          api.getNotas()
        ]);

        const idsDisciplinas = disciplinasDaTurma.map(d => Number(d.id));
        
        // Find unique alunoIds enrolled in ANY of the professor's disciplines for this turma
        const enrolledAlunoIds = [...new Set(
          allNotas
            .filter(n => idsDisciplinas.includes(Number(n.disciplinaId)))
            .map(n => Number(n.alunoId))
        )];

        const alunosDaTurma = alunos.filter(a => enrolledAlunoIds.includes(Number(a.id)));

        setData({
          professor,
          turma,
          disciplinas: disciplinasDaTurma,
          alunos: alunosDaTurma
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

        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">DISCIPLINAS NESTA TURMA</h2>
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
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{data.turma.studentsCount || 0} Alunos</span>
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
        </div>

        <div className="flex flex-col gap-6 mt-8">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">ALUNOS MATRICULADOS</h2>
          
          <div className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-800">
                {data.alunos.map((aluno) => (
                  <div key={aluno.id} className="p-6 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800">
                       <img src={aluno.avatar} alt={aluno.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                       <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{aluno.name}</p>
                       <p className="text-[10px] font-black uppercase tracking-widest text-[#F59E0B]">RA: {aluno.ra}</p>
                       <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{aluno.email}</p>
                    </div>
                  </div>
                ))}
             </div>
             {data.alunos.length === 0 && (
                <div className="p-10 text-center text-slate-400 uppercase font-black text-xs tracking-widest">
                   Nenhum aluno encontrado para esta turma.
                </div>
             )}
          </div>
        </div>

      </main>
    </div>
  );
};

export default ProfessorTurma;
