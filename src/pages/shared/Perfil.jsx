import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { API_ENDPOINTS } from '@/config/api.config';
import { getAuthHeaders } from '@/lib/http';

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

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id || !user?.accessToken) {
        setProfile(user);
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(
          API_ENDPOINTS.USUARIOS.BY_ID(user.id),
          getAuthHeaders(user.accessToken)
        );
        if (!res.ok) throw new Error(`Erro ${res.status}`);
        const data = await res.json();
        setProfile(data);
      } catch {
        // Fallback to local user data
        setProfile(user);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

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
    <div className="p-8 flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">MEU PERFIL</h1>
        <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mt-2">
          INFORMAÇÕES DA SUA CONTA
        </p>
      </div>

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

        {/* Info grid */}
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

          <div className="md:col-span-2 space-y-2">
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
      </div>
    </div>
  );
};

export default Perfil;
