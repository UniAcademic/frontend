import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const forgotSchema = z.object({
  email: z.string().min(1, 'E-mail é obrigatório').email('E-mail inválido')
});

const ForgotPassword = () => {
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: '' }
  });

  const onSubmit = async () => {
    setSent(true);
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
            Não se preocupe, acontece com todo mundo. Vamos te ajudar a recuperar o acesso à sua conta rapidamente.
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

      {/* Right Panel - Forgot Password Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-[#f8f9fa] dark:bg-[#020617]">
        <div className="w-full max-w-md">
          <div className="mb-10">
            <h2 className="text-3xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
              Recuperar Senha
            </h2>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mt-2">
              INFORME SEU E-MAIL PARA REDEFINIR
            </p>
          </div>

          {sent ? (
            <div className="space-y-6">
              <div className="p-6 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg text-center">
                <span className="material-symbols-outlined text-emerald-500 text-4xl mb-3 block">check_circle</span>
                <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">E-mail enviado com sucesso!</p>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-500 mt-2 uppercase tracking-widest font-bold">
                  Verifique sua caixa de entrada
                </p>
              </div>
              <Link
                to="/login"
                className="w-full py-4 bg-[#0B0F19] dark:bg-[#F59E0B] text-white dark:text-[#0B0F19] font-black uppercase text-[11px] tracking-widest rounded-lg hover:bg-slate-800 dark:hover:bg-[#D97706] transition-colors flex items-center justify-center"
              >
                Voltar para Login
              </Link>
            </div>
          ) : (
            <>
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

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-[#0B0F19] dark:bg-[#F59E0B] text-white dark:text-[#0B0F19] font-black uppercase text-[11px] tracking-widest rounded-lg hover:bg-slate-800 dark:hover:bg-[#D97706] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Enviando...' : 'Enviar Link de Recuperação'}
                </button>
              </form>

              <p className="mt-8 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Lembrou a senha?{' '}
                <Link to="/login" className="text-[#F59E0B] hover:text-[#D97706] font-black transition-colors">
                  Voltar ao Login
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
