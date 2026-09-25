import React, { useState, useRef } from 'react';
import { 
  Globe, 
  Plus, 
  Building2, 
  ShieldCheck, 
  ArrowRight, 
  X, 
  Save, 
  Trash2, 
  Upload, 
  Image, 
  Lock, 
  User, 
  Download, 
  Sparkles, 
  Eye, 
  EyeOff, 
  Edit3, 
  LogOut, 
  MapPin, 
  Users, 
  Baby, 
  Calendar, 
  DollarSign, 
  MessageSquare, 
  Smartphone, 
  Check, 
  Code2,
  KeyRound,
  Copy,
  ShieldAlert
} from 'lucide-react';
import { Church } from '../../types';
import { useChurch } from '../../context/ChurchContext';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { ConfirmModal } from '../common/ConfirmModal';
import { exportChurchToExcel } from '../../services/excelBackup';
import { setupDemoChurch } from '../../services/demoChurch';
import { exportFullSystemBackup, importFullSystemBackup } from '../../services/storage';

export const MasterAdminPanel: React.FC<{ onSwitchToChurchView?: () => void }> = ({ onSwitchToChurchView }) => {
  const { allChurches, currentChurch, selectChurch, registerNewChurch, updateChurchData, removeChurch, resetChurchPassword, resetChurchFinancialPin } = useChurch();
  const { logout } = useAuth();
  const { showToast } = useNotification();

  // Estados de Modais
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [editingChurch, setEditingChurch] = useState<Church | null>(null);
  const [churchToDelete, setChurchToDelete] = useState<Church | null>(null);
  const [churchToResetPassword, setChurchToResetPassword] = useState<Church | null>(null);
  const [churchToResetFinancialPin, setChurchToResetFinancialPin] = useState<Church | null>(null);
  const [provisionalPassInput, setProvisionalPassInput] = useState<string>('1234');
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

  // Dados para novo cadastro
  const [newChurchData, setNewChurchData] = useState<Partial<Church>>({
    name: '',
    slug: '',
    loginUser: '',
    loginPassword: '',
    logoUrl: '',
    address: '',
    city: '',
    state: '',
    instagram: '',
    phone: '',
    whatsapp: '',
    pastorName: '',
    pastorPhone: '',
    pastorWhatsapp: '',
    pastoralOfficeWhatsapp: '',
    secretaryWhatsapp: '',
    defaultBirthdaySender: 'pastor',
    defaultGeneralSender: 'secretaria',
    dailyReportHour: '08:00',
    financialPin: '0000',
    financialPinChanged: false,
    isActive: true
  });

  const togglePasswordVisibility = (churchId: string) => {
    setVisiblePasswords(prev => ({
      ...prev,
      [churchId]: !prev[churchId]
    }));
  };

  // Upload de logomarca no NOVO cadastro
  const handleLogoUploadNew = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      showToast('A imagem deve ter no máximo 3MB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setNewChurchData(prev => ({ ...prev, logoUrl: base64 }));
      showToast('Logomarca carregada com sucesso!', 'success');
    };
    reader.readAsDataURL(file);
  };

  // Upload de logomarca na EDIÇÃO
  const handleLogoUploadEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingChurch) return;

    if (file.size > 3 * 1024 * 1024) {
      showToast('A imagem deve ter no máximo 3MB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setEditingChurch(prev => prev ? { ...prev, logoUrl: base64 } : null);
      showToast('Nova logomarca carregada!', 'success');
    };
    reader.readAsDataURL(file);
  };

  // Submissão do Cadastro
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChurchData.name?.trim()) {
      showToast('Nome da igreja é obrigatório.', 'error');
      return;
    }

    const slug = (newChurchData.slug || newChurchData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
    const loginUser = (newChurchData.loginUser?.trim().toLowerCase() || slug.replace(/-/g, ''));
    const loginPassword = (newChurchData.loginPassword?.trim() || '0000');

    const created = registerNewChurch({
      name: newChurchData.name,
      slug,
      loginUser,
      loginPassword,
      logoUrl: newChurchData.logoUrl || '',
      address: newChurchData.address || 'Endereço a definir',
      city: newChurchData.city || 'Maceió',
      state: newChurchData.state || 'AL',
      instagram: newChurchData.instagram || '@igreja',
      phone: newChurchData.phone || '(82) 99999-9999',
      whatsapp: newChurchData.whatsapp || '5582999999999',
      pastorName: newChurchData.pastorName || 'Pastor Titular',
      pastorPhone: newChurchData.pastorPhone || '',
      pastorWhatsapp: newChurchData.pastorWhatsapp || newChurchData.whatsapp || '',
      dailyReportHour: newChurchData.dailyReportHour || '08:00',
      financialPin: '0000',
      financialPinChanged: false,
      isActive: true
    });

    showToast(`Igreja "${created.name}" cadastrada! Login: ${loginUser}`, 'success');
    setIsRegisterOpen(false);
  };

  // Submissão da Edição
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingChurch) return;

    updateChurchData(editingChurch);
    showToast(`Dados da igreja "${editingChurch.name}" atualizados com sucesso!`, 'success');
    setEditingChurch(null);
  };

  // Confirmação de Exclusão
  const handleDeleteChurchConfirm = () => {
    if (churchToDelete) {
      if (allChurches.length <= 1) {
        showToast('Não é possível excluir a única igreja restante.', 'error');
        setChurchToDelete(null);
        return;
      }
      removeChurch(churchToDelete.id);
      showToast(`Igreja "${churchToDelete.name}" removida da plataforma.`, 'success');
      setChurchToDelete(null);
    }
  };

  // Reset de Senha de Congregação (Master Admin)
  const handleConfirmResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!churchToResetPassword) return;

    const passToSet = provisionalPassInput.trim() || '1234';
    const res = resetChurchPassword(churchToResetPassword.id, passToSet);
    if (res.success) {
      showToast(`Senha provisória ("${res.provisionalPass}") definida para "${churchToResetPassword.name}". No próximo login da congregação, a nova senha será exigida.`, 'success');
      setChurchToResetPassword(null);
      setProvisionalPassInput('1234');
    } else {
      showToast('Erro ao redefinir a senha da congregação.', 'error');
    }
  };

  // Reset da Senha Financeira individual da congregação
  const handleConfirmResetFinancialPin = async () => {
    if (!churchToResetFinancialPin) return;

    const res = await resetChurchFinancialPin(churchToResetFinancialPin.id);
    showToast(res.message, res.success ? 'success' : 'error');
    setChurchToResetFinancialPin(null);
  };

  // Ref para input de restauração de backup JSON
  const restoreFileInputRef = useRef<HTMLInputElement>(null);

  // Disparo do Backup em Excel individual
  const handleDownloadBackup = (church: Church) => {
    try {
      exportChurchToExcel(church);
      showToast(`Backup Excel de "${church.name}" gerado com sucesso!`, 'success');
    } catch (err) {
      showToast('Erro ao gerar planilha de backup.', 'error');
    }
  };

  // Disparo do Backup Geral do Sistema (JSON completo de todas as igrejas)
  const handleDownloadFullSystemBackup = () => {
    try {
      const backup = exportFullSystemBackup();
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup_sistema_completo_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Backup Geral do Sistema (JSON) baixado com sucesso!', 'success');
    } catch (e) {
      showToast('Erro ao exportar backup geral.', 'error');
    }
  };

  // Restauração de Backup Geral (JSON)
  const handleImportFullSystemBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const payload = JSON.parse(event.target?.result as string);
        const ok = importFullSystemBackup(payload);
        if (ok) {
          showToast('Backup do sistema restaurado com sucesso! Recarregando...', 'success');
          setTimeout(() => window.location.reload(), 1200);
        } else {
          showToast('Arquivo de backup inválido ou incompatível.', 'error');
        }
      } catch (err) {
        showToast('Erro ao ler arquivo de backup JSON.', 'error');
      }
    };
    reader.readAsText(file);
  };

  // Criar / Restaurar e Abrir Demonstração
  const handleSetupDemo = () => {
    const demo = setupDemoChurch();
    selectChurch(demo.id);
    showToast(`Ambiente de Demonstração (${demo.name}) carregado com sucesso!`, 'success');
    if (onSwitchToChurchView) {
      onSwitchToChurchView();
    }
  };

  // Entrar para visualizar congregação
  const handleEnterChurch = (churchId: string) => {
    selectChurch(churchId);
    showToast('Conectado à congregação.', 'success');
    if (onSwitchToChurchView) {
      onSwitchToChurchView();
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 pb-16">
      
      {/* 1. TOPO OFICIAL EXCLUSIVO DO MASTER ADMIN (SAULO MONTEIRO) */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200/90 shadow-sm px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center p-0.5 shrink-0 overflow-hidden">
            <img src="/logo-scm-tech-icon.png" alt="SCM Tech" className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black text-slate-900 tracking-wide uppercase">SCM Tech</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-200">
                Master Admin SaaS
              </span>
            </div>
            <p className="text-xs font-semibold text-sky-700">Desenvolvimento de Software • Saulo Monteiro</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleSetupDemo}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition-all shadow-xs"
            title="Criar ou restaurar congregação de demonstração com dados ricos"
          >
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">Ambiente Demo</span>
          </button>

          <button
            onClick={() => {
              setNewChurchData({
                name: '',
                slug: '',
                loginUser: '',
                loginPassword: '',
                logoUrl: '',
                address: '',
                city: 'Maceió',
                state: 'AL',
                instagram: '',
                phone: '',
                whatsapp: '',
                pastorName: '',
                pastorPhone: '',
                pastorWhatsapp: '',
                dailyReportHour: '08:00',
                isActive: true
              });
              setIsRegisterOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-sky-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>+ Nova Igreja</span>
          </button>

          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 text-xs font-bold transition-colors"
            title="Sair do Master Admin"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-6 space-y-6">
        
        {/* 2. CARDS DE INDICADORES SAAS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm">
            <span className="text-[11px] font-bold text-sky-700 uppercase tracking-wider">Total de Congregações</span>
            <div className="flex items-baseline gap-2 mt-1">
              <h3 className="text-3xl font-black text-slate-900">{allChurches.length}</h3>
              <span className="text-xs text-slate-500 font-medium">igrejas no SaaS</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Multi-tenant isolado e seguro</p>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm">
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Status do Servidor</span>
            <div className="flex items-baseline gap-2 mt-1">
              <h3 className="text-2xl font-black text-slate-900">100% Online</h3>
            </div>
            <p className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Operação e backups disponíveis
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm">
            <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider">Acesso Master Protegido</span>
            <div className="flex items-center gap-2.5 mt-1.5">
              <img src="/logo-scm-tech-icon.png" alt="SCM Tech" className="w-8 h-8 rounded-lg object-contain shrink-0" />
              <div>
                <h3 className="text-lg font-black text-slate-900 leading-tight">SCM Tech</h3>
                <p className="text-[11px] text-slate-500 font-medium">Saulo Monteiro (Admin Geral)</p>
              </div>
            </div>
          </div>
        </div>

        {/* 3. GERENCIAMENTO COMPLETO DE IGREJAS */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 mb-6 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Globe className="w-5 h-5 text-sky-600" />
                Igrejas Cadastradas na Plataforma
              </h3>
              <p className="text-xs text-slate-500">
                Gerencie credenciais, edite informações, gere backups em Excel ou alterne parâmetros de cada congregação.
              </p>
            </div>

            {/* Backups Globais e Segurança Master */}
            <div className="flex flex-wrap items-center gap-2">
              <input 
                type="file" 
                ref={restoreFileInputRef}
                onChange={handleImportFullSystemBackup}
                accept=".json"
                className="hidden"
              />
              <button
                type="button"
                onClick={handleDownloadFullSystemBackup}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-sky-50 text-slate-700 hover:text-sky-700 text-xs font-bold transition-all border border-slate-200 hover:border-sky-200 shadow-xs"
                title="Baixa um arquivo JSON seguro com 100% de todas as congregações, membros e dados de todas as igrejas"
              >
                <Download className="w-4 h-4 text-sky-600" />
                <span>Backup Geral (JSON)</span>
              </button>

              <button
                type="button"
                onClick={() => restoreFileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 text-xs font-bold transition-all border border-slate-200 hover:border-emerald-200 shadow-xs"
                title="Restaura todo o sistema e igrejas a partir de um backup JSON salvo previamente"
              >
                <Upload className="w-4 h-4 text-emerald-600" />
                <span>Restaurar Geral</span>
              </button>
            </div>
          </div>

          {/* GRID DE IGREJAS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {allChurches.map(c => {
              const isSelected = c.id === currentChurch.id;
              const isPasswordVisible = visiblePasswords[c.id] || false;

              return (
                <div
                  key={c.id}
                  className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-sky-50/50 border-sky-300 shadow-md shadow-sky-500/5'
                      : 'bg-slate-50/70 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-3">
                    {/* TOPO DO CARD: LOGO + NOME */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center font-black text-sky-700 text-lg overflow-hidden shrink-0 shadow-sm">
                          {c.logoUrl ? (
                            <img src={c.logoUrl} alt={c.name} className="w-full h-full object-contain p-1" />
                          ) : (
                            <span className="text-sky-700 font-black">{c.name[0]}</span>
                          )}
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-1.5">
                            <h4 className="font-bold text-base text-slate-900 leading-tight">{c.name}</h4>
                            {isSelected && (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-sky-100 text-sky-800 border border-sky-200 shrink-0">
                                Ativa
                              </span>
                            )}
                            {c.mustChangePassword && (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-200 shrink-0 flex items-center gap-1" title="Esta congregação está com senha provisória e precisará trocá-la no próximo acesso">
                                <KeyRound className="w-2.5 h-2.5 text-amber-600" />
                                Senha Provisória
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {c.city} - {c.state} • {c.instagram || '@igreja'}
                          </p>
                        </div>
                      </div>

                      {/* Botão de Edição Rápida */}
                      <button
                        onClick={() => setEditingChurch(c)}
                        className="p-2 rounded-xl bg-white hover:bg-sky-50 text-slate-500 hover:text-sky-600 border border-slate-200 transition-colors shadow-2xs"
                        title="Editar Igreja"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* DADOS DA IGREJA */}
                    <div className="p-3 rounded-xl bg-white border border-slate-200/80 text-xs text-slate-700 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-medium flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-slate-400" /> Login:
                        </span>
                        <code className="bg-sky-50 text-sky-700 px-2 py-0.5 rounded font-mono font-bold text-[11px] border border-sky-100">
                          {c.loginUser || c.slug}
                        </code>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-medium flex items-center gap-1">
                          <Lock className="w-3.5 h-3.5 text-slate-400" /> Senha:
                        </span>
                        <div className="flex items-center gap-1.5">
                          <code className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-mono font-bold text-[11px]">
                            {isPasswordVisible ? (c.loginPassword || '0000') : '••••••••'}
                          </code>
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility(c.id)}
                            className="text-slate-400 hover:text-slate-700 p-0.5"
                            title={isPasswordVisible ? "Ocultar senha" : "Ver senha"}
                          >
                            {isPasswordVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">Pastor Titular:</span>
                        <span className="font-semibold text-slate-800">{c.pastorName}</span>
                      </div>

                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">WhatsApp Pastor:</span>
                        <span className="font-mono text-slate-700">{c.pastorWhatsapp || c.whatsapp}</span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100">
                        <span className="text-slate-500 flex items-center gap-1">
                          <DollarSign className="w-3 h-3 text-emerald-600" /> Senha Financeira:
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          c.financialPinChanged && c.financialPin && c.financialPin !== '0000'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {c.financialPinChanged && c.financialPin && c.financialPin !== '0000' ? 'Ativa & Exclusiva' : 'Pendente de Cadastro'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* BARRA DE AÇÕES INFERIOR */}
                  <div className="mt-4 pt-3 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {/* Botão de Copiar Acesso */}
                      <button
                        type="button"
                        onClick={() => {
                          const userLogin = c.loginUser || c.slug;
                          const textToCopy = `🏛️ *Acesso ao Sistema de Gestão Eclesiástica*\n\n⛪ *Igreja:* ${c.name}\n👤 *Usuário:* ${userLogin}\n🔑 *Senha Inicial:* ${c.mustChangePassword ? '1234 (ou a provisória cadastrada)' : 'Sua senha cadastrada'}\n🌐 *Link de Acesso:* https://gestaodeigrejas-beta.vercel.app\n\n*(No primeiro acesso será solicitado definir a senha definitiva)*`;
                          navigator.clipboard.writeText(textToCopy);
                          showToast(`Acesso da igreja "${c.name}" copiado!`, 'success');
                        }}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white hover:bg-sky-50 text-sky-700 hover:border-sky-300 border border-slate-200 text-xs font-semibold transition-all shadow-2xs"
                        title="Copiar dados de acesso (usuário, senha e link) para enviar ao pastor"
                      >
                        <Copy className="w-3.5 h-3.5 text-sky-600" />
                        <span>Copiar Acesso</span>
                      </button>

                      {/* Botão de Resetar Senha de Login */}
                      <button
                        type="button"
                        onClick={() => {
                          setChurchToResetPassword(c);
                          setProvisionalPassInput('1234');
                        }}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white hover:bg-amber-50 text-amber-700 hover:border-amber-300 border border-slate-200 text-xs font-semibold transition-all shadow-2xs"
                        title="Redefinir senha provisória de login da congregação"
                      >
                        <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                        <span>Resetar Login</span>
                      </button>

                      {/* Botão de Resetar Senha Financeira (Exclusivo por Igreja) */}
                      <button
                        type="button"
                        onClick={() => setChurchToResetFinancialPin(c)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white hover:bg-rose-50 text-rose-700 hover:border-rose-300 border border-slate-200 text-xs font-semibold transition-all shadow-2xs"
                        title="Resetar a senha financeira desta congregação separadamente"
                      >
                        <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                        <span>Reset Financeiro</span>
                      </button>

                      {/* Botão de Backup Excel */}
                      <button
                        type="button"
                        onClick={() => handleDownloadBackup(c)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white hover:bg-emerald-50 text-emerald-700 hover:border-emerald-300 border border-slate-200 text-xs font-semibold transition-all shadow-2xs"
                        title="Baixar planilha Excel com todos os dados desta congregação"
                      >
                        <Download className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Backup Excel</span>
                      </button>

                      {/* Botão de Excluir */}
                      {allChurches.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setChurchToDelete(c)}
                          className="p-1.5 rounded-xl bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 transition-colors shadow-2xs"
                          title={`Excluir ${c.name}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleEnterChurch(c.id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all shadow-xs"
                      title="Visualizar o painel eclesiástico desta congregação"
                    >
                      <span>Abrir Painel</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. GUIA & RESUMO COMERCIAL DAS FUNCIONALIDADES PARA DEMONSTRAÇÃO AOS PASTORES */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200">
                <Smartphone className="w-4 h-4" />
              </span>
              <h3 className="text-base font-bold text-slate-900">
                Guia de Apresentação Comercial do Aplicativo (Para Apresentar a Pastores)
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Utilize os pontos abaixo para demonstrar ao pastor o valor prático e a organização que o sistema traz para a igreja dele:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <Users className="w-4 h-4 text-sky-600" />
                <span>1. Membresia & Famílias</span>
              </div>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                Cadastro completo dos membros com fotos, data de batismo e dados da família. O pastor consulta qualquer membro no celular em 2 segundos.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span>2. Aniversários & WhatsApp Pastoral</span>
              </div>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                Botão verde ao lado de cada aniversariante. Com 1 toque, abre o WhatsApp com a mensagem personalizada pronta e assinada pastoralmente pelo pastor.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <Baby className="w-4 h-4 text-pink-600" />
                <span>3. Departamento Infantil</span>
              </div>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                Check-in de crianças nos cultos, aviso de alergias e cuidados médicos, com contato de emergência com os pais com apenas um clique.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <Calendar className="w-4 h-4 text-amber-600" />
                <span>4. Cultos, EBD & Escalas</span>
              </div>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                Agendamento de celebrações e EBD aos domingos às 17h. Disparo automático da escala no grupo do WhatsApp dos músicos, mídia e acolhimento.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <DollarSign className="w-4 h-4 text-emerald-700" />
                <span>5. Gestão Financeira Blindada (PIN)</span>
              </div>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                Entradas de dízimos/ofertas e saídas. Proteção com senha PIN para que apenas o pastor e tesoureiro tenham acesso aos números da igreja.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <Smartphone className="w-4 h-4 text-indigo-600" />
                <span>6. Aplicativo Instalável (PWA)</span>
              </div>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                O pastor e líderes instalam direto no iPhone ou Android como app nativo, com ícone próprio na tela inicial e sem necessidade de baixar pela App Store.
              </p>
            </div>

          </div>
        </div>

      </main>

      {/* 5. MODAL DE CADASTRO DE NOVA IGREJA */}
      {isRegisterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 text-slate-800 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsRegisterOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 border border-sky-200 flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Cadastrar Nova Igreja (SaaS)</h3>
                <p className="text-xs text-slate-500">Apenas o Master Admin Saulo Monteiro pode adicionar</p>
              </div>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              {/* Carregamento de Logomarca da Igreja */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Image className="w-4 h-4 text-sky-600" />
                    Logomarca da Igreja
                  </span>
                  <span className="text-[11px] font-normal text-slate-400">PNG, JPG ou SVG (até 3MB)</span>
                </label>
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="w-16 h-16 rounded-xl bg-white border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                    {newChurchData.logoUrl ? (
                      <img src={newChurchData.logoUrl} alt="Prévia da Logo" className="w-full h-full object-contain p-1" />
                    ) : (
                      <Building2 className="w-8 h-8 text-slate-300" />
                    )}
                  </div>
                  <div className="flex-1 flex flex-wrap items-center gap-2">
                    <label
                      htmlFor="church-logo-input-new"
                      className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-sky-400 hover:bg-sky-50/50 text-xs font-semibold text-slate-700 shadow-sm transition-all"
                    >
                      <Upload className="w-3.5 h-3.5 text-sky-600" />
                      {newChurchData.logoUrl ? 'Trocar Logomarca' : 'Carregar Logomarca'}
                    </label>
                    <input
                      id="church-logo-input-new"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUploadNew}
                      className="hidden"
                    />
                    {newChurchData.logoUrl && (
                      <button
                        type="button"
                        onClick={() => setNewChurchData(prev => ({ ...prev, logoUrl: '' }))}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-medium transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                        Remover
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nome da Congregação / Igreja *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Igreja Batista Renovada"
                  value={newChurchData.name || ''}
                  onChange={e => {
                    const val = e.target.value;
                    const autoLogin = val
                      .toLowerCase()
                      .normalize('NFD')
                      .replace(/[\u0300-\u036f]/g, '')
                      .replace(/\b(no|na|nos|nas|de|do|da|dos|das|em|e|a|o)\b/gi, '')
                      .replace(/[^a-z0-9]/g, '');
                    setNewChurchData(prev => ({
                      ...prev,
                      name: val,
                      loginUser: (!prev.loginUser || prev.loginUser === '' || prev.loginUser === autoLogin.slice(0, -1) || prev.loginUser === autoLogin) 
                        ? autoLogin 
                        : prev.loginUser
                    }));
                  }}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-sky-500 transition-colors"
                />
              </div>

              {/* Credenciais de Acesso da Nova Igreja */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <Lock className="w-4 h-4 text-sky-600" />
                  <span>Credenciais de Login da Nova Igreja</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Usuário de Login *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        placeholder="ex: batistarenovada"
                        value={newChurchData.loginUser || ''}
                        onChange={e => setNewChurchData({ ...newChurchData, loginUser: e.target.value.toLowerCase().replace(/\s+/g, '') })}
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-medium outline-none focus:border-sky-500 transition-colors"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                      <span>Senha Provisória *</span>
                      <span className="text-[10px] text-amber-600 font-semibold">Exigirá troca no 1º login</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        placeholder="ex: 1234 ou 0000"
                        value={newChurchData.loginPassword || ''}
                        onChange={e => setNewChurchData({ ...newChurchData, loginPassword: e.target.value })}
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-mono font-medium outline-none focus:border-sky-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>
                <p className="text-[11px] text-amber-700 bg-amber-50/80 p-2.5 rounded-xl border border-amber-200/80">
                  🔒 <strong>Senha Provisória Obrigatória:</strong> Ao fazer o primeiro acesso com esta senha, a congregação será obrigada a cadastrar uma nova senha definitiva antes de entrar.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Endereço Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Rua / Avenida, número, bairro"
                  value={newChurchData.address || ''}
                  onChange={e => setNewChurchData({ ...newChurchData, address: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-sky-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Cidade</label>
                  <input
                    type="text"
                    placeholder="Ex: Maceió, São Paulo, Salvador..."
                    value={newChurchData.city || ''}
                    onChange={e => setNewChurchData({ ...newChurchData, city: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-sky-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Estado (UF)</label>
                  <input
                    type="text"
                    maxLength={2}
                    placeholder="Ex: AL"
                    value={newChurchData.state || ''}
                    onChange={e => setNewChurchData({ ...newChurchData, state: e.target.value.toUpperCase() })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-sky-500 uppercase transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Instagram</label>
                  <input
                    type="text"
                    placeholder="@igreja"
                    value={newChurchData.instagram || ''}
                    onChange={e => setNewChurchData({ ...newChurchData, instagram: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-sky-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">WhatsApp Secretaria / Geral</label>
                  <input
                    type="text"
                    placeholder="(DDD) 99999-9999"
                    value={newChurchData.secretaryWhatsapp || newChurchData.whatsapp || ''}
                    onChange={e => setNewChurchData({ ...newChurchData, secretaryWhatsapp: e.target.value, whatsapp: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-sky-500 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Pastor Responsável</label>
                  <input
                    type="text"
                    placeholder="Nome do pastor"
                    value={newChurchData.pastorName || ''}
                    onChange={e => setNewChurchData({ ...newChurchData, pastorName: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-sky-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">WhatsApp do Pastor</label>
                  <input
                    type="text"
                    placeholder="(DDD) 99999-9999"
                    value={newChurchData.pastorWhatsapp || ''}
                    onChange={e => setNewChurchData({ ...newChurchData, pastorWhatsapp: e.target.value, pastorPhone: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-sky-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">WhatsApp Gabinete Pastoral</label>
                <input
                  type="text"
                  placeholder="(DDD) 99999-9999"
                  value={newChurchData.pastoralOfficeWhatsapp || ''}
                  onChange={e => setNewChurchData({ ...newChurchData, pastoralOfficeWhatsapp: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-sky-500 transition-colors"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsRegisterOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-sky-500/20 transition-all"
                >
                  <Save className="w-4 h-4" />
                  Cadastrar Igreja
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. MODAL DE EDIÇÃO DE IGREJA */}
      {editingChurch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 text-slate-800 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setEditingChurch(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 border border-amber-200 flex items-center justify-center">
                <Edit3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Editar Congregação</h3>
                <p className="text-xs text-slate-500">Atualizar dados, logomarca ou credenciais de acesso</p>
              </div>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              {/* Logomarca */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Image className="w-4 h-4 text-amber-600" />
                    Logomarca da Igreja
                  </span>
                  <span className="text-[11px] font-normal text-slate-400">PNG, JPG ou SVG</span>
                </label>
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="w-16 h-16 rounded-xl bg-white border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                    {editingChurch.logoUrl ? (
                      <img src={editingChurch.logoUrl} alt="Prévia" className="w-full h-full object-contain p-1" />
                    ) : (
                      <span className="text-xl font-bold text-slate-400">{editingChurch.name[0]}</span>
                    )}
                  </div>
                  <div className="flex-1 flex flex-wrap items-center gap-2">
                    <label
                      htmlFor="church-logo-input-edit"
                      className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-amber-400 hover:bg-amber-50/50 text-xs font-semibold text-slate-700 shadow-sm transition-all"
                    >
                      <Upload className="w-3.5 h-3.5 text-amber-600" />
                      Trocar Logomarca
                    </label>
                    <input
                      id="church-logo-input-edit"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUploadEdit}
                      className="hidden"
                    />
                    {editingChurch.logoUrl && (
                      <button
                        type="button"
                        onClick={() => setEditingChurch({ ...editingChurch, logoUrl: '' })}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-medium transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                        Remover
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nome da Igreja *</label>
                <input
                  type="text"
                  required
                  value={editingChurch.name}
                  onChange={e => setEditingChurch({ ...editingChurch, name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-amber-500 transition-colors"
                />
              </div>

              {/* Credenciais */}
              <div className="p-3.5 bg-amber-50/60 border border-amber-200/80 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                  <Lock className="w-4 h-4 text-amber-600" />
                  <span>Credenciais de Login da Igreja</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Usuário de Login *</label>
                    <input
                      type="text"
                      required
                      value={editingChurch.loginUser || editingChurch.slug}
                      onChange={e => setEditingChurch({ ...editingChurch, loginUser: e.target.value.toLowerCase().replace(/\s+/g, '') })}
                      className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-medium outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Senha de Acesso *</label>
                    <input
                      type="text"
                      required
                      value={editingChurch.loginPassword || ''}
                      onChange={e => setEditingChurch({ ...editingChurch, loginPassword: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-medium outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Endereço Completo</label>
                <input
                  type="text"
                  value={editingChurch.address}
                  onChange={e => setEditingChurch({ ...editingChurch, address: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-amber-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Cidade</label>
                  <input
                    type="text"
                    value={editingChurch.city}
                    onChange={e => setEditingChurch({ ...editingChurch, city: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-amber-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Estado (UF)</label>
                  <input
                    type="text"
                    maxLength={2}
                    value={editingChurch.state}
                    onChange={e => setEditingChurch({ ...editingChurch, state: e.target.value.toUpperCase() })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-amber-500 uppercase transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Pastor Titular</label>
                  <input
                    type="text"
                    value={editingChurch.pastorName}
                    onChange={e => setEditingChurch({ ...editingChurch, pastorName: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-amber-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">WhatsApp Pastor</label>
                  <input
                    type="text"
                    value={editingChurch.pastorWhatsapp || ''}
                    onChange={e => setEditingChurch({ ...editingChurch, pastorWhatsapp: e.target.value, pastorPhone: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">WhatsApp Gabinete Pastoral</label>
                  <input
                    type="text"
                    placeholder="(DDD) 99999-9999"
                    value={editingChurch.pastoralOfficeWhatsapp || ''}
                    onChange={e => setEditingChurch({ ...editingChurch, pastoralOfficeWhatsapp: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-amber-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">WhatsApp Secretaria</label>
                  <input
                    type="text"
                    placeholder="(DDD) 99999-9999"
                    value={editingChurch.secretaryWhatsapp || editingChurch.whatsapp || ''}
                    onChange={e => setEditingChurch({ ...editingChurch, secretaryWhatsapp: e.target.value, whatsapp: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingChurch(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition-all"
                >
                  <Save className="w-4 h-4" />
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. MODAL DE CONFIRMAÇÃO DE EXCLUSÃO */}
      {churchToDelete && (
        <ConfirmModal
          isOpen={true}
          title="Excluir Congregação da Plataforma"
          message={`Tem certeza que deseja apagar a congregação "${churchToDelete.name}"? Esta ação removerá os dados vinculados a ela.`}
          confirmLabel="Excluir Igreja"
          confirmVariant="danger"
          onConfirm={handleDeleteChurchConfirm}
          onCancel={() => setChurchToDelete(null)}
        />
      )}

      {/* 8. MODAL DE RESET DE SENHA PROVISÓRIA */}
      {churchToResetPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 text-slate-800">
            <button
              onClick={() => setChurchToResetPassword(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shadow-xs">
                <KeyRound className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Resetar Senha da Congregação</h3>
                <p className="text-xs text-slate-500 font-medium">{churchToResetPassword.name}</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200 text-amber-900 text-xs mb-4 leading-relaxed">
              <p className="font-semibold mb-1">Como funciona o reset:</p>
              <p className="text-[11px] text-amber-800">
                Você define uma senha provisória temporária abaixo. Assim que o usuário da congregação tentar entrar com essa senha, o sistema bloqueará a tela e <strong>exigirá obrigatoriamente</strong> que ele cadastre uma nova senha definitiva.
              </p>
            </div>

            <form onSubmit={handleConfirmResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nova Senha Provisória *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={provisionalPassInput}
                    onChange={e => setProvisionalPassInput(e.target.value)}
                    placeholder="ex: 1234"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-mono outline-none focus:bg-white focus:border-amber-500 transition-colors"
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Envie esta senha provisória para o pastor ou administrador da congregação.
                </span>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setChurchToResetPassword(null)}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md shadow-amber-600/20 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Confirmar Reset</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 9. MODAL DE RESET DA SENHA FINANCEIRA (SEPARADAMENTE POR IGREJA) */}
      {churchToResetFinancialPin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 text-slate-800">
            <button
              onClick={() => setChurchToResetFinancialPin(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-xl hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center shadow-xs">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Resetar Senha Financeira</h3>
                <p className="text-xs text-slate-500 font-medium">{churchToResetFinancialPin.name}</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200 text-amber-900 text-xs mb-4 leading-relaxed space-y-1.5">
              <p className="font-semibold">Como funciona o reset financeiro:</p>
              <p className="text-[11px] text-amber-800">
                A senha financeira atual da igreja <strong>{churchToResetFinancialPin.name}</strong> será invalidada imediatamente.
              </p>
              <p className="text-[11px] text-amber-950 font-bold bg-amber-100/70 p-2 rounded-xl border border-amber-200">
                No próximo acesso ao módulo financeiro, o sistema exigirá que a igreja cadastre uma nova senha financeira (obrigatoriamente diferente da senha de login).
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setChurchToResetFinancialPin(null)}
                className="flex-1 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmResetFinancialPin}
                className="flex-1 py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-600/20 active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Confirmar Reset Financeiro</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
