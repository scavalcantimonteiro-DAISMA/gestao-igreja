import React, { useState } from 'react';
import { FileText, Copy, Check, MessageCircle, X, Calendar, Clock, Users, Send, Church, Sparkles } from 'lucide-react';
import { useChurch } from '../../context/ChurchContext';
import { useNotification } from '../../context/NotificationContext';
import { 
  getBirthdays, 
  getWeddingAnniversaries, 
  getPastoralAppointments, 
  getSchedules,
  getEvents,
  getMinistries
} from '../../services/storage';

interface DailyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMinistryId?: string;
}

export const DailyReportModal: React.FC<DailyReportModalProps> = ({ 
  isOpen, 
  onClose,
  initialMinistryId 
}) => {
  const { currentChurch } = useChurch();
  const { showToast } = useNotification();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'pastor' | 'ministry'>(initialMinistryId ? 'ministry' : 'pastor');

  const ministries = getMinistries(currentChurch.id);
  const [selectedMinistryId, setSelectedMinistryId] = useState<string>(
    initialMinistryId || (ministries.length > 0 ? ministries[0].id : '')
  );

  if (!isOpen) return null;

  const now = new Date();
  const dateFormatted = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
  const dayNames = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
  const currentDayName = dayNames[now.getDay()];

  const { today: bdaysToday } = getBirthdays(currentChurch.id);
  const { today: weddingsToday } = getWeddingAnniversaries(currentChurch.id);
  const appointments = getPastoralAppointments(currentChurch.id).filter(
    a => a.date === now.toISOString().split('T')[0] || a.date === '2026-09-22'
  );
  const schedules = getSchedules(currentChurch.id);
  const events = getEvents(currentChurch.id);

  // Cultos / Programação de Hoje
  const todaySchedules = schedules.filter(s => 
    s.dayOfWeek.toLowerCase().includes(currentDayName.toLowerCase().split('-')[0])
  );

  // ==========================================
  // 1. TEXTO: AGENDA DO DIA (PASTORES)
  // ==========================================
  let pastorText = `*AGENDA PASTORAL DO DIA — ${currentDayName}, ${dateFormatted}*\n`;
  pastorText += `*${currentChurch.name.toUpperCase()}*\n`;
  pastorText += `_\"A chama que nos move é o amor! ❤️‍🔥\"_\n\n`;

  // Programação / Cultos de Hoje
  pastorText += `🏛️ *PROGRAMAÇÃO & CULTOS DE HOJE*\n`;
  if (todaySchedules.length > 0) {
    todaySchedules.forEach(s => {
      pastorText += `• *${s.time}* — ${s.title} (${s.location})\n`;
    });
  } else {
    pastorText += `• _Sem cultos no templo hoje. Reuniões de Conexões e intercessão nos lares._\n`;
  }
  pastorText += `\n`;

  // Aniversários do Dia
  pastorText += `🎂 *ANIVERSARIANTES DE HOJE*\n`;
  if (bdaysToday.length > 0) {
    bdaysToday.forEach(b => {
      pastorText += `• *${b.name}* (${b.age} anos) — Tel: ${b.whatsapp || b.phone || 'Sem tel'} ${b.isChild ? '[Departamento Infantil]' : ''}\n`;
    });
  } else {
    pastorText += `_Nenhum aniversariante registrado para hoje._\n`;
  }
  pastorText += `\n`;

  // Casamentos do Dia
  if (weddingsToday.length > 0) {
    pastorText += `💍 *BODAS DE CASAMENTO HOJE*\n`;
    weddingsToday.forEach(w => {
      pastorText += `• *${w.coupleName}* — ${w.yearsMarried} anos de casados\n`;
    });
    pastorText += `\n`;
  }

  // Gabinete Pastoral
  pastorText += `📖 *GABINETE & ATENDIMENTOS (HOJE)*\n`;
  if (appointments.length > 0) {
    appointments.forEach(a => {
      pastorText += `• *${a.time}* — ${a.personName} (${a.type})\n`;
    });
  } else {
    pastorText += `_Nenhum aconselhamento agendado no sistema para hoje._\n`;
  }
  pastorText += `\n`;

  // Eventos em Destaque
  if (events.length > 0) {
    pastorText += `🎉 *PRÓXIMOS EVENTOS EM DESTAQUE*\n`;
    events.slice(0, 2).forEach(e => {
      pastorText += `• *${e.name}* (${e.startDate} às ${e.time}) — Vagas: ${e.spotsTaken}/${e.maxSpots || 'Livre'}\n`;
    });
    pastorText += `\n`;
  }

  pastorText += `_Contato Pastoral: ${currentChurch.pastorName} (${currentChurch.pastorPhone})_\n`;
  pastorText += `_Plataforma de Gestão Eclesiástica CBA_`;

  // ==========================================
  // 2. TEXTO: AGENDA / ESCALA DO MINISTÉRIO (LÍDERES)
  // ==========================================
  const currentMinistry = ministries.find(m => m.id === selectedMinistryId) || ministries[0];
  let ministryText = '';
  if (currentMinistry) {
    ministryText = `*ESCALA & COMUNICAÇÃO DE MINISTÉRIO*\n`;
    ministryText += `*${currentChurch.name.toUpperCase()}*\n`;
    ministryText += `*Ministério:* ${currentMinistry.name}\n`;
    ministryText += `*Líder Responsável:* ${currentMinistry.leaderName}${currentMinistry.viceLeaderName ? ` / ${currentMinistry.viceLeaderName}` : ''}\n`;
    if (currentMinistry.meetingDay || currentMinistry.meetingTime) {
      ministryText += `*Horário/Encontro:* ${currentMinistry.meetingDay || 'Conforme escala'} às ${currentMinistry.meetingTime || '18:30'}\n`;
    }
    if (currentMinistry.location) {
      ministryText += `*Local:* ${currentMinistry.location}\n`;
    }
    ministryText += `\n👥 *EQUIPE ESCALADA / INTEGRANTES ATIVOS (${currentMinistry.members.length}):*\n`;
    currentMinistry.members.forEach((m, idx) => {
      ministryText += `${idx + 1}. ${m}\n`;
    });

    if (currentMinistry.volunteers && currentMinistry.volunteers.length > 0) {
      ministryText += `\n🌱 *Voluntários em acolhimento:* ${currentMinistry.volunteers.join(', ')}\n`;
    }

    ministryText += `\n\"A chama que nos move é o amor! ❤️‍🔥\"\n`;
    ministryText += `_Coordenação Eclesiástica CBAcolher_`;
  }

  const activeText = activeTab === 'pastor' ? pastorText : ministryText;

  const handleCopy = () => {
    navigator.clipboard.writeText(activeText);
    setCopied(true);
    showToast('Texto copiado com sucesso!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendToPastor = () => {
    const rawPhone = currentChurch.pastorWhatsapp || currentChurch.pastorPhone || '';
    const clean = rawPhone.replace(/\D/g, '');
    if (!clean || clean.length < 8) {
      showToast(`O WhatsApp do Pastor Titular (${currentChurch.pastorName || 'Pastor'}) não está cadastrado. Configure nas Configurações da Igreja.`, 'error');
      return;
    }
    const phone = clean.startsWith('55') ? clean : `55${clean}`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(pastorText)}`;
    window.open(url, '_blank');
    showToast(`Abrindo WhatsApp de ${currentChurch.pastorName || 'Pastor Titular'} (${rawPhone})...`, 'info');
  };

  const handleShareGeneral = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(activeText)}`;
    window.open(url, '_blank');
    showToast('Abrindo WhatsApp para compartilhar...', 'info');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 text-slate-800 max-h-[92vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Cabeçalho */}
        <div className="flex items-center gap-3 mb-4 shrink-0">
          <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-700 border border-sky-200 flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Agenda do Dia & Despacho WhatsApp</h3>
            <p className="text-xs text-slate-500">
              Comunicação pastoral e escalas ministeriais com disparo direto
            </p>
          </div>
        </div>

        {/* Seletor de Abas: Agenda Pastoral vs Agenda dos Líderes */}
        <div className="flex p-1 rounded-2xl bg-slate-100 border border-slate-200 mb-4 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('pastor')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'pastor'
                ? 'bg-white text-sky-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Church className="w-4 h-4 text-sky-600" />
            <span>Agenda do Dia (Pastores)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ministry')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'ministry'
                ? 'bg-white text-sky-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4 text-sky-600" />
            <span>Escalas de Ministérios (Líderes)</span>
          </button>
        </div>

        {/* Se for aba de ministérios, exibe seletor de ministério */}
        {activeTab === 'ministry' && (
          <div className="mb-3 shrink-0">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Selecione o Ministério para gerar a escala:
            </label>
            <select
              value={selectedMinistryId}
              onChange={e => setSelectedMinistryId(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold outline-none focus:bg-white focus:border-sky-500"
            >
              {ministries.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name} (Líder: {m.leaderName})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Prévia do Texto Formatado para WhatsApp */}
        <div className="flex-1 overflow-y-auto p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-800 whitespace-pre-wrap leading-relaxed shadow-inner">
          {activeText}
        </div>

        {/* Botões de Ação */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-4 shrink-0">
          <button
            onClick={handleCopy}
            className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copiado!' : 'Copiar Texto'}
          </button>

          {activeTab === 'pastor' && (
            <button
              onClick={handleSendToPastor}
              className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>
                Enviar para Pastor {currentChurch.pastorName ? `(${currentChurch.pastorName})` : ''}
              </span>
            </button>
          )}

          <button
            onClick={handleShareGeneral}
            className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-md shadow-sky-600/20 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span>
              {activeTab === 'pastor' ? 'Compartilhar com Liderança' : 'Enviar no Grupo do Ministério'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
