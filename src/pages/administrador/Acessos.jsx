import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const USER_API_URL = '/api/ms-usuario';

const Acessos = () => {
  const { user } = useAuth();
  const [acessos, setAcessos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ acesso: '', descricao: '' });
  const [saving, setSaving] = useState(false);
  const [editingAcesso, setEditingAcesso] = useState(null);
  const [editForm, setEditForm] = useState({ acesso: '', descricao: '' });
  const [originalForm, setOriginalForm] = useState(null);
  const [editSaving, setEditSaving] = useState(false);

  const getAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${user?.accessToken}` }
  });

  const fetchAcessos = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${USER_API_URL}/acessos`, getAuthHeaders());
      if (!res.ok) throw new Error(`Erro ${res.status}`);
      const data = await res.json();
      setAcessos(data.content || data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAcessos(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`${USER_API_URL}/acessos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user?.accessToken}` },
        body: JSON.stringify(formData)
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.mensagem || `Erro ${res.status}`);
      }
      setShowForm(false);
      setFormData({ acesso: '', descricao: '' });
      fetchAcessos();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const filtered = (Array.isArray(acessos) ? acessos : []).filter(a =>
    (a.acesso || a.nome || a.descricao || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const startEdit = (a) => {
    setEditingAcesso(a.id);
    const snapshot = { acesso: a.acesso || a.nome || '', descricao: a.descricao || '' };
    setEditForm(snapshot);
    setOriginalForm(snapshot);
  };

  const cancelEdit = () => {
    setEditingAcesso(null);
    setEditForm({ acesso: '', descricao: '' });
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

  const handleUpdate = async (acessoId) => {
    const changed = getChangedFields();
    if (Object.keys(changed).length === 0) {
      cancelEdit();
      return;
    }
    setEditSaving(true);
    try {
      const res = await fetch(`${USER_API_URL}/acessos/${acessoId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user?.accessToken}` },
        body: JSON.stringify(changed)
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.mensagem || `Erro ${res.status}`);
      }
      cancelEdit();
      fetchAcessos();
    } catch (err) {
      alert(err.message);
    } finally {
      setEditSaving(false);
    }
  };

  return (
    <div className="p-8 flex flex-col gap-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">GESTÃO DE ACESSOS</h1>
          <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mt-2">
            PERMISSÕES DO SISTEMA • {filtered.length} REGISTROS
          </p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="bg-[#F59E0B] hover:bg-[#D97706] text-[#020617] text-[10px] font-black uppercase tracking-widest py-3 px-6 rounded-xl transition-all shadow-lg shadow-[#F59E0B]/10 flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">add</span>
          NOVO ACESSO
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="bg-white dark:bg-[#020617] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-500">Novo Acesso</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" required placeholder="Nome do Acesso (ex: USUARIO:CONSULTAR)" value={formData.acesso} onChange={e => setFormData({...formData, acesso: e.target.value})}
              className="bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white px-4 py-2.5 rounded-lg text-sm outline-none focus:ring-1 focus:ring-[#F59E0B]" />
            <input type="text" required placeholder="Descrição" value={formData.descricao} onChange={e => setFormData({...formData, descricao: e.target.value})}
              className="bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white px-4 py-2.5 rounded-lg text-sm outline-none focus:ring-1 focus:ring-[#F59E0B]" />
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={saving}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase tracking-widest py-2.5 px-6 rounded-xl disabled:opacity-50">{saving ? 'Salvando...' : 'Salvar'}</button>
            <button type="button" onClick={() => setShowForm(false)}
              className="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-black uppercase tracking-widest py-2.5 px-6 rounded-xl">Cancelar</button>
          </div>
        </form>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-600 dark:text-red-400 text-sm">{error}</div>
      )}

      <div className="bg-white dark:bg-[#020617] p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-4">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
          <input type="text" placeholder="Buscar acessos..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 dark:bg-[#0B0F19] border border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 pl-10 pr-4 py-2.5 rounded-lg text-sm outline-none focus:ring-1 focus:ring-[#F59E0B]" />
        </div>
      </div>

      <div className="bg-white dark:bg-[#020617] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-10 flex justify-center"><div className="w-8 h-8 border-4 border-[#F59E0B] border-t-transparent rounded-full animate-spin"></div></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-slate-50 dark:bg-[#0B0F19] border-b border-slate-100 dark:border-slate-800">
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">ID</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">ACESSO</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">DESCRIÇÃO</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">AÇÕES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {filtered.map(a => (
                  <tr key={a.id || a.acesso} className="hover:bg-slate-50 dark:hover:bg-slate-800/10 transition-colors">
                    <td className="px-8 py-5"><span className="text-[10px] font-black text-slate-400">#{a.id}</span></td>
                    <td className="px-6 py-5">
                      {editingAcesso === a.id ? (
                        <input type="text" value={editForm.acesso} onChange={e => setEditForm({...editForm, acesso: e.target.value})}
                          className="bg-slate-50 dark:bg-[#0B0F19] border border-blue-300 dark:border-blue-700 text-slate-900 dark:text-white px-3 py-1.5 rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-500 w-full" />
                      ) : (
                        <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded">{a.acesso || a.nome}</span>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      {editingAcesso === a.id ? (
                        <input type="text" value={editForm.descricao} onChange={e => setEditForm({...editForm, descricao: e.target.value})}
                          className="bg-slate-50 dark:bg-[#0B0F19] border border-blue-300 dark:border-blue-700 text-slate-900 dark:text-white px-3 py-1.5 rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-500 w-full" />
                      ) : (
                        <span className="text-xs text-slate-500">{a.descricao}</span>
                      )}
                    </td>
                    <td className="px-6 py-5 text-right">
                      {editingAcesso === a.id ? (
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleUpdate(a.id)} disabled={editSaving}
                            className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 hover:bg-emerald-200 flex items-center justify-center transition-colors disabled:opacity-50" title="Salvar">
                            <span className="material-symbols-outlined text-[18px]">check</span>
                          </button>
                          <button onClick={cancelEdit}
                            className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-red-500 flex items-center justify-center transition-colors" title="Cancelar">
                            <span className="material-symbols-outlined text-[18px]">close</span>
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => startEdit(a)}
                          className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-blue-500 flex items-center justify-center transition-colors" title="Editar Acesso">
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
          <div className="p-10 text-center text-slate-400 uppercase text-[10px] font-black tracking-widest">Nenhum acesso encontrado</div>
        )}
      </div>
    </div>
  );
};

export default Acessos;
