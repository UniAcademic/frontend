/**
 * @module external.config
 * @description Centraliza URLs de serviços externos (avatares, CDNs, etc.).
 * Nunca use URLs externas hardcoded diretamente nos componentes.
 */

/** Base URL para avatares aleatórios (pravatar) */
const PRAVATAR_BASE = 'https://i.pravatar.cc/150';

/** Base URL para avatares com iniciais (ui-avatars) */
const UI_AVATARS_BASE = 'https://ui-avatars.com/api';

/**
 * Gera uma URL de avatar aleatório usando pravatar.
 * @param {number} imgId - ID da imagem (0-70)
 * @returns {string}
 */
export const getRandomAvatarUrl = (imgId) =>
  `${PRAVATAR_BASE}?img=${imgId}`;

/**
 * Gera uma URL de avatar novo aleatório para cadastro.
 * @returns {string}
 */
export const generateNewAvatarUrl = () =>
  getRandomAvatarUrl(Math.floor(Math.random() * 70));

/**
 * Gera uma URL de avatar com iniciais do nome.
 * @param {string} name - Nome completo do usuário
 * @param {object} options
 * @param {string} [options.background='F59E0B']
 * @param {string} [options.color='fff']
 * @param {number} [options.size=128]
 * @returns {string}
 */
export const getInitialsAvatarUrl = (
  name,
  { background = 'F59E0B', color = 'fff', size = 128 } = {}
) =>
  `${UI_AVATARS_BASE}/?name=${encodeURIComponent(name)}&background=${background}&color=${color}&size=${size}&bold=true`;

/** Avatar padrão por role */
export const DEFAULT_AVATAR_BY_ROLE = {
  admin: getRandomAvatarUrl(68),
  coordenador: getRandomAvatarUrl(12),
  professor: getRandomAvatarUrl(5),
  student: getRandomAvatarUrl(1),
};

/** Avatar placeholder para curso (usado em listagens) */
export const getCourseStudentAvatar = (index) =>
  getRandomAvatarUrl(11 + index);
