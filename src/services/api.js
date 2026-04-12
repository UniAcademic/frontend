import db from '../../db.json';

// Simulação de delay de rede
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

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
  getProfessorDashboard: async (userId) => {
    await delay();
    const uid = Number(userId);
    const prof = db.professores.find(p => Number(p.userId) === uid) || db.professores.find(p => Number(p.id) === uid);
    if (!prof) return null;

    const disciplinas = db.disciplinas.filter(d => Number(d.professorId) === Number(prof.id));
    return { professor: prof, disciplinas };
  },

  getProfessorDisciplinas: async (userId) => {
    await delay();
    const uid = Number(userId);
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
  getStudentDashboard: async (userId) => {
    await delay();
    const uid = Number(userId);
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

  // Cursos
  getCursos: async () => { await delay(); return db.cursos; },

  // Single Turma
  getTurma: async (id) => { await delay(); return db.turmas.find(t => Number(t.id) === Number(id)); },

  // Schedule
  getSchedule: async () => {
    await delay();
    return db.schedule;
  }
};

export default api;
