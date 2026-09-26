import React, { useState, useRef } from 'react';
import { 
  Sparkles, 
  Plus, 
  MapPin, 
  User, 
  Users,
  X, 
  Save, 
  Trash2, 
  FileSpreadsheet,
  Upload,
  Edit3
} from 'lucide-react';
import { ChurchEvent } from '../../types';
import { useChurch, useDataSync } from '../../context/ChurchContext';
import { useNotification } from '../../context/NotificationContext';
import { ConfirmModal } from '../common/ConfirmModal';
import { 
  getEvents, 
  saveEvent, 
  deleteEvent, 
  logAction 
} from '../../services/storage';
import { exportEventsToExcel } from '../../services/excelBackup';

export const EventsView: React.FC = () => {
  const { currentChurch } = useChurch();
  const { showToast } = useNotification();

  const [events, setEvents] = useState<ChurchEvent[]>(() => getEvents(currentChurch.id));
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [eventToDelete, setEventToDelete] = useState<ChurchEvent | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [eventForm, setEventForm] = useState<Partial<ChurchEvent>>({
    name: '',
    organizer: '',
    team: '',
    bannerUrl: '',
    startDate: '',
    time: '19:30',
    location: '',
    description: '',
    registrationOpen: true,
    maxSpots: 200,
    spotsTaken: 0
  });

  const refreshEvents = () => {
    setEvents(getEvents(currentChurch.id));
  };

  useDataSync(refreshEvents, [currentChurch.id]);

  const handleDeleteEventConfirm = () => {
    if (eventToDelete) {
      deleteEvent(eventToDelete.id);
      logAction(currentChurch.id, 'Administrador', 'ADMIN', 'Exclusão de Evento', eventToDelete.name);
      showToast('Evento excluído com sucesso.', 'success');
      setEventToDelete(null);
      refreshEvents();
    }
  };

  const openNewEventModal = () => {
    setEditingEventId(null);
    setEventForm({
      name: '',
      organizer: currentChurch.pastorName || 'Coordenação',
      team: '',
      bannerUrl: '',
      startDate: new Date().toISOString().split('T')[0],
      time: '19:30',
      location: currentChurch.address || 'Templo Principal',
      description: '',
      registrationOpen: true,
      maxSpots: 200,
      spotsTaken: 0
    });
    setIsEventModalOpen(true);
  };

  const openEditEventModal = (e: ChurchEvent) => {
    setEditingEventId(e.id);
    setEventForm({
      ...e,
      organizer: e.organizer || e.responsible || '',
      team: e.team || ''
    });
    setIsEventModalOpen(true);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast('A imagem deve ter no máximo 2MB.', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setEventForm(prev => ({ ...prev, bannerUrl: reader.result as string }));
        showToast('Foto do evento carregada com sucesso!', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventForm.name?.trim()) {
      showToast('Nome do evento é obrigatório.', 'error');
      return;
    }

    const saved: ChurchEvent = {
      id: editingEventId || ('ev_' + Date.now()),
      churchId: currentChurch.id,
      name: eventForm.name.trim(),
      bannerUrl: eventForm.bannerUrl || '',
      startDate: eventForm.startDate || new Date().toISOString().split('T')[0],
      endDate: eventForm.endDate || undefined,
      time: eventForm.time || '19:30',
      location: eventForm.location?.trim() || currentChurch.address || 'Templo Principal',
      description: eventForm.description?.trim() || '',
      responsible: eventForm.organizer?.trim() || eventForm.responsible?.trim() || currentChurch.pastorName || 'Coordenação',
      organizer: eventForm.organizer?.trim() || eventForm.responsible?.trim() || currentChurch.pastorName || 'Coordenação',
      team: eventForm.team?.trim() || '',
      registrationOpen: eventForm.registrationOpen ?? true,
      maxSpots: Number(eventForm.maxSpots) || 0,
      spotsTaken: Number(eventForm.spotsTaken) || 0,
      createdAt: eventForm.createdAt || new Date().toISOString()
    };

    saveEvent(saved);
    logAction(
      currentChurch.id, 
      'Administrador', 
      'ADMIN', 
      editingEventId ? 'Evento Atualizado' : 'Novo Evento Criado', 
      saved.name
    );
    showToast(editingEventId ? 'Evento atualizado com sucesso!' : 'Evento especial criado com sucesso!', 'success');
    setIsEventModalOpen(false);
    refreshEvents();
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-sky-600" />
            <span>Eventos Especiais</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {currentChurch.name} • Conferências, congressos, retiros e encontros especiais
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              exportEventsToExcel(currentChurch, events);
              showToast('Eventos especiais exportados em Excel com sucesso!', 'success');
            }}
            title="Baixar eventos em planilha Excel"
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Baixar em Excel</span>
          </button>

          <button
            onClick={openNewEventModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-sky-500/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Criar Novo Evento</span>
          </button>
        </div>
      </div>

      {events.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 shadow-sm">
          <Sparkles className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">Nenhum evento especial agendado</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Crie conferências, congressos, retiros e encontros com capa, foto, organizador e equipe.
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
                {/* Capa / Banner do Evento */}
                {e.bannerUrl ? (
                  <div className="h-52 w-full overflow-hidden relative bg-slate-900">
                    <img 
                      src={e.bannerUrl} 
                      alt={e.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    <span className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold bg-sky-600 text-white shadow-md">
                      {e.startDate}
                    </span>
                  </div>
                ) : (
                  <div className="h-28 w-full bg-gradient-to-r from-[#102A43] to-[#1B3B5C] flex items-center justify-between px-6 text-white relative">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-6 h-6 text-sky-300" />
                      <span className="text-sm font-bold">Evento Especial</span>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-600 text-white shadow-md">
                      {e.startDate}
                    </span>
                  </div>
                )}

                <div className="p-6">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-lg text-slate-900">{e.name}</h3>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditEventModal(e)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition-colors"
                        title="Editar Evento"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEventToDelete(e)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Excluir Evento"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {e.description && (
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                      {e.description}
                    </p>
                  )}

                  {/* Informações de Local e Horário */}
                  <div className="mt-4 space-y-1.5 text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{e.location}</span>
                    </div>
                  </div>

                  {/* Organizador e Equipe */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col gap-1.5 text-xs">
                    {e.organizer && (
                      <div className="flex items-center gap-2 text-slate-700">
                        <User className="w-3.5 h-3.5 text-sky-600" />
                        <span>Organizador: <strong>{e.organizer}</strong></span>
                      </div>
                    )}
                    {e.team && (
                      <div className="flex items-center gap-2 text-slate-500">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span>Equipe: {e.team}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Rodapé do Card */}
              <div className="px-6 py-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-500">Vagas: </span>
                  <span className="font-bold text-sky-600">
                    {e.maxSpots ? `${e.spotsTaken} / ${e.maxSpots}` : 'Livre / Ilimitado'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                    e.registrationOpen
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}>
                    {e.registrationOpen ? 'Inscrições Abertas' : 'Encerradas'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Evento Especial */}
      {isEventModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-xl rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 text-slate-800 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsEventModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900 mb-1">
              {editingEventId ? 'Editar Evento Especial' : 'Novo Evento Especial'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Informe os detalhes do evento, organizador, equipe e suba a foto de capa.
            </p>

            <form onSubmit={handleSaveEvent} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nome do Evento *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Conferência da Família 2026, Retiro Espiritual..."
                  value={eventForm.name || ''}
                  onChange={e => setEventForm({ ...eventForm, name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-sky-500"
                />
              </div>

              {/* FOTO DE CAPA DO EVENTO */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <label className="block text-xs font-bold text-slate-800">
                  Foto da Capa / Banner do Evento
                </label>
                <p className="text-[11px] text-slate-500">
                  Suba uma imagem do seu dispositivo para ilustrar o banner do evento.
                </p>

                {eventForm.bannerUrl ? (
                  <div className="relative rounded-2xl overflow-hidden h-36 w-full border border-slate-300 bg-slate-900">
                    <img 
                      src={eventForm.bannerUrl} 
                      alt="Prévia da Capa" 
                      className="w-full h-full object-cover" 
                    />
                    <button
                      type="button"
                      onClick={() => setEventForm({ ...eventForm, bannerUrl: '' })}
                      className="absolute top-2 right-2 p-1.5 rounded-xl bg-black/60 hover:bg-rose-600 text-white transition-colors"
                      title="Remover foto"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-xs active:scale-95 transition-all"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Subir Foto do Dispositivo</span>
                    </button>
                    <span className="text-[11px] text-slate-400">ou cole um link abaixo</span>
                  </div>
                )}

                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handlePhotoUpload} 
                  accept="image/*" 
                  className="hidden" 
                />

                <input
                  type="text"
                  placeholder="Ou insira a URL da imagem (Ex: https://...)"
                  value={eventForm.bannerUrl || ''}
                  onChange={e => setEventForm({ ...eventForm, bannerUrl: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs outline-none focus:border-sky-500"
                />
              </div>

              {/* ORGANIZADOR E EQUIPE */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nome do Organizador(a)</label>
                  <input
                    type="text"
                    placeholder="Ex: Pastor Titular, Coordenador..."
                    value={eventForm.organizer || ''}
                    onChange={e => setEventForm({ ...eventForm, organizer: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs outline-none focus:bg-white focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Equipe de Apoio</label>
                  <input
                    type="text"
                    placeholder="Ex: Jovens, Ministério de Louvor..."
                    value={eventForm.team || ''}
                    onChange={e => setEventForm({ ...eventForm, team: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs outline-none focus:bg-white focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Data do Evento</label>
                  <input
                    type="date"
                    value={eventForm.startDate || ''}
                    onChange={e => setEventForm({ ...eventForm, startDate: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs outline-none focus:bg-white focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Horário</label>
                  <input
                    type="time"
                    value={eventForm.time || '19:30'}
                    onChange={e => setEventForm({ ...eventForm, time: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs outline-none focus:bg-white focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Local</label>
                  <input
                    type="text"
                    placeholder="Ex: Templo Principal, Auditório..."
                    value={eventForm.location || ''}
                    onChange={e => setEventForm({ ...eventForm, location: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs outline-none focus:bg-white focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Vagas Máximas (0 = livre)</label>
                  <input
                    type="number"
                    placeholder="Ex: 250"
                    value={eventForm.maxSpots ?? 200}
                    onChange={e => setEventForm({ ...eventForm, maxSpots: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs outline-none focus:bg-white focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Descrição do Evento</label>
                <textarea
                  rows={2}
                  placeholder="Tema, preletores convidados, programação especial..."
                  value={eventForm.description || ''}
                  onChange={e => setEventForm({ ...eventForm, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs outline-none focus:border-sky-500"
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
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-sm"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Salvar Evento</span>
                </button>
              </div>
            </form>
          </div>
        </div>
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
