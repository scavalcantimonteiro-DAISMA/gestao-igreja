import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, ArrowRight, Building2, Sparkles, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useChurch } from '../../context/ChurchContext';
import { useNotification } from '../../context/NotificationContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenMaster: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onOpenMaster }) => {
  const { loginUser, switchDemoRole } = useAuth();
  const { currentChurch, allChurches, selectChurch } = useChurch();
  const { showToast } = useNotification();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedChurchId, setSelectedChurchId] = useState(currentChurch.id);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Preencha o e-mail e a senha.', 'error');
      return;
    }

    const ok = loginUser(email, password, selectedChurchId);
    if (ok) {
      selectChurch(selectedChurchId);
      showToast('Login realizado com sucesso!', 'success');
      onClose();
    } else {
      showToast('Credenciais inválidas.', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 text-slate-800">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Marca do Desenvolvedor no Topo */}
        <div className="text-center pb-4 mb-4 border-b border-slate-100">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-700 p-0.5 shadow-md flex items-center justify-center mb-2">
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center text-sky-600 font-mono font-black text-sm">
              &lt;/&gt;
            </div>
          </div>
          <h3 className="font-black text-sm tracking-wider text-slate-900">SAULO MONTEIRO</h3>
          <p className="text-[10px] text-sky-600 font-bold tracking-wide">SISTEMAS & DESENVOLVIMENTO</p>
        </div>

        <h2 className="text-lg font-bold text-slate-900 text-center mb-1">
          Acesso ao Sistema
        </h2>
        <p className="text-xs text-slate-500 text-center mb-5">
          Entre com as credenciais da sua congregação
        </p>

        <form onSubmit={handleLogin} className="space-y-3.5">
          {/* Seletor de Igreja */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Selecionar Igreja / Congregação
            </label>
            <select
              value={selectedChurchId}
              onChange={e => setSelectedChurchId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm outline-none focus:bg-white focus:border-sky-500"
            >
              {allChurches.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.city}-{c.state})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">E-mail</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                placeholder="pastor@cbacolher.com.br"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm outline-none focus:bg-white focus:border-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Senha</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm outline-none focus:bg-white focus:border-sky-500 font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 text-white text-xs sm:text-sm font-bold shadow-lg shadow-sky-600/20 active:scale-95 transition-all flex items-center justify-center gap-2 mt-2"
          >
            <span>Entrar no Sistema</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Botão de Acesso Master Saulo */}
        <div className="mt-5 pt-4 border-t border-slate-100 text-center">
          <button
            onClick={() => {
              onClose();
              onOpenMaster();
            }}
            className="text-xs text-sky-600 hover:text-sky-700 font-semibold flex items-center justify-center gap-1.5 mx-auto transition-colors"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Sou o Desenvolvedor (Master Admin Saulo Monteiro)</span>
          </button>
        </div>
      </div>
    </div>
  );
};

interface MasterAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const MasterAdminModal: React.FC<MasterAdminModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { loginAsMaster } = useAuth();
  const { showToast } = useNotification();
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const ok = loginAsMaster(pass);
    if (ok) {
      showToast('Bem-vindo, Saulo Monteiro! Acesso Master SaaS concedido.', 'success');
      onSuccess();
      onClose();
    } else {
      setError('Senha master incorreta.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 text-slate-800">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 border border-sky-200 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900">Login Master SaaS Admin</h3>
            <p className="text-xs text-sky-600 font-semibold">Saulo Monteiro - Sistemas & Desenvolvimento</p>
          </div>
        </div>

        <p className="text-xs text-slate-500 mb-4 leading-relaxed">
          Área restrita exclusiva para cadastro de novas congregações e controle multi-tenant da plataforma.
        </p>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Senha Master de Administrador
            </label>
            <input
              type="password"
              autoFocus
              placeholder="Digite a senha master"
              value={pass}
              onChange={e => setPass(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-center tracking-widest text-lg outline-none focus:bg-white focus:border-sky-500 font-mono"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 text-white font-bold text-xs sm:text-sm shadow-lg shadow-sky-600/25 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Acessar Painel Master</span>
          </button>
        </form>
      </div>
    </div>
  );
};
