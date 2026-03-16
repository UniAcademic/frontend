import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().min(1, 'E-mail é obrigatório').email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  confirmPassword: z.string().min(1, 'Confirmação é obrigatória'),
  role: z.enum(['student', 'professor'], { required_error: 'Selecione um tipo de conta' })
}).refine(data => data.password === data.confirmPassword, {
  message: 'Senhas não coincidem',
  path: ['confirmPassword']
});

const Register = () => {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '', role: 'student' }
  });

  const onSubmit = async (formData) => {
    setServerError('');
    try {
      navigate('/login');
    } catch (error) {
      setServerError(error.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#0B0F19]">
      {/* Left Panel - Branding */}
      <div className="hidden md:flex w-1/2 flex-col items-center justify-center relative overflow-hidden p-16">
        <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(to_right,#F59E0B08_1px,transparent_1px),linear-gradient(to_bottom,#F59E0B08_1px,transparent_1px)] [background-size:24px_24px]"></div>
        <div className="relative z-10 flex flex-col items-center text-center max-w-md">
          <h1 className="text-5xl font-black text-white uppercase tracking-tight italic">
            UniAcademic
          </h1>
          <p className="text-sm font-medium text-slate-400 mt-4 leading-relaxed">
            Junte-se a milhares de estudantes e professores que já transformaram sua experiência acadêmica.
          </p>
          <p className="text-[11px] font-black uppercase tracking-[0.3em] text-[#F59E0B] mt-6">
            PLATAFORMA DE GESTÃO ACADÊMICA
          </p>
          
          <div className="mt-12 flex flex-col items-center gap-4">
            <div className="flex items-center gap-3 text-slate-400 text-sm">
              <span className="w-2 h-2 bg-[#F59E0B] rounded-full"></span>
              <span className="text-[10px] font-bold uppercase tracking-widest">Gestão de Turmas & Disciplinas</span>
            </div>
            <div className="flex items-center gap-3 text-slate-400 text-sm">
              <span className="w-2 h-2 bg-[#F59E0B] rounded-full"></span>
              <span className="text-[10px] font-bold uppercase tracking-widest">Controle de Notas & Frequência</span>
            </div>
            <div className="flex items-center gap-3 text-slate-400 text-sm">
              <span className="w-2 h-2 bg-[#F59E0B] rounded-full"></span>
              <span className="text-[10px] font-bold uppercase tracking-widest">Horários & Calendário Acadêmico</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Register Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-[#f8f9fa] dark:bg-[#020617]">
        <div className="w-full max-w-md">
          <div className="mb-10">
            <h2 className="text-3xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
              Cadastro
            </h2>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mt-2">
              PREENCHA OS DADOS PARA CRIAR SUA CONTA
            </p>
          </div>

          {serverError && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400 font-bold">{serverError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">NOME COMPLETO</label>
              <input
                type="text"
                {...register('name')}
                placeholder="Seu nome completo"
                className={`w-full px-4 py-3.5 bg-white dark:bg-[#0B0F19] border ${errors.name ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'} rounded-lg text-sm font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent outline-none transition-all`}
              />
              {errors.name && <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest mt-1.5">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">E-MAIL INSTITUCIONAL</label>
              <input
                type="email"
                {...register('email')}
                placeholder="seu.email@uniacademic.com"
                className={`w-full px-4 py-3.5 bg-white dark:bg-[#0B0F19] border ${errors.email ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'} rounded-lg text-sm font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent outline-none transition-all`}
              />
              {errors.email && <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest mt-1.5">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">TIPO DE CONTA</label>
              <select
                {...register('role')}
                className={`w-full px-4 py-3.5 bg-white dark:bg-[#0B0F19] border ${errors.role ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'} rounded-lg text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent outline-none transition-all`}
              >
                <option value="student">Aluno</option>
                <option value="professor">Professor</option>
              </select>
              {errors.role && <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest mt-1.5">{errors.role.message}</p>}
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">SENHA</label>
              <input
                type="password"
                {...register('password')}
                placeholder="••••••••"
                className={`w-full px-4 py-3.5 bg-white dark:bg-[#0B0F19] border ${errors.password ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'} rounded-lg text-sm font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent outline-none transition-all`}
              />
              {errors.password && <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest mt-1.5">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">CONFIRMAR SENHA</label>
              <input
                type="password"
                {...register('confirmPassword')}
                placeholder="••••••••"
                className={`w-full px-4 py-3.5 bg-white dark:bg-[#0B0F19] border ${errors.confirmPassword ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'} rounded-lg text-sm font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent outline-none transition-all`}
              />
              {errors.confirmPassword && <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest mt-1.5">{errors.confirmPassword.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-[#0B0F19] dark:bg-[#F59E0B] text-white dark:text-[#0B0F19] font-black uppercase text-[11px] tracking-widest rounded-lg hover:bg-slate-800 dark:hover:bg-[#D97706] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Criando conta...' : 'Criar Conta'}
            </button>
          </form>

          <p className="mt-8 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Já tem conta?{' '}
            <Link to="/login" className="text-[#F59E0B] hover:text-[#D97706] font-black transition-colors">Entrar</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
