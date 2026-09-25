import { Schedule, ChurchEvent } from '../types';

export const CBA_SCHEDULES: Schedule[] = [
  {
    id: 'sched_cba_dom_noite',
    churchId: 'church_cba_maceio',
    title: 'Celebra├º├úo Dominical',
    dayOfWeek: 'Domingo',
    tag: 'sun',
    time: '18:30',
    location: 'Templo Principal (Av. J├║lio Marques Luz, 1409)',
    responsible: 'Pr. T├®rcio Ribeiro',
    description: 'Culto congregacional de celebra├º├úo da fam├¡lia, adora├º├úo com louvor congregacional e ministra├º├úo da Palavra. "A chama que nos move ├® o amor! ÔØñ´©ÅÔÇì­ƒöÑ"',
    recurrence: 'semanal',
    createdAt: '2026-01-15T18:30:00.000Z'
  },
  {
    id: 'sched_cba_terca_encontro',
    churchId: 'church_cba_maceio',
    title: 'Ter├ºa do Encontro',
    dayOfWeek: 'Ter├ºa-feira',
    tag: 'tue',
    time: '19:30',
    location: 'Templo Principal',
    responsible: 'Pr. T├®rcio Ribeiro & Equipe Pastoral',
    description: 'Encontro semanal de ora├º├úo, estudo b├¡blico aprofundado, renovo espiritual e comunh├úo no meio de semana.',
    recurrence: 'semanal',
    createdAt: '2026-01-15T19:30:00.000Z'
  },
  {
    id: 'sched_cba_dom_ebd',
    churchId: 'church_cba_maceio',
    title: 'Escola B├¡blica Discipular (EBD)',
    dayOfWeek: 'Domingo',
    tag: 'sun',
    time: '17:00',
    location: 'Templo e Salas Educacionais',
    responsible: 'Renata Cristina Queiroga & Equipe de Ensino',
    description: 'Estudos b├¡blicos tem├íticos aos domingos ├ás 17h para todas as faixas et├írias (crian├ºas, jovens, casais e adultos), preparando para a celebra├º├úo das 18h30.',
    recurrence: 'semanal',
    createdAt: '2026-01-15T10:00:00.000Z'
  },
  {
    id: 'sched_cba_acolher_kids',
    churchId: 'church_cba_maceio',
    title: 'Departamento Infantil (Culto Infantil)',
    dayOfWeek: 'Domingo',
    tag: 'sun',
    time: '18:30',
    location: 'Espa├ºo do Departamento Infantil',
    responsible: 'Marcela da Mota & Alexia Brand├úo',
    description: 'Culto tem├ítico din├ómico, hist├│rias b├¡blicas e acolhimento dedicado para crian├ºas durante o culto noturno.',
    recurrence: 'semanal',
    createdAt: '2026-01-15T18:30:00.000Z'
  },
  {
    id: 'sched_cba_conectados_jovens',
    churchId: 'church_cba_maceio',
    title: 'Culto da Juventude - Conectados CBA',
    dayOfWeek: 'S├íbado',
    tag: 'sat',
    time: '19:30',
    location: 'Templo Principal',
    responsible: 'Marcos Henrique No├® & Mylenna Correia',
    description: 'Culto jovem com louvor contempor├óneo, mensagem inspiradora, din├ómicas e forte comunh├úo.',
    recurrence: 'quinzenal',
    createdAt: '2026-01-15T19:30:00.000Z'
  },
  {
    id: 'sched_cba_conexoes_pg',
    churchId: 'church_cba_maceio',
    title: 'Encontro das Conex├Áes (Pequenos Grupos)',
    dayOfWeek: 'Quinta-feira',
    tag: 'thu',
    time: '20:00',
    location: 'Resid├¬ncias dos L├¡deres nos Bairros (Jati├║ca, Ponta Verde, Serraria)',
    responsible: 'Lideran├ºa de Conex├Áes',
    description: 'Comunh├úo fraternal, ora├º├úo m├║tua e compartilhamento da Palavra de Deus nos lares.',
    recurrence: 'semanal',
    createdAt: '2026-01-15T20:00:00.000Z'
  }
];

