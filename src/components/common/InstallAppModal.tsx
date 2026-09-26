import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X, Check, Share, PlusSquare, Monitor, Church as ChurchIcon } from 'lucide-react';
import { useChurch } from '../../context/ChurchContext';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const InstallAppModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { currentChurch } = useChurch();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone;
    if (isStandalone) {
      setIsInstalled(true);
    }

    const ua = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(ua);
    setIsIOS(isIosDevice);

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
        onClose();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 text-slate-800">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-13 h-13 rounded-2xl bg-sky-600 text-white flex items-center justify-center p-2 shadow-md shadow-sky-600/25 overflow-hidden">
            {currentChurch.logoUrl ? (
              <img src={currentChurch.logoUrl} alt={currentChurch.name} className="w-full h-full object-contain" />
            ) : (currentChurch.slug === 'cbacolher' || currentChurch.id === 'church_cba_maceio') ? (
              <img src="/logo-cba.png" alt="Logo CBA" className="w-full h-full object-contain" />
            ) : (
              <ChurchIcon className="w-7 h-7 text-white" />
            )}
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-900 leading-tight">Instalar Aplicativo (App)</h3>
            <p className="text-xs text-sky-700 font-semibold">{currentChurch.name}</p>
          </div>
        </div>

        {isInstalled ? (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2.5 mb-4">
            <Check className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>O aplicativo já está instalado no seu dispositivo! Acesse pelo ícone na tela inicial.</span>
          </div>
        ) : (
          <div className="space-y-4 text-xs text-slate-600 mb-5">
            <p className="leading-relaxed">
              Instale o aplicativo da igreja no seu celular ou computador para acessar rapidamente escalas, aniversariantes, agenda pastoral e avisos sem precisar digitar o endereço!
            </p>

            {deferredPrompt && (
              <button
                type="button"
                onClick={handleInstallClick}
                className="w-full py-3 px-4 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm shadow-md shadow-sky-600/20 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Instalar Agora no Meu Dispositivo</span>
              </button>
            )}

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="font-bold text-slate-800 block">Como instalar manualmente:</span>

              {isIOS ? (
                <div className="space-y-1.5 text-slate-600">
                  <div className="flex items-center gap-2">
                    <Share className="w-4 h-4 text-sky-600 shrink-0" />
                    <span>1. Toque no botão <strong>Compartilhar</strong> (no Safari).</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <PlusSquare className="w-4 h-4 text-sky-600 shrink-0" />
                    <span>2. Role para baixo e escolha <strong>Adicionar à Tela de Início</strong>.</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5 text-slate-600">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span><strong>No Android / Celular:</strong> Abra pelo Google Chrome, toque nos 3 pontinhos no canto superior e escolha <strong>"Instalar Aplicativo"</strong>.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Monitor className="w-4 h-4 text-blue-600 shrink-0" />
                    <span><strong>No Computador:</strong> Clique no ícone de instalar (computador com seta) na barra de endereços do Chrome ou Edge.</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
