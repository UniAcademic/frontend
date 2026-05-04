/**
 * @module storage.config
 * @description Centraliza todas as chaves usadas no localStorage.
 * Evita strings hardcoded e typos em chaves de storage.
 */

export const STORAGE_KEYS = {
  USER: 'uniacademic_user',
  ACCESS_TOKEN: 'uniacademic_access_token',
  REFRESH_TOKEN: 'uniacademic_refresh_token',
  SETTINGS: 'uniacademic_settings',
};

/** Mock user IDs para correlacionar usuários da API real com dados do db.json */
export const MOCK_USER_ID_BY_ROLE = {
  admin: 1,
  coordenador: 1,
  professor: 2,
  student: 4,
};

/** Credenciais demo (referência; usadas no AuthContext para fallback de nome) */
export const DEMO_USERS = {
  '00100009': { role: 'student', nome: 'Allan Reymond da Silva' },
  '00100010': { role: 'professor', nome: 'Allan Reymond' },
  '00100011': { role: 'admin', nome: 'Allan Jesus' },
};
