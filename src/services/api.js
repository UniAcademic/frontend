import axios from 'axios';

const API_URL = 'http://localhost:3001';

const http = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

const api = {
  // ==================== DASHBOARD METRICS ====================
  getDashboardMetrics: async () => {
    const [alunos, professores, turmas, disciplinas] = await Promise.all([
      http.get('/alunos'),
      http.get('/professores'),
      http.get('/turmas'),
      http.get('/disciplinas')
    ]);
    return {
      totalAlunos: alunos.data.length,
      ativosAlunos: alunos.data.filter(a => a.status === 'Ativo').length,
      inativosAlunos: alunos.data.filter(a => a.status === 'Inativo').length,
      totalProfessores: professores.data.length,
      totalTurmas: turmas.data.length,
      ativasTurmas: turmas.data.filter(t => t.status === 'Ativa').length,
      totalDisciplinas: disciplinas.data.length
    };
  },

  getEnrollmentStats: async () => {
    const { data } = await http.get('/enrollmentStats');
    return data;
  },

  // ==================== PROFESSOR ====================
  getProfessorDashboard: async (userId) => {
    const { data: professores } = await http.get('/professores');
    // Try to find by direct ID or by userId
    const prof = professores.find(p => p.id === userId || p.userId === userId);
    if (!prof) return null;

    const { data: disciplinas } = await http.get('/disciplinas', { params: { professorId: prof.id } });
    return { professor: prof, disciplinas };
  },

  getProfessorDisciplinas: async (userId) => {
    const { data: professores } = await http.get('/professores');
    const prof = professores.find(p => p.id === userId || p.userId === userId);
    if (!prof) return [];

    const { data: disciplinas } = await http.get('/disciplinas', { params: { professorId: prof.id } });
    const { data: turmas } = await http.get('/turmas');
    const { data: cursos } = await http.get('/cursos');

    return disciplinas.map(d => {
      const turma = turmas.find(t => t.id === d.turmaId) || {};
      const curso = cursos.find(c => c.id === turma.cursoId) || {};
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
    const disciplina = disciplinas.find(d => d.id === disciplinaId);
    if (!disciplina) return null;

    const { data: turmas } = await http.get('/turmas');
    const turma = turmas.find(t => t.id === disciplina.turmaId) || {};

    const { data: aulas } = await http.get('/aulas', { params: { disciplinaId } });
    const { data: materiais } = await http.get('/materiais', { params: { disciplinaId } });
    const { data: notas } = await http.get('/notas', { params: { disciplinaId } });
    const { data: alunos } = await http.get('/alunos');

    const alunosStats = notas.map(n => {
      const aluno = alunos.find(a => a.id === n.alunoId) || {};
      return { ...aluno, nota: n.nota, faltas: n.faltas };
    });

    return { disciplina, turma, aulas, materiais, alunos: alunosStats };
  },

  getAulaDetails: async (aulaId) => {
    const { data: aulas } = await http.get('/aulas');
    const aula = aulas.find(a => a.id === aulaId);
    if (!aula) return null;

    const { data: disciplinas } = await http.get('/disciplinas');
    const disciplina = disciplinas.find(d => d.id === aula.disciplinaId);

    const { data: alunos } = await http.get('/alunos');
    const attendance = alunos.map(a => ({ ...a, present: true }));

    return { aula, disciplina, attendance };
  },

  // ==================== STUDENT ====================
  getStudentDashboard: async (userId) => {
    const { data: alunos } = await http.get('/alunos');
    // Try to find by direct ID or by userId
    const aluno = alunos.find(a => a.id === userId || a.userId === userId);
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

  // Schedule
  getSchedule: async () => {
    const { data } = await http.get('/schedule');
    return data;
  }
};

export default api;
