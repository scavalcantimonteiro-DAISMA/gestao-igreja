import { 
  Church, 
  Member, 
  Child, 
  Family, 
  SmallGroup, 
  Ministry, 
  Leadership, 
  Schedule, 
  ChurchEvent, 
  PastoralAppointment, 
  PastoralVisit, 
  PrayerRequest, 
  Visitor, 
  BibleClass, 
  FinancialEntry, 
  FinancialExpense, 
  MessageTemplate, 
  AuditLog 
} from '../types';
import { CBA_MEMBERS } from './membersData';
import { CBA_MINISTRIES, CBA_LEADERSHIP } from './ministriesData';
import { CBA_SCHEDULES, CBA_EVENTS } from './scheduleAndEventsData';

export const INITIAL_CHURCHES: Church[] = [
  {
    id: 'church_cba_maceio',
    name: 'Comunidade Batista Acolher',
    slug: 'cbacolher',
    loginUser: 'cbacolher',
    loginPassword: '0000',
    address: 'Avenida Júlio Marquez Luz, 1409 (antiga Av. Jatiúca)',
    neighborhood: 'Jatiúca',
    city: 'Maceió',
    state: 'AL',
    zipCode: '57035-700',
    instagram: '@cbacolher',
    phone: '(82) 3325-1408',
    whatsapp: '5582997861774',
    website: 'https://cbacolher.com.br',
    logoUrl: '/logo-cba-completa.png',
    pastorName: 'Pr. Tércio Ribeiro',
    pastorPhone: '(82) 98225-9873',
    pastorWhatsapp: '5582982259873',
    dailyReportHour: '07:30',
    financialPin: '0000',
    financialPinChanged: false,
    isActive: true,
    createdAt: '2026-01-10T10:00:00Z'
  },
  {
    id: 'church_ib_capunga_parnamirim',
    name: 'Igreja Batista Capunga no Parnamirim',
    slug: 'ibcapunga',
    loginUser: 'ibcapunga',
    loginPassword: '0000',
    mustChangePassword: true,
    address: 'Parnamirim',
    neighborhood: 'Parnamirim',
    city: 'Recife',
    state: 'PE',
    instagram: '@ibcapunga',
    phone: '(81) 99999-9999',
    whatsapp: '5581999999999',
    pastorName: 'Pastor Titular',
    pastorPhone: '',
    pastorWhatsapp: '',
    dailyReportHour: '08:00',
    financialPin: '0000',
    financialPinChanged: false,
    isActive: true,
    createdAt: '2026-09-24T12:00:00Z'
  }
];

export const INITIAL_MEMBERS: Member[] = CBA_MEMBERS;

export const INITIAL_CHILDREN: Child[] = [];

export const INITIAL_FAMILIES: Family[] = [];

export const INITIAL_SMALL_GROUPS: SmallGroup[] = [];

export const INITIAL_MINISTRIES: Ministry[] = CBA_MINISTRIES;

export const INITIAL_LEADERSHIP: Leadership[] = CBA_LEADERSHIP;


export const INITIAL_SCHEDULES: Schedule[] = CBA_SCHEDULES;

export const INITIAL_EVENTS: ChurchEvent[] = CBA_EVENTS;

export const INITIAL_APPOINTMENTS: PastoralAppointment[] = [];

export const INITIAL_VISITS: PastoralVisit[] = [];

export const INITIAL_PRAYER_REQUESTS: PrayerRequest[] = [];

export const INITIAL_VISITORS: Visitor[] = [];

export const INITIAL_BIBLE_CLASSES: BibleClass[] = [
  {
    id: 'ebd_1',
    churchId: 'church_cba_maceio',
    name: 'Classe Berçário e Maternal (Cordeirinhos de Cristo)',
    room: 'Sala Infantil 01',
    scheduleTime: '09:00 - 10:15',
    schedule: 'Domingo às 09:00',
    teacher: 'Sarah Monteiro',
    teacherPhone: '(82) 99999-1111',
    assistantTeacher: 'Ana Paula Cavalcanti',
    ageGroup: '0 a 4 anos',
    enrolledStudentsCount: 8,
    notes: 'Revista Maternal: Deus Criou o Mundo. Material de pintura e brinquedos lúdicos.',
    status: 'Ativa',
    createdAt: '2026-01-10T10:00:00Z'
  },
  {
    id: 'ebd_2',
    churchId: 'church_cba_maceio',
    name: 'Classe Juniores (Soldados do Rei)',
    room: 'Sala 02 (Piso Superior)',
    scheduleTime: '09:00 - 10:15',
    schedule: 'Domingo às 09:00',
    teacher: 'Marcos Oliveira',
    teacherPhone: '(82) 99999-2222',
    assistantTeacher: 'Juliana Costa',
    ageGroup: '9 a 12 anos',
    enrolledStudentsCount: 15,
    notes: 'Revista Juniores: Heróis da Fé e os Ensinamentos de Jesus.',
    status: 'Ativa',
    createdAt: '2026-01-10T10:00:00Z'
  },
  {
    id: 'ebd_3',
    churchId: 'church_cba_maceio',
    name: 'Classe Jovens (Geração Eleita)',
    room: 'Salão Multiuso / Anexo',
    scheduleTime: '09:00 - 10:15',
    schedule: 'Domingo às 09:00',
    teacher: 'Diác. Lucas Pereira',
    teacherPhone: '(82) 99999-3333',
    assistantTeacher: 'Beatriz Almeida',
    ageGroup: '15 a 25 anos',
    enrolledStudentsCount: 22,
    notes: 'Estudos bíblicos temáticos sobre apologética, fé no mundo moderno e propósito.',
    status: 'Ativa',
    createdAt: '2026-01-10T10:00:00Z'
  },
  {
    id: 'ebd_4',
    churchId: 'church_cba_maceio',
    name: 'Classe Adultos & Famílias',
    room: 'Templo Principal',
    scheduleTime: '09:00 - 10:15',
    schedule: 'Domingo às 09:00',
    teacher: 'Pr. Tércio Ribeiro',
    teacherPhone: '(82) 98225-9873',
    ageGroup: 'Adultos e Casais',
    enrolledStudentsCount: 36,
    notes: 'Estudo das Epístolas Paulinas e fortalecimento da família cristã.',
    status: 'Ativa',
    createdAt: '2026-01-10T10:00:00Z'
  }
];

