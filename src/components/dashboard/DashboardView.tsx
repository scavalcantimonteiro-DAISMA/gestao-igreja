import React, { useState } from 'react';
import { 
  Users, 
  Flame, 
  UserPlus, 
  Droplet, 
  Calendar, 
  BookOpen, 
  Cake, 
  HeartHandshake, 
  ChevronRight, 
  Sparkles, 
  Clock, 
  MapPin, 
  FileText,
  DollarSign
} from 'lucide-react';
import { useChurch } from '../../context/ChurchContext';
import { useAuth } from '../../context/AuthContext';
import { ChurchBrandLogo } from '../common/ChurchBrandLogo';
import { WhatsAppButton } from '../common/WhatsAppButton';
import { BirthdayWhatsAppAction } from '../common/BirthdayWhatsAppAction';
import { DailyReportModal } from '../common/DailyReportModal';
import { 
  getMembers, 
  getChildren, 
  getSmallGroups, 
  getVisitors, 
  getPastoralAppointments, 
  getSchedules, 
  getEvents, 
  getBirthdays, 
  getWeddingAnniversaries,
  getMessageTemplates,
  formatWhatsAppMessage,
  getFinancialEntries,
  getFinancialExpenses
} from '../../services/storage';

interface DashboardViewProps {
  onNavigate: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const { currentChurch } = useChurch();
  const [showDailyReport, setShowDailyReport] = useState(false);

  // Dados calculados em tempo real
  const members = getMembers(currentChurch.id);
  const children = getChildren(currentChurch.id);
  const totalMembros = members.length + children.length;
  const pgs = getSmallGroups(currentChurch.id);
  const visitors = getVisitors(currentChurch.id);
  const schedules = getSchedules(currentChurch.id);
  const events = getEvents(currentChurch.id);
  const appointments = getPastoralAppointments(currentChurch.id).filter(a => a.date === '2026-09-21' || a.date === new Date().toISOString().split('T')[0]);

  // Aniversários & Casamentos
  const { today: bdaysToday, upcoming: bdaysUpcoming } = getBirthdays(currentChurch.id);
  const { today: weddingsToday, upcoming: weddingsUpcoming } = getWeddingAnniversaries(currentChurch.id);

  // Modelos de mensagens
  const templates = getMessageTemplates(currentChurch.id);
  const bdayTemplate = templates.find(t => t.type === 'aniversario')?.text || 
    `Olá, {nome}! A ${currentChurch.name} se alegra imensamente com sua vida. Feliz aniversário de {idade} anos! 🎂✨`;
  const weddingTemplate = templates.find(t => t.type === 'aniversario_casamento')?.text || 
    'Olá, {nome}! Parabéns pelo aniversário de casamento ({anos_casamento} anos!). Que Deus abençoe essa união. 💍';

  // Finanças
  const entries = getFinancialEntries(currentChurch.id);
  const expenses = getFinancialExpenses(currentChurch.id);
  const totalEntradas = entries.reduce((acc, curr) => acc + curr.amount, 0);
  const totalSaidas = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const saldoAtual = totalEntradas - totalSaidas;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Header do Dashboard com Banner da Igreja em Azul Notável */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#102A43] via-[#1B3B5C] to-[#0284C7] text-white p-6 sm:p-8 shadow-xl shadow-sky-900/10 border border-sky-600/30">
        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <ChurchBrandLogo church={currentChurch} variant="full" />

          {/* Botões Rápidos */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => setShowDailyReport(true)}
              className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-white text-sky-900 hover:bg-sky-50 text-xs sm:text-sm font-bold shadow-lg shadow-black/10 active:scale-95 transition-all"
            >
              <FileText className="w-4 h-4 text-sky-600" />
              <span>Gerar Relatório Pastoral</span>
            </button>

