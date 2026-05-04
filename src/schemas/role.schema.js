/**
 * @module role.schema
 * @description Schemas Zod para o formulário de criação de roles.
 */
import { z } from 'zod';

export const roleCreateSchema = z.object({
  role: z.string().min(1, 'Nome da role é obrigatório'),
  descricao: z.string().min(1, 'Descrição é obrigatória'),
});

export const roleEditSchema = z.object({
  role: z.string().min(1, 'Nome da role é obrigatório'),
  descricao: z.string().optional(),
});
