import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '@services/api';

const AdminAlunos = () => {
  const [alunos, setAlunos] = useState([]);
  const [metrics, setMetrics] = useState({ totalAlunos: 0, ativosAlunos: 0, inativosAlunos: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [alunosData, metricsData] = await Promise.all([
          api.getAlunos(),
          api.getDashboardMetrics()
        ]);
        setAlunos(alunosData);
        setMetrics(metricsData);
      } catch (error) {
        console.error("Erro ao buscar dados dos alunos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-8">
      {/* Breadcrumbs & Action Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Estudantes Matriculados</h2>
          <p className="mt-2 text-slate-600 flex items-center gap-2 font-bold uppercase text-[11px] tracking-wider">Gerencie e visualize a listagem completa de alunos da instituição.</p>
        </div>
        <button className="inline-flex items-center px-4 py-2 border border-transparent text-xs font-bold uppercase tracking-widest rounded shadow-md text-[#020617] bg-accent hover:bg-amber-500 focus:outline-none focus:ring-2 focus:ring-accent transition-colors">
          <span className="material-symbols-outlined text-[20px] mr-2">add_box</span>
          Adicionar Novo Aluno
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <span className="material-symbols-outlined">group</span>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total de Alunos</p>
            <p className="text-2xl font-black text-slate-900">{metrics.totalAlunos.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
            <span className="material-symbols-outlined">check_circle</span>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Alunos Ativos</p>
            <p className="text-2xl font-black text-green-600">{metrics.ativosAlunos.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <span className="material-symbols-outlined">error</span>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pendentes/Inativos</p>
            <p className="text-2xl font-black text-amber-600">{metrics.inativosAlunos.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Data Table Container */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="relative flex-1 min-w-[300px]">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
          <input className="w-full pl-10 pr-4 py-2 bg-gray-50 border-gray-200 rounded-lg focus:ring-primary focus:border-primary text-sm" placeholder="Buscar por nome, matrícula ou curso..." type="text" />
        </div>
        <div className="flex items-center gap-3">
          <select className="bg-gray-50 border-gray-200 rounded-lg text-sm px-4 py-2 focus:ring-primary focus:border-primary outline-none">
            <option>Todos os Cursos</option>
            <option>Ciência da Computação</option>
            <option>Engenharia de Software</option>
            <option>Matemática</option>
          </select>
          <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors">
            <span className="material-symbols-outlined">filter_list</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Nome do Aluno</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Curso / Disciplina</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Status</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {alunos.map(aluno => (
              <tr key={aluno.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-full bg-slate-200 bg-cover bg-center shadow-sm border border-slate-100" 
                      style={{backgroundImage: `url('${aluno.avatar}')`}}
                    ></div>
                    <div>
                      <p className="font-black text-slate-900 dark:text-white uppercase tracking-tight">{aluno.name}</p>
                      <p className="text-xs text-slate-500 font-mono">mat: {aluno.ra}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-slate-600 dark:text-slate-400 font-medium uppercase tracking-tighter">{aluno.curso}</span>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center text-[10px] font-black uppercase tracking-widest ${aluno.status === 'Ativo' ? 'text-emerald-600' : 'text-slate-400 opacity-60'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full mr-2 ${aluno.status === 'Ativo' ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                    {aluno.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <button className="p-1.5 rounded-lg text-slate-400 hover:text-accent hover:bg-accent/10 transition-colors">
                      <span className="material-symbols-outlined text-xl">edit</span>
                    </button>
                    <button className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                      <span className="material-symbols-outlined text-xl">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination placeholder */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <p className="text-sm text-slate-500 font-medium">Mostrando <span className="text-slate-900 dark:text-white">1 a {alunos.length}</span> de <span className="text-slate-900 dark:text-white">{metrics.totalAlunos}</span> resultados</p>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium hover:bg-white dark:hover:bg-slate-700 disabled:opacity-50" disabled>Anterior</button>
            <button className="px-3 py-1.5 border border-accent bg-accent text-[#020617] rounded-lg text-sm font-bold shadow-sm">1</button>
            <button className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium hover:bg-white dark:hover:bg-slate-700">Próximo</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAlunos;