            <button
              onClick={() => onNavigate('members')}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-sky-900/60 hover:bg-sky-900/90 text-white border border-white/20 text-xs sm:text-sm font-bold transition-all"
            >
              <Users className="w-4 h-4 text-sky-300" />
              <span>Ver Membros</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Grid de Contadores KPI Resumidos em Branco & Azul */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {/* Aniversários Hoje */}
        <div 
          onClick={() => onNavigate('members')}
          className="col-span-1 p-4 rounded-2xl bg-white border border-amber-200 hover:border-amber-400 transition-all cursor-pointer group shadow-sm hover:shadow-md"
        >
          <div className="flex items-center justify-between text-amber-600 mb-2">
            <Cake className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] uppercase font-bold tracking-wider bg-amber-100 px-1.5 py-0.2 rounded text-amber-800">Hoje</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">{bdaysToday.length}</div>
          <div className="text-[11px] font-semibold text-amber-700 truncate">Aniversários</div>
        </div>

        {/* Casamentos Hoje */}
        <div 
          onClick={() => onNavigate('families')}
          className="col-span-1 p-4 rounded-2xl bg-white border border-pink-200 hover:border-pink-400 transition-all cursor-pointer group shadow-sm hover:shadow-md"
        >
          <div className="flex items-center justify-between text-pink-600 mb-2">
            <HeartHandshake className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] uppercase font-bold tracking-wider bg-pink-100 px-1.5 py-0.2 rounded text-pink-800">Hoje</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">{weddingsToday.length}</div>
          <div className="text-[11px] font-semibold text-pink-700 truncate">Casamentos</div>
        </div>

        {/* Membros Totais */}
        <div 
          onClick={() => onNavigate('members')}
          className="col-span-1 p-4 rounded-2xl bg-white border border-slate-200 hover:border-sky-300 transition-all cursor-pointer group shadow-sm hover:shadow-md"
        >
          <div className="flex items-center justify-between text-sky-600 mb-2">
            <Users className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">{totalMembros}</div>
          <div className="text-[11px] font-medium text-slate-500 truncate">Membros & Filhos</div>
        </div>

        {/* PGs */}
        <div 
          onClick={() => onNavigate('smallgroups')}
          className="col-span-1 p-4 rounded-2xl bg-white border border-slate-200 hover:border-orange-300 transition-all cursor-pointer group shadow-sm hover:shadow-md"
        >
          <div className="flex items-center justify-between text-orange-600 mb-2">
            <Flame className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">{pgs.length}</div>
          <div className="text-[11px] font-medium text-slate-500 truncate">Pequenos Grupos</div>
        </div>

        {/* Visitantes */}
        <div 
          onClick={() => onNavigate('visitors')}
          className="col-span-1 p-4 rounded-2xl bg-white border border-slate-200 hover:border-emerald-300 transition-all cursor-pointer group shadow-sm hover:shadow-md"
        >
          <div className="flex items-center justify-between text-emerald-600 mb-2">
            <UserPlus className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">{visitors.length}</div>
          <div className="text-[11px] font-medium text-slate-500 truncate">Visitantes</div>
        </div>

        {/* Atendimentos Hoje */}
        <div 
          onClick={() => onNavigate('cabinet')}
          className="col-span-1 p-4 rounded-2xl bg-white border border-slate-200 hover:border-sky-300 transition-all cursor-pointer group shadow-sm hover:shadow-md"
        >
          <div className="flex items-center justify-between text-sky-600 mb-2">
            <BookOpen className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] uppercase font-bold text-sky-700 bg-sky-50 px-1 rounded">Hoje</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">{appointments.length}</div>
          <div className="text-[11px] font-medium text-slate-500 truncate">Gabinete</div>
        </div>

        {/* Batismos */}
        <div 
          onClick={() => onNavigate('baptisms')}
          className="col-span-1 p-4 rounded-2xl bg-white border border-slate-200 hover:border-cyan-300 transition-all cursor-pointer group shadow-sm hover:shadow-md"
        >
          <div className="flex items-center justify-between text-cyan-600 mb-2">
            <Droplet className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">4</div>
          <div className="text-[11px] font-medium text-slate-500 truncate">Batismos Prev.</div>
        </div>

        {/* Saldo Financeiro Rápido */}
        <div 
          onClick={() => onNavigate('finance')}
          className="col-span-1 p-4 rounded-2xl bg-white border border-emerald-200 hover:border-emerald-400 transition-all cursor-pointer group shadow-sm hover:shadow-md"
        >
          <div className="flex items-center justify-between text-emerald-600 mb-2">
            <DollarSign className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-base sm:text-lg font-black text-emerald-700 truncate">
            {saldoAtual.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
          </div>
          <div className="text-[11px] font-semibold text-emerald-800 truncate">Saldo em Caixa</div>
        </div>
      </div>

      {/* 3. Seções Principais: Aniversariantes de Hoje e Aniversários de Casamento */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* A. Destaque: Aniversariantes */}
        <div className="rounded-3xl bg-white border border-amber-200/90 p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <Cake className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">Aniversariantes de Hoje</h3>
                <p className="text-xs text-slate-500">Bênção especial e contato via WhatsApp</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
              {bdaysToday.length} Hoje
            </span>
          </div>

          {/* Lista de Aniversários de Hoje */}
          <div className="space-y-3 flex-1">
            {bdaysToday.length > 0 ? (
              bdaysToday.map(person => {
                const message = formatWhatsAppMessage(bdayTemplate, {
                  nome: person.name,
                  idade: person.age,
                  igreja: currentChurch.name
                });

                return (
                  <div 
                    key={person.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-amber-300 transition-all shadow-sm"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-200 border border-slate-300 shrink-0">
                        {person.photoUrl ? (
                          <img src={person.photoUrl} alt={person.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-amber-800 font-bold text-sm bg-amber-100">
                            {person.name[0]}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-slate-900">{person.name}</h4>
                          {person.isChild && (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-sky-100 text-sky-800 font-semibold">
                              Dep. Infantil
                            </span>
                          )}
                          <BirthdayWhatsAppAction
                            personName={person.name}
                            age={person.age}
                            phone={person.whatsapp || person.phone}
                            isChild={person.isChild}
                            size="xs"
                            variant="inline-icon"
                          />
                        </div>
                        <p className="text-xs font-semibold text-amber-700">
                          🎂 Completando {person.age} anos hoje!
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <BirthdayWhatsAppAction
                        personName={person.name}
                        age={person.age}
                        phone={person.whatsapp || person.phone}
                        isChild={person.isChild}
                        variant="button"
                        label={`Felicitações (${currentChurch.pastorName || 'Pastor'})`}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-6 text-slate-400 text-xs">
                Nenhum aniversariante no dia de hoje.
              </div>
            )}
          </div>

          {/* Próximos Aniversariantes */}
          {bdaysUpcoming.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <h5 className="text-xs font-semibold text-slate-500 mb-2">
                Próximos aniversariantes (7 dias):
              </h5>
              <div className="flex flex-wrap gap-2">
                {bdaysUpcoming.map(u => (
                  <span
                    key={u.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-700 font-medium hover:border-amber-300 transition-colors"
                  >
                    <span className="font-bold text-amber-700">{u.formattedDate}</span>
                    <span className="font-semibold text-slate-900">{u.name}</span>
                    <span className="text-[10px] text-slate-500">({u.age} anos)</span>
                    <BirthdayWhatsAppAction
                      personName={u.name}
                      age={u.age}
                      phone={u.whatsapp || u.phone}
                      isChild={u.isChild}
                      formattedDate={u.formattedDate}
                      size="xs"
                      variant="inline-icon"
                    />
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* B. Destaque: Aniversário de Casamento */}
        <div className="rounded-3xl bg-white border border-pink-200/90 p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-pink-100 text-pink-700 flex items-center justify-center">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">Aniversário de Casamento</h3>
                <p className="text-xs text-slate-500">Bodas matrimoniais com mensagem de bênção</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-pink-100 text-pink-800 border border-pink-300">
              {weddingsToday.length} Hoje
            </span>
          </div>

          {/* Lista de Bodas de Hoje */}
          <div className="space-y-3 flex-1">
            {weddingsToday.length > 0 ? (
              weddingsToday.map(w => {
                const message = formatWhatsAppMessage(weddingTemplate, {
                  nome: w.coupleName,
                  esposo: w.husbandName,
                  esposa: w.wifeName,
                  anos_casamento: w.yearsMarried,
                  igreja: currentChurch.name
                });

                return (
                  <div 
                    key={w.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-pink-300 transition-all shadow-sm"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">💍</span>
                        <h4 className="font-bold text-sm text-slate-900">{w.coupleName}</h4>
                      </div>
                      <p className="text-xs font-semibold text-pink-700 mt-0.5">
                        {w.yearsMarried} anos de casamento abençoado!
                      </p>
                    </div>

                    <BirthdayWhatsAppAction
                      personName={w.coupleName}
                      phone={w.whatsapp}
                      type="wedding"
                      weddingInfo={{
                        husbandName: w.husbandName,
                        wifeName: w.wifeName,
                        yearsMarried: w.yearsMarried
                      }}
                      label="Enviar Bênção"
                      variant="button"
                      size="sm"
                    />
                  </div>
                );
              })
            ) : (
              <div className="text-center py-6 text-slate-400 text-xs">
                Nenhum aniversário de casamento no dia de hoje.
              </div>
            )}
          </div>

          {/* Próximas Bodas */}
          {weddingsUpcoming.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <h5 className="text-xs font-semibold text-slate-500 mb-2">
                Próximas bodas de casamento (15 dias):
              </h5>
              <div className="flex flex-wrap gap-2">
                {weddingsUpcoming.map(u => (
                  <span
                    key={u.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-700 font-medium"
                  >
                    <span className="font-bold text-pink-700">{u.formattedDate}</span>
                    <span>{u.coupleName}</span>
                    <span className="text-[10px] text-slate-500">({u.yearsMarried} anos)</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. Segunda Linha: Gabinete Pastoral & Cultos/Eventos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Atendimentos do Gabinete */}
        <div className="lg:col-span-1 rounded-3xl bg-white border border-slate-200/90 p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <BookOpen className="w-5 h-5 text-sky-600" />
              <h3 className="font-bold text-sm text-slate-900">Próximos Atendimentos</h3>
            </div>
            <button 
              onClick={() => onNavigate('cabinet')}
              className="text-xs text-sky-700 hover:text-sky-800 font-semibold flex items-center gap-1"
            >
              Agenda <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5 flex-1">
            {appointments.length > 0 ? (
              appointments.map(a => (
                <div 
                  key={a.id}
                  onClick={() => onNavigate('cabinet')}
                  className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-sky-300 cursor-pointer transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="px-2.5 py-1 rounded-lg bg-sky-100 text-sky-800 font-mono font-bold text-xs border border-sky-200">
                      {a.time}
                    </div>
                    <div>
                      <h5 className="font-semibold text-xs text-slate-900">{a.personName}</h5>
                      <span className="text-[10px] text-slate-500 capitalize">{a.type} • {a.durationMinutes} min</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center">
                Nenhum atendimento pastoral agendado para hoje.
              </p>
            )}
          </div>
        </div>

        {/* Programação Regular */}
        <div className="lg:col-span-1 rounded-3xl bg-white border border-slate-200/90 p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <Calendar className="w-5 h-5 text-sky-600" />
              <h3 className="font-bold text-sm text-slate-900">Cultos & Programação</h3>
            </div>
            <button 
              onClick={() => onNavigate('schedules')}
              className="text-xs text-sky-700 hover:text-sky-800 font-semibold flex items-center gap-1"
            >
              Ver tudo <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5 flex-1">
            {schedules.length > 0 ? (
              schedules.slice(0, 3).map(s => (
                <div 
                  key={s.id}
                  className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between"
                >
                  <div>
                    <span className="text-xs font-bold text-slate-900">{s.title}</span>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                      <span className="text-sky-700 font-semibold">{s.dayOfWeek} às {s.time}</span>
                      <span>•</span>
                      <span>{s.location}</span>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-medium">
                    {s.recurrence}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center">
                Nenhum culto ou programação cadastrada.
              </p>
            )}
          </div>
        </div>

        {/* Destaque de Eventos */}
        <div className="lg:col-span-1 rounded-3xl bg-white border border-slate-200/90 p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-sky-600" />
              <h3 className="font-bold text-sm text-slate-900">Eventos da Comunidade</h3>
            </div>
            <button 
              onClick={() => onNavigate('events')}
              className="text-xs text-sky-700 hover:text-sky-800 font-semibold flex items-center gap-1"
            >
              Eventos <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3 flex-1">
            {events.length > 0 ? (
              events.slice(0, 2).map(e => (
                <div 
                  key={e.id}
                  onClick={() => onNavigate('events')}
                  className="group relative overflow-hidden rounded-2xl bg-slate-50 border border-slate-200 hover:border-sky-300 cursor-pointer transition-all shadow-sm"
                >
                  {e.bannerUrl && (
                    <div className="h-24 w-full overflow-hidden relative">
                      <img 
                        src={e.bannerUrl} 
                        alt={e.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-600 text-white shadow">
                        {e.startDate}
                      </span>
                    </div>
                  )}
                  <div className="p-3">
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-sky-600 transition-colors">
                      {e.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                      {e.description}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2 pt-2 border-t border-slate-200">
                      <span>{e.location}</span>
                      <span className="text-sky-700 font-bold">{e.spotsTaken} inscritos</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center">
                Nenhum evento especial agendado no momento.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Modal Relatório Pastoral */}
      <DailyReportModal isOpen={showDailyReport} onClose={() => setShowDailyReport(false)} />
    </div>
  );
};
