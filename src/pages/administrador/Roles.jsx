import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { API_ENDPOINTS } from '@/config/api.config';
import { getAuthHeaders } from '@/lib/http';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const Roles = () => {
  const { user } = useAuth();
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ role: '', descricao: '' });
  const [saving, setSaving] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ role: '', descricao: '' });
  const [originalForm, setOriginalForm] = useState(null);
  const [editSaving, setEditSaving] = useState(false);

  // View Modal state
  const [viewingRole, setViewingRole] = useState(null);

  // Link Acessos Modal state
  const [linkModalRoleId, setLinkModalRoleId] = useState(null);
  const [linkModalRoleName, setLinkModalRoleName] = useState('');
  const [allAcessos, setAllAcessos] = useState([]);
  const [selectedAcessos, setSelectedAcessos] = useState([]);
  const [loadingAcessos, setLoadingAcessos] = useState(false);
  const [linkSaving, setLinkSaving] = useState(false);
  const [acessoSearch, setAcessoSearch] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [exporting, setExporting] = useState(false);

  // Unlink Acessos Modal state
  const [unlinkModalRoleId, setUnlinkModalRoleId] = useState(null);
  const [unlinkModalRoleName, setUnlinkModalRoleName] = useState('');
  const [unlinkRoleAcessos, setUnlinkRoleAcessos] = useState([]);
  const [unlinkSelected, setUnlinkSelected] = useState([]);
  const [unlinkSaving, setUnlinkSaving] = useState(false);
  const [unlinkSearch, setUnlinkSearch] = useState('');

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const buildAuthHeaders = () => getAuthHeaders(user?.accessToken);

  const fetchRoles = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_ENDPOINTS.ROLES.BASE, buildAuthHeaders());
      if (!res.ok) throw new Error(`Erro ${res.status}`);
      const data = await res.json();
      const rawRoles = data.content || data || [];
      // Deduplica acessos dentro de cada role
      const deduped = rawRoles.map(r => {
        const acessosList = r.acessos || r.acesso || [];
        const seen = new Set();
        const uniqueAcessos = acessosList.filter(a => {
          const name = typeof a === 'string' ? a : a.acesso || a.nome || '';
          if (seen.has(name)) return false;
          seen.add(name);
          return true;
        });
        return { ...r, acessos: uniqueAcessos };
      });
      setRoles(deduped);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRoles(); }, []);

  // Fetch all acessos from API for the link modal
  const fetchAllAcessos = async () => {
    setLoadingAcessos(true);
    try {
      const res = await fetch(`${API_ENDPOINTS.ACESSOS.BASE}?size=9999`, buildAuthHeaders());
      if (!res.ok) throw new Error(`Erro ${res.status}`);
      const data = await res.json();
      const raw = data.content || data || [];
      // Deduplica por nome do acesso
      const seen = new Set();
      const unique = raw.filter(a => {
        const name = typeof a === 'string' ? a : a.acesso || a.nome || '';
        if (seen.has(name)) return false;
        seen.add(name);
        return true;
      });
      setAllAcessos(unique);
    } catch (err) {
      console.error('Erro ao buscar acessos:', err);
      setAllAcessos([]);
    } finally {
      setLoadingAcessos(false);
    }
  };

  // Open the link acessos modal for a specific role
  const openLinkModal = (role) => {
    // Pre-select acessos already linked to this role
    const alreadyLinked = [...new Set((role.acessos || role.acesso || []).map(a =>
      typeof a === 'string' ? a : a.acesso || a.nome
    ))];
    setSelectedAcessos(alreadyLinked);
    setLinkModalRoleId(role.id);
    setLinkModalRoleName(role.role || role.nome);
    setAcessoSearch('');
    fetchAllAcessos();
  };

  const closeLinkModal = () => {
    setLinkModalRoleId(null);
    setLinkModalRoleName('');
    setSelectedAcessos([]);
    setAllAcessos([]);
    setAcessoSearch('');
  };

  const toggleAcesso = (acessoName) => {
    setSelectedAcessos(prev =>
      prev.includes(acessoName)
        ? prev.filter(a => a !== acessoName)
        : [...prev, acessoName]
    );
  };

  const handleLinkAcessos = async () => {
    if (selectedAcessos.length === 0) {
      showToast('Selecione pelo menos um acesso', 'error');
      return;
    }
    setLinkSaving(true);
    try {
      const res = await fetch(API_ENDPOINTS.ROLES.ACESSOS(linkModalRoleName), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user?.accessToken}` },
        body: JSON.stringify({ acessos: selectedAcessos })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.mensagem || `Erro ${res.status}`);
      }
      closeLinkModal();
      fetchRoles();
      showToast('Acessos vinculados com sucesso!');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLinkSaving(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!formData.role?.trim()) {
      showToast('Nome da role é obrigatório', 'error');
      return;
    }
    if (!formData.descricao?.trim()) {
      showToast('Descrição é obrigatória', 'error');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        role: formData.role.trim(),
        descricao: formData.descricao.trim(),
      };

      const res = await fetch(API_ENDPOINTS.ROLES.BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user?.accessToken}` },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.mensagem || `Erro ${res.status}`);
      }
      setShowForm(false);
      setFormData({ role: '', descricao: '' });
      fetchRoles();
      showToast('Role criada com sucesso!');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const filtered = (Array.isArray(roles) ? roles : []).filter(r =>
    (r.role || r.nome || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const startEdit = (r) => {
    setEditingRole(r.id);
    const snapshot = { role: r.role || r.nome || '', descricao: r.descricao || '' };
    setEditForm(snapshot);
    setOriginalForm(snapshot);
    setShowEditModal(true);
  };

  const cancelEdit = () => {
    setEditingRole(null);
    setShowEditModal(false);
    setEditForm({ role: '', descricao: '' });
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

  const handleUpdate = async (roleId) => {
    const changed = getChangedFields();
    if (Object.keys(changed).length === 0) {
      cancelEdit();
      return;
    }
    setEditSaving(true);
    try {
      const res = await fetch(API_ENDPOINTS.ROLES.BY_ID(roleId), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user?.accessToken}` },
        body: JSON.stringify(changed)
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.mensagem || `Erro ${res.status}`);
      }
      cancelEdit();
      fetchRoles();
      showToast('Role atualizada com sucesso!');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setEditSaving(false);
    }
  };

  // Unlink modal functions
  const openUnlinkModal = (role) => {
    const acessosList = (role.acessos || role.acesso || []).map(a =>
      typeof a === 'string' ? a : a.acesso || a.nome
    );
    setUnlinkRoleAcessos([...new Set(acessosList)]);
    setUnlinkSelected([]);
    setUnlinkModalRoleId(role.id);
    setUnlinkModalRoleName(role.role || role.nome);
    setUnlinkSearch('');
  };

  const closeUnlinkModal = () => {
    setUnlinkModalRoleId(null);
    setUnlinkModalRoleName('');
    setUnlinkRoleAcessos([]);
    setUnlinkSelected([]);
    setUnlinkSearch('');
  };

  const toggleUnlinkAcesso = (acessoName) => {
    setUnlinkSelected(prev =>
      prev.includes(acessoName)
        ? prev.filter(a => a !== acessoName)
        : [...prev, acessoName]
    );
  };

  const handleUnlinkAcessos = async () => {
    if (unlinkSelected.length === 0) {
      showToast('Selecione pelo menos um acesso para desvincular', 'error');
      return;
    }
    setUnlinkSaving(true);
    try {
      // DELETE each selected acesso from the role
      const results = await Promise.allSettled(
        unlinkSelected.map(acesso =>
          fetch(API_ENDPOINTS.ROLES.ACESSOS(unlinkModalRoleName), {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user?.accessToken}` },
            body: JSON.stringify({ acessos: [acesso] })
          }).then(res => {
            if (!res.ok) throw new Error(`Erro ${res.status}`);
            return res;
          })
        )
      );
      const failed = results.filter(r => r.status === 'rejected');
      if (failed.length > 0 && failed.length === unlinkSelected.length) {
        throw new Error('Falha ao desvincular os acessos');
      }
      closeUnlinkModal();
      fetchRoles();
      const removed = unlinkSelected.length - failed.length;
      showToast(`${removed} acesso${removed !== 1 ? 's' : ''} desvinculado${removed !== 1 ? 's' : ''} com sucesso!`);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setUnlinkSaving(false);
    }
  };

  const filteredUnlinkAcessos = unlinkRoleAcessos.filter(name =>
    name.toLowerCase().includes(unlinkSearch.toLowerCase())
  );

  // Filter acessos in the link modal
  const filteredAcessos = allAcessos.filter(a => {
    const name = typeof a === 'string' ? a : a.acesso || a.nome || '';
    return name.toLowerCase().includes(acessoSearch.toLowerCase());
  });

  return (
    <div className="p-8 flex flex-col gap-8 relative">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed bottom-5 right-5 z-[100] px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 transition-all ${toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
          <span className="material-symbols-outlined">{toast.type === 'success' ? 'check_circle' : 'error'}</span>
          <span className="font-bold text-sm">{toast.message}</span>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">GESTÃO DE ROLES</h1>
          <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mt-2">
            CONTROLE DE ACESSO • {filtered.length} REGISTROS
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={async () => {
              if (exporting || !roles.length) return;
              setExporting(true);
              try {
                const res = await fetch(`${API_ENDPOINTS.ROLES.BASE}?size=9999`, buildAuthHeaders());
                const data = await res.json();
                const allData = data.content || data || [];
                const cols = [
                  { key: 'id', label: 'ID', w: 46.43 },
                  { key: 'role', label: 'ROLE', w: 105.14 },
                  { key: 'descricao', label: 'DESCRI\u00c7\u00c3O', w: 40 },
                  { key: 'acessos', label: 'ACESSOS', w: 60 },
                ];
                const workbook = new ExcelJS.Workbook();
                workbook.creator = 'UniAcadem';
                const ws = workbook.addWorksheet('Roles');
                ws.columns = cols.map(c => ({ width: c.w }));
                ws.addTable({ name: 'TabelaRoles', ref: 'A1', headerRow: true, totalsRow: false, style: { theme: 'TableStyleMedium2', showRowStripes: true }, columns: cols.map(c => ({ name: c.label, filterButton: true })), rows: allData.map(r => cols.map(c => {
                  if (c.key === 'acessos') {
                    const acessosList = r.acessos || r.acesso || [];
                    return acessosList.map(a => typeof a === 'string' ? a : a.acesso || a.nome || '').join(', ');
                  }
                  return r[c.key] ?? '';
                })) });
                const headerRow = ws.getRow(1);
                headerRow.eachCell(cell => { cell.font = { bold: true, color: { argb: 'FF000000' }, size: 11 }; cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD97706' } }; cell.alignment = { horizontal: 'center', vertical: 'middle' }; });
                headerRow.height = 28;
                for (let i = 2; i <= ws.rowCount; i++) { ws.getRow(i).eachCell(cell => { cell.alignment = { vertical: 'middle', wrapText: true }; }); ws.getRow(i).height = 22; }
                const buffer = await workbook.xlsx.writeBuffer();
                saveAs(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), `uniacadem_roles_${new Date().toISOString().split('T')[0]}.xlsx`);
                showToast(`${allData.length} roles exportadas com sucesso!`);
              } catch (err) { console.error(err); showToast('Erro ao exportar.', 'error'); } finally { setExporting(false); }
            }}
            disabled={exporting}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-black uppercase tracking-widest py-3 px-5 rounded-xl transition-all shadow-lg shadow-emerald-600/10 flex items-center gap-2 disabled:opacity-50"
          >
            {exporting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <span className="material-symbols-outlined text-[16px]">file_download</span>}
            {exporting ? 'EXPORTANDO...' : 'EXCEL'}
          </button>
          <button
            onClick={() => { setShowForm(!showForm); setEditingRole(null); }}
            className="bg-[#F59E0B] hover:bg-[#D97706] text-[#020617] text-[10px] font-black uppercase tracking-widest py-3 px-6 rounded-xl transition-all shadow-lg shadow-[#F59E0B]/10 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">add</span>
            NOVA ROLE
          </button>
        </div>
      </div>

      {/* Create Role Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <form onSubmit={handleSave} className="bg-white dark:bg-[#020617] w-full max-w-xl p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6 shadow-2xl relative">
            <button type="button" onClick={() => setShowForm(false)} className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>

            <div>
              <h2 className="text-xl font-black uppercase tracking-tight text-slate-800 dark:text-slate-100 mb-1">Nova Role</h2>
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Preencha os dados para criar a role</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1 block">Nome da Role</label>
                <input type="text" required placeholder="Ex: COORDENADOR" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#F59E0B]" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1 block">Descrição</label>
                <input type="text" required placeholder="Ex: Coordenador de curso" value={formData.descricao} onChange={e => setFormData({ ...formData, descricao: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#F59E0B]" />
              </div>
            </div>

            <div className="flex gap-3 pt-4 mt-2 border-t border-slate-100 dark:border-slate-800/50">
              <button type="submit" disabled={saving}
                className="flex-1 bg-[#F59E0B] hover:bg-[#D97706] text-[#020617] text-[12px] font-black uppercase tracking-widest py-4 px-6 rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-[#F59E0B]/20">
                {saving ? 'CRIANDO ROLE...' : 'CRIAR ROLE'}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-[12px] font-black uppercase tracking-widest py-4 px-6 rounded-xl transition-all">
                CANCELAR
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Link Acessos Modal */}
      {linkModalRoleId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#020617] w-full max-w-2xl p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl relative flex flex-col max-h-[85vh]">
            <button type="button" onClick={closeLinkModal} className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>

            <div className="mb-6">
              <h2 className="text-xl font-black uppercase tracking-tight text-slate-800 dark:text-slate-100 mb-1">Vincular Acessos</h2>
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                Role: <span className="text-[#F59E0B]">{linkModalRoleName}</span> — Selecione os acessos para vincular
              </p>
            </div>

            {/* Search inside modal */}
            <div className="relative mb-4">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
              <input
                type="text"
                placeholder="Filtrar acessos..."
                value={acessoSearch}
                onChange={e => setAcessoSearch(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#F59E0B]"
              />
            </div>

            {/* Selected count */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                {selectedAcessos.length} ACESSO{selectedAcessos.length !== 1 ? 'S' : ''} SELECIONADO{selectedAcessos.length !== 1 ? 'S' : ''}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedAcessos([...new Set([...selectedAcessos, ...filteredAcessos.map(a => typeof a === 'string' ? a : a.acesso || a.nome)])])}
                  className="text-[9px] font-black uppercase tracking-widest text-indigo-500 hover:text-indigo-700 transition-colors"
                >
                  Selecionar todos
                </button>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <button
                  type="button"
                  onClick={() => setSelectedAcessos([])}
                  className="text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
                >
                  Limpar
                </button>
              </div>
            </div>

            {/* Acessos list */}
            <div className="flex-1 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-xl divide-y divide-slate-100 dark:divide-slate-800 min-h-[200px] max-h-[400px]">
              {loadingAcessos ? (
                <div className="p-10 flex items-center justify-center min-h-[200px]">
                  <div className="w-8 h-8 border-4 border-[#F59E0B] border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : filteredAcessos.length === 0 ? (
                <div className="p-8 text-center text-slate-400 uppercase text-[10px] font-black tracking-widest">
                  {acessoSearch ? 'Nenhum acesso encontrado com esse filtro' : 'Nenhum acesso disponível'}
                </div>
              ) : (
                filteredAcessos.map((a, idx) => {
                  const acessoName = typeof a === 'string' ? a : a.acesso || a.nome;
                  const acessoDesc = typeof a === 'string' ? '' : a.descricao || '';
                  const isSelected = selectedAcessos.includes(acessoName);
                  return (
                    <label
                      key={acessoName || idx}
                      className={`flex items-center gap-4 px-5 py-3.5 cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-indigo-50 dark:bg-indigo-900/15'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/30'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleAcesso(acessoName)}
                        className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-[#F59E0B] focus:ring-[#F59E0B] shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                          isSelected
                            ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}>
                          {acessoName}
                        </span>
                        {acessoDesc && (
                          <p className="text-[10px] text-slate-400 mt-1 truncate">{acessoDesc}</p>
                        )}
                      </div>
                      {isSelected && (
                        <span className="material-symbols-outlined text-indigo-500 text-[18px] shrink-0">check_circle</span>
                      )}
                    </label>
                  );
                })
              )}
            </div>

            {/* Footer actions */}
            <div className="flex gap-3 pt-5 mt-4 border-t border-slate-100 dark:border-slate-800/50">
              <button
                type="button"
                onClick={handleLinkAcessos}
                disabled={linkSaving || selectedAcessos.length === 0}
                className="flex-1 bg-[#F59E0B] hover:bg-[#D97706] text-[#020617] text-[12px] font-black uppercase tracking-widest py-4 px-6 rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-[#F59E0B]/20 flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">link</span>
                {linkSaving ? 'VINCULANDO...' : `VINCULAR ${selectedAcessos.length} ACESSO${selectedAcessos.length !== 1 ? 'S' : ''}`}
              </button>
              <button
                type="button"
                onClick={closeLinkModal}
                className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-[12px] font-black uppercase tracking-widest py-4 px-6 rounded-xl transition-all"
              >
                CANCELAR
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-600 dark:text-red-400 text-sm">{error}</div>
      )}

      <div className="bg-white dark:bg-[#020617] p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-4">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
          <input type="text" placeholder="Buscar roles..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
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
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">ROLE</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">DESCRIÇÃO</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">ACESSOS</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">AÇÕES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {filtered.map(r => (
                  <tr key={r.id || r.role} className="hover:bg-slate-50 dark:hover:bg-slate-800/10 transition-colors">
                    <td className="px-8 py-5"><span className="text-[10px] font-black text-slate-400">#{r.id}</span></td>
                    <td className="px-6 py-5">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">{r.role || r.nome}</span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-xs text-slate-500">{r.descricao}</span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-wrap gap-1">
                        {(r.acessos || r.acesso || []).map((a, i) => (
                          <span key={i} className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded">
                            {typeof a === 'string' ? a : a.acesso || a.nome}
                          </span>
                        ))}
                        {(!(r.acessos || r.acesso) || (r.acessos || r.acesso).length === 0) && (
                          <span className="text-[9px] text-slate-400 italic">Nenhum acesso</span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setViewingRole(r)}
                          className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-emerald-500 flex items-center justify-center transition-colors" title="Visualizar Role">
                          <span className="material-symbols-outlined text-[18px]">visibility</span>
                        </button>
                        <button onClick={() => startEdit(r)}
                          className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-blue-500 flex items-center justify-center transition-colors" title="Editar Role">
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button onClick={() => openLinkModal(r)}
                          className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 hover:text-indigo-700 flex items-center justify-center transition-colors" title="Vincular Acessos">
                          <span className="material-symbols-outlined text-[18px]">link</span>
                        </button>
                        <button onClick={() => openUnlinkModal(r)}
                          disabled={!(r.acessos || r.acesso || []).length}
                          className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40 hover:text-red-700 flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed" title="Desvincular Acessos">
                          <span className="material-symbols-outlined text-[18px]">link_off</span>
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
          <div className="p-10 text-center text-slate-400 uppercase text-[10px] font-black tracking-widest">Nenhuma role encontrada</div>
        )}
      </div>

      {/* Edit Role Modal */}
      {showEditModal && editingRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#020617] w-full max-w-xl p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6 shadow-2xl relative">
            <button type="button" onClick={cancelEdit} className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>

            <div>
              <h2 className="text-xl font-black uppercase tracking-tight text-slate-800 dark:text-slate-100 mb-1">Editar Role</h2>
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Atualize os dados da role</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1 block">Nome da Role</label>
                <input
                  type="text"
                  placeholder="Ex: COORDENADOR"
                  value={editForm.role}
                  onChange={e => setEditForm({ ...editForm, role: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#F59E0B]"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1 block">Descrição</label>
                <input
                  type="text"
                  placeholder="Ex: Coordenador de curso"
                  value={editForm.descricao}
                  onChange={e => setEditForm({ ...editForm, descricao: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#F59E0B]"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4 mt-2 border-t border-slate-100 dark:border-slate-800/50">
              <button
                onClick={() => handleUpdate(editingRole)}
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

      {/* Unlink Acessos Modal */}
      {unlinkModalRoleId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#020617] w-full max-w-2xl p-8 rounded-3xl border border-red-200 dark:border-red-900/50 shadow-2xl relative flex flex-col max-h-[85vh]">
            <button type="button" onClick={closeUnlinkModal} className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>

            <div className="mb-6">
              <h2 className="text-xl font-black uppercase tracking-tight text-red-600 dark:text-red-400 mb-1">Desvincular Acessos</h2>
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                Role: <span className="text-red-500">{unlinkModalRoleName}</span> — Selecione os acessos para remover
              </p>
            </div>

            {/* Search inside modal */}
            <div className="relative mb-4">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
              <input
                type="text"
                placeholder="Filtrar acessos..."
                value={unlinkSearch}
                onChange={e => setUnlinkSearch(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-red-400"
              />
            </div>

            {/* Selected count */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                {unlinkSelected.length} ACESSO{unlinkSelected.length !== 1 ? 'S' : ''} PARA REMOVER
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setUnlinkSelected([...filteredUnlinkAcessos])}
                  className="text-[9px] font-black uppercase tracking-widest text-red-500 hover:text-red-700 transition-colors"
                >
                  Selecionar todos
                </button>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <button
                  type="button"
                  onClick={() => setUnlinkSelected([])}
                  className="text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
                >
                  Limpar
                </button>
              </div>
            </div>

            {/* Acessos list */}
            <div className="flex-1 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-xl divide-y divide-slate-100 dark:divide-slate-800 min-h-[200px] max-h-[400px]">
              {filteredUnlinkAcessos.length === 0 ? (
                <div className="p-8 text-center text-slate-400 uppercase text-[10px] font-black tracking-widest">
                  {unlinkSearch ? 'Nenhum acesso encontrado com esse filtro' : 'Nenhum acesso vinculado a esta role'}
                </div>
              ) : (
                filteredUnlinkAcessos.map((acessoName, idx) => {
                  const isSelected = unlinkSelected.includes(acessoName);
                  return (
                    <label
                      key={acessoName || idx}
                      className={`flex items-center gap-4 px-5 py-3.5 cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-red-50 dark:bg-red-900/15'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/30'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleUnlinkAcesso(acessoName)}
                        className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-red-500 focus:ring-red-400 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                          isSelected
                            ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}>
                          {acessoName}
                        </span>
                      </div>
                      {isSelected && (
                        <span className="material-symbols-outlined text-red-500 text-[18px] shrink-0">remove_circle</span>
                      )}
                    </label>
                  );
                })
              )}
            </div>

            {/* Footer actions */}
            <div className="flex gap-3 pt-5 mt-4 border-t border-slate-100 dark:border-slate-800/50">
              <button
                type="button"
                onClick={handleUnlinkAcessos}
                disabled={unlinkSaving || unlinkSelected.length === 0}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white text-[12px] font-black uppercase tracking-widest py-4 px-6 rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-red-500/20 flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">link_off</span>
                {unlinkSaving ? 'REMOVENDO...' : `DESVINCULAR ${unlinkSelected.length} ACESSO${unlinkSelected.length !== 1 ? 'S' : ''}`}
              </button>
              <button
                type="button"
                onClick={closeUnlinkModal}
                className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-[12px] font-black uppercase tracking-widest py-4 px-6 rounded-xl transition-all"
              >
                CANCELAR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Role Modal */}
      {viewingRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#020617] w-full max-w-lg p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl relative">
            <button type="button" onClick={() => setViewingRole(null)} className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>

            <div className="mb-6">
              <h2 className="text-xl font-black uppercase tracking-tight text-slate-800 dark:text-slate-100 mb-1">Detalhes da Role</h2>
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Informações completas</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">ID</label>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">#{viewingRole.id}</p>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Nome da Role</label>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase">{viewingRole.role || viewingRole.nome}</p>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Descrição</label>
                <p className="text-sm text-slate-600 dark:text-slate-400">{viewingRole.descricao || '—'}</p>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Acessos Vinculados</label>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {(viewingRole.acessos || []).length > 0 ? (
                    (viewingRole.acessos || []).map((a, i) => (
                      <span key={i} className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg">
                        {typeof a === 'string' ? a : a.acesso || a.nome}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400 italic">Nenhum acesso vinculado</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-5 mt-6 border-t border-slate-100 dark:border-slate-800/50">
              <button type="button" onClick={() => setViewingRole(null)}
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

export default Roles;
