import React, { useState } from 'react';
import { ShieldCheck, Lock, User, ArrowRight, Building2, Code2, Sparkles, CheckCircle2, AlertCircle, KeyRound, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useChurch } from '../../context/ChurchContext';
import { useNotification } from '../../context/NotificationContext';
import { setupDemoChurch } from '../../services/demoChurch';

export const LoginPage: React.FC = () => {
  const { loginChurch, loginChurchDirect, loginAsMaster } = useAuth();
  const { allChurches, selectChurch, changeChurchPassword } = useChurch();
  const { showToast } = useNotification();

  // Aba ativa: 'igreja' ou 'master'
  const [activeTab, setActiveTab] = useState<'igreja' | 'master'>('igreja');

  // Campos do Login da Igreja (Inicia LIMBO / Neutro)
  const [churchLogin, setChurchLogin] = useState('');
  const [churchPassword, setChurchPassword] = useState('');

  // Estados para troca obrigatória de senha provisória / resetada
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [changePasswordTarget, setChangePasswordTarget] = useState<{ churchId: string; login: string } | null>(null);
  const [currentPassInput, setCurrentPassInput] = useState('');
  const [newPassInput, setNewPassInput] = useState('');
  const [confirmPassInput, setConfirmPassInput] = useState('');
  const [changePassError, setChangePassError] = useState('');

  // Detecção dinâmica da igreja ao digitar
  const trimmedLogin = churchLogin.trim().toLowerCase();
  const matchedChurch = trimmedLogin 
    ? allChurches.find(c => 
        (c.loginUser && c.loginUser.toLowerCase() === trimmedLogin) ||
        (c.slug && c.slug.toLowerCase() === trimmedLogin) ||
        (c.name && c.name.toLowerCase() === trimmedLogin)
      )
    : null;

  // Campo do Login Master de Saulo Monteiro
  const [masterPassword, setMasterPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleChurchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!churchLogin.trim()) {
      setErrorMsg('Informe o login da sua igreja.');
      return;
    }

    const res = loginChurch(churchLogin, churchPassword);
    if (res.success) {
      if (res.mustChangePassword) {
        setChangePasswordTarget({
          churchId: res.churchId,
          login: churchLogin
        });
        setCurrentPassInput(churchPassword);
        setNewPassInput('');
        setConfirmPassInput('');
        setChangePassError('');
        setIsChangePasswordOpen(true);
        return;
      }
      selectChurch(res.churchId);
      const target = allChurches.find(c => c.id === res.churchId);
      showToast(`Bem-vindo à ${target?.name || 'sua igreja'}!`, 'success');
    } else {
      setErrorMsg(res.message || 'Credenciais inválidas para esta igreja.');
    }
  };

  const handleChangePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setChangePassError('');

    if (!changePasswordTarget) return;

    if (!currentPassInput) {
      setChangePassError('Informe a senha atual / provisória.');
      return;
    }

    if (!newPassInput || newPassInput.length < 4) {
      setChangePassError('A nova senha deve ter no mínimo 4 caracteres.');
      return;
    }

    if (newPassInput !== confirmPassInput) {
      setChangePassError('A confirmação da nova senha não coincide.');
      return;
    }

    const res = changeChurchPassword(changePasswordTarget.churchId, currentPassInput, newPassInput);
    if (!res.success) {
      setChangePassError(res.message);
      return;
    }

    // Sucesso: autentica e entra no sistema
    selectChurch(changePasswordTarget.churchId);
    loginChurchDirect(changePasswordTarget.churchId);
    setIsChangePasswordOpen(false);
    const target = allChurches.find(c => c.id === changePasswordTarget.churchId);
    showToast(`Nova senha cadastrada com sucesso! Bem-vindo à ${target?.name || 'sua congregação'}.`, 'success');
  };

  const handleOpenDemo = () => {
    setErrorMsg('');
    const demo = setupDemoChurch();
    const res = loginChurch(demo.loginUser || 'demo', demo.loginPassword || 'demo');
    if (res.success) {
      selectChurch(res.churchId);
      showToast('Ambiente de Demonstração carregado com sucesso!', 'success');
    }
  };

  const handleMasterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const ok = loginAsMaster(masterPassword);
    if (ok) {
      showToast('Acesso Master SaaS concedido! Bem-vindo, Saulo Monteiro.', 'success');
    } else {
      setErrorMsg('Senha Master incorreta.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-sky-50 to-blue-50 flex flex-col justify-between p-4 sm:p-6 text-slate-800">
      <div className="flex-1 flex flex-col items-center justify-center max-w-md w-full mx-auto py-8">
        
        {/* Logotipo / Marca Saulo Monteiro */}
        <div className="text-center mb-6 animate-in fade-in">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-600 to-blue-700 text-white shadow-lg shadow-sky-600/30 mb-3">
            <Code2 className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-wider">
            SAULO MONTEIRO
          </h1>
          <p className="text-xs font-bold text-sky-700 tracking-wider">
            SISTEMAS & DESENVOLVIMENTO
          </p>
        </div>

        {/* 2. CARD PRINCIPAL DE LOGIN */}
        <div className="w-full rounded-3xl bg-white border border-slate-200/90 shadow-xl shadow-slate-200/60 p-6 sm:p-8 animate-in fade-in">
          
          {/* Seletor de Abas: Igreja vs Master Admin */}
          <div className="flex p-1 rounded-2xl bg-slate-100 border border-slate-200 mb-6">
            <button
              type="button"
              onClick={() => { setActiveTab('igreja'); setErrorMsg(''); }}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'igreja'
                  ? 'bg-white text-sky-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Building2 className="w-4 h-4 text-sky-600" />
              <span>Acesso da Igreja</span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('master'); setErrorMsg(''); }}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'master'
                  ? 'bg-gradient-to-r from-sky-600 to-blue-700 text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-cyan-300" />
              <span>Master Admin</span>
            </button>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* FORMULÁRIO 1: LOGIN DA IGREJA */}
          {activeTab === 'igreja' && (
            <form onSubmit={handleChurchSubmit} className="space-y-4">
              {/* CARD DE IDENTIFICAÇÃO OU AMBIENTE LIMBO */}
              {matchedChurch ? (
                <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-200/80 flex items-center justify-between gap-3 animate-in fade-in transition-all">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-black text-sky-700 text-sm shrink-0 overflow-hidden shadow-sm">
                      {matchedChurch.logoUrl ? (
                        <img src={matchedChurch.logoUrl} alt={matchedChurch.name} className="w-full h-full object-contain p-1" />
                      ) : (
                        <span>{matchedChurch.name.slice(0, 3).toUpperCase()}</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900 truncate">{matchedChurch.name}</h4>
                      <p className="text-[11px] text-sky-700 font-medium truncate">{matchedChurch.city} - {matchedChurch.state}</p>
                    </div>
                  </div>
                  <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Identificada
                  </span>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3 text-slate-500 animate-in fade-in">
                  <div className="w-10 h-10 rounded-xl bg-slate-200/70 text-slate-500 flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-800">Ambiente Eclesiástico</h4>
                    <p className="text-[11px] text-slate-500">Digite seu login abaixo para identificar sua congregação.</p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Login da Igreja
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="Digite o login da sua congregação"
                    value={churchLogin}
                    onChange={e => setChurchLogin(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm outline-none focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Senha de Acesso
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={churchPassword}
                    onChange={e => setChurchPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm outline-none focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-sky-600 via-blue-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 text-white font-bold text-xs sm:text-sm shadow-lg shadow-sky-600/25 active:scale-95 transition-all flex items-center justify-center gap-2 mt-2"
              >
                <span>Entrar no Sistema da Igreja</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* FORMULÁRIO 2: LOGIN MASTER ADMIN SAULO MONTEIRO */}
          {activeTab === 'master' && (
            <div className="space-y-4">
              <form onSubmit={handleMasterSubmit} className="space-y-4">
                <div className="p-3.5 rounded-2xl bg-blue-50/80 border border-blue-100">
                  <div className="flex items-center gap-2 text-blue-900 font-bold text-xs mb-1">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    <span>Painel Master Exclusivo</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Acesso exclusivo para Saulo Monteiro gerenciar congregações, realizar backups e administrar a plataforma SaaS.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Senha Master de Administrador
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      autoFocus
                      required
                      placeholder="Digite a senha master"
                      value={masterPassword}
                      onChange={e => setMasterPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm outline-none focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all font-mono tracking-wider text-center"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-slate-900 via-blue-900 to-sky-900 hover:from-slate-800 hover:to-sky-800 text-white font-bold text-xs sm:text-sm shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 mt-2"
                >
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  <span>Acessar Painel Master SaaS</span>
                </button>
              </form>
            </div>
          )}

        </div>

        {/* 3. CARD DE ACESSO AO AMBIENTE DE DEMONSTRAÇÃO (ACESSO DIRETO ABAIXO DO LOGIN) */}
        <div className="w-full mt-4 p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xl shadow-slate-200/50 text-center animate-in fade-in">
          <div className="flex items-center justify-center gap-2 mb-1.5">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Quer conhecer o sistema na prática?
            </h3>
          </div>
          <p className="text-[11px] text-slate-500 mb-3.5 max-w-xs mx-auto leading-relaxed">
            Acesse agora a congregação modelo 100% funcional com membros, relatórios, escalas e recursos prontos para demonstração.
          </p>
          <button
            type="button"
            onClick={handleOpenDemo}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-600/25 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-emerald-200" />
            <span>Acessar Ambiente de Demonstração (Demo)</span>
            <ArrowRight className="w-4 h-4 text-emerald-200" />
          </button>
        </div>

        {/* Rodapé Informativo */}
        <div className="mt-5 text-center text-xs text-slate-400">
          Plataforma de Gestão Eclesiástica Multi-Igreja • v1.0 SaaS
        </div>
      </div>

      <footer className="text-center text-xs text-slate-500 font-medium py-4 border-t border-slate-200/60">
        Desenvolvido e comercializado por <strong className="text-slate-700 font-semibold">Saulo Monteiro</strong>, todos os direitos reservados.
      </footer>

      {/* MODAL DE REDEFINIÇÃO DE SENHA OBRIGATÓRIA */}
      {isChangePasswordOpen && changePasswordTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 sm:p-7 text-slate-800 animate-in zoom-in-95">
            <button
              onClick={() => {
                setIsChangePasswordOpen(false);
                setChangePasswordTarget(null);
                setChangePassError('');
              }}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 transition-colors p-1"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3.5 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0 shadow-sm">
                <KeyRound className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Cadastrar Nova Senha
                </h3>
                <p className="text-xs text-slate-500">
                  Redefinição de senha obrigatória
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs mb-4 leading-relaxed">
              <p className="font-semibold mb-1">Acesso inicial ou redefinido pelo Administrador</p>
              <p className="text-[11px] text-amber-800">
                Por motivos de segurança, você precisa substituir a senha provisória por uma nova senha permanente para a sua igreja.
              </p>
            </div>

            {changePassError && (
              <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{changePassError}</span>
              </div>
            )}

            <form onSubmit={handleChangePasswordSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Senha Atual / Provisória
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={currentPassInput}
                    onChange={e => setCurrentPassInput(e.target.value)}
                    placeholder="Digite a senha provisória recebida"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-sky-500 font-mono transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nova Senha Definitiva
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    minLength={4}
                    value={newPassInput}
                    onChange={e => setNewPassInput(e.target.value)}
                    placeholder="Digite a nova senha definitiva"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-sky-500 font-mono transition-all"
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5 block">Mínimo de 4 caracteres.</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Confirmar Nova Senha
                </label>
                <div className="relative">
                  <CheckCircle2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    minLength={4}
                    value={confirmPassInput}
                    onChange={e => setConfirmPassInput(e.target.value)}
                    placeholder="Repita a nova senha"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-sky-500 font-mono transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsChangePasswordOpen(false);
                    setChangePasswordTarget(null);
                    setChangePassError('');
                  }}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold text-xs shadow-md shadow-sky-600/25 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Salvar e Entrar</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
