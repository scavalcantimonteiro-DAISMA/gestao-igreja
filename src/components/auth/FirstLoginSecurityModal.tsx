import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  KeyRound, 
  DollarSign, 
  Building2, 
  CheckCircle2, 
  AlertTriangle, 
  Eye, 
  EyeOff, 
  Sparkles,
  X
} from 'lucide-react';
import { Church } from '../../types';
import { useChurch } from '../../context/ChurchContext';
import { useNotification } from '../../context/NotificationContext';

interface FirstLoginSecurityModalProps {
  isOpen: boolean;
  church: Church;
  onSuccess: () => void;
  onClose?: () => void;
}

export const FirstLoginSecurityModal: React.FC<FirstLoginSecurityModalProps> = ({
  isOpen,
  church,
  onSuccess,
  onClose
}) => {
  const { setupInitialSecurity } = useChurch();
  const { showToast } = useNotification();

  // Estados dos campos
  const [newLoginPass, setNewLoginPass] = useState('');
  const [confirmLoginPass, setConfirmLoginPass] = useState('');

  const [newFinancialPin, setNewFinancialPin] = useState('');
  const [confirmFinancialPin, setConfirmFinancialPin] = useState('');

  const [subsidiaryMasterPass, setSubsidiaryMasterPass] = useState(church.subsidiaryMasterPassword || '');
  const [confirmSubsidiaryMasterPass, setConfirmSubsidiaryMasterPass] = useState(church.subsidiaryMasterPassword || '');

  // Visibilidade de senhas
  const [showLoginPass, setShowLoginPass] = useState(false);
  const [showFinancialPin, setShowFinancialPin] = useState(false);
  const [showMasterPass, setShowMasterPass] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const isHeadquarters = Boolean(church.isHeadquarters);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // 1. Validação de Senha de Login
    const trimmedLogin = newLoginPass.trim();
    if (!trimmedLogin || trimmedLogin.length < 4) {
      setErrorMsg('A nova senha de login da igreja deve ter no mínimo 4 caracteres.');
      return;
    }
    if (trimmedLogin !== confirmLoginPass.trim()) {
      setErrorMsg('A confirmação da nova senha de login não coincide.');
      return;
    }

    // 2. Validação de PIN Financeiro (Opcional no Primeiro Acesso)
    const trimmedPin = newFinancialPin.trim();
    if (trimmedPin.length > 0) {
      if (trimmedPin.length < 4) {
        setErrorMsg('A senha financeira deve ter no mínimo 4 dígitos ou caracteres caso decida cadastrá-la agora.');
        return;
      }
      if (trimmedPin === '0000') {
        setErrorMsg('A senha financeira não pode ser a senha padrão "0000". Escolha uma senha segura.');
        return;
      }
      if (trimmedPin.toLowerCase() === trimmedLogin.toLowerCase()) {
        setErrorMsg('Por segurança e governança, a senha financeira deve ser OBRIGATORIAMENTE diferente da senha de login.');
        return;
      }
      if (trimmedPin !== confirmFinancialPin.trim()) {
        setErrorMsg('A confirmação da nova senha financeira não coincide.');
        return;
      }
    }

    // 3. Validação de Senha Master (se for Sede)
    if (isHeadquarters) {
      const trimmedMaster = subsidiaryMasterPass.trim();
      if (!trimmedMaster || trimmedMaster.length < 4) {
        setErrorMsg('Como esta igreja é uma SEDE, defina a Senha Master para visualização das congregações (mínimo 4 caracteres).');
        return;
      }
      if (trimmedMaster !== confirmSubsidiaryMasterPass.trim()) {
        setErrorMsg('A confirmação da senha master de congregações não coincide.');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const res = await setupInitialSecurity(church.id, {
        newLoginPassword: trimmedLogin,
        newFinancialPin: trimmedPin.length > 0 ? trimmedPin : undefined,
        subsidiaryMasterPassword: isHeadquarters ? subsidiaryMasterPass.trim() : undefined
      });

      if (res.success) {
        showToast('Credenciais de segurança salvas com sucesso! Bem-vindo.', 'success');
        onSuccess();
      } else {
        setErrorMsg(res.message);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Ocorreu um erro ao salvar as senhas.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg my-8 rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 sm:p-8 text-slate-800">
        
        {/* Botão de Fechar no Canto Superior Direito */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-2xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title="Fechar Janela"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Cabeçalho */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-sky-50 border border-sky-200 text-sky-700 flex items-center justify-center shadow-sm">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            Primeiro Acesso • Configuração de Segurança
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            Defina as Senhas de Acesso
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Para garantir a privacidade e segurança da <strong>{church.name}</strong>, personalize as credenciais de cada módulo protegido antes de iniciar.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-in shake">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span className="font-semibold">{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* MÓDULO 1: SENHA DE LOGIN PRINCIPAL */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
              <div className="w-6 h-6 rounded-lg bg-sky-100 text-sky-800 flex items-center justify-center">
                <Lock className="w-3.5 h-3.5" />
              </div>
              <span>1. Senha Principal de Acesso (Login Diário) *</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Nova Senha *</label>
                <div className="relative">
                  <input
                    type={showLoginPass ? 'text' : 'password'}
                    value={newLoginPass}
                    onChange={e => setNewLoginPass(e.target.value)}
                    placeholder="Mínimo 4 dígitos"
                    required
                    className="w-full pl-3 pr-8 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPass(!showLoginPass)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showLoginPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Confirmar Nova Senha *</label>
                <input
                  type={showLoginPass ? 'text' : 'password'}
                  value={confirmLoginPass}
                  onChange={e => setConfirmLoginPass(e.target.value)}
                  placeholder="Repita a senha"
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                />
              </div>
            </div>
          </div>

          {/* MÓDULO 2: SENHA DO MÓDULO FINANCEIRO (OPCIONAL NO PRIMEIRO ACESSO) */}
          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/90 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-950 font-bold text-xs">
                <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <DollarSign className="w-3.5 h-3.5" />
                </div>
                <span>2. Senha do Módulo Financeiro (PIN)</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                Opcional no 1º Acesso
              </span>
            </div>

            <p className="text-[11px] text-emerald-800/80">
              Protege dízimos e despesas bancárias. Se preferir não cadastrar agora, o sistema solicitará quando você acessar a aba Financeiro.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Nova Senha Financeira (Opcional)</label>
                <div className="relative">
                  <input
                    type={showFinancialPin ? 'text' : 'password'}
                    value={newFinancialPin}
                    onChange={e => setNewFinancialPin(e.target.value)}
                    placeholder="Definir agora ou depois"
                    className="w-full pl-3 pr-8 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowFinancialPin(!showFinancialPin)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showFinancialPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Confirmar Senha Financeira</label>
                <input
                  type={showFinancialPin ? 'text' : 'password'}
                  value={confirmFinancialPin}
                  onChange={e => setConfirmFinancialPin(e.target.value)}
                  placeholder="Repita caso tenha preenchido"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                />
              </div>
            </div>
          </div>

          {/* MÓDULO 3: SE FOR SEDE COM FILIAIS - SENHA MASTER DE CONGREGAÇÕES */}
          {isHeadquarters && (
            <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-indigo-950 font-bold text-xs">
                  <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center">
                    <Building2 className="w-3.5 h-3.5" />
                  </div>
                  <span>3. Senha Master para Visualizar Congregações Filhas</span>
                </div>
                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">
                  Igreja Sede
                </span>
              </div>

              <p className="text-[11px] text-indigo-800/80">
                Essa senha será solicitada toda vez que o pastor da sede alternar para gerenciar ou auditar uma congregação filha no topo da tela.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Senha Master da Sede *</label>
                  <div className="relative">
                    <input
                      type={showMasterPass ? 'text' : 'password'}
                      value={subsidiaryMasterPass}
                      onChange={e => setSubsidiaryMasterPass(e.target.value)}
                      placeholder="Mínimo 4 caracteres"
                      required
                      className="w-full pl-3 pr-8 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowMasterPass(!showMasterPass)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showMasterPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Confirmar Senha Master *</label>
                  <input
                    type={showMasterPass ? 'text' : 'password'}
                    value={confirmSubsidiaryMasterPass}
                    onChange={e => setConfirmSubsidiaryMasterPass(e.target.value)}
                    placeholder="Repita a senha master"
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* BOTÕES DE AÇÃO */}
          <div className="flex items-center gap-3 pt-2">
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="w-1/3 py-3.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition-all text-center"
              >
                Cancelar
              </button>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`${onClose ? 'w-2/3' : 'w-full'} py-3.5 px-4 rounded-2xl bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 text-white font-bold text-sm shadow-lg shadow-sky-600/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50`}
            >
              {isSubmitting ? (
                <span>Gravando credenciais...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Salvar Credenciais</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
