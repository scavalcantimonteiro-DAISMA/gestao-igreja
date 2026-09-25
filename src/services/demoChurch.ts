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
  PrayerRequest, 
  Visitor, 
  FinancialEntry, 
  FinancialExpense 
} from '../types';
import { 
  saveChurch, 
  getChurches, 
  saveMember, 
  saveChild, 
  saveFamily, 
  saveSmallGroup, 
  saveMinistry, 
  saveLeadership, 
  saveSchedule, 
  saveEvent, 
  savePastoralAppointment, 
  savePrayerRequest, 
  saveVisitor, 
  saveFinancialEntry, 
  saveFinancialExpense 
} from './storage';

export const DEMO_CHURCH_ID = 'church_demo';

// Logomarca exclusiva elegante em SVG (Cruz dourada e escudo azul real)
const DEMO_LOGO_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%231E3A8A"/><stop offset="100%" stop-color="%230284C7"/></linearGradient></defs><rect width="200" height="200" rx="40" fill="url(%23g)"/><path d="M100 35 L160 70 L160 135 L100 170 L40 135 L40 70 Z" fill="none" stroke="%23F59E0B" stroke-width="6" stroke-linejoin="round"/><path d="M100 55 L100 145 M75 85 L125 85" stroke="%23FBBF24" stroke-width="10" stroke-linecap="round"/><circle cx="100" cy="55" r="5" fill="%23FFFFFF"/><text x="100" y="185" text-anchor="middle" fill="%23FFFFFF" font-family="sans-serif" font-weight="900" font-size="14" letter-spacing="2">BETEL DEMO</text></svg>`;

