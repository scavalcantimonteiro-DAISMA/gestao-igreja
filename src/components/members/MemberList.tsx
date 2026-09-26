import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Edit2, 
  Trash2, 
  Eye, 
  Cake, 
  Heart, 
  Flame,
  Phone,
  FileSpreadsheet
} from 'lucide-react';
import { Member, MemberStatus } from '../../types';
import { useChurch, useDataSync } from '../../context/ChurchContext';
import { useNotification } from '../../context/NotificationContext';
import { MemberFormModal } from './MemberFormModal';
import { WhatsAppButton } from '../common/WhatsAppButton';
import { BirthdayWhatsAppAction } from '../common/BirthdayWhatsAppAction';
import { ConfirmModal } from '../common/ConfirmModal';
import { 
  getMembers, 
  deleteMember, 
  logAction, 
  getSmallGroups, 
  getMinistries,
  getMessageTemplates,
  formatWhatsAppMessage 
} from '../../services/storage';
import { exportMembersToExcel } from '../../services/excelBackup';

export const MemberList: React.FC = () => {
  const { currentChurch } = useChurch();
  const { showToast } = useNotification();

  const [members, setMembers] = useState<Member[]>(() => getMembers(currentChurch.id));
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [ministryFilter, setMinistryFilter] = useState<string>('todos');
  const [pgFilter, setPgFilter] = useState<string>('todos');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [memberToEdit, setMemberToEdit] = useState<Member | null>(null);
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);
  const [selectedMemberDetail, setSelectedMemberDetail] = useState<Member | null>(null);

  const smallGroups = getSmallGroups(currentChurch.id);
  const ministries = getMinistries(currentChurch.id);
  const templates = getMessageTemplates(currentChurch.id);
  const followUpTemplate = templates.find(t => t.type === 'acompanhamento')?.text || 
    `Olá, {nome}! A ${currentChurch.name} está sempre em oração pela sua vida. Como podemos orar por você hoje? 🙏`;

  const refreshList = () => {
    setMembers(getMembers(currentChurch.id));
  };

  useDataSync(refreshList, [currentChurch.id]);

  const handleEdit = (member: Member) => {
    setMemberToEdit(member);
    setIsFormOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (memberToDelete) {
      deleteMember(memberToDelete.id);
      logAction(
        currentChurch.id,
        'Administrador',
        'ADMIN',
        'Exclusão de Membro',
        `Removido membro: ${memberToDelete.name}`
      );
      showToast('Membro excluído com sucesso.', 'success');
      setMemberToDelete(null);
      refreshList();
    }
  };

  const filteredMembers = members
    .filter(m => {
      const matchesSearch = 
        searchTerm === '' ||
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.whatsapp?.includes(searchTerm) ||
        m.street?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.neighborhood?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'todos' || m.status === statusFilter;
      const matchesMinistry = ministryFilter === 'todos' || m.ministry === ministryFilter;
      const matchesPg = pgFilter === 'todos' || m.smallGroupId === pgFilter;

      return matchesSearch && matchesStatus && matchesMinistry && matchesPg;
    })
    .sort((a, b) => (a.name || '').localeCompare(b.name || '', 'pt-BR', { sensitivity: 'base' }));

  const getStatusBadge = (status: MemberStatus) => {
    switch (status) {
      case 'Ativo':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Em acompanhamento':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Visitante':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'Afastado':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Topo do Módulo */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-3">
            <Users className="w-6 h-6 text-sky-600" />
            <span>Cadastro de Membros</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {currentChurch.name} • {filteredMembers.length} membro(s) listado(s)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              exportMembersToExcel(currentChurch, filteredMembers);
              showToast('Membros exportados em Excel com sucesso!', 'success');
            }}
            title="Baixar lista de membros em planilha Excel"
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Baixar em Excel</span>
          </button>

          <button
            onClick={() => {
              setMemberToEdit(null);
              setIsFormOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-sky-600/20 active:scale-95 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Cadastrar Membro</span>
          </button>
        </div>
      </div>

      {/* Barra de Filtros e Pesquisa */}
      <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nome, telefone ou bairro..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium outline-none focus:border-sky-500"
          >
            <option value="todos">Status: Todos</option>
            <option value="Ativo">Ativo</option>
            <option value="Em acompanhamento">Em acompanhamento</option>
            <option value="Visitante">Visitante</option>
            <option value="Afastado">Afastado</option>
            <option value="Transferido">Transferido</option>
          </select>

          <select
            value={ministryFilter}
            onChange={e => setMinistryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium outline-none focus:border-sky-500"
          >
            <option value="todos">Ministério: Todos</option>
            {ministries.map(m => (
              <option key={m.id} value={m.name}>{m.name}</option>
            ))}
          </select>

          <select
            value={pgFilter}
            onChange={e => setPgFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium outline-none focus:border-sky-500"
          >
            <option value="todos">PG: Todos</option>
            {smallGroups.map(pg => (
              <option key={pg.id} value={pg.id}>{pg.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid de Membros */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredMembers.map(m => {
          const pg = smallGroups.find(p => p.id === m.smallGroupId);
          const followUpMsg = formatWhatsAppMessage(followUpTemplate, {
            nome: m.name,
            igreja: currentChurch.name
          });

          return (
            <div
              key={m.id}
              className="p-5 rounded-3xl bg-white border border-slate-200 hover:border-sky-300 transition-all shadow-sm hover:shadow-md flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <div className="w-13 h-13 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                      {m.photoUrl ? (
                        <img src={m.photoUrl} alt={m.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-base text-sky-700 bg-sky-100">
                          {m.name[0]}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-sky-700 transition-colors leading-tight">
                          {m.name}
                        </h4>
                        {m.birthDate && (
                          <BirthdayWhatsAppAction
                            personName={m.name}
                            phone={m.whatsapp}
                            formattedDate={m.birthDate.split('-').reverse().slice(0, 2).join('/')}
                            size="xs"
                            variant="inline-icon"
                          />
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {m.churchRole || 'Membro'} {m.profession && `• ${m.profession}`}
                      </p>
                    </div>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(m.status)} shrink-0`}>
                    {m.status}
                  </span>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                  {m.whatsapp && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{m.whatsapp}</span>
                    </div>
                  )}

                  {m.birthDate && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Cake className="w-3.5 h-3.5 text-amber-500" />
                        <span>Nasc: {m.birthDate.split('-').reverse().join('/')}</span>
                      </div>
                      <BirthdayWhatsAppAction
                        personName={m.name}
                        phone={m.whatsapp}
                        formattedDate={m.birthDate.split('-').reverse().slice(0, 2).join('/')}
                        size="xs"
                        variant="badge"
                        label="WhatsApp"
                      />
                    </div>
                  )}

                  {m.maritalStatus === 'Casado(a)' && m.spouseName && (
                    <div className="flex items-center gap-2">
                      <Heart className="w-3.5 h-3.5 text-pink-500" />
                      <span>Cônjuge: {m.spouseName}</span>
                    </div>
                  )}

                  {pg && (
                    <div className="flex items-center gap-2">
                      <Flame className="w-3.5 h-3.5 text-orange-500" />
                      <span>{pg.name}</span>
                    </div>
                  )}

                  {m.ministry && (
                    <div className="flex items-center gap-2 text-[11px] text-sky-700 font-semibold">
                      <span>⛪ {m.ministry}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <WhatsAppButton
                  phone={m.whatsapp}
                  message={followUpMsg}
                  label="WhatsApp"
                  size="sm"
                  variant="outline"
                  showCopyOption={false}
                />

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setSelectedMemberDetail(m)}
                    title="Ver Ficha Completa"
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleEdit(m)}
                    title="Editar Membro"
                    className="p-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => setMemberToDelete(m)}
                    title="Excluir Membro"
                    className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredMembers.length === 0 && (
        <div className="text-center py-12 rounded-3xl bg-white border border-slate-200 text-slate-400 shadow-sm">
          <Users className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <h4 className="text-base font-bold text-slate-700">Nenhum membro encontrado</h4>
          <p className="text-xs text-slate-400 mt-1">Ajuste os filtros ou cadastre um novo membro.</p>
        </div>
      )}

      {/* Modal de Formulário */}
      {isFormOpen && (
        <MemberFormModal
          key={memberToEdit ? `edit_${memberToEdit.id}` : 'new_member'}
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setMemberToEdit(null);
          }}
          memberToEdit={memberToEdit}
          onSaved={refreshList}
        />
      )}

      {/* Modal de Ficha Detalhada */}
      {selectedMemberDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 text-slate-800 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedMemberDetail(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
            >
              ✕
            </button>

            <div className="flex items-center gap-4 mb-4 pb-4 border-b border-slate-100">
              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                {selectedMemberDetail.photoUrl ? (
                  <img src={selectedMemberDetail.photoUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-sky-700 font-bold text-xl bg-sky-100">
                    {selectedMemberDetail.name[0]}
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">{selectedMemberDetail.name}</h3>
                <p className="text-xs text-sky-700 font-semibold">{selectedMemberDetail.churchRole || 'Membro'} • {selectedMemberDetail.status}</p>
                <p className="text-xs text-slate-500">{selectedMemberDetail.profession || 'Profissão não informada'}</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="font-bold text-slate-500 block">Endereço:</span>
                <span className="text-slate-800">
                  {selectedMemberDetail.street ? `${selectedMemberDetail.street}, ${selectedMemberDetail.number || 'S/N'} - ${selectedMemberDetail.neighborhood || ''}, ${selectedMemberDetail.city}/${selectedMemberDetail.state}` : 'Não informado'}
                </span>
              </div>

              <div>
                <span className="font-bold text-slate-500 block">Contato:</span>
                <span className="text-slate-800">WhatsApp: {selectedMemberDetail.whatsapp} | Email: {selectedMemberDetail.email || 'Não informado'}</span>
              </div>

              <div>
                <span className="font-bold text-slate-500 block">Vida Cristã:</span>
                <span className="text-slate-800">
                  Batismo: {selectedMemberDetail.baptismDate || 'Não informado'}{selectedMemberDetail.baptismChurch ? ` (${selectedMemberDetail.baptismChurch})` : ''}
                </span>
              </div>

              {selectedMemberDetail.talents && (
                <div>
                  <span className="font-bold text-slate-500 block">Dons e Habilidades:</span>
                  <span className="text-slate-800">{selectedMemberDetail.talents}</span>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedMemberDetail(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmModal
        isOpen={!!memberToDelete}
        title="Excluir Membro"
        message={`Deseja realmente remover o cadastro de ${memberToDelete?.name}? Essa ação não poderá ser desfeita.`}
        confirmLabel="Excluir"
        isDanger={true}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setMemberToDelete(null)}
      />
    </div>
  );
};
