import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../contexts/AuthContext';
import Logo from '../../components/Logo';

const loginSchema = z.object({
  email: z.string().min(1, 'E-mail é obrigatório').email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres')
});

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' }
  });

  const onSubmit = async (formData) => {
    setServerError('');
    try {
      const user = await login(formData.email, formData.password);
      const redirectMap = { admin: '/admin', professor: '/professor', student: '/student' };
      navigate(redirectMap[user.role] || '/login');
    } catch (error) {
      setServerError(error.message || 'Credenciais inválidas. Verifique seu e-mail e senha.');
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
            Transforme a gestão acadêmica da sua instituição com a plataforma mais completa e intuitiva do mercado.
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

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-[#f8f9fa] dark:bg-[#020617]">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
      

          <div className="mb-10">
            <h2 className="text-3xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
              Entrar
            </h2>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mt-2">
              ACESSE SUA CONTA INSTITUCIONAL
            </p>
          </div>

          {serverError && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400 font-bold">{serverError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
                E-MAIL INSTITUCIONAL
              </label>
              <input
                type="email"
                {...register('email')}
                placeholder="seu.email@uniacademic.com"
                className={`w-full px-4 py-3.5 bg-white dark:bg-[#0B0F19] border ${errors.email ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'} rounded-lg text-sm font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent outline-none transition-all`}
              />
              {errors.email && (
                <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest mt-1.5">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
                SENHA
              </label>
              <input
                type="password"
                {...register('password')}
                placeholder="••••••••"
                className={`w-full px-4 py-3.5 bg-white dark:bg-[#0B0F19] border ${errors.password ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'} rounded-lg text-sm font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent outline-none transition-all`}
              />
              {errors.password && (
                <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest mt-1.5">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-[#F59E0B] focus:ring-[#F59E0B]" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Lembrar-me</span>
              </label>
              <Link to="/forgot-password" className="text-[10px] font-black uppercase tracking-widest text-[#F59E0B] hover:text-[#D97706] transition-colors">
                Esqueci a senha
              </Link>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-[#0B0F19] dark:bg-[#F59E0B] text-white dark:text-[#0B0F19] font-black uppercase text-[11px] tracking-widest rounded-lg hover:bg-slate-800 dark:hover:bg-[#D97706] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Entrando...' : 'Acessar Plataforma'}
            </button>
          </form>

          <p className="mt-8 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Não tem conta?{' '}
            <Link to="/register" className="text-[#F59E0B] hover:text-[#D97706] font-black transition-colors">
              Registre-se
            </Link>
          </p>

          <div className="mt-6 p-4 bg-slate-100 dark:bg-slate-800/30 rounded-lg border border-slate-200 dark:border-slate-800">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Contas de teste:</p>
            <p className="text-[10px] text-slate-500 font-mono">Admin: admin@uniacademic.com / admin123</p>
            <p className="text-[10px] text-slate-500 font-mono">Prof: sarah@uniacademic.com / prof123</p>
            <p className="text-[10px] text-slate-500 font-mono">Aluno: alice@uniacademic.com / aluno123</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
