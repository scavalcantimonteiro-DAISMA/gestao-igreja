import React, { useState } from 'react';
import { 
  Menu, 
  Search, 
  Bell, 
  FileText, 
  LogOut, 
  ChevronDown, 
  Building2, 
  ShieldCheck, 
  UserCheck, 
  Lock, 
  Sparkles,
  Cake,
  HeartHandshake,
  Calendar
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useChurch } from '../../context/ChurchContext';
import { ChurchBrandLogo } from '../common/ChurchBrandLogo';
import { SauloBrandBadge } from '../common/SauloBrandBadge';
import { DailyReportModal } from '../common/DailyReportModal';
import { getBirthdays, getWeddingAnniversaries, getPastoralAppointments } from '../../services/storage';

interface HeaderProps {
  onToggleSidebar: () => void;
  onOpenMasterAdmin: () => void;
  onOpenLogin: () => void;
  searchTerm: string;
  onSearchChange: (val: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  onOpenMasterAdmin,
  searchTerm,
  onSearchChange,
  activeTab,
  setActiveTab
}) => {
  const { currentUser, logout, switchDemoRole, isMasterAdmin } = useAuth();
  const { currentChurch, allChurches, selectChurch } = useChurch();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showChurchSwitcher, setShowChurchSwitcher] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showDailyReport, setShowDailyReport] = useState(false);

  // Contadores para o sino de notificações
  const { today: bdaysToday } = getBirthdays(currentChurch.id);
  const { today: weddingsToday } = getWeddingAnniversaries(currentChurch.id);
  const apptsToday = getPastoralAppointments(currentChurch.id).filter(a => a.date === '2026-09-21' || a.date === new Date().toISOString().split('T')[0]);
  const notificationCount = bdaysToday.length + weddingsToday.length + apptsToday.length;

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 py-3 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-sm">
        {/* Esquerda: Botão Menu Mobile + Logo da Igreja */}
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 lg:hidden transition-colors"
            title="Abrir Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 min-w-0">
            <ChurchBrandLogo church={currentChurch} variant="compact" />

            {/* Seletor de Igrejas (SaaS) */}
            {allChurches.length > 1 && (
              <div className="relative hidden md:block">
                <button
                  onClick={() => setShowChurchSwitcher(!showChurchSwitcher)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 text-xs font-semibold transition-all"
                >
                  <Building2 className="w-3.5 h-3.5 text-sky-600" />
                  <span>Trocar Igreja</span>
                  <ChevronDown className="w-3 h-3 text-sky-600" />
                </button>

                {showChurchSwitcher && (
                  <div className="absolute left-0 mt-2 w-64 rounded-2xl bg-white border border-slate-200 shadow-2xl p-2 z-50 animate-in fade-in">
                    <p className="px-2.5 py-1.5 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Congregações Cadastradas (SaaS)
                    </p>
                    {allChurches.map(c => (
                      <button
                        key={c.id}
                        onClick={() => {
                          selectChurch(c.id);
                          setShowChurchSwitcher(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                          c.id === currentChurch.id
                            ? 'bg-sky-50 text-sky-800 font-bold border border-sky-200'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex flex-col text-left">
                          <span className="font-semibold">{c.name}</span>
                          <span className="text-[10px] text-slate-500">{c.city} - {c.state}</span>
                        </div>
                        {c.id === currentChurch.id && (
                          <span className="w-2 h-2 rounded-full bg-sky-600"></span>
                        )}
                      </button>
                    ))}

                    {isMasterAdmin && (
                      <button
                        onClick={() => {
                          setActiveTab('master');
                          setShowChurchSwitcher(false);
                        }}
                        className="w-full mt-2 pt-2 border-t border-slate-100 flex items-center gap-2 px-3 py-1.5 text-xs text-sky-600 hover:text-sky-700 font-semibold"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                        + Cadastrar Nova Igreja (SaaS)
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Centro: Barra de Pesquisa Global */}
        <div className="hidden lg:flex items-center flex-1 max-w-md mx-6">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Pesquisa global (membro, CPF, telefone, endereço)..."
              value={searchTerm}
              onChange={e => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-100/90 border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all shadow-inner"
            />
            {searchTerm && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700"
              >
                Limpar
              </button>
            )}
          </div>
        </div>

        {/* Direita: Saulo Badge, Relatório Diário, Notificações e Perfil */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Badge Saulo Monteiro */}
          <SauloBrandBadge onOpenMaster={onOpenMasterAdmin} compact={true} />

          {/* Botão Relatório Diário do Pastor */}
          <button
            onClick={() => setShowDailyReport(true)}
            title="Gerar Relatório Diário do Pastor"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 text-xs font-semibold shadow-sm transition-all"
          >
            <FileText className="w-4 h-4 text-sky-600" />
            <span className="hidden xl:inline">Relatório Diário</span>
          </button>

          {/* Sino de Notificações */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
              title="Notificações do Dia"
            >
              <Bell className="w-4 h-4" />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center shadow animate-pulse">
                  {notificationCount}
                </span>
              )}
            </button>

            {/* Dropdown de Notificações */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 rounded-3xl bg-white border border-slate-200 shadow-2xl p-4 z-50 animate-in fade-in">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <Bell className="w-4 h-4 text-sky-600" /> Notificações de Hoje
                  </h4>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
                    {notificationCount} alertas
                  </span>
                </div>

                <div className="py-2 space-y-2.5 max-h-72 overflow-y-auto">
                  {bdaysToday.length > 0 && (
                    <div className="p-2.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs">
                      <div className="font-bold text-amber-800 flex items-center gap-1.5 mb-1">
                        <Cake className="w-3.5 h-3.5 text-amber-600" /> {bdaysToday.length} Aniversário(s) Hoje!
                      </div>
                      {bdaysToday.map(b => (
                        <div key={b.id} className="text-slate-700 text-[11px] pl-5">
                          {b.name} ({b.age} anos)
                        </div>
                      ))}
                    </div>
                  )}

                  {weddingsToday.length > 0 && (
                    <div className="p-2.5 rounded-2xl bg-pink-50 border border-pink-200 text-xs">
                      <div className="font-bold text-pink-800 flex items-center gap-1.5 mb-1">
                        <HeartHandshake className="w-3.5 h-3.5 text-pink-600" /> {weddingsToday.length} Boda(s) de Casamento!
                      </div>
                      {weddingsToday.map(w => (
                        <div key={w.id} className="text-slate-700 text-[11px] pl-5">
                          {w.coupleName} ({w.yearsMarried} anos)
                        </div>
                      ))}
                    </div>
                  )}

                  {apptsToday.length > 0 && (
                    <div className="p-2.5 rounded-2xl bg-sky-50 border border-sky-200 text-xs">
                      <div className="font-bold text-sky-800 flex items-center gap-1.5 mb-1">
                        <Calendar className="w-3.5 h-3.5 text-sky-600" /> {apptsToday.length} Atendimento(s) no Gabinete
                      </div>
                      {apptsToday.map(a => (
                        <div key={a.id} className="text-slate-700 text-[11px] pl-5">
                          {a.time} - {a.personName}
                        </div>
                      ))}
                    </div>
                  )}

                  {notificationCount === 0 && (
                    <p className="text-xs text-slate-400 text-center py-4">
                      Tudo tranquilo por hoje!
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Menu do Usuário */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-left transition-all"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-600 to-blue-700 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                {currentUser ? currentUser.name[0] : 'U'}
              </div>
              <div className="hidden sm:flex flex-col min-w-0">
                <span className="text-xs font-bold text-slate-900 truncate max-w-[120px]">
                  {currentUser?.name || 'Convidado'}
                </span>
                <span className="text-[10px] text-sky-700 font-semibold">
                  {currentUser?.role === 'SUPERADMIN' ? 'Master Admin' : currentUser?.role || 'Usuário'}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 hidden sm:block" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-64 rounded-3xl bg-white border border-slate-200 shadow-2xl p-3 z-50 animate-in fade-in">
                <div className="pb-3 mb-2 border-b border-slate-100">
                  <p className="font-bold text-xs text-slate-900">{currentUser?.name}</p>
                  <p className="text-[11px] text-slate-500">{currentUser?.email}</p>
                  <span className="inline-block mt-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
                    Perfil: {currentUser?.role}
                  </span>
                </div>

                {/* Demonstração Rápida de Perfis */}
                <div className="space-y-1 mb-3">
                  <p className="px-2 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Alternar Perfil
                  </p>
                  <button
                    onClick={() => { switchDemoRole('ADMIN', currentChurch.id); setShowUserMenu(false); }}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors ${currentUser?.role === 'ADMIN' ? 'bg-sky-50 text-sky-700 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    <UserCheck className="w-3.5 h-3.5 text-sky-600" />
                    <span>Administrador CBA</span>
                  </button>
                  <button
                    onClick={() => { switchDemoRole('PASTOR', currentChurch.id); setShowUserMenu(false); }}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors ${currentUser?.role === 'PASTOR' ? 'bg-sky-50 text-sky-700 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    <UserCheck className="w-3.5 h-3.5 text-sky-600" />
                    <span>Pastor Presidente</span>
                  </button>
                  <button
                    onClick={() => { switchDemoRole('SECRETARIA', currentChurch.id); setShowUserMenu(false); }}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors ${currentUser?.role === 'SECRETARIA' ? 'bg-sky-50 text-sky-700 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    <span>Secretaria CBA</span>
                  </button>
                  <button
                    onClick={() => { switchDemoRole('TESOURARIA', currentChurch.id); setShowUserMenu(false); }}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors ${currentUser?.role === 'TESOURARIA' ? 'bg-amber-50 text-amber-700 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    <Lock className="w-3.5 h-3.5 text-amber-500" />
                    <span>Tesouraria CBA</span>
                  </button>
                </div>

                <div className="pt-2 border-t border-slate-100 flex flex-col gap-1">
                  <button
                    onClick={() => {
                      logout();
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-rose-600 hover:bg-rose-50 font-semibold transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Desconectar e Voltar ao Login
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Modal Relatório Diário */}
      <DailyReportModal isOpen={showDailyReport} onClose={() => setShowDailyReport(false)} />
    </>
  );
};
