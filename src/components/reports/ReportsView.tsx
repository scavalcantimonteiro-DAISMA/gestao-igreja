import React, { useState } from 'react';
import { BarChart3, FileSpreadsheet, Printer, Users, Cake, HeartHandshake, Flame, Baby } from 'lucide-react';
import { useChurch } from '../../context/ChurchContext';
import { useNotification } from '../../context/NotificationContext';
import { 
  getMembers, 
  getChildren, 
  getSmallGroups, 
  getBirthdays,
  getWeddingAnniversaries 
} from '../../services/storage';
import { BirthdayWhatsAppAction } from '../common/BirthdayWhatsAppAction';
import { 
  exportMembersToExcel, 
  exportChildrenToExcel, 
  exportSmallGroupsToExcel, 
  exportEcclesiasticalReportToExcel 
} from '../../services/excelBackup';

export const ReportsView: React.FC = () => {
  const { currentChurch } = useChurch();
  const { showToast } = useNotification();

  const [selectedReport, setSelectedReport] = useState<'membros' | 'aniversariantes' | 'casamentos' | 'pgs' | 'infantil'>('membros');
  const [bdayFilter, setBdayFilter] = useState<'geral' | 'mes' | 'hoje_7dias'>('geral');
  const currentMonthNumber = (new Date().getMonth() + 1).toString().padStart(2, '0');
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthNumber);

  const members = getMembers(currentChurch.id);
  const children = getChildren(currentChurch.id);
  const pgs = getSmallGroups(currentChurch.id);
  const { today: bToday, upcoming: bUpcoming, all: bAll = [] } = getBirthdays(currentChurch.id);
  const { today: wToday, upcoming: wUpcoming } = getWeddingAnniversaries(currentChurch.id);

  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = () => {
    try {
      if (selectedReport === 'membros') {
        exportMembersToExcel(currentChurch, members);
      } else if (selectedReport === 'infantil') {
        exportChildrenToExcel(currentChurch, children);
      } else if (selectedReport === 'pgs') {
        exportSmallGroupsToExcel(currentChurch, pgs);
      } else if (selectedReport === 'aniversariantes') {
        const list = bdayFilter === 'hoje_7dias' 
          ? bToday.concat(bUpcoming) 
          : bdayFilter === 'mes' 
            ? bAll.filter(b => b.formattedDate.endsWith(`/${selectedMonth}`)) 
            : bAll;
        const rows = list.map(b => ({
          'Data': b.formattedDate,
          'Nome': b.name,
          'Idade': `${b.age} anos`,
          'WhatsApp': b.whatsapp || 'Não informado',
          'Tipo': b.isChild ? 'Departamento Infantil' : 'Adulto'
        }));
        exportEcclesiasticalReportToExcel(currentChurch, 'Aniversariantes', rows);
      } else if (selectedReport === 'casamentos') {
        const rows = wToday.concat(wUpcoming).map(w => ({
          'Data do Casamento': w.formattedDate,
          'Casal': w.coupleName,
          'Anos de União': `${w.yearsMarried} anos`,
          'WhatsApp': w.whatsapp || 'Não informado'
        }));
        exportEcclesiasticalReportToExcel(currentChurch, 'Bodas_Casamentos', rows);
      }
      showToast('Relatório exportado em Excel (.xlsx) com sucesso!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Erro ao exportar relatório em Excel.', 'error');
    }
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
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20 active:scale-95 text-xs font-bold transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Baixar em Excel</span>
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
          onClick={() => setSelectedReport('infantil')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            selectedReport === 'infantil' ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20' : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 shadow-sm'
          }`}
        >
          <Baby className="w-4 h-4" />
          <span>Crianças ({children.length})</span>
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
          <span>Pequenos Grupos ({pgs.length})</span>
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

        {selectedReport === 'aniversariantes' && (() => {
          const list = (() => {
            if (bdayFilter === 'hoje_7dias') return bToday.concat(bUpcoming);
            if (bdayFilter === 'mes') return bAll.filter(b => b.formattedDate.endsWith(`/${selectedMonth}`));
            return bAll;
          })();

          const months = [
            { num: '01', name: 'Janeiro' },
            { num: '02', name: 'Fevereiro' },
            { num: '03', name: 'Março' },
            { num: '04', name: 'Abril' },
            { num: '05', name: 'Maio' },
            { num: '06', name: 'Junho' },
            { num: '07', name: 'Julho' },
            { num: '08', name: 'Agosto' },
            { num: '09', name: 'Setembro' },
            { num: '10', name: 'Outubro' },
            { num: '11', name: 'Novembro' },
            { num: '12', name: 'Dezembro' }
          ];

          return (
            <div className="space-y-4">
              {/* Barra de Filtros e Informação Pastoral */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-50 via-teal-50 to-emerald-50 border border-sky-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Cake className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">Aniversariantes • {currentChurch.name}</h4>
                    <p className="text-xs text-slate-600">
                      Disparo pastoral oficial: <strong>{currentChurch.pastorName || 'Pastor Titular'} ({currentChurch.pastorWhatsapp || currentChurch.pastorPhone || 'Configure nas configurações'})</strong>
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setBdayFilter('geral')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      bdayFilter === 'geral'
                        ? 'bg-sky-600 text-white shadow-sm'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    Todos no Geral ({bAll.length})
                  </button>

                  <button
                    onClick={() => setBdayFilter('mes')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      bdayFilter === 'mes'
                        ? 'bg-sky-600 text-white shadow-sm'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    Filtrar por Mês
                  </button>

                  <button
                    onClick={() => setBdayFilter('hoje_7dias')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      bdayFilter === 'hoje_7dias'
                        ? 'bg-sky-600 text-white shadow-sm'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    Hoje & 7 Dias ({bToday.length + bUpcoming.length})
                  </button>

                  {bdayFilter === 'mes' && (
                    <select
                      value={selectedMonth}
                      onChange={e => setSelectedMonth(e.target.value)}
                      className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-800 outline-none focus:border-sky-500"
                    >
                      {months.map(m => (
                        <option key={m.num} value={m.num}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {/* Tabela de Aniversariantes com WhatsApp ao lado do nome */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Data</th>
                      <th className="p-3">Nome (com WhatsApp ao lado)</th>
                      <th className="p-3">Idade</th>
                      <th className="p-3">WhatsApp / Disparo Pastoral</th>
                      <th className="p-3">Tipo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {list.length > 0 ? (
                      list.map(b => (
                        <tr key={b.id} className="hover:bg-sky-50/40 transition-colors">
                          <td className="p-3 font-bold text-amber-600 whitespace-nowrap">{b.formattedDate}</td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-slate-900">{b.name}</span>
                              <BirthdayWhatsAppAction
                                personName={b.name}
                                age={b.age}
                                phone={b.whatsapp}
                                isChild={b.isChild}
                                formattedDate={b.formattedDate}
                                size="xs"
                                variant="inline-icon"
                              />
                            </div>
                          </td>
                          <td className="p-3 text-slate-600 whitespace-nowrap">{b.age} anos</td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <span className="text-slate-600">{b.whatsapp || 'Não informado'}</span>
                              <BirthdayWhatsAppAction
                                personName={b.name}
                                age={b.age}
                                phone={b.whatsapp}
                                isChild={b.isChild}
                                formattedDate={b.formattedDate}
                                size="xs"
                                variant="button"
                                label="Felicitações"
                              />
                            </div>
                          </td>
                          <td className="p-3 whitespace-nowrap">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              b.isChild ? 'bg-sky-100 text-sky-800' : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {b.isChild ? 'Departamento Infantil' : 'Adulto'}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="p-6 text-center text-slate-400">
                          Nenhum aniversariante encontrado para o filtro selecionado.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })()}

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

        {selectedReport === 'infantil' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">Nome da Criança</th>
                  <th className="p-3">Data Nasc.</th>
                  <th className="p-3">Idade</th>
                  <th className="p-3">Responsáveis</th>
                  <th className="p-3">WhatsApp Responsável</th>
                  <th className="p-3">Sala / Turma</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {children.map(c => {
                  const birthYear = c.birthDate ? parseInt(c.birthDate.split('-')[0]) : null;
                  const currentYear = new Date().getFullYear();
                  const age = birthYear && !isNaN(birthYear) ? `${currentYear - birthYear} anos` : '-';
                  return (
                    <tr key={c.id} className="hover:bg-sky-50/40 transition-colors">
                      <td className="p-3 font-semibold text-slate-900">{c.name}</td>
                      <td className="p-3 text-slate-600">{c.birthDate}</td>
                      <td className="p-3 text-slate-600 font-bold">{age}</td>
                      <td className="p-3 text-slate-600">{c.guardianName || '-'}</td>
                      <td className="p-3 text-slate-600">{c.guardianWhatsapp || c.guardianPhone || '-'}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800">
                          {c.ebdClass || c.childrenMinistry || 'Infantil'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
