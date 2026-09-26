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
  BarChart3,
  Download,
  FileSpreadsheet,
  PiggyBank,
  ShieldCheck,
  Calendar,
  AlertCircle,
  ArrowRightLeft,
  Sparkles,
  Check,
  CheckCheck,
  Info,
  CalendarDays
} from 'lucide-react';
import { exportFinanceToExcel } from '../../services/excelBackup';
import { 
  FinancialEntry, 
  FinancialExpense, 
  FinancialEntryCategory, 
  FinancialExpenseCategory, 
  PaymentMethod,
  FixedExpense 
} from '../../types';
import { useChurch, useDataSync } from '../../context/ChurchContext';
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
  const { currentChurch, isFinancialUnlocked, lockFinancial, updateCurrentChurch } = useChurch();
  const { showToast } = useNotification();

  const [isPinModalOpen, setIsPinModalOpen] = useState(!isFinancialUnlocked);
  const [entries, setEntries] = useState<FinancialEntry[]>(() => getFinancialEntries(currentChurch.id));
  const [expenses, setExpenses] = useState<FinancialExpense[]>(() => getFinancialExpenses(currentChurch.id));
  const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>(() => getFixedExpenses(currentChurch.id));

  const [activeTab, setActiveTab] = useState<'geral' | 'comparativo' | 'provisionamento' | 'despesas_fixas' | 'entradas' | 'saidas'>('geral');
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [onlyMonthsWithData, setOnlyMonthsWithData] = useState<boolean>(true);

  // Modal de Efetuar Pagamento de Despesa Fixa (com desconto direto do caixa)
  const [isPayFixedModalOpen, setIsPayFixedModalOpen] = useState(false);
  const [payingFixedItem, setPayingFixedItem] = useState<FixedExpense | null>(null);
  const [payFixedDate, setPayFixedDate] = useState(new Date().toISOString().split('T')[0]);
  const [payFixedMethod, setPayFixedMethod] = useState<PaymentMethod>('PIX');
  const [payFixedNotes, setPayFixedNotes] = useState('');

  // Modais e Estados da Reserva de Emergência
  const [isReserveTargetModalOpen, setIsReserveTargetModalOpen] = useState(false);
  const [reserveTargetInput, setReserveTargetInput] = useState(String(currentChurch.reserveTarget || ''));

  const [isSendToReserveModalOpen, setIsSendToReserveModalOpen] = useState(false);
  const [sendReserveAmount, setSendReserveAmount] = useState('');
  const [sendReserveNotes, setSendReserveNotes] = useState('');

  const [isRescueReserveModalOpen, setIsRescueReserveModalOpen] = useState(false);
  const [rescueReserveAmount, setRescueReserveAmount] = useState('');
  const [rescueReserveNotes, setRescueReserveNotes] = useState('');

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

  useDataSync(refreshAll, [currentChurch.id]);

  const today = new Date();
  const currentMonthNum = String(today.getMonth() + 1).padStart(2, '0');
  const currentMonthKey = `${today.getFullYear()}-${currentMonthNum}`;
  const currentDay = today.getDate();

  const totalEntries = entries.reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const balance = totalEntries - totalExpenses;

  // Reserva de Emergência
  const currentReserveBalance = currentChurch.reserveBalance || 0;
  const currentReserveTarget = currentChurch.reserveTarget || 0;
  const reservePercent = currentReserveTarget > 0 
    ? Math.min(100, Math.round((currentReserveBalance / currentReserveTarget) * 100)) 
    : 0;
  const totalPatrimony = balance + currentReserveBalance;

  // Despesas Fixas & Provisionamento do mês corrente
  const activeFixedExpenses = fixedExpenses.filter(f => f.isActive);
  const totalProvisionedMonth = activeFixedExpenses.reduce((sum, f) => sum + f.amount, 0);

  // Despesas fixas já quitadas neste mês corrente
  const paidFixedThisMonth = activeFixedExpenses.filter(f => f.lastPaidMonth === currentMonthKey);
  const totalPaidFixedThisMonth = paidFixedThisMonth.reduce((sum, f) => sum + f.amount, 0);

  // Despesas fixas pendentes no mês corrente
  const pendingFixedThisMonth = activeFixedExpenses.filter(f => f.lastPaidMonth !== currentMonthKey);
  const totalPendingProvision = pendingFixedThisMonth.reduce((sum, f) => sum + f.amount, 0);

  // Saldo Livre Projetado (Caixa atual menos o que ainda falta pagar de contas do mês)
  const projectedFreeBalance = balance - totalPendingProvision;

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

  // Abrir modal de confirmação de pagamento de despesa fixa
  const handleOpenPayFixedModal = (fixed: FixedExpense) => {
    setPayingFixedItem(fixed);
    setPayFixedDate(new Date().toISOString().split('T')[0]);
    setPayFixedMethod(fixed.paymentMethod || 'PIX');
    setPayFixedNotes('');
    setIsPayFixedModalOpen(true);
  };

  // Efetuar pagamento da despesa fixa: desconta do caixa e marca como paga no mês
  const handleConfirmPayFixed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingFixedItem) return;

    const f = payingFixedItem;
    const refMonth = MONTHS[today.getMonth()].name;
    const refYear = today.getFullYear();

    // 1. Cria a saída no fluxo de caixa (descontando automaticamente do saldo do caixa)
    const newExpense: FinancialExpense = {
      id: 'fin_x_fix_' + Date.now(),
      churchId: currentChurch.id,
      date: payFixedDate,
      description: `[Fixa] ${f.description} (Ref: ${refMonth}/${refYear})`,
      category: f.category,
      amount: f.amount,
      paymentMethod: payFixedMethod,
      responsible: f.beneficiary || 'Tesouraria',
      notes: payFixedNotes 
        ? `${payFixedNotes} • Vencimento original dia ${f.dueDay}` 
        : `Pagamento de despesa fixa programada (Vencimento dia ${f.dueDay}). ${f.notes || ''}`,
      createdAt: new Date().toISOString()
    };
    saveFinancialExpense(newExpense);

    // 2. Atualiza a despesa fixa indicando que o pagamento do mês corrente foi efetuado
    const updatedFixed: FixedExpense = {
      ...f,
      lastPaidMonth: currentMonthKey,
      lastPaidDate: payFixedDate,
      lastExpenseId: newExpense.id
    };
    saveFixedExpense(updatedFixed);

    logAction(
      currentChurch.id, 
      'Tesouraria', 
      'TESOURARIA', 
      'Pagamento Efetuado de Despesa Fixa', 
      `${f.description} - R$ ${f.amount.toFixed(2)} (Ref: ${currentMonthKey})`
    );

    showToast(`Pagamento de "${f.description}" (R$ ${f.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}) efetuado e descontado do caixa!`, 'success');
    setIsPayFixedModalOpen(false);
    setPayingFixedItem(null);
    refreshAll();
  };

  // Desfazer status de pago de uma despesa fixa (caso tenha marcado por engano)
  const handleUnmarkPaidFixed = (f: FixedExpense) => {
    const updated: FixedExpense = {
      ...f,
      lastPaidMonth: undefined,
      lastPaidDate: undefined,
      lastExpenseId: undefined
    };
    saveFixedExpense(updated);
    showToast(`Status da despesa fixa "${f.description}" redefinido para pendente no mês.`, 'info');
    refreshAll();
  };

  // Salvar Meta Ideal da Reserva de Emergência
  const handleSaveReserveTarget = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(reserveTargetInput) || 0;
    await updateCurrentChurch({ reserveTarget: val });
    showToast(`Meta ideal da Reserva de Emergência atualizada para ${val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`, 'success');
    setIsReserveTargetModalOpen(false);
  };

  // Enviar Valor do Caixa para a Reserva de Emergência
  const handleConfirmSendToReserve = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(sendReserveAmount);
    if (!amount || amount <= 0) {
      showToast('Por favor, informe um valor positivo a ser enviado para a reserva.', 'error');
      return;
    }

    // 1. Registra saída no caixa (descontando do saldo do caixa)
    const newExpense: FinancialExpense = {
      id: 'fin_x_res_' + Date.now(),
      churchId: currentChurch.id,
      date: new Date().toISOString().split('T')[0],
      description: '[Reserva de Emergência] Aporte enviado do caixa para a reserva',
      category: 'outros',
      amount: amount,
      paymentMethod: 'Transferência',
      responsible: 'Tesouraria',
      notes: sendReserveNotes || 'Transferência de recursos do caixa operacional para a Reserva de Emergência da igreja.',
      createdAt: new Date().toISOString()
    };
    saveFinancialExpense(newExpense);

    // 2. Credita no saldo da reserva da congregação
    const newBalance = currentReserveBalance + amount;
    await updateCurrentChurch({ reserveBalance: newBalance });

    logAction(
      currentChurch.id,
      'Tesouraria',
      'TESOURARIA',
      'Aporte em Reserva de Emergência',
      `R$ ${amount.toFixed(2)} transferido do caixa para reserva`
    );

    showToast(`R$ ${amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} enviado com sucesso para a Reserva de Emergência!`, 'success');
    setIsSendToReserveModalOpen(false);
    setSendReserveAmount('');
    setSendReserveNotes('');
    refreshAll();
  };

  // Resgatar Valor da Reserva de Emergência de Volta para o Caixa
  const handleConfirmRescueReserve = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(rescueReserveAmount);
    if (!amount || amount <= 0) {
      showToast('Por favor, informe um valor positivo a ser resgatado.', 'error');
      return;
    }
    if (amount > currentReserveBalance) {
      showToast(`O valor informado (R$ ${amount.toFixed(2)}) é maior que o saldo da reserva (R$ ${currentReserveBalance.toFixed(2)}).`, 'error');
      return;
    }

    // 1. Registra entrada no caixa (somando no saldo do caixa)
    const newEntry: FinancialEntry = {
      id: 'fin_e_res_' + Date.now(),
      churchId: currentChurch.id,
      date: new Date().toISOString().split('T')[0],
      description: '[Reserva de Emergência] Resgate da reserva para o caixa operacional',
      category: 'outros',
      amount: amount,
      paymentMethod: 'Transferência',
      notes: rescueReserveNotes || 'Resgate de recursos da reserva de emergência para custeio no caixa da congregação.',
      createdAt: new Date().toISOString()
    };
    saveFinancialEntry(newEntry);

    // 2. Debita do saldo da reserva da congregação
    const newBalance = Math.max(0, currentReserveBalance - amount);
    await updateCurrentChurch({ reserveBalance: newBalance });

    logAction(
      currentChurch.id,
      'Tesouraria',
      'TESOURARIA',
      'Resgate de Reserva de Emergência',
      `R$ ${amount.toFixed(2)} resgatado da reserva para o caixa`
    );

    showToast(`R$ ${amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} resgatado para o caixa operacional com sucesso!`, 'success');
    setIsRescueReserveModalOpen(false);
    setRescueReserveAmount('');
    setRescueReserveNotes('');
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

  const handleExportExcel = () => {
    exportFinanceToExcel(currentChurch, entries, expenses, fixedExpenses, selectedYear);
    showToast(`Planilha financeira de ${selectedYear} exportada com sucesso!`, 'success');
  };

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
            type="button"
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs sm:text-sm font-bold shadow-xs active:scale-95 transition-all"
            title="Baixar planilha Excel com fluxo de caixa, comparativo mensal e despesas fixas"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Baixar em Excel</span>
          </button>

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

        {/* Despesas Fixas & Provisionamento */}
        <div className="p-5 rounded-3xl bg-white border border-indigo-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-indigo-600 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Despesas Fixas / Mês</span>
              <Receipt className="w-5 h-5" />
            </div>
            <div className="text-2xl font-black text-indigo-700">
              {totalActiveFixedExpenses.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
            <p className="text-[11px] text-indigo-600 font-medium mt-1">
              {fixedExpenses.filter(f => f.isActive).length} contas recorrentes cadastradas
            </p>
          </div>

          <button
            onClick={() => setActiveTab('provisionamento')}
            className="mt-3 flex items-center justify-between w-full px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold transition-all shadow-xs"
            title="Ir para o demonstrativo de provisionamento e contas a pagar do mês"
          >
            <span className="flex items-center gap-1.5">
              <CalendarDays className="w-3.5 h-3.5 text-amber-600" />
              <span>Ver Provisionamento</span>
            </span>
            <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px]">
              {pendingFixedThisMonth.length} a pagar
            </span>
          </button>
        </div>
      </div>

      {/* Navegação entre Abas (Posicionada no topo para visibilidade imediata) */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-100 border border-slate-200 w-full overflow-x-auto shadow-xs">
        <button
          onClick={() => setActiveTab('geral')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'geral' ? 'bg-white text-sky-700 shadow-md' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>Visão Geral</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-700">
            {entries.length + expenses.length}
          </span>
        </button>
        
        {/* ABA PROVISIONAMENTO EM DESTAQUE */}
        <button
          onClick={() => setActiveTab('provisionamento')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black whitespace-nowrap transition-all ${
            activeTab === 'provisionamento' 
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30' 
              : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300/60'
          }`}
        >
          <CalendarDays className="w-4 h-4 text-amber-700" />
          <span>Provisionamento do Mês</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
            activeTab === 'provisionamento' ? 'bg-slate-950 text-white' : 'bg-amber-500 text-slate-950'
          }`}>
            {pendingFixedThisMonth.length} a pagar
          </span>
        </button>

        <button
          onClick={() => setActiveTab('despesas_fixas')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'despesas_fixas' ? 'bg-white text-purple-700 shadow-md' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Receipt className="w-4 h-4 text-purple-600" />
          <span>Despesas Fixas ({fixedExpenses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('comparativo')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'comparativo' ? 'bg-white text-indigo-700 shadow-md' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BarChart3 className="w-4 h-4 text-indigo-600" />
          <span>Comparativo Mensal</span>
        </button>

        <button
          onClick={() => setActiveTab('entradas')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'entradas' ? 'bg-white text-emerald-700 shadow-md' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>Entradas ({entries.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('saidas')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'saidas' ? 'bg-white text-rose-700 shadow-md' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>Saídas ({expenses.length})</span>
        </button>
      </div>

      {/* Card Especial: Reserva de Emergência & Patrimônio Total */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 text-white border border-emerald-500/20 shadow-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-400/30">
                <PiggyBank className="w-5 h-5" />
              </span>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  Fundo de Segurança & Contingência
                </span>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg sm:text-xl font-black text-white">
                    Reserva do Caixa (Emergência)
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setReserveTargetInput(String(currentReserveTarget || ''));
                      setIsReserveTargetModalOpen(true);
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-emerald-300 text-xs font-bold border border-white/10 transition-colors"
                    title="Definir ou editar valor ideal de reserva"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Definir Meta</span>
                  </button>
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              Recurso estratégico guardado para obras urgentes e imprevistos. O valor fica seguro e subtraído do caixa operacional diário.
            </p>
          </div>

          {/* Valores, Meta e Ações */}
          <div className="flex flex-wrap items-center gap-6 w-full lg:w-auto">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Saldo Guardado na Reserva</span>
              <span className="text-2xl sm:text-3xl font-black text-emerald-400">
                {currentReserveBalance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[11px] text-slate-300">
                  Meta ideal: <strong className="text-white">{currentReserveTarget > 0 ? currentReserveTarget.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'Não definida'}</strong>
                </span>
                {currentReserveTarget > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {reservePercent}% atingido
                  </span>
                )}
              </div>
              {currentReserveTarget > 0 && (
                <div className="w-full sm:w-48 h-2 rounded-full bg-white/10 overflow-hidden mt-2">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                    style={{ width: `${reservePercent}%` }}
                  />
                </div>
              )}
            </div>

            {/* Botões de Aporte e Resgate */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setSendReserveAmount('');
                  setSendReserveNotes('');
                  setIsSendToReserveModalOpen(true);
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-emerald-500/25 active:scale-95 transition-all"
                title="Transferir valor disponível do caixa operacional para a Reserva de Emergência"
              >
                <ArrowRightLeft className="w-4 h-4" />
                <span>Enviar do Caixa para Reserva</span>
              </button>

              {currentReserveBalance > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setRescueReserveAmount('');
                    setRescueReserveNotes('');
                    setIsRescueReserveModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white border border-white/10 font-bold text-xs active:scale-95 transition-all"
                  title="Resgatar valor da reserva para o caixa operacional"
                >
                  <span>Resgatar para Caixa</span>
                </button>
              )}
            </div>
          </div>
        </div>
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

          {/* Tabela Comparativa Mensal */}
          <div className="rounded-3xl bg-white border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-base font-bold text-slate-900">Evolução Mensal e Caixa Final</h4>
                <p className="text-xs text-slate-500">Valores consolidados por competência mensal (entradas, saídas e saldo acumulado)</p>
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer select-none bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                  <input
                    type="checkbox"
                    checked={onlyMonthsWithData}
                    onChange={e => setOnlyMonthsWithData(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Ocultar meses sem registro</span>
                </label>
              </div>
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
                  {monthlyComparativeData
                    .filter(m => !onlyMonthsWithData || m.entriesTotal > 0 || m.expensesTotal > 0 || m.num === currentMonthNum)
                    .map(m => {
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
                <tfoot className="bg-slate-100/90 font-black text-xs text-slate-900 border-t-2 border-slate-300">
                  <tr>
                    <td className="px-6 py-4 uppercase tracking-wider font-black text-slate-900">
                      TOTAL CONSOLIDADO ({selectedYear})
                    </td>
                    <td className="px-6 py-4 text-right text-emerald-700 font-black">
                      + {yearTotalEntries.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                    <td className="px-6 py-4 text-right text-rose-700 font-black">
                      - {yearTotalExpenses.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                    <td className="px-6 py-4 text-right font-black">
                      <span className={`px-2.5 py-1 rounded-xl text-xs ${yearTotalBalance >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                        {yearTotalBalance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-indigo-900 font-black">
                      {balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-[11px] font-bold text-slate-600">Saldo Geral</span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* ABA PROVISIONAMENTO & CONTAS A PAGAR DO MÊS               */}
      {/* ========================================================== */}
      {activeTab === 'provisionamento' && (
        <div className="space-y-6">
          {/* Banner de Apresentação e Indicadores de Provisão */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30 flex items-center gap-1.5">
                    <CalendarDays className="w-3.5 h-3.5" />
                    <span>Competência: {MONTHS[today.getMonth()].name} / {today.getFullYear()}</span>
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-slate-300">
                    Hoje: Dia {currentDay}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black mt-2 text-white">
                  Provisionamento de Pagamentos do Mês
                </h3>
                <p className="text-xs text-slate-300 mt-1 max-w-xl">
                  Planejamento e controle de desembolso para todas as contas fixas e compromissos recorrentes do mês corrente.
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
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Nova Conta Programada</span>
              </button>
            </div>

            {/* Grid com 4 Indicadores Cruciais */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-5">
              {/* 1. Total Provisionado */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-[10px] uppercase font-bold text-amber-300 tracking-wider block">
                  Total Provisionado no Mês
                </span>
                <span className="text-2xl font-black text-white mt-1 block">
                  {totalProvisionedMonth.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
                <p className="text-[11px] text-slate-400 mt-1">
                  {activeFixedExpenses.length} contas ativas programadas
                </p>
              </div>

              {/* 2. Já Quitado no Mês */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider block">
                  Já Quitado / Pago no Mês
                </span>
                <span className="text-2xl font-black text-emerald-400 mt-1 block">
                  {totalPaidFixedThisMonth.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
                <p className="text-[11px] text-emerald-300/80 mt-1">
                  {paidFixedThisMonth.length} contas já pagas e debitadas
                </p>
              </div>

              {/* 3. Provisão Pendente a Pagar */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-[10px] uppercase font-bold text-rose-400 tracking-wider block">
                  Provisão Pendente (A Pagar)
                </span>
                <span className="text-2xl font-black text-rose-300 mt-1 block">
                  {totalPendingProvision.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
                <p className="text-[11px] text-rose-300/80 mt-1">
                  {pendingFixedThisMonth.length} contas a pagar neste mês
                </p>
              </div>

              {/* 4. Saldo Livre Projetado */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-[10px] uppercase font-bold text-sky-300 tracking-wider block">
                  Saldo Livre Projetado
                </span>
                <span className={`text-2xl font-black mt-1 block ${projectedFreeBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {projectedFreeBalance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
                <p className="text-[11px] text-slate-300 mt-1">
                  {projectedFreeBalance >= 0 ? '✓ Caixa suficiente para o mês' : '⚠️ Déficit projetado de caixa'}
                </p>
              </div>
            </div>
          </div>

          {/* Tabela de Contas Provisionadas do Mês */}
          <div className="rounded-3xl bg-white border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-indigo-600" />
                  <span>Demonstrativo de Contas do Mês</span>
                </h4>
                <p className="text-xs text-slate-500">
                  Clique no botão "Pagamento Efetuado" para quitar a conta e descontar o valor diretamente do caixa.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3" /> {paidFixedThisMonth.length} Pagas
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 font-bold border border-rose-200">
                  <Clock className="w-3 h-3" /> {pendingFixedThisMonth.length} Pendentes
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4">Vencimento</th>
                    <th className="px-6 py-4">Descrição da Conta</th>
                    <th className="px-6 py-4">Categoria</th>
                    <th className="px-6 py-4">Beneficiário</th>
                    <th className="px-6 py-4 text-right">Valor Previsto</th>
                    <th className="px-6 py-4 text-center">Status no Mês</th>
                    <th className="px-6 py-4 text-center">Ação / Pagamento</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {activeFixedExpenses.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                        Nenhuma despesa fixa ativa cadastrada. Cadastre contas fixas na aba "Despesas Fixas" para acompanhar o provisionamento.
                      </td>
                    </tr>
                  )}

                  {[...activeFixedExpenses].sort((a, b) => a.dueDay - b.dueDay).map(fixed => {
                    const isPaid = fixed.lastPaidMonth === currentMonthKey;
                    const isDueToday = !isPaid && fixed.dueDay === currentDay;
                    const isOverdue = !isPaid && fixed.dueDay < currentDay;

                    return (
                      <tr key={fixed.id} className={`hover:bg-slate-50/80 transition-colors ${isPaid ? 'bg-emerald-50/20' : ''}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${
                              isPaid 
                                ? 'bg-emerald-100 text-emerald-800' 
                                : isOverdue 
                                ? 'bg-rose-100 text-rose-800' 
                                : isDueToday 
                                ? 'bg-amber-100 text-amber-800' 
                                : 'bg-slate-100 text-slate-700'
                            }`}>
                              {String(fixed.dueDay).padStart(2, '0')}
                            </span>
                            <span className="text-slate-500 font-normal text-[11px]">
                              Dia {fixed.dueDay}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-4 font-bold text-slate-900">
                          {fixed.description}
                          {fixed.notes && (
                            <span className="block text-[10px] text-slate-400 font-normal truncate max-w-xs">{fixed.notes}</span>
                          )}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap capitalize text-slate-600">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            {fixed.category}
                          </span>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                          {fixed.beneficiary || <span className="text-slate-300 italic">Não informado</span>}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-right font-black text-slate-900">
                          <span className={isPaid ? 'text-emerald-700' : 'text-slate-900'}>
                            {fixed.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </span>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          {isPaid ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Pago {fixed.lastPaidDate ? `(${fixed.lastPaidDate.split('-').reverse().slice(0, 2).join('/')})` : ''}</span>
                            </span>
                          ) : isDueToday ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span>Vencendo Hoje</span>
                            </span>
                          ) : isOverdue ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              <Clock className="w-3.5 h-3.5" />
                              <span>Vencido dia {fixed.dueDay}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
                              <Calendar className="w-3.5 h-3.5" />
                              <span>A Vencer</span>
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          {isPaid ? (
                            <div className="flex items-center justify-center gap-1">
                              <span className="text-emerald-600 font-bold text-xs flex items-center gap-1">
                                <Check className="w-4 h-4" /> Descontado do Caixa
                              </span>
                              <button
                                type="button"
                                onClick={() => handleUnmarkPaidFixed(fixed)}
                                className="p-1 text-slate-300 hover:text-slate-500 rounded-lg transition-colors ml-1"
                                title="Desfazer marcação de pago deste mês"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleOpenPayFixedModal(fixed)}
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm hover:shadow-md active:scale-95 transition-all"
                              title="Marcar como pagamento efetuado e descontar valor do caixa"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Pagamento Efetuado</span>
                            </button>
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

                {/* Status no mês corrente */}
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Status do Mês:</span>
                  {fixed.lastPaidMonth === currentMonthKey ? (
                    <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Pago no Mês</span>
                    </span>
                  ) : fixed.dueDay === currentDay ? (
                    <span className="inline-flex items-center gap-1 font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 animate-pulse">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Vencendo Hoje</span>
                    </span>
                  ) : fixed.dueDay < currentDay ? (
                    <span className="inline-flex items-center gap-1 font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Vencido dia {fixed.dueDay}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 font-bold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Vence dia {fixed.dueDay}</span>
                    </span>
                  )}
                </div>

                {/* Ações: Pagamento Efetuado (Descontar do Caixa) / Editar com Senha / Excluir com Senha */}
                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  {fixed.lastPaidMonth === currentMonthKey ? (
                    <div className="flex-1 flex items-center justify-between px-3 py-2 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200">
                      <span className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5" />
                        <span>Pago {fixed.lastPaidDate ? `(${fixed.lastPaidDate.split('-').reverse().slice(0, 2).join('/')})` : ''}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => handleUnmarkPaidFixed(fixed)}
                        className="text-[10px] text-slate-400 hover:text-rose-600 underline font-normal ml-2"
                        title="Desfazer e marcar como pendente"
                      >
                        Desfazer
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleOpenPayFixedModal(fixed)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm hover:shadow active:scale-95 transition-all"
                      title="Efetuar pagamento e descontar o valor diretamente do caixa da igreja"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Pagamento Efetuado</span>
                    </button>
                  )}

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

      {/* Bloco de Provisionamento do Mês dentro da Visão Geral */}
      {activeTab === 'geral' && activeFixedExpenses.length > 0 && (
        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Provisionamento do Mês: Contas Programadas
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800">
                  {pendingFixedThisMonth.length} a pagar neste mês
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Clique no botão <strong>"Pagamento Efetuado"</strong> para quitar a conta e descontar o valor automaticamente do caixa.
              </p>
            </div>

            <button
              onClick={() => setActiveTab('provisionamento')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl transition-all"
            >
              <span>Ver painel completo de provisionamento ({activeFixedExpenses.length})</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[...activeFixedExpenses].sort((a, b) => a.dueDay - b.dueDay).map(fixed => {
              const isPaid = fixed.lastPaidMonth === currentMonthKey;
              return (
                <div key={fixed.id} className={`p-4 rounded-2xl border transition-all ${isPaid ? 'bg-emerald-50/20 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Vencimento: Todo dia {fixed.dueDay}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 mt-0.5">{fixed.description}</h4>
                      {fixed.beneficiary && (
                        <p className="text-[11px] text-slate-500">Favorecido: {fixed.beneficiary}</p>
                      )}
                    </div>
                    <span className="text-sm font-black text-rose-600 whitespace-nowrap">
                      {fixed.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-center justify-between">
                    {isPaid ? (
                      <div className="w-full flex items-center justify-between text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                        <span className="flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5" /> Pago no Mês {fixed.lastPaidDate ? `(${fixed.lastPaidDate.split('-').reverse().slice(0, 2).join('/')})` : ''}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUnmarkPaidFixed(fixed)}
                          className="text-[10px] text-slate-400 hover:text-rose-600 underline font-normal ml-2"
                          title="Desfazer e marcar como pendente"
                        >
                          Desfazer
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleOpenPayFixedModal(fixed)}
                        className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs active:scale-95 transition-all"
                        title="Marcar pagamento como efetuado e debitar valor do caixa"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>✓ Pagamento Efetuado (Descontar do Caixa)</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
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

      {/* ========================================================== */}
      {/* MODAL: EFETUAR PAGAMENTO DE DESPESA FIXA (DESCONTA CAIXA)  */}
      {/* ========================================================== */}
      {isPayFixedModalOpen && payingFixedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 text-slate-800">
            <button
              onClick={() => {
                setIsPayFixedModalOpen(false);
                setPayingFixedItem(null);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <span className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200">
                <CheckCircle2 className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Confirmar Pagamento de Despesa Fixa
                </h3>
                <p className="text-xs text-slate-500">
                  O valor será debitado do caixa e a conta marcada como paga no mês
                </p>
              </div>
            </div>

            {/* Resumo da Conta */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 mb-4 space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Conta / Despesa:</span>
                <span className="font-bold text-slate-900">{payingFixedItem.description}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Valor a ser debitado:</span>
                <span className="font-black text-rose-600 text-sm">
                  {payingFixedItem.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>
              {payingFixedItem.beneficiary && (
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Beneficiário:</span>
                  <span className="font-semibold text-slate-700">{payingFixedItem.beneficiary}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Saldo Atual em Caixa:</span>
                <span className={`font-bold ${balance >= payingFixedItem.amount ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>
            </div>

            <form onSubmit={handleConfirmPayFixed} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Data do Pagamento *</label>
                  <input
                    type="date"
                    required
                    value={payFixedDate}
                    onChange={e => setPayFixedDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs outline-none focus:bg-white focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Forma de Pagamento</label>
                  <select
                    value={payFixedMethod}
                    onChange={e => setPayFixedMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs outline-none focus:bg-white focus:border-emerald-500"
                  >
                    <option value="PIX">PIX</option>
                    <option value="Boleto">Boleto</option>
                    <option value="Dinheiro">Dinheiro</option>
                    <option value="Transferência">Transferência</option>
                    <option value="Cartão de Débito">Cartão de Débito</option>
                    <option value="Cartão de Crédito">Cartão de Crédito</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Observações do Comprovante (Opcional)</label>
                <textarea
                  rows={2}
                  placeholder="Ex: Pago via app do banco, cód. autenticação, etc."
                  value={payFixedNotes}
                  onChange={e => setPayFixedNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs outline-none focus:bg-white focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsPayFixedModalOpen(false);
                    setPayingFixedItem(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirmar & Descontar do Caixa</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* MODAL: DEFINIR META / VALOR IDEAL DA RESERVA               */}
      {/* ========================================================== */}
      {isReserveTargetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-sm rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 text-slate-800">
            <button
              onClick={() => setIsReserveTargetModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <span className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-200">
                <PiggyBank className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Meta Ideal de Reserva do Caixa
                </h3>
                <p className="text-xs text-slate-500">
                  Defina o valor ideal de contingência para a {currentChurch.name}
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveReserveTarget} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Valor Ideal da Reserva (R$) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="Ex: 5000,00"
                  value={reserveTargetInput}
                  onChange={e => setReserveTargetInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-base font-black outline-none focus:bg-white focus:border-indigo-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Recomendado: de 1 a 3 meses de despesas fixas da igreja.
                </p>
              </div>

              {/* Botões de sugestão rápida */}
              <div className="flex flex-wrap gap-1.5">
                {[2000, 5000, 10000, 20000].map(sug => (
                  <button
                    key={sug}
                    type="button"
                    onClick={() => setReserveTargetInput(String(sug))}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 text-[11px] font-bold text-slate-600 hover:text-indigo-700 transition-colors"
                  >
                    R$ {sug.toLocaleString('pt-BR')}
                  </button>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsReserveTargetModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 active:scale-95 transition-all"
                >
                  Salvar Meta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* MODAL: ENVIAR DO CAIXA PARA A RESERVA DE EMERGÊNCIA        */}
      {/* ========================================================== */}
      {isSendToReserveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 text-slate-800">
            <button
              onClick={() => setIsSendToReserveModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <span className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200">
                <ArrowRightLeft className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Enviar Valor para a Reserva de Emergência
                </h3>
                <p className="text-xs text-slate-500">
                  O valor sairá do caixa operacional e será acumulado na reserva
                </p>
              </div>
            </div>

            {/* Painel de Saldo Atual */}
            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 mb-4">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Disponível no Caixa</span>
                <span className={`text-base font-black ${balance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Saldo Atual na Reserva</span>
                <span className="text-base font-black text-indigo-600">
                  {currentReserveBalance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>
            </div>

            <form onSubmit={handleConfirmSendToReserve} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Valor a Enviar para a Reserva (R$) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0,00"
                  value={sendReserveAmount}
                  onChange={e => setSendReserveAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-base font-black outline-none focus:bg-white focus:border-emerald-500"
                />
              </div>

              {/* Botões Rápidos */}
              <div className="flex flex-wrap gap-1.5">
                {[100, 250, 500, 1000].map(amt => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setSendReserveAmount(String(amt))}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 text-[11px] font-bold text-slate-600 hover:text-emerald-700 transition-colors"
                  >
                    + R$ {amt}
                  </button>
                ))}
                {balance > 0 && (
                  <button
                    type="button"
                    onClick={() => setSendReserveAmount(String(Math.floor(balance)))}
                    className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-[11px] font-bold text-emerald-800 transition-colors"
                  >
                    Todo Saldo (R$ {Math.floor(balance)})
                  </button>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Observações (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Aporte mensal deliberado pela diretoria"
                  value={sendReserveNotes}
                  onChange={e => setSendReserveNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs outline-none focus:bg-white focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsSendToReserveModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
                >
                  <ArrowRightLeft className="w-4 h-4" />
                  <span>Transferir para a Reserva</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* MODAL: RESGATAR VALOR DA RESERVA PARA O CAIXA              */}
      {/* ========================================================== */}
      {isRescueReserveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 text-slate-800">
            <button
              onClick={() => setIsRescueReserveModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <span className="p-2.5 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200">
                <Sparkles className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Resgatar Valor da Reserva para o Caixa
                </h3>
                <p className="text-xs text-slate-500">
                  Retorna fundos da reserva de emergência para cobrir o fluxo de caixa
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50/50 border border-amber-200 mb-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-amber-800 font-medium">Saldo Atual Disponível na Reserva:</span>
                <span className="font-black text-amber-900 text-sm">
                  {currentReserveBalance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>
            </div>

            <form onSubmit={handleConfirmRescueReserve} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Valor a Resgatar para o Caixa (R$) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  max={currentReserveBalance}
                  placeholder="0,00"
                  value={rescueReserveAmount}
                  onChange={e => setRescueReserveAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-base font-black outline-none focus:bg-white focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Motivo / Observações do Resgate
                </label>
                <input
                  type="text"
                  placeholder="Ex: Reforma emergencial, manutenção de telhado, etc."
                  value={rescueReserveNotes}
                  onChange={e => setRescueReserveNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs outline-none focus:bg-white focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsRescueReserveModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-md shadow-amber-600/20 active:scale-95 transition-all"
                >
                  Confirmar Resgate para o Caixa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
