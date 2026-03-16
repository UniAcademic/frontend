import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import Header from '../../components/Header';

const StudentDisciplina = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // We assume Student ID 1 for testing
  const STUDENT_ID = 1;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const details = await api.getDisciplinaDetails(parseInt(id));
        const studentDashboard = await api.getStudentDashboard(STUDENT_ID);
        
        if (!details || !details.disciplina) {
           throw new Error("Disciplina nÃ£o encontrada");
        }

        // Find student's specific grades/absences for this discipline from dashboard data
        const myGrades = studentDashboard.disciplinas.find(d => d.id === parseInt(id)) || { nota: '-', faltas: 0 };

        setData({
          ...details,
          aluno: studentDashboard.aluno,
          myGrades
        });
      } catch (error) {
        console.error("Error fetching discipline details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading || !data) {
    return (
      <div className="bg-[#f8f9fa] dark:bg-[#0B0F19] min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-[#F59E0B] border-t-transparent rounded-full animate-spin"></div>
          {!loading && !data && <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Erro ao carregar disciplina. Verifique a URL.</p>}
        </div>
      </div>
    );
  }

  const { disciplina, turma, aulas, materiais, aluno, myGrades } = data;

  const navItems = [
    { label: 'DASHBOARD', path: '/student' },
    { label: 'MEU BOLETIM', path: '/student/boletim' },
    { label: 'HORÃRIO', path: '/student/horario' },
  ];

  return (
    <div className="bg-[#f8f9fa] dark:bg-[#0B0F19] min-h-screen font-sans pb-16 text-slate-900 dark:text-white">
      
      <Header 
        user={aluno} 
        role="ALUNO" 
        navItems={navItems} 
      />

      {/* Contextual Nav / Breadcrumb */}
      <div className="bg-[#020617] h-10 border-b border-[#1E293B] flex items-center justify-center gap-3 uppercase text-[9px] font-black tracking-widest text-slate-500">
          <Link to="/student" className="hover:text-white transition-colors">MEU PAINEL</Link>
          <span className="text-slate-700">â€º</span>
          <span className="text-[#F59E0B]">{disciplina.name}</span>
      </div>

      <main className="max-w-[1200px] mx-auto px-6 py-10 flex flex-col gap-8">
        
        {/* Breadcrumb & Header */}
        <div className="flex flex-col gap-2">
           <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
              <Link to="/student" className="hover:text-slate-900 dark:hover:text-white transition-colors">PAINEL</Link>
              <span className="text-slate-300 dark:text-slate-700">/</span>
              <span className="text-slate-900 dark:text-white">{disciplina.name}</span>
           </div>
           
           <h1 className="text-4xl font-black uppercase tracking-tight">{disciplina.name} ({disciplina.code})</h1>
           <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#F59E0B] mt-2">
              TURMA: {turma.name} â€¢ {turma.shift} â€¢ {turma.semester}
           </p>
        </div>

        {/* Stats Summary Panel */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">MINHA NOTA ATUAL</p>
              <div className="flex items-end gap-2">
                 <p className={`text-4xl font-black ${typeof myGrades.nota === 'number' && myGrades.nota >= 7 ? 'text-emerald-500' : 'text-[#F59E0B]'}`}>
                    {myGrades.nota}
                 </p>
                 <span className="text-slate-400 font-bold mb-1 text-sm">/ 10.0</span>
              </div>
           </div>

           <div className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">FALTAS ACUMULADAS</p>
              <div className="flex items-end gap-2">
                 <p className="text-4xl font-black text-slate-900 dark:text-white">
                    {myGrades.faltas}
                 </p>
                 <span className="text-slate-400 font-bold mb-1 text-sm uppercase tracking-widest">AULAS</span>
              </div>
           </div>

           <div className="bg-[#020617] p-6 rounded-2xl shadow-sm flex items-center justify-between overflow-hidden relative">
              <div className="relative z-10">
                 <p className="text-[10px] font-black text-[#F59E0B] uppercase tracking-widest mb-2">CARGA HORÃRIA</p>
                 <p className="text-4xl font-black text-white">{disciplina.workload || '80h'}</p>
              </div>
              <span className="material-symbols-outlined text-white/5 text-6xl absolute right-[-10px] bottom-[-10px]">timer</span>
           </div>
        </div>

        {/* Detailed Tabs/Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
           
           {/* Left Coll: Lesson Plan & Materials */}
           <div className="lg:col-span-2 flex flex-col gap-10">
              
              {/* Materials Section */}
              <div className="flex flex-col gap-6">
                 <div className="flex justify-between items-center">
                    <h2 className="text-xs font-black uppercase tracking-[0.20em] text-slate-500">MATERIAIS E ARQUIVOS</h2>
                    <button className="text-[10px] font-black uppercase tracking-widest text-[#F59E0B] hover:underline">Download Todos (ZIP)</button>
                 </div>
                 
                 <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {materiais.map((mat) => (
                       <div key={mat.id} className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 p-5 rounded-xl hover:border-[#F59E0B]/50 transition-all cursor-pointer group">
                          <div className="flex justify-between items-start mb-4">
                             <span className={`material-symbols-outlined text-2xl ${mat.type === 'PDF' ? 'text-red-500' : mat.type === 'POWERPOINT' ? 'text-orange-500' : 'text-[#F59E0B]'}`}>
                                {mat.type === 'FOLDER' ? 'folder' : 'description'}
                             </span>
                             <span className="text-[8px] font-black text-slate-400 uppercase">{mat.size}</span>
                          </div>
                          <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-[#F59E0B] transition-colors truncate">
                             {mat.title}
                          </p>
                       </div>
                    ))}
                 </div>
              </div>

              {/* Lesson Plan / Syllabus */}
              <div className="flex flex-col gap-6">
                 <h2 className="text-xs font-black uppercase tracking-[0.20em] text-slate-500">EMENTA E PLANO DE ENSINO</h2>
                 <div className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 p-8 rounded-2xl relative">
                    <div className="absolute top-6 right-6">
                       <span className="material-symbols-outlined text-slate-200 dark:text-slate-800 text-6xl">menu_book</span>
                    </div>
                    <div className="relative z-10 space-y-4 max-w-2xl">
                       <p className="text-sm font-bold text-slate-900 dark:text-white italic border-l-4 border-[#F59E0B] pl-4 mb-8">
                          Objetivo: Capacitar o acadÃªmico no desenvolvimento de software robusto aplicando padrÃµes de projeto e arquitetura de microserviÃ§os.
                       </p>
                       <div className="space-y-2">
                          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">TÃ“PICOS PRINCIPAIS</p>
                          <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                             <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-[#F59E0B] rounded-full"></span> Design Patterns (GoF)</li>
                             <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-[#F59E0B] rounded-full"></span> Clean Architecture</li>
                             <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-[#F59E0B] rounded-full"></span> Testes Automatizados</li>
                             <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-[#F59E0B] rounded-full"></span> IntegraÃ§Ã£o ContÃ­nua</li>
                          </ul>
                       </div>
                    </div>
                 </div>
              </div>

           </div>

           {/* Right Coll: Class Schedule Status */}
           <div className="flex flex-col gap-6">
              <h2 className="text-xs font-black uppercase tracking-[0.20em] text-slate-500">DETALHES DE FREQUÃŠNCIA</h2>
              
              <div className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
                 {aulas.filter(a => a.disciplinaId === disciplina.id).map((aula, idx) => (
                    <div key={aula.id} className="p-5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                       <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{aula.date}</p>
                          <p className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-tight">{aula.title}</p>
                       </div>
                       <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${aula.status === 'Realizada' ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{aula.status}</span>
                       </div>
                    </div>
                 ))}
              </div>

              <div className="bg-[#020617] p-8 rounded-2xl border border-[#1E293B] flex flex-col items-center justify-center text-center gap-4">
                 <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] leading-tight">PRECISA DE AJUDA COM ESTA MATÃ‰RIA?</p>
                 <button className="w-full py-4 bg-[#F59E0B] hover:bg-[#D97706] text-[#020617] text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-[#F59E0B]/10 flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-lg">smart_toy</span>
                    CONVERSAR COM TUTOR I.A.
                 </button>
              </div>
           </div>

        </div>

      </main>
    </div>
  );
};

export default StudentDisciplina;
