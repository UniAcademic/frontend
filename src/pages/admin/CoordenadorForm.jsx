import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import api from '@/services/api';
import { coordenadorEditSchema, coordenadorCreateSchema } from '@/schemas/coordenador.schema';
import { generateNewAvatarUrl } from '@/config/external.config';
import { ROUTES } from '@/config/routes.config';

const CoordenadorForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [loading, setLoading] = useState(isEdit);
  const [submitError, setSubmitError] = useState('');
  const [coordenadorData, setCoordenadorData] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(isEdit ? coordenadorEditSchema : coordenadorCreateSchema),
    defaultValues: {
      name: '', email: '', password: '', matricula: '',
      celular: '', cpf: '', rg: '', data_nascimento: '', ano_ingresso: new Date().getFullYear(),
      titulacao: 'MESTRE',
      cep: '', logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '', pais: 'Brasil'
    }
  });

  useEffect(() => {
    if (isEdit) {
      const fetchData = async () => {
        try {
          const coordenador = await api.getCoordenadorPorIdAPI(id);
          if (coordenador) {
            setCoordenadorData(coordenador);

            let formattedDate = '';
            if (coordenador.dataNascimento) {
              formattedDate = coordenador.dataNascimento.split('T')[0];
            }

            reset({
              name: coordenador.nome || coordenador.name || '',
              email: coordenador.email || '',
              password: '',
              matricula: coordenador.matricula || '',
              celular: coordenador.celular || '',
              cpf: coordenador.cpf || '',
              rg: coordenador.rg || '',
              data_nascimento: formattedDate,
              ano_ingresso: coordenador.anoAdmissao || new Date().getFullYear(),
              titulacao: coordenador.titulacao || 'MESTRE',
              cep: coordenador.endereco?.cep || '',
              logradouro: coordenador.endereco?.logradouro || '',
              numero: coordenador.endereco?.numero || '',
              complemento: coordenador.endereco?.complemento || '',
              bairro: coordenador.endereco?.bairro || '',
              cidade: coordenador.endereco?.cidade || '',
              estado: coordenador.endereco?.estado || '',
              pais: coordenador.endereco?.pais || 'Brasil',
            });
          }
        } catch (error) {
          console.error('Error loading coordinator data:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [id, isEdit, reset]);

  const onSubmit = async (formData) => {
    setSubmitError('');
    try {
      if (isEdit) {
        // 1. Update personal & academic info using PATCH (ms-tipo-usuario)
        const coordenadorPayload = {
          nome: formData.name,
          email: formData.email,
          celular: formData.celular || null,
          cpf: formData.cpf || null,
          rg: formData.rg || null,
          data_nascimento: formData.data_nascimento ? `${formData.data_nascimento}T00:00:00Z` : null,
          ano_ingresso: formData.ano_ingresso ? parseInt(formData.ano_ingresso) : null,
          titulacao: formData.titulacao || null
        };
        await api.atualizarCoordenadorAPI(id, coordenadorPayload);

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
          await api.atualizarEnderecoCoordenadorAPI(id, enderecoPayload);
        }

        // 3. Fallback: Update user credentials if password/email changed on ms-usuario
        if (coordenadorData?.usuarioId && (formData.password || formData.email !== coordenadorData.email)) {
          const userUpdate = {
            name: formData.name,
            email: formData.email,
          };
          if (formData.password) {
            userUpdate.password = formData.password;
          }
          await api.updateUser(coordenadorData.usuarioId, userUpdate);
        }
      } else {
        // Create user (using real ms-usuario creation endpoint)
        const avatar = generateNewAvatarUrl();
        const newUser = await api.createUsuarioAPI({
          nome: formData.name,
          email: formData.email,
          senha: formData.password,
          tipo_usuario: 'COORDENADOR',
          celular: formData.celular || '',
          matricula: formData.matricula
        });

        // Simular/criar acadêmico local (fallback)
        await api.createProfessor({
          userId: newUser.id,
          name: formData.name,
          email: formData.email,
          department: 'Coordenadoria',
          avatar
        });
      }
      navigate('/admin/coordenadores');
    } catch (error) {
      console.error('Error saving coordinator:', error);
      setSubmitError('Erro ao salvar. Verifique se o e-mail/matrícula já não está em uso.');
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
          {isEdit ? 'Editar Coordenador' : 'Novo Coordenador'}
        </h1>
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#F59E0B] mt-2">
          {isEdit ? 'ATUALIZAR DADOS INTEGRADOS NO MS-TIPO-USUARIO' : 'CADASTRAR NOVO COORDENADOR'}
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
             1. Dados Pessoais & Coordenadoria
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">NOME COMPLETO</label>
              <input
                type="text"
                {...register('name')}
                className={`w-full px-4 py-3 bg-slate-50 dark:bg-[#0B0F19] border ${errors.name ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'} rounded-lg text-sm font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:ring-1 focus:ring-[#F59E0B] outline-none`}
                placeholder="Nome do coordenador"
              />
              {errors.name && <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest mt-1.5">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">MATRÍCULA</label>
              <input
                type="text"
                {...register('matricula')}
                disabled={isEdit}
                className={`w-full px-4 py-3 bg-slate-50 dark:bg-[#0B0F19] border ${errors.matricula ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'} rounded-lg text-sm font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:ring-1 focus:ring-[#F59E0B] outline-none disabled:opacity-60`}
                placeholder="Matrícula do coordenador"
              />
              {errors.matricula && <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest mt-1.5">{errors.matricula.message}</p>}
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">E-MAIL</label>
              <input
                type="email"
                {...register('email')}
                className={`w-full px-4 py-3 bg-slate-50 dark:bg-[#0B0F19] border ${errors.email ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'} rounded-lg text-sm font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:ring-1 focus:ring-[#F59E0B] outline-none`}
                placeholder="coordenador@uniacademic.com"
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
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">TITULAÇÃO</label>
              <select
                {...register('titulacao')}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-bold text-slate-900 dark:text-white focus:ring-1 focus:ring-[#F59E0B] outline-none"
              >
                <option value="GRADUADO">Graduado</option>
                <option value="ESPECIALISTA">Especialista</option>
                <option value="MESTRE">Mestre</option>
                <option value="DOUTOR">Doutor</option>
                <option value="POS_DOUTOR">Pós-Doutor</option>
              </select>
            </div>

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
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">ANO DE ADMISSÃO</label>
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

        <div className="flex items-center gap-4 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 py-4 bg-[#0B0F19] dark:bg-[#F59E0B] text-white dark:text-[#0B0F19] font-black uppercase text-[11px] tracking-widest rounded-lg hover:bg-slate-800 dark:hover:bg-[#D97706] transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Salvando...' : (isEdit ? 'Atualizar Coordenador' : 'Cadastrar Coordenador')}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/coordenadores')}
            className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black uppercase text-[11px] tracking-widest rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default CoordenadorForm;
