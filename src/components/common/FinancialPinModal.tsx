import React, { useState } from 'react';
import { Lock, KeyRound, AlertTriangle, CheckCircle2, X, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useChurch } from '../../context/ChurchContext';
import { useNotification } from '../../context/NotificationContext';

interface FinancialPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const FinancialPinModal: React.FC<FinancialPinModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { currentChurch, unlockFinancial, changeFinancialPin, setupInitialFinancialPin } = useChurch();
  const { showToast } = useNotification();

  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isChangingPin, setIsChangingPin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Estados para primeiro cadastro ou alteração
  const [currentPinInput, setCurrentPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');

  if (!isOpen) return null;

  // Se a congregação ainda não definiu a senha financeira personalizada ou foi resetada pelo Admin
  const isSetupRequired = !currentChurch.financialPinChanged || !currentChurch.financialPin || currentChurch.financialPin === '0000';

  // Desbloqueio com senha existente
  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const ok = unlockFinancial(pin);
    if (ok) {
      showToast('Acesso financeiro liberado com sucesso!', 'success');
      onSuccess();
      onClose();
    } else {
      setError('Senha financeira incorreta. Tente novamente ou utilize a senha master.');
    }
  };

  // Cadastro inicial obrigatório de senha (diferente da do login)
  const handleSetupInitialPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPinInput.trim().length < 4) {
      setError('A nova senha financeira deve ter no mínimo 4 dígitos ou caracteres.');
      return;
    }

    const churchLoginPass = (currentChurch.loginPassword || '').trim();
    if (churchLoginPass && newPinInput.trim().toLowerCase() === churchLoginPass.toLowerCase()) {
      setError('A senha financeira deve ser OBRIGATORIAMENTE diferente da senha de login da igreja.');
      return;
    }

    if (newPinInput !== confirmPinInput) {
      setError('A confirmação da nova senha não confere.');
      return;
    }

    const res = await setupInitialFinancialPin(newPinInput);
    if (res.success) {
      showToast(res.message, 'success');
      onSuccess();
      onClose();
    } else {
      setError(res.message);
    }
  };

  // Alteração voluntária de senha existente
  const handleChangePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPinInput.trim().length < 4) {
      setError('A nova senha financeira deve ter no mínimo 4 dígitos ou caracteres.');
      return;
    }

    const churchLoginPass = (currentChurch.loginPassword || '').trim();
    if (churchLoginPass && newPinInput.trim().toLowerCase() === churchLoginPass.toLowerCase()) {
      setError('A senha financeira deve ser OBRIGATORIAMENTE diferente da senha de login da igreja.');
      return;
    }

    if (newPinInput !== confirmPinInput) {
      setError('A confirmação do novo PIN não confere.');
      return;
    }

    const result = await changeFinancialPin(currentPinInput, newPinInput);
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
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-xl hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Cabeçalho */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0">
            {isSetupRequired ? <ShieldCheck className="w-6 h-6 text-emerald-600" /> : <Lock className="w-6 h-6" />}
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              {isSetupRequired ? 'Cadastrar Senha Financeira' : 'Módulo Financeiro Protegido'}
            </h3>
            <p className="text-xs text-slate-500">
              {currentChurch.name} • {isSetupRequired ? 'Configuração Obrigatória' : 'Acesso Restrito'}
            </p>
          </div>
        </div>

        {/* MENSAGEM EXPLICATIVA DE CADASTRO OBRIGATÓRIO (Item Solicitado) */}
        {isSetupRequired && (
          <div className="mb-4 p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs space-y-1.5 animate-in fade-in">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Definição de Senha Exclusiva Necessária</p>
                <p className="text-amber-900 text-[11px] leading-relaxed mt-0.5">
                  Para proteger os dízimos, ofertas e relatórios da tesouraria, é obrigatório cadastrar uma senha financeira.
                </p>
                <p className="font-semibold text-rose-700 text-[11px] mt-1 bg-rose-50 p-1.5 rounded-lg border border-rose-200">
                  ⚠️ A senha financeira tem que ser <strong>diferente da senha de login da igreja</strong>.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Mensagem de Erro */}
        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-medium leading-relaxed">{error}</span>
          </div>
        )}

        {/* CASO 1: CADASTRO OBRIGATÓRIO (PRIMEIRO ACESSO OU RESET PELO ADMIN) */}
        {isSetupRequired ? (
          <form onSubmit={handleSetupInitialPin} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nova Senha Financeira * (mínimo 4 caracteres)
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoFocus
                  placeholder="Digite a nova senha financeira"
                  value={newPinInput}
                  onChange={e => {
                    setNewPinInput(e.target.value);
                    if (error) setError('');
                  }}
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 font-mono transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {currentChurch.loginPassword && (
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Não utilize a senha de login da igreja.
                </span>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Confirmar Nova Senha Financeira *
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Repita a nova senha financeira"
                value={confirmPinInput}
                onChange={e => {
                  setConfirmPinInput(e.target.value);
                  if (error) setError('');
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 font-mono transition-colors"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Cadastrar Senha e Acessar Financeiro
              </button>
            </div>
          </form>
        ) : !isChangingPin ? (
          /* CASO 2: DESBLOQUEIO COM SENHA JÁ CADASTRADA */
          <form onSubmit={handleUnlock} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Digite a Senha Financeira da Congregação
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoFocus
                  placeholder="Digite sua senha financeira"
                  value={pin}
                  onChange={e => setPin(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none text-center text-xl tracking-widest text-slate-900 font-mono placeholder:tracking-normal placeholder:text-sm placeholder:text-slate-400 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
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
                onClick={() => {
                  setIsChangingPin(true);
                  setError('');
                  setNewPinInput('');
                  setConfirmPinInput('');
                  setCurrentPinInput('');
                }}
                className="text-xs text-sky-600 hover:text-sky-700 font-semibold transition-colors py-1 text-center"
              >
                Alterar senha financeira da igreja
              </button>
            </div>
          </form>
        ) : (
          /* CASO 3: ALTERAÇÃO DE SENHA EXISTENTE */
          <form onSubmit={handleChangePinSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Senha Financeira Atual
              </label>
              <input
                type="password"
                placeholder="Digite a senha atual"
                value={currentPinInput}
                onChange={e => setCurrentPinInput(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-sky-500 font-mono transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nova Senha Financeira (diferente da de login)
              </label>
              <input
                type="password"
                placeholder="Mínimo 4 caracteres"
                value={newPinInput}
                onChange={e => setNewPinInput(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-sky-500 font-mono transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Confirmar Nova Senha
              </label>
              <input
                type="password"
                placeholder="Confirme a nova senha"
                value={confirmPinInput}
                onChange={e => setConfirmPinInput(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-sky-500 font-mono transition-colors"
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
                Salvar Nova Senha
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
