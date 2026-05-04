import { describe, it, expect } from 'vitest';
import {
  API_BASE_URL,
  API_ENDPOINTS,
} from '@/config/api.config';
import {
  getRandomAvatarUrl,
  generateNewAvatarUrl,
  getInitialsAvatarUrl,
  DEFAULT_AVATAR_BY_ROLE,
  getCourseStudentAvatar,
} from '@/config/external.config';
import { ROUTES, ROLE_HOME_ROUTES } from '@/config/routes.config';
import { STORAGE_KEYS, MOCK_USER_ID_BY_ROLE } from '@/config/storage.config';

describe('API Config', () => {
  it('should have a valid API base URL', () => {
    expect(API_BASE_URL).toBe('/api/ms-usuario');
  });

  it('should generate correct auth login endpoint', () => {
    expect(API_ENDPOINTS.AUTH.LOGIN).toBe('/api/ms-usuario/auth/login');
  });

  it('should generate user by ID endpoint', () => {
    expect(API_ENDPOINTS.USUARIOS.BY_ID(42)).toBe('/api/ms-usuario/usuarios/42');
  });

  it('should generate user by matricula endpoint', () => {
    expect(API_ENDPOINTS.USUARIOS.BY_MATRICULA('00100009')).toBe('/api/ms-usuario/usuarios/matricula/00100009');
  });

  it('should generate paginated endpoint with defaults', () => {
    expect(API_ENDPOINTS.USUARIOS.PAGINATED()).toContain('page=0');
    expect(API_ENDPOINTS.USUARIOS.PAGINATED()).toContain('size=20');
    expect(API_ENDPOINTS.USUARIOS.PAGINATED()).toContain('sort=id');
  });

  it('should generate paginated endpoint with custom params', () => {
    expect(API_ENDPOINTS.USUARIOS.PAGINATED(1, 50, 'nome')).toBe(
      '/api/ms-usuario/usuarios?page=1&size=50&sort=nome'
    );
    expect(API_ENDPOINTS.USUARIOS.PAGINATED(0, 10, 'id', { nome: 'Allan', matricula: '00' })).toBe(
      '/api/ms-usuario/usuarios?page=0&size=10&sort=id&nome=Allan&matricula=00'
    );
  });

  it('should generate role endpoints correctly', () => {
    expect(API_ENDPOINTS.ROLES.BASE).toBe('/api/ms-usuario/roles');
    expect(API_ENDPOINTS.ROLES.BY_ID(5)).toBe('/api/ms-usuario/roles/5');
    expect(API_ENDPOINTS.ROLES.BY_NAME('ADMIN')).toBe('/api/ms-usuario/roles/role/ADMIN');
    expect(API_ENDPOINTS.ROLES.ACESSOS('ADMIN')).toBe('/api/ms-usuario/roles/ADMIN/acessos');
  });

  it('should generate acesso endpoints correctly', () => {
    expect(API_ENDPOINTS.ACESSOS.BASE).toBe('/api/ms-usuario/acessos');
    expect(API_ENDPOINTS.ACESSOS.BY_ID(10)).toBe('/api/ms-usuario/acessos/10');
  });
});

describe('External Config', () => {
  it('should generate random avatar URL', () => {
    const url = getRandomAvatarUrl(42);
    expect(url).toContain('pravatar.cc');
    expect(url).toContain('img=42');
  });

  it('should generate new avatar URL with random ID', () => {
    const url = generateNewAvatarUrl();
    expect(url).toContain('pravatar.cc');
    expect(url).toContain('img=');
  });

  it('should generate initials avatar URL', () => {
    const url = getInitialsAvatarUrl('John Doe');
    expect(url).toContain('ui-avatars.com');
    expect(url).toContain('name=John%20Doe');
    expect(url).toContain('background=F59E0B');
    expect(url).toContain('bold=true');
  });

  it('should generate initials avatar with custom options', () => {
    const url = getInitialsAvatarUrl('Jane', { background: '000', color: 'fff', size: 256 });
    expect(url).toContain('background=000');
    expect(url).toContain('size=256');
  });

  it('should have default avatars for all roles', () => {
    expect(DEFAULT_AVATAR_BY_ROLE.admin).toContain('img=68');
    expect(DEFAULT_AVATAR_BY_ROLE.coordenador).toContain('img=12');
    expect(DEFAULT_AVATAR_BY_ROLE.professor).toContain('img=5');
    expect(DEFAULT_AVATAR_BY_ROLE.student).toContain('img=1');
  });

  it('should generate course student avatar by index', () => {
    const url = getCourseStudentAvatar(3);
    expect(url).toContain('img=14');
  });
});

describe('Routes Config', () => {
  it('should have login route', () => {
    expect(ROUTES.LOGIN).toBe('/login');
  });

  it('should have admin routes', () => {
    expect(ROUTES.ADMIN.ROOT).toBe('/admin');
    expect(ROUTES.ADMIN.ALUNOS).toBe('/admin/alunos');
    expect(ROUTES.ADMIN.ALUNOS_EDITAR(5)).toBe('/admin/alunos/editar/5');
    expect(ROUTES.ADMIN.USUARIOS).toBe('/admin/usuarios');
    expect(ROUTES.ADMIN.ROLES).toBe('/admin/roles');
    expect(ROUTES.ADMIN.ACESSOS).toBe('/admin/acessos');
  });

  it('should have professor routes with dynamic params', () => {
    expect(ROUTES.PROFESSOR.CURSO(1)).toBe('/professor/curso/1');
    expect(ROUTES.PROFESSOR.DISCIPLINA(3)).toBe('/professor/disciplina/3');
  });

  it('should have student routes with dynamic params', () => {
    expect(ROUTES.STUDENT.DISCIPLINA(2)).toBe('/student/disciplina/2');
    expect(ROUTES.STUDENT.EMENTA_ID(5)).toBe('/student/ementa/5');
  });

  it('should have role home routes mapping', () => {
    expect(ROLE_HOME_ROUTES.admin).toBe('/admin');
    expect(ROLE_HOME_ROUTES.professor).toBe('/professor');
    expect(ROLE_HOME_ROUTES.student).toBe('/student');
    expect(ROLE_HOME_ROUTES.coordenador).toBe('/coordenador');
  });
});

describe('Storage Config', () => {
  it('should have all required storage keys', () => {
    expect(STORAGE_KEYS.USER).toBeDefined();
    expect(STORAGE_KEYS.ACCESS_TOKEN).toBeDefined();
    expect(STORAGE_KEYS.REFRESH_TOKEN).toBeDefined();
    expect(STORAGE_KEYS.SETTINGS).toBeDefined();
  });

  it('should have namespaced storage keys to avoid collisions', () => {
    expect(STORAGE_KEYS.USER).toContain('uniacademic');
    expect(STORAGE_KEYS.ACCESS_TOKEN).toContain('uniacademic');
  });

  it('should have mock user ID mapping for all roles', () => {
    expect(MOCK_USER_ID_BY_ROLE.admin).toBe(1);
    expect(MOCK_USER_ID_BY_ROLE.professor).toBe(2);
    expect(MOCK_USER_ID_BY_ROLE.student).toBe(4);
  });
});
