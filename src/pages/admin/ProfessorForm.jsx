import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import api from '@/services/api';
import { professorCreateSchema, professorEditSchema } from '@/schemas/professor.schema';
import { generateNewAvatarUrl } from '@/config/external.config';
import { ROUTES } from '@/config/routes.config';

const ProfessorForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [loading, setLoading] = useState(isEdit);
  const [submitError, setSubmitError] = useState('');
  const [professorData, setProfessorData] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(isEdit ? professorEditSchema : professorCreateSchema),
    defaultValues: { name: '', email: '', password: '', department: '' }
  });

  useEffect(() => {
    if (isEdit) {
      const fetchData = async () => {
        try {
          const professor = await api.getProfessor(parseInt(id));
          if (professor) {
            setProfessorData(professor);
            reset({
              name: professor.name,
              email: professor.email || '',
              password: '',
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
    setSubmitError('');
    try {
      if (isEdit) {
        // Update professor record
        const professorPayload = {
          name: formData.name,
          email: formData.email,
          department: formData.department
        };
        await api.updateProfessor(parseInt(id), { ...professorData, ...professorPayload });

        // Update user credentials if password changed or email changed
        if (professorData?.userId && (formData.password || formData.email !== professorData.email)) {
          const userUpdate = {
            name: formData.name,
            email: formData.email,
            avatar: professorData.avatar
          };
          if (formData.password) {
            userUpdate.password = formData.password;
          }
          await api.updateUser(professorData.userId, userUpdate);
        }
      } else {
        // Create user first (login credentials)
        const avatar = generateNewAvatarUrl();
        const newUser = await api.createUser({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: 'professor',
          avatar,
          department: formData.department
        });

        // Then create professor record linked to user
        await api.createProfessor({
          userId: newUser.id,
          name: formData.name,
          email: formData.email,
          department: formData.department,
          avatar
        });
      }
      navigate(ROUTES.ADMIN.PROFESSORES);
    } catch (error) {
      console.error('Error saving professor:', error);
      setSubmitError('Erro ao salvar. Verifique se o e-mail já não está em uso.');
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

      {submitError && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400 font-bold">{submitError}</p>
        </div>
      )}

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
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
            SENHA {isEdit && <span className="text-slate-400 normal-case tracking-normal">(deixe em branco para manter a atual)</span>}
          </label>
          <input
            type="password"
            {...register('password')}
            className={`w-full px-4 py-3.5 bg-slate-50 dark:bg-[#0B0F19] border ${errors.password ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'} rounded-lg text-sm font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent outline-none transition-all`}
            placeholder={isEdit ? '••••••••' : 'Mínimo 6 caracteres'}
          />
          {errors.password && <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest mt-1.5">{errors.password.message}</p>}
        </div>

        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">DEPARTAMENTO</label>
          <input
            type="text"
            {...register('department')}
            className={`w-full px-4 py-3.5 bg-slate-50 dark:bg-[#0B0F19] border ${errors.department ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'} rounded-lg text-sm font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent outline-none transition-all`}
            placeholder="Ex: Ciência da Computação"
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
            onClick={() => navigate(ROUTES.ADMIN.PROFESSORES)}
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
