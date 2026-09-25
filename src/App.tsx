import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ChurchProvider, useChurch } from './context/ChurchContext';
import { NotificationProvider } from './context/NotificationContext';

import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardView } from './components/dashboard/DashboardView';
import { MemberList } from './components/members/MemberList';
import { ChildrenList } from './components/children/ChildrenList';
import { FamilyList } from './components/families/FamilyList';
import { ScheduleAndEventsView } from './components/schedule/ScheduleAndEventsView';
import { SmallGroupList } from './components/smallgroups/SmallGroupList';
import { LeadershipList } from './components/leadership/LeadershipList';
import { MinistriesList } from './components/ministries/MinistriesList';
import { PastoralCabinetView } from './components/pastoral/PastoralCabinetView';
import { VisitorsAndEbdView } from './components/visitors/VisitorsAndEbdView';
import { FinancialDashboardView } from './components/finance/FinancialDashboardView';
import { ReportsView } from './components/reports/ReportsView';
import { SettingsView } from './components/settings/SettingsView';
import { MasterAdminPanel } from './components/master/MasterAdminPanel';
import { LoginPage } from './components/auth/LoginPage';
import { MasterAdminModal } from './components/auth/LoginModal';

const MainLayout: React.FC = () => {
  const { currentUser, isMasterAdmin } = useAuth();
  const { currentChurch } = useChurch();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [isMasterModalOpen, setIsMasterModalOpen] = useState(false);
  const [viewingChurchAsMaster, setViewingChurchAsMaster] = useState(false);

  // SE NÃO ESTIVER LOGADO: Exibe a tela de login inicial antes de tudo!
  if (!currentUser) {
    return <LoginPage />;
  }

  // SE FOR O MASTER ADMIN (SAULO MONTEIRO) E NÃO ESTIVER EM MODO SUPORTE DE UMA IGREJA ESPECÍFICA:
  // Renderiza diretamente o Painel Master SEM NENHUM MENU LATERAL!
  if (isMasterAdmin && !viewingChurchAsMaster) {
    return (
      <MasterAdminPanel 
        onSwitchToChurchView={() => {
          setViewingChurchAsMaster(true);
          setActiveTab('dashboard');
        }} 
      />
    );
  }

  const handleNavigate = (tab: string) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#F4F7FB] text-slate-800 flex flex-col selection:bg-sky-500 selection:text-white">
      {/* Banner de Aviso quando o Master Admin estiver inspecionando uma igreja */}
      {isMasterAdmin && viewingChurchAsMaster && (
        <div className="bg-slate-900 text-white px-4 sm:px-6 py-2.5 text-xs flex items-center justify-between font-medium z-40 relative shadow-md">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Modo Suporte Master Admin: Visualizando <strong>{currentChurch.name}</strong></span>
          </div>
          <button 
            onClick={() => {
              setViewingChurchAsMaster(false);
              setActiveTab('dashboard');
            }}
            className="bg-white hover:bg-sky-50 text-slate-900 px-3 py-1 rounded-lg font-bold text-xs shadow transition-colors"
          >
            ← Voltar ao Painel Master (SaaS)
          </button>
        </div>
      )}

      {/* Sidebar de Navegação */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeTab={activeTab}
        setActiveTab={handleNavigate}
        onReturnToMasterAdmin={() => {
          setViewingChurchAsMaster(false);
          setActiveTab('dashboard');
        }}
      />

      {/* Conteúdo Principal */}
      <div className="flex-1 flex flex-col lg:pl-72 transition-all">
        {/* Header Superior em Branco & Azul */}
        <Header
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onOpenMasterAdmin={() => {
            setViewingChurchAsMaster(false);
            setActiveTab('dashboard');
          }}
          onOpenLogin={() => {}}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          activeTab={activeTab}
          setActiveTab={handleNavigate}
          onReturnToMaster={() => {
            setViewingChurchAsMaster(false);
            setActiveTab('dashboard');
          }}
        />

        {/* Área Central Dinâmica */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && <DashboardView onNavigate={handleNavigate} />}
          {activeTab === 'members' && <MemberList />}
          {activeTab === 'children' && <ChildrenList />}
          {activeTab === 'families' && <FamilyList />}
          {activeTab === 'schedules' && <ScheduleAndEventsView />}
          {activeTab === 'events' && <ScheduleAndEventsView />}
          {activeTab === 'smallgroups' && <SmallGroupList />}
          {activeTab === 'leadership' && <LeadershipList />}
          {activeTab === 'ministries' && <MinistriesList />}
          {activeTab === 'cabinet' && <PastoralCabinetView key="cabinet" initialTab="gabinete" isolated={true} />}
          {activeTab === 'visits' && <PastoralCabinetView key="visits" initialTab="visitas" isolated={true} />}
          {activeTab === 'prayers' && <PastoralCabinetView key="prayers" initialTab="oracao" isolated={true} />}
          {activeTab === 'visitors' && <VisitorsAndEbdView key="visitors" initialTab="visitors" isolated={true} />}
          {activeTab === 'ebd' && <VisitorsAndEbdView key="ebd" initialTab="ebd" isolated={true} />}
          {activeTab === 'baptisms' && <VisitorsAndEbdView key="baptisms" initialTab="baptisms" isolated={true} />}
          {activeTab === 'reports' && <ReportsView />}
          {activeTab === 'finance' && <FinancialDashboardView />}
          {activeTab === 'settings' && <SettingsView />}
        </main>

        {/* Rodapé Claro & Moderno */}
        <footer className="mt-auto border-t border-slate-200/80 bg-white/95 backdrop-blur-sm px-4 sm:px-6 py-4 text-xs text-slate-500 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 max-w-7xl mx-auto">
            <div className="flex items-center gap-2.5">
              {currentChurch.logoUrl ? (
                <img 
                  src={currentChurch.logoUrl} 
                  alt={currentChurch.name} 
                  className="h-7 w-auto object-contain rounded-md shadow-xs" 
                />
              ) : currentChurch.slug === 'cbacolher' || currentChurch.id === 'church_cba_maceio' ? (
                <img 
                  src="/logo-cba-completa.png" 
                  alt={currentChurch.name} 
                  className="h-7 w-auto object-contain rounded-md shadow-xs" 
                />
              ) : (
                <div className="h-7 w-7 rounded-lg bg-sky-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                  {currentChurch.name[0]}
                </div>
              )}
              <span>© {new Date().getFullYear()} <strong className="text-slate-700">{currentChurch.name}</strong></span>
            </div>
            <p className="text-xs text-slate-600 font-medium text-center sm:text-right">
              Desenvolvido e comercializado por <strong className="text-sky-700 font-bold">Saulo Monteiro</strong>, todos os direitos reservados.
            </p>
          </div>
        </footer>
      </div>

      <MasterAdminModal
        isOpen={isMasterModalOpen}
        onClose={() => setIsMasterModalOpen(false)}
        onSuccess={() => {
          setIsMasterModalOpen(false);
          setViewingChurchAsMaster(false);
        }}
      />
    </div>
  );
};

export default function App() {
  return (
    <NotificationProvider>
      <AuthProvider>
        <ChurchProvider>
          <MainLayout />
        </ChurchProvider>
      </AuthProvider>
    </NotificationProvider>
  );
}
