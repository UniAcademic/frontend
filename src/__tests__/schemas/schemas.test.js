import { describe, it, expect } from 'vitest';
import {
  loginSchema,
  alunoCreateSchema,
  alunoEditSchema,
  professorCreateSchema,
  professorEditSchema,
  usuarioCreateSchema,
  usuarioEditSchema,
  roleCreateSchema,
  roleEditSchema,
  acessoCreateSchema,
  acessoEditSchema,
  turmaSchema,
  disciplinaSchema,
  coordenadorCreateSchema,
  coordenadorEditSchema,
} from '@/schemas';

describe('loginSchema', () => {
  it('should validate a correct login', () => {
    const result = loginSchema.safeParse({ identifier: '00100009', password: '123456' });
    expect(result.success).toBe(true);
  });

  it('should reject empty identifier', () => {
    const result = loginSchema.safeParse({ identifier: '', password: '123456' });
    expect(result.success).toBe(false);
  });

  it('should reject short password', () => {
    const result = loginSchema.safeParse({ identifier: '001', password: '123' });
    expect(result.success).toBe(false);
  });
});

describe('alunoCreateSchema', () => {
  const validAluno = {
    name: 'João Silva',
    ra: '123456',
    email: 'joao@email.com',
    password: '123456',
    curso: 'Ciência da Computação',
    status: 'Ativo',
  };

  it('should validate a correct aluno', () => {
    const result = alunoCreateSchema.safeParse(validAluno);
    expect(result.success).toBe(true);
  });

  it('should reject name with less than 3 chars', () => {
    const result = alunoCreateSchema.safeParse({ ...validAluno, name: 'Jo' });
    expect(result.success).toBe(false);
  });

  it('should reject non-numeric RA', () => {
    const result = alunoCreateSchema.safeParse({ ...validAluno, ra: 'ABC123' });
    expect(result.success).toBe(false);
  });

  it('should reject invalid email', () => {
    const result = alunoCreateSchema.safeParse({ ...validAluno, email: 'invalid' });
    expect(result.success).toBe(false);
  });

  it('should reject invalid status', () => {
    const result = alunoCreateSchema.safeParse({ ...validAluno, status: 'Pendente' });
    expect(result.success).toBe(false);
  });
});

describe('alunoEditSchema', () => {
  it('should accept optional empty password', () => {
    const result = alunoEditSchema.safeParse({
      name: 'João',
      ra: '123456',
      email: 'j@e.com',
      curso: 'CC',
      status: 'Ativo',
    });
    expect(result.success).toBe(true);
  });

  it('should reject password shorter than 6 chars if provided', () => {
    const result = alunoEditSchema.safeParse({
      name: 'João',
      ra: '123456',
      email: 'j@e.com',
      password: '123',
      curso: 'CC',
      status: 'Ativo',
    });
    expect(result.success).toBe(false);
  });
});

describe('professorCreateSchema', () => {
  const validProfessor = {
    name: 'Maria Professora',
    email: 'maria@uni.com',
    password: '123456',
    department: 'TI',
  };

  it('should validate a correct professor', () => {
    const result = professorCreateSchema.safeParse(validProfessor);
    expect(result.success).toBe(true);
  });

  it('should reject short department', () => {
    const result = professorCreateSchema.safeParse({ ...validProfessor, department: 'A' });
    expect(result.success).toBe(false);
  });
});

describe('professorEditSchema', () => {
  it('should accept optional password', () => {
    const result = professorEditSchema.safeParse({
      name: 'Maria',
      email: 'maria@uni.com',
      department: 'TI',
    });
    expect(result.success).toBe(true);
  });
});

describe('usuarioCreateSchema', () => {
  it('should validate a correct usuario', () => {
    const result = usuarioCreateSchema.safeParse({
      nome: 'Carlos',
      email: 'carlos@email.com',
      senha: '123456',
      tipo_usuario: 'ALUNO',
    });
    expect(result.success).toBe(true);
  });

  it('should reject empty nome', () => {
    const result = usuarioCreateSchema.safeParse({
      nome: '',
      email: 'c@e.com',
      senha: '123',
      tipo_usuario: 'ALUNO',
    });
    expect(result.success).toBe(false);
  });
});

