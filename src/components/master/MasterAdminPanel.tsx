import React, { useState } from 'react';
import { Globe, Plus, Building2, ShieldCheck, CheckCircle2, ArrowRight, ExternalLink, X, Save, Trash2 } from 'lucide-react';
import { Church } from '../../types';
import { useChurch } from '../../context/ChurchContext';
import { useNotification } from '../../context/NotificationContext';
import { SauloBrandBadge } from '../common/SauloBrandBadge';
import { ConfirmModal } from '../common/ConfirmModal';

export const MasterAdminPanel: React.FC = () => {
  const { allChurches, currentChurch, selectChurch, registerNewChurch, removeChurch } = useChurch();
  const { showToast } = useNotification();

  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [churchToDelete, setChurchToDelete] = useState<Church | null>(null);
  const [newChurchData, setNewChurchData] = useState<Partial<Church>>({
    name: '',
    slug: '',
    address: '',
    city: 'Maceió',
    state: 'AL',
    instagram: '',
    phone: '',
    whatsapp: '',
    pastorName: '',
    pastorPhone: '',
    pastorWhatsapp: '',
    dailyReportHour: '08:00',
    financialPin: '0000',
    financialPinChanged: false,
    isActive: true
  });


  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChurchData.name?.trim()) {
      showToast('Nome da igreja é obrigatório.', 'error');
      return;
    }

    const slug = (newChurchData.slug || newChurchData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));

    const created = registerNewChurch({
      name: newChurchData.name,
      slug,
      address: newChurchData.address || 'Endereço a definir',
      city: newChurchData.city || 'Maceió',
      state: newChurchData.state || 'AL',
      instagram: newChurchData.instagram || '@igreja',
      phone: newChurchData.phone || '(82) 99999-9999',
      whatsapp: newChurchData.whatsapp || '5582999999999',
      pastorName: newChurchData.pastorName || 'Pastor Titular',
      pastorPhone: newChurchData.pastorPhone || '',
      pastorWhatsapp: newChurchData.pastorWhatsapp || newChurchData.whatsapp || '',
      dailyReportHour: newChurchData.dailyReportHour || '08:00',
      financialPin: '0000',
      financialPinChanged: false,
      isActive: true
    });

    showToast(`Igreja "${created.name}" cadastrada na plataforma SaaS com sucesso!`, 'success');
    setIsRegisterOpen(false);
  };

  const handleDeleteChurchConfirm = () => {
    if (churchToDelete) {
      if (allChurches.length <= 1) {
        showToast('Não é possível excluir a única igreja cadastrada no sistema.', 'error');
        setChurchToDelete(null);
        return;
      }
      removeChurch(churchToDelete.id);
      showToast(`Igreja "${churchToDelete.name}" removida com sucesso.`, 'success');
      setChurchToDelete(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Banner Master Saulo Monteiro */}
      <SauloBrandBadge />

      {/* Topo de Métricas SaaS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm">
          <span className="text-xs font-bold text-sky-700 uppercase tracking-wider">Plataforma Multi-Tenant</span>
          <h3 className="text-3xl font-black text-slate-900 mt-1">{allChurches.length}</h3>
          <p className="text-xs text-slate-500 mt-1">Igrejas cadastradas no SaaS</p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm">
          <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Ambiente Atual</span>
          <h3 className="text-xl font-black text-slate-900 mt-1 truncate">{currentChurch.name}</h3>
          <p className="text-xs text-slate-500 mt-1">{currentChurch.city} - {currentChurch.state}</p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm">
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Acesso Master</span>
          <h3 className="text-xl font-black text-slate-900 mt-1">Senha: 160605</h3>
          <p className="text-xs text-slate-500 mt-1">Controle total exclusivo de Saulo Monteiro</p>
        </div>
      </div>

      {/* Lista de Congregações Cadastradas */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 mb-6 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Globe className="w-5 h-5 text-sky-600" />
              Gestão de Igrejas na Plataforma (SaaS)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Cada igreja opera de forma 100% isolada e segura. Você pode alternar e gerenciar qualquer uma.
            </p>
          </div>

          <button
            onClick={() => {
              setNewChurchData({
                name: '',
                slug: '',
                address: '',
                city: 'Maceió',
                state: 'AL',
                instagram: '',
                phone: '',
                whatsapp: '',
                pastorName: '',
                pastorWhatsapp: '',
                dailyReportHour: '08:00',
                isActive: true
              });
              setIsRegisterOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-sky-500/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Cadastrar Nova Igreja</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {allChurches.map(c => {
            const isSelected = c.id === currentChurch.id;

            return (
              <div
                key={c.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-sky-50/70 border-sky-300 shadow-md shadow-sky-500/10'
                    : 'bg-slate-50/80 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-sky-100 border border-sky-200 flex items-center justify-center font-black text-sky-700 text-base">
                        {c.name[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-base text-slate-900">{c.name}</h4>
                          {isSelected && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-sky-100 text-sky-800 border border-sky-200">
                              Ativa no Painel
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500">{c.city} - {c.state} • {c.instagram}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-200/80 text-xs text-slate-700 space-y-1">
                    <p><span className="text-slate-500 font-medium">Endereço:</span> {c.address}</p>
                    <p><span className="text-slate-500 font-medium">Pastor Titular:</span> {c.pastorName}</p>
                    <p><span className="text-slate-500 font-medium">WhatsApp:</span> {c.whatsapp}</p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between">
                  <div>
                    {!isSelected && allChurches.length > 1 && (
                      <button
                        onClick={() => setChurchToDelete(c)}
                        className="p-1.5 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                        title={`Excluir ${c.name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {!isSelected ? (
                      <button
                        onClick={() => {
                          selectChurch(c.id);
                          showToast(`Conectado à ${c.name}!`, 'success');
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-sky-700 border border-slate-200 text-xs font-semibold shadow-sm transition-colors"
                      >
                        <span>Abrir Painel desta Igreja</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <span className="text-xs text-sky-700 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-sky-600" />
                        Visualizando agora
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal de Cadastro de Nova Igreja */}
      {isRegisterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 text-slate-800 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsRegisterOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 border border-sky-200 flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Cadastrar Nova Igreja (SaaS)</h3>
                <p className="text-xs text-slate-500">Apenas o Master Admin Saulo Monteiro pode adicionar</p>
              </div>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nome da Congregação / Igreja *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Igreja Batista Renovada"
                  value={newChurchData.name || ''}
                  onChange={e => setNewChurchData({ ...newChurchData, name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-sky-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Endereço Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Rua / Avenida, número, bairro"
                  value={newChurchData.address || ''}
                  onChange={e => setNewChurchData({ ...newChurchData, address: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-sky-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Cidade</label>
                  <input
                    type="text"
                    value={newChurchData.city || 'Maceió'}
                    onChange={e => setNewChurchData({ ...newChurchData, city: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-sky-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Estado (UF)</label>
                  <input
                    type="text"
                    maxLength={2}
                    value={newChurchData.state || 'AL'}
                    onChange={e => setNewChurchData({ ...newChurchData, state: e.target.value.toUpperCase() })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-sky-500 uppercase transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Instagram</label>
                  <input
                    type="text"
                    placeholder="@igreja"
                    value={newChurchData.instagram || ''}
                    onChange={e => setNewChurchData({ ...newChurchData, instagram: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-sky-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">WhatsApp da Igreja</label>
                  <input
                    type="text"
                    placeholder="(82) 99999-9999"
                    value={newChurchData.whatsapp || ''}
                    onChange={e => setNewChurchData({ ...newChurchData, whatsapp: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-sky-500 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Pastor Responsável</label>
                  <input
                    type="text"
                    placeholder="Nome do pastor"
                    value={newChurchData.pastorName || ''}
                    onChange={e => setNewChurchData({ ...newChurchData, pastorName: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-sky-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">WhatsApp do Pastor</label>
                  <input
                    type="text"
                    placeholder="(82) 99999-9999"
                    value={newChurchData.pastorWhatsapp || ''}
                    onChange={e => setNewChurchData({ ...newChurchData, pastorWhatsapp: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-sky-500 transition-colors"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsRegisterOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-sky-500/20 transition-all"
                >
                  <Save className="w-4 h-4" />
                  Cadastrar Igreja
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {churchToDelete && (
        <ConfirmModal
          isOpen={true}
          title="Excluir Igreja da Plataforma"
          message={`Tem certeza que deseja remover a igreja "${churchToDelete.name}" da plataforma SaaS? Esta ação removerá a igreja e suas configurações locais.`}
          confirmLabel="Excluir Igreja"
          confirmVariant="danger"
          onConfirm={handleDeleteChurchConfirm}
          onCancel={() => setChurchToDelete(null)}
        />
      )}
    </div>
  );
};