export const CBA_EVENTS: ChurchEvent[] = [
  {
    id: 'event_cba_mulheres_2026',
    churchId: 'church_cba_maceio',
    name: 'Congresso de Mulheres Acolher: Curadas para Curar',
    bannerUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=1200&auto=format&fit=crop&q=80',
    startDate: '2026-10-24',
    endDate: '2026-10-25',
    time: '19:00',
    location: 'Templo CBA - Av. J├║lio Marques Luz, 1409, Jati├║ca',
    description: 'Edi├º├úo oficial do Congresso de Mulheres da CBAcolher com preletoras convidadas, ministra├º├Áes sobre restaura├º├úo emocional, prop├│sito e identidade em Deus. "A chama que nos move ├® o amor!"',
    responsible: '├ërica Renata Vilela & Minist├®rio de Mulheres',
    registrationOpen: true,
    maxSpots: 250,
    spotsTaken: 114,
    createdAt: '2026-01-20T10:00:00.000Z'
  },
  {
    id: 'event_cba_retiro_2026',
    churchId: 'church_cba_maceio',
    name: 'Retiro Espiritual Acolher: Enquanto ├® Dia',
    bannerUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&auto=format&fit=crop&q=80',
    startDate: '2026-11-14',
    endDate: '2026-11-17',
    time: '08:00',
    location: 'S├¡tio das Palmeiras - Regi├úo Metropolitana de Macei├│',
    description: 'Dias intensos na presen├ºa do Senhor com tempo de consagra├º├úo, oficinas b├¡blicas, lazer familiar e renovo espiritual completo para a congrega├º├úo.',
    responsible: 'Pr. T├®rcio Ribeiro & Conselho Pastoral',
    registrationOpen: true,
    maxSpots: 180,
    spotsTaken: 92,
    createdAt: '2026-01-20T10:00:00.000Z'
  },
  {
    id: 'event_cba_casais_2026',
    churchId: 'church_cba_maceio',
    name: 'Confer├¬ncia da Fam├¡lia & Casais: Edificados no Amor',
    bannerUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&auto=format&fit=crop&q=80',
    startDate: '2026-09-26',
    endDate: '2026-09-27',
    time: '19:30',
    location: 'Templo Principal CBA - Macei├│',
    description: 'Fim de semana especial dedicado ao fortalecimento dos casamentos, princ├¡pios b├¡blicos para finan├ºas no lar, educa├º├úo dos filhos e edifica├º├úo familiar.',
    responsible: 'Alyeskey Almeida & Minist├®rio de Fam├¡lias',
    registrationOpen: true,
    maxSpots: 200,
    spotsTaken: 145,
    createdAt: '2026-01-20T10:00:00.000Z'
  },
  {
    id: 'event_cba_conectados_2026',
    churchId: 'church_cba_maceio',
    name: 'Confer├¬ncia Conectados 2026: A Chama Que Nos Move',
    bannerUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&auto=format&fit=crop&q=80',
    startDate: '2026-12-05',
    endDate: '2026-12-06',
    time: '19:00',
    location: 'Templo CBA',
    description: 'A grande confer├¬ncia de juventude da CBAcolher com bandas convidadas de adora├º├úo, mensagens de impacto e clamor por despertamento espiritual.',
    responsible: 'Marcos Henrique No├® & Mylenna Correia',
    registrationOpen: true,
    maxSpots: 300,
    spotsTaken: 180,
    createdAt: '2026-01-20T10:00:00.000Z'
  },
  {
    id: 'event_cba_acao_social_2026',
    churchId: 'church_cba_maceio',
    name: 'A├º├úo Social CBA: Amor em A├º├úo',
    bannerUrl: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=1200&auto=format&fit=crop&q=80',
    startDate: '2026-10-12',
    time: '09:00',
    location: 'Comunidade Adjacente - Jati├║ca / Macei├│',
    description: 'Mutir├úo comunit├írio do Dia das Crian├ºas com doa├º├úo de cestas b├ísicas, brinquedoteca com o Departamento Infantil, cortes de cabelo gratuitos e acolhimento com a Palavra de Deus.',
    responsible: 'M├┤nica L├║cia Ferreira & Pedro Caetano',
    registrationOpen: true,
    maxSpots: 80,
    spotsTaken: 45,
    createdAt: '2026-01-20T10:00:00.000Z'
  },
  {
    id: 'event_cba_vigilia_2026',
    churchId: 'church_cba_maceio',
    name: 'Vig├¡lia Congregacional: Chama Viva',
    bannerUrl: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=1200&auto=format&fit=crop&q=80',
    startDate: '2026-10-31',
    time: '22:30',
    location: 'Templo Principal CBA',
    description: 'Vig├¡lia de clamor pela cidade de Macei├│, pelas fam├¡lias da igreja, pelos enfermos e busca intensa pela manifesta├º├úo do Esp├¡rito Santo.',
    responsible: 'Pr. T├®rcio Ribeiro & Pr. Saulo Monteiro',
    registrationOpen: true,
    maxSpots: 200,
    spotsTaken: 88,
    createdAt: '2026-01-20T10:00:00.000Z'
  }
];




