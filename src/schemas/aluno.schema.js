/**
 * @module aluno.schema
 * @description Schemas Zod para formulários de aluno (criação e edição).
 */
import { z } from 'zod';

export const alunoCreateSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  ra: z.string().min(6, 'RA deve ter no mínimo 6 caracteres').regex(/^\d+$/, 'RA deve conter apenas números'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  curso: z.string().min(1, 'Selecione um curso'),
  status: z.enum(['Ativo', 'Inativo'], { required_error: 'Selecione um status' }),
});

export const alunoEditSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  ra: z.string().min(6, 'RA deve ter no mínimo 6 caracteres').regex(/^\d+$/, 'RA deve conter apenas números'),
  email: z.string().email('E-mail inválido'),
  password: z.string().optional().refine(val => !val || val.length >= 6, 'Senha deve ter no mínimo 6 caracteres'),
  curso: z.string().min(1, 'Selecione um curso'),
  status: z.enum(['Ativo', 'Inativo'], { required_error: 'Selecione um status' }),
});
