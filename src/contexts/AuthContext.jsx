import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import db from '../../db.json';

const AuthContext = createContext(null);

const USER_API_URL = '/api/ms-usuario';
const USER_STORAGE_KEY = 'uniacademic_user';
const ACCESS_TOKEN_STORAGE_KEY = 'uniacademic_access_token';
const REFRESH_TOKEN_STORAGE_KEY = 'uniacademic_refresh_token';

// Mock user IDs used to correlate real API users with mock data in db.json
// admin → mock user 1 (Admin Master), professor → mock user 2 (Sarah/userId=2), student → mock user 4 (Alice/userId=4)
const MOCK_USER_ID_BY_ROLE = {
  admin: 1,
  coordenador: 1,
  professor: 2,
  student: 4
};

const DEFAULT_AVATAR_BY_ROLE = {
  admin: 'https://i.pravatar.cc/150?img=68',
  coordenador: 'https://i.pravatar.cc/150?img=12',
  professor: 'https://i.pravatar.cc/150?img=5',
  student: 'https://i.pravatar.cc/150?img=1'
};

// Demo credentials mapping (real API matriculas → roles)
// ALUNO: 00100009 / 2201ads91
// PROFESSOR: 00100010 / 2201ads91
// ADMIN: 00100011 / 2201ads91
const DEMO_USERS = {
  '00100009': { role: 'student', nome: 'Allan Reymond da Silva' },
  '00100010': { role: 'professor', nome: 'Allan Reymond' },
  '00100011': { role: 'admin', nome: 'Allan Jesus' }
};

const safeParse = (value) => {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const decodeJwtPayload = (token) => {
  if (!token || typeof token !== 'string') return {};

  try {
    const [, payload = ''] = token.split('.');
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
    return JSON.parse(atob(padded));
  } catch {
    return {};
  }
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

const applyAuthHeader = (accessToken) => {
  if (accessToken) {
    axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
    return;
  }

  delete axios.defaults.headers.common.Authorization;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem(USER_STORAGE_KEY);
    return saved ? safeParse(saved) : null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const accessToken = localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
    if (accessToken) {
      const payload = decodeJwtPayload(accessToken);
      const now = Math.floor(Date.now() / 1000);
      // Clear if token is expired or malformed (no exp claim means decode failed)
      if (!payload.exp || payload.exp < now) {
        setUser(null);
        localStorage.removeItem(USER_STORAGE_KEY);
        localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
        localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
        applyAuthHeader(null);
        return;
      }
      applyAuthHeader(accessToken);
    }
  }, []);

  const login = async (identifier, password) => {
    setLoading(true);

    // Clear ALL stale auth state before hitting the public login endpoint
    applyAuthHeader(null);
    localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
    localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);

    try {
      // Use a clean axios instance (no default headers) to avoid any stale Authorization header
      const { data: authData } = await axios.create().post(`${USER_API_URL}/auth/login`, {
        matricula: identifier,
        senha: password
      });

      const accessToken = authData?.access_token || authData?.accessToken || authData?.token;
      const refreshToken = authData?.refresh_token || authData?.refreshToken || null;

      if (!accessToken) {
        throw new Error('Token de acesso não foi retornado pelo serviço de autenticação.');
      }

      applyAuthHeader(accessToken);

      const jwtPayload = decodeJwtPayload(accessToken);

      const apiUserId = authData?.id || jwtPayload?.id || null;
      let profile = null;

      if (apiUserId) {
        try {
          const response = await axios.get(`${USER_API_URL}/usuarios/${apiUserId}`);
          profile = response?.data || null;
        } catch {
          profile = null;
        }
      }

      if (!profile) {
        try {
          const response = await axios.get(`${USER_API_URL}/usuarios/matricula/${identifier}`);
          profile = response?.data || null;
        } catch {
          profile = null;
        }
      }

      // Priority: JWT roles > profile roles > tipo_usuario fields
      // JWT is the authoritative source for role-based access control
      const jwtRoles = normalizeRoleList(jwtPayload?.roles);
      const roleCandidates = [
        ...jwtRoles,
        ...normalizeRoleList(profile?.roles),
        profile?.tipo_usuario,
        authData?.tipo_usuario,
        jwtPayload?.role
      ].filter(Boolean);

      const role = roleCandidates.map(mapRoleToFrontend).find(Boolean) || null;

      if (!role) {
        throw new Error('Não foi possível identificar o perfil de acesso do usuário.');
      }

      // Store all JWT roles for fine-grained access control
      const jwtAuthorities = jwtPayload?.authorities || [];

      const loggedUser = {
        id: profile?.id || apiUserId || jwtPayload?.sub || identifier,
        apiUserId: profile?.id || apiUserId || null,
        matricula: profile?.matricula || jwtPayload?.sub || identifier,
        ra: profile?.matricula || jwtPayload?.sub || identifier,
        name: profile?.nome || profile?.name || authData?.nome || DEMO_USERS[identifier]?.nome || `Usuário ${identifier}`,
        email: profile?.email || authData?.email || '',
        tipo_usuario: profile?.tipo_usuario || authData?.tipo_usuario || null,
        role,
        roles: roleCandidates,
        authorities: jwtAuthorities,
        avatar: DEFAULT_AVATAR_BY_ROLE[role],
        accessToken,
        refreshToken,
        mockUserId: MOCK_USER_ID_BY_ROLE[role],
        tokenExp: jwtPayload?.exp || null
      };

      setUser(loggedUser);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(loggedUser));
      localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, accessToken);

      if (refreshToken) {
        localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, refreshToken);
      } else {
        localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
      }

      return loggedUser;
    } catch (error) {
      applyAuthHeader(null);
      throw new Error(extractErrorMessage(error, 'Erro ao fazer login'));
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
    localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
    applyAuthHeader(null);
  };

  const value = {
    user,
    role: user?.role || null,
    isAuthenticated: !!user,
    loading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context
};

export default AuthContext
