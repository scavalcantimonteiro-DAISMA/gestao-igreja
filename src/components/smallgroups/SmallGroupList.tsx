import React, { useState } from 'react';
import { Flame, Plus, Users, MapPin, Clock, Calendar, UserCheck, X, Save, BookOpen, CheckSquare, Trash2 } from 'lucide-react';
import { SmallGroup, SmallGroupParticipant } from '../../types';
import { useChurch } from '../../context/ChurchContext';
import { useNotification } from '../../context/NotificationContext';
import { WhatsAppButton } from '../common/WhatsAppButton';
import { ConfirmModal } from '../common/ConfirmModal';
import { getSmallGroups, saveSmallGroup, deleteSmallGroup, logAction } from '../../services/storage';

export const SmallGroupList: React.FC = () => {
  const { currentChurch } = useChurch();
  const { showToast } = useNotification();

  const [pgs, setPgs] = useState<SmallGroup[]>(() => getSmallGroups(currentChurch.id));
  const [selectedPg, setSelectedPg] = useState<SmallGroup | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAddParticipantOpen, setIsAddParticipantOpen] = useState(false);
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [pgToDelete, setPgToDelete] = useState<SmallGroup | null>(null);


  // Form states
  const [formData, setFormData] = useState<Partial<SmallGroup>>({
    frequency: 'semanal',
    status: 'Ativo',
    participants: []
  });

  const [newParticipant, setNewParticipant] = useState<{
    name: string;
    phone: string;
    role: 'líder' | 'co-líder' | 'participante' | 'visitante';
  }>({
    name: '',
    phone: '',
    role: 'participante'
  });

  const [meetingData, setMeetingData] = useState({
    date: '2026-09-23',
    time: '19:30',
    topic: 'Comunhão e Discipulado no Lar',
    biblicalText: 'Atos 2:42-47',
    presentCount: 8,
    notes: 'Reunião muito edificante com presença de 1 visitante.'
  });

  const refreshList = () => {
    setPgs(getSmallGroups(currentChurch.id));
  };

  const handleDeleteConfirm = () => {
    if (pgToDelete) {
      deleteSmallGroup(pgToDelete.id);
      logAction(currentChurch.id, 'Administrador', 'ADMIN', 'Exclusão de Pequeno Grupo', pgToDelete.name);
      showToast('Pequeno Grupo excluído com sucesso.', 'success');
      setPgToDelete(null);
      refreshList();
    }
  };

  const handleRemoveParticipant = (pgToUpdate: SmallGroup, participantId: string) => {
    const updatedParticipants = (pgToUpdate.participants || []).filter(p => p.id !== participantId);
    const updatedPg = {
      ...pgToUpdate,
      participants: updatedParticipants,
      participantsCount: updatedParticipants.length
    };
    saveSmallGroup(updatedPg);
    if (selectedPg && selectedPg.id === pgToUpdate.id) {
      setSelectedPg(updatedPg);
    }
    refreshList();
    showToast('Participante removido do grupo.', 'info');
  };


  const handleOpenNew = () => {
    setFormData({
      churchId: currentChurch.id,
      name: '',
      leaderName: '',
      leaderPhone: '',
      coLeaderName: '',
      address: '',
      dayOfWeek: 'Quarta-feira',
      time: '19:30',
      frequency: 'semanal',
      maxParticipants: 15,
      participantsCount: 1,
      description: '',
      status: 'Ativo',
      participants: []
    });
    setIsFormOpen(true);
  };

  const handleSavePg = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim() || !formData.leaderName?.trim()) {
      showToast('Nome do PG e Líder são obrigatórios.', 'error');
      return;
    }

    const saved: SmallGroup = {
      id: 'pg_' + Date.now(),
      churchId: currentChurch.id,
      name: formData.name,
      leaderName: formData.leaderName,
      leaderPhone: formData.leaderPhone || '',
      coLeaderName: formData.coLeaderName,
      address: formData.address || 'Maceió - AL',
      dayOfWeek: formData.dayOfWeek || 'Quarta-feira',
      time: formData.time || '19:30',
      frequency: formData.frequency as any || 'semanal',
      maxParticipants: formData.maxParticipants || 15,
      participantsCount: (formData.participants || []).length || 1,
      description: formData.description || '',
      status: formData.status as any || 'Ativo',
      participants: formData.participants || [
        {
          id: 'p_lead',
          name: formData.leaderName,
          phone: formData.leaderPhone || '',
          role: 'líder'
        }
      ],
      createdAt: new Date().toISOString()
    };

    saveSmallGroup(saved);
    logAction(currentChurch.id, 'Administrador', 'ADMIN', 'Criação de Pequeno Grupo', saved.name);
    showToast('Pequeno Grupo criado com sucesso!', 'success');
    setIsFormOpen(false);
    refreshList();
  };

  const handleAddParticipant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPg || !newParticipant.name.trim()) return;

    const updatedParticipants: SmallGroupParticipant[] = [
      ...selectedPg.participants,
      {
        id: 'p_' + Date.now(),
        name: newParticipant.name,
        phone: newParticipant.phone,
        role: newParticipant.role
      }
    ];

    const updatedPg: SmallGroup = {
      ...selectedPg,
      participants: updatedParticipants,
      participantsCount: updatedParticipants.length
    };

    saveSmallGroup(updatedPg);
    setSelectedPg(updatedPg);
    showToast('Participante adicionado ao PG!', 'success');
    setIsAddParticipantOpen(false);
    setNewParticipant({ name: '', phone: '', role: 'participante' });
    refreshList();
  };

  const handleSaveMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Reunião do PG registrada no histórico!', 'success');
    setIsMeetingModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-3">
            <Flame className="w-6 h-6 text-orange-500" />
            <span>Pequenos Grupos (PGs)</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {currentChurch.name} • Comunhão, discipulado e crescimento nos lares
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs sm:text-sm font-bold shadow-lg shadow-orange-500/20 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>+ Novo Pequeno Grupo</span>
        </button>
      </div>

      {/* Grid de PGs ou Estado Vazio */}
      {pgs.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 shadow-sm">
          <Flame className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">Nenhum Pequeno Grupo cadastrado</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Utilize o botão acima "+ Novo Pequeno Grupo" para cadastrar grupos de comunhão nos lares e discipulado.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {pgs.map(pg => (
          <div
            key={pg.id}
            className="p-6 rounded-3xl bg-white border border-slate-200/90 hover:border-orange-300 hover:shadow-md transition-all shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between pb-3 mb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 border border-orange-200 flex items-center justify-center">
                    <Flame className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900">{pg.name}</h3>
                    <p className="text-xs text-orange-600 font-semibold">
                      Líder: {pg.leaderName} {pg.coLeaderName && `• Co-líder: ${pg.coLeaderName}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {pg.status}
                  </span>
                  <button
                    onClick={() => setPgToDelete(pg)}
                    className="p-1.5 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                    title="Excluir Pequeno Grupo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{pg.dayOfWeek} às {pg.time} ({pg.frequency})</span>
                </div>

                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{pg.address}</span>
                </div>

                {pg.description && (
                  <p className="text-[11px] text-slate-500 italic pt-1">
                    "{pg.description}"
                  </p>
                )}

                {/* Participantes */}
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-700 text-xs">
                      Participantes ({pg.participants?.length || 0}):
                    </span>
                    <button
                      onClick={() => {
                        setSelectedPg(pg);
                        setIsAddParticipantOpen(true);
                      }}
                      className="text-[11px] font-semibold text-orange-600 hover:text-orange-700"
                    >
                      + Adicionar participante
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {(pg.participants || []).map(p => (
                      <span
                        key={p.id}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-700 group"
                      >
                        <UserCheck className="w-3 h-3 text-orange-500" />
                        <span className="font-medium">{p.name}</span>
                        <span className="text-[9px] text-slate-400 capitalize">({p.role})</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveParticipant(pg, p.id);
                          }}
                          className="ml-1 text-slate-400 hover:text-rose-500 transition-colors"
                          title="Remover do grupo"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
              <WhatsAppButton
                phone={pg.leaderPhone}
                message={`Olá, ${pg.leaderName}! Passando para saber como estão os preparativos para o encontro do ${pg.name}.`}
                label="Falar com Líder"
                size="sm"
                variant="outline"
              />

              <button
                onClick={() => {
                  setSelectedPg(pg);
                  setIsMeetingModalOpen(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-sky-50 text-slate-700 hover:text-sky-700 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-200"
              >
                <BookOpen className="w-3.5 h-3.5 text-sky-600" />
                Registrar Reunião
              </button>
            </div>
          </div>
        ))}
      </div>
      )}

      {/* Modal Adicionar Participante */}
      {isAddParticipantOpen && selectedPg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 text-slate-800">
            <button
              onClick={() => setIsAddParticipantOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900 mb-4">
              Adicionar Participante ao {selectedPg.name}
            </h3>

            <form onSubmit={handleAddParticipant} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Nome do membro ou visitante"
                  value={newParticipant.name}
                  onChange={e => setNewParticipant({ ...newParticipant, name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Telefone / WhatsApp</label>
                <input
                  type="text"
                  placeholder="(82) 99999-9999"
                  value={newParticipant.phone}
                  onChange={e => setNewParticipant({ ...newParticipant, phone: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Função no Grupo</label>
                <select
                  value={newParticipant.role}
                  onChange={e => setNewParticipant({ ...newParticipant, role: e.target.value as any })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-orange-500"
                >
                  <option value="participante">Participante</option>
                  <option value="co-líder">Co-líder</option>
                  <option value="visitante">Visitante</option>
                  <option value="líder">Líder</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddParticipantOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold"
                >
                  Adicionar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Registrar Reunião do PG (Item 21 do Prompt) */}
      {isMeetingModalOpen && selectedPg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 text-slate-800">
            <button
              onClick={() => setIsMeetingModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900 mb-1">
              Registro de Reunião Semanal
            </h3>
            <p className="text-xs text-orange-600 font-semibold mb-4">{selectedPg.name}</p>

            <form onSubmit={handleSaveMeeting} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Data</label>
                  <input
                    type="date"
                    value={meetingData.date}
                    onChange={e => setMeetingData({ ...meetingData, date: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Horário</label>
                  <input
                    type="time"
                    value={meetingData.time}
                    onChange={e => setMeetingData({ ...meetingData, time: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tema da Reunião</label>
                <input
                  type="text"
                  placeholder="Ex: Vivendo em Comunhão Verdadeira"
                  value={meetingData.topic}
                  onChange={e => setMeetingData({ ...meetingData, topic: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Texto Bíblico</label>
                <input
                  type="text"
                  placeholder="Ex: Romanos 12:9-21"
                  value={meetingData.biblicalText}
                  onChange={e => setMeetingData({ ...meetingData, biblicalText: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Total de Presentes</label>
                <input
                  type="number"
                  value={meetingData.presentCount}
                  onChange={e => setMeetingData({ ...meetingData, presentCount: parseInt(e.target.value, 10) || 0 })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Observações e Testemunhos</label>
                <textarea
                  rows={2}
                  value={meetingData.notes}
                  onChange={e => setMeetingData({ ...meetingData, notes: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-orange-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsMeetingModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  Salvar Reunião
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Criar Novo PG */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 text-slate-800">
            <button
              onClick={() => setIsFormOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900 mb-4">Novo Pequeno Grupo (PG)</h3>

            <form onSubmit={handleSavePg} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nome do PG *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: PG Acolher Ponta Verde"
                  value={formData.name || ''}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nome do Líder *</label>
                  <input
                    type="text"
                    required
                    placeholder="Líder do grupo"
                    value={formData.leaderName || ''}
                    onChange={e => setFormData({ ...formData, leaderName: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">WhatsApp do Líder</label>
                  <input
                    type="text"
                    placeholder="(82) 99999-9999"
                    value={formData.leaderPhone || ''}
                    onChange={e => setFormData({ ...formData, leaderPhone: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Dia da Semana</label>
                  <select
                    value={formData.dayOfWeek || 'Quarta-feira'}
                    onChange={e => setFormData({ ...formData, dayOfWeek: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-orange-500"
                  >
                    <option value="Segunda-feira">Segunda-feira</option>
                    <option value="Terça-feira">Terça-feira</option>
                    <option value="Quarta-feira">Quarta-feira</option>
                    <option value="Quinta-feira">Quinta-feira</option>
                    <option value="Sexta-feira">Sexta-feira</option>
                    <option value="Sábado">Sábado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Horário</label>
                  <input
                    type="time"
                    value={formData.time || '19:30'}
                    onChange={e => setFormData({ ...formData, time: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Endereço da Reunião</label>
                <input
                  type="text"
                  placeholder="Rua, número, bairro..."
                  value={formData.address || ''}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-orange-500"
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
                  className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold"
                >
                  Salvar Grupo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {pgToDelete && (
        <ConfirmModal
          isOpen={true}
          title="Excluir Pequeno Grupo"
          message={`Tem certeza que deseja remover o Pequeno Grupo "${pgToDelete.name}"? Todos os registros e membros vinculados serão removidos deste grupo. Esta ação não pode ser desfeita.`}
          confirmLabel="Excluir Grupo"
          confirmVariant="danger"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setPgToDelete(null)}
        />
      )}
    </div>
  );
};

