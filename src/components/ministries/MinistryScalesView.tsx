import React, { useState, useEffect } from 'react';
import { 
  CalendarCheck, 
  Plus, 
  MessageCircle, 
  Users, 
  Calendar, 
  Clock, 
  Phone, 
  Trash2, 
  Edit3, 
  X, 
  Save, 
  Copy, 
  Check, 
  FileSpreadsheet, 
  UserCheck, 
  Sparkles,
  AlertCircle,
  RotateCcw
} from 'lucide-react';
import { MinistryScale, ScaleMemberItem, Ministry, Member } from '../../types';
import { useChurch, useDataSync } from '../../context/ChurchContext';
import { useNotification } from '../../context/NotificationContext';
import { MaskedInput } from '../common/MaskedInput';
import { ConfirmModal } from '../common/ConfirmModal';
import { 
  getMinistryScales, 
  saveMinistryScale, 
  deleteMinistryScale, 
  getMinistries, 
  getMembers,
  logAction 
} from '../../services/storage';
import { exportMinistryScalesToExcel } from '../../services/excelBackup';

interface MinistryScalesViewProps {
  onNavigateToMinistries?: () => void;
}

export const MinistryScalesView: React.FC<MinistryScalesViewProps> = ({ onNavigateToMinistries }) => {
  const { currentChurch } = useChurch();
  const { showToast } = useNotification();

  const [scales, setScales] = useState<MinistryScale[]>(() => getMinistryScales(currentChurch.id));
  const [ministries, setMinistries] = useState<Ministry[]>(() => getMinistries(currentChurch.id));
  const [churchMembers, setChurchMembers] = useState<Member[]>(() => getMembers(currentChurch.id));

  // Modais de Criação / Edição
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingScaleId, setEditingScaleId] = useState<string | null>(null);
  const [scaleToDelete, setScaleToDelete] = useState<MinistryScale | null>(null);

  // Modal para revisar e editar a mensagem de envio da escala no WhatsApp
  const [sendPromptModal, setSendPromptModal] = useState<{
    scale: MinistryScale;
    mode: 'leader' | 'group';
    targetPhone: string;
    messageText: string;
    originalMessage: string;
  } | null>(null);

  // Estado do formulário
  const [selectedMinistryId, setSelectedMinistryId] = useState<string>('');
  const [scaleDate, setScaleDate] = useState<string>('');
  const [scaleTime, setScaleTime] = useState<string>('18:30');
  const [scaleTitle, setScaleTitle] = useState<string>('');
  const [leaderName, setLeaderName] = useState<string>('');
  const [leaderPhone, setLeaderPhone] = useState<string>('');
  const [membersList, setMembersList] = useState<ScaleMemberItem[]>([]);
  const [scaleNotes, setScaleNotes] = useState<string>('');

  // Campos para adicionar novo membro na escala
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('');

  // Filtro na listagem
  const [filterMinistry, setFilterMinistry] = useState<string>('todos');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const refreshAll = () => {
    setScales(getMinistryScales(currentChurch.id));
    setMinistries(getMinistries(currentChurch.id));
    setChurchMembers(getMembers(currentChurch.id));
  };

  useDataSync(refreshAll, [currentChurch.id]);

  // Função auxiliar para calcular próximo domingo
  const getNextSunday = (): string => {
    const today = new Date();
    const day = today.getDay();
    const diff = (7 - day) % 7;
    const nextSunday = new Date(today);
    nextSunday.setDate(today.getDate() + (diff === 0 ? 0 : diff));
    return nextSunday.toISOString().split('T')[0];
  };

  const openNewScaleModal = () => {
    setEditingScaleId(null);
    const defaultMin = ministries.length > 0 ? ministries[0] : null;

    setSelectedMinistryId(defaultMin ? defaultMin.id : '');
    setScaleDate(getNextSunday());
    setScaleTime('18:30');
    setScaleTitle('Culto de Celebração de Domingo');
    setLeaderName(defaultMin ? defaultMin.leaderName : '');
    setLeaderPhone(defaultMin ? (defaultMin.leaderPhone || '') : '');
    setMembersList(
      defaultMin && defaultMin.members && defaultMin.members.length > 0
        ? defaultMin.members.slice(0, 4).map((name, i) => ({ id: String(i + 1), name, role: '' }))
        : []
    );
    setScaleNotes('');
    setNewMemberName('');
    setNewMemberRole('');
    setIsModalOpen(true);
  };

  const openEditScaleModal = (s: MinistryScale) => {
    setEditingScaleId(s.id);
    setSelectedMinistryId(s.ministryId);
    setScaleDate(s.date);
    setScaleTime(s.time || '18:30');
    setScaleTitle(s.title || '');
    setLeaderName(s.leaderName);
    setLeaderPhone(s.leaderPhone || '');
    setMembersList(
      (s.members || []).map((m, idx) => 
        typeof m === 'string' ? { id: String(idx + 1), name: m, role: '' } : m
      )
    );
    setScaleNotes(s.notes || '');
    setNewMemberName('');
    setNewMemberRole('');
    setIsModalOpen(true);
  };

  // Quando o usuário seleciona outro ministério no dropdown
  const handleMinistrySelect = (ministryId: string) => {
    setSelectedMinistryId(ministryId);
    const found = ministries.find(m => m.id === ministryId);
    if (found) {
      setLeaderName(found.leaderName || '');
      setLeaderPhone(found.leaderPhone || '');
      // Se não havia membros, sugere os primeiros membros do ministério
      if (membersList.length === 0 && found.members && found.members.length > 0) {
        setMembersList(found.members.slice(0, 5).map((name, i) => ({ id: String(i + 1), name, role: '' })));
      }
    }
  };

  // Adicionar membro à escala
  const handleAddMember = () => {
    const trimmed = newMemberName.trim();
    if (!trimmed) {
      showToast('Digite o nome do integrante.', 'info');
      return;
    }
    if (membersList.some(m => m.name.toLowerCase() === trimmed.toLowerCase())) {
      showToast('Este integrante já foi adicionado à escala.', 'info');
      return;
    }

    setMembersList([
      ...membersList,
      {
        id: 'sm_' + Date.now() + Math.random(),
        name: trimmed,
        role: newMemberRole.trim() || undefined
      }
    ]);
    setNewMemberName('');
    setNewMemberRole('');
  };

  // Adicionar membro rapidamente via chip do ministério selecionado
  const handleQuickAddMinistryMember = (memberName: string) => {
    if (membersList.some(m => m.name.toLowerCase() === memberName.toLowerCase())) {
      // Se já está na escala, remove
      setMembersList(membersList.filter(m => m.name.toLowerCase() !== memberName.toLowerCase()));
      showToast(`${memberName} removido da escala.`, 'info');
    } else {
      // Se não está, adiciona
      setMembersList([
        ...membersList,
        { id: 'sm_' + Date.now() + Math.random(), name: memberName, role: '' }
      ]);
      showToast(`${memberName} adicionado à escala!`, 'success');
    }
  };

  const handleRemoveMember = (idOrIndex: string | number) => {
    setMembersList(membersList.filter((m, idx) => m.id !== idOrIndex && idx !== idOrIndex));
  };

  const handleUpdateMemberRole = (index: number, newRole: string) => {
    const updated = [...membersList];
    updated[index].role = newRole;
    setMembersList(updated);
  };

  // Salvar a escala
  const handleSaveScale = (e?: React.FormEvent): MinistryScale | null => {
    if (e) e.preventDefault();

    if (!selectedMinistryId) {
      showToast('Selecione o ministério na lista suspensa.', 'error');
      return null;
    }

    const min = ministries.find(m => m.id === selectedMinistryId);
    const minName = min ? min.name : 'Ministério';

    if (!leaderName.trim()) {
      showToast('Informe o nome do líder da escala.', 'error');
      return null;
    }

    if (!scaleDate) {
      showToast('Informe a data da escala.', 'error');
      return null;
    }

    if (membersList.length === 0) {
      showToast('Adicione pelo menos 1 membro à escala.', 'info');
      return null;
    }

    const saved: MinistryScale = {
      id: editingScaleId || ('scale_' + Date.now()),
      churchId: currentChurch.id,
      ministryId: selectedMinistryId,
      ministryName: minName,
      date: scaleDate,
      time: scaleTime || '18:30',
      title: scaleTitle.trim() || undefined,
      leaderName: leaderName.trim(),
      leaderPhone: leaderPhone.trim(),
      members: membersList,
      notes: scaleNotes.trim() || undefined,
      createdAt: new Date().toISOString()
    };

    saveMinistryScale(saved);
    logAction(
      currentChurch.id, 
      'Administrador', 
      'ADMIN', 
      editingScaleId ? 'Escala Ministerial Atualizada' : 'Nova Escala Criada', 
      `${minName} - ${scaleDate}`
    );
    showToast(editingScaleId ? 'Escala atualizada com sucesso!' : 'Escala criada e salva com sucesso!', 'success');
    setIsModalOpen(false);
    refreshAll();
    return saved;
  };

  // Gerador de mensagem formatada para WhatsApp
  const generateWhatsAppText = (scale: MinistryScale): string => {
    const dateFormatted = scale.date.split('-').reverse().join('/');
    
    let text = `📋 *ESCALA MINISTERIAL*\n`;
    text += `⛪ *${currentChurch.name.toUpperCase()}*\n\n`;
    text += `🔹 *Ministério:* ${scale.ministryName}\n`;
    text += `📅 *Data:* ${dateFormatted}${scale.time ? ` às ${scale.time}` : ''}\n`;
    if (scale.title) {
      text += `🎯 *Culto/Ocasião:* ${scale.title}\n`;
    }
    text += `👤 *Líder Responsável:* ${scale.leaderName}${scale.leaderPhone ? ` (${scale.leaderPhone})` : ''}\n\n`;
    
    text += `👥 *EQUIPE ESCALADA (${scale.members.length} integrantes):*\n`;
    scale.members.forEach((m, idx) => {
      const name = typeof m === 'string' ? m : m.name;
      const role = typeof m !== 'string' && m.role ? ` (${m.role})` : '';
      text += `${idx + 1}. ${name}${role}\n`;
    });

    if (scale.notes) {
      text += `\n📌 *Orientações / Observações:*\n${scale.notes}\n`;
    }

    text += `\n_Mensagem enviada via Gestão Igreja - Plataforma Eclesiástica_`;
    return text;
  };

  // Abrir modal de revisão/edição para o WhatsApp do Líder
  const handleOpenSendLeader = (scale: MinistryScale, destinationPhone?: string) => {
    const rawPhone = destinationPhone !== undefined ? destinationPhone : (scale.leaderPhone || '');
    const text = generateWhatsAppText(scale);
    setSendPromptModal({
      scale,
      mode: 'leader',
      targetPhone: rawPhone,
      messageText: text,
      originalMessage: text
    });
  };

  // Abrir modal de revisão/edição para o Grupo do Ministério no WhatsApp
  const handleOpenSendGroup = (scale: MinistryScale) => {
    const text = generateWhatsAppText(scale);
    setSendPromptModal({
      scale,
      mode: 'group',
      targetPhone: '',
      messageText: text,
      originalMessage: text
    });
  };

  // Executa o disparo no WhatsApp após revisão ou edição
  const executeSendWhatsApp = (
    targetScale: MinistryScale, 
    mode: 'leader' | 'group', 
    phoneValue: string, 
    message: string
  ) => {
    if (mode === 'leader') {
      const cleanPhone = phoneValue.replace(/\D/g, '');
      if (!cleanPhone || cleanPhone.length < 8) {
        showToast('Por favor, informe um número de telefone/WhatsApp válido para o líder.', 'error');
        return;
      }

      // Se o número foi alterado ou preenchido, salva no registro da escala
      if (phoneValue !== targetScale.leaderPhone) {
        const updated = { ...targetScale, leaderPhone: phoneValue };
        saveMinistryScale(updated);
        refreshAll();
      }

      const dddPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
      const url = `https://wa.me/${dddPhone}?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank');
      logAction(currentChurch.id, 'Administrador', 'ADMIN', 'Envio de Escala no WhatsApp', `${targetScale.ministryName} para ${targetScale.leaderName}`);
      showToast(`Abrindo WhatsApp para enviar escala a ${targetScale.leaderName}...`, 'success');
    } else {
      const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank');
      logAction(currentChurch.id, 'Administrador', 'ADMIN', 'Envio de Escala para Grupo do Ministério', `${targetScale.ministryName} (${targetScale.date})`);
      showToast(`Abrindo WhatsApp para compartilhar no Grupo de ${targetScale.ministryName}...`, 'success');
    }

    setSendPromptModal(null);
  };

  // Salvar e abrir modal para o líder imediatamente
  const handleSaveAndSend = () => {
    const saved = handleSaveScale();
    if (saved) {
      handleOpenSendLeader(saved, saved.leaderPhone);
    }
  };

  // Copiar escala formatada para área de transferência
  const handleCopyScale = (scale: MinistryScale) => {
    const text = generateWhatsAppText(scale);
    navigator.clipboard.writeText(text);
    setCopiedId(scale.id);
    showToast('Texto da escala copiado com sucesso!', 'success');
    setTimeout(() => setCopiedId(null), 3000);
  };

  const handleDeleteConfirm = () => {
    if (scaleToDelete) {
      deleteMinistryScale(scaleToDelete.id);
      logAction(currentChurch.id, 'Administrador', 'ADMIN', 'Exclusão de Escala', `${scaleToDelete.ministryName} (${scaleToDelete.date})`);
      showToast('Escala excluída com sucesso.', 'success');
      setScaleToDelete(null);
      refreshAll();
    }
  };

  const currentMinistryObj = ministries.find(m => m.id === selectedMinistryId);

  const filteredScales = scales
    .filter(s => filterMinistry === 'todos' || s.ministryId === filterMinistry)
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Topo do Módulo */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-3">
            <CalendarCheck className="w-6 h-6 text-sky-600" />
            <span>Criar Escala de Ministério</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {currentChurch.name} • Selecione o ministério, organize a equipe e envie para o WhatsApp do líder
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              exportMinistryScalesToExcel(currentChurch, filteredScales);
              showToast('Escalas exportadas em Excel com sucesso!', 'success');
            }}
            title="Baixar lista de escalas em planilha Excel"
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Baixar em Excel</span>
          </button>

          <button
            onClick={openNewScaleModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-sky-500/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Criar Nova Escala</span>
          </button>
        </div>
      </div>

      {/* Alerta se não houver ministérios cadastrados */}
      {ministries.length === 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <p className="font-bold">Nenhum ministério encontrado</p>
            <p className="text-amber-700 mt-0.5">
              Para montar escalas, crie primeiro os ministérios (ex: Louvor, Infantil, Diaconia, Mídia) na aba <strong>Ministérios</strong>. Eles aparecerão automaticamente na lista suspensa aqui.
            </p>
          </div>
        </div>
      )}

      {/* Barra de Filtros */}
      <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700">Filtrar por Ministério:</span>
          <select
            value={filterMinistry}
            onChange={e => setFilterMinistry(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 outline-none focus:border-sky-500"
          >
            <option value="todos">Todos os Ministérios ({scales.length})</option>
            {ministries.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>

        <span className="text-xs text-slate-500 font-medium">
          {filteredScales.length} escala(s) cadastrada(s)
        </span>
      </div>

      {/* Lista de Escalas Criadas */}
      {filteredScales.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 shadow-sm">
          <CalendarCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">Nenhuma escala ministerial cadastrada</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Clique no botão acima <strong>"+ Criar Nova Escala"</strong> para selecionar o ministério, definir o líder, os membros de serviço e disparar no WhatsApp.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredScales.map(s => {
            const dateFormatted = s.date.split('-').reverse().join('/');
            const leaderCleanPhone = (s.leaderPhone || '').replace(/\D/g, '');

            return (
              <div
                key={s.id}
                className="p-6 rounded-3xl bg-white border border-slate-200/90 hover:border-sky-300 hover:shadow-md transition-all shadow-sm flex flex-col justify-between"
              >
                <div>
                  {/* Topo do Card da Escala */}
                  <div className="flex items-start justify-between gap-3 pb-3 mb-3 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-sky-50 text-sky-800 border border-sky-200/80">
                          {s.ministryName}
                        </span>
                        {s.title && (
                          <span className="text-xs font-semibold text-slate-600 truncate max-w-[180px]">
                            {s.title}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-2 font-medium">
                        <span className="flex items-center gap-1.5 font-bold text-slate-700">
                          <Calendar className="w-3.5 h-3.5 text-sky-600" />
                          {dateFormatted}
                        </span>
                        {s.time && (
                          <span className="flex items-center gap-1 font-mono text-slate-600">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {s.time}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleCopyScale(s)}
                        title="Copiar texto da escala"
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                      >
                        {copiedId === s.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => openEditScaleModal(s)}
                        title="Editar escala"
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-sky-50 text-slate-500 hover:text-sky-600 transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setScaleToDelete(s)}
                        title="Excluir escala"
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Informação do Líder e WhatsApp de Envio */}
                  <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-200/70 mb-3 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-600">
                        Líder da Escala: <strong className="text-slate-900">{s.leaderName}</strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-600">
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      <span>WhatsApp para Envio:</span>
                      {s.leaderPhone ? (
                        <strong className="text-emerald-700 font-bold">{s.leaderPhone}</strong>
                      ) : (
                        <span className="text-amber-600 font-medium italic">Não informado</span>
                      )}
                    </div>
                  </div>

                  {/* Integrantes Escalados */}
                  <div className="space-y-2">
                    <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-sky-600" />
                      Equipe Escalada ({s.members?.length || 0}):
                    </span>

                    <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                      {(s.members && s.members.length > 0) ? (
                        s.members.map((m, idx) => {
                          const name = typeof m === 'string' ? m : m.name;
                          const role = typeof m !== 'string' && m.role ? m.role : null;

                          return (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-sky-50 text-sky-900 border border-sky-200/80 text-[11px] font-medium shadow-2xs"
                            >
                              <span className="font-semibold">{name}</span>
                              {role && (
                                <span className="text-[10px] bg-sky-200/70 text-sky-800 px-1.5 py-0.2 rounded font-normal">
                                  {role}
                                </span>
                              )}
                            </span>
                          );
                        })
                      ) : (
                        <span className="text-xs text-slate-400 italic">Nenhum membro escalado</span>
                      )}
                    </div>
                  </div>

                  {/* Observações da Escala */}
                  {s.notes && (
                    <div className="mt-3 pt-2.5 border-t border-slate-100 text-xs text-slate-500 italic">
                      📌 {s.notes}
                    </div>
                  )}
                </div>

                {/* Rodapé do Card com Botões de Disparo */}
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenSendLeader(s)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
                      title={`Revisar mensagem e enviar para o WhatsApp do líder (${s.leaderPhone || 'Cadastrar número'})`}
                    >
                      <MessageCircle className="w-3.5 h-3.5 fill-current" />
                      <span>Enviar p/ Líder ({s.leaderPhone ? s.leaderName.split(' ')[0] : 'WhatsApp'})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenSendLeader(s)}
                      className="px-2.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] font-semibold transition-colors"
                      title="Revisar e editar texto ou número antes de enviar"
                    >
                      Editar / Enviar
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenSendGroup(s)}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold active:scale-95 transition-all"
                    title="Revisar texto e abrir o WhatsApp para compartilhar diretamente no Grupo do Ministério"
                  >
                    <MessageCircle className="w-3.5 h-3.5 fill-current text-emerald-600" />
                    <span>Enviar no Grupo do Ministério no WhatsApp</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL CRIAR / EDITAR ESCALA */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-2xl rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 text-slate-800 max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-sky-600" />
              <span>{editingScaleId ? 'Editar Escala Ministerial' : 'Montar Nova Escala Ministerial'}</span>
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              Selecione o ministério cadastrado, confirme o líder e o número de WhatsApp, e adicione a equipe escalada.
            </p>

            <form onSubmit={e => handleSaveScale(e)} className="space-y-4">
              {/* 1. SELEÇÃO DO MINISTÉRIO (LISTA SUSPENSA) */}
              <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-200/80 space-y-2">
                <label className="block text-xs font-bold text-sky-950">
                  1. Selecionar Ministério (Lista Suspensa) *
                </label>
                <select
                  required
                  value={selectedMinistryId}
                  onChange={e => handleMinistrySelect(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-sky-300 text-slate-900 text-sm font-semibold outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="">-- Selecione o Ministério Cadastrado --</option>
                  {ministries.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name} {m.leaderName ? `(Líder: ${m.leaderName})` : ''}
                    </option>
                  ))}
                </select>

                {currentMinistryObj && (
                  <p className="text-[11px] text-sky-700">
                    ✓ Ministério selecionado: <strong>{currentMinistryObj.name}</strong> • {(currentMinistryObj.members || []).length} integrante(s) cadastrado(s)
                  </p>
                )}
              </div>

              {/* 2. LÍDER DA ESCALA E NÚMERO DE ENVIO */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    2. Líder / Responsável da Escala *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nome do líder da escala..."
                    value={leaderName}
                    onChange={e => setLeaderName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-sm outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-800">
                      Para qual número quer enviar a escala? *
                    </label>
                  </div>
                  <MaskedInput
                    mask="phone"
                    placeholder="(82) 99999-9999"
                    value={leaderPhone}
                    onChange={val => setLeaderPhone(val)}
                  />
                  <p className="text-[10px] text-emerald-700 font-medium mt-1 flex items-center gap-1">
                    <span>💬</span> Número de WhatsApp onde o líder receberá a escala.
                  </p>
                </div>
              </div>

              {/* 3. DATA, HORÁRIO E OCASIÃO */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Data do Culto / Serviço *
                  </label>
                  <input
                    type="date"
                    required
                    value={scaleDate}
                    onChange={e => setScaleDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs outline-none focus:bg-white focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Horário / Turno *
                  </label>
                  <input
                    type="time"
                    required
                    value={scaleTime}
                    onChange={e => setScaleTime(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs outline-none focus:bg-white focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Culto / Ocasião
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Culto Noturno, Celebração..."
                    value={scaleTitle}
                    onChange={e => setScaleTitle(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs outline-none focus:bg-white focus:border-sky-500"
                  />
                </div>
              </div>

              {/* 4. MEMBROS DA ESCALA */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800">
                    3. Integrantes da Escala ({membersList.length}) *
                  </label>
                  <span className="text-[11px] text-slate-500">
                    Clique nos integrantes sugeridos abaixo ou digite novos nomes
                  </span>
                </div>

                {/* Sugestões rápidas de membros do ministério selecionado */}
                {currentMinistryObj && currentMinistryObj.members && currentMinistryObj.members.length > 0 && (
                  <div className="space-y-1.5 bg-white p-3 rounded-xl border border-slate-200/80">
                    <span className="text-[11px] font-bold text-sky-800 block">
                      Integrantes cadastrados em {currentMinistryObj.name} (clique para adicionar/remover):
                    </span>
                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                      {currentMinistryObj.members.map((name, idx) => {
                        const isAdded = membersList.some(m => m.name.toLowerCase() === name.toLowerCase());
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleQuickAddMinistryMember(name)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all border ${
                              isAdded
                                ? 'bg-sky-600 text-white border-sky-600 shadow-2xs'
                                : 'bg-slate-50 hover:bg-sky-50 text-slate-700 border-slate-200'
                            }`}
                          >
                            {isAdded ? `✓ ${name}` : `+ ${name}`}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Campo para adicionar novo membro manualmente */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                  <div className="sm:col-span-6">
                    <input
                      type="text"
                      placeholder="Nome do integrante (ex: Maria Silva)..."
                      value={newMemberName}
                      onChange={e => setNewMemberName(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddMember();
                        }
                      }}
                      className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs outline-none focus:border-sky-500"
                    />
                  </div>
                  <div className="sm:col-span-4">
                    <input
                      type="text"
                      placeholder="Função / Instrumento (opcional)..."
                      value={newMemberRole}
                      onChange={e => setNewMemberRole(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddMember();
                        }
                      }}
                      className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs outline-none focus:border-sky-500"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <button
                      type="button"
                      onClick={handleAddMember}
                      className="w-full py-1.5 px-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-xs active:scale-95 transition-all"
                    >
                      + Incluir
                    </button>
                  </div>
                </div>

                {/* Lista atual dos membros adicionados na escala */}
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {membersList.length === 0 ? (
                    <p className="text-xs text-slate-400 italic text-center py-3 bg-white rounded-xl border border-dashed border-slate-200">
                      Nenhum integrante adicionado. Adicione acima para montar a escala.
                    </p>
                  ) : (
                    membersList.map((item, idx) => (
                      <div
                        key={item.id || idx}
                        className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white border border-slate-200 text-xs shadow-2xs"
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <span className="w-5 h-5 rounded-full bg-sky-100 text-sky-800 font-bold text-[10px] flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <span className="font-bold text-slate-800 truncate">{item.name}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Função / Papel..."
                            value={item.role || ''}
                            onChange={e => handleUpdateMemberRole(idx, e.target.value)}
                            className="px-2 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 text-[11px] w-32 sm:w-40 outline-none focus:bg-white focus:border-sky-500"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveMember(item.id || idx)}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Remover da escala"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* 5. OBSERVAÇÕES DA ESCALA */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Observações / Recomendações
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Passagem de som às 17h30; Chegar com 30min de antecedência; Roupa preta..."
                  value={scaleNotes}
                  onChange={e => setScaleNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs outline-none focus:bg-white focus:border-sky-500"
                />
              </div>

              {/* BOTÕES DE SALVAMENTO E DISPARO */}
              <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs font-semibold"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-sm"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Salvar Escala</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveAndSend}
                  className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  <span>Salvar e Enviar para o Líder</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const saved = handleSaveScale();
                    if (saved) {
                      handleOpenSendGroup(saved);
                    }
                  }}
                  className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold shadow-xs active:scale-95 transition-all"
                  title="Salva a escala e abre o WhatsApp para selecionar o grupo do ministério"
                >
                  <MessageCircle className="w-4 h-4 fill-current text-emerald-600" />
                  <span>Salvar e Enviar no Grupo</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE REVISÃO E EDIÇÃO DA MENSAGEM ANTES DE ENVIAR A ESCALA */}
      {sendPromptModal && (
        <div 
          onClick={() => setSendPromptModal(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in"
        >
          <div 
            onClick={e => e.stopPropagation()}
            className="relative w-full max-w-lg rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 text-slate-800 max-h-[92vh] overflow-y-auto animate-in zoom-in-95 duration-150"
          >
            <button
              onClick={() => setSendPromptModal(null)}
              className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 shadow-sm">
                <MessageCircle className="w-6 h-6 fill-current" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span>Revisar e Enviar Escala</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                    Editável
                  </span>
                </h3>
                <p className="text-xs text-slate-500">
                  {sendPromptModal.scale.ministryName} • {sendPromptModal.scale.date.split('-').reverse().join('/')}
                </p>
              </div>
            </div>

            {/* Alternador de Destino: Enviar p/ Líder vs Enviar no Grupo */}
            <div className="flex p-1 rounded-2xl bg-slate-100 border border-slate-200 mb-4">
              <button
                type="button"
                onClick={() => setSendPromptModal({
                  ...sendPromptModal,
                  mode: 'leader',
                  targetPhone: sendPromptModal.targetPhone || sendPromptModal.scale.leaderPhone || ''
                })}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  sendPromptModal.mode === 'leader'
                    ? 'bg-white text-emerald-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                <span>Enviar para o Líder</span>
              </button>

              <button
                type="button"
                onClick={() => setSendPromptModal({
                  ...sendPromptModal,
                  mode: 'group'
                })}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  sendPromptModal.mode === 'group'
                    ? 'bg-white text-emerald-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Enviar no Grupo</span>
              </button>
            </div>

            <div className="space-y-4">
              {/* Telefone do Líder se modo leader */}
              {sendPromptModal.mode === 'leader' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Número de WhatsApp do Líder ({sendPromptModal.scale.leaderName}) *
                  </label>
                  <MaskedInput
                    mask="phone"
                    placeholder="(82) 99999-9999"
                    value={sendPromptModal.targetPhone}
                    onChange={val => setSendPromptModal({ ...sendPromptModal, targetPhone: val })}
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Você pode alterar o número acima caso o líder use outro WhatsApp.
                  </p>
                </div>
              )}

              {sendPromptModal.mode === 'group' && (
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>Ao clicar em enviar, o WhatsApp abrirá seu seletor de conversas para você escolher o <strong>Grupo do {sendPromptModal.scale.ministryName}</strong>.</span>
                </div>
              )}

              {/* Mensagem Editável */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Edit3 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Texto da Escala (você pode editar ou acrescentar avisos):</span>
                  </label>
                  {sendPromptModal.messageText !== sendPromptModal.originalMessage && (
                    <button
                      type="button"
                      onClick={() => setSendPromptModal({
                        ...sendPromptModal,
                        messageText: sendPromptModal.originalMessage
                      })}
                      className="text-[11px] font-semibold text-slate-500 hover:text-emerald-700 flex items-center gap-1 transition-colors"
                      title="Voltar ao texto original gerado automaticamente"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Restaurar original
                    </button>
                  )}
                </div>
                <textarea
                  rows={8}
                  value={sendPromptModal.messageText}
                  onChange={e => setSendPromptModal({ ...sendPromptModal, messageText: e.target.value })}
                  className="w-full p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-mono leading-relaxed outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all resize-y shadow-inner"
                />
                <p className="text-[11px] text-slate-400 mt-1 flex justify-between">
                  <span>💡 Você tem total liberdade para editar os textos antes do disparo.</span>
                  <span>{sendPromptModal.messageText.length} caracteres</span>
                </p>
              </div>

              {/* Botões de Ação */}
              <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSendPromptModal(null)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs font-semibold"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(sendPromptModal.messageText);
                    setCopiedId(sendPromptModal.scale.id);
                    showToast('Texto da escala copiado com sucesso!', 'success');
                    setTimeout(() => setCopiedId(null), 3000);
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  {copiedId === sendPromptModal.scale.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === sendPromptModal.scale.id ? 'Copiado!' : 'Copiar Texto'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    executeSendWhatsApp(
                      sendPromptModal.scale,
                      sendPromptModal.mode,
                      sendPromptModal.targetPhone,
                      sendPromptModal.messageText
                    );
                  }}
                  className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  <span>Abrir WhatsApp e Enviar</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO */}
      {scaleToDelete && (
        <ConfirmModal
          isOpen={true}
          title="Excluir Escala Ministerial"
          message={`Tem certeza que deseja excluir a escala de "${scaleToDelete.ministryName}" do dia ${scaleToDelete.date.split('-').reverse().join('/')}? Esta ação não pode ser desfeita.`}
          confirmLabel="Excluir"
          confirmVariant="danger"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setScaleToDelete(null)}
        />
      )}
    </div>
  );
};
