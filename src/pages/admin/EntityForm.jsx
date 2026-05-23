import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import api from '@/services/api';

const AdminEntityForm = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const isEdit = !!id;
  const path = location.pathname;

  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(isEdit);

  let entityType = '';
  let title = '';
  let fields = [];

  if (path.includes('/admin/alunos')) {
    entityType = 'alunos';
    title = 'ALUNO';
    fields = [
      { name: 'name', label: 'NOME COMPLETO', type: 'text', placeholder: 'Ex: Alice Silva' },
      { name: 'ra', label: 'RA (REGISTRO ACADÊMICO)', type: 'text', placeholder: 'Ex: 202310001' },
      { name: 'status', label: 'SITUAÇÃO', type: 'select', options: ['Ativo', 'Inativo'] }
    ];
  } else if (path.includes('/admin/professores')) {
    entityType = 'professores';
    title = 'PROFESSOR';
    fields = [
      { name: 'name', label: 'NOME COMPLETO', type: 'text', placeholder: 'Ex: Dr. John Doe' },
      { name: 'department', label: 'DEPARTAMENTO', type: 'text', placeholder: 'Ex: Ciência da Computação' }
    ];
  } else if (path.includes('/admin/turmas')) {
    entityType = 'turmas';
    title = 'TURMA';
    fields = [
      { name: 'name', label: 'NOME DA TURMA', type: 'text', placeholder: 'Ex: Turma A' },
      { name: 'shift', label: 'TURNO', type: 'select', options: ['Manhã', 'Tarde', 'Noite', 'EAD'] },
      { name: 'semester', label: 'SEMESTRE', type: 'text', placeholder: 'Ex: 2024.1' },
      { name: 'location', label: 'LOCAL / SALA', type: 'text', placeholder: 'Ex: Sala 304, Bloco B' }
    ];
  } else if (path.includes('/admin/disciplinas')) {
    entityType = 'disciplinas';
    title = 'DISCIPLINA';
    fields = [
      { name: 'name', label: 'NOME DA DISCIPLINA', type: 'text', placeholder: 'Ex: Cálculo I' },
      { name: 'code', label: 'CÓDIGO', type: 'text', placeholder: 'Ex: MAT-101' },
      { name: 'workload', label: 'CARGA HORÁRIA', type: 'text', placeholder: 'Ex: 80h' }
    ];
  }

  useEffect(() => {
    if (isEdit) {
      const fetchData = async () => {
        try {
          let data = null;
          if (entityType === 'alunos') data = await api.getAluno(parseInt(id));
          else if (entityType === 'professores') data = await api.getProfessor(parseInt(id));
          else if (entityType === 'turmas') {
            const list = await api.getTurmasAdmin();
            data = list.find(l => l.id === parseInt(id));
          } else if (entityType === 'disciplinas') {
            const list = await api.getDisciplinasAdmin();
            data = list.find(l => l.id === parseInt(id));
          }

          if (data) setFormData(data);
        } catch (error) {
          console.error("Erro ao carregar entidade para edição:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [id, isEdit, entityType]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('📤 AdminEntityForm handleSubmit called', { entityType, formData });
    try {
      if (isEdit) {
        if (entityType === 'alunos') {
          console.log('Calling api.updateAluno', id, formData);
          const res = await api.updateAluno(parseInt(id), formData);
          console.log('api.updateAluno response', res);
        } else if (entityType === 'professores') {
          console.log('Calling api.updateProfessor', id, formData);
          const res = await api.updateProfessor(parseInt(id), formData);
          console.log('api.updateProfessor response', res);
        } else if (entityType === 'turmas') {
          console.log('Calling api.updateTurma', id, formData);
          const res = await api.updateTurma(parseInt(id), formData);
          console.log('api.updateTurma response', res);
        } else if (entityType === 'disciplinas') {
          console.log('Calling api.updateDisciplina', id, formData);
          const res = api.updateDisciplina ? await api.updateDisciplina(parseInt(id), formData) : null;
          console.log('api.updateDisciplina response', res);
        }
      } else {
        if (entityType === 'alunos') {
          console.log('Calling api.createAluno', formData);
          const res = await api.createAluno(formData);
          console.log('api.createAluno response', res);
        } else if (entityType === 'professores') {
          console.log('Calling api.createProfessor', formData);
          const res = await api.createProfessor(formData);
          console.log('api.createProfessor response', res);
        } else if (entityType === 'turmas') {
          console.log('Calling api.createTurma', formData);
          const res = await api.createTurma(formData);
          console.log('api.createTurma response', res);
        } else if (entityType === 'disciplinas') {
          console.log('Calling api.createDisciplina', formData);
          const res = api.createDisciplina ? await api.createDisciplina(formData) : null;
          console.log('api.createDisciplina response', res);
        }
      }
      navigate(`/admin/${entityType}`);
    } catch (error) {
      console.error('Erro ao salvar entidade:', error);
      alert("Erro ao salvar: " + (error?.message || String(error)));
    }
  };

  if (loading) {
    return (
      <div className="p-10 flex justify-center">
        <div className="w-8 h-8 border-4 border-[#F59E0B] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto flex flex-col gap-10">

      {/* Header Area */}
      <div>
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-black text-slate-500 mb-4">
          <Link to={`/admin/${entityType}`} className="hover:text-slate-900 transition-colors">{entityType.toUpperCase()}</Link>
          <span className="text-slate-300">/</span>
          <span className="text-slate-900">{isEdit ? 'EDITAR' : 'NOVO'}</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
          {isEdit ? `EDITAR ${title}` : `CADASTRAR ${title}`}
        </h1>
      </div>

      {/* Form Card */}
      <div className="bg-white dark:bg-[#020617] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden p-10">
        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {fields.map(field => (
              <div key={field.name} className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                  {field.label}
                </label>
                {field.type === 'select' ? (
                  <select
                      name={field.name}
                      value={formData[field.name] || ''}
                      onChange={handleChange}
                      className="w-full bg-slate-50 dark:bg-[#0B0F19] border border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl text-sm px-4 py-3 outline-none focus:ring-1 focus:ring-[#F59E0B]"
                    >
                    <option value="">Selecione...</option>
                    {field.options.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type}
                    name={field.name}
                    value={formData[field.name] || ''}
                    onChange={handleChange}
                    placeholder={field.placeholder}
                    className="w-full bg-slate-50 dark:bg-[#0B0F19] border border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl text-sm px-4 py-3 outline-none focus:ring-1 focus:ring-[#F59E0B]"
                  />
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-50 dark:border-slate-800">
            <button
              type="button"
              onClick={() => navigate(`/admin/${entityType}`)}
              className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors py-3 px-6"
            >
              CANCELAR
            </button>
            <button
              type="submit"
              className="bg-[#F59E0B] hover:bg-[#D97706] text-[#020617] text-[10px] font-black uppercase tracking-widest py-3 px-10 rounded-xl transition-all shadow-lg shadow-[#F59E0B]/10 flex items-center gap-2"
            >
              {isEdit ? 'SALVAR ALTERAÇÕES' : 'CONFIRMAR CADASTRO'}
              <span className="material-symbols-outlined text-[18px]">check</span>
            </button>
          </div>
        </form>
      </div>

    </div>
  );
};

export default AdminEntityForm;
