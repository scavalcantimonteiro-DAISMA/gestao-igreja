// ==========================================
// TIPOS E MODELOS DO SISTEMA GESTÃO IGREJA
// ==========================================

export type UserRole = 
  | 'SUPERADMIN'  // Saulo Monteiro (Acesso a todas as igrejas e SaaS)
  | 'ADMIN'       // Administrador da congregação
  | 'PASTOR'      // Acesso pastoral completo
  | 'SECRETARIA'  // Cadastros, membros, eventos, agenda
  | 'TESOURARIA'  // Exclusivo financeiro
  | 'LIDER_PG'    // Apenas o seu pequeno grupo
  | 'LIDER_ESCALA'; // Exclusivo para criação e envio de escalas ministeriais

export interface Church {
  id: string;
  name: string;
  slug: string;
  loginUser?: string;
  loginPassword?: string;
  scaleAccessPassword?: string; // Senha cadastrada para líderes acessarem exclusivamente a aba de escalas
  mustChangePassword?: boolean;
  cnpj?: string;
  address: string;
  neighborhood?: string;
  city: string;
  state: string;
  zipCode?: string;
  instagram: string;
  phone: string;
  whatsapp: string;
  website?: string;
  logoUrl?: string;
  pastorName: string;
  pastorPhone: string;
  pastorWhatsapp: string;
  pastoralOfficeName?: string;
  pastoralOfficeWhatsapp?: string;
  secretaryName?: string;
  secretaryWhatsapp?: string;
  defaultBirthdaySender?: 'pastor' | 'gabinete';
  defaultGeneralSender?: 'secretaria' | 'pastor' | 'gabinete';
  dailyReportHour: string; // Ex: "07:30"
  financialPin: string;    // Padrão "0000" inicial
  financialPinChanged: boolean;
  reserveTarget?: number;  // Meta/valor ideal da reserva de emergência (editável)
  reserveBalance?: number; // Saldo atual acumulado na reserva de emergência
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export type WhatsAppSenderRole = 'pastor' | 'gabinete' | 'secretaria';


export interface User {
  id: string;
  churchId: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  phone?: string;
  smallGroupId?: string; // Se for líder de PG
  isActive: boolean;
  createdAt: string;
}

export type MemberStatus = 
  | 'Ativo' 
  | 'Em acompanhamento' 
  | 'Visitante' 
  | 'Afastado' 
  | 'Transferido' 
  | 'Falecido';

export interface Member {
  id: string;
  churchId: string;
  name: string;
  photoUrl?: string;
  gender: 'M' | 'F';
  birthDate: string; // YYYY-MM-DD
  cpf?: string;
  rg?: string;
  maritalStatus: 'Solteiro(a)' | 'Casado(a)' | 'Divorciado(a)' | 'Viúvo(a)' | 'União Estável';
  profession?: string;
  education?: string;
  email?: string;
  phone?: string;
  whatsapp: string;
  
  // Endereço
  cep?: string;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;

  // Vida Cristã
  conversionDate?: string;
  conversionMonth?: string;
  conversionYear?: string;
  baptismDate?: string;
  baptismChurch?: string;
  entryDate?: string;
  previousChurch?: string;
  ministry?: string;
  smallGroupId?: string;
  churchRole?: string; // Diácono, Presbítero, Ministro, etc.
  talents?: string;
  status: MemberStatus;

  // Casamento (se casado)
  spouseId?: string;
  spouseName?: string;
  weddingDate?: string; // YYYY-MM-DD
  weddingPlace?: string;

  // Família
  familyId?: string;
  familyRole?: 'Pai' | 'Mãe' | 'Filho(a)' | 'Outro';

