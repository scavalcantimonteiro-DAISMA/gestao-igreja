import React, { useState } from 'react';
import { HeartHandshake, Plus, Users, User, Baby, Heart, MapPin, X, Save, Sparkles, Trash2 } from 'lucide-react';
import { Family, Member, Child } from '../../types';
import { useChurch } from '../../context/ChurchContext';
import { useNotification } from '../../context/NotificationContext';
import { WhatsAppButton } from '../common/WhatsAppButton';
import { ConfirmModal } from '../common/ConfirmModal';
import { 
  getFamilies, 
  saveFamily, 
  deleteFamily,
  getMembers, 
  getChildren, 
  getWeddingAnniversaries,
  getMessageTemplates,
  formatWhatsAppMessage 
} from '../../services/storage';

export const FamilyList: React.FC = () => {
  const { currentChurch } = useChurch();
  const { showToast } = useNotification();

  const [families, setFamilies] = useState<Family[]>(() => getFamilies(currentChurch.id));
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedFamilyTree, setSelectedFamilyTree] = useState<Family | null>(null);
  const [familyToDelete, setFamilyToDelete] = useState<Family | null>(null);

  const members = getMembers(currentChurch.id);
  const children = getChildren(currentChurch.id);
  const { today: weddingsToday, upcoming: weddingsUpcoming } = getWeddingAnniversaries(currentChurch.id);

  const [formData, setFormData] = useState<Partial<Family>>({
    familyName: '',
    fatherName: '',
    motherName: '',
    children: [],
    address: '',
    notes: ''
  });

  const templates = getMessageTemplates(currentChurch.id);
  const weddingTemplate = templates.find(t => t.type === 'aniversario_casamento')?.text || 
    'Olá! Hoje celebramos com vocês mais um ano de casamento abençoado por Deus ({anos_casamento} anos!). "A chama que nos move é o amor". Parabéns! 💍✨';

  const refreshList = () => {
    setFamilies(getFamilies(currentChurch.id));
  };

  const handleOpenNewFamily = () => {
    setFormData({
      churchId: currentChurch.id,
      familyName: '',
      fatherName: '',
      motherName: '',
      children: [],
      address: '',
      notes: ''
    });
    setIsFormOpen(true);
  };

  const handleSaveFamily = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.familyName?.trim()) {
      showToast('Informe o nome da família.', 'error');
      return;
    }

    const saved: Family = {
      id: 'fam_' + Date.now(),
      churchId: currentChurch.id,
      familyName: formData.familyName,
      fatherName: formData.fatherName,
      motherName: formData.motherName,
      children: formData.children || [],
      address: formData.address,
      notes: formData.notes,
      createdAt: new Date().toISOString()
    };

    saveFamily(saved);
    showToast('Família cadastrada com sucesso!', 'success');
    setIsFormOpen(false);
    refreshList();
  };

  const handleDeleteConfirm = () => {
    if (familyToDelete) {
      deleteFamily(familyToDelete.id);
      showToast('Família excluída com sucesso!', 'success');
      setFamilyToDelete(null);
      refreshList();
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Topo do Módulo */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-3">
            <HeartHandshake className="w-6 h-6 text-pink-600" />
            <span>Famílias & Casamentos</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {currentChurch.name} • Gestão familiar e acompanhamento matrimonial
          </p>
        </div>

        <button
          onClick={handleOpenNewFamily}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-pink-500/20 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>+ Cadastrar Família</span>
        </button>
      </div>

      {/* Destaque de Casamentos e Bodas do Mês */}
      <div className="p-6 rounded-3xl bg-white border border-pink-100 shadow-sm">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <Heart className="w-5 h-5 text-pink-500" />
            <h3 className="font-bold text-sm sm:text-base text-slate-900">Aniversários de Casamento em Destaque</h3>
          </div>
          <span className="text-xs font-semibold text-pink-600 bg-pink-50 px-3 py-1 rounded-full border border-pink-200">
            {weddingsToday.length} Hoje • {weddingsUpcoming.length} Próximos
          </span>
        </div>

        {weddingsToday.length === 0 && weddingsUpcoming.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">
            Nenhuma comemoração de casamento registrada para os próximos dias.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {weddingsToday.map(w => {
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
                  className="p-4 rounded-2xl bg-pink-50/60 border border-pink-200 flex flex-col justify-between shadow-sm"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase text-pink-600 tracking-wider">Bodas Hoje!</span>
                      <span className="text-lg">💍</span>
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 mt-1">{w.coupleName}</h4>
                    <p className="text-xs text-pink-700 font-medium">{w.yearsMarried} anos de casamento</p>
                  </div>

                  <div className="mt-4 pt-2 border-t border-pink-100">
                    <WhatsAppButton
                      phone={w.whatsapp}
                      message={message}
                      label="Enviar Bênção"
                      size="sm"
                    />
                  </div>
                </div>
              );
            })}

            {weddingsUpcoming.map(w => (
              <div 
                key={w.id} 
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between"
              >
                <div>
                  <span className="text-[10px] font-bold text-slate-400">{w.formattedDate}</span>
                  <h4 className="font-semibold text-xs text-slate-800">{w.coupleName}</h4>
                  <p className="text-[11px] text-pink-600 font-medium">{w.yearsMarried} anos</p>
                </div>
                <span className="text-xs text-slate-500 font-medium">em {w.daysRemaining} dias</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Grid de Famílias Cadastradas ou Estado Vazio */}
      {families.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 shadow-sm">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">Nenhum núcleo familiar cadastrado ainda</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Utilize o botão acima "+ Cadastrar Família" para estruturar lares e árvores genealógicas da igreja.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {families.map(fam => (
          <div
            key={fam.id}
            className="p-6 rounded-3xl bg-white border border-slate-200/90 hover:border-sky-300 hover:shadow-md transition-all shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 border border-sky-200 flex items-center justify-center font-bold text-sm">
                    👨‍👩‍👧
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900">{fam.familyName}</h3>
                    <p className="text-xs text-slate-500">{fam.address || 'Maceió - AL'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setSelectedFamilyTree(fam)}
                    className="text-xs text-sky-600 hover:text-sky-700 font-semibold px-2.5 py-1 rounded-lg bg-sky-50 border border-sky-200 hover:bg-sky-100 transition-colors"
                  >
                    Árvore Familiar
                  </button>
                  <button
                    onClick={() => setFamilyToDelete(fam)}
                    title="Excluir Família"
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Estrutura da Família em Linha */}
              <div className="space-y-2 text-xs">
                {fam.fatherName && (
                  <div className="flex items-center gap-2 text-slate-700">
                    <User className="w-4 h-4 text-sky-600 shrink-0" />
                    <span className="font-bold text-slate-400">Pai:</span>
                    <span>{fam.fatherName}</span>
                  </div>
                )}

                {fam.motherName && (
                  <div className="flex items-center gap-2 text-slate-700">
                    <User className="w-4 h-4 text-pink-600 shrink-0" />
                    <span className="font-bold text-slate-400">Mãe:</span>
                    <span>{fam.motherName}</span>
                  </div>
                )}

                <div className="pt-2">
                  <span className="font-bold text-slate-400 block mb-1">Filhos ({fam.children.length}):</span>
                  <div className="flex flex-wrap gap-1.5">
                    {fam.children.map(ch => (
                      <span
                        key={ch.id}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium"
                      >
                        <Baby className="w-3 h-3 text-sky-600" />
                        {ch.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {fam.notes && (
              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
                <span className="font-semibold text-slate-700">Obs:</span> {fam.notes}
              </div>
            )}
          </div>
        ))}
      </div>
      )}

      {/* Modal da Árvore Familiar (Item 17 do Prompt) */}
      {selectedFamilyTree && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 text-slate-800">
            <button
              onClick={() => setSelectedFamilyTree(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 border border-sky-200 flex items-center justify-center font-bold text-lg">
                👨‍👩‍👧
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">{selectedFamilyTree.familyName}</h3>
                <p className="text-xs text-sky-600 font-medium">Estrutura e Árvore Familiar</p>
              </div>
            </div>

            {/* Visualização de Árvore Familiar Hierárquica */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 font-mono text-xs text-slate-800 leading-relaxed shadow-inner">
              <div className="flex items-center gap-2 text-sky-700 font-bold">
                <span>👨 Pai:</span>
                <span className="text-slate-900">{selectedFamilyTree.fatherName || 'Não informado'}</span>
              </div>
              <div className="text-slate-400 pl-2">│</div>
              <div className="flex items-center gap-2 text-pink-700 font-bold">
                <span>👩 Mãe:</span>
                <span className="text-slate-900">{selectedFamilyTree.motherName || 'Não informada'}</span>
              </div>
              <div className="text-slate-400 pl-2">│</div>

              {selectedFamilyTree.children.map((ch, idx) => {
                const isLast = idx === selectedFamilyTree.children.length - 1;
                return (
                  <div key={ch.id} className="flex items-center gap-2 text-slate-700">
                    <span className="text-slate-400">{isLast ? '└──' : '├──'}</span>
                    <span className="text-amber-600 font-bold">👶 Filho(a):</span>
                    <span className="text-slate-900 font-semibold">{ch.name}</span>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedFamilyTree(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Cadastro de Família */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 text-slate-800">
            <button
              onClick={() => setIsFormOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900 mb-4">Nova Família Eclesiástica</h3>

            <form onSubmit={handleSaveFamily} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nome da Família *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Família Silva"
                  value={formData.familyName || ''}
                  onChange={e => setFormData({ ...formData, familyName: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-pink-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nome do Pai</label>
                <input
                  type="text"
                  placeholder="Nome completo do pai"
                  value={formData.fatherName || ''}
                  onChange={e => setFormData({ ...formData, fatherName: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-pink-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nome da Mãe</label>
                <input
                  type="text"
                  placeholder="Nome completo da mãe"
                  value={formData.motherName || ''}
                  onChange={e => setFormData({ ...formData, motherName: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-pink-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Endereço da Família</label>
                <input
                  type="text"
                  placeholder="Rua, número, bairro..."
                  value={formData.address || ''}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-pink-500"
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
                  className="px-5 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  Salvar Família
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmModal
        isOpen={!!familyToDelete}
        title="Excluir Família"
        message={`Tem certeza que deseja excluir o cadastro da ${familyToDelete?.familyName}? Os membros e crianças vinculados permanecerão no sistema.`}
        confirmLabel="Sim, excluir"
        isDanger={true}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setFamilyToDelete(null)}
      />
    </div>
  );
};
