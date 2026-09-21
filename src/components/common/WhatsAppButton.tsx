import React from 'react';
import { MessageCircle, Copy, Check } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

interface WhatsAppButtonProps {
  phone: string;
  message?: string;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'green' | 'outline' | 'icon';
  className?: string;
  showCopyOption?: boolean;
}

export const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({
  phone,
  message = '',
  label = 'Enviar WhatsApp',
  size = 'md',
  variant = 'green',
  className = '',
  showCopyOption = true
}) => {
  const { showToast } = useNotification();
  const [copied, setCopied] = React.useState(false);

  // Normaliza o número de telefone (garante DDI 55 do Brasil se faltar)
  const cleanPhone = phone.replace(/\D/g, '');
  const finalPhone = cleanPhone.startsWith('55') 
    ? cleanPhone 
    : cleanPhone.length >= 10 
    ? `55${cleanPhone}` 
    : cleanPhone;

  const waUrl = `https://wa.me/${finalPhone}?text=${encodeURIComponent(message)}`;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(message);
    setCopied(true);
    showToast('Mensagem copiada para a área de transferência!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!finalPhone || finalPhone.length < 10) {
      showToast('Número de WhatsApp inválido ou não cadastrado.', 'error');
      return;
    }
    window.open(waUrl, '_blank');
    showToast('Abrindo WhatsApp com mensagem...', 'info');
  };

  const sizeClasses = {
    sm: 'px-2.5 py-1 text-xs gap-1.5',
    md: 'px-3.5 py-2 text-xs sm:text-sm gap-2',
    lg: 'px-5 py-2.5 text-sm sm:text-base gap-2.5'
  }[size];

  return (
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
  );
};