describe('usuarioEditSchema', () => {
  it('should validate without senha', () => {
    const result = usuarioEditSchema.safeParse({
      nome: 'Carlos Editado',
      email: 'carlos@email.com',
    });
    expect(result.success).toBe(true);
  });
});

describe('roleCreateSchema', () => {
  it('should validate a correct role', () => {
    const result = roleCreateSchema.safeParse({ role: 'ADMIN', descricao: 'Administrador' });
    expect(result.success).toBe(true);
  });

  it('should reject empty role name', () => {
    const result = roleCreateSchema.safeParse({ role: '', descricao: 'Desc' });
    expect(result.success).toBe(false);
  });

  it('should reject empty descricao', () => {
    const result = roleCreateSchema.safeParse({ role: 'ADMIN', descricao: '' });
    expect(result.success).toBe(false);
  });
});

describe('acessoCreateSchema', () => {
  it('should validate a correct acesso', () => {
    const result = acessoCreateSchema.safeParse({ acesso: 'USUARIO:CONSULTAR', descricao: 'Consultar usuários' });
    expect(result.success).toBe(true);
  });

  it('should reject empty acesso', () => {
    const result = acessoCreateSchema.safeParse({ acesso: '', descricao: 'Desc' });
    expect(result.success).toBe(false);
  });
});

describe('turmaSchema', () => {
  it('should validate a correct turma', () => {
    const result = turmaSchema.safeParse({
      name: 'Turma A',
      shift: 'Manhã',
      semester: '2025.1',
      location: 'Sala 101',
    });
    expect(result.success).toBe(true);
  });

  it('should reject missing fields', () => {
    const result = turmaSchema.safeParse({ name: 'T' });
    expect(result.success).toBe(false);
  });
});

describe('disciplinaSchema', () => {
  it('should validate a correct disciplina', () => {
    const result = disciplinaSchema.safeParse({
      name: 'Algoritmos',
      code: 'ALG001',
      workload: '60h',
    });
    expect(result.success).toBe(true);
  });

  it('should reject empty code', () => {
    const result = disciplinaSchema.safeParse({
      name: 'Algo',
      code: '',
      workload: '60h',
    });
    expect(result.success).toBe(false);
  });
});

describe('alunoCreateSchema extended fields', () => {
  const validAluno = {
    name: 'João Silva',
    ra: '123456',
    email: 'joao@email.com',
    password: '123456',
    curso: 'Ciência da Computação',
    status: 'Ativo',
  };

  it('should validate a correct aluno with cpf, rg and celular', () => {
    const result = alunoCreateSchema.safeParse({
      ...validAluno,
      cpf: '12345678901',
      rg: '1234567',
      celular: '11999998888',
    });
    expect(result.success).toBe(true);
  });

  it('should reject invalid CPF format', () => {
    const result = alunoCreateSchema.safeParse({ ...validAluno, cpf: '123456789' });
    expect(result.success).toBe(false);
  });

  it('should reject invalid RG format', () => {
    const result = alunoCreateSchema.safeParse({ ...validAluno, rg: '12345' });
    expect(result.success).toBe(false);
  });
});

describe('coordenadorCreateSchema', () => {
  const validCoordenador = {
    name: 'Roberto Coordenador',
    email: 'roberto@uni.com',
    password: 'password123',
    matricula: 'COORD001',
    titulacao: 'MESTRE',
  };

  it('should validate a correct coordenador', () => {
    const result = coordenadorCreateSchema.safeParse(validCoordenador);
    expect(result.success).toBe(true);
  });

  it('should reject invalid email', () => {
    const result = coordenadorCreateSchema.safeParse({ ...validCoordenador, email: 'roberto' });
    expect(result.success).toBe(false);
  });

  it('should reject invalid description of enum', () => {
    const result = coordenadorCreateSchema.safeParse({ ...validCoordenador, titulacao: 'SUPER_HEROI' });
    expect(result.success).toBe(false);
  });
});

describe('coordenadorEditSchema', () => {
  it('should accept missing password', () => {
    const result = coordenadorEditSchema.safeParse({
      name: 'Roberto',
      email: 'roberto@uni.com',
      matricula: 'COORD001',
      titulacao: 'MESTRE',
    });
    expect(result.success).toBe(true);
  });
});
