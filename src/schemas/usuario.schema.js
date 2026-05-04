/**
 * @module usuario.schema
 * @description Schemas Zod para o formulário de criação de usuários (ms-usuario API).
 */
import { z } from 'zod';

export const usuarioCreateSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('E-mail inválido'),
  celular: z.string().optional(),
  senha: z.string().min(1, 'Senha é obrigatória'),
  tipo_usuario: z.string().min(1, 'Tipo de usuário é obrigatório'),
});

export const usuarioEditSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('E-mail inválido'),
  celular: z.string().optional(),
});
