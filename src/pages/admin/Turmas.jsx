import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const AdminTurmas = () => {
  const [turmas, setTurmas] = useState([]);
  const [metrics, setMetrics] = useState({ totalTurmas: 0, ativasTurmas: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [turmasData, metricsData] = await Promise.all([
          api.getTurmasAdmin(),
          api.getDashboardMetrics()
        ]);
        setTurmas(turmasData);
        setMetrics(metricsData);
      } catch (error) {
        console.error("Erro ao buscar dados das turmas:", error);
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
      {/* Page Title Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Gestão de Turmas</h2>
          <p className="mt-2 text-slate-600 flex items-center gap-2 font-bold uppercase text-[11px] tracking-wider">Configure e gerencie as turmas e alocações de salas.</p>
        </div>
        <button className="inline-flex items-center px-4 py-2 border border-transparent text-xs font-bold uppercase tracking-widest rounded shadow-md text-[#020617] bg-accent hover:bg-amber-500 focus:outline-none focus:ring-2 focus:ring-accent transition-colors">
          <span className="material-symbols-outlined text-[20px] mr-2">add_box</span>
          Criar Nova Turma
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <span className="material-symbols-outlined">class</span>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total de Turmas</p>
            <p className="text-2xl font-black text-slate-900">{metrics.totalTurmas.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
            <span className="material-symbols-outlined">how_to_reg</span>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Turmas Ativas</p>
            <p className="text-2xl font-black text-green-600">{metrics.ativasTurmas.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
            <span className="material-symbols-outlined">warning</span>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Capacidade Alerta</p>
            <p className="text-2xl font-black text-red-600">{turmas.filter(t => (t.studentsCount / t.capacity) < 0.5).length}</p>
          </div>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="relative flex-1 min-w-[300px]">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
          <input className="w-full pl-10 pr-4 py-2 bg-gray-50 border-gray-200 rounded-lg focus:ring-primary focus:border-primary text-sm" placeholder="Buscar turma, sala ou disciplina..." type="text" />
        </div>
        <div className="flex items-center gap-3">
          <select className="bg-gray-50 border-gray-200 rounded-lg text-sm px-4 py-2 focus:ring-primary focus:border-primary outline-none">
            <option>Todos os Turnos</option>
            <option>Matutino</option>
            <option>Vespertino</option>
            <option>Noturno</option>
          </select>
          <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors">
            <span className="material-symbols-outlined">filter_list</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Turma</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Disciplina / Curso</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Alunos</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Status</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {turmas.map(turma => {
              const occupancyRate = (turma.studentsCount / turma.capacity) * 100;
              const barColor = occupancyRate >= 90 ? 'bg-green-500' : occupancyRate >= 50 ? 'bg-blue-600' : 'bg-red-500';
              
              return (
                <tr key={turma.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-black text-slate-900 dark:text-white uppercase tracking-tight">{turma.name}</div>
                    <div className="text-xs text-slate-500">{turma.location} - {turma.shift}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-slate-700 text-sm uppercase tracking-tighter">{turma.disciplina}</span>
                    <div className="text-xs text-slate-500 uppercase tracking-tighter">{turma.curso}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-slate-900">{turma.studentsCount} <span className="text-xs text-slate-500 font-normal">/ {turma.capacity}</span></div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                      <div className={`${barColor} h-1.5 rounded-full`} style={{width: `${occupancyRate}%`}}></div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center text-[10px] font-bold uppercase tracking-widest ${occupancyRate < 50 ? 'text-red-500' : 'text-slate-500'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${barColor}`}></span>
                      {occupancyRate < 50 ? 'Baixa Ocupação' : turma.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium hover:bg-white dark:hover:bg-slate-700 disabled:opacity-50" title="Editar">
                        <span className="material-symbols-outlined text-[20px]">edit</span>
                      </button>
                      <button className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium hover:bg-white dark:hover:bg-slate-700 disabled:opacity-50" title="Excluir">
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Pagination Placeholder */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <span className="text-sm text-gray-500">Visualizando 1 a {turmas.length} resultados</span>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium hover:bg-white dark:hover:bg-slate-700 disabled:opacity-50">Anterior</button>
            <button className="px-3 py-1.5 border border-accent bg-accent text-[#020617] rounded-lg text-sm font-bold shadow-sm">1</button>
            <button className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium hover:bg-white dark:hover:bg-slate-700">Próximo</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminTurmas;
