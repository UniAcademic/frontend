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
  celular: z.string().regex(/^\d{11}$/, 'Celular deve ter 11 dígitos numéricos').optional().or(z.literal('')),
  cpf: z.string().regex(/^\d{11}$/, 'CPF deve ter 11 dígitos numéricos').optional().or(z.literal('')),
  rg: z.string().regex(/^\d{7}$/, 'RG deve ter 7 dígitos numéricos').optional().or(z.literal('')),
  data_nascimento: z.string().optional().or(z.literal('')),
  ano_ingresso: z.coerce.number().min(1900, 'Ano inválido').max(2100, 'Ano inválido').optional().or(z.literal('')),
  cep: z.string().optional().or(z.literal('')),
  logradouro: z.string().optional().or(z.literal('')),
  numero: z.string().optional().or(z.literal('')),
  complemento: z.string().optional().or(z.literal('')),
  bairro: z.string().optional().or(z.literal('')),
  cidade: z.string().optional().or(z.literal('')),
  estado: z.string().optional().or(z.literal('')),
  pais: z.string().optional().or(z.literal('')),
});

export const alunoEditSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  ra: z.string().min(6, 'RA deve ter no mínimo 6 caracteres').regex(/^\d+$/, 'RA deve conter apenas números'),
  email: z.string().email('E-mail inválido'),
  password: z.string().optional().refine(val => !val || val.length >= 6, 'Senha deve ter no mínimo 6 caracteres'),
  curso: z.string().optional(),
  status: z.enum(['Ativo', 'Inativo'], { required_error: 'Selecione um status' }),
  celular: z.string().regex(/^\d{11}$/, 'Celular deve ter 11 dígitos numéricos').optional().or(z.literal('')),
  cpf: z.string().regex(/^\d{11}$/, 'CPF deve ter 11 dígitos numéricos').optional().or(z.literal('')),
  rg: z.string().regex(/^\d{7}$/, 'RG deve ter 7 dígitos numéricos').optional().or(z.literal('')),
  data_nascimento: z.string().optional().or(z.literal('')),
  ano_ingresso: z.coerce.number().min(1900, 'Ano inválido').max(2100, 'Ano inválido').optional().or(z.literal('')),
  cep: z.string().optional().or(z.literal('')),
  logradouro: z.string().optional().or(z.literal('')),
  numero: z.string().optional().or(z.literal('')),
  complemento: z.string().optional().or(z.literal('')),
  bairro: z.string().optional().or(z.literal('')),
  cidade: z.string().optional().or(z.literal('')),
  estado: z.string().optional().or(z.literal('')),
  pais: z.string().optional().or(z.literal('')),
});
