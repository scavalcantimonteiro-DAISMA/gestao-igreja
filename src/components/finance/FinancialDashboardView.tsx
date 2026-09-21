import React, { useState } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Plus, 
  Minus, 
  Filter, 
  Lock, 
  KeyRound, 
  Calendar, 
  CreditCard, 
  Trash2, 
  X, 
  Save, 
  CheckCircle2, 
  ShieldAlert 
} from 'lucide-react';
import { FinancialEntry, FinancialExpense, FinancialEntryCategory, FinancialExpenseCategory, PaymentMethod } from '../../types';
import { useChurch } from '../../context/ChurchContext';
import { useNotification } from '../../context/NotificationContext';
import { FinancialPinModal } from '../common/FinancialPinModal';
import { ConfirmModal } from '../common/ConfirmModal';
import { 
  getFinancialEntries, 
  saveFinancialEntry, 
  deleteFinancialEntry, 
  getFinancialExpenses, 
  saveFinancialExpense, 
  deleteFinancialExpense, 
  logAction 
} from '../../services/storage';

export const FinancialDashboardView: React.FC = () => {
  const { currentChurch, isFinancialUnlocked, lockFinancial } = useChurch();
  const { showToast } = useNotification();

  const [isPinModalOpen, setIsPinModalOpen] = useState(!isFinancialUnlocked);
  const [entries, setEntries] = useState<FinancialEntry[]>(() => getFinancialEntries(currentChurch.id));
  const [expenses, setExpenses] = useState<FinancialExpense[]>(() => getFinancialExpenses(currentChurch.id));

  const [activeTab, setActiveTab] = useState<'geral' | 'entradas' | 'saidas'>('geral');
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; type: 'entry' | 'expense'; name: string } | null>(null);

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

  const refreshAll = () => {
    setEntries(getFinancialEntries(currentChurch.id));
    setExpenses(getFinancialExpenses(currentChurch.id));
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
          Os registros de dízimos, ofertas e despesas da {currentChurch.name} estão bloqueados por senha de segurança.
        </p>

        <button
          onClick={() => setIsPinModalOpen(true)}
          className="mt-6 flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-sm shadow-xl shadow-amber-500/20 active:scale-95 transition-all"
        >
          <KeyRound className="w-4 h-4" />
          <span>Digitar PIN de Segurança (Padrão: 0000)</span>
        </button>

        <FinancialPinModal
          isOpen={isPinModalOpen}
          onClose={() => setIsPinModalOpen(false)}
          onSuccess={refreshAll}
        />
      </div>
    );
  }

  const handleSaveEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!entryForm.description?.trim() || !entryForm.amount || entryForm.amount <= 0) {
      showToast('Preencha a descrição e um valor positivo.', 'error');
      return;
    }

    const saved: FinancialEntry = {
      id: 'fin_e_' + Date.now(),
      churchId: currentChurch.id,
      date: entryForm.date || new Date().toISOString().split('T')[0],
      description: entryForm.description,
      category: entryForm.category as FinancialEntryCategory || 'dízimos',
      amount: Number(entryForm.amount),
      paymentMethod: entryForm.paymentMethod as PaymentMethod || 'PIX',
      notes: entryForm.notes || '',
      createdAt: new Date().toISOString()
    };

    saveFinancialEntry(saved);
    logAction(currentChurch.id, 'Tesouraria', 'TESOURARIA', 'Entrada Financeira', `${saved.description} - R$ ${saved.amount.toFixed(2)}`);
    showToast('Entrada financeira registrada com sucesso!', 'success');
    setIsEntryModalOpen(false);
    refreshAll();
  };

  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseForm.description?.trim() || !expenseForm.amount || expenseForm.amount <= 0) {
      showToast('Preencha a descrição e um valor positivo.', 'error');
      return;
    }

    const saved: FinancialExpense = {
      id: 'fin_x_' + Date.now(),
      churchId: currentChurch.id,
      date: expenseForm.date || new Date().toISOString().split('T')[0],
      description: expenseForm.description,
      category: expenseForm.category as FinancialExpenseCategory || 'aluguel',
      amount: Number(expenseForm.amount),
      paymentMethod: expenseForm.paymentMethod as PaymentMethod || 'PIX',
      responsible: expenseForm.responsible || 'Tesouraria',
      notes: expenseForm.notes || '',
      createdAt: new Date().toISOString()
    };

    saveFinancialExpense(saved);
    logAction(currentChurch.id, 'Tesouraria', 'TESOURARIA', 'Saída Financeira', `${saved.description} - R$ ${saved.amount.toFixed(2)}`);
    showToast('Despesa registrada com sucesso!', 'success');
    setIsExpenseModalOpen(false);
    refreshAll();
  };

  const handleDeleteConfirm = () => {
    if (itemToDelete) {
      if (itemToDelete.type === 'entry') {
        deleteFinancialEntry(itemToDelete.id);
      } else {
        deleteFinancialExpense(itemToDelete.id);
      }
      showToast('Lançamento excluído com sucesso.', 'success');
      setItemToDelete(null);
      refreshAll();
    }
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
              Protegido por PIN
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {currentChurch.name} • Prestação de contas transparente e organizada
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setEntryForm({
                date: new Date().toISOString().split('T')[0],
                category: 'dízimos',
                paymentMethod: 'PIX',
                amount: undefined,
                description: ''
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
              setExpenseForm({
                date: new Date().toISOString().split('T')[0],
                category: 'aluguel',
                paymentMethod: 'PIX',
                amount: undefined,
                description: '',
                responsible: 'Tesouraria'
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

      {/* Cards de Resumo Financeiro (Item 37) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Entradas */}
        <div className="p-6 rounded-3xl bg-white border border-emerald-200 shadow-sm">
          <div className="flex items-center justify-between text-emerald-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Entradas Totais</span>
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            {totalEntries.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </div>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">Dízimos, ofertas e campanhas</p>
        </div>

        {/* Saídas */}
        <div className="p-6 rounded-3xl bg-white border border-rose-200 shadow-sm">
          <div className="flex items-center justify-between text-rose-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Despesas / Saídas</span>
            <TrendingDown className="w-5 h-5" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            {totalExpenses.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </div>
          <p className="text-[11px] text-rose-600 font-medium mt-1">Aluguel, energia, salários e missões</p>
        </div>

        {/* Saldo Líquido */}
        <div className="p-6 rounded-3xl bg-white border border-sky-200 shadow-sm">
          <div className="flex items-center justify-between text-sky-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Saldo Líquido em Caixa</span>
            <Wallet className="w-5 h-5" />
          </div>
          <div className={`text-2xl sm:text-3xl font-black ${balance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </div>
          <p className="text-[11px] text-sky-600 font-medium mt-1">Disponibilidade financeira da congregação</p>
        </div>
      </div>

      {/* Alternador de Listas */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-100 border border-slate-200 w-fit">
        <button
          onClick={() => setActiveTab('geral')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'geral' ? 'bg-white text-sky-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Visão Geral ({entries.length + expenses.length})
        </button>
        <button
          onClick={() => setActiveTab('entradas')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'entradas' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Entradas ({entries.length})
        </button>
        <button
          onClick={() => setActiveTab('saidas')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'saidas' ? 'bg-white text-rose-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Saídas ({expenses.length})
        </button>
      </div>

      {/* Tabelas de Registros */}
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
                <th className="px-6 py-4 text-center">Ações</th>
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
                    <button
                      onClick={() => setItemToDelete({ id: e.id, type: 'entry', name: e.description })}
                      className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
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
                    <button
                      onClick={() => setItemToDelete({ id: x.id, type: 'expense', name: x.description })}
                      className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Nova Entrada */}
      {isEntryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 text-slate-800">
            <button
              onClick={() => setIsEntryModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900 mb-4">Registrar Entrada Financeira</h3>

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
                  onClick={() => setIsEntryModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm"
                >
                  Salvar Entrada
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Nova Saída */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 text-slate-800">
            <button
              onClick={() => setIsExpenseModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900 mb-4">Registrar Despesa / Saída</h3>

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
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-sm"
                >
                  Salvar Saída
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmação de Exclusão */}
      <ConfirmModal
        isOpen={!!itemToDelete}
        title="Excluir Lançamento Financeiro"
        message={`Deseja realmente remover o lançamento "${itemToDelete?.name}"?`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setItemToDelete(null)}
      />
    </div>
  );
};
