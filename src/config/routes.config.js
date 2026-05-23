/**
 * @module routes.config
 * @description Centraliza todas as constantes de rotas do frontend.
 * Use estas constantes em vez de strings hardcoded para navegação.
 */

export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',

  ADMIN: {
    ROOT: '/admin',
    ALUNOS: '/admin/alunos',
    ALUNOS_NOVO: '/admin/alunos/novo',
    ALUNOS_EDITAR: (id) => `/admin/alunos/editar/${id}`,
    PROFESSORES: '/admin/professores',
    PROFESSORES_NOVO: '/admin/professores/novo',
    PROFESSORES_EDITAR: (id) => `/admin/professores/editar/${id}`,
    COORDENADORES: '/admin/coordenadores',
    COORDENADORES_NOVO: '/admin/coordenadores/novo',
    COORDENADORES_EDITAR: (id) => `/admin/coordenadores/editar/${id}`,
    TURMAS: '/admin/turmas',
    TURMAS_NOVO: '/admin/turmas/novo',
    TURMAS_EDITAR: (id) => `/admin/turmas/editar/${id}`,
    DISCIPLINAS: '/admin/disciplinas',
    DISCIPLINAS_NOVO: '/admin/disciplinas/novo',
    DISCIPLINAS_EDITAR: (id) => `/admin/disciplinas/editar/${id}`,
    USUARIOS: '/admin/usuarios',
    ROLES: '/admin/roles',
    ACESSOS: '/admin/acessos',
    CONFIGURACOES: '/admin/configuracoes',
  },

  COORDENADOR: {
    ROOT: '/coordenador',
    ALUNOS: '/coordenador/alunos',
    ALUNOS_NOVO: '/coordenador/alunos/novo',
    ALUNOS_EDITAR: (id) => `/coordenador/alunos/editar/${id}`,
    PROFESSORES: '/coordenador/professores',
    PROFESSORES_NOVO: '/coordenador/professores/novo',
    PROFESSORES_EDITAR: (id) => `/coordenador/professores/editar/${id}`,
    COORDENADORES: '/coordenador/coordenadores',
    COORDENADORES_NOVO: '/coordenador/coordenadores/novo',
    COORDENADORES_EDITAR: (id) => `/coordenador/coordenadores/editar/${id}`,
    TURMAS: '/coordenador/turmas',
    DISCIPLINAS: '/coordenador/disciplinas',
  },

  PROFESSOR: {
    ROOT: '/professor',
    CURSO: (id) => `/professor/curso/${id}`,
    TURMA: (id) => `/professor/turma/${id}`,
    DISCIPLINA: (id) => `/professor/disciplina/${id}`,
    FREQUENCIA: (id) => `/professor/disciplina/${id}/frequencia`,
    AULA: (id) => `/professor/aula/${id}`,
    HORARIO: '/professor/horario',
  },

  STUDENT: {
    ROOT: '/student',
    DISCIPLINA: (id) => `/student/disciplina/${id}`,
    BOLETIM: '/student/boletim',
    HORARIO: '/student/horario',
    EMENTA: '/student/ementa',
    EMENTA_ID: (id) => `/student/ementa/${id}`,
    PERFIL: '/student/perfil',
    CONFIGURACOES: '/student/configuracoes',
  },
};

/** Mapeamento role → rota principal (para redirecionamentos pós-login) */
export const ROLE_HOME_ROUTES = {
  admin: ROUTES.ADMIN.ROOT,
  coordenador: ROUTES.COORDENADOR.ROOT,
  professor: ROUTES.PROFESSOR.ROOT,
  student: ROUTES.STUDENT.ROOT,
};
