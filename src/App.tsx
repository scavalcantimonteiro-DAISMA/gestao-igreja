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

  // SE NÃO ESTIVER LOGADO: Exibe a tela de login inicial antes de tudo!
  if (!currentUser) {
    return <LoginPage />;
  }

  const handleNavigate = (tab: string) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#F4F7FB] text-slate-800 flex flex-col selection:bg-sky-500 selection:text-white">
      {/* Sidebar de Navegação */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeTab={activeTab}
        setActiveTab={handleNavigate}
      />

      {/* Conteúdo Principal */}
      <div className="flex-1 flex flex-col lg:pl-72 transition-all">
        {/* Header Superior em Branco & Azul */}
        <Header
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onOpenMasterAdmin={() => setIsMasterModalOpen(true)}
          onOpenLogin={() => {}}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          activeTab={activeTab}
          setActiveTab={handleNavigate}
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
          {activeTab === 'cabinet' && <PastoralCabinetView />}
          {activeTab === 'visits' && <PastoralCabinetView />}
          {activeTab === 'prayers' && <PastoralCabinetView />}
          {activeTab === 'visitors' && <VisitorsAndEbdView initialTab="visitors" />}
          {activeTab === 'ebd' && <VisitorsAndEbdView initialTab="ebd" />}
          {activeTab === 'baptisms' && <VisitorsAndEbdView initialTab="baptisms" />}
          {activeTab === 'reports' && <ReportsView />}
          {activeTab === 'finance' && <FinancialDashboardView />}
          {activeTab === 'settings' && <SettingsView />}
          {activeTab === 'master' && <MasterAdminPanel />}
        </main>

        {/* Rodapé Claro & Moderno */}
        <footer className="mt-auto border-t border-slate-200/80 bg-white/90 backdrop-blur-sm px-6 py-4 text-center text-xs text-slate-500">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto">
            <p>
              © {new Date().getFullYear()} <strong className="text-slate-700">{currentChurch.name}</strong> • Todos os direitos reservados.
            </p>
            <p className="flex items-center gap-1.5 text-[11px]">
              Desenvolvido por <span className="font-bold text-sky-600">Saulo Monteiro</span> — Sistemas & Desenvolvimento
            </p>
          </div>
        </footer>
      </div>

      <MasterAdminModal
        isOpen={isMasterModalOpen}
        onClose={() => setIsMasterModalOpen(false)}
        onSuccess={() => handleNavigate('master')}
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
