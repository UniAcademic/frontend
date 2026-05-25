import React, { useState, useEffect } from 'react';
import api from '@/services/api';
import EnrollmentChart from '@/components/charts/EnrollmentChart';
import { 
  StudentsByCoursePie, 
  TurmaOccupancyBar, 
  GradesByTurmaBar, 
  ProfessorDeptPie,
  StudentStatusPie
} from '@/components/charts/AdminCharts';

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

  const exportToPowerBI = () => {
    if (!metrics) return;
    
    // Create a logical flat structure for Power BI consumption
    const exportData = [
      ['KPI', 'Categoria', 'Valor'],
      ['Total Alunos', 'Geral', metrics.totalAlunos],
      ['Alunos Ativos', 'Status', metrics.ativosAlunos],
      ['Alunos Inativos', 'Status', metrics.inativosAlunos],
      ['Total Professores', 'Geral', metrics.totalProfessores],
      ['Total Coordenadores', 'Geral', metrics.totalCoordenadores],
      ['Total Turmas', 'Geral', metrics.totalTurmas],
      ['Total Disciplinas', 'Geral', metrics.totalDisciplinas],
      ...metrics.charts.alunosPorCurso.map(c => ['Distribuição Alunos', c.name, c.value]),
      ...metrics.charts.ocupacaoTurmas.map(t => ['Ocupação Turma', t.name, t.ocupacao]),
      ...metrics.charts.mediaNotasPorTurma.map(d => ['Média Notas Turma', d.name, d.media]),
      ...metrics.charts.professoresPorDepartamento.map(p => ['Professor Dept', p.name, p.value]),
      ...metrics.charts.studentStatus.map(a => ['Status Aluno', a.name, a.value])
    ];

    const csvContent = "data:text/csv;charset=utf-8," 
      + exportData.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `uniacadem_metrics_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
         <div>
            <h1 className="text-4xl font-black uppercase tracking-tight">DASHBOARD ADMINISTRATIVO</h1>
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#F59E0B] mt-2">
               VISÃO GERAL DO SISTEMA • ACADEMIC ANALYTICS
            </p>
         </div>
         <button 
           onClick={exportToPowerBI}
           className="flex items-center gap-2 px-6 py-3 bg-[#F59E0B] text-[#1E293B] text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-[#D97706] transition-all shadow-lg shadow-orange-500/20 active:scale-95"
         >
           <span className="material-symbols-outlined text-[18px]">query_stats</span>
           EXPORTAR PARA POWER BI
         </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        
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
            <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">{metrics.ativosAlunos} <span className="text-slate-400 dark:text-slate-600 font-bold ml-1">ATIVOS</span></p>
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
            <span className="material-symbols-outlined text-[#F59E0B] text-sm">account_balance</span>
            <p className="text-[10px] font-bold text-[#F59E0B] uppercase tracking-widest">CORPO DOCENTE <span className="text-slate-400 dark:text-slate-600 font-bold ml-1">QUALIFICADO</span></p>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white dark:bg-[#020617] p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-4 relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">COORDENADORES</p>
            <span className="material-symbols-outlined text-blue-500">supervisor_account</span>
          </div>
          <p className="text-4xl font-black">{metrics.totalCoordenadores || 0}</p>
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-blue-500 text-sm">verified</span>
            <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">GESTÃO <span className="text-slate-400 dark:text-slate-600 font-bold ml-1">ACADÊMICA</span></p>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white dark:bg-[#020617] p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-4 relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">TOTAL TURMAS</p>
            <span className="material-symbols-outlined text-purple-500">class</span>
          </div>
          <p className="text-4xl font-black">{metrics.totalTurmas}</p>
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-purple-500 text-sm">done_all</span>
            <p className="text-[10px] font-bold text-purple-500 uppercase tracking-widest">{metrics.ativasTurmas} <span className="text-slate-400 dark:text-slate-600 font-bold ml-1">ATIVAS</span></p>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-[#020617] dark:bg-white dark:text-[#020617] p-8 rounded-2xl border border-[#1E293B] dark:border-white shadow-xl flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#F59E0B]">DISCIPLINAS</p>
            <span className="material-symbols-outlined text-emerald-400 animate-pulse">menu_book</span>
          </div>
          <p className="text-4xl font-black text-white dark:text-[#020617]">{metrics.totalDisciplinas}</p>
          <div className="flex items-center gap-1">
            <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">GRADE CURRICULAR ATUAL</p>
          </div>
        </div>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Chart 1: Growth */}
        <div className="bg-white dark:bg-[#020617] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-8">
          <div className="mb-6">
            <h2 className="text-lg font-black uppercase tracking-tight">Crescimento Institucional</h2>
            <p className="text-slate-400 font-bold uppercase text-[9px] tracking-[0.15em] mt-1">Matrículas vs Evasão por Mês</p>
          </div>
          <EnrollmentChart />
        </div>

        {/* Chart 2: Alunos por Curso */}
        <div className="bg-white dark:bg-[#020617] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-8">
          <div className="mb-6">
            <h2 className="text-lg font-black uppercase tracking-tight">Volume por Curso</h2>
            <p className="text-slate-400 font-bold uppercase text-[9px] tracking-[0.15em] mt-1">Distribuição de alunos matriculados</p>
          </div>
          <StudentsByCoursePie data={metrics.charts.alunosPorCurso} />
        </div>

        {/* Chart 3: Ocupação */}
        <div className="bg-white dark:bg-[#020617] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-8">
          <div className="mb-6">
            <h2 className="text-lg font-black uppercase tracking-tight">Ocupação de Turmas (%)</h2>
            <p className="text-slate-400 font-bold uppercase text-[9px] tracking-[0.15em] mt-1">Alunos Matriculados vs Capacidade Máxima</p>
          </div>
          <TurmaOccupancyBar data={metrics.charts.ocupacaoTurmas} />
        </div>

        {/* Chart 4: Notas */}
        <div className="bg-white dark:bg-[#020617] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-8">
          <div className="mb-6">
            <h2 className="text-lg font-black uppercase tracking-tight">Performance por Turma</h2>
            <p className="text-slate-400 font-bold uppercase text-[9px] tracking-[0.15em] mt-1">Média geral de desempenho acadêmico (Top 5)</p>
          </div>
          <GradesByTurmaBar data={metrics.charts.mediaNotasPorTurma} />
        </div>

        {/* Chart 5: Professores */}
        <div className="bg-white dark:bg-[#020617] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-8">
          <div className="mb-6">
            <h2 className="text-lg font-black uppercase tracking-tight">Corpo Docente</h2>
            <p className="text-slate-400 font-bold uppercase text-[9px] tracking-[0.15em] mt-1">Distribuição de professores por departamento</p>
          </div>
          <ProfessorDeptPie data={metrics.charts.professoresPorDepartamento} />
        </div>

        {/* Chart 6: Status Alunos */}
        <div className="bg-white dark:bg-[#020617] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-8">
          <div className="mb-6 flex justify-between items-center text-center text-left w-full">
            <div className="text-left w-full">
              <h2 className="text-lg font-black uppercase tracking-tight">Desempenho Geral</h2>
              <p className="text-slate-400 font-bold uppercase text-[9px] tracking-[0.15em] mt-1">Classificação de alunos por média acadêmica</p>
            </div>
          </div>
          <div className="flex flex-col items-center">
             <StudentStatusPie data={metrics.charts.studentStatus} />
          </div>
        </div>


      </div>

      {/* Real-time Monitor (Original) */}
      <div className="mt-10">
         <h2 className="text-xs font-black uppercase tracking-[0.20em] text-slate-500 mb-6 px-4">MONITORAMENTO EM TEMPO REAL</h2>
         <div className="bg-white dark:bg-[#020617] border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm max-w-xl">
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
            </div>
            <div className="p-6 border-t border-slate-50 dark:border-slate-800">
               <button className="w-full py-3 bg-slate-50 dark:bg-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                  VER LOGS DE AUDITORIA
               </button>
            </div>
         </div>
      </div>

    </div>
  );
};

export default AdminDashboard;
