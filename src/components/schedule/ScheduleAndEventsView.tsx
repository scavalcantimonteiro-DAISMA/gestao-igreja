import React, { useState } from 'react';
import { Calendar, Sparkles, Plus, Clock, MapPin, User, X, Save, Tag, Trash2, FileSpreadsheet } from 'lucide-react';
import { Schedule, ChurchEvent } from '../../types';
import { useChurch, useDataSync } from '../../context/ChurchContext';
import { useNotification } from '../../context/NotificationContext';
import { ConfirmModal } from '../common/ConfirmModal';
import { 
  getSchedules, 
  saveSchedule, 
  deleteSchedule, 
  getEvents, 
  saveEvent, 
  deleteEvent, 
  logAction 
} from '../../services/storage';
import { exportSchedulesToExcel, exportEventsToExcel } from '../../services/excelBackup';

export const ScheduleAndEventsView: React.FC = () => {
  const { currentChurch } = useChurch();
  const { showToast } = useNotification();

  const [activeSubTab, setActiveSubTab] = useState<'schedules' | 'events'>('schedules');
  const [schedules, setSchedules] = useState<Schedule[]>(() => getSchedules(currentChurch.id));
  const [events, setEvents] = useState<ChurchEvent[]>(() => getEvents(currentChurch.id));

  // Forms & Delete Modals
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState<Schedule | null>(null);
  const [eventToDelete, setEventToDelete] = useState<ChurchEvent | null>(null);


  const [scheduleForm, setScheduleForm] = useState<Partial<Schedule>>({
    dayOfWeek: 'Domingo',
    tag: 'sun',
    time: '18:30',
    location: 'Templo Principal',
    recurrence: 'semanal'
  });

  const [eventForm, setEventForm] = useState<Partial<ChurchEvent>>({
    startDate: '2026-10-16',
    time: '19:30',
    location: 'Templo Principal',
    registrationOpen: true,
    maxSpots: 200,
    spotsTaken: 0
  });

  const refreshAll = () => {
    setSchedules(getSchedules(currentChurch.id));
    setEvents(getEvents(currentChurch.id));
  };

  useDataSync(refreshAll, [currentChurch.id]);

  const handleDeleteScheduleConfirm = () => {
    if (scheduleToDelete) {
      deleteSchedule(scheduleToDelete.id);
      logAction(currentChurch.id, 'Administrador', 'ADMIN', 'Exclusão de Programação', scheduleToDelete.title);
      showToast('Programação excluída com sucesso.', 'success');
      setScheduleToDelete(null);
      refreshAll();
    }
  };

  const handleDeleteEventConfirm = () => {
    if (eventToDelete) {
      deleteEvent(eventToDelete.id);
      logAction(currentChurch.id, 'Administrador', 'ADMIN', 'Exclusão de Evento', eventToDelete.name);
      showToast('Evento excluído com sucesso.', 'success');
      setEventToDelete(null);
      refreshAll();
    }
  };


  const handleSaveSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleForm.title?.trim()) {
      showToast('Título da programação é obrigatório.', 'error');
      return;
    }

    const saved: Schedule = {
      id: 'sched_' + Date.now(),
      churchId: currentChurch.id,
      title: scheduleForm.title,
      dayOfWeek: scheduleForm.dayOfWeek || 'Domingo',
      tag: (scheduleForm.tag as any) || 'sun',
      time: scheduleForm.time || '18:30',
      location: scheduleForm.location || 'Templo Principal',
      responsible: scheduleForm.responsible || currentChurch.pastorName,
      recurrence: scheduleForm.recurrence as any || 'semanal',
      description: scheduleForm.description || '',
      createdAt: new Date().toISOString()
    };

    saveSchedule(saved);
    logAction(currentChurch.id, 'Administrador', 'ADMIN', 'Programação Recorrente Adicionada', saved.title);
    showToast('Programação salva com sucesso!', 'success');
    setIsScheduleModalOpen(false);
    refreshAll();
  };

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventForm.name?.trim()) {
      showToast('Nome do evento é obrigatório.', 'error');
      return;
    }

    const saved: ChurchEvent = {
      id: 'ev_' + Date.now(),
      churchId: currentChurch.id,
      name: eventForm.name,
      bannerUrl: eventForm.bannerUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
      startDate: eventForm.startDate || '2026-10-16',
      endDate: eventForm.endDate,
      time: eventForm.time || '19:30',
      location: eventForm.location || 'Templo CBA',
      description: eventForm.description || '',
      responsible: eventForm.responsible || currentChurch.pastorName,
      registrationOpen: eventForm.registrationOpen ?? true,
      maxSpots: eventForm.maxSpots || 100,
      spotsTaken: eventForm.spotsTaken || 0,
      createdAt: new Date().toISOString()
    };

    saveEvent(saved);
    logAction(currentChurch.id, 'Administrador', 'ADMIN', 'Novo Evento Criado', saved.name);
    showToast('Evento especial criado com sucesso!', 'success');
    setIsEventModalOpen(false);
    refreshAll();
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-3">
            <Calendar className="w-6 h-6 text-sky-600" />
            <span>Programação & Eventos</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {currentChurch.name} • Cultos semanais e conferências especiais
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              if (activeSubTab === 'schedules') {
                exportSchedulesToExcel(currentChurch, schedules);
                showToast('Programação semanal exportada em Excel com sucesso!', 'success');
              } else {
                exportEventsToExcel(currentChurch, events);
                showToast('Eventos exportados em Excel com sucesso!', 'success');
              }
            }}
            title="Baixar em planilha Excel"
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Baixar em Excel</span>
          </button>

          {/* Alternador de Sub-aba */}
          <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-100 border border-slate-200">
            <button
              onClick={() => setActiveSubTab('schedules')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeSubTab === 'schedules'
                  ? 'bg-white text-sky-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Programação Semanal ({schedules.length})
            </button>
            <button
              onClick={() => setActiveSubTab('events')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeSubTab === 'events'
                  ? 'bg-white text-sky-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Eventos Especiais ({events.length})
            </button>
          </div>
        </div>
      </div>

      {/* SUB-ABA 1: PROGRAMAÇÃO RECORRENTE (CULTOS) */}
      {activeSubTab === 'schedules' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => {
                setScheduleForm({
                  dayOfWeek: 'Domingo',
                  tag: 'sun',
                  time: '18:30',
                  location: 'Templo Principal',
                  recurrence: 'semanal'
                });
                setIsScheduleModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-md shadow-sky-600/20 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>+ Adicionar Culto / Horário</span>
            </button>
          </div>

          {schedules.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 shadow-sm">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-700">Nenhum culto ou horário cadastrado</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Adicione os cultos de celebração, escola bíblica e reuniões semanais da comunidade.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {schedules.map(s => (
                <div
                  key={s.id}
                  className="p-5 rounded-3xl bg-white border border-slate-200/90 hover:border-sky-300 hover:shadow-md transition-all shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 pb-3 mb-3 border-b border-slate-100">
                      <span className="px-3 py-1 rounded-xl text-xs font-bold uppercase bg-sky-50 text-sky-700 border border-sky-200">
                        {s.dayOfWeek}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-slate-700 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-sky-600" />
                          {s.time}
                        </span>
                        <button
                          onClick={() => setScheduleToDelete(s)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Excluir Horário/Culto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h3 className="font-bold text-base text-slate-900">{s.title}</h3>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{s.location}</span>
                    </div>

                    {s.description && (
                      <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                        {s.description}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>Resp: {s.responsible || 'Pastoral'}</span>
                    <span className="capitalize">{s.recurrence}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUB-ABA 2: EVENTOS ESPECIAIS (CONFERÊNCIAS, RETIROS) */}
      {activeSubTab === 'events' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => {
                setEventForm({
                  startDate: '2026-10-16',
                  time: '19:30',
                  location: 'Templo CBA - Maceió',
                  registrationOpen: true,
                  maxSpots: 250,
                  spotsTaken: 0
                });
                setIsEventModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white text-xs font-bold shadow-md shadow-sky-600/20 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>+ Criar Novo Evento</span>
            </button>
          </div>

          {events.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 shadow-sm">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-700">Nenhum evento especial agendado</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Crie conferências, congressos, retiros e encontros com gestão de inscrições e vagas.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {events.map(e => (
                <div
                  key={e.id}
                  className="rounded-3xl bg-white border border-slate-200/90 hover:border-sky-300 hover:shadow-md transition-all shadow-sm overflow-hidden flex flex-col justify-between group"
                >
                  <div>
                    {e.bannerUrl && (
                      <div className="h-44 w-full overflow-hidden relative">
                        <img src={e.bannerUrl} alt={e.name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                        <span className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold bg-sky-600 text-white shadow-md">
                          {e.startDate}
                        </span>
                      </div>
                    )}

                    <div className="p-6">
                      <h3 className="font-bold text-lg text-slate-900">{e.name}</h3>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        {e.description}
                      </p>

                      <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-slate-100 text-xs text-slate-600">
                        <div>
                          <span className="text-slate-400 block font-medium">Local:</span>
                          <span className="font-semibold text-slate-800">{e.location}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-medium">Horário:</span>
                          <span className="font-semibold text-slate-800">{e.time}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 pt-0 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-400">Vagas:</span>
                      <span className="font-bold text-sky-600">{e.spotsTaken} / {e.maxSpots || 'Livre'}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        e.registrationOpen
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        {e.registrationOpen ? 'Inscrições Abertas' : 'Encerradas'}
                      </span>
                      <button
                        onClick={() => setEventToDelete(e)}
                        className="p-1.5 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors border border-transparent hover:border-rose-100"
                        title="Excluir Evento"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal Programação */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 text-slate-800">
            <button
              onClick={() => setIsScheduleModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900 mb-4">Adicionar Programação Regular</h3>

            <form onSubmit={handleSaveSchedule} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Título do Culto / Atividade *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Culto de Celebração & Família"
                  value={scheduleForm.title || ''}
                  onChange={e => setScheduleForm({ ...scheduleForm, title: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Dia da Semana</label>
                  <select
                    value={scheduleForm.dayOfWeek || 'Domingo'}
                    onChange={e => setScheduleForm({ ...scheduleForm, dayOfWeek: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-sky-500"
                  >
                    <option value="Domingo">Domingo</option>
                    <option value="Quinta-feira">Quinta-feira</option>
                    <option value="Quarta-feira">Quarta-feira</option>
                    <option value="Sábado">Sábado</option>
                    <option value="Terça-feira">Terça-feira</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Horário</label>
                  <input
                    type="time"
                    value={scheduleForm.time || '18:30'}
                    onChange={e => setScheduleForm({ ...scheduleForm, time: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Local</label>
                <input
                  type="text"
                  placeholder="Templo Principal"
                  value={scheduleForm.location || ''}
                  onChange={e => setScheduleForm({ ...scheduleForm, location: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-sky-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-sm"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Evento */}
      {isEventModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 text-slate-800">
            <button
              onClick={() => setIsEventModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900 mb-4">Novo Evento Especial</h3>

            <form onSubmit={handleSaveEvent} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nome do Evento *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Conferência da Chama 2026"
                  value={eventForm.name || ''}
                  onChange={e => setEventForm({ ...eventForm, name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Data Inicial</label>
                  <input
                    type="date"
                    value={eventForm.startDate || ''}
                    onChange={e => setEventForm({ ...eventForm, startDate: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Horário</label>
                  <input
                    type="time"
                    value={eventForm.time || '19:30'}
                    onChange={e => setEventForm({ ...eventForm, time: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">URL do Banner</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash..."
                  value={eventForm.bannerUrl || ''}
                  onChange={e => setEventForm({ ...eventForm, bannerUrl: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Descrição</label>
                <textarea
                  rows={2}
                  value={eventForm.description || ''}
                  onChange={e => setEventForm({ ...eventForm, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEventModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-sm"
                >
                  Salvar Evento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {scheduleToDelete && (
        <ConfirmModal
          isOpen={true}
          title="Excluir Programação"
          message={`Tem certeza que deseja remover o culto/programação "${scheduleToDelete.title}"? Esta ação não pode ser desfeita.`}
          confirmLabel="Excluir"
          confirmVariant="danger"
          onConfirm={handleDeleteScheduleConfirm}
          onCancel={() => setScheduleToDelete(null)}
        />
      )}

      {eventToDelete && (
        <ConfirmModal
          isOpen={true}
          title="Excluir Evento"
          message={`Tem certeza que deseja remover o evento "${eventToDelete.name}"? As inscrições associadas também serão removidas. Esta ação não pode ser desfeita.`}
          confirmLabel="Excluir Evento"
          confirmVariant="danger"
          onConfirm={handleDeleteEventConfirm}
          onCancel={() => setEventToDelete(null)}
        />
      )}
    </div>
  );
};

