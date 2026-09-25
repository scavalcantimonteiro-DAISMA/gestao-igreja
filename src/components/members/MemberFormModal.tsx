import React, { useState, useEffect } from 'react';
import { X, Save, User, MapPin, Cross, Heart, AlertCircle } from 'lucide-react';
import { Member, MemberStatus } from '../../types';
import { MaskedInput } from '../common/MaskedInput';
import { useChurch } from '../../context/ChurchContext';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { saveMember, logAction, getSmallGroups, getMinistries } from '../../services/storage';

interface MemberFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberToEdit?: Member | null;
  onSaved: () => void;
}

export const MemberFormModal: React.FC<MemberFormModalProps> = ({
  isOpen,
  onClose,
  memberToEdit,
  onSaved
}) => {
  const { currentChurch } = useChurch();
  const { currentUser } = useAuth();
  const { showToast } = useNotification();

  const pgs = getSmallGroups(currentChurch.id);
  const ministries = getMinistries(currentChurch.id);

  const [activeTab, setActiveTab] = useState<'pessoal' | 'endereco' | 'crista' | 'casamento'>('pessoal');

  const [formData, setFormData] = useState<Partial<Member>>(() => {
    if (memberToEdit) return { ...memberToEdit };
    return {
      churchId: currentChurch.id,
      name: '',
      gender: 'M',
      birthDate: '',
      cpf: '',
      rg: '',
      maritalStatus: 'Solteiro(a)',
      profession: '',
      education: 'Ensino Superior',
      email: '',
      phone: '',
      whatsapp: '',
      cep: '',
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: currentChurch.city || 'Maceió',
      state: currentChurch.state || 'AL',
      status: 'Ativo',
      conversionDate: '',
      baptismDate: '',
      baptismChurch: currentChurch.name,
      ministry: '',
      smallGroupId: '',
      churchRole: 'Membro',
      talents: '',
      spouseName: '',
      weddingDate: '',
      weddingPlace: ''
    };
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Sincroniza e preenche o formulário sempre que o membro a ser editado ou a modal for aberta
  useEffect(() => {
    if (memberToEdit) {
      setFormData({
        ...memberToEdit,
        churchId: memberToEdit.churchId || currentChurch.id,
        name: memberToEdit.name || '',
        gender: memberToEdit.gender || 'M',
        birthDate: memberToEdit.birthDate || '',
        cpf: memberToEdit.cpf || '',
        rg: memberToEdit.rg || '',
        maritalStatus: memberToEdit.maritalStatus || 'Solteiro(a)',
        profession: memberToEdit.profession || '',
        education: memberToEdit.education || 'Ensino Superior',
        email: memberToEdit.email || '',
        phone: memberToEdit.phone || '',
        whatsapp: memberToEdit.whatsapp || '',
        cep: memberToEdit.cep || '',
        street: memberToEdit.street || '',
        number: memberToEdit.number || '',
        complement: memberToEdit.complement || '',
        neighborhood: memberToEdit.neighborhood || '',
        city: memberToEdit.city || currentChurch.city || 'Maceió',
        state: memberToEdit.state || currentChurch.state || 'AL',
        status: memberToEdit.status || 'Ativo',
        conversionDate: memberToEdit.conversionDate || '',
        baptismDate: memberToEdit.baptismDate || '',
        baptismChurch: memberToEdit.baptismChurch || currentChurch.name,
        ministry: memberToEdit.ministry || '',
        smallGroupId: memberToEdit.smallGroupId || '',
        churchRole: memberToEdit.churchRole || 'Membro',
        talents: memberToEdit.talents || '',
        spouseName: memberToEdit.spouseName || '',
        weddingDate: memberToEdit.weddingDate || '',
        weddingPlace: memberToEdit.weddingPlace || ''
      });
    } else {
      setFormData({
        churchId: currentChurch.id,
        name: '',
        gender: 'M',
        birthDate: '',
        cpf: '',
        rg: '',
        maritalStatus: 'Solteiro(a)',
        profession: '',
        education: 'Ensino Superior',
        email: '',
        phone: '',
        whatsapp: '',
        cep: '',
        street: '',
        number: '',
        complement: '',
        neighborhood: '',
        city: currentChurch.city || 'Maceió',
        state: currentChurch.state || 'AL',
        status: 'Ativo',
        conversionDate: '',
        baptismDate: '',
        baptismChurch: currentChurch.name,
        ministry: '',
        smallGroupId: '',
        churchRole: 'Membro',
        talents: '',
        spouseName: '',
        weddingDate: '',
        weddingPlace: ''
      });
    }
    setActiveTab('pessoal');
    setErrors({});
  }, [memberToEdit, isOpen, currentChurch.id]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!formData.name?.trim()) errs.name = 'Nome completo é obrigatório.';
    if (!formData.whatsapp?.trim()) errs.whatsapp = 'WhatsApp é obrigatório.';
    if (!formData.birthDate) errs.birthDate = 'Data de nascimento é obrigatória.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      setActiveTab('pessoal');
      showToast('Preencha os campos obrigatórios.', 'error');
      return;
    }

    const memberToSave: Member = {
      ...formData,
      id: memberToEdit?.id || 'mem_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      churchId: currentChurch.id,
      name: formData.name!,
      gender: formData.gender as 'M' | 'F',
      birthDate: formData.birthDate!,
      whatsapp: formData.whatsapp!,
      maritalStatus: formData.maritalStatus as any,
      status: (formData.status as MemberStatus) || 'Ativo',
      createdAt: memberToEdit?.createdAt || new Date().toISOString()
    };

    saveMember(memberToSave);
    logAction(
      currentChurch.id,
      currentUser?.name || 'Administrador',
      currentUser?.role || 'ADMIN',
      memberToEdit ? 'Edição de Membro' : 'Novo Membro Cadastrado',
      `${memberToSave.name} (${memberToSave.status})`
    );

    showToast(memberToEdit ? 'Membro atualizado com sucesso!' : 'Novo membro cadastrado com sucesso!', 'success');
    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white border border-slate-200 shadow-2xl flex flex-col max-h-[92vh] text-slate-800">
        {/* Cabeçalho do Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 border border-sky-200 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">
                {memberToEdit ? 'Editar Cadastro de Membro' : 'Novo Cadastro de Membro'}
              </h3>
              <p className="text-xs text-slate-500">
                {currentChurch.name} • Registro Eclesiástico
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Abas de Navegação do Formulário */}
        <div className="flex border-b border-slate-100 px-6 bg-slate-50/70 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('pessoal')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'pessoal' ? 'border-sky-600 text-sky-700' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="w-3.5 h-3.5" /> Dados Pessoais
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('endereco')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'endereco' ? 'border-sky-600 text-sky-700' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" /> Endereço
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('crista')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'crista' ? 'border-sky-600 text-sky-700' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Cross className="w-3.5 h-3.5" /> Vida Cristã & Dons
          </button>
          {formData.maritalStatus === 'Casado(a)' && (
            <button
              type="button"
              onClick={() => setActiveTab('casamento')}
              className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
                activeTab === 'casamento' ? 'border-pink-500 text-pink-700' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Heart className="w-3.5 h-3.5" /> Matrimônio
            </button>
          )}
        </div>

        {/* Corpo do Formulário com Scroll */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* ABA 1: DADOS PESSOAIS */}
          {activeTab === 'pessoal' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Carlos Eduardo de Oliveira"
                    value={formData.name || ''}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
                  />
                  {errors.name && <p className="text-xs text-rose-600 mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Sexo *
                  </label>
                  <select
                    value={formData.gender || 'M'}
                    onChange={e => setFormData({ ...formData, gender: e.target.value as 'M' | 'F' })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-sky-500 transition-colors"
                  >
                    <option value="M">Masculino</option>
                    <option value="F">Feminino</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Data de Nascimento *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.birthDate || ''}
                    onChange={e => setFormData({ ...formData, birthDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-sky-500 transition-colors"
                  />
                  {errors.birthDate && <p className="text-xs text-rose-600 mt-1">{errors.birthDate}</p>}
                </div>

                <div>
                  <MaskedInput
                    mask="phone"
                    label="WhatsApp / Celular *"
                    placeholder="(82) 99999-9999"
                    value={formData.whatsapp || ''}
                    onChange={val => setFormData({ ...formData, whatsapp: val })}
                    error={errors.whatsapp}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    E-mail
                  </label>
                  <input
                    type="email"
                    placeholder="email@exemplo.com"
                    value={formData.email || ''}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-sky-500 transition-colors"
                  />
                </div>

                <div>
                  <MaskedInput
                    mask="cpf"
                    label="CPF"
                    placeholder="000.000.000-00"
                    value={formData.cpf || ''}
                    onChange={val => setFormData({ ...formData, cpf: val })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    RG
                  </label>
                  <input
                    type="text"
                    placeholder="Número e órgão emissor"
                    value={formData.rg || ''}
                    onChange={e => setFormData({ ...formData, rg: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-sky-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Estado Civil
                  </label>
                  <select
                    value={formData.maritalStatus || 'Solteiro(a)'}
                    onChange={e => setFormData({ ...formData, maritalStatus: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-sky-500 transition-colors"
                  >
                    <option value="Solteiro(a)">Solteiro(a)</option>
                    <option value="Casado(a)">Casado(a)</option>
                    <option value="Divorciado(a)">Divorciado(a)</option>
                    <option value="Viúvo(a)">Viúvo(a)</option>
                    <option value="União Estável">União Estável</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Profissão
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Engenheiro, Professor, Autônomo"
                    value={formData.profession || ''}
                    onChange={e => setFormData({ ...formData, profession: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-sky-500 transition-colors"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    URL da Foto de Perfil (Opcional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={formData.photoUrl || ''}
                    onChange={e => setFormData({ ...formData, photoUrl: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-sky-500 transition-colors"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ABA 2: ENDEREÇO */}
          {activeTab === 'endereco' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <MaskedInput
                    mask="cep"
                    label="CEP"
                    placeholder="57000-000"
                    value={formData.cep || ''}
                    onChange={val => setFormData({ ...formData, cep: val })}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Rua / Logradouro
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Av. Júlio Marquez Luz"
                    value={formData.street || ''}
                    onChange={e => setFormData({ ...formData, street: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-sky-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Número
                  </label>
                  <input
                    type="text"
                    placeholder="1408"
                    value={formData.number || ''}
                    onChange={e => setFormData({ ...formData, number: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-sky-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Complemento / Apto
                  </label>
                  <input
                    type="text"
                    placeholder="Apto 302, Bloco B"
                    value={formData.complement || ''}
                    onChange={e => setFormData({ ...formData, complement: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-sky-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Bairro
                  </label>
                  <input
                    type="text"
                    placeholder="Jatiúca"
                    value={formData.neighborhood || ''}
                    onChange={e => setFormData({ ...formData, neighborhood: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-sky-500 transition-colors"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Cidade
                  </label>
                  <input
                    type="text"
                    placeholder="Maceió"
                    value={formData.city || ''}
                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-sky-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Estado (UF)
                  </label>
                  <input
                    type="text"
                    maxLength={2}
                    placeholder="AL"
                    value={formData.state || ''}
                    onChange={e => setFormData({ ...formData, state: e.target.value.toUpperCase() })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-sky-500 uppercase transition-colors"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ABA 3: VIDA CRISTÃ */}
          {activeTab === 'crista' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Situação / Status *
                  </label>
                  <select
                    value={formData.status || 'Ativo'}
                    onChange={e => setFormData({ ...formData, status: e.target.value as MemberStatus })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-sky-500 transition-colors"
                  >
                    <option value="Ativo">Ativo</option>
                    <option value="Em acompanhamento">Em acompanhamento</option>
                    <option value="Visitante">Visitante</option>
                    <option value="Afastado">Afastado</option>
                    <option value="Transferido">Transferido</option>
                    <option value="Falecido">Falecido</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Cargo / Função
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Membro, Diácono, Líder, Músico"
                    value={formData.churchRole || ''}
                    onChange={e => setFormData({ ...formData, churchRole: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-sky-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Pequeno Grupo (PG)
                  </label>
                  <select
                    value={formData.smallGroupId || ''}
                    onChange={e => setFormData({ ...formData, smallGroupId: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-sky-500 transition-colors"
                  >
                    <option value="">Nenhum / Não participa</option>
                    {pgs.map(pg => (
                      <option key={pg.id} value={pg.id}>{pg.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Ministério de Atuação
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Louvor, Acolhimento, Mídia, Infantil..."
                    value={formData.ministry || ''}
                    onChange={e => setFormData({ ...formData, ministry: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-sky-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Data da Conversão
                  </label>
                  <input
                    type="date"
                    value={formData.conversionDate || ''}
                    onChange={e => setFormData({ ...formData, conversionDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-sky-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Data do Batismo nas Águas
                  </label>
                  <input
                    type="date"
                    value={formData.baptismDate || ''}
                    onChange={e => setFormData({ ...formData, baptismDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-sky-500 transition-colors"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Dons, Talentos e Habilidades
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Ex: Canto, violão, sonoplastia, organização, ensino bíblico, culinária..."
                    value={formData.talents || ''}
                    onChange={e => setFormData({ ...formData, talents: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-sky-500 transition-colors"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ABA 4: CASAMENTO (Se Casado) */}
          {activeTab === 'casamento' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-3 rounded-xl bg-pink-50 border border-pink-200 text-xs text-pink-800 flex items-center gap-2">
                <Heart className="w-4 h-4 text-pink-600 shrink-0" />
                <span>
                  O sistema identificará automaticamente as comemorações de aniversário de casamento no Dashboard.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nome do Cônjuge
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Maria dos Santos Silva"
                    value={formData.spouseName || ''}
                    onChange={e => setFormData({ ...formData, spouseName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-pink-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Data do Casamento *
                  </label>
                  <input
                    type="date"
                    value={formData.weddingDate || ''}
                    onChange={e => setFormData({ ...formData, weddingDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-pink-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Local do Casamento
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Maceió - AL"
                    value={formData.weddingPlace || ''}
                    onChange={e => setFormData({ ...formData, weddingPlace: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-pink-500 transition-colors"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Rodapé com Ações */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-sky-500/20 active:scale-95 transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {memberToEdit ? 'Atualizar Membro' : 'Salvar Membro'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
