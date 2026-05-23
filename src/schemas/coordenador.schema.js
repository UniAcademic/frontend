import { z } from 'zod';

export const coordenadorCreateSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  matricula: z.string().min(1, 'Matrícula é obrigatória'),
  titulacao: z.enum(['GRADUADO', 'ESPECIALISTA', 'MESTRE', 'DOUTOR', 'POS_DOUTOR'], {
    invalid_type_error: 'Selecione uma titulação válida'
  }).optional(),
});

export const coordenadorEditSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('E-mail inválido'),
  password: z.string().optional().refine(val => !val || val.length >= 6, 'Senha deve ter no mínimo 6 caracteres'),
  matricula: z.string().min(1, 'Matrícula é obrigatória'),
  titulacao: z.enum(['GRADUADO', 'ESPECIALISTA', 'MESTRE', 'DOUTOR', 'POS_DOUTOR'], {
    invalid_type_error: 'Selecione uma titulação válida'
  }).optional(),
});
