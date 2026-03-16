import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../../services/api';

const alunoSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  ra: z.string().min(6, 'RA deve ter no mínimo 6 caracteres').regex(/^\d+$/, 'RA deve conter apenas números'),
  email: z.string().email('E-mail inválido'),
  curso: z.string().min(1, 'Selecione um curso'),
  status: z.enum(['Ativo', 'Inativo'], { required_error: 'Selecione um status' })
});

const AlunoForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [loading, setLoading] = useState(isEdit);
  const [cursos, setCursos] = useState([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(alunoSchema),
    defaultValues: { name: '', ra: '', email: '', curso: '', status: 'Ativo' }
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const cursosData = await api.getCursos();
        setCursos(cursosData);

        if (isEdit) {
          const aluno = await api.getAluno(parseInt(id));
          if (aluno) {
            reset({
              name: aluno.name,
              ra: aluno.ra,
              email: aluno.email || '',
              curso: aluno.curso,
              status: aluno.status
            });
          }
        }
      } catch (error) {
        console.error('Error loading form data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, isEdit, reset]);

  const onSubmit = async (formData) => {
    try {
      if (isEdit) {
        await api.updateAluno(parseInt(id), formData);
      } else {
        await api.createAluno({ ...formData, avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}` });
      }
      navigate('/admin/alunos');
    } catch (error) {
      console.error('Error saving aluno:', error);
    }
  };

  if (loading) {
    return (
      <div className="p-10 flex justify-center">
        <div className="w-8 h-8 border-4 border-[#F59E0B] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-2xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
          {isEdit ? 'Editar Aluno' : 'Novo Aluno'}
        </h1>
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#F59E0B] mt-2">
          {isEdit ? 'ATUALIZAR DADOS DO ALUNO' : 'CADASTRAR NOVO ALUNO NO SISTEMA'}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white dark:bg-[#020617] p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">NOME COMPLETO</label>
          <input
            type="text"
            {...register('name')}
            className={`w-full px-4 py-3.5 bg-slate-50 dark:bg-[#0B0F19] border ${errors.name ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'} rounded-lg text-sm font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent outline-none transition-all`}
            placeholder="Nome do aluno"
          />
          {errors.name && <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest mt-1.5">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">RA (REGISTRO ACADÊMICO)</label>
          <input
            type="text"
            {...register('ra')}
            className={`w-full px-4 py-3.5 bg-slate-50 dark:bg-[#0B0F19] border ${errors.ra ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'} rounded-lg text-sm font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent outline-none transition-all`}
            placeholder="202410001"
          />
          {errors.ra && <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest mt-1.5">{errors.ra.message}</p>}
        </div>

        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">E-MAIL</label>
          <input
            type="email"
            {...register('email')}
            className={`w-full px-4 py-3.5 bg-slate-50 dark:bg-[#0B0F19] border ${errors.email ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'} rounded-lg text-sm font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent outline-none transition-all`}
            placeholder="aluno@uniacademic.com"
          />
          {errors.email && <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest mt-1.5">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">CURSO</label>
          <select
            {...register('curso')}
            className={`w-full px-4 py-3.5 bg-slate-50 dark:bg-[#0B0F19] border ${errors.curso ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'} rounded-lg text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent outline-none transition-all`}
          >
            <option value="">Selecione...</option>
            {cursos.map(c => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
          {errors.curso && <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest mt-1.5">{errors.curso.message}</p>}
        </div>

        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">STATUS</label>
          <select
            {...register('status')}
            className={`w-full px-4 py-3.5 bg-slate-50 dark:bg-[#0B0F19] border ${errors.status ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'} rounded-lg text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent outline-none transition-all`}
          >
            <option value="Ativo">Ativo</option>
            <option value="Inativo">Inativo</option>
          </select>
          {errors.status && <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest mt-1.5">{errors.status.message}</p>}
        </div>

        <div className="flex items-center gap-4 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 py-4 bg-[#0B0F19] dark:bg-[#F59E0B] text-white dark:text-[#0B0F19] font-black uppercase text-[11px] tracking-widest rounded-lg hover:bg-slate-800 dark:hover:bg-[#D97706] transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Salvando...' : (isEdit ? 'Atualizar Aluno' : 'Cadastrar Aluno')}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/alunos')}
            className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black uppercase text-[11px] tracking-widest rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default AlunoForm;
