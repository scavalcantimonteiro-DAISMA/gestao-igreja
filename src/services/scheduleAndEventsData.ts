import { Schedule, ChurchEvent } from '../types';

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

export const CBA_SCHEDULES = DEMO_SCHEDULES;
export const CBA_EVENTS = DEMO_EVENTS;
