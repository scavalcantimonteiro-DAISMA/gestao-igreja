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
  FixedExpense, 
  MessageTemplate, 
  AuditLog 
} from '../types';
import { CBA_MEMBERS, DEMO_MEMBERS } from './membersData';
import { CBA_MINISTRIES, CBA_LEADERSHIP, DEMO_MINISTRIES, DEMO_LEADERSHIP } from './ministriesData';
import { CBA_SCHEDULES, CBA_EVENTS, DEMO_SCHEDULES, DEMO_EVENTS } from './scheduleAndEventsData';

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
    pastoralOfficeName: 'Gabinete Pastoral CBA',
    pastoralOfficeWhatsapp: '5582982259873',
    secretaryName: 'Secretaria CBA',
    secretaryWhatsapp: '5582997861774',
    dailyReportHour: '07:30',
    financialPin: '0000',
    financialPinChanged: false,
    isActive: true,
    createdAt: '2026-01-10T10:00:00Z'
  },
  {
    id: 'church_demo',
    name: 'Igreja Batista Betel (Demonstração)',
    slug: 'beteldemo',
    loginUser: 'demo',
    loginPassword: '0000',
    address: 'Av. das Nações, 1000 - Centro',
    neighborhood: 'Centro',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '01000-000',
    instagram: '@beteldemo',
    phone: '(11) 3333-5555',
    whatsapp: '5511988880000',
    website: 'https://beteldemo.com.br',
    pastorName: 'Pr. Marcos Aurélio Silveira',
    pastorPhone: '(11) 98888-0001',
    pastorWhatsapp: '5511988880001',
    dailyReportHour: '08:00',
    financialPin: '0000',
    financialPinChanged: false,
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z'
  }
];

export const INITIAL_MEMBERS: Member[] = [...CBA_MEMBERS, ...DEMO_MEMBERS];

export const INITIAL_CHILDREN: Child[] = [];

export const INITIAL_FAMILIES: Family[] = [];

export const INITIAL_SMALL_GROUPS: SmallGroup[] = [];

export const INITIAL_MINISTRIES: Ministry[] = [...CBA_MINISTRIES, ...DEMO_MINISTRIES];

export const INITIAL_LEADERSHIP: Leadership[] = [...CBA_LEADERSHIP, ...DEMO_LEADERSHIP];

export const INITIAL_SCHEDULES: Schedule[] = [...CBA_SCHEDULES, ...DEMO_SCHEDULES];

export const INITIAL_EVENTS: ChurchEvent[] = [...CBA_EVENTS, ...DEMO_EVENTS];

export const INITIAL_APPOINTMENTS: PastoralAppointment[] = [];

export const INITIAL_VISITS: PastoralVisit[] = [];

export const INITIAL_PRAYER_REQUESTS: PrayerRequest[] = [];

export const INITIAL_VISITORS: Visitor[] = [];

