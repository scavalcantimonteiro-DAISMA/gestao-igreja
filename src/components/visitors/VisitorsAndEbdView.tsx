import React, { useState } from 'react';
import { UserPlus, GraduationCap, Droplet, Plus, Phone, Calendar, CheckCircle2, MessageCircle, X, Save, Users, BookOpen, Trash2 } from 'lucide-react';
import { Visitor, BibleClass, BaptismRecord } from '../../types';
import { useChurch } from '../../context/ChurchContext';
import { useNotification } from '../../context/NotificationContext';
import { WhatsAppButton } from '../common/WhatsAppButton';
import { ConfirmModal } from '../common/ConfirmModal';
import { getVisitors, saveVisitor, deleteVisitor, getMessageTemplates, formatWhatsAppMessage, logAction } from '../../services/storage';

interface VisitorsAndEbdViewProps {
  initialTab?: 'visitors' | 'ebd' | 'baptisms';
}

export const VisitorsAndEbdView: React.FC<VisitorsAndEbdViewProps> = ({ initialTab = 'visitors' }) => {
  const { currentChurch } = useChurch();
  const { showToast } = useNotification();

  const [activeSubTab, setActiveSubTab] = useState<'visitors' | 'ebd' | 'baptisms'>(initialTab);
  const [visitors, setVisitors] = useState<Visitor[]>(() => getVisitors(currentChurch.id));
  const [isVisitorModalOpen, setIsVisitorModalOpen] = useState(false);
  const [visitorToDelete, setVisitorToDelete] = useState<Visitor | null>(null);


  const [visitorForm, setVisitorForm] = useState<Partial<Visitor>>({
    firstVisitDate: '2026-09-20',
    status: 'novo',
    touchpoints: []
  });

  const templates = getMessageTemplates(currentChurch.id);
  const visitorTemplate = templates.find(t => t.type === 'visitante')?.text || 
    'Olá, {nome}! Foi uma grande alegria receber você na {igreja}. Nossas portas estão abertas para você! 👋⛪';

  const refreshVisitors = () => {
    setVisitors(getVisitors(currentChurch.id));
  };

  const handleDeleteVisitorConfirm = () => {
    if (visitorToDelete) {
      deleteVisitor(visitorToDelete.id);
      logAction(currentChurch.id, 'Recepção CBA', 'SECRETARIA', 'Exclusão de Visitante', visitorToDelete.name);
      showToast('Visitante excluído com sucesso.', 'success');
      setVisitorToDelete(null);
      refreshVisitors();
    }
  };


  const handleSaveVisitor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitorForm.name?.trim() || !visitorForm.whatsapp?.trim()) {
      showToast('Nome e WhatsApp do visitante são obrigatórios.', 'error');
      return;
    }

    const saved: Visitor = {
      id: 'vis_' + Date.now(),
      churchId: currentChurch.id,
      name: visitorForm.name,
      whatsapp: visitorForm.whatsapp,
      firstVisitDate: visitorForm.firstVisitDate || '2026-09-20',
      howMetChurch: visitorForm.howMetChurch || 'Convite de membro',
      notes: visitorForm.notes || '',
      status: 'novo',
      touchpoints: [
        {
          date: new Date().toISOString().split('T')[0],
          type: '1º contato',
          channel: 'WhatsApp',
          notes: 'Visitante cadastrado no sistema.'
        }
      ],
      createdAt: new Date().toISOString()
    };

    saveVisitor(saved);
    logAction(currentChurch.id, 'Recepção CBA', 'SECRETARIA', 'Cadastro de Visitante', saved.name);
    showToast('Visitante cadastrado com sucesso!', 'success');
    setIsVisitorModalOpen(false);
    refreshVisitors();
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-3">
            {activeSubTab === 'visitors' && <UserPlus className="w-6 h-6 text-emerald-600" />}
            {activeSubTab === 'ebd' && <GraduationCap className="w-6 h-6 text-sky-600" />}
            {activeSubTab === 'baptisms' && <Droplet className="w-6 h-6 text-cyan-600" />}
            <span>
              {activeSubTab === 'visitors' && 'Visitantes & Acolhimento'}
              {activeSubTab === 'ebd' && 'Escola Bíblica Dominical (EBD)'}
              {activeSubTab === 'baptisms' && 'Batismos nas Águas'}
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {currentChurch.name} • Integração, discipulado e crescimento espiritual
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-100 border border-slate-200">
          <button
            onClick={() => setActiveSubTab('visitors')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'visitors' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Visitantes ({visitors.length})
          </button>
          <button
            onClick={() => setActiveSubTab('ebd')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'ebd' ? 'bg-white text-sky-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            EBD
          </button>
          <button
            onClick={() => setActiveSubTab('baptisms')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'baptisms' ? 'bg-white text-cyan-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Batismos
          </button>
        </div>
      </div>

      {/* SUB-ABA 1: VISITANTES */}
      {activeSubTab === 'visitors' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => {
                setVisitorForm({
                  firstVisitDate: '2026-09-20',
                  status: 'novo',
                  howMetChurch: 'Instagram @cbacolher'
                });
                setIsVisitorModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>+ Cadastrar Visitante</span>
            </button>
          </div>

          {visitors.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 shadow-sm">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-700">Nenhum visitante cadastrado ainda</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Utilize o botão acima "+ Cadastrar Visitante" para registrar visitantes e acolhê-los via WhatsApp.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {visitors.map(v => {
                const msg = formatWhatsAppMessage(visitorTemplate, {
                  nome: v.name,
                  igreja: currentChurch.name
                });

                return (
                  <div
                    key={v.id}
                    className="p-5 rounded-3xl bg-white border border-slate-200/90 hover:border-emerald-300 hover:shadow-md transition-all shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between pb-3 mb-3 border-b border-slate-100">
                        <div>
                          <h4 className="font-bold text-base text-slate-900">{v.name}</h4>
                          <span className="text-xs text-slate-500">
                            1ª Visita: {v.firstVisitDate.split('-').reverse().join('/')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 capitalize">
                            {v.status}
                          </span>
                          <button
                            onClick={() => setVisitorToDelete(v)}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Excluir Visitante"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1.5 text-xs text-slate-600">
                        <p><span className="text-slate-400 font-semibold">Como conheceu:</span> {v.howMetChurch}</p>
                        {v.notes && <p><span className="text-slate-400 font-semibold">Obs:</span> {v.notes}</p>}

                        {/* Funil de Contatos */}
                        <div className="mt-3 pt-2 border-t border-slate-100">
                          <span className="text-[11px] font-bold text-slate-500 block mb-1">
                            Acompanhamento de Contatos:
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                              1º Contato Feito
                            </span>
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-500 text-[10px]">
                              2º Contato
                            </span>
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-500 text-[10px]">
                              3º Contato
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <WhatsAppButton
                        phone={v.whatsapp}
                        message={msg}
                        label="Boas-vindas WhatsApp"
                        size="sm"
                      />

                      <button
                        onClick={() => {
                          const updated: Visitor = { ...v, status: 'tornou-se membro' };
                          saveVisitor(updated);
                          refreshVisitors();
                          showToast(`${v.name} marcado como novo membro!`, 'success');
                        }}
                        className="text-xs text-sky-600 hover:text-sky-700 font-semibold"
                      >
                        Converter em Membro
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SUB-ABA 2: EBD */}
      {activeSubTab === 'ebd' && (
        <div className="space-y-4">
          <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 shadow-sm">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-700">Escola Bíblica Dominical (EBD)</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Classes e turmas bíblicas da {currentChurch.name}. O acompanhamento de presença é habilitado aos domingos durante as aulas.
            </p>
          </div>
        </div>
      )}

      {/* SUB-ABA 3: BATISMOS */}
      {activeSubTab === 'baptisms' && (
        <div className="space-y-4">
          <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 shadow-sm">
            <Droplet className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-700">Batismo nas Águas</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Nenhum candidato em classe preparatória batismal cadastrado no momento. Novos convertidos e visitantes são integrados através do rol de membros.
            </p>
          </div>
        </div>
      )}

      {/* Modal Cadastrar Visitante */}
      {isVisitorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 text-slate-800">
            <button
              onClick={() => setIsVisitorModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900 mb-4">Cadastrar Visitante</h3>

            <form onSubmit={handleSaveVisitor} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Nome do visitante"
                  value={visitorForm.name || ''}
                  onChange={e => setVisitorForm({ ...visitorForm, name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">WhatsApp *</label>
                <input
                  type="text"
                  required
                  placeholder="(DDD) 99999-9999"
                  value={visitorForm.whatsapp || ''}
                  onChange={e => setVisitorForm({ ...visitorForm, whatsapp: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Como Conheceu a Igreja?</label>
                <input
                  type="text"
                  placeholder="Ex: Instagram, Convite de amigos, Passou em frente..."
                  value={visitorForm.howMetChurch || ''}
                  onChange={e => setVisitorForm({ ...visitorForm, howMetChurch: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Observações</label>
                <textarea
                  rows={2}
                  value={visitorForm.notes || ''}
                  onChange={e => setVisitorForm({ ...visitorForm, notes: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsVisitorModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm"
                >
                  Salvar Visitante
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {visitorToDelete && (
        <ConfirmModal
          isOpen={true}
          title="Excluir Visitante"
          message={`Tem certeza que deseja remover o cadastro do visitante "${visitorToDelete.name}"? Esta ação não pode ser desfeita.`}
          confirmLabel="Excluir"
          confirmVariant="danger"
          onConfirm={handleDeleteVisitorConfirm}
          onCancel={() => setVisitorToDelete(null)}
        />
      )}
    </div>
  );
};

