import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import api from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const AdminEntityList = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [entities, setEntities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ matricula: '', email: '', nome: '', cpf: '' });
  const [appliedFilters, setAppliedFilters] = useState({ matricula: '', email: '', nome: '', cpf: '' });
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const size = 10;

  // Edit Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEntity, setEditingEntity] = useState(null);
  const [editTab, setEditTab] = useState('dados'); // 'dados' | 'endereco'
  const [editForm, setEditForm] = useState({});
  const [enderecoForm, setEnderecoForm] = useState({ cep: '', logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '', pais: '' });
  const [editSaving, setEditSaving] = useState(false);

  // Document states (edit modal - alunos only)
  const [docList, setDocList] = useState([]);
  const [docListLoading, setDocListLoading] = useState(false);
  const [docUploading, setDocUploading] = useState(false);
  const [docDownloading, setDocDownloading] = useState({});
  const [docTipoDoc, setDocTipoDoc] = useState('RG');
  const [docTipoMidia, setDocTipoMidia] = useState('PNG');
  const [docMsg, setDocMsg] = useState({ text: '', type: '' });
  const docFileRef = useRef(null);
  const DOC_TIPOS = ['RG', 'CPF', 'CNH'];
  const DOC_MIDIAS = ['PNG', 'JPEG', 'PDF'];
  const DOC_ACCEPT = { PNG: 'image/png', JPEG: 'image/jpeg', PDF: 'application/pdf' };
  const DOC_EXT = { PNG: '.png', JPEG: '.jpg', PDF: '.pdf' };

  // View Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingEntity, setViewingEntity] = useState(null);
  const [viewTab, setViewTab] = useState('dados'); // 'dados' | 'endereco'

  // Create Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({ nome: '', email: '', celular: '', senha: '', tipo_usuario: '', roles: [] });
  const [createSaving, setCreateSaving] = useState(false);

  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const path = location.pathname;
  let title = '';
  let entityType = '';
  let columns = [];

  if (path.includes('/alunos')) {
    title = 'ALUNOS';
    entityType = 'alunos';
    columns = [
      { key: 'matricula', label: 'MATRÍCULA' },
      { key: 'name', label: 'NOME' }
    ];
  } else if (path.includes('/professores')) {
    title = 'PROFESSORES';
    entityType = 'professores';
    columns = [
      { key: 'matricula', label: 'MATRÍCULA' },
      { key: 'name', label: 'NOME' }
    ];
  } else if (path.includes('/coordenadores')) {
    title = 'COORDENADORES';
    entityType = 'coordenadores';
    columns = [
      { key: 'matricula', label: 'MATRÍCULA' },
      { key: 'name', label: 'NOME' }
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

  // Reset page when entityType or appliedFilters changes
  useEffect(() => {
    setPage(0);
  }, [entityType, appliedFilters]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let data = [];
        if (entityType === 'alunos') {
          const res = await api.getAlunosTipoAPI(page, size, appliedFilters);
          if (res && res.content) {
            data = res.content.map(item => ({
              id: item.usuarioId || item.matricula,
              matricula: item.matricula || '-',
              name: item.nome || '-',
              _raw: item
            }));
            setTotalPages(res.totalPages || 1);
            setTotalElements(res.totalElements || 0);
          } else {
            setTotalPages(1);
            setTotalElements(0);
          }
        } else if (entityType === 'professores') {
          const res = await api.getProfessoresTipoAPI(page, size, appliedFilters);
          if (res && res.content) {
            data = res.content.map(item => ({
              id: item.usuarioId || item.matricula,
              matricula: item.matricula || '-',
              name: item.nome || '-',
              _raw: item
            }));
            setTotalPages(res.totalPages || 1);
            setTotalElements(res.totalElements || 0);
          } else {
            setTotalPages(1);
            setTotalElements(0);
          }
        } else if (entityType === 'coordenadores') {
          const res = await api.getCoordenadoresTipoAPI(page, size, appliedFilters);
          if (res && res.content) {
            data = res.content.map(item => ({
              id: item.usuarioId || item.matricula,
              matricula: item.matricula || '-',
              name: item.nome || '-',
              _raw: item
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
              String(val).toLowerCase().includes((appliedFilters.nome || '').toLowerCase())
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
  }, [entityType, page, appliedFilters]);

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

  // ===== CREATE MODAL LOGIC =====
  const openCreateModal = () => {
    let tipo = '';
    if (entityType === 'alunos') tipo = 'ALUNO';
    else if (entityType === 'professores') tipo = 'PROFESSOR';
    else if (entityType === 'coordenadores') tipo = 'COORDENADOR';

    setCreateForm({ nome: '', email: '', celular: '', senha: '', tipo_usuario: tipo, roles: [{ role: tipo }] });
    setShowCreateModal(true);
  };

  const cancelCreateModal = () => {
    setShowCreateModal(false);
    setCreateForm({ nome: '', email: '', celular: '', senha: '', tipo_usuario: '', roles: [] });
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreateSaving(true);
    try {
      await api.createUsuarioAPI(createForm);
      showToast('Usuário criado com sucesso!');
      cancelCreateModal();
      // Force refresh data
      setPage(0);
      setAppliedFilters(f => ({ ...f }));
    } catch (err) {
      const msg = err?.response?.data?.mensagem || err?.message || 'Erro ao criar usuário';
      showToast(msg, 'error');
    } finally {
      setCreateSaving(false);
    }
  };

  // ===== VIEW MODAL LOGIC =====
  const openViewModal = async (item) => {
    setViewingEntity(item);
    setViewTab('dados');

    try {
      let raw = item._raw || {};

      if (entityType === 'alunos') {
        const fullData = await api.getAlunoPorIdAPI(item.id);
        if (fullData) raw = fullData;
      } else if (entityType === 'professores') {
        const fullData = await api.getProfessorPorIdAPI(item.id);
        if (fullData) raw = fullData;
      } else if (entityType === 'coordenadores') {
        const fullData = await api.getCoordenadorPorIdAPI(item.id);
        if (fullData) raw = fullData;
      }

      setViewingEntity({ ...item, _fullData: raw });
      setShowViewModal(true);
    } catch (error) {
      console.error("Erro ao carregar detalhes:", error);
      showToast("Erro ao carregar os detalhes do registro.", "error");
    }
  };

  const cancelViewModal = () => {
    setShowViewModal(false);
    setViewingEntity(null);
  };

  // ===== EDIT MODAL LOGIC =====
  const openEditModal = async (item) => {
    setEditingEntity(item);
    setEditTab('dados');

    try {
      let raw = item._raw || {};

      if (entityType === 'alunos') {
        const fullData = await api.getAlunoPorIdAPI(item.id);
        if (fullData) raw = fullData;
      } else if (entityType === 'professores') {
        const fullData = await api.getProfessorPorIdAPI(item.id);
        if (fullData) raw = fullData;
      } else if (entityType === 'coordenadores') {
        const fullData = await api.getCoordenadorPorIdAPI(item.id);
        if (fullData) raw = fullData;
      }

      if (entityType === 'alunos') {
        setEditForm({ email: raw.email || '', celular: raw.celular || '', nome: raw.nome || '', cpf: raw.cpf || '', rg: raw.rg || '', data_nascimento: raw.data_nascimento ? raw.data_nascimento.substring(0, 10) : '', ano_ingresso: raw.ano_ingresso || '' });
      } else {
        setEditForm({ email: raw.email || '', celular: raw.celular || '', nome: raw.nome || '', cpf: raw.cpf || '', data_nascimento: raw.data_nascimento ? raw.data_nascimento.substring(0, 10) : '', ano_ingresso: raw.ano_ingresso || '', rg: raw.rg || '' });
      }
      const endereco = raw.endereco || {};
      setEnderecoForm({ cep: endereco.cep || '', logradouro: endereco.logradouro || '', numero: endereco.numero || '', complemento: endereco.complemento || '', bairro: endereco.bairro || '', cidade: endereco.cidade || '', estado: endereco.estado || '', pais: endereco.pais || '' });
      setShowEditModal(true);
    } catch (error) {
      console.error("Erro ao carregar detalhes:", error);
      showToast("Erro ao carregar os detalhes do registro.", "error");
    }
  };

  const cancelEditModal = () => {
    setShowEditModal(false);
    setEditingEntity(null);
    setEditForm({});
    setEnderecoForm({ cep: '', logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '', pais: '' });
    setDocList([]);
    setDocMsg({ text: '', type: '' });
  };

  const fetchDocList = async (alunoId) => {
    setDocListLoading(true);
    try {
      const docs = await api.listarDocumentosAlunoAPI(alunoId);
      setDocList(Array.isArray(docs) ? docs : []);
    } catch { setDocList([]); }
    finally { setDocListLoading(false); }
  };

  const handleDocUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !editingEntity) return;
    setDocUploading(true);
    setDocMsg({ text: '', type: '' });
    try {
      await api.enviarDocumentoAlunoAPI(editingEntity.id, file, docTipoMidia, docTipoDoc);
      setDocMsg({ text: `Documento ${docTipoDoc} (${docTipoMidia}) enviado!`, type: 'success' });
      await fetchDocList(editingEntity.id);
    } catch (err) {
      setDocMsg({ text: err?.response?.data?.message || 'Erro ao enviar documento.', type: 'error' });
    } finally {
      setDocUploading(false);
      if (docFileRef.current) docFileRef.current.value = '';
    }
  };

  const handleDocDownload = async (doc) => {
    if (!doc?.id) return;
    const key = doc.id;
    setDocDownloading(prev => ({ ...prev, [key]: true }));
    try {
      const result = await api.baixarDocumentoAlunoAPI(doc.id);
      const url = result?.url || result;
      if (typeof url === 'string' && url.startsWith('http')) {
        window.open(url, '_blank');
      } else {
        // fallback: blob download
        const blob = new Blob([result]);
        const blobUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = doc.nome || `documento_${doc.tipoDocumento || 'doc'}`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(blobUrl);
      }
    } catch (err) {
      setDocMsg({ text: err?.response?.status === 404 ? 'Documento não encontrado.' : 'Erro ao baixar.', type: 'error' });
    } finally {
      setDocDownloading(prev => ({ ...prev, [key]: false }));
    }
  };

  const handleEditUpdate = async () => {
    if (!editingEntity) return;
    setEditSaving(true);
    try {
      const id = editingEntity.id;
      if (editTab === 'dados') {
        const payload = { ...editForm };
        if (payload.data_nascimento) payload.data_nascimento = new Date(payload.data_nascimento).toISOString();
        if (payload.ano_ingresso) payload.ano_ingresso = Number(payload.ano_ingresso);
        if (entityType === 'alunos') await api.atualizarAlunoAPI(id, payload);
        else if (entityType === 'professores') await api.atualizarProfessorAPI(id, payload);
        else if (entityType === 'coordenadores') await api.atualizarCoordenadorAPI(id, payload);
      } else {
        if (entityType === 'alunos') await api.atualizarEnderecoAlunoAPI(editingEntity.id, enderecoForm);
        else if (entityType === 'professores') await api.atualizarEnderecoProfessorAPI(editingEntity.id, enderecoForm);
        else if (entityType === 'coordenadores') await api.atualizarEnderecoCoordenadorAPI(editingEntity.id, enderecoForm);
      }
      cancelEditModal();
      showToast(editTab === 'dados' ? 'Dados atualizados com sucesso!' : 'Endereço atualizado com sucesso!');
      // Refresh data
      setPage(p => p);
      // Force re-fetch
      setAppliedFilters(f => ({ ...f }));
    } catch (err) {
      const msg = err?.response?.data?.mensagem || err?.message || 'Erro ao atualizar';
      showToast(msg, 'error');
    } finally {
      setEditSaving(false);
    }
  };

  const [exporting, setExporting] = useState(false);

  const exportToExcel = async () => {
    if (entityType === 'alunos' || entityType === 'professores' || entityType === 'coordenadores') {
      setExporting(true);
      try {
        let res;
        if (entityType === 'alunos') {
          res = await api.getAlunosTipoAPI(0, 9999, appliedFilters);
        } else if (entityType === 'professores') {
          res = await api.getProfessoresTipoAPI(0, 9999, appliedFilters);
        } else {
          res = await api.getCoordenadoresTipoAPI(0, 9999, appliedFilters);
        }

        const allData = res?.content || [];
        if (!allData.length) {
          showToast('Nenhum registro para exportar.', 'error');
          return;
        }

        const excelColumns = [
          { key: 'matricula', label: 'MATRÍCULA' },
          { key: 'nome', label: 'NOME' },
          { key: 'email', label: 'EMAIL' },
          { key: 'cpf', label: 'CPF' },
          { key: 'rg', label: 'RG' },
          { key: 'celular', label: 'CELULAR' },
          { key: 'dataNascimento', label: 'DATA DE NASCIMENTO' },
          { key: 'anoIngresso', label: 'ANO DE INGRESSO' },
          { key: '_role', label: 'ROLE' },
        ];

        const roleFixo = entityType === 'alunos' ? 'ALUNO' : entityType === 'professores' ? 'PROFESSOR' : 'COORDENADOR';

        const worksheetRows = allData.map(item => {
          return excelColumns.map(col => {
            if (col.key === '_role') return roleFixo;
            let val = item[col.key] ?? '';
            if (col.key === 'dataNascimento' && val) val = val.split('T')[0];
            return val;
          });
        });

        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'UniAcadem';
        workbook.created = new Date();
        const sheetName = entityType.charAt(0).toUpperCase() + entityType.slice(1);
        const worksheet = workbook.addWorksheet(sheetName);
        worksheet.columns = excelColumns.map(col => ({
          width: col.key === 'email' ? 30 : col.key === 'nome' ? 30 : col.key === 'dataNascimento' ? 20 : 18,
        }));
        worksheet.addTable({
          name: `Tabela${sheetName}`, ref: 'A1', headerRow: true, totalsRow: false,
          style: { theme: 'TableStyleMedium2', showRowStripes: true },
          columns: excelColumns.map(col => ({ name: col.label, filterButton: true })),
          rows: worksheetRows,
        });
        const headerRow = worksheet.getRow(1);
        headerRow.eachCell(cell => {
          cell.font = { bold: true, color: { argb: 'FF000000' }, size: 11 };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD97706' } };
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
        });
        headerRow.height = 28;
        for (let i = 2; i <= worksheet.rowCount; i++) {
          const row = worksheet.getRow(i);
          row.eachCell(cell => { cell.alignment = { vertical: 'middle' }; });
          row.height = 22;
        }
        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), `uniacadem_${entityType}_${new Date().toISOString().split('T')[0]}.xlsx`);
        showToast(`${allData.length} registros exportados com sucesso!`);
      } catch (err) {
        console.error('Erro ao exportar:', err);
        showToast('Erro ao exportar dados.', 'error');
      } finally {
        setExporting(false);
      }
    } else {
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
    }
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
              disabled={exporting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-black uppercase tracking-widest py-3 px-5 rounded-xl transition-all shadow-lg shadow-emerald-600/10 flex items-center gap-2 disabled:opacity-50"
            >
               {exporting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <span className="material-symbols-outlined text-[16px]">file_download</span>}
               {exporting ? 'EXPORTANDO...' : 'EXCEL'}
            </button>
            <button
              onClick={exportToPowerBI}
              className="bg-blue-600 hover:bg-blue-700 text-white text-[9px] font-black uppercase tracking-widest py-3 px-5 rounded-xl transition-all shadow-lg shadow-blue-600/10 flex items-center gap-2"
            >
               <span className="material-symbols-outlined text-[16px]">equalizer</span>
               POWER BI
            </button>
            {(entityType === 'alunos' || entityType === 'professores' || entityType === 'coordenadores') ? (
              <button
                onClick={openCreateModal}
                className="bg-[#F59E0B] hover:bg-[#D97706] text-[#020617] text-[10px] font-black uppercase tracking-widest py-3 px-6 rounded-xl transition-all shadow-lg shadow-[#F59E0B]/10 flex items-center gap-2"
              >
                 <span className="material-symbols-outlined text-[18px]">add</span>
                 NOVO REGISTRO
              </button>
            ) : (
              <Link
                to={`${path}/novo`}
                className="bg-[#F59E0B] hover:bg-[#D97706] text-[#020617] text-[10px] font-black uppercase tracking-widest py-3 px-6 rounded-xl transition-all shadow-lg shadow-[#F59E0B]/10 flex items-center gap-2"
              >
                 <span className="material-symbols-outlined text-[18px]">add</span>
                 NOVO REGISTRO
              </Link>
            )}
         </div>
      </div>

      {/* Filter Button */}
      {(entityType === 'alunos' || entityType === 'professores' || entityType === 'coordenadores') && (
        <div className="flex items-center gap-3">
           <button
             onClick={() => setShowFilterPanel(true)}
             className={`px-5 py-2.5 border text-[10px] font-black uppercase tracking-widest rounded-xl flex items-center gap-2 transition-all ${
               Object.values(appliedFilters).some(v => v)
                 ? 'bg-[#F59E0B] border-[#F59E0B] text-[#020617] shadow-lg shadow-[#F59E0B]/10'
                 : 'bg-white dark:bg-[#0B0F19] border-slate-200 dark:border-slate-800 text-slate-500 hover:border-[#F59E0B] hover:text-[#F59E0B]'
             }`}
           >
              <span className="material-symbols-outlined text-[18px]">filter_list</span>
              FILTROS
              {Object.values(appliedFilters).some(v => v) && (
                <span className="ml-1 w-5 h-5 rounded-full bg-[#020617] text-white text-[9px] flex items-center justify-center">
                  {Object.values(appliedFilters).filter(v => v).length}
                </span>
              )}
           </button>
           {Object.values(appliedFilters).some(v => v) && (
             <button
               onClick={() => { setFilters({ matricula: '', email: '', nome: '', cpf: '' }); setAppliedFilters({ matricula: '', email: '', nome: '', cpf: '' }); }}
               className="px-4 py-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 text-[10px] font-black uppercase tracking-widest rounded-xl flex items-center gap-2 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all"
             >
               <span className="material-symbols-outlined text-[16px]">close</span>
               LIMPAR FILTROS
             </button>
           )}
        </div>
      )}

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
                                {(entityType === 'alunos' || entityType === 'professores' || entityType === 'coordenadores') ? (
                                  <>
                                    <button
                                      onClick={() => openViewModal(item)}
                                      className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-emerald-500 flex items-center justify-center transition-colors"
                                      title="Visualizar Detalhes"
                                    >
                                       <span className="material-symbols-outlined text-[18px]">visibility</span>
                                    </button>
                                    <button
                                      onClick={() => openEditModal(item)}
                                      className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-[#F59E0B] flex items-center justify-center transition-colors"
                                      title="Editar"
                                    >
                                       <span className="material-symbols-outlined text-[18px]">edit</span>
                                    </button>
                                  </>
                                ) : (
                                  <>
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
                                  </>
                                )}
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

      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed bottom-5 right-5 z-[100] px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 transition-all ${toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
          <span className="material-symbols-outlined">{toast.type === 'success' ? 'check_circle' : 'error'}</span>
          <span className="font-bold text-sm">{toast.message}</span>
        </div>
      )}

      {/* Filters Modal */}
      {showFilterPanel && (entityType === 'alunos' || entityType === 'professores' || entityType === 'coordenadores') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#020617] w-full max-w-lg p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6 shadow-2xl relative">
            <button type="button" onClick={() => setShowFilterPanel(false)} className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 transition-colors">
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>

            <div>
              <h2 className="text-xl font-black uppercase tracking-tight text-slate-800 dark:text-slate-100 mb-1">Filtros de Busca</h2>
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Encontre usuários combinando parâmetros</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1 block">Nome do Usuário</label>
                <input type="text" placeholder="Ex: Fabio" value={filters.nome} onChange={e => setFilters({ ...filters, nome: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#F59E0B]" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1 block">Matrícula</label>
                <input type="text" placeholder="Ex: 00100027" value={filters.matricula} onChange={e => setFilters({ ...filters, matricula: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#F59E0B]" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1 block">Email</label>
                <input type="email" placeholder="Ex: fabio@email.com" value={filters.email} onChange={e => setFilters({ ...filters, email: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#F59E0B]" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1 block">CPF</label>
                <input type="text" placeholder="Ex: 12345678900" value={filters.cpf} onChange={e => setFilters({ ...filters, cpf: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#F59E0B]" />
              </div>
            </div>

            <div className="flex gap-3 pt-4 mt-2 border-t border-slate-100 dark:border-slate-800/50">
              <button type="button" onClick={() => { setAppliedFilters({ ...filters }); setShowFilterPanel(false); }}
                className="flex-1 bg-[#F59E0B] hover:bg-[#D97706] text-[#020617] text-[12px] font-black uppercase tracking-widest py-4 px-6 rounded-xl transition-all shadow-lg shadow-[#F59E0B]/20">
                APLICAR FILTROS
              </button>
              <button type="button" onClick={() => { setFilters({ matricula: '', email: '', nome: '', cpf: '' }); setAppliedFilters({ matricula: '', email: '', nome: '', cpf: '' }); setShowFilterPanel(false); }}
                className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-[12px] font-black uppercase tracking-widest py-4 px-6 rounded-xl transition-all">
                LIMPAR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Entity Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <form onSubmit={handleCreateUser} className="bg-white dark:bg-[#020617] w-full max-w-2xl p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button type="button" onClick={cancelCreateModal} className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>

            <div>
              <h2 className="text-xl font-black uppercase tracking-tight text-slate-800 dark:text-slate-100 mb-1">CRIAR NOVO {entityType === 'alunos' ? 'ALUNO' : entityType === 'professores' ? 'PROFESSOR' : 'COORDENADOR'}</h2>
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Preencha os dados básicos do novo usuário</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1 block">Nome Completo</label>
                <input type="text" required placeholder="Digite o nome completo" value={createForm.nome} onChange={e => setCreateForm({ ...createForm, nome: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#F59E0B]" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1 block">Email</label>
                <input type="email" required placeholder="email@exemplo.com" value={createForm.email} onChange={e => setCreateForm({ ...createForm, email: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#F59E0B]" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1 block">Celular</label>
                <input type="text" placeholder="Apenas números (Ex: 11999999999)" value={createForm.celular} onChange={e => setCreateForm({ ...createForm, celular: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#F59E0B]" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1 block">Senha</label>
                <input type="password" required placeholder="Senha inicial" value={createForm.senha} onChange={e => setCreateForm({ ...createForm, senha: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#F59E0B]" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1 block">Tipo de Usuário (Bloqueado)</label>
                <input type="text" disabled value={createForm.tipo_usuario}
                  className="w-full bg-slate-100 dark:bg-[#0B0F19]/50 border border-slate-200 dark:border-slate-800/50 text-slate-500 dark:text-slate-400 px-4 py-3 rounded-xl text-sm outline-none font-bold cursor-not-allowed" />
              </div>
            </div>

            <div className="flex gap-3 pt-4 mt-2 border-t border-slate-100 dark:border-slate-800/50">
              <button type="submit" disabled={createSaving}
                className="flex-1 bg-[#F59E0B] hover:bg-[#D97706] text-[#020617] text-[12px] font-black uppercase tracking-widest py-4 px-6 rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-[#F59E0B]/20">
                {createSaving ? 'CRIANDO...' : 'CRIAR REGISTRO'}
              </button>
              <button type="button" onClick={cancelCreateModal}
                className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-[12px] font-black uppercase tracking-widest py-4 px-6 rounded-xl transition-all">
                CANCELAR
              </button>
            </div>
          </form>
        </div>
      )}

      {/* View Entity Modal */}
      {showViewModal && viewingEntity && (entityType === 'alunos' || entityType === 'professores' || entityType === 'coordenadores') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#020617] w-full max-w-2xl p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button type="button" onClick={cancelViewModal} className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>

            <div>
              <h2 className="text-xl font-black uppercase tracking-tight text-slate-800 dark:text-slate-100 mb-1">Visualizar {entityType === 'alunos' ? 'Aluno' : entityType === 'professores' ? 'Professor' : 'Coordenador'}</h2>
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">ID: #{viewingEntity.id} • {viewingEntity.name}</p>
            </div>

            {/* Tab Buttons */}
            <div className="flex gap-2 p-1 bg-slate-100 dark:bg-[#0B0F19] rounded-xl">
              <button
                onClick={() => setViewTab('dados')}
                className={`flex-1 py-3 px-4 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${viewTab === 'dados' ? 'bg-[#F59E0B] text-[#020617] shadow-lg shadow-[#F59E0B]/20' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                <span className="material-symbols-outlined text-[16px]">person</span>
                Dados Pessoais
              </button>
              <button
                onClick={() => setViewTab('endereco')}
                className={`flex-1 py-3 px-4 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${viewTab === 'endereco' ? 'bg-[#F59E0B] text-[#020617] shadow-lg shadow-[#F59E0B]/20' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                <span className="material-symbols-outlined text-[16px]">location_on</span>
                Endereço
              </button>
            </div>

            {/* Tab Content: Dados Pessoais */}
            {viewTab === 'dados' && viewingEntity._fullData && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-xl border border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-[#0B0F19]/20">
                <div className="md:col-span-2 space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nome Completo</p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{viewingEntity._fullData.nome || '-'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Matrícula</p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{viewingEntity._fullData.matricula || '-'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email</p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{viewingEntity._fullData.email || '-'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Celular</p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{viewingEntity._fullData.celular || '-'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">CPF</p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{viewingEntity._fullData.cpf || '-'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">RG</p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{viewingEntity._fullData.rg || '-'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Data de Nascimento</p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{viewingEntity._fullData.data_nascimento ? new Date(viewingEntity._fullData.data_nascimento).toLocaleDateString('pt-BR') : '-'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ano de Ingresso</p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{viewingEntity._fullData.ano_ingresso || '-'}</p>
                </div>
              </div>
            )}

            {/* Tab Content: Endereço */}
            {viewTab === 'endereco' && viewingEntity._fullData && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-xl border border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-[#0B0F19]/20">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">CEP</p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{viewingEntity._fullData.endereco?.cep || '-'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Número</p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{viewingEntity._fullData.endereco?.numero || '-'}</p>
                </div>
                <div className="md:col-span-2 space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Logradouro</p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{viewingEntity._fullData.endereco?.logradouro || '-'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Complemento</p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{viewingEntity._fullData.endereco?.complemento || '-'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Bairro</p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{viewingEntity._fullData.endereco?.bairro || '-'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Cidade</p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{viewingEntity._fullData.endereco?.cidade || '-'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Estado / País</p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {viewingEntity._fullData.endereco?.estado ? `${viewingEntity._fullData.endereco.estado} - ` : '- '}
                    {viewingEntity._fullData.endereco?.pais || '-'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Entity Modal */}
      {showEditModal && editingEntity && (entityType === 'alunos' || entityType === 'professores' || entityType === 'coordenadores') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#020617] w-full max-w-2xl p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button type="button" onClick={cancelEditModal} className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>

            <div>
              <h2 className="text-xl font-black uppercase tracking-tight text-slate-800 dark:text-slate-100 mb-1">Editar {entityType === 'alunos' ? 'Aluno' : entityType === 'professores' ? 'Professor' : 'Coordenador'}</h2>
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">ID: #{editingEntity.id} • {editingEntity.name}</p>
            </div>

            {/* Tab Buttons */}
            <div className="flex gap-2 p-1 bg-slate-100 dark:bg-[#0B0F19] rounded-xl">
              <button
                onClick={() => setEditTab('dados')}
                className={`flex-1 py-3 px-4 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${editTab === 'dados' ? 'bg-[#F59E0B] text-[#020617] shadow-lg shadow-[#F59E0B]/20' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                <span className="material-symbols-outlined text-[16px]">person</span>
                Dados Pessoais
              </button>
              <button
                onClick={() => setEditTab('endereco')}
                className={`flex-1 py-3 px-4 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${editTab === 'endereco' ? 'bg-[#F59E0B] text-[#020617] shadow-lg shadow-[#F59E0B]/20' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                <span className="material-symbols-outlined text-[16px]">location_on</span>
                Endereço
              </button>
              {entityType === 'alunos' && (
                <button
                  onClick={() => { setEditTab('documentos'); if (editingEntity) fetchDocList(editingEntity.id); }}
                  className={`flex-1 py-3 px-4 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${editTab === 'documentos' ? 'bg-[#F59E0B] text-[#020617] shadow-lg shadow-[#F59E0B]/20' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                  <span className="material-symbols-outlined text-[16px]">folder_open</span>
                  Documentos
                </button>
              )}
            </div>

            {/* Tab Content: Dados Pessoais */}
            {editTab === 'dados' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1 block">Nome</label>
                  <input type="text" value={editForm.nome || ''} onChange={e => setEditForm({ ...editForm, nome: e.target.value })} placeholder="Nome completo" className="w-full bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#F59E0B]" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1 block">Email</label>
                  <input type="email" value={editForm.email || ''} onChange={e => setEditForm({ ...editForm, email: e.target.value })} placeholder="email@exemplo.com" className="w-full bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#F59E0B]" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1 block">Celular</label>
                  <input type="text" value={editForm.celular || ''} onChange={e => setEditForm({ ...editForm, celular: e.target.value })} placeholder="Apenas números" className="w-full bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#F59E0B]" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1 block">CPF</label>
                  <input type="text" value={editForm.cpf || ''} onChange={e => setEditForm({ ...editForm, cpf: e.target.value })} placeholder="Apenas números" className="w-full bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#F59E0B]" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1 block">RG</label>
                  <input type="text" value={editForm.rg || ''} onChange={e => setEditForm({ ...editForm, rg: e.target.value })} placeholder="Número do RG" className="w-full bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#F59E0B]" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1 block">Data de Nascimento</label>
                  <input type="date" value={editForm.data_nascimento || ''} onChange={e => setEditForm({ ...editForm, data_nascimento: e.target.value })} className="w-full bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#F59E0B]" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1 block">Ano de Ingresso</label>
                  <input type="number" value={editForm.ano_ingresso || ''} onChange={e => setEditForm({ ...editForm, ano_ingresso: e.target.value })} placeholder="Ex: 2024" min="1900" max="2100" className="w-full bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#F59E0B]" />
                </div>
              </div>
            )}

            {/* Tab Content: Endereço */}
            {editTab === 'endereco' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1 block">CEP</label>
                  <input type="text" value={enderecoForm.cep} onChange={e => setEnderecoForm({ ...enderecoForm, cep: e.target.value })} placeholder="00000-000" className="w-full bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#F59E0B]" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1 block">Número</label>
                  <input type="text" value={enderecoForm.numero} onChange={e => setEnderecoForm({ ...enderecoForm, numero: e.target.value })} placeholder="Número" className="w-full bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#F59E0B]" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1 block">Logradouro</label>
                  <input type="text" value={enderecoForm.logradouro} onChange={e => setEnderecoForm({ ...enderecoForm, logradouro: e.target.value })} placeholder="Rua, Avenida..." className="w-full bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#F59E0B]" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1 block">Complemento</label>
                  <input type="text" value={enderecoForm.complemento} onChange={e => setEnderecoForm({ ...enderecoForm, complemento: e.target.value })} placeholder="Apto, Bloco..." className="w-full bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#F59E0B]" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1 block">Bairro</label>
                  <input type="text" value={enderecoForm.bairro} onChange={e => setEnderecoForm({ ...enderecoForm, bairro: e.target.value })} placeholder="Bairro" className="w-full bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#F59E0B]" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1 block">Cidade</label>
                  <input type="text" value={enderecoForm.cidade} onChange={e => setEnderecoForm({ ...enderecoForm, cidade: e.target.value })} placeholder="Cidade" className="w-full bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#F59E0B]" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1 block">Estado</label>
                  <input type="text" value={enderecoForm.estado} onChange={e => setEnderecoForm({ ...enderecoForm, estado: e.target.value })} placeholder="UF" maxLength={2} className="w-full bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#F59E0B]" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1 block">País</label>
                  <input type="text" value={enderecoForm.pais} onChange={e => setEnderecoForm({ ...enderecoForm, pais: e.target.value })} placeholder="Brasil" className="w-full bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#F59E0B]" />
                </div>
              </div>
            )}

            {/* Tab Content: Documentos (alunos only) */}
            {editTab === 'documentos' && entityType === 'alunos' && (
              <div className="space-y-5">
                {docMsg.text && (
                  <div className={`p-3 rounded-xl text-xs font-bold ${docMsg.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400'}`}>
                    {docMsg.text}
                  </div>
                )}

                {/* Upload */}
                <div className="space-y-3">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-[#F59E0B]">Enviar Documento</h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Tipo</label>
                      <select value={docTipoDoc} onChange={e => setDocTipoDoc(e.target.value)} className="w-full px-3 py-2.5 bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-[#F59E0B]">
                        {DOC_TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Formato</label>
                      <select value={docTipoMidia} onChange={e => setDocTipoMidia(e.target.value)} className="w-full px-3 py-2.5 bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-[#F59E0B]">
                        {DOC_MIDIAS.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="flex items-end">
                      <input ref={docFileRef} type="file" accept={DOC_ACCEPT[docTipoMidia]} onChange={handleDocUpload} disabled={docUploading} className="hidden" />
                      <button type="button" onClick={() => docFileRef.current?.click()} disabled={docUploading} className="w-full py-2.5 px-3 bg-[#F59E0B] hover:bg-[#D97706] text-[#020617] text-[9px] font-black uppercase tracking-widest rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">{docUploading ? 'hourglass_top' : 'cloud_upload'}</span>
                        {docUploading ? 'ENVIANDO...' : 'ENVIAR'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* List */}
                <div className="space-y-3">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-[#F59E0B]">Documentos Enviados</h3>
                  {docListLoading ? (
                    <div className="flex justify-center py-4">
                      <div className="w-5 h-5 border-4 border-[#F59E0B] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : docList.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {docList.map((doc, idx) => {
                        const td = doc.tipoDocumento || doc.tipo_documento || '—';
                        const nome = doc.nome || td;
                        const k = doc.id || idx;
                        return (
                          <div key={k} className="bg-slate-50/50 dark:bg-[#0B0F19]/50 border border-slate-200 dark:border-slate-800 rounded-xl p-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-[18px] text-[#F59E0B]">description</span>
                              <div>
                                <p className="text-xs font-black text-slate-700 dark:text-white uppercase">{td}</p>
                                <p className="text-[8px] font-bold text-slate-400 truncate max-w-[120px]">{nome}</p>
                              </div>
                            </div>
                            <button type="button" onClick={() => handleDocDownload(doc)} disabled={docDownloading[k]} className="py-1 px-2.5 text-[8px] font-black uppercase tracking-widest rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0B0F19] text-slate-600 dark:text-slate-300 hover:border-[#F59E0B] hover:text-[#F59E0B] transition-all disabled:opacity-50 flex items-center gap-1">
                              <span className="material-symbols-outlined text-[12px]">{docDownloading[k] ? 'hourglass_top' : 'download'}</span>
                              BAIXAR
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic py-3">Nenhum documento enviado.</p>
                  )}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="flex gap-3 pt-4 mt-2 border-t border-slate-100 dark:border-slate-800/50">
              {editTab !== 'documentos' && (
                <button
                  onClick={handleEditUpdate}
                  disabled={editSaving}
                  className="flex-1 bg-[#F59E0B] hover:bg-[#D97706] text-[#020617] text-[12px] font-black uppercase tracking-widest py-4 px-6 rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-[#F59E0B]/20"
                >
                  {editSaving ? 'SALVANDO...' : editTab === 'dados' ? 'SALVAR DADOS' : 'SALVAR ENDEREÇO'}
                </button>
              )}
              <button type="button" onClick={cancelEditModal}
                className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-[12px] font-black uppercase tracking-widest py-4 px-6 rounded-xl transition-all">
                {editTab === 'documentos' ? 'FECHAR' : 'CANCELAR'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminEntityList;
