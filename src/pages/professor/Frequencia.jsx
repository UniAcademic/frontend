import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '@/services/api';

const ProfessorFrequencia = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await api.getDisciplinaDetails(parseInt(id) || 1);
        setData(result);
      } catch (error) {
        console.error("Error fetching frequency data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-[#0B0F19]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F59E0B]"></div>
      </div>
    );
  }

  if (!data) return <div className="p-8 text-white bg-[#0B0F19] min-h-screen">Curso não encontrado.</div>;

  const { disciplina, turma, aulas, materiais, alunos } = data;

  return (
    <div className="bg-[#f8f9fa] dark:bg-[#020617] min-h-screen font-sans overflow-y-auto">
      <main className="max-w-[1200px] mx-auto px-6 py-10 flex flex-col gap-8">
        
        {/* Title & Actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{disciplina.name}</h1>
            <div className="flex items-center gap-3 mt-3">
              <span className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded">{disciplina.code}</span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">SEMESTRE ATUAL</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
            <button className="flex-1 md:flex-none uppercase text-[11px] font-bold tracking-widest text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 py-3 px-6 rounded flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors shadow-sm">
              <span className="material-symbols-outlined text-[16px]">print</span>
              RELATÓRIO
            </button>
            <button className="flex-1 md:flex-none uppercase text-[11px] font-bold tracking-widest text-[#0B0F19] bg-[#F59E0B] hover:bg-[#D97706] py-3 px-6 rounded flex items-center justify-center gap-2 transition-colors shadow-sm">
              <span className="material-symbols-outlined text-[18px]">description</span>
              PLANO DE ENSINO
            </button>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-xl p-8 shadow-sm">
          <div className="flex items-center border-l-4 border-[#F59E0B] pl-4 mb-8">
            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium italic leading-relaxed">
              Resumo detalhado de frequência e desempenho para a disciplina <span className="font-bold">{disciplina.name}</span>.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded bg-slate-900 dark:bg-white text-[#F59E0B] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined">group</span>
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">TOTAL ALUNOS</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white leading-none mt-1">{alunos.length}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded bg-slate-900 dark:bg-white text-[#F59E0B] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined">grid_view</span>
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">AULAS PREVISTAS</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white leading-none mt-1">{aulas.length}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded bg-slate-900 dark:bg-white text-[#F59E0B] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined">bar_chart</span>
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">MÉDIA GERAL</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white leading-none mt-1">
                  {(alunos.reduce((acc, curr) => acc + (curr.nota || 0), 0) / (alunos.length || 1)).toFixed(1)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded bg-slate-900 dark:bg-white text-[#F59E0B] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined">schedule</span>
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">CARGA HORÁRIA</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white leading-none mt-1">{disciplina.workload}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Classes Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mt-6 border-b border-transparent">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">RESUMO DA TURMA</h2>
        </div>

        {/* Card of the Class */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden flex flex-col hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
            <div className="h-32 bg-slate-900 dark:bg-slate-800 relative overflow-hidden flex items-start justify-start p-4 border-b border-slate-200 dark:border-slate-700">
              <div className="absolute inset-0 opacity-10 [background-image:linear-gradient(to_right,#ffffff12_1px,transparent_1px),linear-gradient(to_bottom,#ffffff12_1px,transparent_1px)] [background-size:16px_16px]"></div>
              <span className="bg-emerald-900/80 text-emerald-400 border border-emerald-800 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded backdrop-blur-sm z-10">
                PRESENCIAL
              </span>
            </div>
            <div className="p-6 flex-1 flex flex-col">
              <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight mb-5">{turma.name} - {turma.shift}</h3>
              
              <div className="space-y-4 mb-8 flex-1">
                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                  <span className="material-symbols-outlined text-[#F59E0B] text-[18px]">calendar_today</span>
                  <span className="font-bold text-xs uppercase tracking-widest">SEG, QUA • 08:00 - 10:00</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                  <span className="material-symbols-outlined text-[#F59E0B] text-[18px]">school</span>
                  <span className="font-bold text-xs uppercase tracking-widest">{turma.semester}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                  <span className="material-symbols-outlined text-[#F59E0B] text-[18px]">location_on</span>
                  <span className="font-bold text-xs uppercase tracking-widest">{turma.location}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex -space-x-2">
                   <div className="w-8 h-8 rounded border-2 border-white dark:border-[#0B0F19] bg-slate-900 dark:bg-slate-700 text-white flex items-center justify-center text-[10px] font-bold z-10">{alunos.length}</div>
                </div>
                <Link to={`/professor/turma/${turma.id}`} className="uppercase text-[10px] font-black tracking-widest bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 py-2.5 px-6 rounded transition-colors">
                  ACESSAR TURMA
                </Link>
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
};

export default ProfessorFrequencia;
