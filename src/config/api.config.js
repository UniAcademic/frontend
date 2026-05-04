/**
 * @module api.config
 * @description Centraliza todas as URLs base e endpoints da API.
 * Nenhuma URL de API deve ser hardcoded em componentes ou services.
 */

/** Proxy prefix configurado no vite.config.js */
export const API_BASE_URL = '/api/ms-usuario';

/** Endpoints do microserviço de usuários */
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_BASE_URL}/auth/login`,
  },
  USUARIOS: {
    BASE: `${API_BASE_URL}/usuarios`,
    BY_ID: (id) => `${API_BASE_URL}/usuarios/${id}`,
    BY_MATRICULA: (matricula) => `${API_BASE_URL}/usuarios/matricula/${matricula}`,
    PAGINATED: (page = 0, size = 20, sort = 'id', filters = {}) => {
      let url = `${API_BASE_URL}/usuarios?page=${page}&size=${size}&sort=${sort}`;
      if (filters && typeof filters === 'object') {
        Object.keys(filters).forEach(key => {
          if (filters[key] !== null && filters[key] !== undefined && filters[key].trim() !== '') {
            url += `&${encodeURIComponent(key)}=${encodeURIComponent(filters[key].trim())}`;
          }
        });
      }
      return url;
    },
  },
  ROLES: {
    BASE: `${API_BASE_URL}/roles`,
    BY_ID: (id) => `${API_BASE_URL}/roles/${id}`,
    BY_NAME: (roleName) => `${API_BASE_URL}/roles/role/${encodeURIComponent(roleName)}`,
    ACESSOS: (roleName) => `${API_BASE_URL}/roles/${encodeURIComponent(roleName)}/acessos`,
  },
  ACESSOS: {
    BASE: `${API_BASE_URL}/acessos`,
    BY_ID: (id) => `${API_BASE_URL}/acessos/${id}`,
  },
};
