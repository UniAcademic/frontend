import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const StudentProfile = () => {
  const [data, setData] = useState(null);
  const [coordinator, setCoordinator] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        // Busca dados do aluno + semestre
        const studentData = await api.getStudentDashboard(user.id);
        setData(studentData);

        // Tenta encontrar o coordenador com base no curso do aluno
        if (studentData?.aluno) {
          const { aluno } = studentData;

          // Busca professores para encontrar o coordenador do curso
          const professores = await api.getProfessores();

          // Busca cursos para correlacionar o cursoId do aluno
          const cursos = await api.getCursos();
          const curso = cursos.find(
            (c) =>
              Number(c.id) === Number(aluno.cursoId) ||
              c.name === aluno.curso
          );

          // Tenta achar coordenador pelo campo coordinator no curso, ou pelo departamento
          let coord = null;
          if (curso?.coordinatorId) {
            coord = professores.find(
              (p) => Number(p.id) === Number(curso.coordinatorId)
            );
          }
          if (!coord && curso) {
            // Fallback: professor do mesmo departamento que o curso
            coord = professores.find(
              (p) =>
                p.department?.toLowerCase().includes(curso.name?.toLowerCase().split(' ')[0])
            );
          }
          if (!coord) {
            // Fallback genérico: primeiro professor
            coord = professores[0] || null;
          }

          setCoordinator(coord);
        }
      } catch (error) {
        console.error('Erro ao carregar perfil do aluno:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-slate-50 dark:bg-[#0B0F19]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[#F59E0B] border-t-transparent rounded-full animate-spin" />
          <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">
            Carregando perfil...
          </p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-slate-50 dark:bg-[#0B0F19]">
        <p className="text-slate-500 text-sm font-semibold uppercase tracking-widest">
          Não foi possível carregar seu perfil.
        </p>
      </div>
    );
  }

  const { aluno, semestre } = data;
  const coordinatorName = coordinator?.name || 'Coordenação Geral';

  return (
    <div className="bg-slate-50 dark:bg-[#0B0F19] min-h-screen font-sans pb-20">
      <main className="max-w-[960px] mx-auto px-6 py-10">

        {/* Page Title */}
        <div className="mb-10">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#F59E0B] mb-2">
            ÁREA DO ALUNO
          </p>
          <h1 className="text-4xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
            Meu Perfil
          </h1>
        </div>

        {/* Main Profile Card */}
        <div className="bg-white dark:bg-[#020617] border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xl shadow-slate-200/60 dark:shadow-none">

          {/* Banner */}
          <div className="relative h-36 bg-gradient-to-br from-[#F59E0B] via-[#D97706] to-[#B45309]">
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)',
                backgroundSize: '12px 12px',
              }}
            />
            {/* Decorative circle */}
            <div className="absolute -bottom-8 right-8 w-24 h-24 rounded-full bg-white/10 dark:bg-white/5 blur-2xl" />
          </div>

          {/* Content below banner */}
          <div className="px-8 pb-10 relative">

            {/* Avatar (positioned to overlap the banner) */}
            <div className="absolute -top-14 left-8">
              <div className="relative">
                <img
                  src={
                    aluno.avatar ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(aluno.name)}&background=F59E0B&color=fff&size=128&bold=true`
                  }
                  alt={aluno.name}
                  className="w-28 h-28 rounded-2xl border-4 border-white dark:border-[#020617] object-cover shadow-lg bg-amber-100"
                />
                {/* Online dot */}
                <span className="absolute bottom-2 right-2 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-[#020617] rounded-full block" />
              </div>
            </div>

            {/* Status badge (top-right of card) */}
            <div className="flex justify-end pt-3 mb-6">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                aluno.status === 'Ativo'
                  ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/25'
                  : 'bg-red-500/10 text-red-500 border-red-500/25'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${aluno.status === 'Ativo' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                {aluno.status || 'Ativo'}
              </span>
            </div>

            {/* Grid of info */}
            <div className="pt-10 grid grid-cols-1 md:grid-cols-2 gap-10">

              {/* Left column */}
              <div className="flex flex-col gap-7">

                {/* Nome */}
                <div>
                  <label className="block text-[9px] font-black uppercase tracking-[0.22em] text-slate-400 mb-1.5">
                    Nome Completo
                  </label>
                  <p className="text-2xl font-black text-slate-900 dark:text-white leading-tight uppercase">
                    {aluno.name}
                  </p>
                </div>

                {/* Matrícula (RA) */}
                <div>
                  <label className="block text-[9px] font-black uppercase tracking-[0.22em] text-slate-400 mb-1.5">
                    Matrícula (RA)
                  </label>
                  <div className="inline-flex items-center gap-2 bg-slate-100 dark:bg-slate-800/60 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="material-symbols-outlined text-[#F59E0B] text-base">badge</span>
                    <span className="text-base font-black text-slate-800 dark:text-slate-200 tracking-widest">
                      #{aluno.ra || aluno.id}
                    </span>
                  </div>
                </div>

                {/* Email */}
                {aluno.email && (
                  <div>
                    <label className="block text-[9px] font-black uppercase tracking-[0.22em] text-slate-400 mb-1.5">
                      E-mail Acadêmico
                    </label>
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <span className="material-symbols-outlined text-slate-400 text-base">mail</span>
                      <span className="text-sm font-semibold">{aluno.email}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Right column */}
              <div className="flex flex-col gap-7">

                {/* Curso e Período */}
                <div>
                  <label className="block text-[9px] font-black uppercase tracking-[0.22em] text-slate-400 mb-1.5">
                    Curso &amp; Período
                  </label>
                  <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-xl p-4 space-y-1">
                    <p className="text-base font-black text-slate-900 dark:text-white uppercase leading-snug">
                      {aluno.curso || '—'}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#F59E0B] text-sm">school</span>
                      <span className="text-[11px] font-black uppercase tracking-widest text-[#F59E0B]">
                        {semestre || '—'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Coordenador */}
                <div>
                  <label className="block text-[9px] font-black uppercase tracking-[0.22em] text-slate-400 mb-1.5">
                    Coordenador do Curso
                  </label>
                  <div className="flex items-center gap-3 bg-[#F59E0B]/5 border border-[#F59E0B]/20 rounded-xl p-4">
                    <div className="w-10 h-10 rounded-lg bg-[#F59E0B]/15 flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-[#F59E0B]">person_check</span>
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase leading-tight">
                        {coordinatorName}
                      </p>
                      {coordinator?.department && (
                        <p className="text-[10px] font-semibold text-slate-500 mt-0.5">
                          {coordinator.department}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Data de Ingresso */}
                {aluno.semestreEntrada && (
                  <div>
                    <label className="block text-[9px] font-black uppercase tracking-[0.22em] text-slate-400 mb-1.5">
                      Ingresso
                    </label>
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <span className="material-symbols-outlined text-slate-400 text-base">calendar_today</span>
                      <span className="text-sm font-bold uppercase tracking-wide">{aluno.semestreEntrada}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Info notice */}
        <div className="mt-6 p-5 bg-[#F59E0B]/5 border border-[#F59E0B]/20 rounded-2xl flex items-start gap-3">
          <span className="material-symbols-outlined text-[#F59E0B] mt-0.5">info</span>
          <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 leading-relaxed">
            Caso alguma informação esteja incorreta ou desatualizada, entre em contato com a secretaria acadêmica ou com seu coordenador de curso.
          </p>
        </div>

      </main>
    </div>
  );
};

export default StudentProfile;
