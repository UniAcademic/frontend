/**
 * @module auth.schema
 * @description Schemas Zod para formulários de autenticação.
 */
import { z } from 'zod';

export const loginSchema = z.object({
  identifier: z.string().trim().min(1, 'Matrícula é obrigatória'),
  password: z.string().trim().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});