  createdAt: string;
  updatedAt?: string;
}

export interface Child {
  id: string;
  churchId: string;
  name: string;
  photoUrl?: string;
  gender: 'M' | 'F';
  birthDate: string; // YYYY-MM-DD
  fatherName?: string;
  motherName?: string;
  guardianName: string;
  guardianPhone: string;
  guardianWhatsapp: string;
  address?: string;
  school?: string;
  schoolGrade?: string;
  ebdClass?: string;
  ebdTeacher?: string;
  childrenMinistry?: string;
  conversionDate?: string;
  baptismDate?: string;
  notes?: string;
  familyId?: string;
  createdAt: string;
}

export interface FamilyChild {
  id: string;
  name: string;
  birthDate?: string;
  age?: number | string;
  phone?: string;
  gender?: 'M' | 'F';
  isChildRegistration?: boolean;
}

export interface Family {
  id: string;
  churchId: string;
  familyName: string; // Ex: "Família Silva"
  fatherId?: string;
  fatherName?: string;
  motherId?: string;
  motherName?: string;
  weddingDate?: string; // YYYY-MM-DD - Data do Casamento para mensagens de aniversário
  weddingPlace?: string;
  whatsapp?: string; // Telefone/WhatsApp do casal para felicitações
  phone?: string;
  hasChildren?: boolean;
  children: FamilyChild[];
  address?: string;
  notes?: string;
  createdAt: string;
}

export interface SmallGroupParticipant {
  id: string;
  memberId?: string;
  name: string;
  phone: string;
  role: 'líder' | 'co-líder' | 'participante' | 'visitante';
}

export interface SmallGroup {
  id: string;
  churchId: string;
  name: string;
  leaderId?: string;
  leaderName: string;
  leaderPhone: string;
  coLeaderId?: string;
  coLeaderName?: string;
  address: string;
  dayOfWeek: string; // "Segunda", "Terça", etc.
  time: string;      // "19:30"
  frequency: 'semanal' | 'quinzenal' | 'mensal' | 'outra';
  maxParticipants?: number;
  participantsCount: number;
  description: string;
  status: 'Ativo' | 'Em recesso' | 'Inativo';
  participants: SmallGroupParticipant[];
  createdAt: string;
}

export interface SmallGroupMeeting {
  id: string;
  churchId: string;
  smallGroupId: string;
  date: string;
  time: string;
  topic: string;
  biblicalText: string;
  presentCount: number;
  attendees: string[];
  absentees: string[];
  visitors: string[];
  notes: string;
  createdAt: string;
}

export interface Ministry {
  id: string;
  churchId: string;
  name: string;
  leaderName: string;
  leaderPhone?: string;
  viceLeaderName?: string;
  viceLeaderPhone?: string;
  meetingDay?: string;
  meetingTime?: string;
  location?: string;
  description?: string;
  membersCount: number;
  members: string[]; // nomes ou IDs
  volunteers?: string[]; // pessoas com desejo de servir
  createdAt: string;
}

export interface ScaleMemberItem {
  id?: string;
  name: string;
  role?: string; // ex: Voz, Teclado, Bateria, Recepção, Mídia, etc.
}

export interface MinistryScale {
  id: string;
  churchId: string;
  ministryId: string;
  ministryName: string;
  date: string; // YYYY-MM-DD
  time?: string; // ex: "18:30" ou "Culto Noturno"
  title?: string; // ex: Culto de Domingo Noite, Reunião de Jovens
  leaderName: string;
  leaderPhone: string; // Número de WhatsApp para envio da escala
  members: ScaleMemberItem[];
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}


export interface Leadership {
  id: string;
  churchId: string;
  name: string;
  photoUrl?: string;
  role: string; // "Pastor Presidente", "Pastor Auxiliar", "Diácono", "Presbítero", etc.
  phone?: string;
  whatsapp: string;
  email?: string;
  ministry?: string;
  startDate?: string;
  endDate?: string;
  observations?: string;
  createdAt: string;
}

export interface Schedule {
  id: string;
  churchId: string;
  title: string;
  dayOfWeek: string;
  tag: 'sun' | 'sat' | 'wed' | 'thu' | 'tue' | 'other';
  time: string;
  location: string;
  responsible?: string;
  description?: string;
  recurrence: 'semanal' | 'quinzenal' | 'mensal' | 'personalizada';
  createdAt: string;
}

export interface ChurchEvent {
  id: string;
  churchId: string;
  name: string;
  bannerUrl?: string;
  startDate: string;
  endDate?: string;
  time: string;
  location: string;
  description: string;
  responsible: string;
  organizer?: string;
  team?: string;
  registrationOpen: boolean;
  maxSpots?: number;
  spotsTaken: number;
  createdAt: string;
}

export type PastoralAppointmentType = 
  | 'aconselhamento' 
  | 'atendimento' 
  | 'orientação' 
  | 'casamento' 
  | 'família' 
  | 'liderança' 
  | 'batismo' 
  | 'oração' 
  | 'visita' 
  | 'membro' 
  | 'não membro' 
  | 'outro';

export interface PastoralAppointment {
  id: string;
  churchId: string;
  personName: string;
  memberId?: string;
  phone: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  durationMinutes: number;
  type: PastoralAppointmentType;
  status: 'agendado' | 'realizado' | 'cancelado';
  notes?: string;
  createdAt: string;
}

export interface PastoralVisit {
  id: string;
  churchId: string;
  personName: string;
  memberId?: string;
  phone?: string;
  address: string;
  date: string;
  visitorName: string;
  reason: string;
  notes?: string;
  returnNeeded: boolean;
  returnDate?: string;
  status: 'pendente' | 'realizada';
  createdAt: string;
}

export interface PrayerRequest {
  id: string;
  churchId: string;
  personName: string;
  phone?: string;
  category?: string;
  request: string;
  date: string;
  responsible?: string;
  notes?: string;
  status: 'novo' | 'em oração' | 'acompanhamento' | 'encerrado';
  createdAt: string;
}

export interface VisitorTouchpoint {
  date: string;
  type: '1º contato' | '2º contato' | '3º contato' | 'outro';
  channel: 'WhatsApp' | 'Ligação' | 'Visita' | 'Presencial';
  notes: string;
}

export interface Visitor {
  id: string;
  churchId: string;
  name: string;
  phone?: string;
  whatsapp: string;
  firstVisitDate: string;
  howMetChurch: string;
  notes?: string;
  touchpoints: VisitorTouchpoint[];
  status: 'novo' | 'contatado' | 'retornou' | 'tornou-se membro' | 'não localizado';
  createdAt: string;
}

export interface BibleClassStudent {
  id: string;
  name: string; // Nome Completo
  age?: number; // Idade
  phone?: string; // Telefone se houver
  enrolledAt: string; // Data da matrícula
  notes?: string;
}

export interface BibleClass {
  id: string;
  churchId: string;
  name: string; // Nome da Sala / Turma
  room: string; // Sala / Local (Ex: Sala 01, Salão Principal)
  scheduleTime: string; // Horário da Aula (Ex: 09:00 - 10:15)
  schedule?: string;
  teacher: string; // Professor Titular / Responsável
  teacherPhone?: string; // WhatsApp do professor
  assistantTeacher?: string; // Professor auxiliar
  ageGroup?: string; // Faixa etária / Público
  enrolledStudentsCount: number;
  students?: BibleClassStudent[]; // Lista de alunos matriculados
  notes?: string; // Tema, revista ou observações
  status?: 'Ativa' | 'Inativa';
  attendanceHistory?: {
    date: string;
    present: number;
    absent: number;
    visitors: number;
    notes?: string;
  }[];
  createdAt: string;
}

export interface BaptismRecord {
  id: string;
  churchId: string;
  personName: string;
  memberId?: string;
  phone?: string;
  conversionDate?: string;
  baptismDate?: string;
  didDiscipleship?: boolean;
  prepClass?: string;
  teacher?: string;
  scheduledDate?: string;
  status: 'preparando' | 'aprovado' | 'batizado' | 'pendente';
  notes?: string;
  createdAt: string;
}

export type FinancialEntryCategory = 
  | 'dízimos' 
  | 'ofertas' 
  | 'doações' 
  | 'campanhas' 
  | 'eventos' 
  | 'cantina' 
  | 'outros';

export type FinancialExpenseCategory = 
  | 'energia' 
  | 'água' 
  | 'internet' 
  | 'aluguel' 
  | 'salários' 
  | 'manutenção' 
  | 'missões' 
  | 'ação social' 
  | 'materiais' 
  | 'eventos' 
  | 'outros';

export type PaymentMethod = 
  | 'PIX' 
  | 'Dinheiro' 
  | 'Cartão de Débito' 
  | 'Cartão de Crédito' 
  | 'Transferência' 
  | 'Boleto' 
  | 'Outro';

export interface FinancialEntry {
  id: string;
  churchId: string;
  date: string; // YYYY-MM-DD
  description: string;
  category: FinancialEntryCategory;
  amount: number;
  paymentMethod: PaymentMethod;
  notes?: string;
  receiptNumber?: string;
  createdAt: string;
}

export interface FinancialExpense {
  id: string;
  churchId: string;
  date: string; // YYYY-MM-DD
  description: string;
  category: FinancialExpenseCategory;
  amount: number;
  paymentMethod: PaymentMethod;
  responsible: string;
  notes?: string;
  receiptNumber?: string;
  createdAt: string;
}

export interface FixedExpense {
  id: string;
  churchId: string;
  description: string;
  category: FinancialExpenseCategory;
  amount: number;
  dueDay: number; // Dia de vencimento (1 a 31)
  beneficiary?: string; // Favorecido / Empresa
  paymentMethod: PaymentMethod;
  notes?: string;
  isActive: boolean;
  lastPaidMonth?: string; // Mês do último pagamento efetuado (formato YYYY-MM)
  lastPaidDate?: string;  // Data exata do último pagamento efetuado (YYYY-MM-DD)
  lastExpenseId?: string; // ID da saída financeira correspondente no caixa
  createdAt: string;
}

export interface MessageTemplate {
  id: string;
  churchId: string;
  type: 'aniversario' | 'aniversario_casamento' | 'visitante' | 'acompanhamento' | 'aniversario_crianca';
  title: string;
  text: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  churchId: string;
  userName: string;
  userRole: string;
  action: string;
  details: string;
  timestamp: string;
}
