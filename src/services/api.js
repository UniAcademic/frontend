import axios from 'axios';
import db from '../../db.json';
import httpAuth from '@/lib/http';
import httpTipoUsuario from '@/lib/httpTipoUsuario';
import { MOCK_USER_ID_BY_ROLE } from '@/config/storage.config';

// Simulação de delay de rede
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

const ROLE_FALLBACK_MOCK_USER_ID = {
  admin: 1,
  professor: 2,
  student: 4
};

const resolveMockContext = (userRef, fallbackRole) => {
  if (userRef && typeof userRef === 'object') {
    return {
      rawId: Number(userRef.id),
      mockUserId: Number(userRef.mockUserId),
      role: userRef.role || fallbackRole || null
    };
  }
  return {
    rawId: Number(userRef),
    mockUserId: Number(userRef),
    role: fallbackRole || null
  };
};

const pickEffectiveMockUserId = ({ mockUserId, rawId, role }) => {
  if (Number.isFinite(mockUserId) && mockUserId > 0) return mockUserId;
  if (Number.isFinite(rawId) && rawId > 0) return rawId;
  const roleFallback = ROLE_FALLBACK_MOCK_USER_ID[role];
  return Number.isFinite(roleFallback) ? roleFallback : null;
};

const api = {
  // ==================== DASHBOARD METRICS ====================
  getDashboardMetrics: async () => {
    await delay();
    const { alunos, professores, turmas, disciplinas, notas, cursos, aulas } = db;

    // 1. Alunos por Curso
    const alunosPorCurso = cursos.map(c => ({
      name: c.name,
      value: alunos.filter(a => Number(a.cursoId) === Number(c.id)).length
    }));

    // 2. Ocupação de Turmas
    const ocupacaoTurmas = turmas.map(t => ({
      name: t.name,
      ocupacao: Math.round((t.studentsCount / t.capacity) * 100),
      alunos: t.studentsCount,
      capacidade: t.capacity
    }));

    // 3. Média de Notas por Turma
    const mediaNotasPorTurma = turmas.map(t => {
      const disciplinasTurma = disciplinas.filter(d => Number(d.turmaId) === Number(t.id));
      const idsDisciplinas = disciplinasTurma.map(d => Number(d.id));
      const notasTurma = notas.filter(n => idsDisciplinas.includes(Number(n.disciplinaId)));
      
      const media = notasTurma.length > 0 
        ? notasTurma.reduce((acc, n) => acc + n.nota, 0) / notasTurma.length 
        : 0;
      return { name: t.name, media: parseFloat(media.toFixed(1)) };
    }).sort((a, b) => b.media - a.media).slice(0, 5);

    // 4. Professores por Departamento
    const depts = [...new Set(professores.map(p => p.department))];
    const professoresPorDepartamento = depts.map(d => ({
      name: d,
      value: professores.filter(p => p.department === d).length
    }));

    // 5. Status Acadêmico (Distribuição de Notas por Aluno)
    const mediasAlunos = alunos.map(a => {
      const notasAluno = notas.filter(n => Number(n.alunoId) === Number(a.id));
      const media = notasAluno.length > 0 
        ? notasAluno.reduce((acc, n) => acc + n.nota, 0) / notasAluno.length 
        : 0;
      return media;
    });

    const studentStatus = [
      { name: 'Excelência (9-10)', value: mediasAlunos.filter(m => m >= 9).length },
      { name: 'Bom (7-8.9)', value: mediasAlunos.filter(m => m >= 7 && m < 9).length },
      { name: 'Regular (5-6.9)', value: mediasAlunos.filter(m => m >= 5 && m < 7).length },
      { name: 'Crítico (< 5)', value: mediasAlunos.filter(m => m > 0 && m < 5).length }
    ];

    return {
      totalAlunos: alunos.length,
      ativosAlunos: alunos.filter(a => a.status === 'Ativo').length,
      inativosAlunos: alunos.filter(a => a.status === 'Inativo').length,
      totalProfessores: professores.length,
      totalTurmas: turmas.length,
      ativasTurmas: turmas.filter(t => t.status === 'Ativa').length,
      totalDisciplinas: disciplinas.length,
      charts: {
        alunosPorCurso,
        ocupacaoTurmas,
        mediaNotasPorTurma,
        professoresPorDepartamento,
        studentStatus
      }
    };
  },

  getEnrollmentStats: async () => {
    await delay();
    return db.enrollmentStats;
  },

  // ==================== PROFESSOR ====================
  getProfessorDashboard: async (userRef) => {
    await delay();
    const context = resolveMockContext(userRef, 'professor');
    const uid = pickEffectiveMockUserId(context);
    const prof = db.professores.find(p => Number(p.userId) === uid) || db.professores.find(p => Number(p.id) === uid);
    if (!prof) return null;

    const disciplinas = db.disciplinas.filter(d => Number(d.professorId) === Number(prof.id));
    return { professor: prof, disciplinas };
  },

  getProfessorDisciplinas: async (userRef) => {
    await delay();
    const context = resolveMockContext(userRef, 'professor');
    const uid = pickEffectiveMockUserId(context);
    const prof = db.professores.find(p => Number(p.userId) === uid) || db.professores.find(p => Number(p.id) === uid);
    if (!prof) return [];

    const disciplinas = db.disciplinas.filter(d => Number(d.professorId) === Number(prof.id));
    const { turmas, cursos } = db;

    return disciplinas.map(d => {
      const turma = turmas.find(t => Number(t.id) === Number(d.turmaId)) || {};
      const curso = cursos.find(c => Number(c.id) === Number(turma.cursoId)) || {};
      return {
        ...d,
        turma: {
          ...turma,
          cursoName: curso.name || 'Geral',
          cursoCode: curso.code || '-'
        }
      };
    });
  },

  getDisciplinaDetails: async (disciplinaId) => {
    await delay();
    const did = Number(disciplinaId);
    const disciplina = db.disciplinas.find(d => Number(d.id) === did);
    if (!disciplina) return null;

    const turma = db.turmas.find(t => Number(t.id) === Number(disciplina.turmaId)) || {};
    const aulas = db.aulas.filter(a => Number(a.disciplinaId) === did);
    const materiais = db.materiais.filter(m => Number(m.disciplinaId) === did);
    const notas = db.notas.filter(n => Number(n.disciplinaId) === did);
    const alunos = db.alunos;

    const alunosStats = notas.map(n => {
      const aluno = alunos.find(a => Number(a.id) === Number(n.alunoId)) || {};
      return { ...aluno, nota: n.nota, faltas: n.faltas };
    });

    return { disciplina, turma, aulas, materiais, alunos: alunosStats };
  },

  getAulaDetails: async (aulaId) => {
    await delay();
    const aid = Number(aulaId);
    const aula = db.aulas.find(a => Number(a.id) === aid);
    if (!aula) return null;

    const disciplina = db.disciplinas.find(d => Number(d.id) === Number(aula.disciplinaId));
    const attendance = db.alunos.map(a => ({ ...a, present: true }));

    return { aula, disciplina, attendance };
  },

  // ==================== STUDENT ====================
  getStudentDashboard: async (userRef) => {
    await delay();
    const context = resolveMockContext(userRef, 'student');
    const uid = pickEffectiveMockUserId(context);
    const aluno = db.alunos.find(a => Number(a.userId) === uid) || db.alunos.find(a => Number(a.id) === uid);
    if (!aluno) return null;

    const enrolledDisciplinas = db.disciplinas.map(d => {
      const notaData = db.notas.find(n => n.disciplinaId === d.id && n.alunoId === aluno.id) || { nota: '-', faltas: 0 };
      return { ...d, nota: notaData.nota, faltas: notaData.faltas };
    });

    return {
      aluno,
      cra: '8.7',
      semestre: '3º Semestre',
      disciplinas: enrolledDisciplinas
    };
  },

  getStudentBoletim: async (alunoId) => {
    return api.getStudentDashboard(alunoId);
  },

  // ==================== ADMIN CRUD ====================
  // Alunos
  getAlunos: async () => { await delay(); return db.alunos; },
  getAluno: async (id) => { await delay(); return db.alunos.find(a => Number(a.id) === Number(id)); },
  createAluno: async (payload) => { await delay(); return { ...payload, id: Math.floor(Math.random() * 1000) }; },
  updateAluno: async (id, payload) => { await delay(); return { ...payload, id }; },
  deleteAluno: async (id) => { await delay(); return true; },

  // Professores
  getProfessores: async () => { await delay(); return db.professores; },
  getProfessor: async (id) => { await delay(); return db.professores.find(p => Number(p.id) === Number(id)); },
  createProfessor: async (payload) => { await delay(); return { ...payload, id: Math.floor(Math.random() * 1000) }; },
  updateProfessor: async (id, payload) => { await delay(); return { ...payload, id }; },
  deleteProfessor: async (id) => { await delay(); return true; },

  // Users (login credentials)
  createUser: async (payload) => { await delay(); return { ...payload, id: Math.floor(Math.random() * 1000) }; },
  updateUser: async (id, payload) => { await delay(); return { ...payload, id }; },
  deleteUser: async (id) => { await delay(); return true; },
  getUserByEmail: async (email) => { 
    await delay();
    return db.users.find(u => u.email === email) || null; 
  },

  // Disciplinas Admin
  getDisciplinasAdmin: async () => {
    await delay();
    const { disciplinas, turmas, cursos } = db;

    return disciplinas.map(d => {
      const turma = turmas.find(t => t.id === d.turmaId) || {};
      const curso = cursos.find(c => c.id === turma.cursoId) || { name: 'Geral' };
      return { ...d, curso: curso.name };
    });
  },

  // Turmas Admin
  getTurmasAdmin: async () => {
    await delay();
    const { turmas, cursos, disciplinas } = db;

    return turmas.map(t => {
      const curso = cursos.find(c => c.id === t.cursoId);
      const disciplina = disciplinas.find(d => d.turmaId === t.id) || { name: '-' };
      return { ...t, curso: curso?.name, disciplina: disciplina.name };
    });
  },

  // Create / Update / Delete Turma (mock)
  createTurma: async (payload) => {
    // Try real backend first
    try {
      const { data } = await httpTipoUsuario.post('/turmas', payload);
      return data;
    } catch (err) {
      console.error('createTurma backend error:', err?.response?.status, err?.response?.data || err.message);
      // Re-throw so caller can show the error (403/403 body) instead of silently falling back
      throw err;
    }
  },
  updateTurma: async (id, payload) => {
    try {
      const { data } = await httpTipoUsuario.patch(`/turmas/${id}`, payload);
      return data;
    } catch (err) {
      console.error('updateTurma backend error:', err?.response?.status, err?.response?.data || err.message);
      throw err;
    }
  },
  deleteTurma: async (id) => {
    try {
      const { data } = await httpTipoUsuario.delete(`/turmas/${id}`);
      return data;
    } catch (err) {
      console.error('deleteTurma backend error:', err?.response?.status, err?.response?.data || err.message);
      throw err;
    }
  },

  // Cursos
  getCursos: async () => { await delay(); return db.cursos; },

  // Single Turma
  getTurma: async (id) => { await delay(); return db.turmas.find(t => Number(t.id) === Number(id)); },

  // Schedule
  getSchedule: async () => {
    await delay();
    return db.schedule;
  },

  // ==================== REAL MICROSERVICE APIs ====================
  getUserProfile: async (matricula) => {
    const { data } = await httpAuth.get(`/usuarios/matricula/${matricula}`);
    return data;
  },

  getUserById: async (id) => {
    const { data } = await httpAuth.get(`/usuarios/${id}`);
    return data;
  },

  // ==================== REAL API: USUARIOS (ms-usuario) ====================
  getUsuariosAPI: async (tipoFilter = null) => {
    const allUsers = [];
    let page = 0;
    let totalPages = 1;

    while (page < totalPages) {
      const { data } = await httpAuth.get(`/usuarios?page=${page}&size=20&sort=id`);
      if (data.content) {
        allUsers.push(...data.content);
        totalPages = data.totalPages || 1;
      } else if (Array.isArray(data)) {
        allUsers.push(...data);
        break;
      }
      page++;
    }

    if (tipoFilter) {
      return allUsers.filter(u => {
        const tipo = (u.tipo_usuario || '').toUpperCase();
        return tipo === tipoFilter.toUpperCase();
      });
    }
    return allUsers;
  },

  getAlunosAPI: async () => {
    const users = await api.getUsuariosAPI('ALUNO');
    return users.map(u => ({
      id: u.id || u.matricula,
      name: u.nome || u.name || '',
      ra: u.matricula || '',
      email: u.email || '',
      status: u.ativo !== false ? 'Ativo' : 'Inativo',
      _raw: u
    }));
  },

  getProfessoresAPI: async () => {
    const users = await api.getUsuariosAPI('PROFESSOR');
    return users.map(u => ({
      id: u.id || u.matricula,
      name: u.nome || u.name || '',
      department: u.departamento || 'Geral',
      email: u.email || '',
      _raw: u
    }));
  },

  createUsuarioAPI: async (payload) => {
    const { data } = await httpAuth.post('/usuarios', payload);
    return data;
  },

  // ==================== REAL API: MS-TIPO-USUARIO ====================
  
  // ALUNOS
  getAlunosTipoAPI: async (page = 0, size = 10, filters = {}) => {
    const params = new URLSearchParams({
      page: String(page),
      size: String(size),
    });
    if (filters.matricula) params.append('matricula', filters.matricula);
    if (filters.email) params.append('email', filters.email);
    if (filters.nome) params.append('nome', filters.nome);
    if (filters.cpf) params.append('cpf', filters.cpf);
    if (filters.sort) {
      if (Array.isArray(filters.sort)) {
        filters.sort.forEach(s => params.append('sort', s));
      } else {
        params.append('sort', filters.sort);
      }
    } else {
      params.append('sort', 'usuarioId');
    }
    
    const { data } = await httpTipoUsuario.get(`/alunos?${params.toString()}`);
    return data;
  },

  getAlunoPorIdAPI: async (id) => {
    const { data } = await httpTipoUsuario.get(`/alunos/${id}`);
    return data;
  },

  getAlunoPorMatriculaAPI: async (matricula) => {
    const { data } = await httpTipoUsuario.get(`/alunos/matricula/${matricula}`);
    return data;
  },

  atualizarAlunoAPI: async (id, payload) => {
    const { data } = await httpTipoUsuario.patch(`/alunos/${id}`, payload);
    return data;
  },

  atualizarEnderecoAlunoAPI: async (id, payload) => {
    const { data } = await httpTipoUsuario.patch(`/alunos/${id}/endereco`, payload);
    return data;
  },

  // PROFESSORES
  getProfessoresTipoAPI: async (page = 0, size = 10, filters = {}) => {
    const params = new URLSearchParams({
      page: String(page),
      size: String(size),
    });
    if (filters.matricula) params.append('matricula', filters.matricula);
    if (filters.email) params.append('email', filters.email);
    if (filters.nome) params.append('nome', filters.nome);
    if (filters.cpf) params.append('cpf', filters.cpf);
    if (filters.sort) {
      if (Array.isArray(filters.sort)) {
        filters.sort.forEach(s => params.append('sort', s));
      } else {
        params.append('sort', filters.sort);
      }
    } else {
      params.append('sort', 'usuarioId');
    }
    
    const { data } = await httpTipoUsuario.get(`/professores?${params.toString()}`);
    return data;
  },

  getProfessorPorIdAPI: async (id) => {
    const { data } = await httpTipoUsuario.get(`/professores/${id}`);
    return data;
  },

  getProfessorPorMatriculaAPI: async (matricula) => {
    const { data } = await httpTipoUsuario.get(`/professores/matricula/${matricula}`);
    return data;
  },

  atualizarProfessorAPI: async (id, payload) => {
    const { data } = await httpTipoUsuario.patch(`/professores/${id}`, payload);
    return data;
  },

  atualizarEnderecoProfessorAPI: async (id, payload) => {
    const { data } = await httpTipoUsuario.patch(`/professores/${id}/endereco`, payload);
    return data;
  },

  // COORDENADORES
  getCoordenadoresTipoAPI: async (page = 0, size = 10, filters = {}) => {
    const params = new URLSearchParams({
      page: String(page),
      size: String(size),
    });
    if (filters.matricula) params.append('matricula', filters.matricula);
    if (filters.email) params.append('email', filters.email);
    if (filters.nome) params.append('nome', filters.nome);
    if (filters.cpf) params.append('cpf', filters.cpf);
    if (filters.sort) {
      if (Array.isArray(filters.sort)) {
        filters.sort.forEach(s => params.append('sort', s));
      } else {
        params.append('sort', filters.sort);
      }
    } else {
      params.append('sort', 'usuarioId');
    }
    
    const { data } = await httpTipoUsuario.get(`/coordenadores?${params.toString()}`);
    return data;
  },

  getCoordenadorPorIdAPI: async (id) => {
    const { data } = await httpTipoUsuario.get(`/coordenadores/${id}`);
    return data;
  },

  getCoordenadorPorMatriculaAPI: async (matricula) => {
    const { data } = await httpTipoUsuario.get(`/coordenadores/matricula/${matricula}`);
    return data;
  },

  atualizarCoordenadorAPI: async (id, payload) => {
    const { data } = await httpTipoUsuario.patch(`/coordenadores/${id}`, payload);
    return data;
  },

  atualizarEnderecoCoordenadorAPI: async (id, payload) => {
    const { data } = await httpTipoUsuario.patch(`/coordenadores/${id}/endereco`, payload);
    return data;
  },

  // DOCUMENTOS
  baixarDocumentoAlunoAPI: async (id) => {
    const { data } = await httpTipoUsuario.get(`/documentos/${id}/alunos`, {
      responseType: 'blob'
    });
    return data;
  },

  enviarDocumentoAlunoAPI: async (id, arquivo, tipoMidia, tipoDocumento) => {
    const formData = new FormData();
    formData.append('arquivo', arquivo);
    const { data } = await httpTipoUsuario.post(`/documentos/${id}/alunos`, formData, {
      params: {
        tipo_midia: tipoMidia,
        tipo_documento: tipoDocumento
      },
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return data;
  }
};

export { httpAuth };
export default api;
