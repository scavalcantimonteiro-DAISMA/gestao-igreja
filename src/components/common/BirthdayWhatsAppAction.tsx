import React, { useState } from 'react';
import { MessageCircle, Send, Copy, Check, X, Cake, Phone, UserCheck } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import { useChurch } from '../../context/ChurchContext';

export interface BirthdayWhatsAppActionProps {
  personName: string;
  age?: number;
  phone?: string;
  isChild?: boolean;
  guardianName?: string;
  formattedDate?: string;
  size?: 'xs' | 'sm' | 'md';
  variant?: 'inline-icon' | 'badge' | 'button';
  label?: string;
  className?: string;
}

export const BirthdayWhatsAppAction: React.FC<BirthdayWhatsAppActionProps> = ({
  personName,
  age,
  phone = '',
  isChild = false,
  guardianName,
  formattedDate,
  size = 'xs',
  variant = 'inline-icon',
  label = 'WhatsApp',
  className = ''
}) => {
  const { showToast } = useNotification();
  const { currentChurch } = useChurch();
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [targetPhone, setTargetPhone] = useState(phone || '');

  // Pastor titular fixo conforme instrução da liderança CBA
  const PASTOR_NAME = 'Pr. Tércio Ribeiro';
  const PASTOR_PHONE_DISPLAY = '+55 82 98225-9873';
  const PASTOR_WHATSAPP_CLEAN = '5582982259873';

  // Normalização do número de telefone
  const cleanPhone = targetPhone.replace(/\D/g, '');
  const finalPhone = cleanPhone.startsWith('55')
    ? cleanPhone
    : cleanPhone.length >= 10
    ? `55${cleanPhone}`
    : cleanPhone;

  // Mensagem oficial de felicitação que parte em nome do pastor
  const greetingMessage = isChild
    ? `Graça e Paz, ${personName}! 🎈🎂✨\n\nHoje o Departamento Infantil e toda a nossa igreja estão em festa pelo seu aniversário! Que o Papai do Céu continue enchendo o seu coração de alegria, saúde e sabedoria.\n\n_"A chama que nos move é o amor! ❤️‍🔥"_\n\nCom bênçãos e carinho pastoral,\n*${PASTOR_NAME}*\nWhatsApp Pastoral: ${PASTOR_PHONE_DISPLAY}\n${currentChurch.name}`
    : `Graça e Paz, ${personName}! 🎂✨\n\nA Comunidade Batista Acolher se alegra imensamente com a sua vida hoje! Que o Senhor derrame bênçãos sem medida, saúde, paz e muitas vitórias sobre você e sua família neste novo ciclo${age ? ` de ${age} anos` : ''}.\n\n_"A chama que nos move é o amor! ❤️‍🔥"_\n\nFeliz Aniversário! 🙏🎈\n\nCom bênçãos pastorais,\n*${PASTOR_NAME}*\nWhatsApp Pastoral: ${PASTOR_PHONE_DISPLAY}\n${currentChurch.name}`;

  // Mensagem para avisar diretamente o pastor no WhatsApp dele
  const alertPastorMessage = `Graça e Paz, ${PASTOR_NAME}! 🎂\n\nHoje é o aniversário de *${personName}*${age ? ` (${age} anos)` : ''}!\nTelefone/WhatsApp: *${targetPhone || 'Não informado'}* ${isChild && guardianName ? `(Responsável: ${guardianName})` : ''}\n\nSegue texto de felicitação pronto para o senhor enviar:\n\n"${greetingMessage.replace(/\n/g, ' ')}"`;

  const handleOpenWhatsAppMember = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!finalPhone || finalPhone.length < 10) {
      showToast('Por favor, informe ou confirme o número de WhatsApp.', 'error');
      setIsOpen(true);
      return;
    }
    const url = `https://wa.me/${finalPhone}?text=${encodeURIComponent(greetingMessage)}`;
    window.open(url, '_blank');
    showToast(`Abrindo WhatsApp de ${personName} com mensagem pastoral...`, 'info');
  };

  const handleOpenWhatsAppPastor = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `https://wa.me/${PASTOR_WHATSAPP_CLEAN}?text=${encodeURIComponent(alertPastorMessage)}`;
    window.open(url, '_blank');
    showToast(`Abrindo WhatsApp do Pr. Tércio (${PASTOR_PHONE_DISPLAY})...`, 'info');
  };

  const handleCopyMessage = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(greetingMessage);
    setCopied(true);
    showToast('Mensagem do pastor copiada para a área de transferência!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {/* Botão de disparo ao lado do nome */}
      {variant === 'inline-icon' && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(true);
          }}
          title={`WhatsApp de Aniversário - ${personName} (Mensagem do Pr. Tércio)`}
          className={`inline-flex items-center justify-center rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm hover:shadow-emerald-500/30 active:scale-90 transition-all ${
            size === 'xs' ? 'w-5 h-5' : size === 'sm' ? 'w-6 h-6' : 'w-7 h-7'
          } ${className}`}
        >
          <MessageCircle className={`${size === 'xs' ? 'w-3 h-3' : 'w-3.5 h-3.5'} fill-current`} />
        </button>
      )}

      {variant === 'badge' && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(true);
          }}
          title={`Felicitações via WhatsApp - ${personName}`}
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 font-bold text-[11px] shadow-xs active:scale-95 transition-all ${className}`}
        >
          <MessageCircle className="w-3.5 h-3.5 fill-current text-emerald-600" />
          <span>{label}</span>
        </button>
      )}

      {variant === 'button' && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(true);
          }}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm hover:shadow-emerald-600/30 active:scale-95 transition-all ${className}`}
        >
          <MessageCircle className="w-3.5 h-3.5 fill-current" />
          <span>{label}</span>
        </button>
      )}

      {/* Modal Interativo de Disparo Pastoral */}
      {isOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in text-left"
        >
          <div className="relative w-full max-w-lg rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 text-slate-800">
            {/* Fechar */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Cabeçalho */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
                <Cake className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <span>Felicitação de Aniversário</span>
                  {isChild && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 font-bold">
                      Departamento Infantil
                    </span>
                  )}
                </h3>
                <p className="text-xs text-slate-500">
                  {personName} {age ? `• ${age} anos` : ''} {formattedDate ? `(${formattedDate})` : ''}
                </p>
              </div>
            </div>

            {/* Identificação do Remetente Pastoral */}
            <div className="p-3 rounded-2xl bg-sky-50 border border-sky-200/80 mb-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                <UserCheck className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-sky-950">Remetente Pastoral Oficial:</p>
                <p className="text-sky-800 font-medium">
                  {PASTOR_NAME} • WhatsApp: <strong>{PASTOR_PHONE_DISPLAY}</strong>
                </p>
              </div>
            </div>

            {/* Telefone do Aniversariante */}
            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>WhatsApp do Aniversariante {isChild && guardianName ? `(Pais: ${guardianName})` : ''}:</span>
              </label>
              <input
                type="text"
                placeholder="(82) 99999-9999"
                value={targetPhone}
                onChange={(e) => setTargetPhone(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm font-semibold outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            {/* Prévia da Mensagem */}
            <div className="mb-5">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Texto que será enviado no WhatsApp:
              </label>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 whitespace-pre-wrap font-sans max-h-40 overflow-y-auto leading-relaxed shadow-inner">
                {greetingMessage}
              </div>
            </div>

            {/* Ações de Disparo */}
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row items-center gap-2">
                {/* 1. Enviar para Aniversariante */}
                <button
                  type="button"
                  onClick={handleOpenWhatsAppMember}
                  className="w-full sm:flex-1 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  <span>Enviar Felicitações</span>
                </button>

                {/* 2. Copiar Mensagem */}
                <button
                  type="button"
                  onClick={handleCopyMessage}
                  className="w-full sm:w-auto py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition-all flex items-center justify-center gap-2"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copiado' : 'Copiar'}</span>
                </button>
              </div>

              {/* 3. Avisar Pastor Tércio no número dele */}
              <button
                type="button"
                onClick={handleOpenWhatsAppPastor}
                className="w-full py-2.5 px-4 rounded-2xl bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-200 text-xs font-bold transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5 text-sky-600" />
                <span>Encaminhar p/ WhatsApp do Pr. Tércio ({PASTOR_PHONE_DISPLAY})</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
