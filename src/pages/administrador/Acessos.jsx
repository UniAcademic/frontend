import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { API_ENDPOINTS } from '@/config/api.config';
import { getAuthHeaders } from '@/lib/http';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

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
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ acesso: '', descricao: '' });
  const [originalForm, setOriginalForm] = useState(null);
  const [editSaving, setEditSaving] = useState(false);
  const [viewingAcesso, setViewingAcesso] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [exporting, setExporting] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const buildAuthHeaders = () => getAuthHeaders(user?.accessToken);

  const fetchAcessos = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_ENDPOINTS.ACESSOS.BASE, buildAuthHeaders());
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

    if (!formData.acesso?.trim()) {
      showToast('Nome do acesso é obrigatório', 'error');
      return;
    }
    if (!formData.descricao?.trim()) {
      showToast('Descrição é obrigatória', 'error');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        acesso: formData.acesso.trim(),
        descricao: formData.descricao.trim(),
      };

      const res = await fetch(API_ENDPOINTS.ACESSOS.BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user?.accessToken}` },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.mensagem || `Erro ${res.status}`);
      }
      setShowForm(false);
      setFormData({ acesso: '', descricao: '' });
      fetchAcessos();
      showToast('Acesso criado com sucesso!');
    } catch (err) {
      showToast(err.message, 'error');
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
    setShowEditModal(true);
  };

  const cancelEdit = () => {
    setEditingAcesso(null);
    setShowEditModal(false);
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
      const res = await fetch(API_ENDPOINTS.ACESSOS.BY_ID(acessoId), {
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
      showToast('Acesso atualizado com sucesso!');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setEditSaving(false);
    }
  };

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
          <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">GESTÃO DE ACESSOS</h1>
          <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mt-2">
            PERMISSÕES DO SISTEMA • {filtered.length} REGISTROS
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={async () => {
              if (exporting || !acessos.length) return;
              setExporting(true);
              try {
                const res = await fetch(`${API_ENDPOINTS.ACESSOS.BASE}?size=9999`, buildAuthHeaders());
                const data = await res.json();
                const allData = data.content || data || [];
                const cols = [
                  { key: 'id', label: 'ID', w: 12 },
                  { key: 'acesso', label: 'ACESSO', w: 30 },
                  { key: 'descricao', label: 'DESCRI\u00c7\u00c3O', w: 82.29 },
                ];
                const workbook = new ExcelJS.Workbook();
                workbook.creator = 'UniAcadem';
                const ws = workbook.addWorksheet('Acessos');
                ws.columns = cols.map(c => ({ width: c.w }));
                ws.addTable({ name: 'TabelaAcessos', ref: 'A1', headerRow: true, totalsRow: false, style: { theme: 'TableStyleMedium2', showRowStripes: true }, columns: cols.map(c => ({ name: c.label, filterButton: true })), rows: allData.map(r => cols.map(c => r[c.key] ?? '')) });
                const headerRow = ws.getRow(1);
                headerRow.eachCell(cell => { cell.font = { bold: true, color: { argb: 'FF000000' }, size: 11 }; cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD97706' } }; cell.alignment = { horizontal: 'center', vertical: 'middle' }; });
                headerRow.height = 28;
                for (let i = 2; i <= ws.rowCount; i++) { ws.getRow(i).eachCell(cell => { cell.alignment = { vertical: 'middle' }; }); ws.getRow(i).height = 22; }
                const buffer = await workbook.xlsx.writeBuffer();
                saveAs(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), `uniacadem_acessos_${new Date().toISOString().split('T')[0]}.xlsx`);
                showToast(`${allData.length} acessos exportados com sucesso!`);
              } catch (err) { console.error(err); showToast('Erro ao exportar.', 'error'); } finally { setExporting(false); }
            }}
            disabled={exporting}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-black uppercase tracking-widest py-3 px-5 rounded-xl transition-all shadow-lg shadow-emerald-600/10 flex items-center gap-2 disabled:opacity-50"
          >
            {exporting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <span className="material-symbols-outlined text-[16px]">file_download</span>}
            {exporting ? 'EXPORTANDO...' : 'EXCEL'}
          </button>
          <button
            onClick={() => { setShowForm(!showForm); setEditingAcesso(null); }}
            className="bg-[#F59E0B] hover:bg-[#D97706] text-[#020617] text-[10px] font-black uppercase tracking-widest py-3 px-6 rounded-xl transition-all shadow-lg shadow-[#F59E0B]/10 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">add</span>
            NOVO ACESSO
          </button>
        </div>
      </div>

      {/* Create Acesso Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <form onSubmit={handleSave} className="bg-white dark:bg-[#020617] w-full max-w-xl p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6 shadow-2xl relative">
            <button type="button" onClick={() => setShowForm(false)} className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>

            <div>
              <h2 className="text-xl font-black uppercase tracking-tight text-slate-800 dark:text-slate-100 mb-1">Novo Acesso</h2>
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Preencha os dados para criar o acesso</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1 block">Nome do Acesso</label>
                <input type="text" required placeholder="Ex: USUARIO:CONSULTAR" value={formData.acesso} onChange={e => setFormData({ ...formData, acesso: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#F59E0B]" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1 block">Descrição</label>
                <input type="text" required placeholder="Ex: Permissão para consultar usuários" value={formData.descricao} onChange={e => setFormData({ ...formData, descricao: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#F59E0B]" />
              </div>
            </div>

            <div className="flex gap-3 pt-4 mt-2 border-t border-slate-100 dark:border-slate-800/50">
              <button type="submit" disabled={saving}
                className="flex-1 bg-[#F59E0B] hover:bg-[#D97706] text-[#020617] text-[12px] font-black uppercase tracking-widest py-4 px-6 rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-[#F59E0B]/20">
                {saving ? 'CRIANDO ACESSO...' : 'CRIAR ACESSO'}
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
                      <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded">{a.acesso || a.nome}</span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-xs text-slate-500">{a.descricao}</span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setViewingAcesso(a)}
                          className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-emerald-500 flex items-center justify-center transition-colors" title="Visualizar Acesso">
                          <span className="material-symbols-outlined text-[18px]">visibility</span>
                        </button>
                        <button onClick={() => startEdit(a)}
                          className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-blue-500 flex items-center justify-center transition-colors" title="Editar Acesso">
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
        {!loading && filtered.length === 0 && (
          <div className="p-10 text-center text-slate-400 uppercase text-[10px] font-black tracking-widest">Nenhum acesso encontrado</div>
        )}
      </div>

      {/* Edit Acesso Modal */}
      {showEditModal && editingAcesso && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#020617] w-full max-w-xl p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6 shadow-2xl relative">
            <button type="button" onClick={cancelEdit} className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>

            <div>
              <h2 className="text-xl font-black uppercase tracking-tight text-slate-800 dark:text-slate-100 mb-1">Editar Acesso</h2>
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Atualize os dados do acesso</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1 block">Nome do Acesso</label>
                <input
                  type="text"
                  placeholder="Ex: USUARIO:CONSULTAR"
                  value={editForm.acesso}
                  onChange={e => setEditForm({ ...editForm, acesso: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#F59E0B]"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1 block">Descrição</label>
                <input
                  type="text"
                  placeholder="Ex: Permissão para consultar usuários"
                  value={editForm.descricao}
                  onChange={e => setEditForm({ ...editForm, descricao: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#F59E0B]"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4 mt-2 border-t border-slate-100 dark:border-slate-800/50">
              <button
                onClick={() => handleUpdate(editingAcesso)}
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

      {/* View Acesso Modal */}
      {viewingAcesso && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#020617] w-full max-w-lg p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl relative">
            <button type="button" onClick={() => setViewingAcesso(null)} className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>

            <div className="mb-6">
              <h2 className="text-xl font-black uppercase tracking-tight text-slate-800 dark:text-slate-100 mb-1">Detalhes do Acesso</h2>
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Informações completas</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">ID</label>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">#{viewingAcesso.id}</p>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Nome do Acesso</label>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase">{viewingAcesso.acesso || viewingAcesso.nome}</p>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Descrição</label>
                <p className="text-sm text-slate-600 dark:text-slate-400">{viewingAcesso.descricao || '—'}</p>
              </div>
            </div>

            <div className="flex gap-3 pt-5 mt-6 border-t border-slate-100 dark:border-slate-800/50">
              <button type="button" onClick={() => setViewingAcesso(null)}
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

export default Acessos;
