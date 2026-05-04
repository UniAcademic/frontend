/**
 * @module http
 * @description Cliente HTTP autenticado centralizado.
 * Todos os serviços devem usar este módulo em vez de criar instâncias axios próprias.
 */
import axios from 'axios';
import { API_BASE_URL } from '@/config/api.config';
import { STORAGE_KEYS } from '@/config/storage.config';
import { ROUTES } from '@/config/routes.config';

/**
 * Instância axios autenticada para requisições ao microserviço.
 * Inclui interceptors de token e tratamento global de 401.
 */
const httpAuth = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor: attach Bearer token
httpAuth.interceptors.request.use((config) => {
  const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor: handle 401 (expired token) globally
httpAuth.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
      delete axios.defaults.headers.common.Authorization;
      window.location.href = ROUTES.LOGIN;
    }
    return Promise.reject(error);
  }
);

/**
 * Aplica ou remove o header de Authorization global do axios.
 * @param {string|null} accessToken
 */
export const applyAuthHeader = (accessToken) => {
  if (accessToken) {
    axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
    return;
  }
  delete axios.defaults.headers.common.Authorization;
};

/**
 * Retorna headers de autenticação para uso com fetch nativo.
 * @param {string} accessToken
 * @returns {{ headers: { Authorization: string } }}
 */
export const getAuthHeaders = (accessToken) => ({
  headers: { Authorization: `Bearer ${accessToken}` },
});

export default httpAuth;
