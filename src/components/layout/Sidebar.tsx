import React from 'react';
import { 
  Home, 
  Users, 
  Baby, 
  HeartHandshake, 
  Calendar, 
  Sparkles, 
  Flame, 
  ShieldAlert, 
  Church as ChurchIcon, 
  BookOpen, 
  HomeIcon, 
  Heart, 
  UserPlus, 
  GraduationCap, 
  Droplet, 
  BarChart3, 
  DollarSign, 
  Settings, 
  X,
  Globe,
  Smartphone
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useChurch } from '../../context/ChurchContext';
import { InstallAppModal } from '../common/InstallAppModal';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onReturnToMasterAdmin?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  activeTab,
  setActiveTab,
  onReturnToMasterAdmin
}) => {
  const { isMasterAdmin } = useAuth();
  const { currentChurch, isFinancialUnlocked } = useChurch();
  const [showInstallModal, setShowInstallModal] = React.useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'members', label: 'Cadastro de Membros', icon: Users },
    { id: 'children', label: 'Departamento Infantil', icon: Baby },
    { id: 'families', label: 'Famílias & Casamentos', icon: HeartHandshake },
    { id: 'schedules', label: 'Programação', icon: Calendar },
    { id: 'events', label: 'Eventos Especiais', icon: Sparkles },
    { id: 'smallgroups', label: 'Pequenos Grupos (PG)', icon: Flame },
    { id: 'leadership', label: 'Liderança', icon: ShieldAlert },
    { id: 'ministries', label: 'Ministérios', icon: ChurchIcon },
    { id: 'cabinet', label: 'Gabinete Pastoral', icon: BookOpen },
    { id: 'visits', label: 'Visitas Pastorais', icon: HomeIcon },
    { id: 'prayers', label: 'Pedidos de Oração', icon: Heart },
    { id: 'visitors', label: 'Visitantes', icon: UserPlus },
    { id: 'ebd', label: 'Escola Bíblica (EBD)', icon: GraduationCap },
    { id: 'baptisms', label: 'Batismos', icon: Droplet },
    { id: 'reports', label: 'Relatórios Eclesiásticos', icon: BarChart3 },
    { 
      id: 'finance', 
      label: 'Financeiro', 
      icon: DollarSign, 
      isProtected: true 
    },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  const handleSelect = (id: string) => {
    setActiveTab(id);
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <>
      {/* Backdrop para mobile */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar container em Branco e Azul */}
      <aside
        className={`fixed top-0 left-0 z-40 h-full w-72 bg-white border-r border-slate-200/90 shadow-sm flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Topo do Sidebar */}
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-[#102A45] to-[#1B3B5C] text-white shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/30 text-sky-200 border border-sky-400/40 flex items-center justify-center font-black text-sm">
              GI
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-wider">GESTÃO IGREJA</span>
              <span className="block text-[10px] text-sky-200 font-medium">Plataforma Eclesiástica</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Módulo Master SaaS (se Saulo Monteiro) */}
        {isMasterAdmin && onReturnToMasterAdmin && (
          <div className="px-3 pt-3">
            <button
              onClick={() => {
                onReturnToMasterAdmin();
                if (window.innerWidth < 1024) onClose();
              }}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all bg-sky-50 text-sky-900 hover:bg-sky-100 border border-sky-200 shadow-2xs"
              title="Voltar ao Painel Master SaaS para administrar congregações"
            >
              <div className="flex items-center gap-2.5">
                <Globe className="w-4 h-4 text-sky-600" />
                <span>Painel Master SaaS</span>
              </div>
              <span className="px-1.5 py-0.5 text-[9px] bg-white text-sky-700 rounded border border-sky-300 font-semibold">
                Saulo
              </span>
            </button>
          </div>
        )}

        {/* Lista de Navegação Principal */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-sky-50 text-sky-900 font-bold border-l-4 border-sky-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border-l-4 border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-sky-600' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.isProtected && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                    isFinancialUnlocked 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {isFinancialUnlocked ? 'OK' : 'PIN'}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Botão de Instalação do Aplicativo (PWA) */}
        <div className="px-3 py-2 border-t border-slate-100">
          <button
            onClick={() => setShowInstallModal(true)}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 text-emerald-900 border border-emerald-200 text-xs font-bold transition-all shadow-xs"
          >
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-emerald-600" />
              <span>Instalar Aplicativo</span>
            </div>
            <span className="text-[9px] bg-emerald-600 text-white px-1.5 py-0.5 rounded font-bold uppercase">
              App
            </span>
          </button>
        </div>

        {/* Rodapé do Menu Lateral */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 text-[11px] text-slate-500 flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-700 truncate max-w-[170px]">{currentChurch.name}</span>
            <span className="text-[10px] font-bold text-sky-700">v1.0 SaaS</span>
          </div>
          <p className="text-[10px] text-slate-500 leading-tight">
            Desenvolvido e comercializado por <span className="text-slate-700 font-bold">Saulo Monteiro</span>, todos os direitos reservados.
          </p>
        </div>
      </aside>

      <InstallAppModal isOpen={showInstallModal} onClose={() => setShowInstallModal(false)} />
    </>
  );
};
