import axios from 'axios';

const API_URL = 'http://localhost:3001';

const http = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

const api = {
  // ==================== DASHBOARD METRICS ====================
  getDashboardMetrics: async () => {
    const [alunosRes, professoresRes, turmasRes, disciplinasRes, notasRes, cursosRes, aulasRes] = await Promise.all([
      http.get('/alunos'),
      http.get('/professores'),
      http.get('/turmas'),
      http.get('/disciplinas'),
      http.get('/notas'),
      http.get('/cursos'),
      http.get('/aulas')
    ]);

    const alunos = alunosRes.data;
    const professores = professoresRes.data;
    const turmas = turmasRes.data;
    const disciplinas = disciplinasRes.data;
    const notas = notasRes.data;
    const cursos = cursosRes.data;
    const aulas = aulasRes.data;

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
    const { data } = await http.get('/enrollmentStats');
    return data;
  },

  // ==================== PROFESSOR ====================
  getProfessorDashboard: async (userId) => {
    const { data: professores } = await http.get('/professores');
    // Prioritize userId match over id match to avoid wrong professor
    const uid = Number(userId);
    const prof = professores.find(p => Number(p.userId) === uid) || professores.find(p => Number(p.id) === uid);
    if (!prof) return null;

    const { data: disciplinas } = await http.get('/disciplinas', { params: { professorId: prof.id } });
    return { professor: prof, disciplinas };
  },

  getProfessorDisciplinas: async (userId) => {
    const { data: professores } = await http.get('/professores');
    // Prioritize userId match over id match
    const uid = Number(userId);
    const prof = professores.find(p => Number(p.userId) === uid) || professores.find(p => Number(p.id) === uid);
    if (!prof) return [];

    const { data: disciplinas } = await http.get('/disciplinas', { params: { professorId: prof.id } });
    const { data: turmas } = await http.get('/turmas');
    const { data: cursos } = await http.get('/cursos');

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
    const { data: disciplinas } = await http.get('/disciplinas');
    const did = Number(disciplinaId);
    const disciplina = disciplinas.find(d => Number(d.id) === did);
    if (!disciplina) return null;

    const { data: turmas } = await http.get('/turmas');
    const turma = turmas.find(t => Number(t.id) === Number(disciplina.turmaId)) || {};

    const { data: aulas } = await http.get('/aulas', { params: { disciplinaId: did } });
    const { data: materiais } = await http.get('/materiais', { params: { disciplinaId: did } });
    const { data: notas } = await http.get('/notas', { params: { disciplinaId: did } });
    const { data: alunos } = await http.get('/alunos');

    const alunosStats = notas.map(n => {
      const aluno = alunos.find(a => Number(a.id) === Number(n.alunoId)) || {};
      return { ...aluno, nota: n.nota, faltas: n.faltas };
    });

    return { disciplina, turma, aulas, materiais, alunos: alunosStats };
  },

  getAulaDetails: async (aulaId) => {
    const { data: aulas } = await http.get('/aulas');
    const aid = Number(aulaId);
    const aula = aulas.find(a => Number(a.id) === aid);
    if (!aula) return null;

    const { data: disciplinas } = await http.get('/disciplinas');
    const disciplina = disciplinas.find(d => Number(d.id) === Number(aula.disciplinaId));

    const { data: alunos } = await http.get('/alunos');
    const attendance = alunos.map(a => ({ ...a, present: true }));

    return { aula, disciplina, attendance };
  },

  // ==================== STUDENT ====================
  getStudentDashboard: async (userId) => {
    const { data: alunos } = await http.get('/alunos');
    // Prioritize userId match over id match
    const uid = Number(userId);
    const aluno = alunos.find(a => Number(a.userId) === uid) || alunos.find(a => Number(a.id) === uid);
    if (!aluno) return null;

    const { data: disciplinas } = await http.get('/disciplinas');
    const { data: notas } = await http.get('/notas', { params: { alunoId: aluno.id } });

    const enrolledDisciplinas = disciplinas.map(d => {
      const notaData = notas.find(n => n.disciplinaId === d.id) || { nota: '-', faltas: 0 };
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
  getAlunos: async () => { const { data } = await http.get('/alunos'); return data; },
  getAluno: async (id) => { const { data } = await http.get(`/alunos/${id}`); return data; },
  createAluno: async (payload) => { const { data } = await http.post('/alunos', payload); return data; },
  updateAluno: async (id, payload) => { const { data } = await http.put(`/alunos/${id}`, payload); return data; },
  deleteAluno: async (id) => { await http.delete(`/alunos/${id}`); return true; },

  // Professores
  getProfessores: async () => { const { data } = await http.get('/professores'); return data; },
  getProfessor: async (id) => { const { data } = await http.get(`/professores/${id}`); return data; },
  createProfessor: async (payload) => { const { data } = await http.post('/professores', payload); return data; },
  updateProfessor: async (id, payload) => { const { data } = await http.put(`/professores/${id}`, payload); return data; },
  deleteProfessor: async (id) => { await http.delete(`/professores/${id}`); return true; },

  // Users (login credentials)
  createUser: async (payload) => { const { data } = await http.post('/users', payload); return data; },
  updateUser: async (id, payload) => { const { data } = await http.patch(`/users/${id}`, payload); return data; },
  deleteUser: async (id) => { await http.delete(`/users/${id}`); return true; },
  getUserByEmail: async (email) => { const { data } = await http.get('/users', { params: { email } }); return data[0] || null; },

  // Disciplinas Admin
  getDisciplinasAdmin: async () => {
    const { data: disciplinas } = await http.get('/disciplinas');
    const { data: turmas } = await http.get('/turmas');
    const { data: cursos } = await http.get('/cursos');

    return disciplinas.map(d => {
      const turma = turmas.find(t => t.id === d.turmaId) || {};
      const curso = cursos.find(c => c.id === turma.cursoId) || { name: 'Geral' };
      return { ...d, curso: curso.name };
    });
  },

  // Turmas Admin
  getTurmasAdmin: async () => {
    const { data: turmas } = await http.get('/turmas');
    const { data: cursos } = await http.get('/cursos');
    const { data: disciplinas } = await http.get('/disciplinas');

    return turmas.map(t => {
      const curso = cursos.find(c => c.id === t.cursoId);
      const disciplina = disciplinas.find(d => d.turmaId === t.id) || { name: '-' };
      return { ...t, curso: curso?.name, disciplina: disciplina.name };
    });
  },

  // Cursos
  getCursos: async () => { const { data } = await http.get('/cursos'); return data; },

  // Single Turma
  getTurma: async (id) => { const { data } = await http.get(`/turmas/${id}`); return data; },

  // Schedule
  getSchedule: async () => {
    const { data } = await http.get('/schedule');
    return data;
  }
};

export default api;
