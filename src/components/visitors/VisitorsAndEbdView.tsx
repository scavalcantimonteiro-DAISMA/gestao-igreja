import React, { useState } from 'react';
import { 
  UserPlus, 
  GraduationCap, 
  Droplet, 
  Plus, 
  Phone, 
  Calendar, 
  CheckCircle2, 
  MessageCircle, 
  X, 
  Save, 
  Users, 
  BookOpen, 
  Trash2,
  Clock,
  MapPin,
  Edit3,
  Search,
  UserCheck
} from 'lucide-react';
import { Visitor, BibleClass, BibleClassStudent, BaptismRecord } from '../../types';
import { useChurch } from '../../context/ChurchContext';
import { useNotification } from '../../context/NotificationContext';
import { WhatsAppButton } from '../common/WhatsAppButton';
import { ConfirmModal } from '../common/ConfirmModal';
import { 
  getVisitors, 
  saveVisitor, 
  deleteVisitor, 
  getBibleClasses,
  saveBibleClass,
  deleteBibleClass,
  getMessageTemplates, 
  formatWhatsAppMessage, 
  logAction 
} from '../../services/storage';

interface VisitorsAndEbdViewProps {
  initialTab?: 'visitors' | 'ebd' | 'baptisms';
  isolated?: boolean;
}

