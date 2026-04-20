import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '@services/api';

const StudentBoletim = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // We assume Student ID 1 for testing
  const STUDENT_ID = 1;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const boletimData = await api.getStudentBoletim(STUDENT_ID);
        setData(boletimData);
      } catch (error) {
        console.error("Error fetching boletim data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading || !data) {
    return (
      <div className="bg-[#f8f9fa] dark:bg-[#0B0F19] min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#F59E0B] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const { cra, semestre, disciplinas } = data;
  const totalCreditos = disciplinas.length * 4; // Simulated
  const aprovadas = disciplinas.filter(d => typeof d.nota === 'number' && d.nota >= 7).length;

  return (
    <div className="bg-[#f8f9fa] dark:bg-[#020617] min-h-screen font-sans overflow-y-auto">
      <main className="max-w-[1200px] mx-auto px-6 py-10 flex flex-col gap-8">
        
        {/* Header & Filters */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white dark:bg-[#0B0F19] p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
           <div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Boletim Acadêmico</h2>
              <p className="mt-1 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                 HISTÓRICO DE DESEMPENHO • {semestre}
              </p>
           </div>
           <div className="flex items-center gap-4 w-full md:w-auto">
              <select className="flex-1 md:w-56 bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl text-[10px] font-black uppercase tracking-widest px-4 py-3 outline-none focus:ring-1 focus:ring-[#F59E0B]">
                 <option>{semestre} - ATUAL</option>
                 <option>2023.2</option>
                 <option>2023.1</option>
              </select>
              <button className="p-3 bg-white dark:bg-[#0B0F19] text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 rounded-xl hover:text-[#F59E0B] transition-colors shadow-sm">
                 <span className="material-symbols-outlined">print</span>
              </button>
           </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
           <div className="bg-white dark:bg-[#0B0F19] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">CRA DO PERÍODO</p>
              <p className="text-3xl font-black text-slate-900 dark:text-white">{cra}</p>
           </div>
           <div className="bg-white dark:bg-[#0B0F19] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">CRÉDITOS ACUMULADOS</p>
              <p className="text-3xl font-black text-slate-900 dark:text-white">{totalCreditos}</p>
           </div>
           <div className="bg-white dark:bg-[#0B0F19] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">APROVAÇÕES</p>
              <p className="text-3xl font-black text-emerald-500">{aprovadas} <span className="text-sm text-slate-300 dark:text-slate-700">/ {disciplinas.length}</span></p>
           </div>
           <div className="bg-slate-900 dark:bg-white p-6 rounded-2xl border border-slate-800 dark:border-slate-200 shadow-sm flex flex-col justify-center text-white dark:text-slate-900">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#F59E0B] mb-2">SITUAÇÃO GERAL</p>
              <div className="inline-flex">
                 <span className="font-black uppercase tracking-[0.2em] text-xs">REGULAR</span>
              </div>
           </div>
        </div>

        {/* Grades Table */}
        <div className="bg-white dark:bg-[#0B0F19] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
           <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left border-collapse min-w-[900px]">
                 <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                       <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">DISCIPLINA</th>
                       <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">N1</th>
                       <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">N2</th>
                       <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">REC.</th>
                       <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">MÉDIA</th>
                       <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">FALTAS</th>
                       <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">SITUAÇÃO</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {disciplinas.map((disc) => (
                       <tr key={disc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/10 transition-colors">
                          <td className="px-8 py-6">
                             <div className="font-black text-slate-900 dark:text-white uppercase tracking-tight">{disc.name}</div>
                             <div className="text-[9px] text-slate-400 uppercase tracking-widest font-bold mt-1">{disc.code} • 80H</div>
                          </td>
                          <td className="px-6 py-6 text-center text-xs font-bold text-slate-700 dark:text-slate-300">8.5</td>
                          <td className="px-6 py-6 text-center text-xs font-bold text-slate-700 dark:text-slate-300">8.0</td>
                          <td className="px-6 py-6 text-center text-xs font-bold text-slate-400">-</td>
                          <td className="px-6 py-6 text-center font-black text-slate-900 dark:text-white">
                             <span className={disc.nota >= 7 ? 'text-emerald-500' : 'text-[#F59E0B]'}>{disc.nota}</span>
                          </td>
                          <td className="px-6 py-6 text-center font-bold text-slate-700 dark:text-slate-300">{disc.faltas}</td>
                          <td className="px-8 py-6 text-right">
                             <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-[0.15em] shadow-sm ${disc.nota >= 7 ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400'}`}>
                                {disc.nota >= 7 ? 'APROVADO' : 'EM CURSO'}
                             </span>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>

      </main>
    </div>
  );
};

export default StudentBoletim;
