import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { API_ENDPOINTS } from '@/config/api.config';
import { getAuthHeaders } from '@/lib/http';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const Usuarios = () => {
  const { user } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ nome: '', email: '', matricula: '' });
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ nome: '', email: '', celular: '' });
  const [originalForm, setOriginalForm] = useState(null);
  const [editSaving, setEditSaving] = useState(false);
  const [viewingUser, setViewingUser] = useState(null);
  const [formData, setFormData] = useState({ nome: '', email: '', celular: '', senha: '', tipo_usuario: '', roles: [{ role: '' }] });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [exporting, setExporting] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const buildAuthHeaders = () => getAuthHeaders(user?.accessToken);

  const fetchUsuarios = async (pageNum = 0, currentFilters = filters) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        API_ENDPOINTS.USUARIOS.PAGINATED(pageNum, 10, 'id', currentFilters), 
        buildAuthHeaders()
      );
      if (!res.ok) throw new Error(`Erro ${res.status}`);
      const data = await res.json();

      if (data.content) {
        setUsuarios(data.content);
        setTotalPages(data.totalPages || 0);
        setTotalElements(data.totalElements || 0);
        setPage(pageNum);
      } else if (Array.isArray(data)) {
        setUsuarios(data);
        setTotalElements(data.length);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsuarios(); }, []);

  const handleApplyFilters = (e) => {
    e?.preventDefault();
    setShowFiltersModal(false);
    fetchUsuarios(0, filters);
  };

  const handleClearFilters = () => {
    const emptyFilters = { nome: '', email: '', matricula: '' };
    setFilters(emptyFilters);
    fetchUsuarios(0, emptyFilters);
    setShowFiltersModal(false);
  };

  const startEdit = (u) => {
    setEditingUser(u.id);
    const snapshot = { nome: u.nome || '', email: u.email || '', celular: u.celular || '' };
    setEditForm(snapshot);
    setOriginalForm(snapshot);
    setShowEditModal(true);
  };

  const cancelEdit = () => {
    setEditingUser(null);
    setShowEditModal(false);
    setEditForm({ nome: '', email: '', celular: '' });
    setOriginalForm(null);
  };

  const getChangedFields = () => {
    if (!originalForm) return {};
    const changed = {};
    for (const key of Object.keys(editForm)) {
      if (editForm[key] !== originalForm[key]) changed[key] = editForm[key];
    }
    return changed;
  };

  const handleUpdate = async (userId) => {
    const changed = getChangedFields();
    if (Object.keys(changed).length === 0) {
      cancelEdit();
      return;
    }
    setEditSaving(true);
    try {
      const res = await fetch(API_ENDPOINTS.USUARIOS.BY_ID(userId), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user?.accessToken}` },
        body: JSON.stringify(changed)
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.mensagem || `Erro ${res.status}`);
      }
      cancelEdit();
      fetchUsuarios(page);
      showToast('Usuário atualizado com sucesso!');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setEditSaving(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    // Validação dos campos obrigatórios
    if (!formData.nome?.trim()) {
      showToast('Nome é obrigatório', 'error');
      return;
    }
    if (!formData.email?.trim()) {
      showToast('Email é obrigatório', 'error');
      return;
    }
    if (!formData.senha?.trim()) {
      showToast('Senha é obrigatória', 'error');
      return;
    }
    if (!formData.tipo_usuario?.trim()) {
      showToast('Tipo de usuário é obrigatório', 'error');
      return;
    }
    
    setSaving(true);
    try {
      const payload = {
        senha: formData.senha,
        email: formData.email,
        celular: formData.celular,
        nome: formData.nome,
        tipo_usuario: formData.tipo_usuario,
        roles: [{ role: formData.tipo_usuario }]
      };
      
      const res = await fetch(API_ENDPOINTS.USUARIOS.BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user?.accessToken}` },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.mensagem || `Erro ${res.status}`);
      }
      setShowForm(false);
      setFormData({ nome: '', email: '', celular: '', senha: '', tipo_usuario: '', roles: [{ role: '' }] });
      fetchUsuarios(page);
      showToast('Usuário criado com sucesso!');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  // Get count of active filters
  const activeFiltersCount = Object.values(filters).filter(val => val.trim() !== '').length;

  return (
    <div className="p-8 flex flex-col gap-8 relative">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed bottom-5 right-5 z-[100] px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 transition-all animate-fade-in-up ${toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
          <span className="material-symbols-outlined">{toast.type === 'success' ? 'check_circle' : 'error'}</span>
          <span className="font-bold text-sm">{toast.message}</span>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">GESTÃO DE USUÁRIOS</h1>
          <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mt-2">
            ADMINISTRAÇÃO DE SISTEMA • {totalElements} REGISTROS
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={async () => {
              if (exporting) return;
              setExporting(true);
              try {
                const res = await fetch(API_ENDPOINTS.USUARIOS.PAGINATED(0, 9999, 'id', filters), buildAuthHeaders());
                const data = await res.json();
                const allData = data.content || data || [];
                if (!allData.length) { showToast('Nenhum registro para exportar.', 'error'); return; }
                const cols = [
                  { key: 'id', label: 'ID', w: 39.29 },
                  { key: 'matricula', label: 'MATR\u00cdCULA', w: 18 },
                  { key: 'nome', label: 'NOME', w: 30 },
                  { key: 'email', label: 'EMAIL', w: 30 },
                  { key: 'celular', label: 'CELULAR', w: 18 },
                  { key: 'roles', label: 'TIPO', w: 25 },
                ];
                const workbook = new ExcelJS.Workbook();
                workbook.creator = 'UniAcadem';
                const ws = workbook.addWorksheet('Usuarios');
                ws.columns = cols.map(c => ({ width: c.w }));
                ws.addTable({ name: 'TabelaUsuarios', ref: 'A1', headerRow: true, totalsRow: false, style: { theme: 'TableStyleMedium2', showRowStripes: true }, columns: cols.map(c => ({ name: c.label, filterButton: true })), rows: allData.map(r => cols.map(c => {
                  if (c.key === 'roles') { return (r.roles || []).map(role => role.role || '').join(', '); }
                  return r[c.key] ?? '';
                })) });
                const headerRow = ws.getRow(1);
                headerRow.eachCell(cell => { cell.font = { bold: true, color: { argb: 'FF000000' }, size: 11 }; cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD97706' } }; cell.alignment = { horizontal: 'center', vertical: 'middle' }; });
                headerRow.height = 28;
                for (let i = 2; i <= ws.rowCount; i++) { ws.getRow(i).eachCell(cell => { cell.alignment = { vertical: 'middle' }; }); ws.getRow(i).height = 22; }
                const buffer = await workbook.xlsx.writeBuffer();
                saveAs(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), `uniacadem_usuarios_${new Date().toISOString().split('T')[0]}.xlsx`);
                showToast(`${allData.length} usu\u00e1rios exportados com sucesso!`);
              } catch (err) { console.error(err); showToast('Erro ao exportar.', 'error'); } finally { setExporting(false); }
            }}
            disabled={exporting}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-black uppercase tracking-widest py-3 px-5 rounded-xl transition-all shadow-lg shadow-emerald-600/10 flex items-center gap-2 disabled:opacity-50"
          >
            {exporting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <span className="material-symbols-outlined text-[16px]">file_download</span>}
            {exporting ? 'EXPORTANDO...' : 'EXCEL'}
          </button>
          <button
            onClick={() => setShowFiltersModal(true)}
            className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-black uppercase tracking-widest py-3 px-6 rounded-xl transition-all shadow-sm flex items-center gap-2 relative"
          >
            <span className="material-symbols-outlined text-[18px]">filter_list</span>
            FILTRAR
            {activeFiltersCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#F59E0B] text-[#020617] w-5 h-5 flex items-center justify-center rounded-full text-[10px] shadow-lg font-black">
                {activeFiltersCount}
              </span>
            )}
          </button>
          <button
            onClick={() => { setShowForm(!showForm); setEditingUser(null); }}
            className="bg-[#F59E0B] hover:bg-[#D97706] text-[#020617] text-[10px] font-black uppercase tracking-widest py-3 px-6 rounded-xl transition-all shadow-lg shadow-[#F59E0B]/10 flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            NOVO USUÁRIO
          </button>
        </div>
      </div>

      {/* Active Filters Badges */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-[10px] font-bold text-slate-500 uppercase mr-2">Filtros Ativos:</span>
          {Object.entries(filters).map(([key, value]) => {
            if (!value.trim()) return null;
            return (
              <div key={key} className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 px-3 py-1 rounded-full text-[10px] font-bold uppercase">
                <span className="opacity-70">{key}:</span> {value}
                <button onClick={() => {
                  const newFilters = { ...filters, [key]: '' };
                  setFilters(newFilters);
                  fetchUsuarios(0, newFilters);
                }} className="ml-1 hover:text-red-500 transition-colors">
                  <span className="material-symbols-outlined text-[14px] align-middle">close</span>
                </button>
              </div>
            );
          })}
          <button onClick={handleClearFilters} className="text-[10px] font-bold text-slate-400 hover:text-red-500 underline ml-2 transition-colors">Limpar Todos</button>
        </div>
      )}

      {/* Advanced Filters Modal */}
      {showFiltersModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <form onSubmit={handleApplyFilters} className="bg-white dark:bg-[#020617] w-full max-w-lg p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6 shadow-2xl relative">
            <button type="button" onClick={() => setShowFiltersModal(false)} className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 transition-colors">
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
            </div>

            <div className="flex gap-3 pt-4 mt-2 border-t border-slate-100 dark:border-slate-800/50">
              <button type="submit"
                className="flex-1 bg-[#F59E0B] hover:bg-[#D97706] text-[#020617] text-[12px] font-black uppercase tracking-widest py-4 px-6 rounded-xl transition-all shadow-lg shadow-[#F59E0B]/20">
                APLICAR FILTROS
              </button>
              <button type="button" onClick={handleClearFilters}
                className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-[12px] font-black uppercase tracking-widest py-4 px-6 rounded-xl transition-all">
                LIMPAR
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Create Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <form onSubmit={handleSave} className="bg-white dark:bg-[#020617] w-full max-w-xl p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6 shadow-2xl relative">
            <button type="button" onClick={() => setShowForm(false)} className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
            
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight text-slate-800 dark:text-slate-100 mb-1">Novo Usuário</h2>
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Preencha os dados para criar o usuário</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1 block">Nome</label>
                <input type="text" required placeholder="Digite o nome" value={formData.nome} onChange={e => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#F59E0B]" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1 block">Email</label>
                <input type="email" required placeholder="Digite o email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#F59E0B]" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1 block">Celular</label>
                <input type="text" placeholder="Apenas números" value={formData.celular} onChange={e => setFormData({ ...formData, celular: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#F59E0B]" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1 block">Senha</label>
                <input type="password" required placeholder="Digite a senha" value={formData.senha} onChange={e => setFormData({ ...formData, senha: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#F59E0B]" />
              </div>
              <div className="md:col-span-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1 block">Tipo de Usuário (Role)</label>
                <select required value={formData.tipo_usuario} onChange={e => setFormData({ ...formData, tipo_usuario: e.target.value, roles: [{ role: e.target.value }] })}
                  className="w-full bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#F59E0B]">
                  <option value="" disabled>Selecione um tipo...</option>
                  <option value="ALUNO">Aluno</option>
                  <option value="PROFESSOR">Professor</option>
                  <option value="COORDENADOR">Coordenador</option>
                  <option value="ADMINISTRADOR">Administrador</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 pt-4 mt-2 border-t border-slate-100 dark:border-slate-800/50">
              <button type="submit" disabled={saving}
                className="flex-1 bg-[#F59E0B] hover:bg-[#D97706] text-[#020617] text-[12px] font-black uppercase tracking-widest py-4 px-6 rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-[#F59E0B]/20">
                {saving ? 'CRIANDO USUÁRIO...' : 'CRIAR USUÁRIO'}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-[12px] font-black uppercase tracking-widest py-4 px-6 rounded-xl transition-all">
                CANCELAR
              </button>
            </div>
          </form>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-[#020617] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-10 flex justify-center"><div className="w-8 h-8 border-4 border-[#F59E0B] border-t-transparent rounded-full animate-spin"></div></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-50 dark:bg-[#0B0F19] border-b border-slate-100 dark:border-slate-800">
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">ID</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">MATRÍCULA</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">NOME</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">EMAIL</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Celular</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">STATUS</th>
                  <th className="px-2 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-left ">AÇÕES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {usuarios.map(u => (
                  <tr key={u.id || u.matricula} className="hover:bg-slate-50 dark:hover:bg-slate-800/10 transition-colors">
                    <td className="px-6 py-5"><span className="text-[10px] font-black text-slate-400 truncate max-w-[80px] inline-block" title={u.id}>#{String(u.id).slice(0, 8)}</span></td>
                    <td className="px-6 py-5"><span className="text-[10px] font-black text-slate-400">{u.matricula}</span></td>
                    <td className="px-6 py-5">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">{u.nome}</span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-xs text-slate-500">{u.email}</span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-xs text-slate-500">{u.celular || '-'}</span>
                    </td>
                    
                    <td className="px-6 py-5">
                      <div className="flex flex-wrap gap-1">
                        {(u.roles || []).map((r, i) => (
                          <span key={i} className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded">
                            {typeof r === 'string' ? r : r.role || r.nome}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setViewingUser(u)}
                          className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-emerald-500 flex items-center justify-center transition-colors" title="Visualizar Usuário">
                          <span className="material-symbols-outlined text-[18px]">visibility</span>
                        </button>
                        <button onClick={() => startEdit(u)}
                          className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-blue-500 flex items-center justify-center transition-colors" title="Editar">
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!loading && usuarios.length === 0 && (
          <div className="p-10 text-center text-slate-400 uppercase text-[10px] font-black tracking-widest">Nenhum usuário encontrado</div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button disabled={page === 0} onClick={() => fetchUsuarios(page - 1)}
            className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-[10px] font-black uppercase disabled:opacity-30">
            Anterior
          </button>
          <span className="px-4 py-2 text-[10px] font-black text-slate-500">{page + 1} / {totalPages}</span>
          <button disabled={page >= totalPages - 1} onClick={() => fetchUsuarios(page + 1)}
            className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-[10px] font-black uppercase disabled:opacity-30">
            Próxima
          </button>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#020617] w-full max-w-xl p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6 shadow-2xl relative">
            <button type="button" onClick={cancelEdit} className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>

            <div>
              <h2 className="text-xl font-black uppercase tracking-tight text-slate-800 dark:text-slate-100 mb-1">Editar Usuário</h2>
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Atualize os dados do usuário</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1 block">Nome</label>
                <input
                  type="text"
                  placeholder="Nome completo"
                  value={editForm.nome}
                  onChange={e => setEditForm({ ...editForm, nome: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#F59E0B]"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1 block">Email</label>
                <input
                  type="email"
                  placeholder="email@exemplo.com"
                  value={editForm.email}
                  onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#F59E0B]"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1 block">Celular</label>
                <input
                  type="text"
                  placeholder="Apenas números"
                  value={editForm.celular}
                  onChange={e => setEditForm({ ...editForm, celular: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#F59E0B]"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4 mt-2 border-t border-slate-100 dark:border-slate-800/50">
              <button
                onClick={() => handleUpdate(editingUser)}
                disabled={editSaving}
                className="flex-1 bg-[#F59E0B] hover:bg-[#D97706] text-[#020617] text-[12px] font-black uppercase tracking-widest py-4 px-6 rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-[#F59E0B]/20"
              >
                {editSaving ? 'SALVANDO...' : 'SALVAR ALTERAÇÕES'}
              </button>
              <button type="button" onClick={cancelEdit}
                className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-[12px] font-black uppercase tracking-widest py-4 px-6 rounded-xl transition-all">
                CANCELAR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View User Modal */}
      {viewingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#020617] w-full max-w-xl p-10 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl relative overflow-hidden">
            <button type="button" onClick={() => setViewingUser(null)} className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors z-10">
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>

            <div className="mb-6">
              <h2 className="text-xl font-black uppercase tracking-tight text-slate-800 dark:text-slate-100 mb-1">Detalhes do Usuário</h2>
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Informações completas</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">ID</label>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300 break-all">#{viewingUser.id}</p>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Matrícula</label>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{viewingUser.matricula || '—'}</p>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Nome</label>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase">{viewingUser.nome}</p>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Email</label>
                <p className="text-sm text-slate-600 dark:text-slate-400 break-all">{viewingUser.email}</p>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Celular</label>
                <p className="text-sm text-slate-600 dark:text-slate-400">{viewingUser.celular || '—'}</p>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Roles</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {(viewingUser.roles || []).length > 0 ? (
                    (viewingUser.roles || []).map((r, i) => (
                      <span key={i} className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded">
                        {typeof r === 'string' ? r : r.role || r.nome}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400 italic">Nenhuma role atribuída</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-5 mt-6 border-t border-slate-100 dark:border-slate-800/50">
              <button type="button" onClick={() => setViewingUser(null)}
                className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-[12px] font-black uppercase tracking-widest py-4 px-6 rounded-xl transition-all">
                FECHAR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Usuarios;