export const VisitorsAndEbdView: React.FC<VisitorsAndEbdViewProps> = ({ 
  initialTab = 'visitors',
  isolated = false
}) => {
  const { currentChurch } = useChurch();
  const { showToast } = useNotification();

  const [activeSubTab, setActiveSubTab] = useState<'visitors' | 'ebd' | 'baptisms'>(initialTab);

  React.useEffect(() => {
    setActiveSubTab(initialTab);
  }, [initialTab]);

  const [visitors, setVisitors] = useState<Visitor[]>(() => getVisitors(currentChurch.id));
  const [bibleClasses, setBibleClasses] = useState<BibleClass[]>(() => getBibleClasses(currentChurch.id));

  const [isVisitorModalOpen, setIsVisitorModalOpen] = useState(false);
  const [visitorToDelete, setVisitorToDelete] = useState<Visitor | null>(null);

  // Estados da EBD (Escola Bíblica Dominical)
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [classToEdit, setClassToEdit] = useState<BibleClass | null>(null);
  const [classToDelete, setClassToDelete] = useState<BibleClass | null>(null);
  const [ebdSearchTerm, setEbdSearchTerm] = useState('');

  const [classForm, setClassForm] = useState<Partial<BibleClass>>({
    name: '',
    room: 'Sala 01',
    scheduleTime: '09:00 - 10:15',
    teacher: '',
    teacherPhone: '',
    assistantTeacher: '',
    ageGroup: '',
    enrolledStudentsCount: 0,
    status: 'Ativa',
    notes: ''
  });

  // Gestão de Matrícula de Alunos por Sala
  const [selectedClassForStudents, setSelectedClassForStudents] = useState<BibleClass | null>(null);
  const [studentForm, setStudentForm] = useState({
    name: '',
    age: '',
    phone: '',
    notes: ''
  });
  const [studentToDelete, setStudentToDelete] = useState<{ id: string; name: string } | null>(null);

  const [visitorForm, setVisitorForm] = useState<Partial<Visitor>>({
    firstVisitDate: new Date().toISOString().split('T')[0],
    status: 'novo',
    touchpoints: []
  });

  const templates = getMessageTemplates(currentChurch.id);
  const visitorTemplate = templates.find(t => t.type === 'visitante')?.text || 
    'Olá, {nome}! Foi uma grande alegria receber você na {igreja}. Nossas portas estão abertas para você! 👋⛪';

  const refreshVisitors = () => {
    setVisitors(getVisitors(currentChurch.id));
  };

  const refreshBibleClasses = () => {
    setBibleClasses(getBibleClasses(currentChurch.id));
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
      firstVisitDate: visitorForm.firstVisitDate || new Date().toISOString().split('T')[0],
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

  // Funções da EBD
  const handleOpenNewClassModal = () => {
    setClassToEdit(null);
    setClassForm({
      name: '',
      room: 'Sala 01',
      scheduleTime: '09:00 - 10:15',
      teacher: '',
      teacherPhone: '',
      assistantTeacher: '',
      ageGroup: '',
      enrolledStudentsCount: 0,
      status: 'Ativa',
      notes: ''
    });
    setIsClassModalOpen(true);
  };

  const handleOpenEditClassModal = (cls: BibleClass) => {
    setClassToEdit(cls);
    setClassForm({
      name: cls.name,
      room: cls.room,
      scheduleTime: cls.scheduleTime || cls.schedule || '09:00 - 10:15',
      teacher: cls.teacher,
      teacherPhone: cls.teacherPhone || '',
      assistantTeacher: cls.assistantTeacher || '',
      ageGroup: cls.ageGroup || '',
      enrolledStudentsCount: cls.enrolledStudentsCount || 0,
      status: cls.status || 'Ativa',
      notes: cls.notes || ''
    });
    setIsClassModalOpen(true);
  };

  const handleSaveClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!classForm.name?.trim() || !classForm.room?.trim() || !classForm.teacher?.trim()) {
      showToast('Nome da Sala/Turma, Sala e Professor(a) Titular são obrigatórios.', 'error');
      return;
    }

    const saved: BibleClass = {
      id: classToEdit ? classToEdit.id : 'ebd_' + Date.now(),
      churchId: currentChurch.id,
      name: classForm.name.trim(),
      room: classForm.room.trim(),
      scheduleTime: classForm.scheduleTime?.trim() || '09:00 - 10:15',
      schedule: classForm.scheduleTime?.trim() || '09:00 - 10:15',
      teacher: classForm.teacher.trim(),
      teacherPhone: classForm.teacherPhone?.trim() || '',
      assistantTeacher: classForm.assistantTeacher?.trim() || '',
      ageGroup: classForm.ageGroup?.trim() || '',
      enrolledStudentsCount: Number(classForm.enrolledStudentsCount) || 0,
      status: classForm.status || 'Ativa',
      notes: classForm.notes?.trim() || '',
      createdAt: classToEdit ? classToEdit.createdAt : new Date().toISOString()
    };

    saveBibleClass(saved);
    logAction(
      currentChurch.id,
      'Coordenação EBD',
      'ADMIN',
      classToEdit ? 'Atualização de Sala EBD' : 'Cadastro de Sala EBD',
      `${saved.name} (${saved.room})`
    );
    showToast(classToEdit ? 'Sala da EBD atualizada!' : 'Sala da EBD cadastrada com sucesso!', 'success');
    setIsClassModalOpen(false);
    refreshBibleClasses();
  };

  const handleDeleteClassConfirm = () => {
    if (classToDelete) {
      deleteBibleClass(classToDelete.id);
      logAction(currentChurch.id, 'Coordenação EBD', 'ADMIN', 'Exclusão de Sala EBD', classToDelete.name);
      showToast('Sala da EBD excluída com sucesso.', 'success');
      setClassToDelete(null);
      refreshBibleClasses();
    }
  };

  // Funções de Matrícula de Alunos
  const handleEnrollStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClassForStudents || !studentForm.name.trim()) {
      showToast('Nome completo do aluno é obrigatório.', 'error');
      return;
    }

    const newStudent: BibleClassStudent = {
      id: 'std_' + Date.now(),
      name: studentForm.name.trim(),
      age: studentForm.age ? parseInt(studentForm.age, 10) : undefined,
      phone: studentForm.phone.trim(),
      enrolledAt: new Date().toISOString().split('T')[0],
      notes: studentForm.notes.trim()
    };

    const currentStudents = selectedClassForStudents.students || [];
    const updatedStudents = [...currentStudents, newStudent];
    const updatedClass: BibleClass = {
      ...selectedClassForStudents,
      students: updatedStudents,
      enrolledStudentsCount: updatedStudents.length
    };

    saveBibleClass(updatedClass);
    setSelectedClassForStudents(updatedClass);
    refreshBibleClasses();
    logAction(
      currentChurch.id,
      'Coordenação EBD',
      'SECRETARIA',
      'Matrícula de Aluno EBD',
      `${newStudent.name} (${newStudent.age ? newStudent.age + ' anos' : 'Idade não informada'}) matriculado na sala ${selectedClassForStudents.name}`
    );
    showToast(`Aluno(a) "${newStudent.name}" matriculado(a) com sucesso!`, 'success');
    setStudentForm({ name: '', age: '', phone: '', notes: '' });
  };

  const handleRemoveStudentConfirm = () => {
    if (!selectedClassForStudents || !studentToDelete) return;
    const currentStudents = selectedClassForStudents.students || [];
    const updatedStudents = currentStudents.filter(s => s.id !== studentToDelete.id);
    const updatedClass: BibleClass = {
      ...selectedClassForStudents,
      students: updatedStudents,
      enrolledStudentsCount: updatedStudents.length
    };

    saveBibleClass(updatedClass);
    setSelectedClassForStudents(updatedClass);
    refreshBibleClasses();
    logAction(
      currentChurch.id,
      'Coordenação EBD',
      'SECRETARIA',
      'Desmatrícula de Aluno EBD',
      `${studentToDelete.name} removido da sala ${selectedClassForStudents.name}`
    );
    showToast('Matrícula removida com sucesso.', 'info');
    setStudentToDelete(null);
  };

  const filteredClasses = bibleClasses.filter(c => {
    if (!ebdSearchTerm.trim()) return true;
    const term = ebdSearchTerm.toLowerCase();
    return (
      c.name.toLowerCase().includes(term) ||
      c.room.toLowerCase().includes(term) ||
      c.teacher.toLowerCase().includes(term) ||
      (c.ageGroup && c.ageGroup.toLowerCase().includes(term))
    );
  });

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
            {activeSubTab === 'visitors' && `${currentChurch.name} • Acolhimento de novos visitantes e integração`}
            {activeSubTab === 'ebd' && `${currentChurch.name} • Cadastro de horários, salas e professores da EBD`}
            {activeSubTab === 'baptisms' && `${currentChurch.name} • Acompanhamento batismal e discipulado`}
          </p>
        </div>

        {!isolated && (
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
              EBD ({bibleClasses.length})
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
        )}
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

      {/* SUB-ABA 2: EBD - GESTÃO DE HORÁRIOS, SALAS E PROFESSORES */}
      {activeSubTab === 'ebd' && (
        <div className="space-y-6">
          {/* Métricas da EBD */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-semibold">Salas & Turmas Ativas</p>
                <p className="text-lg font-black text-slate-900">{bibleClasses.length}</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-semibold">Alunos Matriculados</p>
                <p className="text-lg font-black text-slate-900">
                  {bibleClasses.reduce((acc, c) => acc + (c.enrolledStudentsCount || 0), 0)}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-semibold">Professores Registrados</p>
                <p className="text-lg font-black text-slate-900">
                  {new Set(bibleClasses.map(c => c.teacher).filter(Boolean)).size}
                </p>
              </div>
            </div>
          </div>

          {/* Barra de Busca e Botão de Ação */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por turma, professor ou sala..."
                value={ebdSearchTerm}
                onChange={e => setEbdSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-800 outline-none focus:border-sky-500 shadow-2xs"
              />
            </div>

            <button
              onClick={handleOpenNewClassModal}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-sky-500/20 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>+ Cadastrar Sala / Turma</span>
            </button>
          </div>

          {/* Listagem de Classes e Turmas */}
          {filteredClasses.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 shadow-sm">
              <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-700">Nenhuma sala ou turma da EBD cadastrada</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                {ebdSearchTerm
                  ? 'Nenhum resultado para os termos pesquisados.'
                  : 'Cadastre horários, salas e seus respectivos professores para organizar a Escola Bíblica.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredClasses.map(cls => (
                <div
                  key={cls.id}
                  className="p-5 rounded-3xl bg-white border border-slate-200/90 hover:border-sky-300 hover:shadow-md transition-all shadow-sm flex flex-col justify-between"
                >
                  <div>
                    {/* Header do Card */}
                    <div className="flex items-start justify-between pb-3 mb-3 border-b border-slate-100 gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-sky-50 text-sky-700 font-bold text-xs border border-sky-200">
                          <MapPin className="w-3.5 h-3.5 text-sky-500" />
                          <span>{cls.room}</span>
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 font-mono font-bold text-xs border border-slate-200">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          <span>{cls.scheduleTime || cls.schedule || '09:00 - 10:15'}</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            cls.status === 'Ativa'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {cls.status || 'Ativa'}
                        </span>
                        <button
                          onClick={() => handleOpenEditClassModal(cls)}
                          className="p-1 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition-colors"
                          title="Editar Sala / Turma"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setClassToDelete(cls)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Excluir Sala / Turma"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Identificação da Turma */}
                    <div>
                      <h3 className="font-black text-base text-slate-900 leading-snug">{cls.name}</h3>
                      {cls.ageGroup && (
                        <p className="text-xs text-sky-700 font-semibold mt-0.5">
                          Público / Faixa: {cls.ageGroup}
                        </p>
                      )}
                    </div>

                    {/* Professores e Detalhes */}
                    <div className="mt-3.5 p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs">
                      <div>
                        <span className="text-slate-400 font-semibold">Professor(a) Titular:</span>{' '}
                        <strong className="text-slate-800">{cls.teacher}</strong>
                      </div>

                      {cls.assistantTeacher && (
                        <p>
                          <span className="text-slate-400 font-semibold">Professor(a) Auxiliar:</span>{' '}
                          <span className="text-slate-700 font-medium">{cls.assistantTeacher}</span>
                        </p>
                      )}

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-slate-400 font-semibold">Alunos Matriculados:</span>
                        <button
                          onClick={() => setSelectedClassForStudents(cls)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-sky-100 hover:bg-sky-200 text-sky-800 font-bold text-xs transition-colors"
                          title="Clique para ver os alunos e matricular novos"
                        >
                          <Users className="w-3 h-3 text-sky-600" />
                          <span>{cls.students?.length ?? cls.enrolledStudentsCount ?? 0} alunos</span>
                          <span className="text-[10px] text-sky-600 underline font-normal ml-0.5">Gerenciar</span>
                        </button>
                      </div>

                      {cls.notes && (
                        <p className="pt-1.5 text-[11px] text-slate-600 italic border-t border-slate-200/60 mt-1.5">
                          "{cls.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Rodapé com botão de WhatsApp e Matrícula de Alunos */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedClassForStudents(cls)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-sm active:scale-95 transition-all"
                        title="Matricular novo aluno nesta sala da EBD"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Matricular Aluno</span>
                      </button>

                      {cls.teacherPhone && (
                        <WhatsAppButton
                          phone={cls.teacherPhone}
                          message={`Graça e Paz, Prof(a). ${cls.teacher}! Entrando em contato sobre a classe "${cls.name}" (${cls.room}) da EBD na ${currentChurch.name}.`}
                          label="Professor"
                          size="sm"
                          variant="outline"
                        />
                      )}
                    </div>

                    <span className="text-[11px] font-semibold text-slate-500">
                      {cls.scheduleTime || cls.schedule || '09:00 - 10:15'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
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

      {/* Modal Cadastrar / Editar Sala da EBD */}
      {isClassModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 text-slate-800 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsClassModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900 mb-1">
              {classToEdit ? 'Editar Sala / Turma da EBD' : 'Cadastrar Sala / Turma da EBD'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Defina a sala, horário da aula e os respectivos professores responsáveis.
            </p>

            <form onSubmit={handleSaveClass} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nome da Sala / Turma *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Classe Berçário, Juniores, Jovens, Casais, Adultos..."
                  value={classForm.name || ''}
                  onChange={e => setClassForm({ ...classForm, name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Sala / Local Físico *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Sala 01, Sala 02, Templo, Anexo..."
                    value={classForm.room || ''}
                    onChange={e => setClassForm({ ...classForm, room: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Horário da Aula *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 09:00 - 10:15 ou 08:30 - 09:45"
                    value={classForm.scheduleTime || ''}
                    onChange={e => setClassForm({ ...classForm, scheduleTime: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Faixa Etária / Público</label>
                  <input
                    type="text"
                    placeholder="Ex: 0 a 4 anos, 9 a 12 anos, Jovens, Adultos..."
                    value={classForm.ageGroup || ''}
                    onChange={e => setClassForm({ ...classForm, ageGroup: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Qtd. Alunos Matriculados</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={classForm.enrolledStudentsCount || 0}
                    onChange={e => setClassForm({ ...classForm, enrolledStudentsCount: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Professor(a) Titular / Responsável *</label>
                  <input
                    type="text"
                    required
                    placeholder="Nome completo do professor"
                    value={classForm.teacher || ''}
                    onChange={e => setClassForm({ ...classForm, teacher: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">WhatsApp do Professor</label>
                  <input
                    type="text"
                    placeholder="(DDD) 99999-9999"
                    value={classForm.teacherPhone || ''}
                    onChange={e => setClassForm({ ...classForm, teacherPhone: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Professor(a) Auxiliar (Opcional)</label>
                  <input
                    type="text"
                    placeholder="Nome do professor auxiliar"
                    value={classForm.assistantTeacher || ''}
                    onChange={e => setClassForm({ ...classForm, assistantTeacher: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status da Sala</label>
                  <select
                    value={classForm.status || 'Ativa'}
                    onChange={e => setClassForm({ ...classForm, status: e.target.value as any })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-sky-500"
                  >
                    <option value="Ativa">Ativa</option>
                    <option value="Inativa">Em recesso / Inativa</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Observações / Tema da Revista</label>
                <textarea
                  rows={2}
                  placeholder="Tema do trimestre, revista didática, objetivos pedagógicos..."
                  value={classForm.notes || ''}
                  onChange={e => setClassForm({ ...classForm, notes: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-sky-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsClassModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-sm"
                >
                  {classToEdit ? 'Atualizar Sala' : 'Salvar Sala'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {classToDelete && (
        <ConfirmModal
          isOpen={true}
          title="Excluir Sala da EBD"
          message={`Tem certeza que deseja remover o cadastro da sala "${classToDelete.name}" (${classToDelete.room}) com professor ${classToDelete.teacher}? Esta ação não pode ser desfeita.`}
          confirmLabel="Excluir Sala"
          confirmVariant="danger"
          onConfirm={handleDeleteClassConfirm}
          onCancel={() => setClassToDelete(null)}
        />
      )}

      {/* Modal: Matrícula e Gestão de Alunos por Sala da EBD */}
      {selectedClassForStudents && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-2xl rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 text-slate-800 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedClassForStudents(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Cabeçalho da Sala */}
            <div className="flex items-start gap-3.5 pb-4 mb-4 border-b border-slate-100">
              <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 border border-sky-200 flex items-center justify-center shrink-0">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div className="flex-1 pr-6">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-black text-slate-900 leading-snug">
                    {selectedClassForStudents.name}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
                    {selectedClassForStudents.room}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Prof. Titular: <strong className="text-slate-700 font-semibold">{selectedClassForStudents.teacher}</strong> • Horário: {selectedClassForStudents.scheduleTime || selectedClassForStudents.schedule || '09:00'}
                </p>
              </div>
            </div>

            {/* Formulário: Matricular Novo Aluno */}
            <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-200 mb-6">
              <h4 className="text-xs font-bold text-sky-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <UserPlus className="w-4 h-4 text-sky-600" />
                <span>Matricular Novo Aluno</span>
              </h4>

              <form onSubmit={handleEnrollStudent} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                  <div className="sm:col-span-6">
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Nome Completo do Aluno *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Gabriel Lucas Santos"
                      value={studentForm.name}
                      onChange={e => setStudentForm({ ...studentForm, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs outline-none focus:border-sky-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Idade
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="120"
                      placeholder="Ex: 11"
                      value={studentForm.age}
                      onChange={e => setStudentForm({ ...studentForm, age: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs outline-none focus:border-sky-500 font-bold"
                    />
                  </div>

                  <div className="sm:col-span-4">
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Telefone / WhatsApp (se houver)
                    </label>
                    <input
                      type="text"
                      placeholder="(DDD) 99999-9999"
                      value={studentForm.phone}
                      onChange={e => setStudentForm({ ...studentForm, phone: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <input
                    type="text"
                    placeholder="Observações (ex: pai/mãe, necessidade especial, etc.)"
                    value={studentForm.notes}
                    onChange={e => setStudentForm({ ...studentForm, notes: e.target.value })}
                    className="flex-1 w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs outline-none focus:border-sky-500"
                  />
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 active:scale-95 transition-all whitespace-nowrap"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Confirmar Matrícula</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Listagem de Alunos Matriculados */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-slate-500" />
                  <span>Alunos Matriculados Nesta Sala</span>
                </h4>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                  {selectedClassForStudents.students?.length || 0} alunos
                </span>
              </div>

              {(!selectedClassForStudents.students || selectedClassForStudents.students.length === 0) ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100 text-slate-400">
                  <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p className="text-xs font-semibold text-slate-600">Nenhum aluno matriculado nesta sala ainda</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Preencha o formulário acima para registrar alunos com nome completo, idade e telefone.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
                  {selectedClassForStudents.students.map((student, idx) => (
                    <div 
                      key={student.id || idx}
                      className="p-3.5 bg-white hover:bg-slate-50/80 transition-colors flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-800 font-bold text-xs flex items-center justify-center shrink-0">
                          {student.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h5 className="text-xs font-bold text-slate-900">{student.name}</h5>
                            {student.age !== undefined && student.age !== null && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                {student.age} anos
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 mt-0.5">
                            {student.phone ? (
                              <span className="flex items-center gap-1 text-slate-600 font-medium">
                                <Phone className="w-3 h-3 text-emerald-600" />
                                {student.phone}
                              </span>
                            ) : (
                              <span className="text-slate-400 italic">Sem telefone</span>
                            )}
                            {student.enrolledAt && (
                              <span>Matrícula: {student.enrolledAt.split('-').reverse().join('/')}</span>
                            )}
                            {student.notes && (
                              <span className="text-slate-400">({student.notes})</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {student.phone && (
                          <WhatsAppButton
                            phone={student.phone}
                            message={`Graça e Paz, ${student.name}! Mensagem da coordenação da EBD da ${currentChurch.name}, sala ${selectedClassForStudents.name}.`}
                            label="WhatsApp"
                            size="sm"
                            variant="outline"
                          />
                        )}
                        <button
                          onClick={() => setStudentToDelete({ id: student.id, name: student.name })}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Remover matrícula do aluno"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedClassForStudents(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold"
              >
                Concluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmação de Remoção de Matrícula */}
      {studentToDelete && (
        <ConfirmModal
          isOpen={true}
          title="Remover Matrícula de Aluno"
          message={`Tem certeza que deseja desmatricular o aluno "${studentToDelete.name}" da sala "${selectedClassForStudents?.name}"?`}
          confirmLabel="Remover Matrícula"
          confirmVariant="danger"
          onConfirm={handleRemoveStudentConfirm}
          onCancel={() => setStudentToDelete(null)}
        />
      )}
    </div>
  );
};

