import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';

const ROLE_LABELS = {
  admin: 'Administrador',
  coordenador: 'Coordenador',
  professor: 'Professor',
  student: 'Estudante',
};

const Perfil = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Edit mode states
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    nome: '', email: '', celular: '',
    cep: '', logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '', pais: 'Brasil'
  });
  const [saveSuccess, setSaveSuccess] = useState('');

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let data = null;
      const userRole = user?.role;
      const matricula = user?.matricula;

      if (matricula) {
        if (userRole === 'student') {
          data = await api.getAlunoPorMatriculaAPI(matricula);
        } else if (userRole === 'professor') {
          data = await api.getProfessorPorMatriculaAPI(matricula);
        } else if (userRole === 'coordenador') {
          data = await api.getCoordenadorPorMatriculaAPI(matricula);
        }
      }

      // Fallback if no specific role data or if admin
      if (!data && user?.id) {
        data = await api.getUserById(user.id);
      }

      if (data) {
        setProfile(data);
        setEditForm({
          nome: data.nome || data.name || '',
          email: data.email || '',
          celular: data.celular || '',
          cep: data.endereco?.cep || '',
          logradouro: data.endereco?.logradouro || '',
          numero: data.endereco?.numero || '',
          complemento: data.endereco?.complemento || '',
          bairro: data.endereco?.bairro || '',
          cidade: data.endereco?.cidade || '',
          estado: data.endereco?.estado || '',
          pais: data.endereco?.pais || 'Brasil'
        });
      } else {
        setProfile(user);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setProfile(user);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess('');
    setError(null);

    const userRole = user?.role;
    const targetId = profile?.usuarioId || user?.id;

    try {
      // 1. Update personal details based on role
      if (userRole === 'student') {
        await api.atualizarAlunoAPI(targetId, {
          nome: editForm.nome,
          email: editForm.email,
          celular: editForm.celular || null
        });
        await api.atualizarEnderecoAlunoAPI(targetId, {
          cep: editForm.cep || null,
          logradouro: editForm.logradouro || null,
          numero: editForm.numero || null,
          complemento: editForm.complemento || null,
          bairro: editForm.bairro || null,
          cidade: editForm.cidade || null,
          estado: editForm.estado || null,
          pais: editForm.pais || 'Brasil'
        });
      } else if (userRole === 'professor') {
        await api.atualizarProfessorAPI(targetId, {
          nome: editForm.nome,
          email: editForm.email,
          celular: editForm.celular || null
        });
        await api.atualizarEnderecoProfessorAPI(targetId, {
          cep: editForm.cep || null,
          logradouro: editForm.logradouro || null,
          numero: editForm.numero || null,
          complemento: editForm.complemento || null,
          bairro: editForm.bairro || null,
          cidade: editForm.cidade || null,
          estado: editForm.estado || null,
          pais: editForm.pais || 'Brasil'
        });
      } else if (userRole === 'coordenador') {
        await api.atualizarCoordenadorAPI(targetId, {
          nome: editForm.nome,
          email: editForm.email,
          celular: editForm.celular || null
        });
        await api.atualizarEnderecoCoordenadorAPI(targetId, {
          cep: editForm.cep || null,
          logradouro: editForm.logradouro || null,
          numero: editForm.numero || null,
          complemento: editForm.complemento || null,
          bairro: editForm.bairro || null,
          cidade: editForm.cidade || null,
          estado: editForm.estado || null,
          pais: editForm.pais || 'Brasil'
        });
      } else {
        // Fallback for Admin
        await api.updateUser(targetId, {
          name: editForm.nome,
          email: editForm.email
        });
      }

      setSaveSuccess('Perfil atualizado com sucesso!');
      setEditMode(false);
      await fetchProfileData();
    } catch (err) {
      console.error('Error saving profile:', err);
      setError('Erro ao salvar as alterações do perfil.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-[#F59E0B] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const displayName = profile?.nome || profile?.name || user?.name || 'Usuário';
  const displayEmail = profile?.email || user?.email || '—';
  const displayMatricula = profile?.matricula || user?.matricula || '—';
  const displayCelular = profile?.celular || '—';
  const displayRole = ROLE_LABELS[user?.role] || user?.role || '—';
  const displayRoles = profile?.roles || user?.roles || [];
  const displayAvatar = user?.avatar || '';

  return (
    <div className="p-8 flex flex-col gap-8 max-w-4xl mx-auto w-full">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">MEU PERFIL</h1>
          <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mt-2">
            INFORMAÇÕES DA SUA CONTA
          </p>
        </div>
        {!editMode && (
          <button
            onClick={() => setEditMode(true)}
            className="bg-[#F59E0B] hover:bg-[#D97706] text-[#020617] text-[10px] font-black uppercase tracking-widest py-2.5 px-5 rounded-xl transition-all shadow-lg shadow-[#F59E0B]/10 flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[16px]">edit</span>
            EDITAR PERFIL
          </button>
        )}
      </div>

      {saveSuccess && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-600 dark:text-emerald-400 font-bold text-sm">
          {saveSuccess}
        </div>
      )}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 font-bold text-sm">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-[#020617] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Header with avatar */}
        <div className="bg-gradient-to-r from-[#F59E0B]/10 to-[#F59E0B]/5 dark:from-[#F59E0B]/5 dark:to-transparent p-8 flex items-center gap-6 border-b border-slate-100 dark:border-slate-800">
          <div
            className="w-20 h-20 rounded-2xl border-2 border-[#F59E0B]/30 bg-center bg-cover shrink-0"
            style={{ backgroundImage: `url("${displayAvatar}")` }}
          />
          <div>
            <h2 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">{displayName}</h2>
            <p className="text-[10px] font-black uppercase tracking-widest text-[#F59E0B] mt-1">{displayRole}</p>
          </div>
        </div>

        {editMode ? (
          <form onSubmit={handleSave} className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Nome Completo</label>
                <input
                  type="text"
                  value={editForm.nome}
                  onChange={e => setEditForm({ ...editForm, nome: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-[#F59E0B]"
                />
              </div>
              
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-[#F59E0B]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Celular</label>
                <input
                  type="text"
                  value={editForm.celular}
                  onChange={e => setEditForm({ ...editForm, celular: e.target.value })}
                  placeholder="11999998888"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-[#F59E0B]"
                />
              </div>
            </div>

            {user?.role !== 'admin' && (
              <>
                <h3 className="text-xs font-black uppercase tracking-widest text-[#F59E0B] border-b border-slate-100 dark:border-slate-800 pb-2 mt-8">
                  Endereço Residencial
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">CEP</label>
                    <input
                      type="text"
                      value={editForm.cep}
                      onChange={e => setEditForm({ ...editForm, cep: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-[#F59E0B]"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Logradouro</label>
                    <input
                      type="text"
                      value={editForm.logradouro}
                      onChange={e => setEditForm({ ...editForm, logradouro: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-[#F59E0B]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Número</label>
                    <input
                      type="text"
                      value={editForm.numero}
                      onChange={e => setEditForm({ ...editForm, numero: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-[#F59E0B]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Complemento</label>
                    <input
                      type="text"
                      value={editForm.complemento}
                      onChange={e => setEditForm({ ...editForm, complemento: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-[#F59E0B]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Bairro</label>
                    <input
                      type="text"
                      value={editForm.bairro}
                      onChange={e => setEditForm({ ...editForm, bairro: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-[#F59E0B]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Cidade</label>
                    <input
                      type="text"
                      value={editForm.cidade}
                      onChange={e => setEditForm({ ...editForm, cidade: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-[#F59E0B]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Estado</label>
                    <input
                      type="text"
                      value={editForm.estado}
                      onChange={e => setEditForm({ ...editForm, estado: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-[#F59E0B]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">País</label>
                    <input
                      type="text"
                      value={editForm.pais}
                      onChange={e => setEditForm({ ...editForm, pais: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-[#F59E0B]"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="flex gap-4 pt-6 border-t border-slate-100 dark:border-slate-800">
              <button
                type="submit"
                disabled={saving}
                className="py-3 px-6 bg-[#0B0F19] dark:bg-[#F59E0B] text-white dark:text-[#0B0F19] font-black uppercase text-[10px] tracking-widest rounded-lg hover:bg-slate-800 dark:hover:bg-[#D97706] transition-colors disabled:opacity-50"
              >
                {saving ? 'Salvando...' : 'Salvar Alterações'}
              </button>
              <button
                type="button"
                onClick={() => setEditMode(false)}
                className="py-3 px-6 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black uppercase text-[10px] tracking-widest rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        ) : (
          /* Info grid */
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Matrícula</label>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{displayMatricula}</p>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email</label>
              <p className="text-sm text-slate-600 dark:text-slate-400 break-all">{displayEmail}</p>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Celular</label>
              <p className="text-sm text-slate-600 dark:text-slate-400">{displayCelular}</p>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tipo de Usuário</label>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase">{displayRole}</p>
            </div>

            {user?.role !== 'admin' && profile?.endereco && (
              <div className="md:col-span-2 space-y-3 mt-4 border-t border-slate-100 dark:border-slate-800 pt-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Endereço Residencial</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/50 dark:bg-[#0B0F19]/25 p-4 rounded-xl border border-slate-100 dark:border-slate-800/40">
                  <div className="text-xs text-slate-600 dark:text-slate-400">
                    <span className="font-bold">CEP:</span> {profile.endereco.cep || '—'}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">
                    <span className="font-bold">Logradouro:</span> {profile.endereco.logradouro || '—'}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">
                    <span className="font-bold">Número:</span> {profile.endereco.numero || '—'}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">
                    <span className="font-bold">Complemento:</span> {profile.endereco.complemento || '—'}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">
                    <span className="font-bold">Bairro:</span> {profile.endereco.bairro || '—'}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">
                    <span className="font-bold">Cidade:</span> {profile.endereco.cidade || '—'} ({profile.endereco.estado || '—'})
                  </div>
                </div>
              </div>
            )}

            <div className="md:col-span-2 space-y-2 mt-4 border-t border-slate-100 dark:border-slate-800 pt-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Roles / Permissões</label>
              <div className="flex flex-wrap gap-2">
                {displayRoles.length > 0 ? (
                  displayRoles.map((r, i) => {
                    const roleName = typeof r === 'string' ? r : r.role || r.nome || '';
                    return (
                      <span key={i} className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg border border-indigo-200 dark:border-indigo-800/50">
                        {roleName}
                      </span>
                    );
                  })
                ) : (
                  <span className="text-xs text-slate-400 italic">—</span>
                )}
              </div>
            </div>

            <div className="md:col-span-2 space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">ID do Usuário</label>
              <p className="text-xs font-mono text-slate-400 dark:text-slate-500 break-all">{user?.id || '—'}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Perfil;
