// ==========================================
// TIPOS E MODELOS DO SISTEMA GESTÃO IGREJA
// ==========================================

export type UserRole = 
  | 'SUPERADMIN'  // Saulo Monteiro (Acesso a todas as igrejas e SaaS)
  | 'ADMIN'       // Administrador da congregação
  | 'PASTOR'      // Acesso pastoral completo
  | 'SECRETARIA'  // Cadastros, membros, eventos, agenda
  | 'TESOURARIA'  // Exclusivo financeiro
  | 'LIDER_PG';   // Apenas o seu pequeno grupo

export interface Church {
  id: string;
  name: string;
  slug: string;
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
  dailyReportHour: string; // Ex: "07:30"
  financialPin: string;    // Padrão "0000" inicial
  financialPinChanged: boolean;
  isActive: boolean;
  createdAt: string;
}

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

export interface Family {
  id: string;
  churchId: string;
  familyName: string; // Ex: "Família Silva"
  fatherId?: string;
  fatherName?: string;
  motherId?: string;
  motherName?: string;
  children: { id: string; name: string; isChildRegistration?: boolean }[];
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
  viceLeaderName?: string;
  meetingDay?: string;
  meetingTime?: string;
  location?: string;
  description?: string;
  membersCount: number;
  members: string[]; // nomes ou IDs
  volunteers?: string[]; // pessoas com desejo de servir
  createdAt: string;
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
  registrationOpen: boolean;
  maxSpots?: number;
  spotsTaken: number;
  createdAt: string;
}

export type PastoralAppointmentType = 
  | 'aconselhamento' 
  | 'oração' 
  | 'visita' 
  | 'casamento' 
  | 'família' 
  | 'batismo' 
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

export interface BibleClass {
  id: string;
  churchId: string;
  name: string;
  teacher: string;
  schedule: string;
  enrolledStudentsCount: number;
  attendanceHistory: {
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
  conversionDate?: string;
  baptismDate?: string;
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
