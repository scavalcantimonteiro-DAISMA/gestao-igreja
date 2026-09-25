import React, { useState } from 'react';
import { 
  HeartHandshake, 
  Plus, 
  Users, 
  User, 
  Baby, 
  Heart, 
  MapPin, 
  X, 
  Save, 
  Trash2, 
  Edit3, 
  Calendar, 
  Phone 
} from 'lucide-react';
import { Family, FamilyChild, Member, Child } from '../../types';
import { useChurch, useDataSync } from '../../context/ChurchContext';
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
  formatWhatsAppMessage,
  logAction 
} from '../../services/storage';
import { exportFamiliesToExcel } from '../../services/excelBackup';
import { FileSpreadsheet } from 'lucide-react';

export const FamilyList: React.FC = () => {
  const { currentChurch } = useChurch();
  const { showToast } = useNotification();

  const [families, setFamilies] = useState<Family[]>(() => getFamilies(currentChurch.id));
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingFamilyId, setEditingFamilyId] = useState<string | null>(null);
  const [selectedFamilyTree, setSelectedFamilyTree] = useState<Family | null>(null);
  const [familyToDelete, setFamilyToDelete] = useState<Family | null>(null);

  const { today: weddingsToday, upcoming: weddingsUpcoming } = getWeddingAnniversaries(currentChurch.id);

  const [formData, setFormData] = useState<Partial<Family>>({
    familyName: '',
    fatherName: '',
    motherName: '',
    weddingDate: '',
    whatsapp: '',
    hasChildren: false,
    children: [],
    address: '',
    notes: ''
  });

  const [newChildData, setNewChildData] = useState<{
    name: string;
    birthDate: string;
    age: string;
    phone: string;
    gender: 'M' | 'F';
  }>({
    name: '',
    birthDate: '',
    age: '',
    phone: '',
    gender: 'M'
  });

  const templates = getMessageTemplates(currentChurch.id);
  const weddingTemplate = templates.find(t => t.type === 'aniversario_casamento')?.text || 
    'Olá! Hoje celebramos com vocês mais um ano de casamento abençoado por Deus ({anos_casamento} anos!). Parabéns! 💍✨';

  const refreshList = () => {
    setFamilies(getFamilies(currentChurch.id));
  };

  useDataSync(refreshList, [currentChurch.id]);

  const handleOpenNewFamily = () => {
    setEditingFamilyId(null);
    setFormData({
      churchId: currentChurch.id,
      familyName: '',
      fatherName: '',
      motherName: '',
      weddingDate: '',
      whatsapp: '',
      hasChildren: false,
      children: [],
      address: '',
      notes: ''
    });
    setNewChildData({ name: '', birthDate: '', age: '', phone: '', gender: 'M' });
    setIsFormOpen(true);
  };

  const handleOpenEditFamily = (fam: Family) => {
    setEditingFamilyId(fam.id);
    const hasKids = (fam.children && fam.children.length > 0) || fam.hasChildren || false;
    setFormData({
      churchId: fam.churchId,
      familyName: fam.familyName,
      fatherName: fam.fatherName || '',
      motherName: fam.motherName || '',
      weddingDate: fam.weddingDate || '',
      whatsapp: fam.whatsapp || '',
      hasChildren: hasKids,
      children: fam.children || [],
      address: fam.address || '',
      notes: fam.notes || '',
      createdAt: fam.createdAt
    });
    setNewChildData({ name: '', birthDate: '', age: '', phone: '', gender: 'M' });
    setIsFormOpen(true);
  };

  const handleAddChildToFamily = () => {
    if (!newChildData.name.trim()) {
      showToast('Informe o nome do filho(a).', 'error');
      return;
    }

    const newChild: FamilyChild = {
      id: 'fchild_' + Date.now(),
      name: newChildData.name.trim(),
      birthDate: newChildData.birthDate || undefined,
      age: newChildData.age ? newChildData.age.trim() : undefined,
      phone: newChildData.phone ? newChildData.phone.trim() : undefined,
      gender: newChildData.gender
    };

    setFormData(prev => ({
      ...prev,
      hasChildren: true,
      children: [...(prev.children || []), newChild]
    }));

    setNewChildData({
      name: '',
      birthDate: '',
      age: '',
      phone: '',
      gender: 'M'
    });

    showToast(`Filho(a) "${newChild.name}" adicionado(a) com sucesso!`, 'success');
  };

  const handleRemoveChildFromFamily = (childId: string) => {
    setFormData(prev => ({
      ...prev,
      children: (prev.children || []).filter(c => c.id !== childId)
    }));
    showToast('Filho(a) removido(a) da lista.', 'info');
  };

  const handleSaveFamily = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.familyName?.trim()) {
      showToast('Informe o nome da família.', 'error');
      return;
    }

    const finalChildren = formData.hasChildren ? (formData.children || []) : [];

    const saved: Family = {
      id: editingFamilyId || ('fam_' + Date.now()),
      churchId: currentChurch.id,
      familyName: formData.familyName.trim(),
      fatherName: formData.fatherName?.trim() || '',
      motherName: formData.motherName?.trim() || '',
      weddingDate: formData.weddingDate || '',
      whatsapp: formData.whatsapp?.trim() || '',
      hasChildren: formData.hasChildren ?? finalChildren.length > 0,
      children: finalChildren,
      address: formData.address?.trim() || '',
      notes: formData.notes?.trim() || '',
      createdAt: formData.createdAt || new Date().toISOString()
    };

    saveFamily(saved);
    logAction(
      currentChurch.id,
      'Secretaria',
      'SECRETARIA',
      editingFamilyId ? 'Edição de Família' : 'Cadastro de Família',
      `${saved.familyName} (Casamento: ${saved.weddingDate || 'Não inf.'}, Filhos: ${saved.children.length})`
    );
    showToast(editingFamilyId ? 'Família atualizada com sucesso!' : 'Família cadastrada com sucesso!', 'success');
    setIsFormOpen(false);
    setEditingFamilyId(null);
    refreshList();
  };

  const handleDeleteConfirm = () => {
    if (familyToDelete) {
      deleteFamily(familyToDelete.id);
      logAction(currentChurch.id, 'Secretaria', 'SECRETARIA', 'Exclusão de Família', familyToDelete.familyName);
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
            {currentChurch.name} • Gestão familiar, aniversários matrimoniais e acompanhamento
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              exportFamiliesToExcel(currentChurch, families, weddingsToday.concat(weddingsUpcoming));
              showToast('Famílias e casamentos exportados em Excel com sucesso!', 'success');
            }}
            title="Baixar lista em planilha Excel"
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Baixar em Excel</span>
          </button>

          <button
            onClick={handleOpenNewFamily}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-pink-500/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Cadastrar Família</span>
          </button>
        </div>
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
            Nenhuma comemoração de casamento registrada para os próximos dias. Ao cadastrar a data de casamento das famílias, os casais aparecerão aqui e no Dashboard com opção de felicitação via WhatsApp.
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
            Utilize o botão acima "+ Cadastrar Família" para registrar os lares da igreja com data de casamento para felicitações automáticas.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {families.map(fam => (
          <div
            key={fam.id}
            className="p-6 rounded-3xl bg-white border border-slate-200/90 hover:border-pink-300 hover:shadow-md transition-all shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-600 border border-pink-200 flex items-center justify-center font-bold text-sm">
                    👨‍👩‍👧
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900">{fam.familyName}</h3>
                    <p className="text-xs text-slate-500">{fam.address || 'Maceió - AL'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEditFamily(fam)}
                    title="Editar Família e Data de Casamento"
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-pink-50 text-slate-400 hover:text-pink-600 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setSelectedFamilyTree(fam)}
                    className="text-xs text-sky-600 hover:text-sky-700 font-semibold px-2.5 py-1 rounded-lg bg-sky-50 border border-sky-200 hover:bg-sky-100 transition-colors"
                  >
                    Árvore
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
                    <span className="font-bold text-slate-400">Pai / Esposo:</span>
                    <span>{fam.fatherName}</span>
                  </div>
                )}

                {fam.motherName && (
                  <div className="flex items-center gap-2 text-slate-700">
                    <User className="w-4 h-4 text-pink-600 shrink-0" />
                    <span className="font-bold text-slate-400">Mãe / Esposa:</span>
                    <span>{fam.motherName}</span>
                  </div>
                )}

                {/* Destaque Data de Casamento */}
                {fam.weddingDate && (
                  <div className="flex items-center gap-2 text-pink-700 font-medium bg-pink-50/70 p-2 rounded-xl border border-pink-200/60">
                    <span className="text-sm">💍</span>
                    <span className="font-bold">Casamento:</span>
                    <span>{fam.weddingDate.split('-').reverse().join('/')}</span>
                    {fam.whatsapp && (
                      <span className="text-[11px] text-slate-500 ml-auto flex items-center gap-1">
                        <Phone className="w-3 h-3 text-emerald-600" />
                        {fam.whatsapp}
                      </span>
                    )}
                  </div>
                )}

                <div className="pt-2">
                  <span className="font-bold text-slate-400 block mb-1">Filhos ({fam.children.length}):</span>
                  <div className="flex flex-wrap gap-1.5">
                    {fam.children.map(ch => (
                      <span
                        key={ch.id}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium"
                      >
                        <Baby className="w-3 h-3 text-sky-600" />
                        <span>{ch.name}</span>
                        {ch.age && <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1 rounded border border-amber-200">{ch.age}</span>}
                        {ch.birthDate && !ch.age && (
                          <span className="text-[10px] text-slate-400">({ch.birthDate.split('-').reverse().slice(0, 2).join('/')})</span>
                        )}
                      </span>
                    ))}
                    {fam.children.length === 0 && (
                      <span className="text-[11px] text-slate-400 italic">Sem filhos cadastrados no momento</span>
                    )}
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

      {/* Modal da Árvore Familiar */}
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
              <div className="w-12 h-12 rounded-2xl bg-pink-50 text-pink-600 border border-pink-200 flex items-center justify-center font-bold text-lg">
                👨‍👩‍👧
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">{selectedFamilyTree.familyName}</h3>
                <p className="text-xs text-pink-600 font-medium">Estrutura e Árvore Familiar</p>
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

              {selectedFamilyTree.weddingDate && (
                <>
                  <div className="text-slate-400 pl-2">│</div>
                  <div className="flex items-center gap-2 text-rose-700 font-bold">
                    <span>💍 Casamento:</span>
                    <span className="text-slate-900">{selectedFamilyTree.weddingDate.split('-').reverse().join('/')}</span>
                  </div>
                </>
              )}

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

      {/* Modal Cadastro / Edição de Família */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 text-slate-800 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setIsFormOpen(false);
                setEditingFamilyId(null);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <HeartHandshake className="w-5 h-5 text-pink-600" />
              <span>{editingFamilyId ? 'Editar Família Eclesiástica' : 'Nova Família Eclesiástica'}</span>
            </h3>

            <form onSubmit={handleSaveFamily} className="space-y-3.5">
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nome do Pai / Esposo</label>
                  <input
                    type="text"
                    placeholder="Nome completo do esposo"
                    value={formData.fatherName || ''}
                    onChange={e => setFormData({ ...formData, fatherName: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nome da Mãe / Esposa</label>
                  <input
                    type="text"
                    placeholder="Nome completo da esposa"
                    value={formData.motherName || ''}
                    onChange={e => setFormData({ ...formData, motherName: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-pink-500"
                  />
                </div>
              </div>

              {/* Data do Casamento (Solicitado pelo usuário para aparecer no Dashboard para mandar mensagem) */}
              <div className="p-3.5 rounded-2xl bg-pink-50/70 border border-pink-200/80 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-base">💍</span>
                  <label className="text-xs font-bold text-pink-900">
                    Data do Casamento (Bodas Matrimoniais)
                  </label>
                </div>
                <input
                  type="date"
                  value={formData.weddingDate || ''}
                  onChange={e => setFormData({ ...formData, weddingDate: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-pink-300 text-slate-900 text-sm outline-none focus:ring-2 focus:ring-pink-500/20 font-semibold"
                />
                <p className="text-[11px] text-pink-700 leading-relaxed">
                  Ao cadastrar a data do casamento, o casal aparecerá automaticamente no <strong>Dashboard</strong> na data das bodas, permitindo o envio da bênção personalizada via WhatsApp com o tempo de união.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">WhatsApp de Contato do Casal</label>
                  <input
                    type="text"
                    placeholder="(DDD) 99999-9999"
                    value={formData.whatsapp || ''}
                    onChange={e => setFormData({ ...formData, whatsapp: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Endereço da Família</label>
                  <input
                    type="text"
                    placeholder="Bairro, Rua, Cidade..."
                    value={formData.address || ''}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-pink-500"
                  />
                </div>
              </div>

              {/* Opção: Perguntar se tem filhos e adicionar dados dos filhos */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-50/70 via-blue-50/50 to-indigo-50/50 border border-sky-200/80 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-2">
                      <Baby className="w-4 h-4 text-sky-600" />
                      <span>A família possui filhos?</span>
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Selecione "Sim" para cadastrar nome, idade e contato dos filhos
                    </p>
                  </div>

                  {/* Seletor Sim / Não */}
                  <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-xs shrink-0">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, hasChildren: false, children: [] })}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        !formData.hasChildren 
                          ? 'bg-slate-800 text-white shadow-xs' 
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Não
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, hasChildren: true })}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        formData.hasChildren 
                          ? 'bg-sky-600 text-white shadow-xs' 
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Sim, possui filhos
                    </button>
                  </div>
                </div>

                {/* Se Possui Filhos: Formulário para Adicionar Filhos e Lista de Cadastrados */}
                {formData.hasChildren && (
                  <div className="pt-3 border-t border-sky-200/70 space-y-3">
                    <div className="p-3.5 bg-white rounded-xl border border-sky-200 shadow-xs space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                          <Plus className="w-3.5 h-3.5 text-sky-600" />
                          <span>Cadastrar Filho(a):</span>
                        </span>
                        <span className="text-[10px] text-slate-400">Preencha e clique em "Adicionar Filho"</span>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                        <div className="sm:col-span-6">
                          <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Nome do Filho(a) *</label>
                          <input
                            type="text"
                            placeholder="Ex: Matheus Oliveira"
                            value={newChildData.name}
                            onChange={e => setNewChildData({ ...newChildData, name: e.target.value })}
                            className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 outline-none focus:bg-white focus:border-sky-500"
                          />
                        </div>

                        <div className="sm:col-span-3">
                          <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Data Nasc.</label>
                          <input
                            type="date"
                            value={newChildData.birthDate}
                            onChange={e => setNewChildData({ ...newChildData, birthDate: e.target.value })}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 outline-none focus:bg-white focus:border-sky-500"
                          />
                        </div>

                        <div className="sm:col-span-3">
                          <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Idade / Faixa</label>
                          <input
                            type="text"
                            placeholder="Ex: 9 anos"
                            value={newChildData.age}
                            onChange={e => setNewChildData({ ...newChildData, age: e.target.value })}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 outline-none focus:bg-white focus:border-sky-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                        <div className="sm:col-span-4">
                          <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Gênero</label>
                          <select
                            value={newChildData.gender}
                            onChange={e => setNewChildData({ ...newChildData, gender: e.target.value as 'M' | 'F' })}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 font-medium outline-none focus:border-sky-500"
                          >
                            <option value="M">Masculino</option>
                            <option value="F">Feminino</option>
                          </select>
                        </div>

                        <div className="sm:col-span-5">
                          <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Telefone / WhatsApp (se houver)</label>
                          <input
                            type="text"
                            placeholder="(DDD) 99999-9999"
                            value={newChildData.phone}
                            onChange={e => setNewChildData({ ...newChildData, phone: e.target.value })}
                            className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 outline-none focus:bg-white focus:border-sky-500"
                          />
                        </div>

                        <div className="sm:col-span-3 flex items-end">
                          <button
                            type="button"
                            onClick={handleAddChildToFamily}
                            className="w-full px-3 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-xs flex items-center justify-center gap-1 active:scale-95 transition-all whitespace-nowrap"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Adicionar Filho</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Lista dos Filhos Adicionados */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-[11px] font-bold text-slate-700">
                          Filhos Vinculados à Família ({formData.children?.length || 0}):
                        </label>
                      </div>

                      {(!formData.children || formData.children.length === 0) ? (
                        <p className="text-xs text-slate-400 italic bg-white p-3 rounded-xl border border-dashed border-slate-200 text-center">
                          Nenhum filho adicionado ainda. Preencha os dados acima e clique em "Adicionar Filho".
                        </p>
                      ) : (
                        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                          {formData.children.map((child, idx) => (
                            <div 
                              key={child.id || idx}
                              className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between gap-3 shadow-xs"
                            >
                              <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center font-bold text-xs shrink-0">
                                  <Baby className="w-3.5 h-3.5" />
                                </div>
                                <div>
                                  <h5 className="text-xs font-bold text-slate-900">{child.name}</h5>
                                  <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-500">
                                    <span>{child.gender === 'F' ? 'Feminino' : 'Masculino'}</span>
                                    {child.birthDate && (
                                      <span>• Nasc: {child.birthDate.split('-').reverse().join('/')}</span>
                                    )}
                                    {child.age && (
                                      <span className="font-semibold text-amber-700">• {child.age}</span>
                                    )}
                                    {child.phone && (
                                      <span>• Tel: {child.phone}</span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleRemoveChildFromFamily(child.id)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                title="Remover filho da família"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Observações da Família</label>
                <textarea
                  rows={2}
                  placeholder="Informações adicionais do lar..."
                  value={formData.notes || ''}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-pink-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsFormOpen(false);
                    setEditingFamilyId(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingFamilyId ? 'Salvar Alterações' : 'Cadastrar Família'}</span>
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
