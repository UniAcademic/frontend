import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';

const ProfessorFrequencia = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await api.getDisciplinaDetails(parseInt(id) || 1);
        setData(result);
      } catch (error) {
        console.error("Error fetching frequency data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-[#0B0F19]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (!data) return <div className="p-8 text-white bg-[#0B0F19] min-h-screen">Course not found.</div>;

  const { disciplina, turma, aulas, materiais, alunos } = data;

  return (
    <div className="bg-[#f8f9fa] min-h-screen font-sans pb-16">
      
      {/* Top Navbar */}
      <header className="h-[72px] bg-[#0B0F19] text-white flex items-center px-6 border-b border-[#1E293B]">
        {/* Logo Left */}
        <div className="flex items-center gap-3 w-1/4">
          <div className="w-8 h-8 rounded bg-[#F59E0B] flex items-center justify-center">
            <svg className="w-5 h-5 text-[#0B0F19]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3L1 9L4 10.636V17L12 21L20 17V10.636L23 9L12 3ZM12 18.724L6 15.636V11.724L12 15L18 11.724V15.636L12 18.724Z" />
            </svg>
          </div>
          <span className="font-black text-xl tracking-tighter italic">UNIACADEMIC</span>
        </div>

        {/* Center Breadcrumb */}
        <div className="flex-1 flex justify-center items-center gap-3">
          <Link to="/professor" className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors">MY COURSES</Link>
          <span className="text-slate-600">â€º</span>
          <span className="text-[10px] font-black uppercase tracking-widest text-white">{disciplina.name}</span>
        </div>

        {/* Right Info */}
        <div className="flex flex-row-reverse md:flex-row items-center justify-end gap-4 w-1/4 border-l border-[#1E293B] pl-6">
          <div className="w-10 h-10 bg-slate-200 rounded overflow-hidden shadow-sm shrink-0">
            <img src="https://i.pravatar.cc/150?img=5" alt="Profile" className="w-full h-full object-cover" />
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-white leading-tight">Prof. Sarah Jenkins</p>
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">DEPARTMENT OF COMPUTER SCIENCE</p>
          </div>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto px-6 py-10 flex flex-col gap-8">
        
        {/* Title & Actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-black text-[#0B0F19] uppercase tracking-tight">{disciplina.name}</h1>
            <div className="flex items-center gap-3 mt-3">
              <span className="bg-[#0B0F19] text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded">{disciplina.code}</span>
              <span className="text-slate-300">â€¢</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">SPRING 2024</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
            <button className="flex-1 md:flex-none uppercase text-[11px] font-bold tracking-widest text-slate-700 bg-white border border-slate-200 py-3 px-6 rounded flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors shadow-sm">
              <span className="material-symbols-outlined text-[16px]">edit</span>
              EDIT COURSE
            </button>
            <button className="flex-1 md:flex-none uppercase text-[11px] font-bold tracking-widest text-[#0B0F19] bg-[#F59E0B] hover:bg-[#D97706] py-3 px-6 rounded flex items-center justify-center gap-2 transition-colors shadow-sm">
              <span className="material-symbols-outlined text-[18px]">description</span>
              SYLLABUS
            </button>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
          <div className="flex items-center border-l-4 border-[#F59E0B] pl-4 mb-8">
            <p className="text-sm text-slate-600 font-medium italic leading-relaxed">
              Detailed metrics and group management for <span className="font-bold">{disciplina.name}</span>. Manage attendance and student performance across all active groups.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded bg-[#0B0F19] text-[#F59E0B] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined">group</span>
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">TOTAL STUDENTS</p>
                <p className="text-2xl font-black text-slate-900 leading-none mt-1">{alunos.length}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded bg-[#0B0F19] text-[#F59E0B] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined">grid_view</span>
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">ACTIVE CLASSES</p>
                <p className="text-2xl font-black text-slate-900 leading-none mt-1">{aulas.length}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded bg-[#0B0F19] text-[#F59E0B] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined">bar_chart</span>
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">AVG. GRADE</p>
                <p className="text-2xl font-black text-slate-900 leading-none mt-1">
                  {(alunos.reduce((acc, curr) => acc + (curr.nota || 0), 0) / alunos.length).toFixed(1)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded bg-[#0B0F19] text-[#F59E0B] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined">schedule</span>
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">WORKLOAD</p>
                <p className="text-2xl font-black text-slate-900 leading-none mt-1">{disciplina.workload}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Classes Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mt-6 border-b border-transparent">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">CLASS GROUPS</h2>
        </div>

        {/* Grid of Class Groups (Turma Card) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col hover:border-slate-300 transition-colors">
            <div className="h-32 bg-[#1A2235] relative overflow-hidden flex items-start justify-start p-4 border-b border-slate-200">
              <div className="absolute inset-0 opacity-10 [background-image:linear-gradient(to_right,#ffffff12_1px,transparent_1px),linear-gradient(to_bottom,#ffffff12_1px,transparent_1px)] [background-size:16px_16px]"></div>
              <span className="bg-emerald-900/80 text-emerald-400 border border-emerald-800 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded backdrop-blur-sm z-10">
                ON CAMPUS
              </span>
            </div>
            <div className="p-6 flex-1 flex flex-col">
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-5">{turma.name} - {turma.shift}</h3>
              
              <div className="space-y-4 mb-8 flex-1">
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <span className="material-symbols-outlined text-[#F59E0B] text-[18px]">calendar_today</span>
                  <span className="font-bold text-xs uppercase tracking-widest">MON, WED â€¢ 08:00 - 10:00</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <span className="material-symbols-outlined text-[#F59E0B] text-[18px]">school</span>
                  <span className="font-bold text-xs uppercase tracking-widest">{turma.semester}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <span className="material-symbols-outlined text-[#F59E0B] text-[18px]">location_on</span>
                  <span className="font-bold text-xs uppercase tracking-widest">{turma.location}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded border-2 border-white bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold z-10">{turma.studentsCount}</div>
                </div>
                <Link to={`/professor/turma/${turma.id}`} className="uppercase text-[10px] font-black tracking-widest bg-[#0B0F19] text-white hover:bg-slate-800 py-2.5 px-6 rounded transition-colors">
                  ACCESS
                </Link>
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
};

export default ProfessorFrequencia;
