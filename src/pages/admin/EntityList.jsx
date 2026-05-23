import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import api from '@/services/api';

const AdminEntityList = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [entities, setEntities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const size = 10;

  const path = location.pathname;
  let title = '';
  let entityType = '';
  let columns = [];

  if (path.includes('/alunos')) {
    title = 'ALUNOS';
    entityType = 'alunos';
    columns = [
      { key: 'name', label: 'NOME COMPLETO' },
      { key: 'ra', label: 'RA' },
      { key: 'status', label: 'SITUAÇÃO' }
    ];
  } else if (path.includes('/professores')) {
    title = 'PROFESSORES';
    entityType = 'professores';
    columns = [
      { key: 'name', label: 'NOME COMPLETO' },
      { key: 'department', label: 'DEPARTAMENTO / TITULAÇÃO' }
    ];
  } else if (path.includes('/coordenadores')) {
    title = 'COORDENADORES';
    entityType = 'coordenadores';
    columns = [
      { key: 'name', label: 'NOME COMPLETO' },
      { key: 'titulacao', label: 'TITULAÇÃO' }
    ];
  } else if (path.includes('/turmas')) {
    title = 'TURMAS';
    entityType = 'turmas';
    columns = [
      { key: 'name', label: 'NOME DA TURMA' },
      { key: 'shift', label: 'TURNO' },
      { key: 'semester', label: 'SEMESTRE' },
      { key: 'location', label: 'LOCAL' }
    ];
  } else if (path.includes('/disciplinas')) {
    title = 'DISCIPLINAS';
    entityType = 'disciplinas';
    columns = [
      { key: 'name', label: 'NOME DA DISCIPLINA' },
      { key: 'code', label: 'CÓDIGO' },
      { key: 'workload', label: 'CARGA' }
    ];
  }

  // Reset page when entityType or searchTerm changes
  useEffect(() => {
    setPage(0);
  }, [entityType, searchTerm]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let data = [];
        if (entityType === 'alunos') {
          const res = await api.getAlunosTipoAPI(page, size, { nome: searchTerm });
          if (res && res.content) {
            data = res.content.map(item => ({
              id: item.usuarioId || item.matricula,
              name: item.nome || '',
              ra: item.matricula || '',
              email: item.email || '',
              status: item.ativo !== false ? 'Ativo' : 'Inativo'
            }));
            setTotalPages(res.totalPages || 1);
            setTotalElements(res.totalElements || 0);
          } else {
            setTotalPages(1);
            setTotalElements(0);
          }
        } else if (entityType === 'professores') {
          const res = await api.getProfessoresTipoAPI(page, size, { nome: searchTerm });
          if (res && res.content) {
            data = res.content.map(item => ({
              id: item.usuarioId || item.matricula,
              name: item.nome || '',
              email: item.email || '',
              department: item.titulacao || 'Geral'
            }));
            setTotalPages(res.totalPages || 1);
            setTotalElements(res.totalElements || 0);
          } else {
            setTotalPages(1);
            setTotalElements(0);
          }
        } else if (entityType === 'coordenadores') {
          const res = await api.getCoordenadoresTipoAPI(page, size, { nome: searchTerm });
          if (res && res.content) {
            data = res.content.map(item => ({
              id: item.usuarioId || item.matricula,
              name: item.nome || '',
              email: item.email || '',
              titulacao: item.titulacao || 'Não informada'
            }));
            setTotalPages(res.totalPages || 1);
            setTotalElements(res.totalElements || 0);
          } else {
            setTotalPages(1);
            setTotalElements(0);
          }
        } else {
          // MOCKS for Turmas & Disciplinas
          let mockData = [];
          if (entityType === 'turmas') mockData = await api.getTurmasAdmin();
          else if (entityType === 'disciplinas') mockData = await api.getDisciplinasAdmin();
          
          // Local Filter
          const filtered = mockData.filter(e => 
            Object.values(e).some(val => 
              String(val).toLowerCase().includes(searchTerm.toLowerCase())
            )
          );
          
          // Local Pagination
          const start = page * size;
          data = filtered.slice(start, start + size);
          
          setTotalPages(Math.ceil(filtered.length / size) || 1);
          setTotalElements(filtered.length);
        }
        setEntities(data);
      } catch (error) {
        console.error("Erro ao carregar entidades administrativas:", error);
      } finally {
        setLoading(false);
      }
    };

    // Debounce load to prevent API spamming on keypresses
    const delayDebounce = setTimeout(() => {
      fetchData();
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [entityType, page, searchTerm]);

  const handleDelete = async (id) => {
    if (window.confirm('Deseja realmente excluir este registro?')) {
      try {
        if (entityType === 'alunos') await api.deleteAluno(id);
        else if (entityType === 'professores') await api.deleteProfessor(id);
        
        setEntities(entities.filter(e => e.id !== id));
      } catch (error) {
        console.error("Erro ao deletar entidade:", error);
      }
    }
  };

  const filteredEntities = entities;

  const exportToExcel = () => {
    if (!entities.length) return;
    const headers = columns.map(col => col.label).join(",");
    const rows = entities.map(entity => 
      columns.map(col => `"${entity[col.key] || ''}"`).join(",")
    ).join("\n");
    
    const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" + rows;
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `uniacadem_${entityType}_excel_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPowerBI = () => {
    if (!entities.length) return;
    const headers = ["ID", ...columns.map(col => col.label)].join(",");
    const rows = entities.map(entity => 
      [entity.id, ...columns.map(col => `"${entity[col.key] || ''}"`)].join(",")
    ).join("\n");
    
    const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" + rows;
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `uniacadem_${entityType}_powerbi_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-8 flex flex-col gap-8">
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
         <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">GESTÃO DE {title}</h1>
            <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mt-2">
               ADMINISTRAÇÃO DE SISTEMA • {totalElements} REGISTROS
            </p>
         </div>
         <div className="flex flex-wrap items-center gap-3">
            <button 
              onClick={exportToExcel}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-black uppercase tracking-widest py-3 px-5 rounded-xl transition-all shadow-lg shadow-emerald-600/10 flex items-center gap-2"
            >
               <span className="material-symbols-outlined text-[16px]">file_download</span>
               EXCEL
            </button>
            <button 
              onClick={exportToPowerBI}
              className="bg-blue-600 hover:bg-blue-700 text-white text-[9px] font-black uppercase tracking-widest py-3 px-5 rounded-xl transition-all shadow-lg shadow-blue-600/10 flex items-center gap-2"
            >
               <span className="material-symbols-outlined text-[16px]">equalizer</span>
               POWER BI
            </button>
            <Link 
              to={`${path}/novo`}
              className="bg-[#F59E0B] hover:bg-[#D97706] text-[#020617] text-[10px] font-black uppercase tracking-widest py-3 px-6 rounded-xl transition-all shadow-lg shadow-[#F59E0B]/10 flex items-center gap-2"
            >
               <span className="material-symbols-outlined text-[18px]">add</span>
               NOVO REGISTRO
            </Link>
         </div>
      </div>

      {/* Filter & Search */}
      <div className="bg-white dark:bg-[#020617] p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-4">
         <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
            <input 
              type="text" 
              placeholder={`Buscar em ${title.toLowerCase()}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#0B0F19] border border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 pl-10 pr-4 py-2.5 rounded-lg text-sm outline-none focus:ring-1 focus:ring-[#F59E0B]"
            />
         </div>
         <button className="px-5 py-2.5 bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-500 rounded-lg">
            FILTROS
         </button>
      </div>

      {/* Table Area */}
      <div className="bg-white dark:bg-[#020617] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col justify-between min-h-[400px]">
         <div className="overflow-x-auto">
            {loading ? (
              <div className="p-20 flex justify-center items-center">
                <div className="w-8 h-8 border-4 border-[#F59E0B] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <table className="w-full text-left border-collapse min-w-[800px]">
                 <thead>
                    <tr className="bg-slate-50 dark:bg-[#0B0F19] border-b border-slate-100 dark:divide-slate-800">
                       <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">ID</th>
                       {columns.map(col => (
                          <th key={col.key} className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{col.label}</th>
                       ))}
                       <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">AÇÕES</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                    {filteredEntities.map((item) => (
                       <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/10 transition-colors">
                          <td className="px-8 py-5">
                             <span className="text-[10px] font-black text-slate-400">#{item.id}</span>
                          </td>
                          {columns.map(col => (
                             <td key={col.key} className="px-6 py-5">
                                {col.key === 'status' ? (
                                   <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${item[col.key] === 'Ativo' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                      {item[col.key]}
                                   </span>
                                ) : (
                                   <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight">{item[col.key]}</span>
                                )}
                             </td>
                          ))}
                          <td className="px-8 py-5 text-right">
                             <div className="flex justify-end gap-2">
                                <button 
                                  onClick={() => navigate(`${path}/editar/${item.id}`)}
                                  className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-[#F59E0B] flex items-center justify-center transition-colors"
                                >
                                   <span className="material-symbols-outlined text-[18px]">edit</span>
                                </button>
                                <button 
                                  onClick={() => handleDelete(item.id)}
                                  className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-red-500 flex items-center justify-center transition-colors"
                                >
                                   <span className="material-symbols-outlined text-[18px]">delete</span>
                                </button>
                             </div>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
            )}
         </div>
         {!loading && filteredEntities.length === 0 && (
            <div className="p-10 text-center text-slate-400 uppercase text-[10px] font-black tracking-widest flex-1 flex items-center justify-center">
               Nenhum registro encontrado
            </div>
         )}

         {/* Paginação */}
         <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0B0F19]/20 flex flex-col sm:flex-row justify-between items-center gap-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
               PÁGINA {page + 1} DE {totalPages} • {totalElements} REGISTROS NO TOTAL
            </span>
            <div className="flex items-center gap-2">
               <button 
                 disabled={page === 0}
                 onClick={() => setPage(prev => Math.max(0, prev - 1))}
                 className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
               >
                  <span className="material-symbols-outlined text-[20px]">chevron_left</span>
               </button>
               <button 
                 disabled={page >= totalPages - 1}
                 onClick={() => setPage(prev => Math.min(totalPages - 1, prev + 1))}
                 className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
               >
                  <span className="material-symbols-outlined text-[20px]">chevron_right</span>
               </button>
            </div>
         </div>
      </div>

    </div>
  );
};

export default AdminEntityList;