export const INITIAL_FINANCIAL_ENTRIES: FinancialEntry[] = [];

export const INITIAL_FINANCIAL_EXPENSES: FinancialExpense[] = [];

export const INITIAL_MESSAGE_TEMPLATES: MessageTemplate[] = [
  {
    id: 'tpl_1',
    churchId: 'church_cba_maceio',
    type: 'aniversario',
    title: 'Aniversário de Membro',
    text: 'Graça e Paz, {nome}! 🎂✨ A Comunidade Batista Acolher se alegra imensamente com a sua vida hoje! Que o Senhor derrame bênçãos abundantes de saúde, paz e muitas vitórias sobre você neste novo ciclo de {idade} anos. Feliz Aniversário!\n\nCom carinho e bênçãos pastorais,\n*Pr. Tércio Ribeiro*\nWhatsApp: +55 82 98225-9873\nComunidade Batista Acolher - "A chama que nos move é o amor! ❤️‍🔥"',
    updatedAt: '2026-01-10T00:00:00Z'
  },
  {
    id: 'tpl_2',
    churchId: 'church_cba_maceio',
    type: 'aniversario_casamento',
    title: 'Aniversário de Casamento',
    text: 'Graça e Paz, {nome}! 💍 Hoje celebramos com vocês mais um abençoado ano de casamento ({anos_casamento} anos!). Que Deus continue guardando e fortalecendo cada dia mais a aliança de vocês. "A chama que nos move é o amor! ❤️‍🔥"\n\nCom bênçãos pastorais,\n*Pr. Tércio Ribeiro*\nWhatsApp: +55 82 98225-9873\nComunidade Batista Acolher',
    updatedAt: '2026-01-10T00:00:00Z'
  },
  {
    id: 'tpl_3',
    churchId: 'church_cba_maceio',
    type: 'visitante',
    title: 'Acolhimento de Visitante',
    text: 'Graça e Paz, {nome}! 👋⛪ Foi uma grande alegria receber você na Comunidade Batista Acolher. Nossas portas e corações estão sempre abertos para você e sua família. "A chama que nos move é o amor! ❤️‍🔥"\n\nUm abraço fraterno,\n*Pr. Tércio Ribeiro*\nWhatsApp: +55 82 98225-9873\nComunidade Batista Acolher',
    updatedAt: '2026-01-10T00:00:00Z'
  },
  {
    id: 'tpl_4',
    churchId: 'church_cba_maceio',
    type: 'acompanhamento',
    title: 'Acompanhamento Pastoral',
    text: 'Graça e Paz, {nome}! 🙏📖 Passando para saber como você está e reforçar que estou orando pela sua vida e família. Se precisar de uma palavra, oração ou visita pastoral, estou sempre à disposição.\n\nCom orações e carinho,\n*Pr. Tércio Ribeiro*\nWhatsApp: +55 82 98225-9873\nComunidade Batista Acolher',
    updatedAt: '2026-01-10T00:00:00Z'
  },
  {
    id: 'tpl_5',
    churchId: 'church_cba_maceio',
    type: 'aniversario_crianca',
    title: 'Aniversário Infantil (Departamento Infantil)',
    text: 'Parabéns, {nome}! 🎈 Hoje o Departamento Infantil e toda a nossa igreja estão em festa pelo seu aniversário! Que o Papai do Céu continue te enchendo de amor, sabedoria e muita alegria. Feliz aniversário! 🎂🎉🥳\n\nCom carinho e bênçãos,\n*Pr. Tércio Ribeiro*\nWhatsApp: +55 82 98225-9873\nComunidade Batista Acolher',
    updatedAt: '2026-01-10T00:00:00Z'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [];
