import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const USER_API_URL = '/api/ms-usuario';

const Usuarios = () => {
  const { user } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResult, setSearchResult] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ nome: '', email: '', celular: '' });
  const [originalForm, setOriginalForm] = useState(null);
  const [editSaving, setEditSaving] = useState(false);
  const [formData, setFormData] = useState({ nome: '', email: '', celular: '', senha: '', tipo_usuario: '', roles: [{ role: '' }] });
  const [saving, setSaving] = useState(false);

  const getAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${user?.accessToken}` }
  });

  const fetchUsuarios = async (pageNum = 0) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${USER_API_URL}/usuarios?page=${pageNum}&size=10&sort=id`, getAuthHeaders());
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

  const handleSearch = async () => {
    if (!searchTerm.trim()) { setSearchResult(null); return; }
    setSearchLoading(true);
    setSearchResult(null);
    try {
      const res = await fetch(`${USER_API_URL}/usuarios/matricula/${searchTerm.trim()}`, getAuthHeaders());
      if (!res.ok) throw new Error('Não encontrado');
      const data = await res.json();
      setSearchResult(data);
    } catch {
      setSearchResult('not-found');
    } finally {
      setSearchLoading(false);
    }
  };

  const startEdit = (u) => {
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
      const res = await fetch(`${USER_API_URL}/usuarios/${userId}`, {
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
      if (searchResult && searchResult !== 'not-found' && searchResult.id === userId) {
        setSearchResult({ ...searchResult, ...changed });
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setEditSaving(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    // Validação dos campos obrigatórios
    if (!formData.nome?.trim()) {
      alert('Nome é obrigatório');
      return;
    }
    if (!formData.email?.trim()) {
      alert('Email é obrigatório');
      return;
    }
    if (!formData.senha?.trim()) {
      alert('Senha é obrigatória');
      return;
    }
    if (!formData.tipo_usuario?.trim()) {
      alert('Tipo de usuário é obrigatório');
      return;
    }
    
    setSaving(true);
    try {
      // Preparar o payload removendo campos vazios
      const payload = {
        nome: formData.nome,
        email: formData.email,
        senha: formData.senha,
        tipo_usuario: formData.tipo_usuario,
        ...(formData.celular?.trim() && { celular: formData.celular }),
        ...(formData.roles?.[0]?.role?.trim() && { roles: formData.roles })
      };
      
      const res = await fetch(`${USER_API_URL}/usuarios`, {
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
      alert('Usuário criado com sucesso!');
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const filtered = usuarios.filter(u =>
    (u.nome || u.matricula || u.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 flex flex-col gap-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">GESTÃO DE USUÁRIOS</h1>
          <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mt-2">
            ADMINISTRAÇÃO DE SISTEMA • {totalElements} REGISTROS
          </p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setEditingUser(null); }}
          className="bg-[#F59E0B] hover:bg-[#D97706] text-[#020617] text-[10px] font-black uppercase tracking-widest py-3 px-6 rounded-xl transition-all shadow-lg shadow-[#F59E0B]/10 flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          NOVO USUÁRIO
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <form onSubmit={handleSave} className="bg-white dark:bg-[#020617] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-500">Novo Usuário</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" required placeholder="Nome" value={formData.nome} onChange={e => setFormData({ ...formData, nome: e.target.value })}
              className="bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white px-4 py-2.5 rounded-lg text-sm outline-none focus:ring-1 focus:ring-[#F59E0B]" />
            <input type="email" required placeholder="Email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
              className="bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white px-4 py-2.5 rounded-lg text-sm outline-none focus:ring-1 focus:ring-[#F59E0B]" />
            <input type="text" placeholder="Celular" value={formData.celular} onChange={e => setFormData({ ...formData, celular: e.target.value })}
              className="bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white px-4 py-2.5 rounded-lg text-sm outline-none focus:ring-1 focus:ring-[#F59E0B]" />
            <input type="password" required placeholder="Senha" value={formData.senha} onChange={e => setFormData({ ...formData, senha: e.target.value })}
              className="bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white px-4 py-2.5 rounded-lg text-sm outline-none focus:ring-1 focus:ring-[#F59E0B]" />
            <select placeholder="Tipo de Usuário" required value={formData.tipo_usuario  } onChange={e =>  setFormData({ 
              ...formData, tipo_usuario: e.target.value, roles: [{ role: e.target.value }]
            })  }
              className="bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white px-4 py-2.5 rounded-lg text-sm outline-none focus:ring-1 focus:ring-[#F59E0B]">
              
              <option value="ALUNO">Aluno</option>
              <option value="PROFESSOR">Professor</option>
              <option value="COORDENADOR">Coordenador</option>
              <option value="ADMINISTRADOR">Administrador</option>
            </select>


          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={saving}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase tracking-widest py-2.5 px-6 rounded-xl transition-all disabled:opacity-50">
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-black uppercase tracking-widest py-2.5 px-6 rounded-xl transition-all">
              Cancelar
            </button>
          </div>
        </form>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* .Search by matricula */}
      <div className="bg-white dark:bg-[#020617] p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-4">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
          <input type="text" placeholder="Buscar por matrícula (ex: 00100027)..." value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); if (!e.target.value.trim()) setSearchResult(null); }}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            className="w-full bg-slate-50 dark:bg-[#0B0F19] border border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 pl-10 pr-4 py-2.5 rounded-lg text-sm outline-none focus:ring-1 focus:ring-[#F59E0B]" />
        </div>
        <button onClick={handleSearch} disabled={searchLoading || !searchTerm.trim()}
          className="bg-[#F59E0B] hover:bg-[#D97706] text-[#020617] text-[10px] font-black uppercase tracking-widest py-2.5 px-5 rounded-lg transition-all disabled:opacity-50 flex items-center gap-2">
          {searchLoading ? <div className="w-4 h-4 border-2 border-[#020617] border-t-transparent rounded-full animate-spin"></div> : <span className="material-symbols-outlined text-[16px]">search</span>}
          BUSCAR
        </button>
      </div>

      {/* Search Result */}
      {searchResult && searchResult !== 'not-found' && (
        <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-blue-600">RESULTADO DA BUSCA</h3>
            <button onClick={() => setSearchResult(null)} className="text-slate-400 hover:text-slate-600"><span className="material-symbols-outlined text-[18px]">close</span></button>
          </div>
          {editingUser === searchResult.id ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div><label className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1 block">Nome</label><input type="text" value={editForm.nome} onChange={e => setEditForm({ ...editForm, nome: e.target.value })} className="bg-slate-50 dark:bg-[#0B0F19] border border-blue-300 dark:border-blue-700 text-slate-900 dark:text-white px-3 py-1.5 rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-500 w-full" /></div>
              <div><label className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1 block">Email</label><input type="email" value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} className="bg-slate-50 dark:bg-[#0B0F19] border border-blue-300 dark:border-blue-700 text-slate-900 dark:text-white px-3 py-1.5 rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-500 w-full" /></div>
              <div><label className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1 block">Celular</label><input type="text" value={editForm.celular} onChange={e => setEditForm({ ...editForm, celular: e.target.value })} className="bg-slate-50 dark:bg-[#0B0F19] border border-blue-300 dark:border-blue-700 text-slate-900 dark:text-white px-3 py-1.5 rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-500 w-full" /></div>
              <div className="md:col-span-3 flex gap-3">
                <button onClick={() => handleUpdate(searchResult.id)} disabled={editSaving} className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase tracking-widest py-2 px-5 rounded-lg disabled:opacity-50">{editSaving ? 'Salvando...' : 'Salvar'}</button>
                <button onClick={cancelEdit} className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-black uppercase tracking-widest py-2 px-5 rounded-lg">Cancelar</button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div><span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">Matrícula</span><span className="text-sm font-bold text-slate-700 dark:text-slate-300">{searchResult.matricula}</span></div>
                <div><span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">Nome</span><span className="text-sm font-bold text-slate-700 dark:text-slate-300">{searchResult.nome}</span></div>
                <div><span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">Email</span><span className="text-sm font-bold text-slate-700 dark:text-slate-300">{searchResult.email}</span></div>
                <div><span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">Celular</span><span className="text-sm font-bold text-slate-700 dark:text-slate-300">{searchResult.celular || '-'}</span></div>
              </div>
              <button onClick={() => startEdit(searchResult)} className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 hover:bg-blue-200 flex items-center justify-center transition-colors" title="Editar Usuário"><span className="material-symbols-outlined text-[18px]">edit</span></button>
            </div>
          )}
        </div>
      )}

      {searchResult === 'not-found' && (
        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl p-4 text-amber-600 text-sm font-bold flex items-center justify-between">
          <span>Nenhum usuário encontrado com a matrícula "{searchTerm}"</span>
          <button onClick={() => setSearchResult(null)} className="text-amber-400 hover:text-amber-600"><span className="material-symbols-outlined text-[18px]">close</span></button>
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
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">MATRÍCULA</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">NOME</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">EMAIL</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Celular</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">STATUS</th>
                  <th className="px-2 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-left ">AÇÕES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {filtered.map(u => (
                  <tr key={u.id || u.matricula} className="hover:bg-slate-50 dark:hover:bg-slate-800/10 transition-colors">
                    <td className="px-8 py-5"><span className="text-[10px] font-black text-slate-400">{u.matricula}</span></td>
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
                          <span key={i} className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded">
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
                      ) : (
                        <button onClick={() => startEdit(u)}
                          className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-blue-500 flex items-center justify-center transition-colors" title="Editar">
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!loading && filtered.length === 0 && (
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
    </div>
  );
};

export default Usuarios;
