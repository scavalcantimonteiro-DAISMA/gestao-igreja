import React, { useState } from 'react';
import { 
  Church as ChurchIcon, 
  Plus, 
  Users, 
  Calendar, 
  MapPin, 
  X, 
  Save, 
  Trash2, 
  Heart, 
  FileSpreadsheet,
  Phone,
  Edit3,
  UserPlus
} from 'lucide-react';
import { Ministry } from '../../types';
import { useChurch, useDataSync } from '../../context/ChurchContext';
import { useNotification } from '../../context/NotificationContext';
import { ConfirmModal } from '../common/ConfirmModal';
import { getMinistries, saveMinistry, deleteMinistry, logAction } from '../../services/storage';
import { exportMinistriesToExcel } from '../../services/excelBackup';

export const MinistriesList: React.FC = () => {
  const { currentChurch } = useChurch();
  const { showToast } = useNotification();

  const [ministries, setMinistries] = useState<Ministry[]>(() => getMinistries(currentChurch.id));
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMinistryId, setEditingMinistryId] = useState<string | null>(null);
  const [ministryToDelete, setMinistryToDelete] = useState<Ministry | null>(null);

  // Formulário do Ministério
  const [formData, setFormData] = useState<Partial<Ministry>>({
    name: '',
    leaderName: '',
    leaderPhone: '',
    viceLeaderName: '',
    viceLeaderPhone: '',
    meetingDay: '',
    meetingTime: '',
    location: '',
    description: '',
    members: []
  });

  // Campo auxiliar para adicionar membro dentro do modal
  const [newMemberInput, setNewMemberInput] = useState('');

  // Campo auxiliar para adicionar membro inline direto no card
  const [inlineMemberInput, setInlineMemberInput] = useState<{ [ministryId: string]: string }>({});

  const refreshList = () => {
    setMinistries(getMinistries(currentChurch.id));
  };

  useDataSync(refreshList, [currentChurch.id]);

  const handleDeleteConfirm = () => {
    if (ministryToDelete) {
      deleteMinistry(ministryToDelete.id);
      logAction(currentChurch.id, 'Administrador', 'ADMIN', 'Exclusão de Ministério', ministryToDelete.name);
      showToast('Ministério excluído com sucesso.', 'success');
      setMinistryToDelete(null);
      refreshList();
    }
  };

  const openNewForm = () => {
    setEditingMinistryId(null);
    setFormData({
      churchId: currentChurch.id,
      name: '',
      leaderName: '',
      leaderPhone: '',
      viceLeaderName: '',
      viceLeaderPhone: '',
      meetingDay: '',
      meetingTime: '',
      location: '',
      description: '',
      membersCount: 0,
      members: []
    });
    setNewMemberInput('');
    setIsFormOpen(true);
  };

  const openEditForm = (m: Ministry) => {
    setEditingMinistryId(m.id);
    setFormData({
      ...m,
      members: m.members || []
    });
    setNewMemberInput('');
    setIsFormOpen(true);
  };

  const handleAddMemberToForm = () => {
    const trimmed = newMemberInput.trim();
    if (!trimmed) return;
    const currentMembers = formData.members || [];
    if (currentMembers.includes(trimmed)) {
      showToast('Este integrante já está adicionado.', 'info');
      return;
    }
    setFormData({
      ...formData,
      members: [...currentMembers, trimmed]
    });
    setNewMemberInput('');
  };

  const handleRemoveMemberFromForm = (indexToRemove: number) => {
    const currentMembers = formData.members || [];
    setFormData({
      ...formData,
      members: currentMembers.filter((_, idx) => idx !== indexToRemove)
    });
  };

  // Adicionar membro rapidamente direto no card
  const handleAddMemberInline = (m: Ministry) => {
    const nameToAdd = (inlineMemberInput[m.id] || '').trim();
    if (!nameToAdd) return;

    const currentMembers = m.members || [];
    if (currentMembers.includes(nameToAdd)) {
      showToast('Este integrante já está no ministério.', 'info');
      return;
    }

    const updatedMinistry: Ministry = {
      ...m,
      members: [...currentMembers, nameToAdd],
      membersCount: (currentMembers.length + 1)
    };

    saveMinistry(updatedMinistry);
    setInlineMemberInput(prev => ({ ...prev, [m.id]: '' }));
    showToast(`"${nameToAdd}" adicionado a ${m.name}!`, 'success');
    refreshList();
  };

  // Remover membro rapidamente direto no card
  const handleRemoveMemberInline = (m: Ministry, memberNameToRemove: string) => {
    const currentMembers = (m.members || []).filter(name => name !== memberNameToRemove);
    const updatedMinistry: Ministry = {
      ...m,
      members: currentMembers,
      membersCount: currentMembers.length
    };
    saveMinistry(updatedMinistry);
    showToast(`Integrante removido de ${m.name}.`, 'info');
    refreshList();
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim() || !formData.leaderName?.trim()) {
      showToast('Nome do ministério e Líder são obrigatórios.', 'error');
      return;
    }

    const membersList = formData.members || [];

    const saved: Ministry = {
      id: editingMinistryId || ('min_' + Date.now()),
      churchId: currentChurch.id,
      name: formData.name.trim(),
      leaderName: formData.leaderName.trim(),
      leaderPhone: formData.leaderPhone?.trim() || '',
      viceLeaderName: formData.viceLeaderName?.trim() || '',
      viceLeaderPhone: formData.viceLeaderPhone?.trim() || '',
      meetingDay: formData.meetingDay?.trim() || '',
      meetingTime: formData.meetingTime?.trim() || '',
      location: formData.location?.trim() || '',
      description: formData.description?.trim() || '',
      membersCount: membersList.length,
      members: membersList,
      createdAt: formData.createdAt || new Date().toISOString()
    };

    saveMinistry(saved);
    logAction(
      currentChurch.id, 
      'Administrador', 
      'ADMIN', 
      editingMinistryId ? 'Edição de Ministério' : 'Criação de Ministério', 
      saved.name
    );
    showToast(editingMinistryId ? 'Ministério atualizado com sucesso!' : 'Ministério criado com sucesso!', 'success');
    setIsFormOpen(false);
    refreshList();
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-3">
            <ChurchIcon className="w-6 h-6 text-sky-600" />
            <span>Ministérios & Departamentos</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {currentChurch.name} • Departamentos, líderes, equipes de serviço e membros
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              exportMinistriesToExcel(currentChurch, ministries);
              showToast('Ministérios exportados em Excel com sucesso!', 'success');
            }}
            title="Baixar lista em planilha Excel"
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Baixar em Excel</span>
          </button>

          <button
            onClick={openNewForm}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-sky-500/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Novo Ministério</span>
          </button>
        </div>
      </div>

      {ministries.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 shadow-sm">
          <ChurchIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">Nenhum ministério cadastrado</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Clique no botão acima "+ Novo Ministério" para estruturar equipes de louvor, infantil, mídia, acolhimento e outros.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {ministries.map(m => {
            const leaderCleanPhone = (m.leaderPhone || '').replace(/\D/g, '');
            const viceCleanPhone = (m.viceLeaderPhone || '').replace(/\D/g, '');

            return (
              <div
                key={m.id}
                className="p-6 rounded-3xl bg-white border border-slate-200/90 hover:border-sky-300 hover:shadow-md transition-all shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between pb-3 mb-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 border border-sky-200 flex items-center justify-center font-bold">
                        <ChurchIcon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-base text-slate-900">{m.name}</h3>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-600 mt-0.5">
                          <span className="font-semibold text-slate-800">
                            Líder: <strong className="text-sky-700">{m.leaderName}</strong>
                          </span>
                          {m.leaderPhone && (
                            <a
                              href={`https://wa.me/55${leaderCleanPhone}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] text-emerald-600 hover:text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded"
                              title="Chamar Líder no WhatsApp"
                            >
                              <Phone className="w-2.5 h-2.5" />
                              <span>{m.leaderPhone}</span>
                            </a>
                          )}
                        </div>
                        {m.viceLeaderName && (
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-600 mt-0.5">
                            <span>
                              Vice: <strong className="text-slate-700">{m.viceLeaderName}</strong>
                            </span>
                            {m.viceLeaderPhone && (
                              <a
                                href={`https://wa.me/55${viceCleanPhone}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] text-emerald-600 hover:text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded"
                                title="Chamar Vice-Líder no WhatsApp"
                              >
                                <Phone className="w-2.5 h-2.5" />
                                <span>{m.viceLeaderPhone}</span>
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => openEditForm(m)}
                        title="Editar Ministério"
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-sky-50 text-slate-500 hover:text-sky-600 transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setMinistryToDelete(m)}
                        title="Excluir Ministério"
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs text-slate-600">
                    {(m.meetingDay || m.meetingTime) && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Encontros: {m.meetingDay || 'A combinar'} {m.meetingTime ? `às ${m.meetingTime}` : ''}</span>
                      </div>
                    )}

                    {m.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{m.location}</span>
                      </div>
                    )}

                    {m.description && (
                      <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                        {m.description}
                      </p>
                    )}

                    {/* Integrantes / Membros da Equipe */}
                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-sky-600" />
                          Membros & Integrantes ({(m.members || []).length}):
                        </span>
                      </div>

                      {/* Adicionar membro direto no card */}
                      <div className="flex items-center gap-1.5 mb-2.5">
                        <input
                          type="text"
                          placeholder="Nome do novo membro..."
                          value={inlineMemberInput[m.id] || ''}
                          onChange={e => setInlineMemberInput({ ...inlineMemberInput, [m.id]: e.target.value })}
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddMemberInline(m);
                            }
                          }}
                          className="flex-1 px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs outline-none focus:bg-white focus:border-sky-400"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddMemberInline(m)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-xs active:scale-95 transition-all"
                        >
                          <UserPlus className="w-3 h-3" />
                          <span>Adicionar</span>
                        </button>
                      </div>

                      {/* Chips de membros */}
                      <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                        {(m.members && m.members.length > 0) ? (
                          m.members.map((memberName, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-sky-50 text-sky-800 border border-sky-200/80 text-[11px] font-medium shadow-xs group"
                            >
                              <span>{memberName}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveMemberInline(m, memberName)}
                                className="text-sky-400 hover:text-rose-600 transition-colors ml-0.5"
                                title={`Remover ${memberName} do ministério`}
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">
                            Nenhum integrante adicionado ainda. Digite o nome acima para adicionar.
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Desejam Servir / Banco de Voluntários */}
                    {m.volunteers && m.volunteers.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-100 bg-amber-50/50 p-3 rounded-2xl border border-amber-200/60">
                        <span className="font-bold text-amber-900 text-xs flex items-center gap-1.5 mb-2">
                          <Heart className="w-3.5 h-3.5 text-amber-600" />
                          Manifestaram Desejo de Servir ({m.volunteers.length}):
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {m.volunteers.map((volName, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center px-2 py-0.5 rounded-lg bg-white/90 text-amber-900 border border-amber-200 text-[10px] font-semibold"
                            >
                              {volName}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="font-semibold text-slate-600">
                      Total da equipe: <strong className="text-sky-700 font-bold">{(m.members || []).length} integrantes</strong>
                    </span>
                    <span className="text-[11px] bg-sky-50 text-sky-700 px-2.5 py-1 rounded-lg border border-sky-200/60 font-semibold">
                      Ativo
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Cadastrar / Editar Ministério */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 text-slate-800 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsFormOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900 mb-1">
              {editingMinistryId ? 'Editar Ministério' : 'Cadastrar Novo Ministério'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Informe os dados de liderança, contatos e integrantes da equipe.
            </p>

            <form onSubmit={handleSave} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nome do Ministério *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Louvor, Ação Social, Mídia, Acolhimento..."
                  value={formData.name || ''}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-sky-500"
                />
              </div>

              {/* LIDERANÇA */}
              <div className="p-3.5 rounded-2xl bg-sky-50/60 border border-sky-100 space-y-3">
                <span className="text-xs font-bold text-sky-900 block">Liderança do Ministério</span>
                
                {/* Linha do Líder */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Nome do Líder *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Pr. João Silva"
                      value={formData.leaderName || ''}
                      onChange={e => setFormData({ ...formData, leaderName: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Número / WhatsApp do Líder</label>
                    <input
                      type="text"
                      placeholder="Ex: (82) 99999-0000"
                      value={formData.leaderPhone || ''}
                      onChange={e => setFormData({ ...formData, leaderPhone: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                {/* Linha do Vice-Líder */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Nome do Vice-Líder</label>
                    <input
                      type="text"
                      placeholder="Ex: Maria Santos"
                      value={formData.viceLeaderName || ''}
                      onChange={e => setFormData({ ...formData, viceLeaderName: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Número / WhatsApp do Vice</label>
                    <input
                      type="text"
                      placeholder="Ex: (82) 98888-1111"
                      value={formData.viceLeaderPhone || ''}
                      onChange={e => setFormData({ ...formData, viceLeaderPhone: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs outline-none focus:border-sky-500"
                    />
                  </div>
                </div>
              </div>

              {/* INTEGRANTES / MEMBROS */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800">
                    Adicionar Membros ao Ministério ({formData.members?.length || 0})
                  </label>
                </div>
                
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Nome completo do membro..."
                    value={newMemberInput}
                    onChange={e => setNewMemberInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddMemberToForm();
                      }
                    }}
                    className="flex-1 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs outline-none focus:border-sky-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddMemberToForm}
                    className="flex items-center gap-1 px-3 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Adicionar</span>
                  </button>
                </div>

                {/* Chips de membros no modal */}
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pt-1">
                  {(formData.members && formData.members.length > 0) ? (
                    formData.members.map((memberName, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white border border-slate-300 text-slate-800 text-xs shadow-2xs font-medium"
                      >
                        <span>{memberName}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveMemberFromForm(idx)}
                          className="text-slate-400 hover:text-rose-600"
                          title="Remover"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))
                  ) : (
                    <span className="text-[11px] text-slate-400 italic">
                      Nenhum membro adicionado ainda. Digite o nome acima e clique em Adicionar.
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Dia de Encontro / Ensaio</label>
                  <input
                    type="text"
                    placeholder="Ex: Sábado"
                    value={formData.meetingDay || ''}
                    onChange={e => setFormData({ ...formData, meetingDay: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs outline-none focus:bg-white focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Horário</label>
                  <input
                    type="text"
                    placeholder="Ex: 16:00"
                    value={formData.meetingTime || ''}
                    onChange={e => setFormData({ ...formData, meetingTime: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs outline-none focus:bg-white focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Local</label>
                <input
                  type="text"
                  placeholder="Ex: Templo Principal, Sala de Ensaios..."
                  value={formData.location || ''}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs outline-none focus:bg-white focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Descrição e Finalidade</label>
                <textarea
                  rows={2}
                  placeholder="Descreva a missão ou responsabilidades do ministério..."
                  value={formData.description || ''}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs outline-none focus:bg-white focus:border-sky-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-sm"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Salvar Ministério</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {ministryToDelete && (
        <ConfirmModal
          isOpen={true}
          title="Excluir Ministério"
          message={`Tem certeza que deseja remover o ministério "${ministryToDelete.name}"? Esta ação não pode ser desfeita.`}
          confirmLabel="Excluir"
          confirmVariant="danger"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setMinistryToDelete(null)}
        />
      )}
    </div>
  );
};