export const DEMO_SCHEDULES: Schedule[] = [
  {
    id: 'sched_demo_dom_manha',
    churchId: 'church_demo',
    title: 'Escola Bíblica Discipular (EBD)',
    dayOfWeek: 'Domingo',
    tag: 'sun',
    time: '09:00',
    location: 'Salas Educacionais',
    responsible: 'Equipe Pedagógica EBD',
    description: 'Estudos bíblicos temáticos para todas as idades (infantil, jovens, casais e adultos).',
    recurrence: 'semanal',
    createdAt: '2026-01-15T09:00:00.000Z'
  },
  {
    id: 'sched_demo_dom_noite',
    churchId: 'church_demo',
    title: 'Culto de Celebração Dominical',
    dayOfWeek: 'Domingo',
    tag: 'sun',
    time: '18:00',
    location: 'Templo Principal',
    responsible: 'Pr. Marcos Aurélio Silveira',
    description: 'Culto congregacional de celebração da família, adoração com louvor e ministração da Palavra.',
    recurrence: 'semanal',
    createdAt: '2026-01-15T18:00:00.000Z'
  },
  {
    id: 'sched_demo_quarta_oracao',
    churchId: 'church_demo',
    title: 'Culto de Oração & Estudo Bíblico',
    dayOfWeek: 'Quarta-feira',
    tag: 'wed',
    time: '19:30',
    location: 'Templo Principal',
    responsible: 'Equipe Pastoral',
    description: 'Encontro semanal de oração, estudo bíblico aprofundado e comunhão cristã.',
    recurrence: 'semanal',
    createdAt: '2026-01-15T19:30:00.000Z'
  },
  {
    id: 'sched_demo_kids',
    churchId: 'church_demo',
    title: 'Culto Infantil (Kids)',
    dayOfWeek: 'Domingo',
    tag: 'sun',
    time: '18:00',
    location: 'Espaço Infantil',
    responsible: 'Mariana Costa Ramos & Camila Duarte',
    description: 'Culto temático dinâmico, histórias bíblicas e atividades lúdicas para as crianças.',
    recurrence: 'semanal',
    createdAt: '2026-01-15T18:00:00.000Z'
  },
  {
    id: 'sched_demo_jovens',
    churchId: 'church_demo',
    title: 'Culto da Juventude',
    dayOfWeek: 'Sábado',
    tag: 'sat',
    time: '19:30',
    location: 'Templo Principal',
    responsible: 'Gabriel Almeida Santos',
    description: 'Culto jovem com louvor contemporâneo, reflexões bíblicas e comunhão.',
    recurrence: 'quinzenal',
    createdAt: '2026-01-15T19:30:00.000Z'
  },
  {
    id: 'sched_demo_pg',
    churchId: 'church_demo',
    title: 'Pequenos Grupos nos Lares',
    dayOfWeek: 'Quinta-feira',
    tag: 'thu',
    time: '20:00',
    location: 'Residências dos Líderes nos Bairros',
    responsible: 'Liderança de Pequenos Grupos',
    description: 'Comunhão fraternal, oração mútua e compartilhamento da Palavra de Deus nos lares.',
    recurrence: 'semanal',
    createdAt: '2026-01-15T20:00:00.000Z'
  }
];

export const DEMO_EVENTS: ChurchEvent[] = [
  {
    id: 'event_demo_conferencia_familias',
    churchId: 'church_demo',
    name: 'Conferência da Família & Casais',
    bannerUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&auto=format&fit=crop&q=80',
    startDate: '2026-10-18',
    endDate: '2026-10-19',
    time: '19:30',
    location: 'Templo Principal',
    description: 'Fim de semana dedicado ao fortalecimento dos casamentos e famílias segundo os princípios bíblicos.',
    responsible: 'Roberto Carlos Silveira & Ministério de Famílias',
    registrationOpen: true,
    maxSpots: 200,
    spotsTaken: 110,
    createdAt: '2026-01-20T10:00:00.000Z'
  },
  {
    id: 'event_demo_congresso_mulheres',
    churchId: 'church_demo',
    name: 'Congresso Feminino: Mulheres Edificadas',
    bannerUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=1200&auto=format&fit=crop&q=80',
    startDate: '2026-11-07',
    endDate: '2026-11-08',
    time: '19:00',
    location: 'Templo Principal',
    description: 'Encontro com palestras, ministrações e momentos de profunda comunhão e oração.',
    responsible: 'Fernanda Lima Ribeiro & Ministério de Mulheres',
    registrationOpen: true,
    maxSpots: 250,
    spotsTaken: 135,
    createdAt: '2026-01-20T10:00:00.000Z'
  },
  {
    id: 'event_demo_acao_social',
    churchId: 'church_demo',
    name: 'Ação Social Comunitária',
    bannerUrl: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=1200&auto=format&fit=crop&q=80',
    startDate: '2026-10-12',
    time: '09:00',
    location: 'Bairro Comunitário',
    description: 'Mutirão com arrecadação e entrega de cestas básicas, recreação infantil e acolhimento.',
    responsible: 'Patrícia Helena Lima & Equipe de Ação Social',
    registrationOpen: true,
    maxSpots: 80,
    spotsTaken: 52,
    createdAt: '2026-01-20T10:00:00.000Z'
  },
  {
    id: 'event_demo_vigilia',
    churchId: 'church_demo',
    name: 'Vigília de Oração e Avivamento',
    bannerUrl: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=1200&auto=format&fit=crop&q=80',
    startDate: '2026-10-31',
    time: '22:00',
    location: 'Templo Principal',
    description: 'Noite de intercessão pela cidade, pelas famílias da congregação e renovo espiritual.',
    responsible: 'Pr. Marcos Aurélio Silveira & Equipe Pastoral',
    registrationOpen: true,
    maxSpots: 200,
    spotsTaken: 75,
    createdAt: '2026-01-20T10:00:00.000Z'
  }
];




