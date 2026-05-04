/**
 * @module acesso.schema
 * @description Schemas Zod para o formulário de criação de acessos.
 */
import { z } from 'zod';

export const acessoCreateSchema = z.object({
  acesso: z.string().min(1, 'Nome do acesso é obrigatório'),
  descricao: z.string().min(1, 'Descrição é obrigatória'),
});

export const acessoEditSchema = z.object({
  acesso: z.string().min(1, 'Nome do acesso é obrigatório'),
  descricao: z.string().optional(),
});
