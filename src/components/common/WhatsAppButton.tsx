import React, { useState, useEffect } from 'react';
import { MessageCircle, Copy, Check, ShieldAlert, Save, X, Edit3, RotateCcw, Send } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import { useChurch } from '../../context/ChurchContext';

interface WhatsAppButtonProps {
  phone: string;
  message?: string;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'green' | 'outline' | 'icon';
  className?: string;
  showCopyOption?: boolean;
  requireSecretaryPhone?: boolean;
}

export const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({
  phone,
  message = '',
  label = 'Enviar WhatsApp',
  size = 'md',
  variant = 'green',
  className = '',
  showCopyOption = true,
  requireSecretaryPhone = true
}) => {
  const { showToast } = useNotification();
  const { currentChurch, updateCurrentChurch } = useChurch();
  const [copied, setCopied] = useState(false);
  const [isSecretaryModalOpen, setIsSecretaryModalOpen] = useState(false);
  const [secretaryInput, setSecretaryInput] = useState('');

  // Estados para edição antes de enviar
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editablePhone, setEditablePhone] = useState(phone || '');
  const [editableMessage, setEditableMessage] = useState(message || '');

  // Sincroniza se os props mudarem
  useEffect(() => {
    setEditablePhone(phone || '');
  }, [phone]);

  useEffect(() => {
    setEditableMessage(message || '');
  }, [message]);

  // Verifica se o WhatsApp da Secretaria está cadastrado
  const secretaryPhone = currentChurch.secretaryWhatsapp || currentChurch.whatsapp || '';
  const isSecretaryMissing = requireSecretaryPhone && (!secretaryPhone || secretaryPhone.replace(/\D/g, '').length < 8);

  const executeOpenWhatsApp = (customPhone?: string, customMsg?: string) => {
    const rawNum = customPhone !== undefined ? customPhone : editablePhone;
    const cleanNum = rawNum.replace(/\D/g, '');
    const finalPhone = cleanNum.startsWith('55') 
      ? cleanNum 
      : cleanNum.length >= 10 
      ? `55${cleanNum}` 
      : cleanNum;

    if (!finalPhone || finalPhone.length < 10) {
      showToast('Número de WhatsApp do destinatário inválido ou não cadastrado.', 'error');
      return;
    }

    const msgToSend = customMsg !== undefined ? customMsg : editableMessage;
    const waUrl = msgToSend 
      ? `https://wa.me/${finalPhone}?text=${encodeURIComponent(msgToSend)}`
      : `https://wa.me/${finalPhone}`;

    window.open(waUrl, '_blank');
    setIsEditModalOpen(false);
    showToast('Abrindo WhatsApp com mensagem...', 'info');
  };

  const handleOpenWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (isSecretaryMissing) {
      setIsSecretaryModalOpen(true);
      return;
    }

    // Abre modal para permitir que o usuário edite a mensagem ou o telefone antes de enviar
    setEditablePhone(phone || '');
    setEditableMessage(message || '');
    setIsEditModalOpen(true);
  };

  const handleResetMessage = () => {
    setEditableMessage(message || '');
    showToast('Texto restaurado para o modelo padrão.', 'info');
  };

  const handleSaveSecretary = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanSec = secretaryInput.replace(/\D/g, '');
    if (!cleanSec || cleanSec.length < 8) {
      showToast('Por favor, informe um número de WhatsApp válido para a Secretaria.', 'error');
      return;
    }

    await updateCurrentChurch({
      secretaryWhatsapp: secretaryInput,
      whatsapp: secretaryInput
    });

    setIsSecretaryModalOpen(false);
    showToast('WhatsApp da Secretaria cadastrado com sucesso!', 'success');
    executeOpenWhatsApp();
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(message);
    setCopied(true);
    showToast('Mensagem copiada para a área de transferência!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const sizeClasses = {
    sm: 'px-2.5 py-1 text-xs gap-1.5',
    md: 'px-3.5 py-2 text-xs sm:text-sm gap-2',
    lg: 'px-5 py-2.5 text-sm sm:text-base gap-2.5'
  }[size];

  return (
    <>
      <div className={`inline-flex items-center gap-1.5 ${className}`}>
        <button
          onClick={handleOpenWhatsApp}
          className={`inline-flex items-center justify-center font-semibold rounded-xl transition-all shadow-md active:scale-95 ${sizeClasses} ${
            variant === 'green'
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/25 hover:shadow-emerald-600/40'
              : variant === 'outline'
              ? 'bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 border border-emerald-500/40'
              : 'bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 p-2 rounded-lg'
          }`}
          title={`Enviar mensagem para ${phone}`}
        >
          <MessageCircle className="w-4 h-4 shrink-0 fill-current" />
          {variant !== 'icon' && <span>{label}</span>}
        </button>

        {showCopyOption && message && (
          <button
            onClick={handleCopy}
            title="Copiar texto da mensagem"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors shadow-sm"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Modal de Solicitação do Cadastro do WhatsApp da Secretaria */}
      {isSecretaryModalOpen && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            setIsSecretaryModalOpen(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in text-left"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 text-slate-800"
          >
            <button
              onClick={() => setIsSecretaryModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  Cadastrar WhatsApp da Secretaria
                </h3>
                <p className="text-xs text-slate-500">
                  {currentChurch.name}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Para disparar as mensagens oficiais da congregação (como boas-vindas a visitantes e avisos), o sistema requer o cadastro do número de WhatsApp da <strong>Secretaria da Igreja</strong>.
            </p>

            <form onSubmit={handleSaveSecretary} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  WhatsApp da Secretaria (com DDD) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: (DDD) 99999-9999"
                  value={secretaryInput}
                  onChange={(e) => setSecretaryInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-semibold outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsSecretaryModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  Salvar e Enviar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Edição da Mensagem Antes do Envio */}
      {isEditModalOpen && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            setIsEditModalOpen(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in text-left"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 text-slate-800 animate-in zoom-in-95 duration-150"
          >
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <MessageCircle className="w-6 h-6 fill-current" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <span>Revisar e Enviar WhatsApp</span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                    Editável
                  </span>
                </h3>
                <p className="text-xs text-slate-500">
                  {currentChurch.name} • Ajuste a mensagem livremente antes de disparar
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Telefone do Destinatário */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Número de WhatsApp do Destinatário:
                </label>
                <input
                  type="text"
                  placeholder="(DDD) 99999-9999"
                  value={editablePhone}
                  onChange={(e) => setEditablePhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-semibold outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all"
                />
              </div>

              {/* Mensagem Editável */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Edit3 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Mensagem (você pode alterar ou acrescentar o que desejar):</span>
                  </label>
                  {message && editableMessage !== message && (
                    <button
                      type="button"
                      onClick={handleResetMessage}
                      className="text-[11px] font-semibold text-slate-500 hover:text-emerald-700 flex items-center gap-1 transition-colors"
                      title="Voltar ao texto original"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Restaurar original
                    </button>
                  )}
                </div>
                <textarea
                  rows={6}
                  value={editableMessage}
                  onChange={(e) => setEditableMessage(e.target.value)}
                  placeholder="Escreva ou ajuste a mensagem que será enviada..."
                  className="w-full p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 text-xs sm:text-sm font-sans leading-relaxed outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all resize-y shadow-inner"
                />
                <p className="text-[11px] text-slate-400 mt-1 flex justify-between">
                  <span>💡 O WhatsApp abrirá já com o texto editado acima pronto para envio.</span>
                  <span>{editableMessage.length} caracteres</span>
                </p>
              </div>

              {/* Botões de Ação */}
              <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(editableMessage);
                    setCopied(true);
                    showToast('Mensagem copiada para a área de transferência!', 'success');
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copiado' : 'Copiar Texto'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => executeOpenWhatsApp()}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <Send className="w-4 h-4" />
                  <span>Abrir WhatsApp e Enviar</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
