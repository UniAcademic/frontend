/**
 * @module config
 * @description Barrel export para todas as configurações centralizadas.
 */
export { API_BASE_URL, API_ENDPOINTS } from './api.config';
export { 
  getRandomAvatarUrl,
  generateNewAvatarUrl,
  getInitialsAvatarUrl,
  DEFAULT_AVATAR_BY_ROLE,
  getCourseStudentAvatar,
} from './external.config';
export { ROUTES, ROLE_HOME_ROUTES } from './routes.config';
export { STORAGE_KEYS, MOCK_USER_ID_BY_ROLE, DEMO_USERS } from './storage.config';
