/**
 * @module schemas
 * @description Barrel export para todos os schemas Zod.
 */
export { loginSchema } from './auth.schema';
export { alunoCreateSchema, alunoEditSchema } from './aluno.schema';
export { professorCreateSchema, professorEditSchema } from './professor.schema';
export { usuarioCreateSchema, usuarioEditSchema } from './usuario.schema';
export { roleCreateSchema, roleEditSchema } from './role.schema';
export { acessoCreateSchema, acessoEditSchema } from './acesso.schema';
export { turmaSchema, disciplinaSchema } from './entity.schema';