export const INITIAL_BIBLE_CLASSES: BibleClass[] = [
  // Classes da CBA
  {
    id: 'ebd_1',
    churchId: 'church_cba_maceio',
    name: 'Classe Berçário e Maternal (Cordeirinhos de Cristo)',
    room: 'Sala Infantil 01',
    scheduleTime: '17:00 - 18:15',
    schedule: 'Domingo às 17:00',
    teacher: 'Sarah Monteiro',
    teacherPhone: '(82) 99999-1111',
    assistantTeacher: 'Ana Paula Cavalcanti',
    ageGroup: '0 a 4 anos',
    enrolledStudentsCount: 3,
    students: [
      { id: 'std_1', name: 'Benjamin Cavalcanti', age: 3, phone: '(82) 98225-9873', enrolledAt: '2026-01-10', notes: 'Filho de Saulo e Sarah' },
      { id: 'std_2', name: 'Laura Beatriz Lima', age: 4, phone: '(82) 99123-4567', enrolledAt: '2026-01-15' },
      { id: 'std_3', name: 'Noah Gabriel Santos', age: 2, phone: '(82) 98765-4321', enrolledAt: '2026-02-01' }
    ],
    notes: 'Revista Maternal: Deus Criou o Mundo. Material de pintura e brinquedos lúdicos.',
    status: 'Ativa',
    createdAt: '2026-01-10T10:00:00Z'
  },
  {
    id: 'ebd_2',
    churchId: 'church_cba_maceio',
    name: 'Classe Juniores (Soldados do Rei)',
    room: 'Sala 02 (Piso Superior)',
    scheduleTime: '17:00 - 18:15',
    schedule: 'Domingo às 17:00',
    teacher: 'Marcos Oliveira',
    teacherPhone: '(82) 99999-2222',
    assistantTeacher: 'Juliana Costa',
    ageGroup: '9 a 12 anos',
    enrolledStudentsCount: 3,
    students: [
      { id: 'std_4', name: 'Matheus Henrique Silva', age: 10, phone: '(82) 98888-1234', enrolledAt: '2026-01-12' },
      { id: 'std_5', name: 'Rebeca Souza Oliveira', age: 11, phone: '(82) 98777-5678', enrolledAt: '2026-01-18' },
      { id: 'std_6', name: 'Davi Lucas Pereira', age: 9, phone: '(82) 98111-9999', enrolledAt: '2026-02-05' }
    ],
    notes: 'Revista Juniores: Heróis da Fé e os Ensinamentos de Jesus.',
    status: 'Ativa',
    createdAt: '2026-01-10T10:00:00Z'
  },
  {
    id: 'ebd_3',
    churchId: 'church_cba_maceio',
    name: 'Classe Jovens (Geração Eleita)',
    room: 'Salão Multiuso / Anexo',
    scheduleTime: '17:00 - 18:15',
    schedule: 'Domingo às 17:00',
    teacher: 'Diác. Lucas Pereira',
    teacherPhone: '(82) 99999-3333',
    assistantTeacher: 'Beatriz Almeida',
    ageGroup: '15 a 25 anos',
    enrolledStudentsCount: 3,
    students: [
      { id: 'std_7', name: 'Gabriel Santos Almeida', age: 18, phone: '(82) 99333-4444', enrolledAt: '2026-01-10' },
      { id: 'std_8', name: 'Isabela Rocha Vieira', age: 17, phone: '(82) 99444-5555', enrolledAt: '2026-01-10' },
      { id: 'std_9', name: 'Thiago Martins Costa', age: 20, phone: '(82) 99555-6666', enrolledAt: '2026-01-15' }
    ],
    notes: 'Estudos bíblicos temáticos sobre apologética, fé no mundo moderno e propósito.',
    status: 'Ativa',
    createdAt: '2026-01-10T10:00:00Z'
  },
  {
    id: 'ebd_4',
    churchId: 'church_cba_maceio',
    name: 'Classe Adultos & Famílias',
    room: 'Templo Principal',
    scheduleTime: '17:00 - 18:15',
    schedule: 'Domingo às 17:00',
    teacher: 'Pr. Tércio Ribeiro',
    teacherPhone: '(82) 98225-9873',
    ageGroup: 'Adultos e Casais',
    enrolledStudentsCount: 3,
    students: [
      { id: 'std_10', name: 'Carlos Eduardo Mendes', age: 42, phone: '(82) 99666-7777', enrolledAt: '2026-01-10' },
      { id: 'std_11', name: 'Fernanda Lima Mendes', age: 39, phone: '(82) 99777-8888', enrolledAt: '2026-01-10' },
      { id: 'std_12', name: 'Roberto Carlos Silveira', age: 55, phone: '(82) 99888-9999', enrolledAt: '2026-01-15' }
    ],
    notes: 'Estudo das Epístolas Paulinas e fortalecimento da família cristã.',
    status: 'Ativa',
    createdAt: '2026-01-10T10:00:00Z'
  },
  // Classes da Demonstração
  {
    id: 'ebd_demo_1',
    churchId: 'church_demo',
    name: 'Classe Infantil (Cordeirinhos de Cristo)',
    room: 'Sala Infantil 01',
    scheduleTime: '09:00 - 10:15',
    schedule: 'Domingo às 09:00',
    teacher: 'Mariana Costa Ramos',
    teacherPhone: '(11) 98888-0004',
    assistantTeacher: 'Camila Duarte Souza',
    ageGroup: '0 a 6 anos',
    enrolledStudentsCount: 3,
    students: [
      { id: 'std_demo_1', name: 'Lucas Henrique Silva', age: 4, phone: '(11) 98888-0101', enrolledAt: '2026-01-10', notes: 'Material lúdico' },
      { id: 'std_demo_2', name: 'Laura Beatriz Lima', age: 5, phone: '(11) 98888-0102', enrolledAt: '2026-01-15' },
      { id: 'std_demo_3', name: 'Noah Gabriel Santos', age: 3, phone: '(11) 98888-0103', enrolledAt: '2026-02-01' }
    ],
    notes: 'Revista Maternal: Deus Criou o Mundo. Atividades pedagógicas e pintura.',
    status: 'Ativa',
    createdAt: '2026-01-10T10:00:00Z'
  },
  {
    id: 'ebd_demo_2',
    churchId: 'church_demo',
    name: 'Classe Adultos & Famílias',
    room: 'Templo Principal',
    scheduleTime: '09:00 - 10:15',
    schedule: 'Domingo às 09:00',
    teacher: 'Roberto Carlos Silveira',
    teacherPhone: '(11) 98888-0012',
    assistantTeacher: 'Juliana Costa Silveira',
    ageGroup: 'Adultos e Casais',
    enrolledStudentsCount: 3,
    students: [
      { id: 'std_demo_10', name: 'Paulo Ricardo Mendes', age: 44, phone: '(11) 98888-0110', enrolledAt: '2026-01-10' },
      { id: 'std_demo_11', name: 'Fernanda Lima Ribeiro', age: 39, phone: '(11) 98888-0016', enrolledAt: '2026-01-10' }
    ],
    notes: 'Estudos bíblicos aprofundados sobre família cristã e doutrinas essenciais.',
    status: 'Ativa',
    createdAt: '2026-01-10T10:00:00Z'
  }
];

