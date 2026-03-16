import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import EnrollmentChart from '../../components/charts/EnrollmentChart';

const AdminDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await api.getDashboardMetrics();
        setMetrics(data);
      } catch (error) {
        console.error("Error fetching admin metrics:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading || !metrics) {
    return (
      <div className="p-10 flex justify-center">
        <div className="w-8 h-8 border-4 border-[#F59E0B] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-10 max-w-[1400px] mx-auto w-full text-slate-900 dark:text-white">
      
      {/* Header Area */}
      <div>
         <h1 className="text-4xl font-black uppercase tracking-tight">DASHBOARD ADMINISTRATIVO</h1>
         <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#F59E0B] mt-2">
            VISÃO GERAL DO SISTEMA • ACADEMIC ANALYTICS
         </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* KPI 1 */}
        <div className="bg-white dark:bg-[#020617] p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-bl-3xl translate-x-4 -translate-y-4"></div>
          <div className="flex justify-between items-start">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">TOTAL ALUNOS</p>
            <span className="material-symbols-outlined text-emerald-500">group</span>
          </div>
          <p className="text-4xl font-black">{metrics.totalAlunos}</p>
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-emerald-500 text-sm">trending_up</span>
            <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">+5.2% <span className="text-slate-400 dark:text-slate-600 font-bold ml-1">MÊS ATUAL</span></p>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white dark:bg-[#020617] p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-4 relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-16 h-16 bg-[#F59E0B]/5 rounded-bl-3xl translate-x-4 -translate-y-4"></div>
          <div className="flex justify-between items-start">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">TOTAL PROFESSORES</p>
            <span className="material-symbols-outlined text-[#F59E0B]">person_pin_circle</span>
          </div>
          <p className="text-4xl font-black">{metrics.totalProfessores}</p>
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[#F59E0B] text-sm">trending_up</span>
            <p className="text-[10px] font-bold text-[#F59E0B] uppercase tracking-widest">+1.2% <span className="text-slate-400 dark:text-slate-600 font-bold ml-1">ESTÁVEL</span></p>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white dark:bg-[#020617] p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-4 relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">TOTAL TURMAS</p>
            <span className="material-symbols-outlined text-purple-500">class</span>
          </div>
          <p className="text-4xl font-black">{metrics.totalTurmas}</p>
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-purple-500 text-sm">trending_up</span>
            <p className="text-[10px] font-bold text-purple-500 uppercase tracking-widest">+4 <span className="text-slate-400 dark:text-slate-600 font-bold ml-1">NOVAS</span></p>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-[#020617] dark:bg-white dark:text-[#020617] p-8 rounded-2xl border border-[#1E293B] dark:border-white shadow-xl flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#F59E0B]">SLAs DO SISTEMA</p>
            <span className="material-symbols-outlined text-emerald-400 animate-pulse">check_circle</span>
          </div>
          <p className="text-4xl font-black text-white dark:text-[#020617]">99.8%</p>
          <div className="flex items-center gap-1">
            <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">SISTEMAS OPERACIONAIS</p>
          </div>
        </div>
      </div>

      {/* Main Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
         
         {/* Enrollment Chart (Recharts) */}
         <div className="lg:col-span-8 bg-white dark:bg-[#020617] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-10 flex flex-col">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
               <div>
                  <h2 className="text-xl font-black uppercase tracking-tight">Crescimento Institucional</h2>
                  <p className="mt-1 text-slate-400 font-bold uppercase text-[9px] tracking-[0.15em]">Novos alunos vs saídas por mês — 2024</p>
               </div>
            </div>
            
            <EnrollmentChart />
         </div>

         {/* Alerts & Logs Sidebar */}
         <div className="lg:col-span-4 flex flex-col gap-8">
            <h2 className="text-xs font-black uppercase tracking-[0.20em] text-slate-500">MONITORAMENTO EM TEMPO REAL</h2>
            
            <div className="bg-white dark:bg-[#020617] border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
               <div className="divide-y divide-slate-50 dark:divide-slate-800">
                  <div className="p-6 flex items-start gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors cursor-pointer">
                     <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-lg">person_add</span>
                     </div>
                     <div>
                        <p className="text-xs font-black uppercase tracking-tight mb-1">Nova Matrícula</p>
                        <p className="text-[10px] leading-relaxed text-slate-500 dark:text-slate-400 font-medium"><b>Alice Silva</b> foi matriculada no 3º semestre de CC.</p>
                        <p className="text-[8px] font-black text-slate-300 dark:text-slate-700 uppercase mt-2 tracking-widest">AGORA MESMO</p>
                     </div>
                  </div>

                  <div className="p-6 flex items-start gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors cursor-pointer">
                     <div className="w-10 h-10 rounded-xl bg-[#F59E0B]/10 text-[#F59E0B] flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-lg">update</span>
                     </div>
                     <div>
                        <p className="text-xs font-black uppercase tracking-tight mb-1">Notas Atualizadas</p>
                        <p className="text-[10px] leading-relaxed text-slate-500 dark:text-slate-400 font-medium">Prof. <b>Sarah</b> atualizou notas em ES-203.</p>
                        <p className="text-[8px] font-black text-slate-300 dark:text-slate-700 uppercase mt-2 tracking-widest">HÁ 15 MINUTOS</p>
                     </div>
                  </div>

                  <div className="p-6 flex items-start gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors cursor-pointer">
                     <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-lg">warning</span>
                     </div>
                     <div>
                        <p className="text-xs font-black uppercase tracking-tight mb-1">Alerta de Servidor</p>
                        <p className="text-[10px] leading-relaxed text-slate-500 dark:text-slate-400 font-medium">Aumento de latência detectado no microserviço de notas.</p>
                        <p className="text-[8px] font-black text-slate-300 dark:text-slate-700 uppercase mt-2 tracking-widest">HÁ 2 HORAS</p>
                     </div>
                  </div>
               </div>
               <div className="p-6 border-t border-slate-50 dark:border-slate-800">
                  <button className="w-full py-3 bg-slate-50 dark:bg-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                     VER LOGS DE AUDITORIA
                  </button>
               </div>
            </div>
         </div>

      </div>

    </div>
  );
};

export default AdminDashboard;
