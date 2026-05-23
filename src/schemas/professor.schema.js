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
  celular: z.string().regex(/^\d{11}$/, 'Celular deve ter 11 dígitos numéricos').optional().or(z.literal('')),
  cpf: z.string().regex(/^\d{11}$/, 'CPF deve ter 11 dígitos numéricos').optional().or(z.literal('')),
  rg: z.string().regex(/^\d{7}$/, 'RG deve ter 7 dígitos numéricos').optional().or(z.literal('')),
  data_nascimento: z.string().optional().or(z.literal('')),
  ano_ingresso: z.coerce.number().min(1900, 'Ano inválido').max(2100, 'Ano inválido').optional().or(z.literal('')),
  titulacao: z.enum(['GRADUADO', 'ESPECIALISTA', 'MESTRE', 'DOUTOR', 'POS_DOUTOR'], {
    invalid_type_error: 'Selecione uma titulação válida'
  }).optional(),
  cep: z.string().optional().or(z.literal('')),
  logradouro: z.string().optional().or(z.literal('')),
  numero: z.string().optional().or(z.literal('')),
  complemento: z.string().optional().or(z.literal('')),
  bairro: z.string().optional().or(z.literal('')),
  cidade: z.string().optional().or(z.literal('')),
  estado: z.string().optional().or(z.literal('')),
  pais: z.string().optional().or(z.literal('')),
});

export const professorEditSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('E-mail inválido'),
  password: z.string().optional().refine(val => !val || val.length >= 6, 'Senha deve ter no mínimo 6 caracteres'),
  department: z.string().min(2, 'Departamento é obrigatório'),
  celular: z.string().regex(/^\d{11}$/, 'Celular deve ter 11 dígitos numéricos').optional().or(z.literal('')),
  cpf: z.string().regex(/^\d{11}$/, 'CPF deve ter 11 dígitos numéricos').optional().or(z.literal('')),
  rg: z.string().regex(/^\d{7}$/, 'RG deve ter 7 dígitos numéricos').optional().or(z.literal('')),
  data_nascimento: z.string().optional().or(z.literal('')),
  ano_ingresso: z.coerce.number().min(1900, 'Ano inválido').max(2100, 'Ano inválido').optional().or(z.literal('')),
  titulacao: z.enum(['GRADUADO', 'ESPECIALISTA', 'MESTRE', 'DOUTOR', 'POS_DOUTOR'], {
    invalid_type_error: 'Selecione uma titulação válida'
  }).optional(),
  cep: z.string().optional().or(z.literal('')),
  logradouro: z.string().optional().or(z.literal('')),
  numero: z.string().optional().or(z.literal('')),
  complemento: z.string().optional().or(z.literal('')),
  bairro: z.string().optional().or(z.literal('')),
  cidade: z.string().optional().or(z.literal('')),
  estado: z.string().optional().or(z.literal('')),
  pais: z.string().optional().or(z.literal('')),
});
