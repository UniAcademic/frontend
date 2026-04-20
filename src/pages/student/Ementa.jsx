import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '@services/api';

const StudentEmenta = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Default to discipline 1 if no ID provided (for general view)
  const disciplineId = id ? parseInt(id) : 1;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const details = await api.getDisciplinaDetails(disciplineId);
        setData(details);
      } catch (error) {
        console.error("Error fetching syllabus:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [disciplineId]);

  if (loading || !data) {
    return (
      <div className="bg-[#f8f9fa] dark:bg-[#0B0F19] min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#F59E0B] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const { disciplina, turma } = data;

  return (
    <div className="bg-[#f8f9fa] dark:bg-[#020617] min-h-screen font-sans overflow-y-auto">
      <main className="max-w-[1200px] mx-auto px-6 py-10 flex flex-col gap-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
              <Link to="/student" className="hover:text-slate-900 dark:hover:text-white transition-colors">PAINEL</Link>
              <span className="text-slate-300 dark:text-slate-700">/</span>
              <span className="text-slate-900 dark:text-white">EMENTA</span>
            </div>
            <h1 className="text-4xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
              {disciplina.name}
            </h1>
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#F59E0B] mt-2">
              CÓDIGO: {disciplina.code} • CARGA HORÁRIA: {disciplina.workload || '80h'}
            </p>
          </div>

          <button className="flex items-center gap-2 bg-[#F59E0B] hover:bg-[#D97706] text-[#020617] px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all shadow-lg shadow-[#F59E0B]/20">
            <span className="material-symbols-outlined text-[18px]">download</span>
            Baixar Ementa (PDF)
          </button>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-slate-900 dark:text-white">
          
          {/* Main Info - 2 Columns */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            
            {/* Objectives */}
            <section className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 p-8 rounded-2xl shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <span className="material-symbols-outlined text-[#F59E0B]">target</span>
                <h2 className="text-sm font-black uppercase tracking-widest">Objetivos da Disciplina</h2>
              </div>
              <div className="space-y-4 text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-bold">
                <p>
                  Capacitar o acadêmico na compreensão profunda dos fundamentos de {disciplina.name}, integrando teoria e prática para resolução de problemas complexos no ambiente corporativo moderno.
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Desenvolver habilidades técnicas avançadas na área.</li>
                  <li>Aplicar metodologias ágeis em projetos de software.</li>
                  <li>Compreender o impacto ético e social das soluções tecnológicas.</li>
                </ul>
              </div>
            </section>

            {/* Program Content */}
            <section className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 p-8 rounded-2xl shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <span className="material-symbols-outlined text-[#F59E0B]">list_alt</span>
                <h2 className="text-sm font-black uppercase tracking-widest">Conteúdo Programático</h2>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {[
                  { module: "Módulo I", title: "Fundamentos e Introdução", topics: ["Histórico e evolução", "Conceitos fundamentais", "Ambiente de desenvolvimento"] },
                  { module: "Módulo II", title: "Arquitetura e Design", topics: ["Padrões de projeto", "Modelagem de dados", "Integração de sistemas"] },
                  { module: "Módulo III", title: "Aplicações Práticas", topics: ["Desenvolvimento de cases", "Testes de qualidade", "Deployment e Produção"] }
                ].map((item, idx) => (
                  <div key={idx} className="py-6 first:pt-0 last:pb-0">
                    <h3 className="text-[10px] font-black text-[#F59E0B] uppercase tracking-widest mb-2">{item.module}</h3>
                    <p className="font-black text-sm mb-3 uppercase">{item.title}</p>
                    <div className="flex flex-wrap gap-2">
                      {item.topics.map((topic, tIdx) => (
                        <span key={tIdx} className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 px-3 py-1 rounded-md text-[10px] font-bold text-slate-500 uppercase">
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar Info - 1 Column */}
          <div className="flex flex-col gap-8">
            
            {/* Methodology & Evaluation */}
            <section className="bg-slate-900 border border-slate-800 p-8 rounded-2xl text-white">
              <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#F59E0B] mb-6">Metodologia e Avaliação</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Ensino</h3>
                  <p className="text-xs font-bold leading-relaxed">Aulas expositivas e dialogadas, workshops práticos e peer instruction.</p>
                </div>
                <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-[#F59E0B] mb-3">Critérios de Nota</h3>
                  <div className="space-y-2 text-xs font-bold">
                    <div className="flex justify-between">
                      <span>Provas Bimestrais</span>
                      <span>60%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Projetos Práticos</span>
                      <span>30%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Atividades de Classe</span>
                      <span>10%</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Bibliography */}
            <section className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 p-8 rounded-2xl shadow-sm">
              <h2 className="text-xs font-black uppercase tracking-widest mb-6">Bibliografia</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-[9px] font-black uppercase text-slate-400 mb-3 tracking-widest">Básica</h3>
                  <ul className="space-y-3 text-[11px] font-bold">
                    <li className="flex gap-2">
                       <span className="text-[#F59E0B]">•</span>
                       <span>PRESSMAN, R. Engenharia de Software: Uma Abordagem Profissional. 9. ed.</span>
                    </li>
                    <li className="flex gap-2">
                       <span className="text-[#F59E0B]">•</span>
                       <span>MARTIN, Robert C. Código Limpo: Habilidades Práticas do Software Agile.</span>
                    </li>
                  </ul>
                </div>
                <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                  <h3 className="text-[9px] font-black uppercase text-slate-400 mb-3 tracking-widest">Complementar</h3>
                  <p className="text-[11px] font-bold text-slate-500 italic">Disponível na Biblioteca Virtual Pearson e Minha Biblioteca.</p>
                </div>
              </div>
            </section>

          </div>
        </div>

      </main>
    </div>
  );
};

export default StudentEmenta;
