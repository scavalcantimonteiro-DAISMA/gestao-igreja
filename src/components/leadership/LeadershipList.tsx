import React, { useState } from 'react';
import { ShieldAlert, Plus, Phone, Mail, Calendar, X, Save, Edit2, Trash2, FileSpreadsheet } from 'lucide-react';
import { Leadership } from '../../types';
import { useChurch, useDataSync } from '../../context/ChurchContext';
import { useNotification } from '../../context/NotificationContext';
import { WhatsAppButton } from '../common/WhatsAppButton';
import { ConfirmModal } from '../common/ConfirmModal';
import { getLeadership, saveLeadership, deleteLeadership, logAction } from '../../services/storage';
import { exportLeadershipToExcel } from '../../services/excelBackup';

export const LeadershipList: React.FC = () => {
  const { currentChurch } = useChurch();
  const { showToast } = useNotification();

  const [leaders, setLeaders] = useState<Leadership[]>(() => getLeadership(currentChurch.id));
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [leaderToEdit, setLeaderToEdit] = useState<Leadership | null>(null);
  const [leaderToDelete, setLeaderToDelete] = useState<Leadership | null>(null);

  const [formData, setFormData] = useState<Partial<Leadership>>({
    role: 'Diácono'
  });

  const refreshList = () => {
    setLeaders(getLeadership(currentChurch.id));
  };

  useDataSync(refreshList, [currentChurch.id]);

  const handleOpenForm = (lead?: Leadership) => {
    if (lead) {
      setLeaderToEdit(lead);
      setFormData(lead);
    } else {
      setLeaderToEdit(null);
      setFormData({
        churchId: currentChurch.id,
        name: '',
        role: 'Diácono',
        whatsapp: '',
        email: '',
        ministry: '',
        startDate: '2026-01-01',
        observations: ''
      });
    }
    setIsFormOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim() || !formData.role?.trim()) {
      showToast('Nome e Função são obrigatórios.', 'error');
      return;
    }

    const saved: Leadership = {
      ...formData,
      id: leaderToEdit?.id || 'lead_' + Date.now(),
      churchId: currentChurch.id,
      name: formData.name!,
      role: formData.role!,
      whatsapp: formData.whatsapp || '',
      createdAt: leaderToEdit?.createdAt || new Date().toISOString()
    };

    saveLeadership(saved);
    logAction(currentChurch.id, 'Administrador', 'ADMIN', leaderToEdit ? 'Edição de Liderança' : 'Novo Líder Cadastrado', saved.name);
    showToast('Liderança atualizada com sucesso!', 'success');
    setIsFormOpen(false);
    refreshList();
  };

  const handleDeleteConfirm = () => {
    if (leaderToDelete) {
      deleteLeadership(leaderToDelete.id);
      showToast('Líder removido da lista.', 'success');
      setLeaderToDelete(null);
      refreshList();
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-3">
            <ShieldAlert className="w-6 h-6 text-sky-600" />
            <span>Corpo de Liderança</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {currentChurch.name} • Pastores, ministros, presbíteros, diáconos e líderes
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              exportLeadershipToExcel(currentChurch, leaders);
              showToast('Liderança exportada em Excel com sucesso!', 'success');
            }}
            title="Baixar lista em planilha Excel"
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Baixar em Excel</span>
          </button>

          <button
            onClick={() => handleOpenForm()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-sky-500/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Cadastrar Líder</span>
          </button>
        </div>
      </div>

      {leaders.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 shadow-sm">
          <ShieldAlert className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">Nenhum líder cadastrado</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Utilize o botão acima "+ Cadastrar Líder" para cadastrar pastores, presbíteros, diáconos e líderes ministeriais.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {leaders.map(lead => (
            <div
              key={lead.id}
              className="p-5 rounded-3xl bg-white border border-slate-200/90 hover:border-sky-300 hover:shadow-md transition-all shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 pb-3 mb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl overflow-hidden bg-sky-50 border border-sky-100 shrink-0 flex items-center justify-center font-bold text-sky-600 text-base">
                      {lead.photoUrl ? (
                        <img src={lead.photoUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        lead.name[0]
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm sm:text-base text-slate-900">{lead.name}</h4>
                      <span className="inline-block text-[11px] font-bold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-md mt-0.5 border border-sky-200">
                        {lead.role}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600">
                  {lead.ministry && (
                    <p className="text-slate-600">
                      <span className="font-semibold text-slate-700">Ministério:</span> {lead.ministry}
                    </p>
                  )}

                  {lead.startDate && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Início do mandato: {lead.startDate.split('-').reverse().join('/')}</span>
                    </div>
                  )}

                  {lead.observations && (
                    <p className="text-slate-500 italic text-[11px] pt-1">
                      "{lead.observations}"
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <WhatsAppButton
                  phone={lead.whatsapp}
                  message={`Olá, ${lead.name}! Comunicação da coordenação da ${currentChurch.name}.`}
                  label="WhatsApp"
                  size="sm"
                  variant="outline"
                  showCopyOption={false}
                />

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenForm(lead)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-sky-50 text-slate-600 hover:text-sky-600 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setLeaderToDelete(lead)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Formulário Líder */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 text-slate-800">
            <button
              onClick={() => setIsFormOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900 mb-4">
              {leaderToEdit ? 'Editar Líder' : 'Novo Membro da Liderança'}
            </h3>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Nome do líder"
                  value={formData.name || ''}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Função / Cargo *</label>
                <select
                  value={formData.role || 'Diácono'}
                  onChange={e => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-sky-500"
                >
                  <option value="Pastor Presidente">Pastor Presidente</option>
                  <option value="Pastor Auxiliar">Pastor Auxiliar</option>
                  <option value="Ministro">Ministro</option>
                  <option value="Ministro de Música">Ministro de Música</option>
                  <option value="Presbítero">Presbítero</option>
                  <option value="Diácono">Diácono</option>
                  <option value="Diaconisa">Diaconisa</option>
                  <option value="Líder de Ministério">Líder de Ministério</option>
                  <option value="Coordenador">Coordenador</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">WhatsApp</label>
                  <input
                    type="text"
                    placeholder="(82) 99999-9999"
                    value={formData.whatsapp || ''}
                    onChange={e => setFormData({ ...formData, whatsapp: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Ministério</label>
                  <input
                    type="text"
                    placeholder="Ex: Louvor, Jovens"
                    value={formData.ministry || ''}
                    onChange={e => setFormData({ ...formData, ministry: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Observações</label>
                <textarea
                  rows={2}
                  value={formData.observations || ''}
                  onChange={e => setFormData({ ...formData, observations: e.target.value })}
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
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  Salvar Líder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmação de Exclusão */}
      <ConfirmModal
        isOpen={!!leaderToDelete}
        title="Remover da Liderança"
        message={`Deseja realmente remover ${leaderToDelete?.name} da liderança?`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setLeaderToDelete(null)}
      />
    </div>
  );
};
