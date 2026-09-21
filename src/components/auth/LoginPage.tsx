import React, { useState } from 'react';
import { ShieldCheck, Lock, User, ArrowRight, Building2, Code2, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useChurch } from '../../context/ChurchContext';
import { useNotification } from '../../context/NotificationContext';

export const LoginPage: React.FC = () => {
  const { loginChurch, loginAsMaster } = useAuth();
  const { selectChurch } = useChurch();
  const { showToast } = useNotification();

  // Aba ativa: 'igreja' ou 'master'
  const [activeTab, setActiveTab] = useState<'igreja' | 'master'>('igreja');

  // Campos do Login da Igreja (Já pré-carregados conforme pedido do usuário)
  const [churchLogin, setChurchLogin] = useState('cbacolher');
  const [churchPassword, setChurchPassword] = useState('0000');

  // Campo do Login Master de Saulo Monteiro
  const [masterPassword, setMasterPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleChurchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const res = loginChurch(churchLogin, churchPassword);
    if (res.success) {
      selectChurch(res.churchId);
      showToast('Bem-vindo à Comunidade Batista Acolher!', 'success');
    } else {
      setErrorMsg(res.message || 'Credenciais inválidas.');
    }
  };

  const handleMasterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const ok = loginAsMaster(masterPassword);
    if (ok) {
      showToast('Acesso Master SaaS concedido! Bem-vindo, Saulo Monteiro.', 'success');
    } else {
      setErrorMsg('Senha Master incorreta. (Dica: 160605)');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-sky-50 to-blue-50 flex flex-col justify-between p-4 sm:p-6 text-slate-800">
      <div className="flex-1 flex flex-col items-center justify-center max-w-md w-full mx-auto py-8">
        
        {/* 1. MARCA OFICIAL SAULO MONTEIRO EM DESTAQUE NO TOPO */}
        <div className="text-center mb-6 animate-in fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-sky-600 via-blue-700 to-indigo-900 p-1 shadow-2xl shadow-sky-500/25 mb-3">
            <div className="w-full h-full bg-slate-900 rounded-[22px] flex items-center justify-center border border-white/20">
              <Code2 className="w-10 h-10 text-cyan-300" />
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            SAULO MONTEIRO
          </h1>
          <p className="text-xs sm:text-sm font-bold text-sky-600 tracking-wider mt-0.5">
            SISTEMAS & DESENVOLVIMENTO
          </p>
          <p className="text-xs text-slate-500 font-medium">
            Soluções Tecnológicas Profissionais
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
              <div className="p-3.5 rounded-2xl bg-sky-50/80 border border-sky-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
                  CBA
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900">Comunidade Batista Acolher</h4>
                  <p className="text-[11px] text-sky-700 font-medium">Maceió - AL • @cbacolher</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Login da Igreja
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="cbacolher"
                    value={churchLogin}
                    onChange={e => setChurchLogin(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm outline-none focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Senha Temporária
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    placeholder="0000"
                    value={churchPassword}
                    onChange={e => setChurchPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm outline-none focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all font-mono"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Senha temporária configurada: <strong className="text-slate-600 font-mono">0000</strong>
                </p>
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
            <form onSubmit={handleMasterSubmit} className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-blue-50/80 border border-blue-100">
                <div className="flex items-center gap-2 text-blue-900 font-bold text-xs mb-1">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>Painel Master Exclusivo</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Acesso para Saulo Monteiro cadastrar novas congregações, gerenciar assinaturas e supervisionar o sistema SaaS.
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
                    placeholder="Digite a senha (160605)"
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
          )}

        </div>

        {/* Rodapé Informativo */}
        <div className="mt-6 text-center text-xs text-slate-400">
          Plataforma de Gestão Eclesiástica Multi-Igreja • v1.0 SaaS
        </div>
      </div>

      <footer className="text-center text-[11px] text-slate-400 py-3">
        © {new Date().getFullYear()} Saulo Monteiro — Sistemas & Desenvolvimento. Todos os direitos reservados.
      </footer>
    </div>
  );
};