export const INITIAL_FINANCIAL_ENTRIES: FinancialEntry[] = [
  // Entradas da CBA
  {
    id: 'ent_1',
    churchId: 'church_cba_maceio',
    date: '2026-01-18',
    description: 'Dízimos e Ofertas - Culto da Família',
    category: 'dízimos',
    amount: 14500,
    paymentMethod: 'PIX',
    notes: 'Arrecadação semanal de Janeiro',
    createdAt: '2026-01-18T12:00:00Z'
  },
  {
    id: 'ent_2',
    churchId: 'church_cba_maceio',
    date: '2026-02-15',
    description: 'Dízimos e Ofertas - Culto de Celebração',
    category: 'dízimos',
    amount: 15200,
    paymentMethod: 'PIX',
    notes: 'Arrecadação de Fevereiro',
    createdAt: '2026-02-15T12:00:00Z'
  },
  {
    id: 'ent_3',
    churchId: 'church_cba_maceio',
    date: '2026-03-22',
    description: 'Dízimos, Ofertas e Campanha de Missões',
    category: 'ofertas',
    amount: 16800,
    paymentMethod: 'PIX',
    notes: 'Campanha de Missões Estaduais',
    createdAt: '2026-03-22T12:00:00Z'
  },
  {
    id: 'ent_4',
    churchId: 'church_cba_maceio',
    date: '2026-04-19',
    description: 'Dízimos e Ofertas de Celebração',
    category: 'dízimos',
    amount: 15900,
    paymentMethod: 'PIX',
    notes: 'Culto de Páscoa e Gratidão',
    createdAt: '2026-04-19T12:00:00Z'
  },
  {
    id: 'ent_5',
    churchId: 'church_cba_maceio',
    date: '2026-05-17',
    description: 'Dízimos e Ofertas - Mês da Família',
    category: 'dízimos',
    amount: 17400,
    paymentMethod: 'PIX',
    notes: 'Culto Especial das Mães e Famílias',
    createdAt: '2026-05-17T12:00:00Z'
  },
  {
    id: 'ent_6',
    churchId: 'church_cba_maceio',
    date: '2026-06-21',
    description: 'Dízimos e Ofertas Dominicais',
    category: 'dízimos',
    amount: 16100,
    paymentMethod: 'PIX',
    notes: 'Mês de Junho',
    createdAt: '2026-06-21T12:00:00Z'
  },
  {
    id: 'ent_7',
    churchId: 'church_cba_maceio',
    date: '2026-07-19',
    description: 'Dízimos e Ofertas de Gratidão',
    category: 'dízimos',
    amount: 18200,
    paymentMethod: 'PIX',
    notes: 'Arrecadação de Julho',
    createdAt: '2026-07-19T12:00:00Z'
  },
  {
    id: 'ent_8',
    churchId: 'church_cba_maceio',
    date: '2026-08-16',
    description: 'Dízimos e Ofertas - Dia dos Pais',
    category: 'dízimos',
    amount: 17900,
    paymentMethod: 'PIX',
    notes: 'Culto de Celebração Especial',
    createdAt: '2026-08-16T12:00:00Z'
  },
  {
    id: 'ent_9',
    churchId: 'church_cba_maceio',
    date: '2026-09-20',
    description: 'Dízimos e Ofertas de Celebração',
    category: 'dízimos',
    amount: 19350,
    paymentMethod: 'PIX',
    notes: 'Culto de Celebração de Setembro',
    createdAt: '2026-09-20T12:00:00Z'
  },
  // Entradas da Demo
  {
    id: 'ent_demo_1',
    churchId: 'church_demo',
    date: '2026-09-20',
    description: 'Dízimos e Ofertas Dominicais',
    category: 'dízimos',
    amount: 8500,
    paymentMethod: 'PIX',
    notes: 'Arrecadação de Setembro',
    createdAt: '2026-09-20T12:00:00Z'
  }
];

