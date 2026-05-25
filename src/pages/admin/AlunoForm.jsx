import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import api from '@/services/api';
import { alunoCreateSchema, alunoEditSchema } from '@/schemas/aluno.schema';
import { generateNewAvatarUrl } from '@/config/external.config';
import { ROUTES } from '@/config/routes.config';

const AlunoForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [loading, setLoading] = useState(isEdit);
  const [cursos, setCursos] = useState([]);
  const [showCursoSelector, setShowCursoSelector] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [alunoData, setAlunoData] = useState(null);

  // Document management states
  const [uploadingDoc, setUploadingDoc] = useState(null);
  const [downloadingDoc, setDownloadingDoc] = useState(null);
  const [docError, setDocError] = useState('');
  const [docSuccess, setDocSuccess] = useState('');
  const [documentosExistentes, setDocumentosExistentes] = useState([]);
  const [docListLoading, setDocListLoading] = useState(false);
  const [docUploadTipo, setDocUploadTipo] = useState('RG');
  const [docUploadMidia, setDocUploadMidia] = useState('PNG');
  const docFileRef = useRef(null);

  const TIPOS_DOCUMENTO = ['RG', 'CPF', 'CNH'];
  const TIPOS_MIDIA = ['PNG', 'JPEG', 'PDF'];
  const MIDIA_ACCEPT = { PNG: 'image/png', JPEG: 'image/jpeg', PDF: 'application/pdf' };
  const MIDIA_EXT = { PNG: '.png', JPEG: '.jpg', PDF: '.pdf' };

  const fetchDocumentos = async () => {
    if (!isEdit) return;
    setDocListLoading(true);
    try {
      const docs = await api.listarDocumentosAlunoAPI(id);
      setDocumentosExistentes(Array.isArray(docs) ? docs : []);
    } catch (err) {
      console.error('Erro ao listar documentos:', err);
      setDocumentosExistentes([]);
    } finally {
      setDocListLoading(false);
    }
  };

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(isEdit ? alunoEditSchema : alunoCreateSchema),
    defaultValues: {
      name: '', ra: '', email: '', password: '', curso: '', status: 'Ativo',
      celular: '', cpf: '', rg: '', data_nascimento: '', ano_ingresso: new Date().getFullYear(),
      cep: '', logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '', pais: 'Brasil'
    }
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const cursosData = await api.getCursos();
        setCursos(cursosData);

        if (isEdit) {
          const aluno = await api.getAlunoPorIdAPI(id);
          if (aluno) {
            setAlunoData(aluno);
            
            console.log('📥 Loaded aluno data:', JSON.stringify(aluno, null, 2));
            
            // Format date for the date input (YYYY-MM-DD)
            let formattedDate = '';
            if (aluno.data_nascimento) {
              formattedDate = aluno.data_nascimento.split('T')[0];
            }

            const formValues = {
              name: aluno.nome || aluno.name || '',
              ra: aluno.matricula || aluno.ra || '',
              email: aluno.email || '',
              password: '',
              curso: aluno.curso || '',
              status: aluno.ativo !== false ? 'Ativo' : 'Inativo',
              celular: aluno.celular || '',
              cpf: aluno.cpf || '',
              rg: aluno.rg || '',
              data_nascimento: formattedDate,
              ano_ingresso: aluno.ano_ingresso || new Date().getFullYear(),
              cep: aluno.endereco?.cep || '',
              logradouro: aluno.endereco?.logradouro || '',
              numero: aluno.endereco?.numero || '',
              complemento: aluno.endereco?.complemento || '',
              bairro: aluno.endereco?.bairro || '',
              cidade: aluno.endereco?.cidade || '',
              estado: aluno.endereco?.estado || '',
              pais: aluno.endereco?.pais || 'Brasil',
            };
            
            console.log('📝 Form values to reset:', JSON.stringify(formValues, null, 2));
            reset(formValues);
          }
        }
      } catch (error) {
        console.error('Error loading form data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, isEdit, reset]);

  useEffect(() => {
    if (isEdit) fetchDocumentos();
  }, [id, isEdit]);

  const onSubmit = async (formData) => {
    console.log('📝 Form submission attempted');
    console.log('Form data received:', JSON.stringify(formData, null, 2));
    console.log('Form errors:', errors);
    console.log('Is edit mode:', isEdit);
    
    setSubmitError('');
    
    // Na edição, permite deixar curso vazio (não atualiza se não mudar)
    if (isEdit && !formData.curso) {
      console.log('✅ Curso vazio na edição - será ignorado na atualização');
    }
    
    // Verifica se há erros de validação (exceto curso em edit mode)
    const relevantErrors = isEdit ? 
      Object.keys(errors).filter(k => k !== 'curso') : 
      Object.keys(errors);
    
    if (relevantErrors.length > 0) {
      console.error('❌ Validation errors found:', errors);
      setSubmitError(`Erros de validação: ${relevantErrors.map(k => `${k}: ${errors[k]?.message}`).join(', ')}`);
      return;
    }
    
    try {
      if (isEdit) {
        // 1. Update personal & academic info using PATCH (ms-tipo-usuario)
        const alunoPayload = {
          nome: formData.name,
          email: formData.email,
          celular: formData.celular || null,
          cpf: formData.cpf || null,
          rg: formData.rg || null,
          data_nascimento: formData.data_nascimento ? `${formData.data_nascimento}T00:00:00Z` : null,
          ano_ingresso: formData.ano_ingresso ? parseInt(formData.ano_ingresso) : null,
          // If admin left curso blank on edit, keep existing alunoData.curso
          curso: formData.curso && formData.curso.trim() !== '' ? formData.curso : (alunoData?.curso || null)
        };

        console.log('📝 Editing aluno with ID:', id);
        console.log('📤 Aluno payload:', JSON.stringify(alunoPayload, null, 2));

        const alunoResponse = await api.atualizarAlunoAPI(id, alunoPayload);
        console.log('✅ Aluno update response:', alunoResponse);

        // 2. Update address if populated
        if (formData.cep || formData.logradouro) {
          const enderecoPayload = {
            cep: formData.cep || null,
            logradouro: formData.logradouro || null,
            numero: formData.numero || null,
            complemento: formData.complemento || null,
            bairro: formData.bairro || null,
            cidade: formData.cidade || null,
            estado: formData.estado || null,
            pais: formData.pais || 'Brasil'
          };
          console.log('📤 Endereco payload:', JSON.stringify(enderecoPayload, null, 2));
          const enderecoResponse = await api.atualizarEnderecoAlunoAPI(id, enderecoPayload);
          console.log('✅ Endereco update response:', enderecoResponse);
        }

        // 3. Fallback: Update user credentials if password/email changed on ms-usuario
        if (alunoData?.usuarioId && (formData.password || formData.email !== alunoData.email)) {
          const userUpdate = {
            name: formData.name,
            email: formData.email,
          };
          if (formData.password) {
            userUpdate.password = formData.password;
          }
          console.log('📤 User update payload:', JSON.stringify(userUpdate, null, 2));
          const userResponse = await api.updateUser(alunoData.usuarioId, userUpdate);
          console.log('✅ User update response:', userResponse);
        }

        console.log('✅ Edição concluída com sucesso! Redirecionando...');
        setSubmitError(''); // Clear any previous errors
        navigate(ROUTES.ADMIN.ALUNOS);
      } else {
        // Create new user (using real ms-usuario creation endpoint)
        const avatar = generateNewAvatarUrl();
        const payload = {
          nome: formData.name,
          email: formData.email,
          senha: formData.password,
          tipo_usuario: 'ALUNO',
          celular: formData.celular || '',
          matricula: formData.ra,
          roles: [{ role: 'ALUNO' }]
        };
        
        console.log('📤 Payload being sent to /usuarios:', JSON.stringify(payload, null, 2));
        
        const newUser = await api.createUsuarioAPI(payload);
        
        console.log('✅ Response from /usuarios:', newUser);
        
        // Simular/criar acadêmico local
        await api.createAluno({
          userId: newUser.id,
          name: formData.name,
          ra: formData.ra,
          email: formData.email,
          curso: formData.curso,
          status: formData.status,
          avatar,
          semestreEntrada: new Date().getFullYear() + '.1'
        });
      }
      navigate(ROUTES.ADMIN.ALUNOS);
    } catch (error) {
      console.error('❌ Full error object:', error);
      console.error('Error response data:', error?.response?.data);
      console.error('Error status:', error?.response?.status);
      console.error('Error message:', error?.message);
      console.error('Error stack:', error?.stack);
      
      // Log detalhado dos erros
      if (error?.response?.data?.erros && Array.isArray(error.response.data.erros)) {
        console.error('🔍 Detalhes dos erros:');
        error.response.data.erros.forEach((err, idx) => {
          console.error(`  Erro ${idx + 1}:`, JSON.stringify(err, null, 2));
        });
      }
      
      // Extrai mensagem de erro mais específica
      let errorMessage = error?.response?.data?.mensagem || 
                        error?.response?.data?.message ||
                        error?.response?.data?.errors?.[0]?.message ||
                        error?.message ||
                        'Erro ao salvar. Verifique os dados inseridos.';
      
      // Se houver erros detalhados, adiciona à mensagem
      if (error?.response?.data?.erros && Array.isArray(error.response.data.erros) && error.response.data.erros.length > 0) {
        const errorsDetail = error.response.data.erros.map(e => e.mensagem || e.message || e).join(' | ');
        errorMessage = `${errorMessage} - ${errorsDetail}`;
      }
      
      console.error('🚨 Final error message:', errorMessage);
      setSubmitError(errorMessage);
  };

  // Upload document
  const handleUploadDoc = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setDocError('');
    setDocSuccess('');
    setUploadingDoc(docUploadTipo);

    try {
      await api.enviarDocumentoAlunoAPI(id, file, docUploadMidia, docUploadTipo);
      setDocSuccess(`Documento ${docUploadTipo} (${docUploadMidia}) enviado com sucesso!`);
      await fetchDocumentos();
    } catch (err) {
      console.error(err);
      setDocError(err?.response?.data?.message || `Erro ao enviar documento ${docUploadTipo}. Tente novamente.`);
    } finally {
      setUploadingDoc(null);
      if (docFileRef.current) docFileRef.current.value = '';
    }
  };

  // Download document
  const handleDownloadDoc = async (doc) => {
    if (!doc?.id) return;
    const key = doc.id;
    setDocError('');
    setDocSuccess('');
    setDownloadingDoc(key);

    try {
      const result = await api.baixarDocumentoAlunoAPI(doc.id);
      const url = result?.url || result;
      if (typeof url === 'string' && url.startsWith('http')) {
        window.open(url, '_blank');
      } else {
        const blob = new Blob([result]);
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.setAttribute('download', doc.nome || `documento_${doc.tipoDocumento || 'doc'}`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      }
      setDocSuccess('Download iniciado!');
    } catch (err) {
      console.error(err);
      if (err?.response?.status === 404) {
        setDocError('Documento não encontrado.');
      } else {
        setDocError('Erro ao baixar documento.');
      }
    } finally {
      setDownloadingDoc(null);
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
    <div className="p-8 max-w-4xl mx-auto w-full flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
          {isEdit ? 'Editar Aluno' : 'Novo Aluno'}
        </h1>
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#F59E0B] mt-2">
          {isEdit ? 'ATUALIZAR DADOS INTEGRADOS NO MS-TIPO-USUARIO' : 'CADASTRAR NOVO ALUNO NO SISTEMA'}
        </p>
      </div>

      {submitError && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400 font-bold">{submitError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        
        {/* Card 1: Informações Pessoais & Acadêmicas */}
        <div className="bg-white dark:bg-[#020617] p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <h2 className="text-xs font-black uppercase tracking-widest text-[#F59E0B] border-b border-slate-100 dark:border-slate-800 pb-3">
             1. Dados Pessoais & Acadêmicos
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">NOME COMPLETO</label>
              <input
                type="text"
                {...register('name')}
                className={`w-full px-4 py-3 bg-slate-50 dark:bg-[#0B0F19] border ${errors.name ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'} rounded-lg text-sm font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:ring-1 focus:ring-[#F59E0B] outline-none`}
                placeholder="Nome do aluno"
              />
              {errors.name && <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest mt-1.5">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">RA (REGISTRO ACADÊMICO)</label>
              <input
                type="text"
                {...register('ra')}
                className={`w-full px-4 py-3 bg-slate-50 dark:bg-[#0B0F19] border ${errors.ra ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'} rounded-lg text-sm font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:ring-1 focus:ring-[#F59E0B] outline-none`}
                placeholder="202410001"
              />
              {errors.ra && <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest mt-1.5">{errors.ra.message}</p>}
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">E-MAIL</label>
              <input
                type="email"
                {...register('email')}
                className={`w-full px-4 py-3 bg-slate-50 dark:bg-[#0B0F19] border ${errors.email ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'} rounded-lg text-sm font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:ring-1 focus:ring-[#F59E0B] outline-none`}
                placeholder="aluno@uniacademic.com"
              />
              {errors.email && <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest mt-1.5">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
                SENHA {isEdit && <span className="text-slate-400 normal-case tracking-normal">(manter atual se vazio)</span>}
              </label>
              <input
                type="password"
                {...register('password')}
                className={`w-full px-4 py-3 bg-slate-50 dark:bg-[#0B0F19] border ${errors.password ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'} rounded-lg text-sm font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:ring-1 focus:ring-[#F59E0B] outline-none`}
                placeholder={isEdit ? '••••••••' : 'Mínimo 6 caracteres'}
              />
              {errors.password && <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest mt-1.5">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
                CURSO {!isEdit && <span className="text-red-500">*</span>} {isEdit && <span className="text-slate-400 text-xs font-normal">(Opcional)</span>}
              </label>
              {isEdit ? (
                <div>
                  {!showCursoSelector ? (
                    <div className="flex items-center justify-between gap-4">
                      <div className="text-sm font-bold text-slate-900 dark:text-white">{alunoData?.curso || '—'}</div>
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => setShowCursoSelector(true)} className="px-3 py-2 bg-[#F59E0B] text-white rounded text-sm font-black uppercase tracking-widest">Alterar</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <select
                        {...register('curso')}
                        defaultValue={alunoData?.curso || ''}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-bold text-slate-900 dark:text-white focus:ring-1 focus:ring-[#F59E0B] outline-none"
                      >
                        <option value="">(Manter curso atual)</option>
                        {cursos
                          .filter(c => !(alunoData?.curso && c.name === alunoData.curso))
                          .map(c => (
                            <option key={c.id} value={c.name}>{c.name}</option>
                          ))}
                      </select>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => { setShowCursoSelector(false); setValue('curso', ''); }} className="px-3 py-2 bg-slate-200 text-slate-900 rounded text-sm font-bold">Cancelar</button>
                        <button type="button" onClick={() => setShowCursoSelector(false)} className="px-3 py-2 bg-green-600 text-white rounded text-sm font-bold">OK</button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <select
                  {...register('curso')}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-bold text-slate-900 dark:text-white focus:ring-1 focus:ring-[#F59E0B] outline-none"
                >
                  <option value="">Selecione um curso...</option>
                  {cursos.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              )}
              {!isEdit && errors.curso && <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest mt-1.5">{errors.curso.message}</p>}
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">SITUAÇÃO</label>
              <select
                {...register('status')}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-bold text-slate-900 dark:text-white focus:ring-1 focus:ring-[#F59E0B] outline-none"
              >
                <option value="Ativo">Ativo</option>
                <option value="Inativo">Inativo</option>
              </select>
            </div>

            {/* NOVOS CAMPOS MS-TIPO-USUARIO */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">CELULAR</label>
              <input
                type="text"
                {...register('celular')}
                placeholder="11999998888 (apenas números)"
                className={`w-full px-4 py-3 bg-slate-50 dark:bg-[#0B0F19] border ${errors.celular ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'} rounded-lg text-sm font-bold text-slate-900 dark:text-white focus:ring-1 focus:ring-[#F59E0B] outline-none`}
              />
              {errors.celular && <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest mt-1.5">{errors.celular.message}</p>}
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">CPF</label>
              <input
                type="text"
                {...register('cpf')}
                placeholder="12345678901 (apenas números)"
                className={`w-full px-4 py-3 bg-slate-50 dark:bg-[#0B0F19] border ${errors.cpf ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'} rounded-lg text-sm font-bold text-slate-900 dark:text-white focus:ring-1 focus:ring-[#F59E0B] outline-none`}
              />
              {errors.cpf && <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest mt-1.5">{errors.cpf.message}</p>}
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">RG</label>
              <input
                type="text"
                {...register('rg')}
                placeholder="1234567 (7 números)"
                className={`w-full px-4 py-3 bg-slate-50 dark:bg-[#0B0F19] border ${errors.rg ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'} rounded-lg text-sm font-bold text-slate-900 dark:text-white focus:ring-1 focus:ring-[#F59E0B] outline-none`}
              />
              {errors.rg && <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest mt-1.5">{errors.rg.message}</p>}
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">DATA DE NASCIMENTO</label>
              <input
                type="date"
                {...register('data_nascimento')}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-bold text-slate-900 dark:text-white focus:ring-1 focus:ring-[#F59E0B] outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">ANO DE INGRESSO</label>
              <input
                type="number"
                {...register('ano_ingresso')}
                className={`w-full px-4 py-3 bg-slate-50 dark:bg-[#0B0F19] border ${errors.ano_ingresso ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'} rounded-lg text-sm font-bold text-slate-900 dark:text-white focus:ring-1 focus:ring-[#F59E0B] outline-none`}
              />
              {errors.ano_ingresso && <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest mt-1.5">{errors.ano_ingresso.message}</p>}
            </div>
          </div>
        </div>

        {/* Card 2: Endereço (ms-tipo-usuario) */}
        <div className="bg-white dark:bg-[#020617] p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <h2 className="text-xs font-black uppercase tracking-widest text-[#F59E0B] border-b border-slate-100 dark:border-slate-800 pb-3">
             2. Endereço Comercial/Residencial
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">CEP</label>
              <input
                type="text"
                {...register('cep')}
                placeholder="01234567"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-bold text-slate-900 dark:text-white focus:ring-1 focus:ring-[#F59E0B] outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">LOGRADOURO</label>
              <input
                type="text"
                {...register('logradouro')}
                placeholder="Rua, Avenida, etc."
                className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-bold text-slate-900 dark:text-white focus:ring-1 focus:ring-[#F59E0B] outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">NÚMERO</label>
              <input
                type="text"
                {...register('numero')}
                placeholder="Ex: 123"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-bold text-slate-900 dark:text-white focus:ring-1 focus:ring-[#F59E0B] outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">COMPLEMENTO</label>
              <input
                type="text"
                {...register('complemento')}
                placeholder="Apt, Bloco, etc."
                className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-bold text-slate-900 dark:text-white focus:ring-1 focus:ring-[#F59E0B] outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">BAIRRO</label>
              <input
                type="text"
                {...register('bairro')}
                placeholder="Bairro"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-bold text-slate-900 dark:text-white focus:ring-1 focus:ring-[#F59E0B] outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">CIDADE</label>
              <input
                type="text"
                {...register('cidade')}
                placeholder="Cidade"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-bold text-slate-900 dark:text-white focus:ring-1 focus:ring-[#F59E0B] outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">ESTADO</label>
              <input
                type="text"
                {...register('estado')}
                placeholder="UF"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-bold text-slate-900 dark:text-white focus:ring-1 focus:ring-[#F59E0B] outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">PAÍS</label>
              <input
                type="text"
                {...register('pais')}
                placeholder="País"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-bold text-slate-900 dark:text-white focus:ring-1 focus:ring-[#F59E0B] outline-none"
              />
            </div>
          </div>
        </div>

        {/* Card 3: Documentos (ms-tipo-usuario) - APENAS NA EDIÇÃO */}
        {isEdit && (
          <div className="bg-white dark:bg-[#020617] p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <h2 className="text-xs font-black uppercase tracking-widest text-[#F59E0B] border-b border-slate-100 dark:border-slate-800 pb-3">
               3. Gerenciamento de Documentos
            </h2>

            {docError && (
              <div className="p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 text-xs font-bold text-red-600 rounded-lg">
                {docError}
              </div>
            )}
            {docSuccess && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-600 rounded-lg">
                {docSuccess}
              </div>
            )}

            {/* Upload de documento */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Enviar Documento</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Tipo de Documento</label>
                  <select
                    value={docUploadTipo}
                    onChange={e => setDocUploadTipo(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-[#F59E0B]"
                  >
                    {TIPOS_DOCUMENTO.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Formato</label>
                  <select
                    value={docUploadMidia}
                    onChange={e => setDocUploadMidia(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-[#F59E0B]"
                  >
                    {TIPOS_MIDIA.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="flex items-end">
                  <div className="w-full">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Arquivo</label>
                    <input
                      ref={docFileRef}
                      type="file"
                      accept={MIDIA_ACCEPT[docUploadMidia]}
                      onChange={handleUploadDoc}
                      disabled={!!uploadingDoc}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => docFileRef.current?.click()}
                      disabled={!!uploadingDoc}
                      className="w-full py-3 px-4 bg-[#F59E0B] hover:bg-[#D97706] text-[#020617] text-[10px] font-black uppercase tracking-widest rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {uploadingDoc ? 'hourglass_top' : 'cloud_upload'}
                      </span>
                      {uploadingDoc ? 'ENVIANDO...' : 'SELECIONAR E ENVIAR'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Documentos existentes */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Documentos Enviados</h3>
              {docListLoading ? (
                <div className="flex justify-center py-6">
                  <div className="w-6 h-6 border-4 border-[#F59E0B] border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : documentosExistentes.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {documentosExistentes.map((doc, idx) => {
                    const tipoDoc = doc.tipoDocumento || doc.tipo_documento || '—';
                    const nome = doc.nome || tipoDoc;
                    const key = doc.id || idx;
                    const isLoading = downloadingDoc === key;
                    return (
                      <div
                        key={key}
                        className="bg-slate-50/50 dark:bg-[#0B0F19]/50 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-[20px] text-[#F59E0B]">description</span>
                          <div>
                            <p className="text-sm font-black text-slate-700 dark:text-white uppercase">{tipoDoc}</p>
                            <p className="text-[9px] font-bold text-slate-400 truncate max-w-[150px]">{nome}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDownloadDoc(doc)}
                          disabled={isLoading}
                          className="py-1.5 px-3 text-[9px] font-black uppercase tracking-widest rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0B0F19] text-slate-600 dark:text-slate-300 hover:border-[#F59E0B] hover:text-[#F59E0B] transition-all disabled:opacity-50 flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[12px]">
                            {isLoading ? 'hourglass_top' : 'download'}
                          </span>
                          BAIXAR
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-slate-400 italic py-4">Nenhum documento enviado para este aluno.</p>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center gap-4 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 py-4 bg-[#0B0F19] dark:bg-[#F59E0B] text-white dark:text-[#0B0F19] font-black uppercase text-[11px] tracking-widest rounded-lg hover:bg-slate-800 dark:hover:bg-[#D97706] transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Salvando...' : (isEdit ? 'Atualizar Aluno' : 'Cadastrar Aluno')}
          </button>
          <button
            type="button"
            onClick={() => navigate(ROUTES.ADMIN.ALUNOS)}
            className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black uppercase text-[11px] tracking-widest rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};
}
export default AlunoForm;
