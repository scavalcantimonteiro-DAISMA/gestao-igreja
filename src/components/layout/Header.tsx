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
  Calendar,
  Smartphone,
  CalendarCheck,
  Eye,
  KeyRound,
  X,
  AlertTriangle,
  Flame
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useChurch } from '../../context/ChurchContext';
import { useNotification } from '../../context/NotificationContext';
import { ChurchBrandLogo } from '../common/ChurchBrandLogo';
import { DailyReportModal } from '../common/DailyReportModal';
import { InstallAppModal } from '../common/InstallAppModal';
import { getBirthdays, getWeddingAnniversaries, getPastoralAppointments } from '../../services/storage';

interface HeaderProps {
  onToggleSidebar: () => void;
  onOpenMasterAdmin: () => void;
  onOpenLogin: () => void;
  searchTerm: string;
  onSearchChange: (val: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onReturnToMaster?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  onOpenMasterAdmin,
  searchTerm,
  onSearchChange,
  activeTab,
  setActiveTab,
  onReturnToMaster
}) => {
  const { currentUser, logout, switchDemoRole, isMasterAdmin } = useAuth();
  const { 
    currentChurch, 
    allChurches, 
    selectChurch, 
    isViewingAsHeadquarters, 
    headquartersChurch, 
    switchToSubsidiary, 
    returnToHeadquarters 
  } = useChurch();
  const { showToast } = useNotification();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showChurchSwitcher, setShowChurchSwitcher] = useState(false);
  const [showSubsidiaryDropdown, setShowSubsidiaryDropdown] = useState(false);
  const [subsidiaryToAccess, setSubsidiaryToAccess] = useState<any | null>(null);
  const [masterPassInput, setMasterPassInput] = useState('');
  const [masterPassError, setMasterPassError] = useState('');
  const [showMasterPass, setShowMasterPass] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showDailyReport, setShowDailyReport] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);

  // Identifica a igreja sede correspondente e suas congregações filhas
  const effectiveHeadquarters = isViewingAsHeadquarters && headquartersChurch 
    ? headquartersChurch 
    : (currentChurch.isHeadquarters || allChurches.some(c => c.parentChurchId === currentChurch.id) ? currentChurch : null);

  const subsidiaries = effectiveHeadquarters 
    ? allChurches.filter(c => c.parentChurchId === effectiveHeadquarters.id)
    : [];

  const handleAccessSubsidiarySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMasterPassError('');

    if (!subsidiaryToAccess) return;

    if (!masterPassInput) {
      setMasterPassError('Informe a Senha Master da Sede.');
      return;
    }

    const res = switchToSubsidiary(subsidiaryToAccess.id, masterPassInput);
    if (res.success) {
      showToast(`Visualizando congregação "${subsidiaryToAccess.name}" em Modo Supervisão`, 'success');
      setSubsidiaryToAccess(null);
      setMasterPassInput('');
      setShowSubsidiaryDropdown(false);
    } else {
      setMasterPassError(res.message || 'Senha Master incorreta.');
    }
  };

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

            {/* BOTÃO: VISUALIZAR CONGREGAÇÃO (EXCLUSIVO PARA IGREJA SEDE E SUAS FILIAIS) */}
            {effectiveHeadquarters && (
              <div className="relative">
                <button
                  onClick={() => setShowSubsidiaryDropdown(!showSubsidiaryDropdown)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-xs ${
                    isViewingAsHeadquarters
                      ? 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300 ring-2 ring-amber-400/40'
                      : 'bg-gradient-to-r from-indigo-50 to-blue-50 hover:from-indigo-100 hover:to-blue-100 text-indigo-900 border-indigo-200'
                  }`}
                  title="Supervisão de Congregações Filhas"
                >
                  <Building2 className={`w-3.5 h-3.5 ${isViewingAsHeadquarters ? 'text-amber-700' : 'text-indigo-600'}`} />
                  <span className="hidden sm:inline">
                    {isViewingAsHeadquarters ? 'Congregação Ativa' : 'Visualizar Congregação'}
                  </span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                    isViewingAsHeadquarters ? 'bg-amber-200 text-amber-900' : 'bg-indigo-200 text-indigo-800'
                  }`}>
                    {subsidiaries.length}
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-500" />
                </button>

                {showSubsidiaryDropdown && (
                  <div className="absolute left-0 mt-2 w-72 rounded-2xl bg-white border border-slate-200 shadow-2xl p-2.5 z-50 animate-in fade-in">
                    <div className="flex items-center justify-between px-2 py-1.5 border-b border-slate-100 mb-1">
                      <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                          Rede da Igreja Sede
                        </p>
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {effectiveHeadquarters.name}
                        </p>
                      </div>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {subsidiaries.length} filial(is)
                      </span>
                    </div>

                    {/* Opção de Voltar para a Igreja Sede (caso esteja visualizando uma filial) */}
                    {isViewingAsHeadquarters && (
                      <button
                        onClick={() => {
                          returnToHeadquarters();
                          setShowSubsidiaryDropdown(false);
                          showToast(`Retornou para a Igreja Sede (${effectiveHeadquarters.name})`, 'success');
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50/80 hover:bg-indigo-100 border border-indigo-200 mb-2 transition-colors text-left"
                      >
                        <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                        <div className="flex-1 min-w-0">
                          <p className="truncate">← Voltar para a Igreja Sede</p>
                          <p className="text-[10px] font-normal text-indigo-600/80">Painel Principal da Sede</p>
                        </div>
                      </button>
                    )}

                    <p className="px-2 py-1 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Congregações Filhas
                    </p>

                    {subsidiaries.length === 0 ? (
                      <div className="p-3 text-center rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-500">
                        Nenhuma congregação filial cadastrada para esta sede ainda.
                      </div>
                    ) : (
                      <div className="max-h-60 overflow-y-auto space-y-1">
                        {subsidiaries.map(sub => {
                          const isCurrentActive = sub.id === currentChurch.id;
                          return (
                            <button
                              key={sub.id}
                              onClick={() => {
                                if (isCurrentActive) {
                                  setShowSubsidiaryDropdown(false);
                                  return;
                                }
                                if (isMasterAdmin) {
                                  selectChurch(sub.id);
                                  showToast(`Visualizando congregação "${sub.name}" (Acesso Administrador Geral)`, 'success');
                                  setShowSubsidiaryDropdown(false);
                                  return;
                                }
                                setSubsidiaryToAccess(sub);
                                setMasterPassInput('');
                                setMasterPassError('');
                                setShowSubsidiaryDropdown(false);
                              }}
                              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors text-left ${
                                isCurrentActive
                                  ? 'bg-amber-50 text-amber-900 font-bold border border-amber-300'
                                  : 'text-slate-700 hover:bg-slate-50'
                              }`}
                            >
                              <div className="min-w-0 flex-1 pr-2">
                                <p className="font-semibold truncate">{sub.name}</p>
                                <p className="text-[10px] text-slate-500 truncate">
                                  {sub.pastorName ? `Pr. ${sub.pastorName}` : (sub.neighborhood || sub.city)}
                                </p>
                              </div>
                              {isCurrentActive ? (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-200 text-amber-900 font-bold shrink-0">
                                  Ativa
                                </span>
                              ) : (
                                <KeyRound className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Seletor de Igrejas (SaaS) - Exclusivo para Saulo Monteiro (Master Admin) */}
            {isMasterAdmin && allChurches.length > 1 && (
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

                    {isMasterAdmin && onReturnToMaster && (
                      <button
                        onClick={() => {
                          setShowChurchSwitcher(false);
                          onReturnToMaster();
                        }}
                        className="w-full mt-2 pt-2 border-t border-slate-100 flex items-center gap-2 px-3 py-1.5 text-xs text-sky-600 hover:text-sky-700 font-semibold"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                        Ir para Painel Master (SaaS)
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Centro: Barra de Pesquisa Global ou Badge de Escala/PG */}
        {currentUser?.role === 'LIDER_ESCALA' ? (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-bold">
            <CalendarCheck className="w-4 h-4 text-indigo-600" />
            <span>Painel Exclusivo de Escalas Ministeriais</span>
          </div>
        ) : currentUser?.role === 'LIDER_PG' ? (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-orange-50 border border-orange-200 text-orange-900 text-xs font-bold">
            <Flame className="w-4 h-4 text-orange-600" />
            <span>Painel Exclusivo de Pequenos Grupos</span>
          </div>
        ) : (
          <div className="hidden lg:flex items-center flex-1 max-w-md mx-6">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Pesquisa global (membro, telefone, endereço)..."
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
        )}

        {/* Direita: Relatório Diário, Notificações e Perfil */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">

          {/* Botão Instalar Aplicativo (PWA) */}
          <button
            onClick={() => setShowInstallModal(true)}
            title="Instalar Aplicativo no Celular ou Computador"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold shadow-sm transition-all"
          >
            <Smartphone className="w-4 h-4 text-emerald-600" />
            <span className="hidden lg:inline">Instalar App</span>
          </button>

          {/* Botão Relatório Diário do Pastor (apenas admin/pastor) */}
          {currentUser?.role !== 'LIDER_ESCALA' && currentUser?.role !== 'LIDER_PG' && (
            <button
              onClick={() => setShowDailyReport(true)}
              title="Gerar Relatório Diário do Pastor"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 text-xs font-semibold shadow-sm transition-all"
            >
              <FileText className="w-4 h-4 text-sky-600" />
              <span className="hidden xl:inline">Relatório Diário</span>
            </button>
          )}

          {/* Sino de Notificações (apenas admin/pastor) */}
          {currentUser?.role !== 'LIDER_ESCALA' && currentUser?.role !== 'LIDER_PG' && (
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
        )}

          {/* Botão de Desconectar / Sair */}
          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 text-xs font-semibold transition-colors shadow-2xs"
            title="Desconectar do Sistema"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </header>

      {/* Modal Relatório Diário */}
      <DailyReportModal isOpen={showDailyReport} onClose={() => setShowDailyReport(false)} />

      {/* Modal Instalação do Aplicativo (PWA) */}
      <InstallAppModal isOpen={showInstallModal} onClose={() => setShowInstallModal(false)} />

      {/* MODAL DE SENHA MASTER PARA ACESSAR CONGREGAÇÃO FILHA */}
      {subsidiaryToAccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 text-slate-800">
            <button
              onClick={() => {
                setSubsidiaryToAccess(null);
                setMasterPassInput('');
                setMasterPassError('');
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-xl hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-200 flex items-center justify-center shrink-0">
                <KeyRound className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Visualizar Congregação
                </h3>
                <p className="text-xs text-slate-500 truncate max-w-[200px]">
                  {subsidiaryToAccess.name}
                </p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-600 text-xs mb-4">
              Digite a <strong>Senha Master da Sede</strong> para alternar e auditar os dados desta congregação:
            </div>

            {masterPassError && (
              <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{masterPassError}</span>
              </div>
            )}

            <form onSubmit={handleAccessSubsidiarySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Senha Master da Sede *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showMasterPass ? 'text' : 'password'}
                    required
                    autoFocus
                    value={masterPassInput}
                    onChange={e => setMasterPassInput(e.target.value)}
                    placeholder="Digite a Senha Master"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-indigo-500 font-mono transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowMasterPass(!showMasterPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showMasterPass ? <Eye className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setSubsidiaryToAccess(null);
                    setMasterPassInput('');
                    setMasterPassError('');
                  }}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-xs shadow-md shadow-indigo-600/25 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Acessar</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