export const INITIAL_FINANCIAL_EXPENSES: FinancialExpense[] = [
  // Despesas da CBA
  {
    id: 'exp_1',
    churchId: 'church_cba_maceio',
    date: '2026-01-10',
    description: 'Aluguel do Templo e Manutenção',
    category: 'aluguel',
    amount: 9200,
    paymentMethod: 'Transferência',
    responsible: 'Tesouraria',
    notes: 'Despesas correntes de Janeiro',
    createdAt: '2026-01-10T10:00:00Z'
  },
  {
    id: 'exp_2',
    churchId: 'church_cba_maceio',
    date: '2026-02-10',
    description: 'Aluguel, Energia e Internet',
    category: 'aluguel',
    amount: 8900,
    paymentMethod: 'Transferência',
    responsible: 'Tesouraria',
    notes: 'Despesas correntes de Fevereiro',
    createdAt: '2026-02-10T10:00:00Z'
  },
  {
    id: 'exp_3',
    churchId: 'church_cba_maceio',
    date: '2026-03-10',
    description: 'Aluguel, Energia e Repasse Missionário',
    category: 'aluguel',
    amount: 9850,
    paymentMethod: 'Transferência',
    responsible: 'Tesouraria',
    notes: 'Despesas correntes de Março',
    createdAt: '2026-03-10T10:00:00Z'
  },
  {
    id: 'exp_4',
    churchId: 'church_cba_maceio',
    date: '2026-04-10',
    description: 'Aluguel do Templo e Custos Operacionais',
    category: 'aluguel',
    amount: 9100,
    paymentMethod: 'Transferência',
    responsible: 'Tesouraria',
    notes: 'Despesas de Abril',
    createdAt: '2026-04-10T10:00:00Z'
  },
  {
    id: 'exp_5',
    churchId: 'church_cba_maceio',
    date: '2026-05-10',
    description: 'Aluguel, Manutenção e Evento das Mães',
    category: 'aluguel',
    amount: 10300,
    paymentMethod: 'Transferência',
    responsible: 'Tesouraria',
    notes: 'Despesas de Maio',
    createdAt: '2026-05-10T10:00:00Z'
  },
  {
    id: 'exp_6',
    churchId: 'church_cba_maceio',
    date: '2026-06-10',
    description: 'Aluguel do Templo e Manutenção Som',
    category: 'aluguel',
    amount: 9400,
    paymentMethod: 'Transferência',
    responsible: 'Tesouraria',
    notes: 'Despesas de Junho',
    createdAt: '2026-06-10T10:00:00Z'
  },
  {
    id: 'exp_7',
    churchId: 'church_cba_maceio',
    date: '2026-07-10',
    description: 'Aluguel, Energia e Reforma Anexo Infantil',
    category: 'manutenção',
    amount: 10800,
    paymentMethod: 'Transferência',
    responsible: 'Tesouraria',
    notes: 'Despesas de Julho',
    createdAt: '2026-07-10T10:00:00Z'
  },
  {
    id: 'exp_8',
    churchId: 'church_cba_maceio',
    date: '2026-08-10',
    description: 'Aluguel do Templo e Contas Públicas',
    category: 'aluguel',
    amount: 9950,
    paymentMethod: 'Transferência',
    responsible: 'Tesouraria',
    notes: 'Despesas de Agosto',
    createdAt: '2026-08-10T10:00:00Z'
  },
  {
    id: 'exp_9',
    churchId: 'church_cba_maceio',
    date: '2026-09-10',
    description: 'Aluguel do Templo, Prebenda e Operacional',
    category: 'aluguel',
    amount: 10200,
    paymentMethod: 'Transferência',
    responsible: 'Tesouraria',
    notes: 'Despesas correntes de Setembro',
    createdAt: '2026-09-10T10:00:00Z'
  },
  // Despesas da Demo
  {
    id: 'exp_demo_1',
    churchId: 'church_demo',
    date: '2026-09-10',
    description: 'Aluguel do Templo e Manutenção',
    category: 'aluguel',
    amount: 3500,
    paymentMethod: 'Transferência',
    responsible: 'Tesouraria',
    notes: 'Despesas correntes de Setembro',
    createdAt: '2026-09-10T10:00:00Z'
  }
];

