import React, { useState } from 'react';
import { BarChart3, Download, Printer, Users, Cake, HeartHandshake, DollarSign, Flame, FileText } from 'lucide-react';
import { useChurch } from '../../context/ChurchContext';
import { useNotification } from '../../context/NotificationContext';
import { 
  getMembers, 
  getChildren, 
  getSmallGroups, 
  getFinancialEntries, 
  getFinancialExpenses,
  getBirthdays,
  getWeddingAnniversaries 
} from '../../services/storage';

export const ReportsView: React.FC = () => {
  const { currentChurch } = useChurch();
  const { showToast } = useNotification();

  const [selectedReport, setSelectedReport] = useState<'membros' | 'aniversariantes' | 'casamentos' | 'pgs' | 'financeiro'>('membros');

  const members = getMembers(currentChurch.id);
  const children = getChildren(currentChurch.id);
  const pgs = getSmallGroups(currentChurch.id);
  const entries = getFinancialEntries(currentChurch.id);
  const expenses = getFinancialExpenses(currentChurch.id);
  const { today: bToday, upcoming: bUpcoming } = getBirthdays(currentChurch.id);
  const { today: wToday, upcoming: wUpcoming } = getWeddingAnniversaries(currentChurch.id);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    
    if (selectedReport === 'membros') {
      csvContent += 'Nome;WhatsApp;Status;Cargo;Ministerio;DataNasc\n';
      members.forEach(m => {
        csvContent += `"${m.name}";"${m.whatsapp}";"${m.status}";"${m.churchRole || ''}";"${m.ministry || ''}";"${m.birthDate}"\n`;
      });
    } else if (selectedReport === 'financeiro') {
      csvContent += 'Data;Tipo;Descricao;Categoria;Valor;Pagamento\n';
      entries.forEach(e => {
        csvContent += `"${e.date}";"Entrada";"${e.description}";"${e.category}";"${e.amount}";"${e.paymentMethod}"\n`;
      });
      expenses.forEach(x => {
        csvContent += `"${x.date}";"Saida";"${x.description}";"${x.category}";"${x.amount}";"${x.paymentMethod}"\n`;
      });
    } else {
      csvContent += 'Nome;Telefone;Info\n';
      bToday.concat(bUpcoming).forEach(b => {
        csvContent += `"${b.name}";"${b.whatsapp}";"${b.age} anos"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `relatorio_${selectedReport}_${currentChurch.slug}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Relatório exportado em CSV com sucesso!', 'success');
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-sky-600" />
            <span>Relatórios Eclesiásticos & Auditoria</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {currentChurch.name} • Emissão de relatórios e exportação para PDF/Excel
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200 shadow-sm text-xs font-bold transition-all"
          >
            <Download className="w-4 h-4 text-sky-600" />
            <span>Exportar CSV / Excel</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-lg shadow-sky-600/20 active:scale-95 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Relatório</span>
          </button>
        </div>
      </div>

      {/* Botões Seletor de Tipo de Relatório */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setSelectedReport('membros')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            selectedReport === 'membros' ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20' : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 shadow-sm'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Membros ({members.length})</span>
        </button>

        <button
          onClick={() => setSelectedReport('aniversariantes')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            selectedReport === 'aniversariantes' ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20' : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 shadow-sm'
          }`}
        >
          <Cake className="w-4 h-4" />
          <span>Aniversariantes</span>
        </button>

        <button
          onClick={() => setSelectedReport('casamentos')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            selectedReport === 'casamentos' ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20' : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 shadow-sm'
          }`}
        >
          <HeartHandshake className="w-4 h-4" />
          <span>Casamentos</span>
        </button>

        <button
          onClick={() => setSelectedReport('pgs')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            selectedReport === 'pgs' ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20' : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 shadow-sm'
          }`}
        >
          <Flame className="w-4 h-4" />
          <span>Pequenos Grupos</span>
        </button>

        <button
          onClick={() => setSelectedReport('financeiro')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            selectedReport === 'financeiro' ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20' : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 shadow-sm'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Financeiro Consolidado</span>
        </button>
      </div>

      {/* Tabela do Relatório Selecionado */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="pb-4 mb-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-900 capitalize">
              Relatório Eclesiástico: {selectedReport}
            </h3>
            <p className="text-xs text-slate-500">
              {currentChurch.name} • Data de Emissão: {new Date().toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>

        {selectedReport === 'membros' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">Nome</th>
                  <th className="p-3">WhatsApp</th>
                  <th className="p-3">Função</th>
                  <th className="p-3">Ministério</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {members.map(m => (
                  <tr key={m.id} className="hover:bg-sky-50/40 transition-colors">
                    <td className="p-3 font-semibold text-slate-900">{m.name}</td>
                    <td className="p-3 text-slate-600">{m.whatsapp}</td>
                    <td className="p-3 text-slate-600">{m.churchRole || 'Membro'}</td>
                    <td className="p-3 text-slate-600">{m.ministry || 'Geral'}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        m.status === 'Ativo' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {m.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {selectedReport === 'aniversariantes' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">Data</th>
                  <th className="p-3">Nome</th>
                  <th className="p-3">Idade</th>
                  <th className="p-3">WhatsApp</th>
                  <th className="p-3">Tipo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {bToday.concat(bUpcoming).map(b => (
                  <tr key={b.id} className="hover:bg-sky-50/40 transition-colors">
                    <td className="p-3 font-bold text-amber-600">{b.formattedDate}</td>
                    <td className="p-3 font-semibold text-slate-900">{b.name}</td>
                    <td className="p-3 text-slate-600">{b.age} anos</td>
                    <td className="p-3 text-slate-600">{b.whatsapp}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800">
                        {b.isChild ? 'Acolher Kids' : 'Adulto'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {selectedReport === 'casamentos' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">Data do Casamento</th>
                  <th className="p-3">Casal</th>
                  <th className="p-3">Anos de União</th>
                  <th className="p-3">WhatsApp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {wToday.concat(wUpcoming).map(w => (
                  <tr key={w.id} className="hover:bg-sky-50/40 transition-colors">
                    <td className="p-3 font-bold text-pink-600">{w.formattedDate}</td>
                    <td className="p-3 font-semibold text-slate-900">{w.coupleName}</td>
                    <td className="p-3 text-slate-600">{w.yearsMarried} anos</td>
                    <td className="p-3 text-slate-600">{w.whatsapp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {selectedReport === 'pgs' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">Nome do PG</th>
                  <th className="p-3">Líder</th>
                  <th className="p-3">Encontro</th>
                  <th className="p-3">Endereço</th>
                  <th className="p-3">Participantes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {pgs.map(p => (
                  <tr key={p.id} className="hover:bg-sky-50/40 transition-colors">
                    <td className="p-3 font-semibold text-slate-900">{p.name}</td>
                    <td className="p-3 text-slate-600">{p.leaderName}</td>
                    <td className="p-3 text-slate-600">{p.dayOfWeek} às {p.time}</td>
                    <td className="p-3 text-slate-600">{p.address}</td>
                    <td className="p-3 font-bold text-sky-600">{p.participantsCount} pessoas</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {selectedReport === 'financeiro' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
              <div>
                <span className="text-xs text-slate-500 font-medium">Total Entradas</span>
                <p className="text-lg font-bold text-emerald-600">
                  {entries.reduce((a, c) => a + c.amount, 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </div>
              <div>
                <span className="text-xs text-slate-500 font-medium">Total Saídas</span>
                <p className="text-lg font-bold text-rose-600">
                  {expenses.reduce((a, c) => a + c.amount, 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </div>
              <div>
                <span className="text-xs text-slate-500 font-medium">Saldo Atual</span>
                <p className="text-lg font-bold text-sky-600">
                  {(entries.reduce((a, c) => a + c.amount, 0) - expenses.reduce((a, c) => a + c.amount, 0)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
