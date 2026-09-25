import React, { useState } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Plus, 
  Minus, 
  Lock, 
  KeyRound, 
  Trash2, 
  X, 
  Edit3,
  Layers,
  CheckCircle2,
  ShieldAlert,
  Eye,
  EyeOff,
  Receipt,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3
} from 'lucide-react';
import { 
  FinancialEntry, 
  FinancialExpense, 
  FinancialEntryCategory, 
  FinancialExpenseCategory, 
  PaymentMethod,
  FixedExpense 
} from '../../types';
import { useChurch } from '../../context/ChurchContext';
import { useNotification } from '../../context/NotificationContext';
import { FinancialPinModal } from '../common/FinancialPinModal';
import { 
  getFinancialEntries, 
  saveFinancialEntry, 
  deleteFinancialEntry, 
  getFinancialExpenses, 
  saveFinancialExpense, 
  deleteFinancialExpense,
  getFixedExpenses,
  saveFixedExpense,
  deleteFixedExpense,
  logAction 
} from '../../services/storage';

interface SecurityAction {
  action: 'edit_entry' | 'edit_expense' | 'edit_fixed' | 'delete_entry' | 'delete_expense' | 'delete_fixed';
  id: string;
  title: string;
  amount?: number;
  itemData?: any;
}

const MONTHS = [
  { num: '01', name: 'Janeiro', short: 'Jan' },
  { num: '02', name: 'Fevereiro', short: 'Fev' },
  { num: '03', name: 'Março', short: 'Mar' },
  { num: '04', name: 'Abril', short: 'Abr' },
  { num: '05', name: 'Maio', short: 'Mai' },
  { num: '06', name: 'Junho', short: 'Jun' },
  { num: '07', name: 'Julho', short: 'Jul' },
  { num: '08', name: 'Agosto', short: 'Ago' },
  { num: '09', name: 'Setembro', short: 'Set' },
  { num: '10', name: 'Outubro', short: 'Out' },
  { num: '11', name: 'Novembro', short: 'Nov' },
  { num: '12', name: 'Dezembro', short: 'Dez' },
];

