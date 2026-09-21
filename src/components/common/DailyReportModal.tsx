import React, { useState } from 'react';
import { FileText, Copy, Check, MessageCircle, X, Calendar, Clock } from 'lucide-react';
import { useChurch } from '../../context/ChurchContext';
import { useNotification } from '../../context/NotificationContext';
import { 
  getBirthdays, 
  getWeddingAnniversaries, 
  getPastoralAppointments, 
  getSchedules,
  getEvents
} from '../../services/storage';

interface DailyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DailyReportModal: React.FC<DailyReportModalProps> = ({ isOpen, onClose }) => {
  const { currentChurch } = useChurch();
  const { showToast } = useNotification();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const now = new Date();
  const dateFormatted = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;

  const { today: bdaysToday } = getBirthdays(currentChurch.id);
  const { today: weddingsToday } = getWeddingAnniversaries(currentChurch.id);
  const appointments = getPastoralAppointments(currentChurch.id).filter(a => a.date === '2026-09-21' || a.date === now.toISOString().split('T')[0]);
  const schedules = getSchedules(currentChurch.id);
  const events = getEvents(currentChurch.id);

  // Montagem do Relatório Diário do Pastor
  let text = `*RELATÓRIO PASTORAL — ${dateFormatted}*\n`;
  text += `*${currentChurch.name.toUpperCase()}*\n\n`;

  // Aniversários
  text += `🎂 *ANIVERSÁRIOS DO DIA*\n`;
  if (bdaysToday.length > 0) {
    bdaysToday.forEach(b => {
      text += `• ${b.name} — ${b.age} anos ${b.isChild ? '(Acolher Kids)' : ''}\n`;
    });
  } else {
    text += `_Nenhum aniversariante registrado para hoje._\n`;
  }
  text += `\n`;

  // Casamentos
  text += `💍 *BODAS & CASAMENTOS*\n`;
  if (weddingsToday.length > 0) {
    weddingsToday.forEach(w => {
      text += `• ${w.coupleName} — ${w.yearsMarried} anos de casados\n`;
    });
  } else {
    text += `_Nenhuma boda de casamento para hoje._\n`;
  }
  text += `\n`;

  // Gabinete Pastoral
  text += `📖 *GABINETE PASTORAL (HOJE)*\n`;
  if (appointments.length > 0) {
    appointments.forEach(a => {
      text += `• ${a.time} — ${a.personName} (${a.type})\n`;
    });
  } else {
    text += `_Nenhum atendimento agendado para hoje._\n`;
  }
  text += `\n`;

  // Programação / Eventos
  text += `📅 *PROGRAMAÇÃO & CULTOS*\n`;
  if (schedules.length > 0) {
    schedules.slice(0, 3).forEach(s => {
      text += `• ${s.dayOfWeek} às ${s.time} — ${s.title}\n`;
    });
  }
  if (events.length > 0) {
    text += `\n🎉 *DESTAQUE DE EVENTOS*\n`;
    events.slice(0, 2).forEach(e => {
      text += `• ${e.name} (${e.startDate}) — Vagas: ${e.spotsTaken}/${e.maxSpots || 'Livre'}\n`;
    });
  }

  text += `\n_Gerado pela Plataforma de Gestão Eclesiástica CBA_\n`;

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast('Relatório pastoral copiado!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendToPastor = () => {
    const pastorWa = currentChurch.pastorWhatsapp || currentChurch.whatsapp;
    const clean = pastorWa.replace(/\D/g, '');
    const phone = clean.startsWith('55') ? clean : `55${clean}`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    showToast('Enviando relatório para o WhatsApp do Pastor...', 'info');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-xl rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 text-slate-800 max-h-[90vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4 shrink-0">
          <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-700 border border-sky-200 flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Relatório Diário do Pastor</h3>
            <p className="text-xs text-slate-500">
              {currentChurch.pastorName} • Horário programado: {currentChurch.dailyReportHour}h
            </p>
          </div>
        </div>

        {/* Prévia do Relatório Formatado */}
        <div className="flex-1 overflow-y-auto p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-800 whitespace-pre-wrap leading-relaxed shadow-inner">
          {text}
        </div>

        {/* Botões de Ação */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 shrink-0">
          <button
            onClick={handleCopy}
            className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copiado!' : 'Copiar Texto Formatado'}
          </button>

          <button
            onClick={handleSendToPastor}
            className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-4 h-4 fill-current" />
            Enviar para WhatsApp do Pastor
          </button>
        </div>
      </div>
    </div>
  );
};
