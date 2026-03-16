import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../../services/api';

const professorSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('E-mail inválido'),
  department: z.string().min(2, 'Departamento é obrigatório')
});

const ProfessorForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [loading, setLoading] = useState(isEdit);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(professorSchema),
    defaultValues: { name: '', email: '', department: '' }
  });

  useEffect(() => {
    if (isEdit) {
      const fetchData = async () => {
        try {
          const professor = await api.getProfessor(parseInt(id));
          if (professor) {
            reset({
              name: professor.name,
              email: professor.email || '',
              department: professor.department
            });
          }
        } catch (error) {
          console.error('Error loading professor:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [id, isEdit, reset]);

  const onSubmit = async (formData) => {
    try {
      if (isEdit) {
        await api.updateProfessor(parseInt(id), formData);
      } else {
        await api.createProfessor({ ...formData, avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}` });
      }
      navigate('/admin/professores');
    } catch (error) {
      console.error('Error saving professor:', error);
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
          {isEdit ? 'Editar Professor' : 'Novo Professor'}
        </h1>
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#F59E0B] mt-2">
          {isEdit ? 'ATUALIZAR DADOS DO PROFESSOR' : 'CADASTRAR NOVO PROFESSOR'}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white dark:bg-[#020617] p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">NOME COMPLETO</label>
          <input
            type="text"
            {...register('name')}
            className={`w-full px-4 py-3.5 bg-slate-50 dark:bg-[#0B0F19] border ${errors.name ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'} rounded-lg text-sm font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent outline-none transition-all`}
            placeholder="Nome do professor"
          />
          {errors.name && <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest mt-1.5">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">E-MAIL</label>
          <input
            type="email"
            {...register('email')}
            className={`w-full px-4 py-3.5 bg-slate-50 dark:bg-[#0B0F19] border ${errors.email ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'} rounded-lg text-sm font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent outline-none transition-all`}
            placeholder="professor@uniacademic.com"
          />
          {errors.email && <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest mt-1.5">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">DEPARTAMENTO</label>
          <input
            type="text"
            {...register('department')}
            className={`w-full px-4 py-3.5 bg-slate-50 dark:bg-[#0B0F19] border ${errors.department ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'} rounded-lg text-sm font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent outline-none transition-all`}
            placeholder="Ex: Computer Science"
          />
          {errors.department && <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest mt-1.5">{errors.department.message}</p>}
        </div>

        <div className="flex items-center gap-4 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 py-4 bg-[#0B0F19] dark:bg-[#F59E0B] text-white dark:text-[#0B0F19] font-black uppercase text-[11px] tracking-widest rounded-lg hover:bg-slate-800 dark:hover:bg-[#D97706] transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Salvando...' : (isEdit ? 'Atualizar Professor' : 'Cadastrar Professor')}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/professores')}
            className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black uppercase text-[11px] tracking-widest rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfessorForm;
