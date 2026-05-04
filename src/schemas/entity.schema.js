/**
 * @module entity.schema
 * @description Schemas Zod para o formulário genérico EntityForm (turmas, disciplinas).
 */
import { z } from 'zod';

export const turmaSchema = z.object({
  name: z.string().min(1, 'Nome da turma é obrigatório'),
  shift: z.string().min(1, 'Selecione um turno'),
  semester: z.string().min(1, 'Semestre é obrigatório'),
  location: z.string().min(1, 'Local é obrigatório'),
});

export const disciplinaSchema = z.object({
  name: z.string().min(1, 'Nome da disciplina é obrigatório'),
  code: z.string().min(1, 'Código é obrigatório'),
  workload: z.string().min(1, 'Carga horária é obrigatória'),
});
