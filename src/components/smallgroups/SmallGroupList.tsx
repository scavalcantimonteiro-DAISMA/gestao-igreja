import React, { useState } from 'react';
import { 
  Flame, 
  Plus, 
  Users, 
  MapPin, 
  Clock, 
  Calendar, 
  UserCheck, 
  X, 
  Save, 
  BookOpen, 
  Trash2, 
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  Copy,
  History,
  Send,
  MessageCircle,
  Sparkles,
  Heart,
  UserPlus,
  Check,
  Edit3
} from 'lucide-react';
import { SmallGroup, SmallGroupParticipant, SmallGroupMeeting, Church } from '../../types';
import { useChurch, useDataSync } from '../../context/ChurchContext';
import { useNotification } from '../../context/NotificationContext';
import { WhatsAppButton } from '../common/WhatsAppButton';
import { ConfirmModal } from '../common/ConfirmModal';
import { 
  getSmallGroups, 
  saveSmallGroup, 
  deleteSmallGroup, 
  logAction, 
  getSmallGroupMeetings, 
  saveSmallGroupMeeting, 
  deleteSmallGroupMeeting 
} from '../../services/storage';
import { exportSmallGroupsToExcel } from '../../services/excelBackup';

export const SmallGroupList: React.FC = () => {
  const { currentChurch } = useChurch();
  const { showToast } = useNotification();

  const [pgs, setPgs] = useState<SmallGroup[]>(() => getSmallGroups(currentChurch.id));
  const [meetings, setMeetings] = useState<SmallGroupMeeting[]>(() => getSmallGroupMeetings(currentChurch.id));

  // Modais
  const [selectedPg, setSelectedPg] = useState<SmallGroup | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPg, setEditingPg] = useState<SmallGroup | null>(null);
  const [isAddParticipantOpen, setIsAddParticipantOpen] = useState(false);
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isReportReviewOpen, setIsReportReviewOpen] = useState(false);
  
  // Confirmações de Exclusão
  const [pgToDelete, setPgToDelete] = useState<SmallGroup | null>(null);
  const [meetingToDelete, setMeetingToDelete] = useState<SmallGroupMeeting | null>(null);

  // Form states - Novo / Editar PG
  const [formData, setFormData] = useState<Partial<SmallGroup>>({
    frequency: 'semanal',
    status: 'Ativo',
    participants: []
  });

  // Form states - Adicionar Participante
  const [newParticipant, setNewParticipant] = useState<{
    name: string;
    phone: string;
    role: 'líder' | 'co-líder' | 'participante' | 'visitante';
  }>({
    name: '',
    phone: '',
    role: 'participante'
  });

  // Form states - Registro de Reunião & Chamada de Presença
  const [attendanceMap, setAttendanceMap] = useState<Record<string, boolean>>({});
  const [visitorsList, setVisitorsList] = useState<string[]>([]);
  const [newVisitorInput, setNewVisitorInput] = useState('');
  const [meetingForm, setMeetingForm] = useState({
    date: new Date().toISOString().split('T')[0],
    time: '19:30',
    topic: '',
    biblicalText: '',
    prayerRequests: '',
    notes: ''
  });

  // Relatório WhatsApp
  const [activeMeetingForReport, setActiveMeetingForReport] = useState<SmallGroupMeeting | null>(null);
  const [reportText, setReportText] = useState('');
  const [reportDestination, setReportDestination] = useState<'pastor' | 'coordinator' | 'custom'>('pastor');
  const [customReportPhone, setCustomReportPhone] = useState('');

  const refreshList = () => {
    setPgs(getSmallGroups(currentChurch.id));
    setMeetings(getSmallGroupMeetings(currentChurch.id));
  };

  useDataSync(refreshList, [currentChurch.id]);

  // Helpers
  const cleanPhone = (phone: string) => phone.replace(/\D/g, '');

  const openWhatsApp = (phone: string, text: string) => {
    const digits = cleanPhone(phone);
    const cleanDigits = digits.length <= 11 && !digits.startsWith('55') ? `55${digits}` : digits;
    const url = `https://wa.me/${cleanDigits}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // Gerador de Mensagem Estruturada para WhatsApp
  const generateWhatsAppReport = (
    church: Church,
    pg: SmallGroup,
    meeting: SmallGroupMeeting
  ): string => {
    const totalRegistered = (meeting.attendees.length + meeting.absentees.length) || 1;
    const presencePercentage = Math.round((meeting.attendees.length / totalRegistered) * 100);
    const totalPeoplePresent = meeting.attendees.length + meeting.visitors.length;
    const formattedDate = meeting.date.split('-').reverse().join('/');

    return `🔥 *RELATÓRIO DE PEQUENO GRUPO / CÉLULA*
🏛️ *Igreja:* ${church.name}
🏠 *Grupo:* ${pg.name}
👤 *Líder:* ${meeting.leaderName || pg.leaderName}
📅 *Data da Reunião:* ${formattedDate} às ${meeting.time}
${meeting.topic ? `📖 *Tema / Estudo:* ${meeting.topic}\n` : ''}${meeting.biblicalText ? `📜 *Texto Bíblico:* ${meeting.biblicalText}\n` : ''}
📊 *RESUMO DA FREQUÊNCIA:*
👥 *Membros do PG:* ${totalRegistered}
✅ *Membros Presentes:* ${meeting.attendees.length} (${presencePercentage}%)
❌ *Membros Faltantes:* ${meeting.absentees.length}
🌟 *Visitantes:* ${meeting.visitors.length}
🔥 *Total Geral Presente:* ${totalPeoplePresent} pessoas

✅ *MEMBROS PRESENTES:*
${meeting.attendees.length > 0 ? meeting.attendees.map(a => `• ${a}`).join('\n') : '• Nenhum membro registrado'}

${meeting.absentees.length > 0 ? `❌ *MEMBROS FALTANTES (Para Visita/Cuidado):*\n${meeting.absentees.map(ab => `• ${ab}`).join('\n')}\n` : ''}${meeting.visitors.length > 0 ? `🌟 *VISITANTES PRESENTES:*\n${meeting.visitors.map(v => `• ${v}`).join('\n')}\n` : ''}${meeting.prayerRequests ? `🙏 *PEDIDOS DE ORAÇÃO:*\n${meeting.prayerRequests}\n` : ''}${meeting.notes ? `📝 *OBSERVAÇÕES DO ENCONTRO:*\n${meeting.notes}\n` : ''}
_Enviado pelo Sistema de Gestão Eclesiástica_`;
  };

  // ==========================================
  // HANDLERS DE PEQUENO GRUPO
  // ==========================================

  const handleOpenNew = () => {
    setEditingPg(null);
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

  const handleOpenEdit = (pg: SmallGroup) => {
    setEditingPg(pg);
    setFormData({
      ...pg
    });
    setIsFormOpen(true);
  };

  const handleSavePg = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim() || !formData.leaderName?.trim()) {
      showToast('Nome do PG e Líder são obrigatórios.', 'error');
      return;
    }

    if (editingPg) {
      const updated: SmallGroup = {
        ...editingPg,
        name: formData.name || editingPg.name,
        leaderName: formData.leaderName || editingPg.leaderName,
        leaderPhone: formData.leaderPhone || '',
        coLeaderName: formData.coLeaderName,
        address: formData.address || editingPg.address,
        dayOfWeek: formData.dayOfWeek || editingPg.dayOfWeek,
        time: formData.time || editingPg.time,
        frequency: formData.frequency as any || editingPg.frequency,
        maxParticipants: formData.maxParticipants || editingPg.maxParticipants,
        description: formData.description || '',
        status: formData.status as any || editingPg.status,
      };
      saveSmallGroup(updated);
      logAction(currentChurch.id, 'Líder / Admin', 'ADMIN', 'Edição de Pequeno Grupo', updated.name);
      showToast('Pequeno Grupo atualizado com sucesso!', 'success');
    } else {
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
            id: 'p_' + Date.now(),
            name: formData.leaderName,
            phone: formData.leaderPhone || '',
            role: 'líder'
          }
        ],
        createdAt: new Date().toISOString()
      };
      saveSmallGroup(saved);
      logAction(currentChurch.id, 'Líder / Admin', 'ADMIN', 'Criação de Pequeno Grupo', saved.name);
      showToast('Pequeno Grupo criado com sucesso!', 'success');
    }

    setIsFormOpen(false);
    refreshList();
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

  // ==========================================
  // HANDLERS DE PARTICIPANTES
  // ==========================================

  const handleAddParticipant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPg || !newParticipant.name.trim()) return;

    const updatedParticipants: SmallGroupParticipant[] = [
      ...(selectedPg.participants || []),
      {
        id: 'p_' + Date.now(),
        name: newParticipant.name.trim(),
        phone: newParticipant.phone.trim(),
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
    showToast(`Participante "${newParticipant.name}" adicionado ao PG!`, 'success');
    setIsAddParticipantOpen(false);
    setNewParticipant({ name: '', phone: '', role: 'participante' });
    refreshList();
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

  // ==========================================
  // HANDLERS DE REUNIÃO E CHAMADA DE FREQUÊNCIA
  // ==========================================

  const handleOpenMeetingModal = (pg: SmallGroup) => {
    setSelectedPg(pg);

    // Inicializa a chamada com todos os participantes marcados como PRESENTES por padrão
    const initialAttendance: Record<string, boolean> = {};
    (pg.participants || []).forEach(p => {
      initialAttendance[p.id] = true;
    });
    setAttendanceMap(initialAttendance);
    setVisitorsList([]);
    setNewVisitorInput('');

    setMeetingForm({
      date: new Date().toISOString().split('T')[0],
      time: pg.time || '19:30',
      topic: '',
      biblicalText: '',
      prayerRequests: '',
      notes: ''
    });

    setIsMeetingModalOpen(true);
  };

  const handleMarkAllAttendance = (isPresent: boolean) => {
    if (!selectedPg) return;
    const updated: Record<string, boolean> = {};
    (selectedPg.participants || []).forEach(p => {
      updated[p.id] = isPresent;
    });
    setAttendanceMap(updated);
  };

  const handleToggleAttendance = (participantId: string) => {
    setAttendanceMap(prev => ({
      ...prev,
      [participantId]: !prev[participantId]
    }));
  };

  const handleAddVisitor = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = newVisitorInput.trim();
    if (!clean) return;
    setVisitorsList(prev => [...prev, clean]);
    setNewVisitorInput('');
  };

  const handleRemoveVisitor = (index: number) => {
    setVisitorsList(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveMeetingSubmit = (openWhatsAppAfter: boolean = false) => {
    if (!selectedPg) return;

    const attendees: string[] = [];
    const absentees: string[] = [];

    (selectedPg.participants || []).forEach(p => {
      if (attendanceMap[p.id] !== false) {
        attendees.push(p.name);
      } else {
        absentees.push(p.name);
      }
    });

    const newMeeting: SmallGroupMeeting = {
      id: 'meet_' + Date.now(),
      churchId: currentChurch.id,
      smallGroupId: selectedPg.id,
      leaderName: selectedPg.leaderName,
      date: meetingForm.date,
      time: meetingForm.time,
      topic: meetingForm.topic.trim(),
      biblicalText: meetingForm.biblicalText.trim(),
      presentCount: attendees.length + visitorsList.length,
      attendees,
      absentees,
      visitors: visitorsList,
      prayerRequests: meetingForm.prayerRequests.trim(),
      notes: meetingForm.notes.trim(),
      createdAt: new Date().toISOString()
    };

    saveSmallGroupMeeting(newMeeting);
    logAction(
      currentChurch.id, 
      'Líder / Admin', 
      'LIDER_PG', 
      'Registro de Reunião e Frequência do PG', 
      `${selectedPg.name} - ${meetingForm.date}`
    );
    showToast(`Chamada e reunião do ${selectedPg.name} salvas com sucesso!`, 'success');
    refreshList();
    setIsMeetingModalOpen(false);

    if (openWhatsAppAfter) {
      handleOpenReportReview(selectedPg, newMeeting);
    }
  };

  // ==========================================
  // HANDLERS DO RELATÓRIO WHATSAPP
  // ==========================================

  const handleOpenReportReview = (pg: SmallGroup, meeting: SmallGroupMeeting) => {
    setSelectedPg(pg);
    setActiveMeetingForReport(meeting);
    const text = generateWhatsAppReport(currentChurch, pg, meeting);
    setReportText(text);

    if (currentChurch.smallGroupsCoordinatorWhatsapp) {
      setReportDestination('coordinator');
    } else {
      setReportDestination('pastor');
    }
    setCustomReportPhone('');
    setIsReportReviewOpen(true);
  };

  const handleDispatchWhatsApp = () => {
    let targetPhone = '';
    if (reportDestination === 'pastor') {
      targetPhone = currentChurch.pastorWhatsapp || currentChurch.whatsapp || '';
    } else if (reportDestination === 'coordinator') {
      targetPhone = currentChurch.smallGroupsCoordinatorWhatsapp || currentChurch.pastorWhatsapp || currentChurch.whatsapp || '';
    } else {
      targetPhone = customReportPhone;
    }

    if (!targetPhone || !targetPhone.trim()) {
      showToast('Informe o número de WhatsApp de destino.', 'error');
      return;
    }

    openWhatsApp(targetPhone, reportText);
    showToast('WhatsApp aberto com o relatório!', 'success');
    setIsReportReviewOpen(false);
  };

  const handleCopyReport = () => {
    navigator.clipboard.writeText(reportText);
    showToast('Relatório copiado para a área de transferência!', 'success');
  };

  // ==========================================
  // HANDLERS DO HISTÓRICO
  // ==========================================

  const handleOpenHistoryModal = (pg: SmallGroup) => {
    setSelectedPg(pg);
    setIsHistoryModalOpen(true);
  };

  const handleDeleteMeetingConfirm = () => {
    if (meetingToDelete) {
      deleteSmallGroupMeeting(meetingToDelete.id);
      showToast('Reunião removida do histórico.', 'success');
      setMeetingToDelete(null);
      refreshList();
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Topo do Módulo */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-3">
            <Flame className="w-6 h-6 text-orange-500" />
            <span>Pequenos Grupos (PGs)</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {currentChurch.name} • Comunhão nos lares, chamada de frequência e discipulado
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              exportSmallGroupsToExcel(currentChurch, pgs);
              showToast('Pequenos grupos exportados em Excel com sucesso!', 'success');
            }}
            title="Baixar lista em planilha Excel"
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Baixar em Excel</span>
          </button>

          <button
            onClick={handleOpenNew}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs sm:text-sm font-bold shadow-lg shadow-orange-500/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Novo Pequeno Grupo</span>
          </button>
        </div>
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
          {pgs.map(pg => {
            const pgMeetings = meetings.filter(m => m.smallGroupId === pg.id);
            const latestMeeting = pgMeetings.length > 0
              ? [...pgMeetings].sort((a, b) => b.date.localeCompare(a.date))[0]
              : null;

            return (
              <div
                key={pg.id}
                className="p-6 rounded-3xl bg-white border border-slate-200/90 hover:border-orange-300 hover:shadow-md transition-all shadow-sm flex flex-col justify-between"
              >
                <div>
                  {/* Topo do Card */}
                  <div className="flex items-start justify-between pb-3 mb-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 border border-orange-200 flex items-center justify-center shrink-0">
                        <Flame className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-base text-slate-900 leading-tight">{pg.name}</h3>
                        <p className="text-xs text-orange-600 font-semibold mt-0.5">
                          Líder: {pg.leaderName} {pg.coLeaderName && `• Co-líder: ${pg.coLeaderName}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {pg.status}
                      </span>
                      <button
                        onClick={() => handleOpenEdit(pg)}
                        className="p-1.5 rounded-xl hover:bg-sky-50 text-slate-400 hover:text-sky-600 transition-colors"
                        title="Editar Pequeno Grupo"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setPgToDelete(pg)}
                        className="p-1.5 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                        title="Excluir Pequeno Grupo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Informações Gerais */}
                  <div className="space-y-2 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{pg.dayOfWeek} às {pg.time} ({pg.frequency})</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{pg.address}</span>
                    </div>

                    {pg.description && (
                      <p className="text-[11px] text-slate-500 italic pt-1">
                        "{pg.description}"
                      </p>
                    )}

                    {/* Último Encontro / Frequência */}
                    {latestMeeting && (
                      <div className="p-2.5 rounded-xl bg-orange-50/60 border border-orange-100 text-[11px] text-orange-950 flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Último encontro: <strong>{latestMeeting.date.split('-').reverse().join('/')}</strong></span>
                        </div>
                        <span className="font-semibold text-orange-800">
                          {latestMeeting.presentCount} presentes
                        </span>
                      </div>
                    )}

                    {/* Participantes */}
                    <div className="mt-3 pt-3 border-t border-slate-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-slate-700 text-xs">
                          Membros Registrados ({pg.participants?.length || 0}):
                        </span>
                        <button
                          onClick={() => {
                            setSelectedPg(pg);
                            setIsAddParticipantOpen(true);
                          }}
                          className="text-[11px] font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Adicionar membro</span>
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                        {(pg.participants || []).length === 0 ? (
                          <span className="text-xs text-slate-400 italic">Nenhum membro cadastrado</span>
                        ) : (
                          (pg.participants || []).map(p => (
                            <span
                              key={p.id}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-700 group shadow-2xs"
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
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rodapé de Ações do Card */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <WhatsAppButton
                      phone={pg.leaderPhone}
                      message={`Olá, ${pg.leaderName}! Passando para saber como estão os preparativos para o encontro do ${pg.name}.`}
                      label="Falar com Líder"
                      size="sm"
                      variant="outline"
                    />

                    <button
                      type="button"
                      onClick={() => handleOpenHistoryModal(pg)}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-200 shadow-2xs"
                      title="Ver histórico de chamadas e relatórios"
                    >
                      <History className="w-3.5 h-3.5 text-slate-600" />
                      <span>Histórico ({pgMeetings.length})</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenMeetingModal(pg)}
                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                    title="Fazer chamada de presença e registrar reunião"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Chamada & Reunião</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 1: REGISTRO DE REUNIÃO E CHAMADA DE FREQUÊNCIA    */}
      {/* ======================================================== */}
      {isMeetingModalOpen && selectedPg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-3xl bg-white border border-slate-200 shadow-2xl p-5 sm:p-6 text-slate-800 my-8">
            <button
              onClick={() => setIsMeetingModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Cabeçalho */}
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center shadow-xs shrink-0">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 leading-tight">
                  Chamada de Frequência & Reunião do PG
                </h3>
                <p className="text-xs text-orange-600 font-semibold mt-0.5">
                  {selectedPg.name} • Líder: {selectedPg.leaderName}
                </p>
              </div>
            </div>

            {/* 1. DADOS DO ENCONTRO */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Data da Reunião *</label>
                <input
                  type="date"
                  value={meetingForm.date}
                  onChange={e => setMeetingForm({ ...meetingForm, date: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm outline-none focus:bg-white focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Horário *</label>
                <input
                  type="time"
                  value={meetingForm.time}
                  onChange={e => setMeetingForm({ ...meetingForm, time: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm outline-none focus:bg-white focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tema / Estudo Ministrado</label>
                <input
                  type="text"
                  placeholder="Ex: Vivendo o Amor Fraternal"
                  value={meetingForm.topic}
                  onChange={e => setMeetingForm({ ...meetingForm, topic: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm outline-none focus:bg-white focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Texto Bíblico</label>
                <input
                  type="text"
                  placeholder="Ex: Romanos 12:9-21"
                  value={meetingForm.biblicalText}
                  onChange={e => setMeetingForm({ ...meetingForm, biblicalText: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm outline-none focus:bg-white focus:border-orange-500"
                />
              </div>
            </div>

            {/* 2. CHAMADA NOMINAL DE MEMBROS */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 mb-4 space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200/70">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-orange-600" />
                    <span>Chamada dos Membros ({selectedPg.participants?.length || 0})</span>
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Marque como Presente ou Faltante no dia do encontro:
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleMarkAllAttendance(true)}
                    className="px-2.5 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-[11px] font-bold transition-colors"
                  >
                    ✓ Todos Presentes
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMarkAllAttendance(false)}
                    className="px-2.5 py-1 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-800 text-[11px] font-bold transition-colors"
                  >
                    ✕ Todos Faltantes
                  </button>
                </div>
              </div>

              {/* Lista dos Membros do PG */}
              <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                {(selectedPg.participants || []).length === 0 ? (
                  <p className="text-xs text-slate-400 italic text-center py-2">
                    Nenhum membro cadastrado neste grupo. Feche este modal e adicione os membros primeiro.
                  </p>
                ) : (
                  (selectedPg.participants || []).map(p => {
                    const isPresent = attendanceMap[p.id] !== false;

                    return (
                      <div
                        key={p.id}
                        className={`flex items-center justify-between p-2 rounded-xl border transition-all text-xs ${
                          isPresent
                            ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                            : 'bg-rose-50/70 border-rose-200 text-rose-950'
                        }`}
                      >
                        <div className="min-w-0 flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${isPresent ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                          <span className="font-semibold truncate">{p.name}</span>
                          <span className="text-[10px] text-slate-400 capitalize">({p.role})</span>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleToggleAttendance(p.id)}
                            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-all ${
                              isPresent
                                ? 'bg-emerald-600 text-white shadow-2xs'
                                : 'bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            <Check className="w-3 h-3" />
                            <span>Presente</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleAttendance(p.id)}
                            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-all ${
                              !isPresent
                                ? 'bg-rose-600 text-white shadow-2xs'
                                : 'bg-white hover:bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            <X className="w-3 h-3" />
                            <span>Faltante</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* 3. VISITANTES */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 mb-4 space-y-2">
              <label className="block text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Visitantes no Encontro ({visitorsList.length})</span>
              </label>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nome do visitante que compareceu hoje..."
                  value={newVisitorInput}
                  onChange={e => setNewVisitorInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddVisitor();
                    }
                  }}
                  className="flex-1 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 outline-none focus:border-orange-500"
                />
                <button
                  type="button"
                  onClick={() => handleAddVisitor()}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-colors"
                >
                  + Adicionar
                </button>
              </div>

              {visitorsList.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {visitorsList.map((vis, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-100 text-amber-900 text-xs font-semibold"
                    >
                      <span>{vis}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveVisitor(idx)}
                        className="text-amber-700 hover:text-rose-600 p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* 4. PEDIDOS DE ORAÇÃO & OBSERVAÇÕES */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5 text-rose-500" />
                  <span>Pedidos de Oração Levantados</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Oração pela saúde de Maria, emprego para José..."
                  value={meetingForm.prayerRequests}
                  onChange={e => setMeetingForm({ ...meetingForm, prayerRequests: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs outline-none focus:bg-white focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-sky-500" />
                  <span>Observações & Testemunhos</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Reunião muito abençoada, comunhão calorosa..."
                  value={meetingForm.notes}
                  onChange={e => setMeetingForm({ ...meetingForm, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs outline-none focus:bg-white focus:border-orange-500"
                />
              </div>
            </div>

            {/* Barra Inferior com Resumo & Botões de Ação */}
            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-slate-600 font-medium">
                {(() => {
                  const pCount = (selectedPg.participants || []).filter(p => attendanceMap[p.id] !== false).length;
                  const fCount = (selectedPg.participants || []).filter(p => attendanceMap[p.id] === false).length;
                  const total = pCount + visitorsList.length;
                  return (
                    <span>
                      Presentes: <strong className="text-emerald-700">{pCount}</strong> • Faltantes: <strong className="text-rose-700">{fCount}</strong> • Visitantes: <strong className="text-amber-700">{visitorsList.length}</strong> (Total: <strong>{total}</strong>)
                    </span>
                  );
                })()}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsMeetingModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveMeetingSubmit(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition-all"
                >
                  Salvar Reunião
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveMeetingSubmit(true)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Salvar & Enviar no WhatsApp</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: REVISÃO E ENVIO DO RELATÓRIO NO WHATSAPP       */}
      {/* ======================================================== */}
      {isReportReviewOpen && selectedPg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-xl rounded-3xl bg-white border border-slate-200 shadow-2xl p-5 sm:p-6 text-slate-800">
            <button
              onClick={() => setIsReportReviewOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-3 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-xs shrink-0">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 leading-tight">
                  Enviar Relatório de Reunião no WhatsApp
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Revise o texto estruturado e selecione para quem enviar
                </p>
              </div>
            </div>

            {/* Destinatário */}
            <div className="space-y-2 mb-3">
              <label className="block text-xs font-bold text-slate-800">
                Para quem você quer enviar este relatório?
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setReportDestination('pastor')}
                  className={`p-2.5 rounded-xl border text-left transition-all text-xs ${
                    reportDestination === 'pastor'
                      ? 'bg-emerald-50 border-emerald-400 font-bold text-emerald-950 shadow-2xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>Pastor Titular</span>
                    {reportDestination === 'pastor' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                  </div>
                  <div className="text-[10px] text-slate-500 font-normal truncate mt-0.5">
                    {currentChurch.pastorName || 'Pastor'}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setReportDestination('coordinator')}
                  className={`p-2.5 rounded-xl border text-left transition-all text-xs ${
                    reportDestination === 'coordinator'
                      ? 'bg-emerald-50 border-emerald-400 font-bold text-emerald-950 shadow-2xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>Coord. Geral PG</span>
                    {reportDestination === 'coordinator' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                  </div>
                  <div className="text-[10px] text-slate-500 font-normal truncate mt-0.5">
                    {currentChurch.smallGroupsCoordinatorName || 'Coordenador'}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setReportDestination('custom')}
                  className={`p-2.5 rounded-xl border text-left transition-all text-xs ${
                    reportDestination === 'custom'
                      ? 'bg-emerald-50 border-emerald-400 font-bold text-emerald-950 shadow-2xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>Outro Número</span>
                    {reportDestination === 'custom' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                  </div>
                  <div className="text-[10px] text-slate-500 font-normal mt-0.5">
                    Digitar telefone
                  </div>
                </button>
              </div>

              {reportDestination === 'custom' && (
                <div className="pt-1">
                  <input
                    type="text"
                    placeholder="Digite o número com DDD (Ex: 82999998888)..."
                    value={customReportPhone}
                    onChange={e => setCustomReportPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 outline-none focus:bg-white focus:border-emerald-500"
                  />
                </div>
              )}
            </div>

            {/* Textarea com o Relatório Formatado */}
            <div className="space-y-1 mb-4">
              <label className="block text-xs font-semibold text-slate-700 flex items-center justify-between">
                <span>Texto do Relatório (Editável se desejar):</span>
                <span className="text-[10px] text-slate-400 font-normal">Formatado para WhatsApp</span>
              </label>
              <textarea
                rows={10}
                value={reportText}
                onChange={e => setReportText(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-800 outline-none focus:bg-white focus:border-emerald-500 leading-relaxed"
              />
            </div>

            {/* Ações */}
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={handleCopyReport}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar Texto</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsReportReviewOpen(false)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs font-semibold"
                >
                  Fechar
                </button>
                <button
                  type="button"
                  onClick={handleDispatchWhatsApp}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Enviar no WhatsApp</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: HISTÓRICO DE REUNIÕES DO PEQUENO GRUPO         */}
      {/* ======================================================== */}
      {isHistoryModalOpen && selectedPg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-3xl bg-white border border-slate-200 shadow-2xl p-5 sm:p-6 text-slate-800 my-8">
            <button
              onClick={() => setIsHistoryModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center shadow-xs shrink-0">
                <History className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 leading-tight">
                  Histórico de Reuniões & Frequências
                </h3>
                <p className="text-xs text-orange-600 font-semibold mt-0.5">
                  {selectedPg.name}
                </p>
              </div>
            </div>

            {/* Lista de Reuniões */}
            {(() => {
              const pgMeetings = meetings
                .filter(m => m.smallGroupId === selectedPg.id)
                .sort((a, b) => b.date.localeCompare(a.date));

              if (pgMeetings.length === 0) {
                return (
                  <div className="p-8 text-center rounded-2xl bg-slate-50 border border-slate-100 text-slate-500">
                    <History className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs font-semibold">Nenhuma reunião registrada neste PG ainda.</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Clique em "Chamada & Reunião" no card do grupo para registrar o primeiro encontro.
                    </p>
                  </div>
                );
              }

              return (
                <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                  {pgMeetings.map(meeting => (
                    <div
                      key={meeting.id}
                      className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/90 space-y-2.5 shadow-2xs hover:border-orange-200 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-slate-200/60">
                        <div>
                          <div className="font-bold text-xs text-slate-900 flex items-center gap-2">
                            <span>📅 {meeting.date.split('-').reverse().join('/')} às {meeting.time}</span>
                            {meeting.topic && (
                              <span className="text-orange-700 font-medium truncate">• {meeting.topic}</span>
                            )}
                          </div>
                          {meeting.biblicalText && (
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              Texto: {meeting.biblicalText}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                          <button
                            type="button"
                            onClick={() => handleOpenReportReview(selectedPg, meeting)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition-all shadow-2xs"
                            title="Reenviar relatório no WhatsApp"
                          >
                            <Send className="w-3 h-3" />
                            <span>WhatsApp</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setMeetingToDelete(meeting)}
                            className="p-1 rounded-lg hover:bg-rose-100 text-slate-400 hover:text-rose-600 transition-colors"
                            title="Excluir reunião"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Resumo Numérico */}
                      <div className="grid grid-cols-3 gap-2 text-[11px]">
                        <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-950 text-center">
                          <span className="block font-bold text-xs text-emerald-700">{meeting.attendees?.length || 0}</span>
                          <span className="text-[10px]">Presentes</span>
                        </div>
                        <div className="p-2 rounded-xl bg-rose-50 border border-rose-100 text-rose-950 text-center">
                          <span className="block font-bold text-xs text-rose-700">{meeting.absentees?.length || 0}</span>
                          <span className="text-[10px]">Faltantes</span>
                        </div>
                        <div className="p-2 rounded-xl bg-amber-50 border border-amber-100 text-amber-950 text-center">
                          <span className="block font-bold text-xs text-amber-700">{meeting.visitors?.length || 0}</span>
                          <span className="text-[10px]">Visitantes</span>
                        </div>
                      </div>

                      {/* Faltantes para Acompanhamento */}
                      {(meeting.absentees || []).length > 0 && (
                        <div className="text-[11px] text-slate-600">
                          <span className="font-semibold text-rose-700">Faltantes: </span>
                          <span>{meeting.absentees.join(', ')}</span>
                        </div>
                      )}

                      {/* Visitantes */}
                      {(meeting.visitors || []).length > 0 && (
                        <div className="text-[11px] text-slate-600">
                          <span className="font-semibold text-amber-700">Visitantes: </span>
                          <span>{meeting.visitors.join(', ')}</span>
                        </div>
                      )}

                      {/* Pedidos de Oração */}
                      {meeting.prayerRequests && (
                        <p className="text-[11px] text-slate-500 italic bg-white p-2 rounded-xl border border-slate-100">
                          🙏 <strong>Oração:</strong> {meeting.prayerRequests}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              );
            })()}

            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setIsHistoryModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs font-semibold"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 4: ADICIONAR PARTICIPANTE AO PG                    */}
      {/* ======================================================== */}
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
              Adicionar Membro ao {selectedPg.name}
            </h3>

            <form onSubmit={handleAddParticipant} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Nome do membro ou participante"
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

      {/* ======================================================== */}
      {/* MODAL 5: CRIAR / EDITAR PEQUENO GRUPO                    */}
      {/* ======================================================== */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 text-slate-800">
            <button
              onClick={() => setIsFormOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900 mb-4">
              {editingPg ? 'Editar Pequeno Grupo' : 'Novo Pequeno Grupo (PG)'}
            </h3>

            <form onSubmit={handleSavePg} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nome do PG *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Conexão / Pequeno Grupo Esperança"
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
                    <option value="Domingo">Domingo</option>
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

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Descrição / Observações</label>
                <textarea
                  rows={2}
                  placeholder="Propósito, faixa etária ou detalhes do grupo..."
                  value={formData.description || ''}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
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

      {/* ======================================================== */}
      {/* MODAL 6: CONFIRMAÇÕES DE EXCLUSÃO                        */}
      {/* ======================================================== */}
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

      {meetingToDelete && (
        <ConfirmModal
          isOpen={true}
          title="Excluir Registro de Reunião"
          message={`Tem certeza que deseja apagar o registro da reunião do dia ${meetingToDelete.date.split('-').reverse().join('/')}? Esta ação não pode ser desfeita.`}
          confirmLabel="Excluir Reunião"
          confirmVariant="danger"
          onConfirm={handleDeleteMeetingConfirm}
          onCancel={() => setMeetingToDelete(null)}
        />
      )}
    </div>
  );
};