export function setupDemoChurch(): Church {
  const churches = getChurches();
  const existing = churches.find(c => c.id === DEMO_CHURCH_ID || c.loginUser === 'demo');

  const demoData: Church = {
    id: DEMO_CHURCH_ID,
    name: 'Igreja Batista Betel (Ambiente Demonstração)',
    slug: 'beteldemo',
    loginUser: 'demo',
    loginPassword: 'demo',
    address: 'Av. das Nações, 1000 - Centro',
    neighborhood: 'Centro',
    city: 'São Paulo',
    state: 'SP',
    instagram: '@beteldemo',
    phone: '(11) 3333-5555',
    whatsapp: '5511988880000',
    logoUrl: DEMO_LOGO_SVG,
    pastorName: 'Pr. Marcos Aurélio Silveira',
    pastorPhone: '(11) 98888-0001',
    pastorWhatsapp: '5511988880001',
    dailyReportHour: '08:00',
    financialPin: '0000',
    financialPinChanged: false,
    isActive: true,
    createdAt: new Date().toISOString()
  };

  saveChurch(demoData);

  // 1. Membros Demonstrativos (Dados Ricos e Diversificados)
  const demoMembers: Partial<Member>[] = [
    {
      id: 'mem_demo_1',
      churchId: DEMO_CHURCH_ID,
      name: 'Carlos Eduardo Oliveira',
      gender: 'M',
      phone: '(11) 99123-4567',
      whatsapp: '5511991234567',
      email: 'carlos.oliveira@email.com',
      churchRole: 'Diácono',
      status: 'Ativo',
      maritalStatus: 'Casado(a)',
      spouseName: 'Juliana Mendes Oliveira',
      weddingDate: '2015-10-12',
      birthDate: '1985-09-22', // Aniversariante de Hoje!
      baptismDate: '2005-11-15',
      neighborhood: 'Centro',
      city: 'São Paulo',
      state: 'SP',
      ministry: 'Diaconia e Acolhimento',
      smallGroupId: 'pg_demo_1'
    },
    {
      id: 'mem_demo_2',
      churchId: DEMO_CHURCH_ID,
      name: 'Juliana Mendes Oliveira',
      gender: 'F',
      phone: '(11) 99345-6789',
      whatsapp: '5511993456789',
      email: 'juliana.mendes@email.com',
      churchRole: 'Líder de Louvor',
      status: 'Ativo',
      maritalStatus: 'Casado(a)',
      spouseName: 'Carlos Eduardo Oliveira',
      weddingDate: '2015-10-12',
      birthDate: '1988-09-25', // Aniversariante desta semana!
      baptismDate: '2010-06-20',
      neighborhood: 'Centro',
      city: 'São Paulo',
      state: 'SP',
      ministry: 'Ministério de Louvor & Adoração',
      smallGroupId: 'pg_demo_1'
    },
    {
      id: 'mem_demo_3',
      churchId: DEMO_CHURCH_ID,
      name: 'Roberto Vasconcelos',
      gender: 'M',
      phone: '(11) 98765-4321',
      whatsapp: '5511987654321',
      email: 'roberto.vasc@email.com',
      churchRole: 'Professor EBD',
      status: 'Ativo',
      maritalStatus: 'Casado(a)',
      birthDate: '1978-04-12',
      baptismDate: '1996-08-10',
      neighborhood: 'Farol',
      city: 'São Paulo',
      state: 'SP',
      ministry: 'Ensino Bíblico (EBD)',
      smallGroupId: 'pg_demo_2'
    },
    {
      id: 'mem_demo_4',
      churchId: DEMO_CHURCH_ID,
      name: 'Mariana Duarte Alencar',
      gender: 'F',
      phone: '(11) 99654-1122',
      whatsapp: '5511996541122',
      email: 'mariana.alencar@email.com',
      churchRole: 'Coordenadora Infantil',
      status: 'Ativo',
      maritalStatus: 'Solteiro(a)',
      birthDate: '1990-12-05',
      baptismDate: '2008-03-23',
      neighborhood: 'Pajuçara',
      city: 'São Paulo',
      state: 'SP',
      ministry: 'Departamento Infantil',
      smallGroupId: 'pg_demo_3'
    },
    {
      id: 'mem_demo_5',
      churchId: DEMO_CHURCH_ID,
      name: 'Gabriel Siqueira Rocha',
      gender: 'M',
      phone: '(11) 99888-2233',
      whatsapp: '5511998882233',
      email: 'gabriel.rocha@email.com',
      churchRole: 'Líder de Mídia',
      status: 'Ativo',
      maritalStatus: 'Solteiro(a)',
      birthDate: '1998-07-14',
      baptismDate: '2016-12-18',
      neighborhood: 'Jardim América',
      city: 'São Paulo',
      state: 'SP',
      ministry: 'Mídia & Transmissão',
      smallGroupId: 'pg_demo_3'
    },
    {
      id: 'mem_demo_6',
      churchId: DEMO_CHURCH_ID,
      name: 'Beatriz Fontes Camargo',
      gender: 'F',
      phone: '(11) 99777-4455',
      whatsapp: '5511997774455',
      email: 'beatriz.fontes@email.com',
      churchRole: 'Secretária Executiva',
      status: 'Ativo',
      maritalStatus: 'Casado(a)',
      birthDate: '1984-03-30',
      baptismDate: '2002-05-19',
      neighborhood: 'Mangabeiras',
      city: 'São Paulo',
      state: 'SP',
      ministry: 'Secretaria & Apoio',
      smallGroupId: 'pg_demo_2'
    },
    {
      id: 'mem_demo_7',
      churchId: DEMO_CHURCH_ID,
      name: 'Lucas Ferreira Lima',
      gender: 'M',
      phone: '(11) 99666-8899',
      whatsapp: '5511996668899',
      email: 'lucas.lima@email.com',
      churchRole: 'Músico (Baterista)',
      status: 'Ativo',
      maritalStatus: 'Solteiro(a)',
      birthDate: '2001-11-20',
      baptismDate: '2019-09-08',
      neighborhood: 'Cruz das Almas',
      city: 'São Paulo',
      state: 'SP',
      ministry: 'Ministério de Louvor & Adoração',
      smallGroupId: 'pg_demo_3'
    },
    {
      id: 'mem_demo_8',
      churchId: DEMO_CHURCH_ID,
      name: 'Ana Cláudia Pinheiro',
      gender: 'F',
      phone: '(11) 99555-3322',
      whatsapp: '5511995553322',
      email: 'ana.pinheiro@email.com',
      churchRole: 'Tesoureira',
      status: 'Ativo',
      maritalStatus: 'Casado(a)',
      birthDate: '1979-08-16',
      baptismDate: '1998-04-10',
      neighborhood: 'Ponta Verde',
      city: 'São Paulo',
      state: 'SP',
      ministry: 'Administração & Finanças',
      smallGroupId: 'pg_demo_1'
    }
  ];

  demoMembers.forEach(m => saveMember(m as Member));

  // 2. Crianças (Kids)
  const demoChildren: Partial<Child>[] = [
    {
      id: 'child_demo_1',
      churchId: DEMO_CHURCH_ID,
      name: 'Lucas Mendes Oliveira',
      gender: 'M',
      birthDate: '2020-03-15',
      guardianName: 'Carlos Eduardo Oliveira',
      guardianPhone: '(11) 99123-4567',
      guardianWhatsapp: '5511991234567',
      notes: 'Sem alergias',
      ebdClass: 'Juniores (6-8 anos)'
    },
    {
      id: 'child_demo_2',
      churchId: DEMO_CHURCH_ID,
      name: 'Sofia Duarte Alencar',
      gender: 'F',
      birthDate: '2022-07-20',
      guardianName: 'Mariana Duarte Alencar',
      guardianPhone: '(11) 99654-1122',
      guardianWhatsapp: '5511996541122',
      notes: 'Alérgica a amendoim',
      ebdClass: 'Maternal (3-5 anos)'
    },
    {
      id: 'child_demo_3',
      churchId: DEMO_CHURCH_ID,
      name: 'Davi Pinheiro Fontes',
      gender: 'M',
      birthDate: '2018-10-05',
      guardianName: 'Ana Cláudia Pinheiro',
      guardianPhone: '(11) 99555-3322',
      guardianWhatsapp: '5511995553322',
      notes: 'Intolerância à lactose',
      ebdClass: 'Primários (9-11 anos)'
    }
  ];
  demoChildren.forEach(c => saveChild(c as Child));

  // 3. Pequenos Grupos (PGs)
  const demoPGs: Partial<SmallGroup>[] = [
    {
      id: 'pg_demo_1',
      churchId: DEMO_CHURCH_ID,
      name: 'PG Conexão Centro',
      leaderName: 'Carlos Eduardo Oliveira',
      leaderPhone: '(11) 99123-4567',
      address: 'Rua das Palmeiras, 110 - Centro',
      dayOfWeek: 'Quinta-feira',
      time: '20:00',
      frequency: 'semanal',
      participantsCount: 12,
      description: 'Célula de comunhão e oração para famílias da Centro.',
      status: 'Ativo',
      participants: []
    },
    {
      id: 'pg_demo_2',
      churchId: DEMO_CHURCH_ID,
      name: 'PG Farol da Esperança',
      leaderName: 'Roberto Vasconcelos',
      leaderPhone: '(11) 98765-4321',
      address: 'Rua Cincinato Pinto, 44 - Farol',
      dayOfWeek: 'Quarta-feira',
      time: '19:30',
      frequency: 'semanal',
      participantsCount: 10,
      description: 'Estudo das cartas paulinas e edificação de casais.',
      status: 'Ativo',
      participants: []
    },
    {
      id: 'pg_demo_3',
      churchId: DEMO_CHURCH_ID,
      name: 'PG Jovens Betel',
      leaderName: 'Gabriel Siqueira Rocha',
      leaderPhone: '(11) 99888-2233',
      address: 'Av. Jardim América, 450 - Jardim América',
      dayOfWeek: 'Sexta-feira',
      time: '20:30',
      frequency: 'semanal',
      participantsCount: 16,
      description: 'Discipulado jovem, louvor acústico e evangelismo.',
      status: 'Ativo',
      participants: []
    }
  ];
  demoPGs.forEach(pg => saveSmallGroup(pg as SmallGroup));

  // 4. Ministérios
  const demoMinistries: Partial<Ministry>[] = [
    {
      id: 'min_demo_1',
      churchId: DEMO_CHURCH_ID,
      name: 'Ministério de Louvor & Adoração',
      leaderName: 'Juliana Mendes Oliveira',
      meetingDay: 'Sábado',
      meetingTime: '16:00',
      membersCount: 8,
      members: ['Juliana Mendes Oliveira', 'Lucas Ferreira Lima'],
      description: 'Condução dos momentos de adoração e celebração nos cultos.'
    },
    {
      id: 'min_demo_2',
      churchId: DEMO_CHURCH_ID,
      name: 'Mídia, Som & Transmissão',
      leaderName: 'Gabriel Siqueira Rocha',
      meetingDay: 'Domingo',
      meetingTime: '16:30',
      membersCount: 6,
      members: ['Gabriel Siqueira Rocha'],
      description: 'Operação da mesa de som, projeção de letras e transmissão ao vivo no YouTube.'
    },
    {
      id: 'min_demo_3',
      churchId: DEMO_CHURCH_ID,
      name: 'Departamento Infantil',
      leaderName: 'Mariana Duarte Alencar',
      meetingDay: 'Domingo',
      meetingTime: '16:45',
      membersCount: 7,
      members: ['Mariana Duarte Alencar'],
      description: 'Acolhimento e ensino bíblico lúdico e seguro para as crianças durante as celebrações.'
    },
    {
      id: 'min_demo_4',
      churchId: DEMO_CHURCH_ID,
      name: 'Diaconia, Recepção & Acolhimento',
      leaderName: 'Carlos Eduardo Oliveira',
      meetingDay: 'Domingo',
      meetingTime: '17:30',
      membersCount: 9,
      members: ['Carlos Eduardo Oliveira'],
      description: 'Porta de entrada, recepção com carinho de novos visitantes e apoio logístico nos cultos.'
    }
  ];
  demoMinistries.forEach(m => saveMinistry(m as Ministry));

  // 5. Programação e Cultos
  const demoSchedules: Partial<Schedule>[] = [
    {
      id: 'sched_demo_1',
      churchId: DEMO_CHURCH_ID,
      title: 'Escola Bíblica Discipuladora (EBD)',
      dayOfWeek: 'Domingo',
      time: '17:00',
      tag: 'sun',
      location: 'Templo Sede',
      recurrence: 'semanal',
      description: 'Estudos bíblicos temáticos por classes com intervalo de café da comunhão às 18h15.'
    },
    {
      id: 'sched_demo_2',
      churchId: DEMO_CHURCH_ID,
      title: 'Celebração & Culto da Família',
      dayOfWeek: 'Domingo',
      time: '18:30',
      tag: 'sun',
      location: 'Nave Principal',
      recurrence: 'semanal',
      description: 'Grande culto congregacional, ministração da Palavra e Departamento Infantil para crianças.'
    },
    {
      id: 'sched_demo_3',
      churchId: DEMO_CHURCH_ID,
      title: 'Noite de Edificação e Oração',
      dayOfWeek: 'Quarta-feira',
      time: '19:30',
      tag: 'wed',
      location: 'Templo Sede',
      recurrence: 'semanal',
      description: 'Reunião de intercessão da liderança e estudo expositivo das Escrituras.'
    }
  ];
  demoSchedules.forEach(s => saveSchedule(s as Schedule));

  // 6. Eventos Especiais
  const demoEvents: Partial<ChurchEvent>[] = [
    {
      id: 'ev_demo_1',
      churchId: DEMO_CHURCH_ID,
      name: 'Conferência da Família Cristã 2026',
      startDate: '2026-10-17',
      endDate: '2026-10-19',
      location: 'Auditório Betel Sede',
      description: 'Três dias de palestras sobre casamento blindado, criação de filhos e finanças no lar.'
    },
    {
      id: 'ev_demo_2',
      churchId: DEMO_CHURCH_ID,
      name: 'Vigília Jovem: Avivamento & Santidade',
      startDate: '2026-11-07',
      endDate: '2026-11-07',
      location: 'Templo Sede',
      description: 'Noite inteira de clamor, oração pelos jovens e adoração contínua.'
    }
  ];
  demoEvents.forEach(e => saveEvent(e as ChurchEvent));

  // 7. Atendimentos Pastorais (Gabinete)
  const demoAppointments: Partial<PastoralAppointment>[] = [
    {
      id: 'app_demo_1',
      churchId: DEMO_CHURCH_ID,
      personName: 'Carlos Eduardo Oliveira',
      date: new Date().toISOString().split('T')[0],
      time: '14:30',
      type: 'aconselhamento',
      durationMinutes: 45,
      phone: '(11) 99123-4567',
      status: 'agendado',
      notes: 'Alinhamento da escala da diaconia e momento de oração.'
    },
    {
      id: 'app_demo_2',
      churchId: DEMO_CHURCH_ID,
      personName: 'Roberto Vasconcelos',
      date: new Date().toISOString().split('T')[0],
      time: '16:00',
      type: 'visita',
      durationMinutes: 60,
      phone: '(11) 98765-4321',
      status: 'agendado',
      notes: 'Visita pastoral à família Vasconcelos.'
    }
  ];
  demoAppointments.forEach(a => savePastoralAppointment(a as PastoralAppointment));

  // 8. Visitantes
  const demoVisitors: Partial<Visitor>[] = [
    {
      id: 'vis_demo_1',
      churchId: DEMO_CHURCH_ID,
      name: 'Fabiano Augusto Medeiros',
      phone: '(11) 99111-2233',
      whatsapp: '5511991112233',
      firstVisitDate: new Date().toISOString().split('T')[0],
      howMetChurch: 'Convite de amigo (Carlos Oliveira)',
      notes: 'Visitou no culto de domingo, gostou muito do acolhimento e deixou o contato para visitação.',
      touchpoints: [
        {
          date: new Date().toISOString().split('T')[0],
          type: '1º contato',
          channel: 'WhatsApp',
          notes: 'Mensagem de boas-vindas enviada com sucesso.'
        }
      ],
      status: 'novo'
    }
  ];
  demoVisitors.forEach(v => saveVisitor(v as Visitor));

  // 9. Pedidos de Oração
  const demoPrayers: Partial<PrayerRequest>[] = [
    {
      id: 'pray_demo_1',
      churchId: DEMO_CHURCH_ID,
      personName: 'Juliana Mendes Oliveira',
      request: 'Oração pela saúde da minha mãe e por nova porta de emprego para meu irmão.',
      date: new Date().toISOString().split('T')[0],
      status: 'em oração'
    }
  ];
  demoPrayers.forEach(p => savePrayerRequest(p as PrayerRequest));

  // 10. Movimentação Financeira Demonstrativa (Saldo Positivo e Realista)
  const demoEntries: Partial<FinancialEntry>[] = [
    {
      id: 'entry_demo_1',
      churchId: DEMO_CHURCH_ID,
      amount: 8500,
      description: 'Dízimos do 1º Domingo do Mês',
      category: 'dízimos',
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'PIX'
    },
    {
      id: 'entry_demo_2',
      churchId: DEMO_CHURCH_ID,
      amount: 4200,
      description: 'Ofertas da Celebração da Família',
      category: 'ofertas',
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'Dinheiro'
    },
    {
      id: 'entry_demo_3',
      churchId: DEMO_CHURCH_ID,
      amount: 2150,
      description: 'Campanha de Missões no Sertão',
      category: 'campanhas',
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'PIX'
    }
  ];
  demoEntries.forEach(e => saveFinancialEntry(e as FinancialEntry));

  const demoExpenses: Partial<FinancialExpense>[] = [
    {
      id: 'exp_demo_1',
      churchId: DEMO_CHURCH_ID,
      amount: 980,
      description: 'Energia Elétrica Templo Sede (Equatorial)',
      category: 'energia',
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'Boleto',
      responsible: 'Tesouraria'
    },
    {
      id: 'exp_demo_2',
      churchId: DEMO_CHURCH_ID,
      amount: 320,
      description: 'Material Didático & Lanche para EBD Betel',
      category: 'materiais',
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'PIX',
      responsible: 'Secretaria'
    },
    {
      id: 'exp_demo_3',
      churchId: DEMO_CHURCH_ID,
      amount: 450,
      description: 'Manutenção de Microfones e Cabos de Som',
      category: 'manutenção',
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'Cartão de Débito',
      responsible: 'Mídia'
    }
  ];
  demoExpenses.forEach(ex => saveFinancialExpense(ex as FinancialExpense));

  return demoData;
}

