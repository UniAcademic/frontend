import React, { useState, useEffect } from 'react';
import { useAuth } from '@contexts/AuthContext';

const USER_API_URL = '/api/ms-usuario';

const Usuarios = () => {
  const { user } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
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

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`${USER_API_URL}/usuarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user?.accessToken}` },
        body: JSON.stringify(formData)
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.mensagem || `Erro ${res.status}`);
      }
      setShowForm(false);
      setFormData({ nome: '', email: '', celular: '', senha: '', tipo_usuario: '', roles: [{ role: '' }] });
      fetchUsuarios(page);
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
            <input type="text" required placeholder="Nome" value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})}
              className="bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white px-4 py-2.5 rounded-lg text-sm outline-none focus:ring-1 focus:ring-[#F59E0B]" />
            <input type="email" required placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
              className="bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white px-4 py-2.5 rounded-lg text-sm outline-none focus:ring-1 focus:ring-[#F59E0B]" />
            <input type="text" placeholder="Celular" value={formData.celular} onChange={e => setFormData({...formData, celular: e.target.value})}
              className="bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white px-4 py-2.5 rounded-lg text-sm outline-none focus:ring-1 focus:ring-[#F59E0B]" />
            <input type="password" required placeholder="Senha" value={formData.senha} onChange={e => setFormData({...formData, senha: e.target.value})}
              className="bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white px-4 py-2.5 rounded-lg text-sm outline-none focus:ring-1 focus:ring-[#F59E0B]" />
            <select required value={formData.tipo_usuario} onChange={e => setFormData({...formData, tipo_usuario: e.target.value})}
              className="bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white px-4 py-2.5 rounded-lg text-sm outline-none focus:ring-1 focus:ring-[#F59E0B]">
              <option value="">Tipo de Usuário</option>
              <option value="ALUNO">Aluno</option>
              <option value="PROFESSOR">Professor</option>
              <option value="COORDENADOR">Coordenador</option>
              <option value="ADMINISTRADOR">Administrador</option>
            </select>
            <input type="text" placeholder="Role (ex: ALUNO)" value={formData.roles[0]?.role || ''} onChange={e => setFormData({...formData, roles: [{ role: e.target.value }]})}
              className="bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white px-4 py-2.5 rounded-lg text-sm outline-none focus:ring-1 focus:ring-[#F59E0B]" />
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

      {/* Search */}
      <div className="bg-white dark:bg-[#020617] p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-4">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
          <input type="text" placeholder="Buscar usuários..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 dark:bg-[#0B0F19] border border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 pl-10 pr-4 py-2.5 rounded-lg text-sm outline-none focus:ring-1 focus:ring-[#F59E0B]" />
        </div>
      </div>

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
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">TIPO</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">ROLES</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {filtered.map(u => (
                  <tr key={u.id || u.matricula} className="hover:bg-slate-50 dark:hover:bg-slate-800/10 transition-colors">
                    <td className="px-8 py-5"><span className="text-[10px] font-black text-slate-400">{u.matricula}</span></td>
                    <td className="px-6 py-5"><span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">{u.nome}</span></td>
                    <td className="px-6 py-5"><span className="text-xs text-slate-500">{u.email}</span></td>
                    <td className="px-6 py-5"><span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded">{u.tipo_usuario}</span></td>
                    <td className="px-6 py-5">
                      <div className="flex flex-wrap gap-1">
                        {(u.roles || []).map((r, i) => (
                          <span key={i} className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded">
                            {typeof r === 'string' ? r : r.role || r.nome}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${u.ativo !== false ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                        {u.ativo !== false ? 'Ativo' : 'Inativo'}
                      </span>
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
