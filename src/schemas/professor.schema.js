/**
 * @module professor.schema
 * @description Schemas Zod para formulários de professor (criação e edição).
 */
import { z } from 'zod';

export const professorCreateSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  department: z.string().min(2, 'Departamento é obrigatório'),
});

export const professorEditSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('E-mail inválido'),
  password: z.string().optional().refine(val => !val || val.length >= 6, 'Senha deve ter no mínimo 6 caracteres'),
  department: z.string().min(2, 'Departamento é obrigatório'),
});