export const INITIAL_FIXED_EXPENSES: FixedExpense[] = [
  // Fixas da CBA
  {
    id: 'fix_1',
    churchId: 'church_cba_maceio',
    description: 'Aluguel do Templo Principal',
    category: 'aluguel',
    amount: 3500,
    dueDay: 10,
    beneficiary: 'Locador do Imóvel',
    paymentMethod: 'Transferência',
    isActive: true,
    notes: 'Vencimento todo dia 10',
    createdAt: '2026-01-10T10:00:00Z'
  },
  {
    id: 'fix_2',
    churchId: 'church_cba_maceio',
    description: 'Energia Elétrica (Equatorial)',
    category: 'energia',
    amount: 850,
    dueDay: 15,
    beneficiary: 'Equatorial Energia AL',
    paymentMethod: 'Boleto',
    isActive: true,
    notes: 'Conta de luz do templo',
    createdAt: '2026-01-10T10:00:00Z'
  },
  {
    id: 'fix_3',
    churchId: 'church_cba_maceio',
    description: 'Internet Fibra Óptica Alta Velocidade',
    category: 'internet',
    amount: 180,
    dueDay: 20,
    beneficiary: 'Provedor Fibra',
    paymentMethod: 'PIX',
    isActive: true,
    notes: 'Transmissão ao vivo dos cultos e secretaria',
    createdAt: '2026-01-10T10:00:00Z'
  },
  {
    id: 'fix_4',
    churchId: 'church_cba_maceio',
    description: 'Prebenda Pastoral (Pastor Titular)',
    category: 'salários',
    amount: 4500,
    dueDay: 5,
    beneficiary: 'Pr. Tércio Ribeiro',
    paymentMethod: 'PIX',
    isActive: true,
    notes: 'Sustento pastoral mensal',
    createdAt: '2026-01-10T10:00:00Z'
  },
  {
    id: 'fix_5',
    churchId: 'church_cba_maceio',
    description: 'Repasse Missionário e Ação Social',
    category: 'missões',
    amount: 1000,
    dueDay: 25,
    beneficiary: 'Junta de Missões',
    paymentMethod: 'PIX',
    isActive: true,
    notes: 'Sustento de missionários no campo',
    createdAt: '2026-01-10T10:00:00Z'
  },
  // Fixas da Demo
  {
    id: 'fix_demo_1',
    churchId: 'church_demo',
    description: 'Aluguel do Espaço',
    category: 'aluguel',
    amount: 3000,
    dueDay: 10,
    beneficiary: 'Locador',
    paymentMethod: 'Transferência',
    isActive: true,
    notes: 'Vencimento todo dia 10',
    createdAt: '2026-01-10T10:00:00Z'
  }
];

export const INITIAL_MESSAGE_TEMPLATES: MessageTemplate[] = [
  // Templates da CBA
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
  },
  // Templates da Demo
  {
    id: 'tpl_demo_1',
    churchId: 'church_demo',
    type: 'aniversario',
    title: 'Aniversário de Membro',
    text: 'Graça e Paz, {nome}! 🎂✨ Nos alegramos imensamente com a sua vida hoje! Que o Senhor derrame bênçãos abundantes de saúde, paz e muitas vitórias sobre você neste novo ciclo de {idade} anos. Feliz Aniversário!\n\nCom carinho e bênçãos pastorais,\n*Pr. Marcos Aurélio Silveira*\nIgreja Batista Betel',
    updatedAt: '2026-01-10T00:00:00Z'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [];
