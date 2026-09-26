import React, { useState } from 'react';
import { 
  Calendar, 
  Plus, 
  Clock, 
  MapPin, 
  X, 
  Trash2, 
  FileSpreadsheet,
  Edit3
} from 'lucide-react';
import { Schedule } from '../../types';
import { useChurch, useDataSync } from '../../context/ChurchContext';
import { useNotification } from '../../context/NotificationContext';
import { ConfirmModal } from '../common/ConfirmModal';
import { 
  getSchedules, 
  saveSchedule, 
  deleteSchedule, 
  logAction 
} from '../../services/storage';
import { exportSchedulesToExcel } from '../../services/excelBackup';

export const ScheduleView: React.FC = () => {
  const { currentChurch } = useChurch();
  const { showToast } = useNotification();

  const [schedules, setSchedules] = useState<Schedule[]>(() => getSchedules(currentChurch.id));
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null);
  const [scheduleToDelete, setScheduleToDelete] = useState<Schedule | null>(null);

  const [scheduleForm, setScheduleForm] = useState<Partial<Schedule>>({
    title: '',
    dayOfWeek: 'Domingo',
    tag: 'sun',
    time: '18:30',
    location: '',
    responsible: '',
    recurrence: 'semanal',
    description: ''
  });

  const refreshSchedules = () => {
    setSchedules(getSchedules(currentChurch.id));
  };

  useDataSync(refreshSchedules, [currentChurch.id]);

  const openNewScheduleModal = () => {
    setEditingScheduleId(null);
    setScheduleForm({
      title: '',
      dayOfWeek: 'Domingo',
      tag: 'sun',
      time: '18:30',
      location: currentChurch.address || 'Templo Principal',
      responsible: currentChurch.pastorName || 'Pastoral',
      recurrence: 'semanal',
      description: ''
    });
    setIsScheduleModalOpen(true);
  };

  const openEditScheduleModal = (s: Schedule) => {
    setEditingScheduleId(s.id);
    setScheduleForm({ ...s });
    setIsScheduleModalOpen(true);
  };

  const handleDeleteScheduleConfirm = () => {
    if (scheduleToDelete) {
      deleteSchedule(scheduleToDelete.id);
      logAction(currentChurch.id, 'Administrador', 'ADMIN', 'Exclusão de Programação', scheduleToDelete.title);
      showToast('Programação excluída com sucesso.', 'success');
      setScheduleToDelete(null);
      refreshSchedules();
    }
  };

  const handleSaveSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleForm.title?.trim()) {
      showToast('Título da programação é obrigatório.', 'error');
      return;
    }

    const saved: Schedule = {
      id: editingScheduleId || ('sched_' + Date.now()),
      churchId: currentChurch.id,
      title: scheduleForm.title.trim(),
      dayOfWeek: scheduleForm.dayOfWeek || 'Domingo',
      tag: (scheduleForm.tag as any) || 'sun',
      time: scheduleForm.time || '18:30',
      location: scheduleForm.location?.trim() || currentChurch.address || 'Templo Principal',
      responsible: scheduleForm.responsible?.trim() || currentChurch.pastorName || 'Pastoral',
      recurrence: (scheduleForm.recurrence as any) || 'semanal',
      description: scheduleForm.description?.trim() || '',
      createdAt: scheduleForm.createdAt || new Date().toISOString()
    };

    saveSchedule(saved);
    logAction(
      currentChurch.id, 
      'Administrador', 
      'ADMIN', 
      editingScheduleId ? 'Programação Atualizada' : 'Nova Programação Criada', 
      saved.title
    );
    showToast(editingScheduleId ? 'Programação atualizada com sucesso!' : 'Programação criada com sucesso!', 'success');
    setIsScheduleModalOpen(false);
    refreshSchedules();
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-3">
            <Calendar className="w-6 h-6 text-sky-600" />
            <span>Programação da Igreja</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {currentChurch.name} • Cultos semanais e horários regulares
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              exportSchedulesToExcel(currentChurch, schedules);
              showToast('Programação semanal exportada em Excel com sucesso!', 'success');
            }}
            title="Baixar programação em planilha Excel"
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Baixar em Excel</span>
          </button>

          <button
            onClick={openNewScheduleModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-sky-600/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>+ Adicionar Culto / Horário</span>
          </button>
        </div>
      </div>

      {schedules.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 shadow-sm">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">Nenhum culto ou horário cadastrado</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Adicione os cultos de celebração, reuniões de oração e horários regulares da comunidade.
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
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-mono font-bold text-slate-700 flex items-center gap-1.5 mr-1">
                      <Clock className="w-3.5 h-3.5 text-sky-600" />
                      {s.time}
                    </span>
                    <button
                      onClick={() => openEditScheduleModal(s)}
                      className="p-1 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition-colors"
                      title="Editar Horário/Culto"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
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

            <h3 className="text-base font-bold text-slate-900 mb-4">
              {editingScheduleId ? 'Editar Programação' : 'Adicionar Programação Regular'}
            </h3>

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
                    <option value="Segunda-feira">Segunda-feira</option>
                    <option value="Terça-feira">Terça-feira</option>
                    <option value="Quarta-feira">Quarta-feira</option>
                    <option value="Quinta-feira">Quinta-feira</option>
                    <option value="Sexta-feira">Sexta-feira</option>
                    <option value="Sábado">Sábado</option>
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
                  placeholder="Ex: Templo Principal"
                  value={scheduleForm.location || ''}
                  onChange={e => setScheduleForm({ ...scheduleForm, location: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Responsável</label>
                <input
                  type="text"
                  placeholder="Ex: Pr. Presidente / Ministério de Louvor"
                  value={scheduleForm.responsible || ''}
                  onChange={e => setScheduleForm({ ...scheduleForm, responsible: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Recorrência</label>
                <select
                  value={scheduleForm.recurrence || 'semanal'}
                  onChange={e => setScheduleForm({ ...scheduleForm, recurrence: e.target.value as any })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-sky-500"
                >
                  <option value="semanal">Semanal</option>
                  <option value="quinzenal">Quinzenal</option>
                  <option value="mensal">Mensal</option>
                  <option value="personalizada">Personalizada</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Descrição</label>
                <textarea
                  rows={2}
                  placeholder="Observações sobre o culto..."
                  value={scheduleForm.description || ''}
                  onChange={e => setScheduleForm({ ...scheduleForm, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs outline-none focus:border-sky-500"
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
    </div>
  );
};
