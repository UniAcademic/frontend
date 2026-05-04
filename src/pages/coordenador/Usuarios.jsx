import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { API_ENDPOINTS } from '@/config/api.config';
import { getAuthHeaders } from '@/lib/http';

// Roles that the coordenador can manage (create/edit)
const MANAGEABLE_ROLES = ['ALUNO', 'PROFESSOR'];

const getUserMainRole = (u) => {
  const roles = u.roles || [];
  if (roles.length === 0) return u.tipo_usuario || '';
  const first = roles[0];
  return (typeof first === 'string' ? first : first.role || first.nome || '').toUpperCase();
};

const isManageable = (u) => {
  const role = getUserMainRole(u);
  return MANAGEABLE_ROLES.includes(role);
};

const CoordenadorUsuarios = () => {
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
  const [editForm, setEditForm] = useState({ nome: '', email: '', celular: '' });
  const [originalForm, setOriginalForm] = useState(null);
  const [editSaving, setEditSaving] = useState(false);
  const [viewingUser, setViewingUser] = useState(null);
  const [formData, setFormData] = useState({ nome: '', email: '', celular: '', senha: '', tipo_usuario: '', roles: [{ role: '' }] });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

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
    if (!isManageable(u)) return;
    setEditingUser(u.id);
    const snapshot = { nome: u.nome || '', email: u.email || '', celular: u.celular || '' };
    setEditForm(snapshot);
    setOriginalForm(snapshot);
  };

  const cancelEdit = () => {
    setEditingUser(null);
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

    if (!formData.nome?.trim()) { showToast('Nome é obrigatório', 'error'); return; }
    if (!formData.email?.trim()) { showToast('Email é obrigatório', 'error'); return; }
    if (!formData.senha?.trim()) { showToast('Senha é obrigatória', 'error'); return; }
    if (!formData.tipo_usuario?.trim()) { showToast('Tipo de usuário é obrigatório', 'error'); return; }

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

  const activeFiltersCount = Object.values(filters).filter(val => val.trim() !== '').length;

  return (
    <div className="p-8 flex flex-col gap-8 relative">
      {/* Toast */}
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
            COORDENAÇÃO • {totalElements} REGISTROS
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowFiltersModal(true)}
            className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-black uppercase tracking-widest py-3 px-6 rounded-xl transition-all shadow-sm flex items-center gap-2 relative"
          >
            <span className="material-symbols-outlined text-[18px]">filter_list</span>
            FILTRAR
            {activeFiltersCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-blue-500 text-white w-5 h-5 flex items-center justify-center rounded-full text-[10px] shadow-lg">
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
              <div key={key} className="flex items-center gap-1 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-full text-[10px] font-bold uppercase">
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

      {/* Filters Modal */}
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
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1 block">Nome</label>
                <input type="text" placeholder="Ex: Maria" value={filters.nome} onChange={e => setFilters({ ...filters, nome: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#F59E0B]" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1 block">Matrícula</label>
                <input type="text" placeholder="Ex: 00100027" value={filters.matricula} onChange={e => setFilters({ ...filters, matricula: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#F59E0B]" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1 block">Email</label>
                <input type="email" placeholder="Ex: maria@email.com" value={filters.email} onChange={e => setFilters({ ...filters, email: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#F59E0B]" />
              </div>
            </div>

            <div className="flex gap-3 pt-4 mt-2 border-t border-slate-100 dark:border-slate-800/50">
              <button type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-black uppercase tracking-widest py-4 px-6 rounded-xl transition-all shadow-lg shadow-blue-500/20">
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

      {/* Create Form Modal — only ALUNO and PROFESSOR */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <form onSubmit={handleSave} className="bg-white dark:bg-[#020617] w-full max-w-xl p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6 shadow-2xl relative">
            <button type="button" onClick={() => setShowForm(false)} className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>

            <div>
              <h2 className="text-xl font-black uppercase tracking-tight text-slate-800 dark:text-slate-100 mb-1">Novo Usuário</h2>
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Criar aluno ou professor</p>
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
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1 block">Tipo de Usuário</label>
                <select required value={formData.tipo_usuario} onChange={e => setFormData({ ...formData, tipo_usuario: e.target.value, roles: [{ role: e.target.value }] })}
                  className="w-full bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#F59E0B]">
                  <option value="" disabled>Selecione um tipo...</option>
                  <option value="ALUNO">Aluno</option>
                  <option value="PROFESSOR">Professor</option>
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
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-600 dark:text-red-400 text-sm">{error}</div>
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
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">CELULAR</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">TIPO</th>
                  <th className="px-2 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-left">AÇÕES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {usuarios.map(u => {
                  const manageable = isManageable(u);
                  const mainRole = getUserMainRole(u);
                  return (
                    <tr key={u.id || u.matricula} className="hover:bg-slate-50 dark:hover:bg-slate-800/10 transition-colors">
                      <td className="px-6 py-5"><span className="text-[10px] font-black text-slate-400 truncate max-w-[80px] inline-block" title={u.id}>#{String(u.id).slice(0, 8)}</span></td>
                      <td className="px-6 py-5"><span className="text-[10px] font-black text-slate-400">{u.matricula}</span></td>
                      <td className="px-6 py-5">
                        {editingUser === u.id ? (
                          <input type="text" value={editForm.nome} onChange={e => setEditForm({ ...editForm, nome: e.target.value })} className="bg-slate-50 dark:bg-[#0B0F19] border border-blue-300 dark:border-blue-700 text-slate-900 dark:text-white px-3 py-1.5 rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-500 w-full" />
                        ) : (
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">{u.nome}</span>
                        )}
                      </td>
                      <td className="px-6 py-5">
                        {editingUser === u.id ? (
                          <input type="email" value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} className="bg-slate-50 dark:bg-[#0B0F19] border border-blue-300 dark:border-blue-700 text-slate-900 dark:text-white px-3 py-1.5 rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-500 w-full" />
                        ) : (
                          <span className="text-xs text-slate-500">{u.email}</span>
                        )}
                      </td>
                      <td className="px-6 py-5">
                        {editingUser === u.id ? (
                          <input type="text" value={editForm.celular} onChange={e => setEditForm({ ...editForm, celular: e.target.value })} className="bg-slate-50 dark:bg-[#0B0F19] border border-blue-300 dark:border-blue-700 text-slate-900 dark:text-white px-3 py-1.5 rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-500 w-full" />
                        ) : (
                          <span className="text-xs text-slate-500">{u.celular || '-'}</span>
                        )}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-wrap gap-1">
                          {(u.roles || []).map((r, i) => (
                            <span key={i} className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                              manageable
                                ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                            }`}>
                              {typeof r === 'string' ? r : r.role || r.nome}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        {editingUser === u.id ? (
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => handleUpdate(u.id)} disabled={editSaving}
                              className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 hover:bg-emerald-200 flex items-center justify-center transition-colors disabled:opacity-50" title="Salvar">
                              <span className="material-symbols-outlined text-[18px]">check</span>
                            </button>
                            <button onClick={cancelEdit}
                              className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-red-500 flex items-center justify-center transition-colors" title="Cancelar">
                              <span className="material-symbols-outlined text-[18px]">close</span>
                            </button>
                          </div>
                        ) : manageable ? (
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => setViewingUser(u)}
                              className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-emerald-500 flex items-center justify-center transition-colors" title="Visualizar">
                              <span className="material-symbols-outlined text-[18px]">visibility</span>
                            </button>
                            <button onClick={() => startEdit(u)}
                              className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-blue-500 flex items-center justify-center transition-colors" title="Editar">
                              <span className="material-symbols-outlined text-[18px]">edit</span>
                            </button>
                          </div>
                        ) : (
                          <span className="text-[9px] font-bold uppercase tracking-widest text-slate-300 dark:text-slate-600">Sem ação</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
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

export default CoordenadorUsuarios;
