import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const AdminDisciplinas = () => {
  const [disciplinas, setDisciplinas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDisciplinas = async () => {
      try {
        const data = await api.getDisciplinasAdmin();
        setDisciplinas(data);
      } catch (error) {
        console.error("Erro ao buscar disciplinas:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDisciplinas();
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
          <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Gestão de Disciplinas</h2>
          <p className="mt-2 text-slate-600 flex items-center gap-2 font-bold uppercase text-[11px] tracking-wider">Configure e organize os módulos acadêmicos entre os diversos cursos.</p>
        </div>
        <button className="inline-flex items-center px-4 py-2 border border-transparent text-xs font-bold uppercase tracking-widest rounded shadow-md text-[#020617] bg-accent hover:bg-amber-500 focus:outline-none focus:ring-2 focus:ring-accent transition-colors">
          <span className="material-symbols-outlined text-[20px] mr-2">add_box</span>
          Adicionar Nova Disciplina
        </button>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="relative flex-1 min-w-[300px]">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
          <input className="w-full pl-10 pr-4 py-2 bg-gray-50 border-gray-200 rounded-lg focus:ring-primary focus:border-primary text-sm" placeholder="Buscar por nome, código ou curso..." type="text" />
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

      {/* Table Container */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Nome da Disciplina</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Código Acadêmico</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Departamento</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Status</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {disciplinas.map(disciplina => (
              <tr key={disciplina.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-black text-slate-900 dark:text-white uppercase tracking-tight">{disciplina.name}</div>
                  <div className="text-xs text-slate-500">{disciplina.curso}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-mono font-bold rounded">{disciplina.code}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-600 font-medium uppercase">{disciplina.department}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent mr-1.5"></span>
                    {disciplina.status || 'Ativo'}
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
            ))}
          </tbody>
        </table>

        {/* Pagination placeholder */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <span className="text-sm text-gray-500">Mostrando 1 a {disciplinas.length} resultados</span>
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

export default AdminDisciplinas;