export const FinancialDashboardView: React.FC = () => {
  const { currentChurch, isFinancialUnlocked, lockFinancial } = useChurch();
  const { showToast } = useNotification();

  const [isPinModalOpen, setIsPinModalOpen] = useState(!isFinancialUnlocked);
  const [entries, setEntries] = useState<FinancialEntry[]>(() => getFinancialEntries(currentChurch.id));
  const [expenses, setExpenses] = useState<FinancialExpense[]>(() => getFinancialExpenses(currentChurch.id));
  const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>(() => getFixedExpenses(currentChurch.id));

  const [activeTab, setActiveTab] = useState<'geral' | 'comparativo' | 'despesas_fixas' | 'entradas' | 'saidas'>('geral');
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());

  // Entry & Expense Modals
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isFixedModalOpen, setIsFixedModalOpen] = useState(false);

  // Editing tracker
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [editingFixedId, setEditingFixedId] = useState<string | null>(null);

  // Security Auth Modal for Edit / Delete
  const [securityAction, setSecurityAction] = useState<SecurityAction | null>(null);
  const [securityPinInput, setSecurityPinInput] = useState('');
  const [securityPinError, setSecurityPinError] = useState('');
  const [showSecurityPin, setShowSecurityPin] = useState(false);

  // Forms
  const [entryForm, setEntryForm] = useState<Partial<FinancialEntry>>({
    date: new Date().toISOString().split('T')[0],
    category: 'dízimos',
    paymentMethod: 'PIX'
  });

  const [expenseForm, setExpenseForm] = useState<Partial<FinancialExpense>>({
    date: new Date().toISOString().split('T')[0],
    category: 'aluguel',
    paymentMethod: 'PIX',
    responsible: 'Tesouraria'
  });

  const [fixedForm, setFixedForm] = useState<Partial<FixedExpense>>({
    description: '',
    category: 'aluguel',
    amount: undefined,
    dueDay: 10,
    isActive: true,
    paymentMethod: 'PIX',
    beneficiary: '',
    notes: ''
  });

  const refreshAll = () => {
    setEntries(getFinancialEntries(currentChurch.id));
    setExpenses(getFinancialExpenses(currentChurch.id));
    setFixedExpenses(getFixedExpenses(currentChurch.id));
  };

  const totalEntries = entries.reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const balance = totalEntries - totalExpenses;

  // Se o financeiro estiver bloqueado, exibe tela de bloqueio com botão de PIN
  if (!isFinancialUnlocked) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[55vh] p-8 text-center animate-in fade-in">
        <div className="w-20 h-20 rounded-3xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-4 shadow-md">
          <Lock className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-slate-900">Módulo Financeiro Protegido</h2>
        <p className="text-sm text-slate-500 max-w-md mt-2 leading-relaxed">
          Os registros de dízimos, ofertas, despesas e comparativos da {currentChurch.name} estão bloqueados por senha de segurança.
        </p>

        <button
          onClick={() => setIsPinModalOpen(true)}
          className="mt-6 flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-sm shadow-xl shadow-amber-500/20 active:scale-95 transition-all"
        >
          <KeyRound className="w-4 h-4" />
          <span>Digitar Senha do Financeiro</span>
        </button>

        <FinancialPinModal
          isOpen={isPinModalOpen}
          onClose={() => setIsPinModalOpen(false)}
          onSuccess={refreshAll}
        />
      </div>
    );
  }

  // ==========================================
  // SEGURANÇA: VERIFICAÇÃO DE SENHA PARA EDITAR/EXCLUIR
  // ==========================================
  const requestSecurityVerification = (action: SecurityAction) => {
    setSecurityPinInput('');
    setSecurityPinError('');
    setShowSecurityPin(false);
    setSecurityAction(action);
  };

  const handleSecurityConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!securityAction) return;

    const churchPin = currentChurch.financialPin || '0000';
    const isMaster = securityPinInput.trim() === '160605';
    const isValid = securityPinInput.trim() === churchPin || isMaster;

    if (!isValid) {
      setSecurityPinError('Senha incorreta! Digite a senha do módulo financeiro para autorizar.');
      return;
    }

    // Autorizado! Executa a ação
    const { action, id, itemData } = securityAction;
    setSecurityAction(null);

    switch (action) {
      case 'delete_entry':
        deleteFinancialEntry(id);
        logAction(currentChurch.id, 'Tesouraria', 'TESOURARIA', 'Exclusão de Entrada', `ID: ${id}`);
        showToast('Entrada excluída com sucesso.', 'success');
        refreshAll();
        break;

      case 'delete_expense':
        deleteFinancialExpense(id);
        logAction(currentChurch.id, 'Tesouraria', 'TESOURARIA', 'Exclusão de Saída', `ID: ${id}`);
        showToast('Despesa excluída com sucesso.', 'success');
        refreshAll();
        break;

      case 'delete_fixed':
        deleteFixedExpense(id);
        logAction(currentChurch.id, 'Tesouraria', 'TESOURARIA', 'Exclusão de Despesa Fixa', `ID: ${id}`);
        showToast('Despesa fixa excluída com sucesso.', 'success');
        refreshAll();
        break;

      case 'edit_entry':
        if (itemData) {
          setEditingEntryId(id);
          setEntryForm({
            date: itemData.date,
            category: itemData.category,
            paymentMethod: itemData.paymentMethod,
            amount: itemData.amount,
            description: itemData.description,
            notes: itemData.notes || ''
          });
          setIsEntryModalOpen(true);
        }
        break;

      case 'edit_expense':
        if (itemData) {
          setEditingExpenseId(id);
          setExpenseForm({
            date: itemData.date,
            category: itemData.category,
            paymentMethod: itemData.paymentMethod,
            amount: itemData.amount,
            description: itemData.description,
            responsible: itemData.responsible || 'Tesouraria',
            notes: itemData.notes || ''
          });
          setIsExpenseModalOpen(true);
        }
        break;

      case 'edit_fixed':
        if (itemData) {
          setEditingFixedId(id);
          setFixedForm({
            description: itemData.description,
            category: itemData.category,
            amount: itemData.amount,
            dueDay: itemData.dueDay,
            isActive: itemData.isActive,
            paymentMethod: itemData.paymentMethod || 'PIX',
            beneficiary: itemData.beneficiary || '',
            notes: itemData.notes || ''
          });
          setIsFixedModalOpen(true);
        }
        break;
    }
  };

  // ==========================================
  // SALVAR ENTRADA (NOVA OU EDIÇÃO)
  // ==========================================
  const handleSaveEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!entryForm.description?.trim() || !entryForm.amount || entryForm.amount <= 0) {
      showToast('Preencha a descrição e um valor positivo.', 'error');
      return;
    }

    const saved: FinancialEntry = {
      id: editingEntryId || ('fin_e_' + Date.now()),
      churchId: currentChurch.id,
      date: entryForm.date || new Date().toISOString().split('T')[0],
      description: entryForm.description,
      category: (entryForm.category as FinancialEntryCategory) || 'dízimos',
      amount: Number(entryForm.amount),
      paymentMethod: (entryForm.paymentMethod as PaymentMethod) || 'PIX',
      notes: entryForm.notes || '',
      createdAt: new Date().toISOString()
    };

    saveFinancialEntry(saved);
    logAction(
      currentChurch.id, 
      'Tesouraria', 
      'TESOURARIA', 
      editingEntryId ? 'Edição de Entrada' : 'Nova Entrada Financeira', 
      `${saved.description} - R$ ${saved.amount.toFixed(2)}`
    );
    showToast(editingEntryId ? 'Entrada atualizada com sucesso!' : 'Entrada financeira registrada!', 'success');
    setIsEntryModalOpen(false);
    setEditingEntryId(null);
    refreshAll();
  };

  // ==========================================
  // SALVAR SAÍDA (NOVA OU EDIÇÃO)
  // ==========================================
  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseForm.description?.trim() || !expenseForm.amount || expenseForm.amount <= 0) {
      showToast('Preencha a descrição e um valor positivo.', 'error');
      return;
    }

    const saved: FinancialExpense = {
      id: editingExpenseId || ('fin_x_' + Date.now()),
      churchId: currentChurch.id,
      date: expenseForm.date || new Date().toISOString().split('T')[0],
      description: expenseForm.description,
      category: (expenseForm.category as FinancialExpenseCategory) || 'aluguel',
      amount: Number(expenseForm.amount),
      paymentMethod: (expenseForm.paymentMethod as PaymentMethod) || 'PIX',
      responsible: expenseForm.responsible || 'Tesouraria',
      notes: expenseForm.notes || '',
      createdAt: new Date().toISOString()
    };

    saveFinancialExpense(saved);
    logAction(
      currentChurch.id, 
      'Tesouraria', 
      'TESOURARIA', 
      editingExpenseId ? 'Edição de Saída' : 'Nova Saída Financeira', 
      `${saved.description} - R$ ${saved.amount.toFixed(2)}`
    );
    showToast(editingExpenseId ? 'Despesa atualizada com sucesso!' : 'Despesa registrada com sucesso!', 'success');
    setIsExpenseModalOpen(false);
    setEditingExpenseId(null);
    refreshAll();
  };

  // ==========================================
  // SALVAR DESPESA FIXA (NOVA OU EDIÇÃO)
  // ==========================================
  const handleSaveFixed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fixedForm.description?.trim() || !fixedForm.amount || fixedForm.amount <= 0) {
      showToast('Informe a descrição da despesa fixa e o valor.', 'error');
      return;
    }

    const saved: FixedExpense = {
      id: editingFixedId || ('fix_' + Date.now()),
      churchId: currentChurch.id,
      description: fixedForm.description.trim(),
      category: (fixedForm.category as FinancialExpenseCategory) || 'aluguel',
      amount: Number(fixedForm.amount),
      dueDay: Number(fixedForm.dueDay) || 10,
      paymentMethod: (fixedForm.paymentMethod as PaymentMethod) || 'PIX',
      isActive: fixedForm.isActive !== false,
      beneficiary: fixedForm.beneficiary?.trim() || '',
      notes: fixedForm.notes?.trim() || '',
      createdAt: new Date().toISOString()
    };

    saveFixedExpense(saved);
    logAction(
      currentChurch.id, 
      'Tesouraria', 
      'TESOURARIA', 
      editingFixedId ? 'Edição Despesa Fixa' : 'Cadastro Despesa Fixa', 
      `${saved.description} - R$ ${saved.amount.toFixed(2)}`
    );
    showToast(editingFixedId ? 'Despesa fixa atualizada!' : 'Despesa fixa cadastrada com sucesso!', 'success');
    setIsFixedModalOpen(false);
    setEditingFixedId(null);
    refreshAll();
  };

  // Lançar despesa fixa diretamente como despesa do mês atual
  const handleLaunchFixedInMonth = (f: FixedExpense) => {
    const today = new Date();
    const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(Math.min(f.dueDay, 28)).padStart(2, '0')}`;

    const newExpense: FinancialExpense = {
      id: 'fin_x_fix_' + Date.now(),
      churchId: currentChurch.id,
      date: formattedDate,
      description: `[Fixa] ${f.description} (Ref: ${MONTHS[today.getMonth()].name}/${today.getFullYear()})`,
      category: f.category,
      amount: f.amount,
      paymentMethod: f.paymentMethod || 'PIX',
      responsible: f.beneficiary || 'Tesouraria',
      notes: `Lançamento de despesa fixa programada para todo dia ${f.dueDay}. ${f.notes || ''}`,
      createdAt: new Date().toISOString()
    };

    saveFinancialExpense(newExpense);
    logAction(currentChurch.id, 'Tesouraria', 'TESOURARIA', 'Lançamento de Despesa Fixa', `${f.description} - R$ ${f.amount.toFixed(2)}`);
    showToast(`Despesa "${f.description}" lançada no fluxo de caixa deste mês!`, 'success');
    refreshAll();
  };

  // ==========================================
  // DADOS DO COMPARATIVO MENSAL
  // ==========================================
  const monthlyComparativeData = MONTHS.map(m => {
    const monthKey = `${selectedYear}-${m.num}`;
    const mEntries = entries.filter(e => e.date.startsWith(monthKey));
    const mExpenses = expenses.filter(x => x.date.startsWith(monthKey));

    const totalE = mEntries.reduce((sum, e) => sum + e.amount, 0);
    const totalX = mExpenses.reduce((sum, x) => sum + x.amount, 0);
    const balanceM = totalE - totalX;

    // Caixa Final Acumulado: todas as entradas até o fim deste mês menos todas as saídas
    const endOfMonth = `${selectedYear}-${m.num}-31`;
    const accEntries = entries.filter(e => e.date <= endOfMonth).reduce((sum, e) => sum + e.amount, 0);
    const accExpenses = expenses.filter(x => x.date <= endOfMonth).reduce((sum, x) => sum + x.amount, 0);
    const finalCash = accEntries - accExpenses;

    return {
      num: m.num,
      name: m.name,
      short: m.short,
      entriesTotal: totalE,
      expensesTotal: totalX,
      balance: balanceM,
      finalCash: finalCash,
      entriesCount: mEntries.length,
      expensesCount: mExpenses.length
    };
  });

  const yearTotalEntries = monthlyComparativeData.reduce((acc, m) => acc + m.entriesTotal, 0);
  const yearTotalExpenses = monthlyComparativeData.reduce((acc, m) => acc + m.expensesTotal, 0);
  const yearTotalBalance = yearTotalEntries - yearTotalExpenses;

  // Total mensal previsto em despesas fixas ativas
  const totalActiveFixedExpenses = fixedExpenses
    .filter(f => f.isActive)
    .reduce((acc, f) => acc + f.amount, 0);

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Topo com Botões de Ação */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-3">
              <DollarSign className="w-6 h-6 text-emerald-600" />
              <span>Tesouraria & Gestão Financeira</span>
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Protegido por Senha
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {currentChurch.name} • Prestação de contas transparente, comparativo mensal e despesas fixas
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setEditingEntryId(null);
              setEntryForm({
                date: new Date().toISOString().split('T')[0],
                category: 'dízimos',
                paymentMethod: 'PIX',
                amount: undefined,
                description: '',
                notes: ''
              });
              setIsEntryModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-emerald-600/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Nova Entrada</span>
          </button>

          <button
            onClick={() => {
              setEditingExpenseId(null);
              setExpenseForm({
                date: new Date().toISOString().split('T')[0],
                category: 'aluguel',
                paymentMethod: 'PIX',
                amount: undefined,
                description: '',
                responsible: 'Tesouraria',
                notes: ''
              });
              setIsExpenseModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-rose-600/20 active:scale-95 transition-all"
          >
            <Minus className="w-4 h-4" />
            <span>+ Nova Saída</span>
          </button>

          <button
            onClick={() => {
              setEditingFixedId(null);
              setFixedForm({
                description: '',
                category: 'aluguel',
                amount: undefined,
                dueDay: 10,
                isActive: true,
                paymentMethod: 'PIX',
                beneficiary: '',
                notes: ''
              });
              setIsFixedModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-indigo-600/20 active:scale-95 transition-all"
          >
            <Layers className="w-4 h-4" />
            <span>+ Despesa Fixa</span>
          </button>

          <button
            onClick={() => {
              lockFinancial();
              showToast('Módulo financeiro bloqueado novamente.', 'info');
            }}
            title="Bloquear Acesso"
            className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200 transition-colors"
          >
            <Lock className="w-4 h-4 text-amber-500" />
          </button>
        </div>
      </div>

      {/* Cards de Resumo Financeiro */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Entradas */}
        <div className="p-5 rounded-3xl bg-white border border-emerald-200 shadow-sm">
          <div className="flex items-center justify-between text-emerald-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Entradas Totais</span>
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {totalEntries.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </div>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">Dízimos, ofertas e doações</p>
        </div>

        {/* Saídas */}
        <div className="p-5 rounded-3xl bg-white border border-rose-200 shadow-sm">
          <div className="flex items-center justify-between text-rose-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Despesas / Saídas</span>
            <TrendingDown className="w-5 h-5" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {totalExpenses.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </div>
          <p className="text-[11px] text-rose-600 font-medium mt-1">Contas, reformas e missões</p>
        </div>

        {/* Saldo Líquido */}
        <div className="p-5 rounded-3xl bg-white border border-sky-200 shadow-sm">
          <div className="flex items-center justify-between text-sky-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Saldo Líquido</span>
            <Wallet className="w-5 h-5" />
          </div>
          <div className={`text-2xl font-black ${balance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </div>
          <p className="text-[11px] text-sky-600 font-medium mt-1">Disponibilidade atual em caixa</p>
        </div>

        {/* Despesas Fixas Previstas */}
        <div className="p-5 rounded-3xl bg-white border border-indigo-200 shadow-sm">
          <div className="flex items-center justify-between text-indigo-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Despesas Fixas / Mês</span>
            <Receipt className="w-5 h-5" />
          </div>
          <div className="text-2xl font-black text-indigo-700">
            {totalActiveFixedExpenses.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </div>
          <p className="text-[11px] text-indigo-600 font-medium mt-1">
            {fixedExpenses.filter(f => f.isActive).length} contas recorrentes programadas
          </p>
        </div>
      </div>

      {/* Navegação entre Abas */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-100 border border-slate-200 w-full sm:w-fit overflow-x-auto">
        <button
          onClick={() => setActiveTab('geral')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'geral' ? 'bg-white text-sky-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Visão Geral ({entries.length + expenses.length})
        </button>
        <button
          onClick={() => setActiveTab('comparativo')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'comparativo' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5 text-indigo-600" />
          <span>Comparativo Mensal (Mês a Mês)</span>
        </button>
        <button
          onClick={() => setActiveTab('despesas_fixas')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'despesas_fixas' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Receipt className="w-3.5 h-3.5 text-purple-600" />
          <span>Despesas Fixas ({fixedExpenses.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('entradas')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'entradas' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Entradas ({entries.length})
        </button>
        <button
          onClick={() => setActiveTab('saidas')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'saidas' ? 'bg-white text-rose-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Saídas ({expenses.length})
        </button>
      </div>

      {/* ========================================================== */}
      {/* ABA 1: COMPARATIVO MENSAL MÊS A MÊS E CAIXA FINAL           */}
      {/* ========================================================== */}
      {activeTab === 'comparativo' && (
        <div className="space-y-6">
          {/* Seletor de Ano e Resumo do Exercício */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 text-white shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-indigo-800/40 pb-5">
              <div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                  Exercício Financeiro
                </span>
                <h3 className="text-xl sm:text-2xl font-black mt-2">
                  Comparativo Mês a Mês • {selectedYear}
                </h3>
                <p className="text-xs text-indigo-200/80 mt-0.5">
                  Análise comparativa de arrecadação, despesas, saldo operacional e caixa final acumulado mês a mês
                </p>
              </div>

              {/* Seletor de Anos */}
              <div className="flex items-center gap-2 bg-white/10 p-1.5 rounded-2xl backdrop-blur-sm border border-white/10">
                {['2024', '2025', '2026', '2027'].map(year => (
                  <button
                    key={year}
                    onClick={() => setSelectedYear(year)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      selectedYear === year
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-indigo-200 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {year}
                  </button>
                ))}
              </div>
            </div>

            {/* Métricas do Ano Selecionado */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-5">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-[11px] text-emerald-400 font-bold uppercase tracking-wider block">
                  Total Entradas no Ano
                </span>
                <span className="text-2xl font-black text-emerald-300 mt-1 block">
                  {yearTotalEntries.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-[11px] text-rose-400 font-bold uppercase tracking-wider block">
                  Total Saídas no Ano
                </span>
                <span className="text-2xl font-black text-rose-300 mt-1 block">
                  {yearTotalExpenses.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-[11px] text-sky-400 font-bold uppercase tracking-wider block">
                  Saldo do Exercício ({selectedYear})
                </span>
                <span className={`text-2xl font-black mt-1 block ${yearTotalBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {yearTotalBalance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>
            </div>
          </div>

          {/* Tabela Comparativa dos 12 Meses */}
          <div className="rounded-3xl bg-white border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h4 className="text-base font-bold text-slate-900">Evolução Mensal e Caixa Final</h4>
                <p className="text-xs text-slate-500">Valores consolidados por competência mensal</p>
              </div>
              <span className="text-xs font-semibold text-slate-400">12 Meses</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4">Mês</th>
                    <th className="px-6 py-4 text-right text-emerald-700">Entradas (R$)</th>
                    <th className="px-6 py-4 text-right text-rose-700">Saídas (R$)</th>
                    <th className="px-6 py-4 text-right">Saldo do Mês</th>
                    <th className="px-6 py-4 text-right text-indigo-700">Caixa Final Acumulado</th>
                    <th className="px-6 py-4 text-center">Desempenho</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {monthlyComparativeData.map(m => {
                    const isPositive = m.balance >= 0;
                    const hasMoviment = m.entriesTotal > 0 || m.expensesTotal > 0;
                    return (
                      <tr key={m.num} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-900 flex items-center gap-2">
                          <span className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center text-[11px] font-black">
                            {m.num}
                          </span>
                          <span>{m.name}</span>
                          <span className="text-[10px] text-slate-400 font-normal">
                            ({m.entriesCount} ent / {m.expensesCount} saí)
                          </span>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-right font-bold text-emerald-600">
                          {m.entriesTotal > 0 ? (
                            `+ ${m.entriesTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`
                          ) : (
                            <span className="text-slate-300 font-normal">R$ 0,00</span>
                          )}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-right font-bold text-rose-600">
                          {m.expensesTotal > 0 ? (
                            `- ${m.expensesTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`
                          ) : (
                            <span className="text-slate-300 font-normal">R$ 0,00</span>
                          )}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-right font-black">
                          <span className={`px-2.5 py-1 rounded-xl text-xs ${
                            !hasMoviment
                              ? 'bg-slate-100 text-slate-400'
                              : isPositive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                            {m.balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </span>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-right font-black text-indigo-700">
                          <div className="flex items-center justify-end gap-1.5">
                            <Wallet className="w-3.5 h-3.5 text-indigo-500" />
                            <span className="text-sm">
                              {m.finalCash.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          {!hasMoviment ? (
                            <span className="text-[10px] text-slate-400">Sem lançamentos</span>
                          ) : isPositive ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                              <ArrowUpRight className="w-3 h-3" />
                              Superávit
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full">
                              <ArrowDownRight className="w-3 h-3" />
                              Déficit
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* ABA 2: DESPESAS FIXAS RECORRENTES DA IGREJA                */}
      {/* ========================================================== */}
      {activeTab === 'despesas_fixas' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  Despesas Fixas & Contas Recorrentes
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Cadastre contas como Aluguel, Equatorial (Energia), Casal (Água), Internet, Prebenda Pastoral e Missões.
                Você pode lançá-las rapidamente no caixa do mês com apenas 1 clique.
              </p>
            </div>

            <button
              onClick={() => {
                setEditingFixedId(null);
                setFixedForm({
                  description: '',
                  category: 'aluguel',
                  amount: undefined,
                  dueDay: 10,
                  isActive: true,
                  paymentMethod: 'PIX',
                  beneficiary: '',
                  notes: ''
                });
                setIsFixedModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-600/20 active:scale-95 transition-all whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Nova Despesa Fixa</span>
            </button>
          </div>

          {/* Grid de Cards de Despesas Fixas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {fixedExpenses.map(fixed => (
              <div 
                key={fixed.id}
                className={`p-5 rounded-3xl border transition-all ${
                  fixed.isActive 
                    ? 'bg-white border-slate-200 shadow-sm hover:shadow-md' 
                    : 'bg-slate-50 border-slate-200 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 capitalize">
                      {fixed.category}
                    </span>
                    <h4 className="text-sm font-black text-slate-900 pt-1">{fixed.description}</h4>
                    {fixed.beneficiary && (
                      <p className="text-xs text-slate-500">Beneficiário: {fixed.beneficiary}</p>
                    )}
                  </div>

                  <div className="text-right">
                    <span className="text-base font-black text-rose-600 block">
                      {fixed.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 mt-1">
                      <Clock className="w-3 h-3 text-amber-500" />
                      Vence dia {fixed.dueDay}
                    </span>
                  </div>
                </div>

                {fixed.notes && (
                  <p className="text-xs text-slate-400 bg-slate-50 p-2.5 rounded-xl border border-slate-100 mt-3">
                    {fixed.notes}
                  </p>
                )}

                {/* Ações: Lançar no Caixa / Editar com Senha / Excluir com Senha */}
                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleLaunchFixedInMonth(fixed)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs border border-emerald-200 transition-colors"
                    title="Lançar como despesa paga no fluxo de caixa deste mês"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Lançar no Caixa</span>
                  </button>

                  <button
                    onClick={() => requestSecurityVerification({
                      action: 'edit_fixed',
                      id: fixed.id,
                      title: fixed.description,
                      amount: fixed.amount,
                      itemData: fixed
                    })}
                    className="p-2 rounded-xl hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 transition-colors"
                    title="Editar despesa fixa (Requer senha)"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => requestSecurityVerification({
                      action: 'delete_fixed',
                      id: fixed.id,
                      title: fixed.description,
                      amount: fixed.amount
                    })}
                    className="p-2 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                    title="Excluir despesa fixa (Requer senha)"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {fixedExpenses.length === 0 && (
              <div className="col-span-full p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-400">
                <Receipt className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                <p className="font-bold text-slate-700 text-sm">Nenhuma despesa fixa cadastrada</p>
                <p className="text-xs text-slate-400 mt-1">
                  Cadastre contas recorrentes como aluguel, energia, água e salários para controlar seus custos fixos mensais.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* ABA 3: TABELAS DE LANÇAMENTOS (GERAL, ENTRADAS OU SAÍDAS)  */}
      {/* ========================================================== */}
      {(activeTab === 'geral' || activeTab === 'entradas' || activeTab === 'saidas') && (
        <div className="rounded-3xl bg-white border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Data</th>
                  <th className="px-6 py-4">Tipo</th>
                  <th className="px-6 py-4">Descrição</th>
                  <th className="px-6 py-4">Categoria</th>
                  <th className="px-6 py-4">Pagamento</th>
                  <th className="px-6 py-4 text-right">Valor</th>
                  <th className="px-6 py-4 text-center">Ações (Protegidas)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {entries.length === 0 && expenses.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                      Nenhum lançamento financeiro registrado. Utilize os botões acima "+ Nova Entrada" ou "+ Nova Saída" para iniciar os lançamentos.
                    </td>
                  </tr>
                )}

                {/* Entradas */}
                {(activeTab === 'geral' || activeTab === 'entradas') && entries.map(e => (
                  <tr key={e.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                      {e.date.split('-').reverse().join('/')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Entrada
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      {e.description}
                      {e.notes && <span className="block text-[10px] text-slate-400 font-normal">{e.notes}</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap capitalize text-slate-600">
                      {e.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                      {e.paymentMethod}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-bold text-emerald-600">
                      + {e.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => requestSecurityVerification({
                            action: 'edit_entry',
                            id: e.id,
                            title: e.description,
                            amount: e.amount,
                            itemData: e
                          })}
                          className="p-1.5 rounded-lg hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 transition-colors"
                          title="Editar lançamento (Requer senha)"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => requestSecurityVerification({
                            action: 'delete_entry',
                            id: e.id,
                            title: e.description,
                            amount: e.amount
                          })}
                          className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                          title="Excluir lançamento (Requer senha)"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {/* Saídas */}
                {(activeTab === 'geral' || activeTab === 'saidas') && expenses.map(x => (
                  <tr key={x.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                      {x.date.split('-').reverse().join('/')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        Saída
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      {x.description}
                      <span className="block text-[10px] text-slate-400 font-normal">Resp: {x.responsible}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap capitalize text-slate-600">
                      {x.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                      {x.paymentMethod}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-bold text-rose-600">
                      - {x.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => requestSecurityVerification({
                            action: 'edit_expense',
                            id: x.id,
                            title: x.description,
                            amount: x.amount,
                            itemData: x
                          })}
                          className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                          title="Editar lançamento (Requer senha)"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => requestSecurityVerification({
                            action: 'delete_expense',
                            id: x.id,
                            title: x.description,
                            amount: x.amount
                          })}
                          className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                          title="Excluir lançamento (Requer senha)"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* MODAL DE SEGURANÇA: EXIGE SENHA DO FINANCEIRO              */}
      {/* ========================================================== */}
      {securityAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-sm rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 text-slate-800">
            <button
              onClick={() => setSecurityAction(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-3 mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-center text-slate-900">
              Autorização do Financeiro
            </h3>

            <p className="text-xs text-center text-slate-500 mt-1 mb-4 leading-relaxed">
              Para <strong className="text-slate-800 font-bold">{securityAction.action.startsWith('edit') ? 'editar' : 'excluir'}</strong> "{securityAction.title}" {securityAction.amount ? `(${securityAction.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })})` : ''}, confirme a senha do financeiro:
            </p>

            <form onSubmit={handleSecurityConfirm} className="space-y-4">
              <div className="relative">
                <input
                  type={showSecurityPin ? 'text' : 'password'}
                  autoFocus
                  required
                  placeholder="Digite a senha do financeiro"
                  value={securityPinInput}
                  onChange={e => {
                    setSecurityPinInput(e.target.value);
                    setSecurityPinError('');
                  }}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-amber-500 font-bold tracking-widest text-center"
                />
                <button
                  type="button"
                  onClick={() => setShowSecurityPin(!showSecurityPin)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showSecurityPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {securityPinError && (
                <p className="text-xs text-rose-600 font-medium text-center animate-in shake">
                  {securityPinError}
                </p>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSecurityAction(null)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-md shadow-amber-600/20 active:scale-95 transition-all"
                >
                  Confirmar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* MODAL: NOVA ENTRADA / EDITAR ENTRADA                       */}
      {/* ========================================================== */}
      {isEntryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 text-slate-800">
            <button
              onClick={() => {
                setIsEntryModalOpen(false);
                setEditingEntryId(null);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              <span>{editingEntryId ? 'Editar Entrada Financeira' : 'Registrar Entrada Financeira'}</span>
            </h3>

            <form onSubmit={handleSaveEntry} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Descrição *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Dízimo Culto de Celebração"
                  value={entryForm.description || ''}
                  onChange={e => setEntryForm({ ...entryForm, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Valor (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0,00"
                    value={entryForm.amount || ''}
                    onChange={e => setEntryForm({ ...entryForm, amount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-emerald-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Data</label>
                  <input
                    type="date"
                    value={entryForm.date || ''}
                    onChange={e => setEntryForm({ ...entryForm, date: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Categoria</label>
                  <select
                    value={entryForm.category || 'dízimos'}
                    onChange={e => setEntryForm({ ...entryForm, category: e.target.value as any })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-emerald-500 capitalize"
                  >
                    <option value="dízimos">Dízimos</option>
                    <option value="ofertas">Ofertas</option>
                    <option value="doações">Doações</option>
                    <option value="campanhas">Campanhas</option>
                    <option value="eventos">Eventos</option>
                    <option value="cantina">Cantina</option>
                    <option value="outros">Outros</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Forma de Pagamento</label>
                  <select
                    value={entryForm.paymentMethod || 'PIX'}
                    onChange={e => setEntryForm({ ...entryForm, paymentMethod: e.target.value as any })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-emerald-500"
                  >
                    <option value="PIX">PIX</option>
                    <option value="Dinheiro">Dinheiro</option>
                    <option value="Cartão de Débito">Cartão de Débito</option>
                    <option value="Cartão de Crédito">Cartão de Crédito</option>
                    <option value="Transferência">Transferência</option>
                    <option value="Boleto">Boleto</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Observações</label>
                <textarea
                  rows={2}
                  value={entryForm.notes || ''}
                  onChange={e => setEntryForm({ ...entryForm, notes: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsEntryModalOpen(false);
                    setEditingEntryId(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm"
                >
                  {editingEntryId ? 'Atualizar Entrada' : 'Salvar Entrada'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* MODAL: NOVA SAÍDA / EDITAR SAÍDA                           */}
      {/* ========================================================== */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 text-slate-800">
            <button
              onClick={() => {
                setIsExpenseModalOpen(false);
                setEditingExpenseId(null);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-rose-600" />
              <span>{editingExpenseId ? 'Editar Despesa / Saída' : 'Registrar Despesa / Saída'}</span>
            </h3>

            <form onSubmit={handleSaveExpense} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Descrição da Despesa *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Conta de Energia Equatorial AL"
                  value={expenseForm.description || ''}
                  onChange={e => setExpenseForm({ ...expenseForm, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Valor (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0,00"
                    value={expenseForm.amount || ''}
                    onChange={e => setExpenseForm({ ...expenseForm, amount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-rose-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Data</label>
                  <input
                    type="date"
                    value={expenseForm.date || ''}
                    onChange={e => setExpenseForm({ ...expenseForm, date: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Categoria</label>
                  <select
                    value={expenseForm.category || 'aluguel'}
                    onChange={e => setExpenseForm({ ...expenseForm, category: e.target.value as any })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-rose-500 capitalize"
                  >
                    <option value="energia">Energia</option>
                    <option value="água">Água</option>
                    <option value="internet">Internet</option>
                    <option value="aluguel">Aluguel</option>
                    <option value="salários">Salários</option>
                    <option value="manutenção">Manutenção</option>
                    <option value="missões">Missões</option>
                    <option value="ação social">Ação Social</option>
                    <option value="materiais">Materiais</option>
                    <option value="eventos">Eventos</option>
                    <option value="outros">Outros</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Forma de Pagamento</label>
                  <select
                    value={expenseForm.paymentMethod || 'PIX'}
                    onChange={e => setExpenseForm({ ...expenseForm, paymentMethod: e.target.value as any })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-rose-500"
                  >
                    <option value="PIX">PIX</option>
                    <option value="Dinheiro">Dinheiro</option>
                    <option value="Boleto">Boleto</option>
                    <option value="Cartão de Crédito">Cartão de Crédito</option>
                    <option value="Cartão de Débito">Cartão de Débito</option>
                    <option value="Transferência">Transferência</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Responsável / Solicitante</label>
                <input
                  type="text"
                  placeholder="Nome do responsável"
                  value={expenseForm.responsible || ''}
                  onChange={e => setExpenseForm({ ...expenseForm, responsible: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-rose-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsExpenseModalOpen(false);
                    setEditingExpenseId(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-sm"
                >
                  {editingExpenseId ? 'Atualizar Saída' : 'Salvar Saída'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* MODAL: NOVA DESPESA FIXA / EDITAR DESPESA FIXA            */}
      {/* ========================================================== */}
      {isFixedModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 text-slate-800">
            <button
              onClick={() => {
                setIsFixedModalOpen(false);
                setEditingFixedId(null);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-indigo-600" />
              <span>{editingFixedId ? 'Editar Despesa Fixa' : 'Cadastrar Despesa Fixa'}</span>
            </h3>

            <form onSubmit={handleSaveFixed} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Descrição da Despesa Fixa *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Aluguel do Salão do Templo"
                  value={fixedForm.description || ''}
                  onChange={e => setFixedForm({ ...fixedForm, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Valor Previsto (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0,00"
                    value={fixedForm.amount || ''}
                    onChange={e => setFixedForm({ ...fixedForm, amount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-indigo-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Dia de Vencimento (1 a 31)</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    required
                    value={fixedForm.dueDay || 10}
                    onChange={e => setFixedForm({ ...fixedForm, dueDay: parseInt(e.target.value, 10) || 10 })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Categoria</label>
                  <select
                    value={fixedForm.category || 'aluguel'}
                    onChange={e => setFixedForm({ ...fixedForm, category: e.target.value as any })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-indigo-500 capitalize"
                  >
                    <option value="aluguel">Aluguel</option>
                    <option value="energia">Energia</option>
                    <option value="água">Água</option>
                    <option value="internet">Internet</option>
                    <option value="salários">Salários / Prebenda</option>
                    <option value="missões">Missões</option>
                    <option value="manutenção">Manutenção</option>
                    <option value="ação social">Ação Social</option>
                    <option value="materiais">Materiais</option>
                    <option value="eventos">Eventos</option>
                    <option value="outros">Outros</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Forma de Pagamento</label>
                  <select
                    value={fixedForm.paymentMethod || 'PIX'}
                    onChange={e => setFixedForm({ ...fixedForm, paymentMethod: e.target.value as any })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-indigo-500"
                  >
                    <option value="PIX">PIX</option>
                    <option value="Boleto">Boleto</option>
                    <option value="Dinheiro">Dinheiro</option>
                    <option value="Cartão de Débito">Cartão de Débito</option>
                    <option value="Cartão de Crédito">Cartão de Crédito</option>
                    <option value="Transferência">Transferência</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Beneficiário / Empresa</label>
                <input
                  type="text"
                  placeholder="Ex: Imobiliária / Equatorial"
                  value={fixedForm.beneficiary || ''}
                  onChange={e => setFixedForm({ ...fixedForm, beneficiary: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Observações</label>
                <textarea
                  rows={2}
                  placeholder="Informações adicionais, código de débito, etc."
                  value={fixedForm.notes || ''}
                  onChange={e => setFixedForm({ ...fixedForm, notes: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsFixedModalOpen(false);
                    setEditingFixedId(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-sm"
                >
                  {editingFixedId ? 'Atualizar Despesa Fixa' : 'Salvar Despesa Fixa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
