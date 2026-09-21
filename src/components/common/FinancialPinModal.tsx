import React, { useState } from 'react';
import { Lock, KeyRound, AlertTriangle, CheckCircle2, X } from 'lucide-react';
import { useChurch } from '../../context/ChurchContext';
import { useNotification } from '../../context/NotificationContext';

interface FinancialPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const FinancialPinModal: React.FC<FinancialPinModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { currentChurch, unlockFinancial, changeFinancialPin } = useChurch();
  const { showToast } = useNotification();

  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isChangingPin, setIsChangingPin] = useState(false);
  const [currentPinInput, setCurrentPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');

  if (!isOpen) return null;

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const ok = unlockFinancial(pin);
    if (ok) {
      showToast('Acesso financeiro liberado com sucesso!', 'success');
      onSuccess();
      onClose();
    } else {
      setError('PIN ou senha incorreta. Tente novamente ou use a senha master.');
    }
  };

  const handleChangePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPinInput !== confirmPinInput) {
      setError('A confirmação do novo PIN não confere.');
      return;
    }

    const result = changeFinancialPin(currentPinInput, newPinInput);
    if (result.success) {
      showToast(result.message, 'success');
      setIsChangingPin(false);
      onSuccess();
      onClose();
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 text-slate-800">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Módulo Financeiro Protegido</h3>
            <p className="text-xs text-slate-500">
              {currentChurch.name} • Acesso Restrito
            </p>
          </div>
        </div>

        {!currentChurch.financialPinChanged && !isChangingPin && (
          <div className="mb-4 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Senha inicial padrão ativa: 0000</p>
              <p className="text-amber-800 mt-0.5">
                Recomendamos que você altere este PIN para garantir a segurança dos dízimos e ofertas da igreja.
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {!isChangingPin ? (
          <form onSubmit={handleUnlock} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Digite o PIN ou Senha Financeira
              </label>
              <input
                type="password"
                maxLength={10}
                autoFocus
                placeholder="Ex: 0000"
                value={pin}
                onChange={e => setPin(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none text-center text-xl tracking-widest text-slate-900 font-mono placeholder:tracking-normal placeholder:text-sm placeholder:text-slate-400 transition-colors"
              />
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-sm shadow-lg shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <KeyRound className="w-4 h-4" />
                Desbloquear Acesso Financeiro
              </button>

              <button
                type="button"
                onClick={() => setIsChangingPin(true)}
                className="text-xs text-sky-600 hover:text-sky-700 font-semibold transition-colors py-1 text-center"
              >
                Alterar senha/PIN financeiro da igreja
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleChangePinSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                PIN Atual
              </label>
              <input
                type="password"
                placeholder="Padrão inicial: 0000"
                value={currentPinInput}
                onChange={e => setCurrentPinInput(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-sky-500 font-mono transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Novo PIN (mínimo 4 dígitos)
              </label>
              <input
                type="password"
                placeholder="Digite o novo PIN"
                value={newPinInput}
                onChange={e => setNewPinInput(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-sky-500 font-mono transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Confirmar Novo PIN
              </label>
              <input
                type="password"
                placeholder="Confirme o novo PIN"
                value={confirmPinInput}
                onChange={e => setConfirmPinInput(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-sky-500 font-mono transition-colors"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => { setIsChangingPin(false); setError(''); }}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
              >
                Voltar
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-sky-500/20"
              >
                <CheckCircle2 className="w-4 h-4" />
                Salvar Novo PIN
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
