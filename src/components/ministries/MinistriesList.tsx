import React, { useState } from 'react';
import { Church as ChurchIcon, Plus, Users, Calendar, MapPin, X, Save, Trash2, Heart, MessageCircle } from 'lucide-react';
import { Ministry } from '../../types';

import { useChurch } from '../../context/ChurchContext';
import { useNotification } from '../../context/NotificationContext';
import { ConfirmModal } from '../common/ConfirmModal';
import { getMinistries, saveMinistry, deleteMinistry, logAction } from '../../services/storage';

export const MinistriesList: React.FC = () => {
  const { currentChurch } = useChurch();
  const { showToast } = useNotification();

  const [ministries, setMinistries] = useState<Ministry[]>(() => getMinistries(currentChurch.id));
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [ministryToDelete, setMinistryToDelete] = useState<Ministry | null>(null);
  const [formData, setFormData] = useState<Partial<Ministry>>({
    membersCount: 5,
    members: []
  });

  const handleShareScale = (m: Ministry) => {
    let text = `*ESCALA & COMUNICAÇÃO DE MINISTÉRIO*\\n`;
    text += `*${currentChurch.name.toUpperCase()}*\\n`;
    text += `*Ministério:* ${m.name}\\n`;
    text += `*Líder Responsável:* ${m.leaderName}${m.viceLeaderName ? ` / ${m.viceLeaderName}` : ''}\\n`;
    if (m.meetingDay || m.meetingTime) {
      text += `*Horário/Encontro:* ${m.meetingDay || 'Conforme escala'} às ${m.meetingTime || '18:30'}\\n`;
    }
    if (m.location) {
      text += `*Local:* ${m.location}\\n`;
    }
    text += `\\n👥 *EQUIPE ESCALADA / INTEGRANTES ATIVOS (${m.members.length}):*\\n`;
    m.members.forEach((name, idx) => {
      text += `${idx + 1}. ${name}\\n`;
    });
    if (m.volunteers && m.volunteers.length > 0) {
      text += `\\n🌱 *Voluntários:* ${m.volunteers.join(', ')}\\n`;
    }
    text += `\\n"A chama que nos move é o amor! ❤️‍🔥"\\n_Coordenação Geral CBAcolher_`;

    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    showToast(`Abrindo WhatsApp com escala de ${m.name}...`, 'info');
  };

  const refreshList = () => {
    setMinistries(getMinistries(currentChurch.id));
  };

  const handleDeleteConfirm = () => {
    if (ministryToDelete) {
      deleteMinistry(ministryToDelete.id);
      logAction(currentChurch.id, 'Administrador', 'ADMIN', 'Exclusão de Ministério', ministryToDelete.name);
      showToast('Ministério excluído com sucesso.', 'success');
      setMinistryToDelete(null);
      refreshList();
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim() || !formData.leaderName?.trim()) {
      showToast('Nome do ministério e Líder são obrigatórios.', 'error');
      return;
    }

    const saved: Ministry = {
      id: 'min_' + Date.now(),
      churchId: currentChurch.id,
      name: formData.name,
      leaderName: formData.leaderName,
      viceLeaderName: formData.viceLeaderName,
      meetingDay: formData.meetingDay || 'Sábado',
      meetingTime: formData.meetingTime || '16:00',
      location: formData.location || 'Templo da CBA',
      description: formData.description || '',
      membersCount: formData.membersCount || 1,
      members: formData.members || [formData.leaderName],
      createdAt: new Date().toISOString()
    };

    saveMinistry(saved);
    logAction(currentChurch.id, 'Administrador', 'ADMIN', 'Criação de Ministério', saved.name);
    showToast('Ministério criado com sucesso!', 'success');
    setIsFormOpen(false);
    refreshList();
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-3">
            <ChurchIcon className="w-6 h-6 text-sky-600" />
            <span>Ministérios & Departamentos</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {currentChurch.name} • Departamentos, equipes de serviço e voluntários
          </p>
        </div>

        <button
          onClick={() => {
            setFormData({
              churchId: currentChurch.id,
              name: '',
              leaderName: '',
              viceLeaderName: '',
              meetingDay: 'Sábado',
              meetingTime: '16:00',
              location: 'Templo Principal',
              description: '',
              membersCount: 6,
              members: []
            });
            setIsFormOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-sky-500/20 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>+ Novo Ministério</span>
        </button>
      </div>

      {ministries.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 shadow-sm">
          <ChurchIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">Nenhum ministério cadastrado</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Clique no botão acima "+ Novo Ministério" para estruturar equipes de louvor, infantil, mídia, acolhimento e outros.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {ministries.map(m => (
            <div
              key={m.id}
              className="p-6 rounded-3xl bg-white border border-slate-200/90 hover:border-sky-300 hover:shadow-md transition-all shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between pb-3 mb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 border border-sky-200 flex items-center justify-center font-bold">
                      <ChurchIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-slate-900">{m.name}</h3>
                      <p className="text-xs text-sky-600 font-semibold">
                        Líder: {m.leaderName} {m.viceLeaderName && `• Vice: ${m.viceLeaderName}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      {m.membersCount} voluntários
                    </span>
                    <button
                      onClick={() => setMinistryToDelete(m)}
                      title="Excluir Ministério"
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-600">
                  {m.meetingDay && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Encontros: {m.meetingDay} às {m.meetingTime}</span>
                    </div>
                  )}

                  {m.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{m.location}</span>
                    </div>
                  )}

                  {m.description && (
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                      {m.description}
                    </p>
                  )}

                  {/* Equipe em Atividade */}
                  {m.members && m.members.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5 mb-2">
                        <Users className="w-3.5 h-3.5 text-sky-600" />
                        Equipe Ativa ({m.members.length} membros servindo):
                      </span>
                      <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                        {m.members.map((memberName, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-2.5 py-1 rounded-xl bg-sky-50 text-sky-800 border border-sky-200/80 text-[11px] font-medium shadow-xs"
                          >
                            {memberName}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Desejam Servir / Banco de Voluntários */}
                  {m.volunteers && m.volunteers.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-100 bg-amber-50/50 p-3 rounded-2xl border border-amber-200/60">
                      <span className="font-bold text-amber-900 text-xs flex items-center gap-1.5 mb-2">
                        <Heart className="w-3.5 h-3.5 text-amber-600" />
                        Manifestaram Desejo de Servir ({m.volunteers.length}):
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {m.volunteers.map((volName, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-2 py-0.5 rounded-lg bg-white/90 text-amber-900 border border-amber-200 text-[10px] font-semibold"
                          >
                            {volName}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handleShareScale(m)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm shadow-emerald-600/20 active:scale-95 transition-all"
                  >
                    <MessageCircle className="w-3.5 h-3.5 fill-current" />
                    <span>Disparar Escala no WhatsApp</span>
                  </button>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {m.members.length} membros
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Novo Ministério */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 text-slate-800">
            <button
              onClick={() => setIsFormOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900 mb-4">Cadastrar Novo Ministério</h3>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nome do Ministério *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Ministério de Ação Social"
                  value={formData.name || ''}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Líder *</label>
                  <input
                    type="text"
                    required
                    placeholder="Nome do líder"
                    value={formData.leaderName || ''}
                    onChange={e => setFormData({ ...formData, leaderName: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Vice-líder</label>
                  <input
                    type="text"
                    placeholder="Nome do vice"
                    value={formData.viceLeaderName || ''}
                    onChange={e => setFormData({ ...formData, viceLeaderName: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Dia de Reunião</label>
                  <input
                    type="text"
                    placeholder="Ex: Sábado"
                    value={formData.meetingDay || ''}
                    onChange={e => setFormData({ ...formData, meetingDay: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Horário</label>
                  <input
                    type="text"
                    placeholder="Ex: 16:00"
                    value={formData.meetingTime || ''}
                    onChange={e => setFormData({ ...formData, meetingTime: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Descrição e Finalidade</label>
                <textarea
                  rows={2}
                  value={formData.description || ''}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-sky-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-sm"
                >
                  Salvar Ministério
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {ministryToDelete && (
        <ConfirmModal
          isOpen={true}
          title="Excluir Ministério"
          message={`Tem certeza que deseja remover o ministério "${ministryToDelete.name}"? Esta ação não pode ser desfeita.`}
          confirmLabel="Excluir"
          confirmVariant="danger"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setMinistryToDelete(null)}
        />
      )}
    </div>
  );
};

