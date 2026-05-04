/**
 * @module authStore
 * @description Store Valtio para estado de autenticação.
 * Substitui AuthContext preservando toda a lógica de login/logout/JWT.
 */
import { proxy, useSnapshot } from 'valtio';
import axios from 'axios';
import { API_ENDPOINTS } from '@/config/api.config';
import { STORAGE_KEYS, MOCK_USER_ID_BY_ROLE, DEMO_USERS } from '@/config/storage.config';
import { DEFAULT_AVATAR_BY_ROLE } from '@/config/external.config';
import { ROUTES } from '@/config/routes.config';
import { applyAuthHeader } from '@/lib/http';

// ─── Utilities ──────────────────────────────────────────────────────────────

const safeParse = (value) => {
  try { return JSON.parse(value); } catch { return null; }
};

const decodeJwtPayload = (token) => {
  if (!token || typeof token !== 'string') return {};
  try {
    const [, payload = ''] = token.split('.');
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
    return JSON.parse(atob(padded));
  } catch { return {}; }
};

const mapRoleToFrontend = (value) => {
  if (!value) return null;
  const normalized = String(value).trim().toUpperCase();
  if (normalized === 'ADMINISTRADOR') return 'admin';
  if (normalized.includes('COORD')) return 'coordenador';
  if (normalized.includes('ADMIN')) return 'admin';
  if (normalized.includes('PROF')) return 'professor';
  if (normalized.includes('ALUNO') || normalized.includes('STUDENT')) return 'student';
  return null;
};

const normalizeRoleList = (roles = []) => {
  if (!Array.isArray(roles)) return [];
  return roles
    .map((role) => {
      if (typeof role === 'string') return role;
      if (role && typeof role === 'object') {
        return role.role || role.nome || role.name || role.authority || '';
      }
      return '';
    })
    .filter(Boolean);
};

const extractErrorMessage = (error, fallback) => {
  const apiData = error?.response?.data;
  if (Array.isArray(apiData?.erros) && apiData.erros.length > 0) {
    return apiData.erros.map((item) => item?.mensagem).filter(Boolean).join(' ');
  }
  return apiData?.mensagem || apiData?.message || error?.message || fallback;
};

// ─── State ──────────────────────────────────────────────────────────────────

const savedUser = (() => {
  const raw = localStorage.getItem(STORAGE_KEYS.USER);
  return raw ? safeParse(raw) : null;
})();

export const authState = proxy({
  user: savedUser,
  loading: false,
});

// ─── Derived getters ────────────────────────────────────────────────────────

export const getRole = () => authState.user?.role || null;
export const getIsAuthenticated = () => !!authState.user;

// ─── Actions ────────────────────────────────────────────────────────────────

/** Initialize auth on app boot — check token expiry */
export const initAuth = () => {
  const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  if (accessToken) {
    const payload = decodeJwtPayload(accessToken);
    const now = Math.floor(Date.now() / 1000);
    if (!payload.exp || payload.exp < now) {
      authState.user = null;
      localStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      applyAuthHeader(null);
      return;
    }
    applyAuthHeader(accessToken);
  }
};

/** Login action */
export const login = async (identifier, password) => {
  authState.loading = true;
  applyAuthHeader(null);
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);

  try {
    const { data: authData } = await axios.create().post(API_ENDPOINTS.AUTH.LOGIN, {
      matricula: identifier,
      senha: password,
    });

    const accessToken = authData?.access_token || authData?.accessToken || authData?.token;
    const refreshToken = authData?.refresh_token || authData?.refreshToken || null;

    if (!accessToken) {
      throw new Error('Token de acesso não foi retornado pelo serviço de autenticação.');
    }

    applyAuthHeader(accessToken);
    const jwtPayload = decodeJwtPayload(accessToken);

    // Fetch user profile
    let profile = null;
    const profileUrl = API_ENDPOINTS.USUARIOS.BY_MATRICULA(identifier);
    try {
      const profileClient = axios.create({
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      });
      const profileResponse = await profileClient.get(profileUrl);
      profile = profileResponse?.data || null;
    } catch {
      try {
        const profileResponse = await axios.create({
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        }).get(profileUrl);
        profile = profileResponse?.data || null;
      } catch {
        profile = null;
      }
    }

    // Resolve role
    const jwtRoles = normalizeRoleList(jwtPayload?.roles);
    const roleCandidates = [
      ...jwtRoles,
      ...normalizeRoleList(profile?.roles),
      profile?.tipo_usuario,
      authData?.tipo_usuario,
      jwtPayload?.role,
    ].filter(Boolean);

    const role = roleCandidates.map(mapRoleToFrontend).find(Boolean) || null;

    if (!role) {
      throw new Error('Não foi possível identificar o perfil de acesso do usuário.');
    }

    const jwtAuthorities = jwtPayload?.authorities || [];

    const loggedUser = {
      id: profile?.id || jwtPayload?.id || jwtPayload?.sub || identifier,
      apiUserId: profile?.id || jwtPayload?.id || null,
      matricula: profile?.matricula || jwtPayload?.sub || identifier,
      ra: profile?.matricula || jwtPayload?.sub || identifier,
      name: profile?.nome || profile?.name || profile?.nomeCompleto || DEMO_USERS[identifier]?.nome || 'Usuário',
      email: profile?.email || '',
      tipo_usuario: profile?.tipo_usuario || null,
      role,
      roles: roleCandidates,
      authorities: jwtAuthorities,
      avatar: DEFAULT_AVATAR_BY_ROLE[role],
      accessToken,
      refreshToken,
      mockUserId: MOCK_USER_ID_BY_ROLE[role],
      tokenExp: jwtPayload?.exp || null,
    };

    authState.user = loggedUser;
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(loggedUser));
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);

    if (refreshToken) {
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    } else {
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    }

    return loggedUser;
  } catch (error) {
    applyAuthHeader(null);
    throw new Error(extractErrorMessage(error, 'Erro ao fazer login'));
  } finally {
    authState.loading = false;
  }
};

/** Logout action */
export const logout = () => {
  authState.user = null;
  localStorage.removeItem(STORAGE_KEYS.USER);
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  applyAuthHeader(null);
};

// ─── React Hook ─────────────────────────────────────────────────────────────

/**
 * Hook para acessar o estado de autenticação de forma reativa.
 * Drop-in replacement para useAuth() do antigo AuthContext.
 */
export const useAuth = () => {
  const snap = useSnapshot(authState);
  return {
    user: snap.user,
    role: snap.user?.role || null,
    isAuthenticated: !!snap.user,
    loading: snap.loading,
    login,
    logout,
  };
};
