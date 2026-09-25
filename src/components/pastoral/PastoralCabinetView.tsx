import React, { useState } from 'react';
import { BookOpen, Calendar, Clock, Plus, Phone, Heart, HomeIcon, CheckCircle2, X, Save, Eye, MapPin, Trash2 } from 'lucide-react';
import { PastoralAppointment, PastoralVisit, PrayerRequest } from '../../types';
import { useChurch, useDataSync } from '../../context/ChurchContext';
import { useNotification } from '../../context/NotificationContext';
import { WhatsAppButton } from '../common/WhatsAppButton';
import { ConfirmModal } from '../common/ConfirmModal';
import { 
  getPastoralAppointments, 
  savePastoralAppointment, 
  deletePastoralAppointment,
  getPastoralVisits, 
  savePastoralVisit, 
  deletePastoralVisit,
  getPrayerRequests, 
  savePrayerRequest, 
  deletePrayerRequest,
  logAction 
} from '../../services/storage';

interface PastoralCabinetViewProps {
  initialTab?: 'gabinete' | 'visitas' | 'oracao';
  isolated?: boolean;
}

export const PastoralCabinetView: React.FC<PastoralCabinetViewProps> = ({
  initialTab = 'gabinete',
  isolated = false,
}) => {
  const { currentChurch } = useChurch();
  const { showToast } = useNotification();

  const [activeSubTab, setActiveSubTab] = useState<'gabinete' | 'visitas' | 'oracao'>(initialTab);

  React.useEffect(() => {
    setActiveSubTab(initialTab);
  }, [initialTab]);

  const [appointments, setAppointments] = useState<PastoralAppointment[]>(() => getPastoralAppointments(currentChurch.id));
  const [visits, setVisits] = useState<PastoralVisit[]>(() => getPastoralVisits(currentChurch.id));
  const [prayers, setPrayers] = useState<PrayerRequest[]>(() => getPrayerRequests(currentChurch.id));

  // Modais
  const [isApptModalOpen, setIsApptModalOpen] = useState(false);
  const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);
  const [isPrayerModalOpen, setIsPrayerModalOpen] = useState(false);

  // Exclusão
  const [apptToDelete, setApptToDelete] = useState<PastoralAppointment | null>(null);
  const [visitToDelete, setVisitToDelete] = useState<PastoralVisit | null>(null);
  const [prayerToDelete, setPrayerToDelete] = useState<PrayerRequest | null>(null);

  // Forms
  const [apptForm, setApptForm] = useState<Partial<PastoralAppointment>>({
    date: new Date().toISOString().split('T')[0],
    time: '14:00',
    durationMinutes: 45,
    type: 'aconselhamento',
    status: 'agendado'
  });

  const [visitForm, setVisitForm] = useState<Partial<PastoralVisit>>({
    date: new Date().toISOString().split('T')[0],
    visitorName: currentChurch.pastorName,
    returnNeeded: false,
    status: 'pendente'
  });

  const [prayerForm, setPrayerForm] = useState<Partial<PrayerRequest>>({
    date: new Date().toISOString().split('T')[0],
    status: 'em oração',
    category: 'Família'
  });

  const refreshAll = () => {
    setAppointments(getPastoralAppointments(currentChurch.id));
    setVisits(getPastoralVisits(currentChurch.id));
    setPrayers(getPrayerRequests(currentChurch.id));
  };

  useDataSync(refreshAll, [currentChurch.id]);

  const handleDeleteApptConfirm = () => {
    if (apptToDelete) {
      deletePastoralAppointment(apptToDelete.id);
      logAction(currentChurch.id, currentChurch.pastorName, 'PASTOR', 'Exclusão de Atendimento', apptToDelete.personName);
      showToast('Atendimento pastoral excluído.', 'success');
      setApptToDelete(null);
      refreshAll();
    }
  };

  const handleDeleteVisitConfirm = () => {
    if (visitToDelete) {
      deletePastoralVisit(visitToDelete.id);
      logAction(currentChurch.id, currentChurch.pastorName, 'PASTOR', 'Exclusão de Visita', visitToDelete.personName);
      showToast('Visita pastoral excluída.', 'success');
      setVisitToDelete(null);
      refreshAll();
    }
  };

  const handleDeletePrayerConfirm = () => {
    if (prayerToDelete) {
      deletePrayerRequest(prayerToDelete.id);
      logAction(currentChurch.id, 'Administrador', 'ADMIN', 'Exclusão de Pedido de Oração', prayerToDelete.personName);
      showToast('Pedido de oração excluído.', 'success');
      setPrayerToDelete(null);
      refreshAll();
    }
  };


  const handleSaveAppt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apptForm.personName?.trim() || !apptForm.phone) {
      showToast('Nome e Telefone são obrigatórios.', 'error');
      return;
    }

    const saved: PastoralAppointment = {
      id: 'app_' + Date.now(),
      churchId: currentChurch.id,
      personName: apptForm.personName,
      phone: apptForm.phone,
      date: apptForm.date || '2026-09-21',
      time: apptForm.time || '14:00',
      durationMinutes: apptForm.durationMinutes || 45,
      type: apptForm.type as any || 'aconselhamento',
      status: 'agendado',
      notes: apptForm.notes || '',
      createdAt: new Date().toISOString()
    };

    savePastoralAppointment(saved);
    logAction(currentChurch.id, currentChurch.pastorName, 'PASTOR', 'Agendamento de Gabinete', `${saved.personName} (${saved.time})`);
    showToast('Atendimento agendado com sucesso!', 'success');
    setIsApptModalOpen(false);
    refreshAll();
  };

  const handleSaveVisit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitForm.personName?.trim() || !visitForm.address) {
      showToast('Nome da pessoa e Endereço são obrigatórios.', 'error');
      return;
    }

    const saved: PastoralVisit = {
      id: 'vis_' + Date.now(),
      churchId: currentChurch.id,
      personName: visitForm.personName,
      phone: visitForm.phone || '',
      address: visitForm.address,
      date: visitForm.date || new Date().toISOString().split('T')[0],
      visitorName: visitForm.visitorName || currentChurch.pastorName,
      reason: visitForm.reason || 'Visita pastoral',
      notes: visitForm.notes || '',
      returnNeeded: visitForm.returnNeeded || false,
      returnDate: visitForm.returnDate,
      status: 'pendente',
      createdAt: new Date().toISOString()
    };

    savePastoralVisit(saved);
    logAction(currentChurch.id, currentChurch.pastorName, 'PASTOR', 'Visita Pastoral Agendada', saved.personName);
    showToast('Visita pastoral registrada!', 'success');
    setIsVisitModalOpen(false);
    refreshAll();
  };

  const handleSavePrayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prayerForm.personName?.trim() || !prayerForm.request?.trim()) {
      showToast('Nome e Pedido são obrigatórios.', 'error');
      return;
    }

    const saved: PrayerRequest = {
      id: 'pr_' + Date.now(),
      churchId: currentChurch.id,
      personName: prayerForm.personName,
      phone: prayerForm.phone || '',
      category: prayerForm.category || 'Família & Lar',
      request: prayerForm.request,
      date: prayerForm.date || new Date().toISOString().split('T')[0],
      responsible: prayerForm.responsible || 'Equipe de Intercessão',
      notes: prayerForm.notes || '',
      status: prayerForm.status as any || 'em oração',
      createdAt: new Date().toISOString()
    };

    savePrayerRequest(saved);
    showToast('Pedido de oração adicionado ao mural!', 'success');
    setIsPrayerModalOpen(false);
    refreshAll();
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-3">
            {activeSubTab === 'gabinete' && <BookOpen className="w-6 h-6 text-sky-600" />}
            {activeSubTab === 'visitas' && <HomeIcon className="w-6 h-6 text-indigo-600" />}
            {activeSubTab === 'oracao' && <Heart className="w-6 h-6 text-rose-600" />}
            <span>
              {activeSubTab === 'gabinete' && 'Agenda do Gabinete Pastoral'}
              {activeSubTab === 'visitas' && 'Visitas Pastorais'}
              {activeSubTab === 'oracao' && 'Pedidos de Oração & Intercessão'}
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {activeSubTab === 'gabinete' && `${currentChurch.name} • ${currentChurch.pastorName} (Atendimentos & Aconselhamento)`}
            {activeSubTab === 'visitas' && `${currentChurch.name} • Pastoreio e cuidado nos lares e hospitais`}
            {activeSubTab === 'oracao' && `${currentChurch.name} • Clamor e intercessão diária`}
          </p>
        </div>

        {/* Alternador de Abas - Oculto quando isolado */}
        {!isolated && (
          <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-100 border border-slate-200">
            <button
              onClick={() => setActiveSubTab('gabinete')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeSubTab === 'gabinete' ? 'bg-white text-sky-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Gabinete ({appointments.length})
            </button>
            <button
              onClick={() => setActiveSubTab('visitas')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeSubTab === 'visitas' ? 'bg-white text-sky-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Visitas ({visits.length})
            </button>
            <button
              onClick={() => setActiveSubTab('oracao')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeSubTab === 'oracao' ? 'bg-white text-sky-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Oração ({prayers.length})
            </button>
          </div>
        )}
      </div>

      {/* SUB-ABA 1: GABINETE PASTORAL */}
      {activeSubTab === 'gabinete' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => {
                setApptForm({
                  personName: '',
                  phone: '',
                  date: new Date().toISOString().split('T')[0],
                  time: '14:00',
                  durationMinutes: 45,
                  type: 'aconselhamento',
                  status: 'agendado'
                });
                setIsApptModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-sky-500/20 active:scale-95 transition-all"
            >
              <Calendar className="w-4 h-4" />
              <span>+ Cadastrar Agenda</span>
            </button>
          </div>

          {appointments.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 shadow-sm">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-700">Nenhum atendimento na agenda do gabinete</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Utilize o botão acima "+ Cadastrar Agenda" para registrar horários de aconselhamento e orientações pastorais.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {appointments.map(a => (
                <div
                  key={a.id}
                  className="p-5 rounded-3xl bg-white border border-slate-200/90 hover:border-sky-300 hover:shadow-md transition-all shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                      <span className="px-3 py-1 rounded-xl bg-sky-50 text-sky-700 font-mono font-bold text-xs border border-sky-200">
                        {a.time} • {a.date.split('-').reverse().join('/')}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-slate-400">
                        {a.durationMinutes} min
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-slate-900">{a.personName}</h3>
                    <p className="text-xs font-semibold text-sky-600 mt-0.5 capitalize">
                      Tipo: {a.type}
                    </p>

                    {a.notes && (
                      <p className="text-xs text-slate-600 mt-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                        "{a.notes}"
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <WhatsAppButton
                      phone={a.phone}
                      message={`Olá, ${a.personName}! Confirmando nosso atendimento pastoral agendado para hoje às ${a.time} em ${currentChurch.name}.`}
                      label="WhatsApp"
                      size="sm"
                      variant="outline"
                    />

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                        {a.status}
                      </span>
                      <button
                        onClick={() => setApptToDelete(a)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Excluir Atendimento"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUB-ABA 2: VISITAS PASTORAIS */}
      {activeSubTab === 'visitas' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => {
                setVisitForm({
                  personName: '',
                  phone: '',
                  address: '',
                  date: new Date().toISOString().split('T')[0],
                  visitorName: currentChurch.pastorName,
                  reason: '',
                  returnNeeded: false
                });
                setIsVisitModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
            >
              <HomeIcon className="w-4 h-4" />
              <span>+ Cadastrar Visita</span>
            </button>
          </div>

          {visits.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 shadow-sm">
              <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-700">Nenhuma visita pastoral registrada</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Utilize o botão acima "+ Cadastrar Visita" para registrar acolhimento nos lares e hospitais.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {visits.map(v => (
                <div
                  key={v.id}
                  className="p-5 rounded-3xl bg-white border border-slate-200/90 hover:border-indigo-300 hover:shadow-md transition-all shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between pb-3 mb-3 border-b border-slate-100">
                      <div>
                        <h3 className="font-bold text-base text-slate-900">{v.personName}</h3>
                        <p className="text-xs text-indigo-600 font-medium">Visitante pastoral: {v.visitorName}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-500">
                          {v.date.split('-').reverse().join('/')}
                        </span>
                        <button
                          onClick={() => setVisitToDelete(v)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Excluir Visita"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-600">
                      <p><span className="text-slate-400 font-semibold">Endereço:</span> {v.address}</p>
                      <p><span className="text-slate-400 font-semibold">Motivo:</span> {v.reason}</p>
                      {v.notes && <p><span className="text-slate-400 font-semibold">Obs:</span> {v.notes}</p>}
                      {v.returnNeeded && (
                        <span className="inline-block mt-2 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-bold">
                          ⚠️ Retorno necessário previsto para: {v.returnDate || 'A definir'}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    {v.phone ? (
                      <WhatsAppButton
                        phone={v.phone}
                        message={`Graça e Paz, ${v.personName}! Estamos entrando em contato sobre a visita pastoral da ${currentChurch.name}. Conte com as nossas orações!`}
                        label="WhatsApp"
                        size="sm"
                        variant="outline"
                      />
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">Sem telefone cadastrado</span>
                    )}
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold capitalize">
                      {v.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUB-ABA 3: PEDIDOS DE ORAÇÃO */}
      {activeSubTab === 'oracao' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => {
                setPrayerForm({
                  personName: '',
                  phone: '',
                  category: 'Família & Lar',
                  request: '',
                  date: new Date().toISOString().split('T')[0],
                  responsible: 'Equipe de Intercessão',
                  status: 'em oração'
                });
                setIsPrayerModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white text-xs font-bold shadow-lg shadow-rose-500/20 active:scale-95 transition-all"
            >
              <Heart className="w-4 h-4" />
              <span>+ Cadastrar Pedido de Oração</span>
            </button>
          </div>

          {prayers.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 shadow-sm">
              <Heart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-700">Nenhum pedido de oração ativo</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Utilize o botão acima "+ Cadastrar Pedido de Oração" para registrar clamores por saúde, família e causas da igreja.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {prayers.map(p => (
                <div
                  key={p.id}
                  className="p-5 rounded-3xl bg-white border border-slate-200/90 hover:border-rose-300 hover:shadow-md transition-all shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                      <div>
                        <span className="font-bold text-sm text-slate-900 block">{p.personName}</span>
                        {p.category && (
                          <span className="inline-block mt-0.5 text-[10px] font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                            {p.category}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                          {p.status}
                        </span>
                        <button
                          onClick={() => setPrayerToDelete(p)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Excluir Pedido"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 italic leading-relaxed">
                      "{p.request}"
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span>{p.date.split('-').reverse().join('/')} • Resp: {p.responsible || 'Intercessão'}</span>
                    {p.phone && (
                      <WhatsAppButton
                        phone={p.phone}
                        message={`Graça e Paz, ${p.personName}! Estamos orando pelo seu pedido de oração diante de Deus: "${p.request}". O Senhor é fiel! 🙏📖 - ${currentChurch.name}`}
                        label="Orar no WhatsApp"
                        size="sm"
                        variant="outline"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal Agendamento de Gabinete */}
      {isApptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 text-slate-800">
            <button
              onClick={() => setIsApptModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900 mb-4">Cadastrar Agenda do Gabinete</h3>

            <form onSubmit={handleSaveAppt} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nome da Pessoa / Membro *</label>
                <input
                  type="text"
                  required
                  placeholder="Nome completo"
                  value={apptForm.personName || ''}
                  onChange={e => setApptForm({ ...apptForm, personName: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">WhatsApp / Telefone *</label>
                <input
                  type="text"
                  required
                  placeholder="(DDD) 99999-9999"
                  value={apptForm.phone || ''}
                  onChange={e => setApptForm({ ...apptForm, phone: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Data</label>
                  <input
                    type="date"
                    value={apptForm.date || new Date().toISOString().split('T')[0]}
                    onChange={e => setApptForm({ ...apptForm, date: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Horário</label>
                  <input
                    type="time"
                    value={apptForm.time || '14:00'}
                    onChange={e => setApptForm({ ...apptForm, time: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tipo de Atendimento Pastoral</label>
                <select
                  value={apptForm.type || 'aconselhamento'}
                  onChange={e => setApptForm({ ...apptForm, type: e.target.value as any })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-sky-500"
                >
                  <option value="aconselhamento">Aconselhamento Pastoral</option>
                  <option value="atendimento">Atendimento Pastoral Geral</option>
                  <option value="orientação">Orientação Espiritual</option>
                  <option value="casamento">Casamento / Noivos</option>
                  <option value="família">Família / Lar</option>
                  <option value="liderança">Liderança / Ministério</option>
                  <option value="batismo">Orientação Batismal</option>
                  <option value="outro">Outro Atendimento</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Observações da Agenda</label>
                <textarea
                  rows={2}
                  placeholder="Informações adicionais sobre o atendimento..."
                  value={apptForm.notes || ''}
                  onChange={e => setApptForm({ ...apptForm, notes: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-sky-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsApptModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-sm"
                >
                  Salvar na Agenda
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Registrar Visita Pastoral */}
      {isVisitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 text-slate-800">
            <button
              onClick={() => setIsVisitModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900 mb-4">Cadastrar Visita Pastoral</h3>

            <form onSubmit={handleSaveVisit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nome da Pessoa / Família *</label>
                <input
                  type="text"
                  required
                  placeholder="Nome do visitado ou família"
                  value={visitForm.personName || ''}
                  onChange={e => setVisitForm({ ...visitForm, personName: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">WhatsApp / Telefone (Opcional)</label>
                <input
                  type="text"
                  placeholder="(DDD) 99999-9999"
                  value={visitForm.phone || ''}
                  onChange={e => setVisitForm({ ...visitForm, phone: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Endereço da Visita *</label>
                <input
                  type="text"
                  required
                  placeholder="Rua, número, bairro ou hospital..."
                  value={visitForm.address || ''}
                  onChange={e => setVisitForm({ ...visitForm, address: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Data</label>
                  <input
                    type="date"
                    value={visitForm.date || new Date().toISOString().split('T')[0]}
                    onChange={e => setVisitForm({ ...visitForm, date: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Visitante Pastoral</label>
                  <input
                    type="text"
                    value={visitForm.visitorName || currentChurch.pastorName}
                    onChange={e => setVisitForm({ ...visitForm, visitorName: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Motivo da Visita</label>
                <input
                  type="text"
                  placeholder="Ex: Enfermidade, acolhimento nos lares, pós-cirúrgico, oração..."
                  value={visitForm.reason || ''}
                  onChange={e => setVisitForm({ ...visitForm, reason: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Observações da Visita</label>
                <textarea
                  rows={2}
                  placeholder="Detalhes sobre a conversa, necessidades ou encaminhamentos..."
                  value={visitForm.notes || ''}
                  onChange={e => setVisitForm({ ...visitForm, notes: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="returnNeeded"
                  checked={visitForm.returnNeeded || false}
                  onChange={e => setVisitForm({ ...visitForm, returnNeeded: e.target.checked })}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="returnNeeded" className="text-xs font-semibold text-slate-700">
                  Retorno pastoral necessário?
                </label>
              </div>

              {visitForm.returnNeeded && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Previsão para Retorno</label>
                  <input
                    type="date"
                    value={visitForm.returnDate || ''}
                    onChange={e => setVisitForm({ ...visitForm, returnDate: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-indigo-500"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsVisitModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-sm"
                >
                  Salvar Visita
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Novo Pedido de Oração */}
      {isPrayerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 text-slate-800">
            <button
              onClick={() => setIsPrayerModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900 mb-4">Cadastrar Pedido de Oração</h3>

            <form onSubmit={handleSavePrayer} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nome de quem pediu *</label>
                <input
                  type="text"
                  required
                  placeholder="Nome completo ou da família"
                  value={prayerForm.personName || ''}
                  onChange={e => setPrayerForm({ ...prayerForm, personName: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">WhatsApp / Telefone (Opcional)</label>
                <input
                  type="text"
                  placeholder="(DDD) 99999-9999"
                  value={prayerForm.phone || ''}
                  onChange={e => setPrayerForm({ ...prayerForm, phone: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Categoria / Motivo</label>
                <select
                  value={prayerForm.category || 'Família & Lar'}
                  onChange={e => setPrayerForm({ ...prayerForm, category: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-rose-500"
                >
                  <option value="Saúde & Cura">Saúde & Cura</option>
                  <option value="Família & Lar">Família & Lar</option>
                  <option value="Vida Espiritual & Libertação">Vida Espiritual & Libertação</option>
                  <option value="Emprego & Finanças">Emprego & Finanças</option>
                  <option value="Gratidão & Testemunho">Gratidão & Testemunho</option>
                  <option value="Causas da Igreja & Missões">Causas da Igreja & Missões</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Pedido de Oração *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Descreva o motivo de oração..."
                  value={prayerForm.request || ''}
                  onChange={e => setPrayerForm({ ...prayerForm, request: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Data</label>
                  <input
                    type="date"
                    value={prayerForm.date || new Date().toISOString().split('T')[0]}
                    onChange={e => setPrayerForm({ ...prayerForm, date: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Responsável / Intercessão</label>
                  <input
                    type="text"
                    placeholder="Ex: Equipe de Intercessão"
                    value={prayerForm.responsible || ''}
                    onChange={e => setPrayerForm({ ...prayerForm, responsible: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPrayerModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-sm"
                >
                  Salvar Pedido de Oração
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {apptToDelete && (
        <ConfirmModal
          isOpen={true}
          title="Excluir Atendimento Pastoral"
          message={`Deseja realmente remover o agendamento de ${apptToDelete.personName} para ${apptToDelete.time}? Esta ação não pode ser desfeita.`}
          confirmLabel="Excluir"
          confirmVariant="danger"
          onConfirm={handleDeleteApptConfirm}
          onCancel={() => setApptToDelete(null)}
        />
      )}

      {visitToDelete && (
        <ConfirmModal
          isOpen={true}
          title="Excluir Visita Pastoral"
          message={`Deseja realmente remover o registro de visita para ${visitToDelete.personName}? Esta ação não pode ser desfeita.`}
          confirmLabel="Excluir"
          confirmVariant="danger"
          onConfirm={handleDeleteVisitConfirm}
          onCancel={() => setVisitToDelete(null)}
        />
      )}

      {prayerToDelete && (
        <ConfirmModal
          isOpen={true}
          title="Excluir Pedido de Oração"
          message={`Deseja realmente remover o pedido de oração de ${prayerToDelete.personName}? Esta ação não pode ser desfeita.`}
          confirmLabel="Excluir"
          confirmVariant="danger"
          onConfirm={handleDeletePrayerConfirm}
          onCancel={() => setPrayerToDelete(null)}
        />
      )}
    </div>
  );
};

