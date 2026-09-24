import React, { useState } from 'react';
import { MessageCircle, Send, Copy, Check, X, Cake, Phone, UserCheck, HeartHandshake, ShieldAlert, Save } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import { useChurch } from '../../context/ChurchContext';

export interface BirthdayWhatsAppActionProps {
  personName: string;
  age?: number;
  phone?: string;
  isChild?: boolean;
  guardianName?: string;
  formattedDate?: string;
  type?: 'birthday' | 'wedding';
  weddingInfo?: {
    husbandName?: string;
    wifeName?: string;
    yearsMarried?: number;
  };
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
  type = 'birthday',
  weddingInfo,
  size = 'xs',
  variant = 'inline-icon',
  label = 'WhatsApp',
  className = ''
}) => {
  const { showToast } = useNotification();
  const { currentChurch, updateCurrentChurch } = useChurch();
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [targetPhone, setTargetPhone] = useState(phone || '');

  // Escolha do remetente (Pastor Titular ou Gabinete Pastoral)
  const [senderRole, setSenderRole] = useState<'pastor' | 'gabinete' | 'secretaria'>(
    currentChurch.defaultBirthdaySender || 'pastor'
  );

  // Estados para cadastro rápido de telefones se não existirem
  const [isQuickEditing, setIsQuickEditing] = useState(false);
  const [quickPastorPhone, setQuickPastorPhone] = useState(currentChurch.pastorWhatsapp || currentChurch.pastorPhone || '');
  const [quickGabinetePhone, setQuickGabinetePhone] = useState(currentChurch.pastoralOfficeWhatsapp || '');

  // Sincroniza telefones locais se currentChurch mudar
  React.useEffect(() => {
    setQuickPastorPhone(currentChurch.pastorWhatsapp || currentChurch.pastorPhone || '');
    setQuickGabinetePhone(currentChurch.pastoralOfficeWhatsapp || '');
  }, [currentChurch]);

  // Dados do Pastor
  const pastorName = currentChurch.pastorName || 'Pastor Titular';
  const pastorPhone = currentChurch.pastorWhatsapp || currentChurch.pastorPhone || '';
  const cleanPastorPhone = pastorPhone.replace(/\D/g, '');

  // Dados do Gabinete
  const gabinetePhone = currentChurch.pastoralOfficeWhatsapp || '';
  const cleanGabinetePhone = gabinetePhone.replace(/\D/g, '');

  // Dados da Secretaria
  const secretaryPhone = currentChurch.secretaryWhatsapp || currentChurch.whatsapp || '';
  const cleanSecretaryPhone = secretaryPhone.replace(/\D/g, '');

  // Telefone do Destinatário
  const cleanTargetPhone = targetPhone.replace(/\D/g, '');
  const finalTargetPhone = cleanTargetPhone.startsWith('55')
    ? cleanTargetPhone
    : cleanTargetPhone.length >= 10
    ? `55${cleanTargetPhone}`
    : cleanTargetPhone;

  // Remetente ativo
  const activeSenderPhone = senderRole === 'pastor' 
    ? pastorPhone 
    : senderRole === 'gabinete' 
    ? gabinetePhone 
    : secretaryPhone;

  const isSenderPhoneMissing = !activeSenderPhone || activeSenderPhone.replace(/\D/g, '').length < 8;

  // Salvar cadastro rápido de números
  const handleSaveQuickNumbers = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickPastorPhone && !quickGabinetePhone) {
      showToast('Informe ao menos um número de WhatsApp.', 'error');
      return;
    }
    await updateCurrentChurch({
      pastorWhatsapp: quickPastorPhone,
      pastorPhone: quickPastorPhone,
      pastoralOfficeWhatsapp: quickGabinetePhone
    });
    setIsQuickEditing(false);
    showToast('Números oficiais atualizados e sincronizados!', 'success');
  };

  // Gerador dinâmico de texto da mensagem
  const getGreetingMessage = () => {
    if (type === 'wedding') {
      const years = weddingInfo?.yearsMarried;
      const yearsText = years ? ` (${years} anos!)` : '!';
      
      if (senderRole === 'pastor') {
        return `Graça e Paz, ${personName}! 💍✨\n\nHoje celebramos com vocês mais um abençoado ano de matrimônio${yearsText}. Que o Senhor continue guardando, fortalecendo e renovando o amor, a fidelidade e a aliança de vocês a cada dia.\n\nCom carinho e bênçãos pastorais,\n*${pastorName}*${pastorPhone ? `\nWhatsApp Pastoral: ${pastorPhone}` : ''}\n${currentChurch.name}`;
      } else if (senderRole === 'gabinete') {
        return `Graça e Paz, ${personName}! 💍✨\n\nO Gabinete Pastoral e toda a congregação celebram com vocês mais um abençoado ano de casamento${yearsText}. Que Deus cubra o lar de vocês com paz, saúde, harmonia e ricas bênçãos.\n\nCom estima e orações,\n*Gabinete Pastoral*${gabinetePhone ? `\nContato Gabinete: ${gabinetePhone}` : ''}\n${currentChurch.name}`;
      } else {
        return `Graça e Paz, ${personName}! 💍✨\n\nEm nome de toda a nossa igreja, a Secretaria parabeniza vocês por mais um abençoado aniversário de casamento${yearsText}!\n\nCom carinho fraterno,\n*Secretaria - ${currentChurch.name}*${secretaryPhone ? `\nWhatsApp: ${secretaryPhone}` : ''}`;
      }
    }

    // Aniversário de Idade
    if (isChild) {
      if (senderRole === 'pastor') {
        return `Graça e Paz, ${personName}! 🎈🎂✨\n\nHoje o Departamento Infantil e toda a nossa congregação estão em festa pelo seu aniversário! Que o Papai do Céu continue enchendo o seu coração de alegria, saúde e sabedoria.\n\nCom bênçãos e carinho pastoral,\n*${pastorName}*${pastorPhone ? `\nWhatsApp Pastoral: ${pastorPhone}` : ''}\n${currentChurch.name}`;
      } else {
        return `Graça e Paz, ${personName}! 🎈🎂✨\n\nHoje o Departamento Infantil e o Gabinete Pastoral celebram com alegria o seu aniversário! Que o Senhor derrame muitas bênçãos sobre a sua infância e sua família.\n\nCom muito carinho,\n*Gabinete Pastoral*${gabinetePhone ? `\nContato Gabinete: ${gabinetePhone}` : ''}\n${currentChurch.name}`;
      }
    }

    // Aniversariante Membro Adulto
    if (senderRole === 'pastor') {
      return `Graça e Paz, ${personName}! 🎂✨\n\nA ${currentChurch.name} se alegra imensamente com a sua vida hoje! Que o Senhor derrame bênçãos sem medida, saúde, paz e muitas vitórias sobre você e sua família neste novo ciclo${age ? ` de ${age} anos` : ''}.\n\nFeliz Aniversário! 🙏🎈\n\nCom bênçãos pastorais,\n*${pastorName}*${pastorPhone ? `\nWhatsApp Pastoral: ${pastorPhone}` : ''}\n${currentChurch.name}`;
    } else if (senderRole === 'gabinete') {
      return `Graça e Paz, ${personName}! 🎂✨\n\nO Gabinete Pastoral se alegra com a sua vida neste dia tão especial! Que Deus continue guiando os seus passos com muita saúde, sabedoria e paz${age ? ` neste novo ciclo de ${age} anos` : ''}.\n\nFeliz Aniversário! 🙏✨\n\nCom estima e consideração,\n*Gabinete Pastoral*${gabinetePhone ? `\nContato Gabinete: ${gabinetePhone}` : ''}\n${currentChurch.name}`;
    } else {
      return `Graça e Paz, ${personName}! 🎂✨\n\nA Secretaria da ${currentChurch.name} deseja a você um aniversário muito abençoado${age ? ` (${age} anos)` : ''}! Que o amor e a graça do Senhor estejam sobre sua vida hoje e sempre.\n\nCom carinho fraterno,\n*Secretaria - ${currentChurch.name}*${secretaryPhone ? `\nWhatsApp: ${secretaryPhone}` : ''}`;
    }
  };

  const greetingMessage = getGreetingMessage();

  // Mensagem para avisar/encaminhar diretamente ao pastor
  const alertPastorMessage = `Graça e Paz, ${pastorName}! 🎂\n\nHoje é ${type === 'wedding' ? 'aniversário de casamento' : 'o aniversário'} de *${personName}*${age ? ` (${age} anos)` : ''}!\nTelefone: *${targetPhone || 'Não informado'}* ${isChild && guardianName ? `(Responsável: ${guardianName})` : ''}\n\nSegue texto formatado para o senhor enviar:\n\n"${greetingMessage.replace(/\n/g, ' ')}"`;

  // Disparo para o Membro/Aniversariante
  const handleOpenWhatsAppMember = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!finalTargetPhone || finalTargetPhone.length < 10) {
      showToast('Por favor, informe ou confirme o número de WhatsApp do destinatário.', 'error');
      setIsOpen(true);
      return;
    }

    if (isSenderPhoneMissing) {
      showToast(`Por favor, cadastre o telefone do ${senderRole === 'pastor' ? 'Pastor Titular' : senderRole === 'gabinete' ? 'Gabinete Pastoral' : 'Secretaria'} para identificar o remetente oficial.`, 'error');
      setIsQuickEditing(true);
      return;
    }

    const url = `https://wa.me/${finalTargetPhone}?text=${encodeURIComponent(greetingMessage)}`;
    window.open(url, '_blank');
    showToast(`Abrindo WhatsApp de ${personName}...`, 'info');
  };

  // Encaminhar para o Pastor no WhatsApp dele
  const handleOpenWhatsAppPastor = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!cleanPastorPhone || cleanPastorPhone.length < 8) {
      showToast('O telefone do Pastor Titular não está cadastrado. Cadastre o número abaixo.', 'error');
      setIsQuickEditing(true);
      return;
    }
    const finalPastor = cleanPastorPhone.startsWith('55') ? cleanPastorPhone : `55${cleanPastorPhone}`;
    const url = `https://wa.me/${finalPastor}?text=${encodeURIComponent(alertPastorMessage)}`;
    window.open(url, '_blank');
    showToast(`Abrindo WhatsApp do pastor (${pastorName})...`, 'info');
  };

  // Encaminhar para o Gabinete Pastoral
  const handleOpenWhatsAppGabinete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!cleanGabinetePhone || cleanGabinetePhone.length < 8) {
      showToast('O telefone do Gabinete Pastoral não está cadastrado. Cadastre o número abaixo.', 'error');
      setIsQuickEditing(true);
      return;
    }
    const finalGabinete = cleanGabinetePhone.startsWith('55') ? cleanGabinetePhone : `55${cleanGabinetePhone}`;
    const url = `https://wa.me/${finalGabinete}?text=${encodeURIComponent(alertPastorMessage)}`;
    window.open(url, '_blank');
    showToast('Abrindo WhatsApp do Gabinete Pastoral...', 'info');
  };

  const handleCopyMessage = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(greetingMessage);
    setCopied(true);
    showToast('Mensagem copiada para a área de transferência!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {/* Botão de disparo */}
      {variant === 'inline-icon' && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(true);
          }}
          title={`${type === 'wedding' ? 'Felicitações de Casamento' : 'WhatsApp de Aniversário'} - ${personName}`}
          className={`inline-flex items-center justify-center rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm hover:shadow-emerald-500/30 active:scale-90 transition-all ${
            size === 'xs' ? 'w-5 h-5' : size === 'sm' ? 'w-6 h-6' : 'w-7 h-7'
          } ${className}`}
        >
          {type === 'wedding' ? (
            <HeartHandshake className={`${size === 'xs' ? 'w-3 h-3' : 'w-3.5 h-3.5'}`} />
          ) : (
            <MessageCircle className={`${size === 'xs' ? 'w-3 h-3' : 'w-3.5 h-3.5'} fill-current`} />
          )}
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
          {type === 'wedding' ? (
            <HeartHandshake className="w-3.5 h-3.5 text-pink-600" />
          ) : (
            <MessageCircle className="w-3.5 h-3.5 fill-current text-emerald-600" />
          )}
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
          {type === 'wedding' ? (
            <HeartHandshake className="w-3.5 h-3.5" />
          ) : (
            <MessageCircle className="w-3.5 h-3.5 fill-current" />
          )}
          <span>{label}</span>
        </button>
      )}

      {/* Modal Interativo de Disparo com Decisão de Número */}
      {isOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in text-left"
        >
          <div className="relative w-full max-w-lg rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 text-slate-800 max-h-[92vh] overflow-y-auto">
            {/* Fechar */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Cabeçalho */}
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md ${
                type === 'wedding' 
                  ? 'bg-gradient-to-tr from-pink-600 to-rose-500 shadow-pink-500/20' 
                  : 'bg-gradient-to-tr from-emerald-600 to-teal-500 shadow-emerald-500/20'
              }`}>
                {type === 'wedding' ? <HeartHandshake className="w-6 h-6" /> : <Cake className="w-6 h-6" />}
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <span>{type === 'wedding' ? 'Felicitação de Casamento' : 'Felicitação de Aniversário'}</span>
                  {isChild && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 font-bold">
                      Departamento Infantil
                    </span>
                  )}
                </h3>
                <p className="text-xs text-slate-500">
                  {personName} {age ? `• ${age} anos` : ''} {weddingInfo?.yearsMarried ? `• ${weddingInfo.yearsMarried} anos de casados` : ''} {formattedDate ? `(${formattedDate})` : ''}
                </p>
              </div>
            </div>

            {/* SELEÇÃO DO REMETENTE / CANAL DE DISPARO */}
            <div className="mb-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <label className="block text-xs font-bold text-slate-800 mb-2">
                Decida de qual canal de WhatsApp a mensagem será disparada:
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {/* Opção Pastor Titular */}
                <button
                  type="button"
                  onClick={() => setSenderRole('pastor')}
                  className={`p-2.5 rounded-xl border text-left transition-all flex flex-col ${
                    senderRole === 'pastor'
                      ? 'bg-amber-50 border-amber-400 text-amber-950 font-bold shadow-xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <span>👑 Pastor Titular</span>
                  </span>
                  <span className="text-[11px] font-normal text-slate-500 mt-0.5 truncate">
                    {pastorName}
                  </span>
                  <span className="text-[10px] text-amber-800 font-mono mt-0.5 truncate">
                    {pastorPhone || '⚠️ Não cadastrado'}
                  </span>
                </button>

                {/* Opção Gabinete Pastoral */}
                <button
                  type="button"
                  onClick={() => setSenderRole('gabinete')}
                  className={`p-2.5 rounded-xl border text-left transition-all flex flex-col ${
                    senderRole === 'gabinete'
                      ? 'bg-sky-50 border-sky-400 text-sky-950 font-bold shadow-xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <span>🏛️ Gabinete Pastoral</span>
                  </span>
                  <span className="text-[11px] font-normal text-slate-500 mt-0.5">
                    Canal do Gabinete
                  </span>
                  <span className="text-[10px] text-sky-800 font-mono mt-0.5 truncate">
                    {gabinetePhone || '⚠️ Não cadastrado'}
                  </span>
                </button>
              </div>
            </div>

            {/* ALERTA SE O NÚMERO DO CANAL ESCOLHIDO NÃO ESTIVER CADASTRADO */}
            {isSenderPhoneMissing && (
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-xs text-amber-900 mb-4 animate-in fade-in space-y-2">
                <div className="flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">
                      O telefone do {senderRole === 'pastor' ? 'Pastor Titular' : 'Gabinete Pastoral'} ainda não foi cadastrado!
                    </p>
                    <p className="text-amber-800 text-[11px] mt-0.5">
                      Para disparar mensagens de aniversário de casamento ou de nova idade, o sistema requer o cadastro do telefone do pastor titular e do gabinete pastoral.
                    </p>
                  </div>
                </div>

                {!isQuickEditing ? (
                  <button
                    type="button"
                    onClick={() => setIsQuickEditing(true)}
                    className="w-full py-1.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition-colors"
                  >
                    Cadastrar Telefones Agora
                  </button>
                ) : (
                  <form onSubmit={handleSaveQuickNumbers} className="pt-2 border-t border-amber-200/80 space-y-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                        WhatsApp do Pastor Titular:
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: (DDD) 99999-9999"
                        value={quickPastorPhone}
                        onChange={e => setQuickPastorPhone(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl bg-white border border-amber-300 text-xs text-slate-900 outline-none focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                        WhatsApp do Gabinete Pastoral:
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: (DDD) 99999-9999"
                        value={quickGabinetePhone}
                        onChange={e => setQuickGabinetePhone(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl bg-white border border-amber-300 text-xs text-slate-900 outline-none focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                    <div className="flex gap-2 justify-end pt-1">
                      <button
                        type="button"
                        onClick={() => setIsQuickEditing(false)}
                        className="px-3 py-1 rounded-lg bg-amber-100 text-amber-800 font-semibold text-xs"
                      >
                        Fechar
                      </button>
                      <button
                        type="submit"
                        className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1"
                      >
                        <Save className="w-3.5 h-3.5" />
                        Salvar Telefones
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* Telefone do Destinatário */}
            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>WhatsApp de {personName} {isChild && guardianName ? `(Pais: ${guardianName})` : ''}:</span>
              </label>
              <input
                type="text"
                placeholder="(DDD) 99999-9999"
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
                {/* 1. Enviar para Destinatário */}
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

              {/* 3. Encaminhar para WhatsApp do Pastor ou do Gabinete */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleOpenWhatsAppPastor}
                  className="w-full py-2 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-200 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 truncate"
                  title={`Encaminhar texto para WhatsApp do Pastor: ${pastorPhone || 'Não cadastrado'}`}
                >
                  <Send className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span className="truncate">Encaminhar p/ Pastor</span>
                </button>

                <button
                  type="button"
                  onClick={handleOpenWhatsAppGabinete}
                  className="w-full py-2 px-3 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-950 border border-sky-200 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 truncate"
                  title={`Encaminhar texto para WhatsApp do Gabinete: ${gabinetePhone || 'Não cadastrado'}`}
                >
                  <Send className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                  <span className="truncate">Encaminhar p/ Gabinete</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
