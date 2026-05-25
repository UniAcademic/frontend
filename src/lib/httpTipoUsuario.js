/**
 * @module httpTipoUsuario
 * @description Cliente HTTP autenticado centralizado para o microserviço ms-tipo-usuario.
 */
import axios from 'axios';
import { API_TIPO_USUARIO_BASE_URL } from '@/config/api.config';
import { STORAGE_KEYS } from '@/config/storage.config';
import { ROUTES } from '@/config/routes.config';

/**
 * Instância axios autenticada para requisições ao microserviço de tipos de usuários.
 */
const httpTipoUsuario = axios.create({
  baseURL: API_TIPO_USUARIO_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor: anexa o token Bearer
httpTipoUsuario.interceptors.request.use((config) => {
  const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log('🔍 httpTipoUsuario REQUEST:', config.method?.toUpperCase(), config.baseURL + config.url, '| Token present:', !!token, '| Token (first 20):', token?.substring(0, 20));
  return config;
});

// Interceptor: lida com erro 401 globalmente
httpTipoUsuario.interceptors.response.use(
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

export default httpTipoUsuario;
