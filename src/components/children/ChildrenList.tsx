import React, { useState } from 'react';
import { Baby, Plus, Search, Cake, School, Phone, Trash2, Edit2, X, Save } from 'lucide-react';
import { Child } from '../../types';
import { useChurch } from '../../context/ChurchContext';
import { useNotification } from '../../context/NotificationContext';
import { WhatsAppButton } from '../common/WhatsAppButton';
import { BirthdayWhatsAppAction } from '../common/BirthdayWhatsAppAction';
import { MaskedInput } from '../common/MaskedInput';
import { ConfirmModal } from '../common/ConfirmModal';
import { getChildren, saveChild, deleteChild, logAction, getMessageTemplates, formatWhatsAppMessage } from '../../services/storage';

export const ChildrenList: React.FC = () => {
  const { currentChurch } = useChurch();
  const { showToast } = useNotification();

  const [children, setChildren] = useState<Child[]>(() => getChildren(currentChurch.id));
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [childToEdit, setChildToEdit] = useState<Child | null>(null);
  const [childToDelete, setChildToDelete] = useState<Child | null>(null);

  const [formData, setFormData] = useState<Partial<Child>>({
    gender: 'M',
    childrenMinistry: 'Departamento Infantil',
    ebdClass: 'Turma Samuel'
  });

  const templates = getMessageTemplates(currentChurch.id);
  const childBdayTemplate = templates.find(t => t.type === 'aniversario_crianca')?.text || 
    'Parabéns, {nome}! 🎈 O Departamento Infantil se alegra pelo seu aniversário! Que Deus te abençoe rica e grandemente! 🎂';

  const refreshList = () => {
    setChildren(getChildren(currentChurch.id));
  };

  const handleOpenForm = (child?: Child) => {
    if (child) {
      setChildToEdit(child);
      setFormData(child);
    } else {
      setChildToEdit(null);
      setFormData({
        churchId: currentChurch.id,
        name: '',
        gender: 'M',
        birthDate: '',
        guardianName: '',
        guardianPhone: '',
        guardianWhatsapp: '',
        childrenMinistry: 'Departamento Infantil',
        ebdClass: 'Turma Samuel',
        school: '',
        schoolGrade: '',
        notes: ''
      });
    }
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim() || !formData.birthDate || !formData.guardianPhone) {
      showToast('Preencha os campos obrigatórios da criança e do responsável.', 'error');
      return;
    }

    const saved: Child = {
      ...formData,
      id: childToEdit?.id || 'child_' + Date.now(),
      churchId: currentChurch.id,
      name: formData.name!,
      gender: formData.gender as 'M' | 'F',
      birthDate: formData.birthDate!,
      guardianName: formData.guardianName || 'Responsável',
      guardianPhone: formData.guardianPhone!,
      guardianWhatsapp: formData.guardianWhatsapp || formData.guardianPhone!,
      createdAt: childToEdit?.createdAt || new Date().toISOString()
    };

    saveChild(saved);
    logAction(
      currentChurch.id,
      'Administrador',
      'ADMIN',
      childToEdit ? 'Edição de Criança' : 'Cadastro de Criança (Departamento Infantil)',
      `${saved.name} (Responsável: ${saved.guardianName})`
    );

    showToast(childToEdit ? 'Cadastro infantil atualizado!' : 'Criança cadastrada com sucesso!', 'success');
    setIsFormOpen(false);
    refreshList();
  };

  const handleDeleteConfirm = () => {
    if (childToDelete) {
      deleteChild(childToDelete.id);
      showToast('Registro de criança removido.', 'success');
      setChildToDelete(null);
      refreshList();
    }
  };

  const filtered = children.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.guardianName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.ebdClass?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-3">
            <Baby className="w-6 h-6 text-sky-600" />
            <span>Departamento Infantil</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {currentChurch.name} • {filtered.length} criança(s) cadastrada(s)
          </p>
        </div>

        <button
          onClick={() => handleOpenForm()}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-sky-500/20 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>+ Cadastrar Criança</span>
        </button>
      </div>

      {/* Busca */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400 shrink-0" />
        <input
          type="text"
          placeholder="Buscar por nome da criança, responsável ou classe da EBD..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full bg-transparent text-slate-800 text-xs sm:text-sm outline-none placeholder:text-slate-400"
        />
      </div>

      {/* Grid de Crianças ou Estado Vazio */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 shadow-sm">
          <Baby className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">Nenhuma criança cadastrada ainda</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Utilize o botão acima "+ Cadastrar Criança" para cadastrar os pequenos no ministério infantil e turmas da EBD.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(c => {
            const bdayMsg = formatWhatsAppMessage(childBdayTemplate, {
              nome: c.name,
              responsavel: c.guardianName
            });

            return (
              <div
                key={c.id}
                className="p-5 rounded-3xl bg-white border border-slate-200/90 hover:border-sky-300 hover:shadow-md transition-all shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl overflow-hidden bg-sky-50 border border-sky-100 shrink-0 flex items-center justify-center font-bold text-sky-600 text-base">
                        {c.photoUrl ? (
                          <img src={c.photoUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          c.name[0]
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm sm:text-base text-slate-900">{c.name}</h4>
                          <BirthdayWhatsAppAction
                            personName={c.name}
                            age={c.birthDate ? new Date().getFullYear() - parseInt(c.birthDate.split('-')[0], 10) : undefined}
                            phone={c.guardianWhatsapp || c.guardianPhone}
                            isChild={true}
                            guardianName={c.guardianName}
                            formattedDate={c.birthDate ? c.birthDate.split('-').reverse().slice(0, 2).join('/') : undefined}
                            size="xs"
                            variant="inline-icon"
                          />
                        </div>
                        <span className="inline-block text-[11px] font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded mt-0.5 border border-sky-200">
                          {c.ebdClass || c.childrenMinistry}
                        </span>
                      </div>
                    </div>

                    <span className="text-xs font-mono font-bold text-slate-500">
                      {c.birthDate ? `${new Date().getFullYear() - parseInt(c.birthDate.split('-')[0], 10)} anos` : ''}
                    </span>
                  </div>

                  <div className="mt-4 space-y-2 text-xs text-slate-600">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Cake className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span>Nasc: {c.birthDate?.split('-').reverse().join('/')}</span>
                      </div>
                      <BirthdayWhatsAppAction
                        personName={c.name}
                        age={c.birthDate ? new Date().getFullYear() - parseInt(c.birthDate.split('-')[0], 10) : undefined}
                        phone={c.guardianWhatsapp || c.guardianPhone}
                        isChild={true}
                        guardianName={c.guardianName}
                        formattedDate={c.birthDate ? c.birthDate.split('-').reverse().slice(0, 2).join('/') : undefined}
                        size="xs"
                        variant="badge"
                        label="Felicitações"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Resp: {c.guardianName} ({c.guardianPhone})</span>
                    </div>

                    {c.school && (
                      <div className="flex items-center gap-2">
                        <School className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{c.school} {c.schoolGrade && `• ${c.schoolGrade}`}</span>
                      </div>
                    )}

                    {c.notes && (
                      <div className="mt-2 p-2.5 rounded-xl bg-amber-50/70 border border-amber-200 text-[11px] text-amber-800">
                        <span className="font-bold">Observações / Alergias:</span> {c.notes}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <WhatsAppButton
                    phone={c.guardianWhatsapp || c.guardianPhone}
                    message={bdayMsg}
                    label="Falar c/ Pais"
                    size="sm"
                    variant="outline"
                    showCopyOption={false}
                  />

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenForm(c)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-sky-50 text-slate-600 hover:text-sky-600 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setChildToDelete(c)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Formulário Infantil */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 text-slate-800 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsFormOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 border border-sky-200 flex items-center justify-center">
                <Baby className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {childToEdit ? 'Editar Cadastro Infantil' : 'Novo Cadastro de Criança'}
                </h3>
                <p className="text-xs text-sky-600 font-medium">Departamento Infantil</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nome da Criança *</label>
                <input
                  type="text"
                  required
                  placeholder="Nome completo"
                  value={formData.name || ''}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Sexo *</label>
                  <select
                    value={formData.gender || 'M'}
                    onChange={e => setFormData({ ...formData, gender: e.target.value as 'M' | 'F' })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-sky-500"
                  >
                    <option value="M">Masculino</option>
                    <option value="F">Feminino</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Data de Nascimento *</label>
                  <input
                    type="date"
                    required
                    value={formData.birthDate || ''}
                    onChange={e => setFormData({ ...formData, birthDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nome do Responsável *</label>
                  <input
                    type="text"
                    required
                    placeholder="Mãe / Pai / Tutor"
                    value={formData.guardianName || ''}
                    onChange={e => setFormData({ ...formData, guardianName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-sky-500"
                  />
                </div>

                <div>
                  <MaskedInput
                    mask="phone"
                    label="WhatsApp do Responsável *"
                    placeholder="(82) 99999-9999"
                    value={formData.guardianPhone || ''}
                    onChange={val => setFormData({ ...formData, guardianPhone: val, guardianWhatsapp: val })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Escola</label>
                  <input
                    type="text"
                    placeholder="Nome da escola"
                    value={formData.school || ''}
                    onChange={e => setFormData({ ...formData, school: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Classe da EBD</label>
                  <input
                    type="text"
                    placeholder="Ex: Cordeirinhos, Samuel"
                    value={formData.ebdClass || ''}
                    onChange={e => setFormData({ ...formData, ebdClass: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Observações (Alergias, Cuidados Especiais)</label>
                <textarea
                  rows={2}
                  placeholder="Ex: Alergia alimentar, medicação, restrições..."
                  value={formData.notes || ''}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-sky-500"
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
                  Salvar Criança
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmação de Exclusão */}
      <ConfirmModal
        isOpen={!!childToDelete}
        title="Excluir Criança"
        message={`Deseja realmente remover o registro de ${childToDelete?.name}?`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setChildToDelete(null)}
      />
    </div>
  );
};
