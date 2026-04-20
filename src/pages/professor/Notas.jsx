import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '@/services/api';
import Header from '@/components/Header';

const ProfessorNotas = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [attendance, setAttendance] = useState([]);

  const PROFESSOR_ID = 1; // Simulated Auth

  useEffect(() => {
    const fetchData = async () => {
      try {
        const details = await api.getAulaDetails(parseInt(id));
        const dashboardData = await api.getProfessorDashboard(PROFESSOR_ID);
        
        if (!details || !details.aula) {
          throw new Error("Aula nÃ£o encontrada");
        }

        setData({
          ...details,
          professor: dashboardData.professor
        });
        setAttendance(details.attendance);
      } catch (error) {
        console.error("Error fetching lesson details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const toggleAttendance = (index) => {
    const newAttendance = [...attendance];
    newAttendance[index].present = !newAttendance[index].present;
    setAttendance(newAttendance);
  };

  if (loading || !data) {
    return (
      <div className="bg-[#f8f9fa] dark:bg-[#0B0F19] min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-[#F59E0B] border-t-transparent rounded-full animate-spin"></div>
          {!loading && !data && <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Erro ao carregar aula. Verifique a URL.</p>}
        </div>
      </div>
    );
  }

  const { aula, disciplina, professor } = data;
  const presentCount = attendance.filter(a => a.present).length;

  const navItems = [
    { label: 'DISCIPLINAS', path: '/professor' },
    { label: 'CALENDÃRIO', path: '/professor/horario' },
    { label: 'RELATÃ“RIOS', path: '#' },
  ];

  return (
    <div className="bg-[#f8f9fa] dark:bg-[#0B0F19] min-h-screen font-sans pb-16 text-slate-900 dark:text-white overflow-y-auto">
      
      {/* Toolbar / Context area */}
      <div className="bg-[#020617] h-10 border-b border-[#1E293B] flex items-center justify-center gap-3 uppercase text-[9px] font-black tracking-widest text-slate-500">
          <Link to="/professor" className="hover:text-white transition-colors">DISCIPLINAS</Link>
          <span className="text-slate-700">â€º</span>
          <Link to={`/professor/disciplina/${disciplina.id}`} className="hover:text-white transition-colors">{disciplina.name}</Link>
          <span className="text-slate-700">â€º</span>
          <span className="text-[#F59E0B]">AULA: {aula.title}</span>
      </div>

      <main className="max-w-[1400px] mx-auto px-6 py-10">
        
        {/* Page Title & Actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tight">DETALHES DA AULA: {aula.title}</h1>
            <div className="flex items-center gap-2 mt-3 text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-widest">
              <span className="material-symbols-outlined text-[16px] text-[#F59E0B]">calendar_today</span>
              {aula.date} â€¢ {aula.time} â€¢ ({aula.type})
            </div>
          </div>
          
          <button className="flex items-center justify-center gap-2 bg-white dark:bg-[#1A2235] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase tracking-widest py-3 px-6 rounded hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm">
            <span className="material-symbols-outlined text-[18px]">share</span>
            COMPARTILHAR RECURSOS
          </button>
        </div>

        {/* Two Column Layout */}
        <div className="flex flex-col lg:flex-row gap-8 relative">
          
          {/* Left Column (Lesson Plan & Materials) */}
          <div className="flex-1 flex flex-col gap-8">
            
            {/* Lesson Plan Builder */}
            <div className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm flex flex-col">
              <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <h2 className="text-xs font-black uppercase tracking-widest text-[#020617] dark:text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">description</span>
                  PLANO DE AULA
                </h2>
                <div className="flex gap-2">
                  <button className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 py-1.5 px-3 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                    PREENCHER MANUALMENTE
                  </button>
                  <button className="text-[10px] font-black uppercase tracking-widest text-[#F59E0B] bg-[#FFFBEB] dark:bg-[#F59E0B]/10 border border-[#FDE68A] dark:border-[#F59E0B]/20 py-1.5 px-3 rounded flex items-center gap-1 hover:bg-[#FEF3C7] dark:hover:bg-[#F59E0B]/20 transition-colors">
                    <span className="material-symbols-outlined text-[14px]">smart_toy</span>
                    GERAR VIA I.A.
                  </button>
                </div>
              </div>
              
              <div className="flex-1 flex flex-col p-6">
                <div className="flex items-center gap-4 mb-6 text-slate-400">
                  <button className="hover:text-slate-900 dark:hover:text-white font-serif font-bold text-lg leading-none">B</button>
                  <button className="hover:text-slate-900 dark:hover:text-white font-serif italic text-lg leading-none">I</button>
                  <button className="hover:text-slate-900 dark:hover:text-white material-symbols-outlined text-[20px]">format_list_bulleted</button>
                  <button className="hover:text-slate-900 dark:hover:text-white material-symbols-outlined text-[20px]">link</button>
                </div>
                
                <textarea 
                  className="w-full flex-1 min-h-[280px] text-lg text-slate-700 dark:text-slate-300 placeholder-slate-300 dark:placeholder-slate-700 bg-transparent resize-none outline-none"
                  placeholder="Comece a registrar seus objetivos, notas e fÃ³rmulas principais aqui..."
                ></textarea>
                
                <div className="flex justify-end mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button className="bg-[#F59E0B] hover:bg-[#D97706] text-[#020617] text-[10px] font-black uppercase tracking-widest py-3 px-8 rounded transition-colors shadow-sm">
                    SALVAR PLANO
                  </button>
                </div>
              </div>
            </div>

            {/* Course Materials Placeholder */}
            <div className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-6">
               <h2 className="text-xs font-black uppercase tracking-widest mb-6">REPOSITÃ“RIO DE ARQUIVOS</h2>
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border border-transparent hover:border-slate-200">
                     <span className="material-symbols-outlined text-3xl text-[#F59E0B] mb-2">folder</span>
                     <span className="text-[10px] font-bold uppercase text-slate-600 dark:text-slate-400">Slides Aula</span>
                  </div>
                  <div className="bg-white dark:bg-[#0B0F19] border border-dashed border-slate-300 dark:border-slate-700 p-4 rounded-lg flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                     <span className="material-symbols-outlined text-2xl text-slate-400 mb-1">upload</span>
                     <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">DRAG FILES</span>
                  </div>
               </div>
            </div>

          </div>

          {/* Right Column (Attendance & Floating Actions) */}
          <div className="w-full lg:w-[380px] flex flex-col">
            
            <div className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm flex-1 flex flex-col relative">
              <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <h2 className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">group</span>
                  LISTA DE CHAMADA
                </h2>
                <div className="border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest">
                  {presentCount}/{attendance.length} PRESENTES
                </div>
              </div>
              
              <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
                  <input 
                    type="text" 
                    placeholder="Filtrar aluno..." 
                    className="w-full bg-white dark:bg-[#1A2235] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 pl-10 pr-4 py-2.5 rounded text-sm outline-none focus:ring-1 focus:ring-[#F59E0B] transition-shadow"
                  />
                </div>
              </div>
              
              <div className="flex-1 flex flex-col max-h-[500px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                {attendance.map((student, idx) => (
                  <div key={student.id} className="flex justify-between items-center p-4 hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-800 overflow-hidden shrink-0">
                         <img src={student.avatar} alt={student.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="text-[11px] font-black uppercase tracking-widest leading-none mb-1.5">{student.name}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">RA: {student.ra}</p>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => toggleAttendance(idx)}
                      className={`w-12 h-6 rounded-full p-1 ring-1 ring-inset ${student.present ? 'bg-[#020617] dark:bg-[#F59E0B] ring-transparent' : 'bg-slate-100 dark:bg-slate-800 ring-slate-200 dark:ring-slate-700'} transition-colors duration-200 ease-in-out cursor-pointer flex`}
                    >
                      <div className={`w-4 h-4 rounded-full shadow-sm transform transition-transform duration-200 ease-in-out ${student.present ? 'translate-x-6 bg-white dark:bg-[#020617]' : 'translate-x-0 bg-slate-400'}`}></div>
                    </button>
                  </div>
                ))}
              </div>

              {/* Bottom Floating Bar inside the column container area */}
              <div className="mt-auto p-4 border-t border-slate-100 dark:border-slate-800">
                 <div className="flex rounded-lg overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800">
                    <button className="flex-1 bg-[#F59E0B] hover:bg-[#D97706] text-[#020617] text-[10px] font-black uppercase tracking-widest py-4 px-4 transition-colors">
                       ENVIAR CHAMADA
                    </button>
                    <button className="bg-[#020617] dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-[#020617] text-[11px] font-bold py-4 px-6 flex items-center justify-center gap-2 transition-colors shrink-0">
                       <span className="text-[#F59E0B]">âœ¨</span>
                       I.A. Tutor
                    </button>
                 </div>
              </div>
            </div>
          </div>
          
        </div>

      </main>
    </div>
  );
};

export default ProfessorNotas;
