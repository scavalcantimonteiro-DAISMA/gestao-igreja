import { Ministry, Leadership } from '../types';

export const DEMO_MINISTRIES: Ministry[] = [
  {
    id: "min_infantil",
    churchId: "church_demo",
    name: "Departamento Infantil",
    leaderName: "Mariana Costa Ramos",
    viceLeaderName: "Camila Duarte Souza",
    meetingDay: "Domingo",
    meetingTime: "09:00 e 18:00",
    location: "Salas do Departamento Infantil",
    description: "Ensino bíblico, acolhimento e discipulado de crianças durante as celebrações.",
    membersCount: 8,
    members: [
      "Mariana Costa Ramos",
      "Camila Duarte Souza",
      "Ana Cristina Silveira",
      "Juliana Costa Silveira",
      "Fernanda Lima Ribeiro",
      "Letícia Campos Guimarães",
      "Clara Maria Silveira",
      "Amanda Vieira Castro"
    ],
    volunteers: [
      "Beatriz Camargo Santos",
      "Sofia Rocha Martins",
      "Larissa Moreira Silva"
    ],
    createdAt: "2026-01-15T10:00:00.000Z"
  },
  {
    id: "min_louvor",
    churchId: "church_demo",
    name: "Ministério de Louvor & Adoração",
    leaderName: "Lucas Rocha Martins",
    viceLeaderName: "Rafael Mendes Farias",
    meetingDay: "Sábado",
    meetingTime: "16:00",
    location: "Templo Principal",
    description: "Condução do louvor congregacional, adoração bíblica e ensaios musicais.",
    membersCount: 7,
    members: [
      "Lucas Rocha Martins",
      "Rafael Mendes Farias",
      "Gabriel Almeida Santos",
      "Beatriz Camargo Santos",
      "Thiago Neves Barbosa",
      "Matheus Henrique Silva",
      "Sofia Rocha Martins"
    ],
    volunteers: [
      "Felipe Augusto Lima",
      "Rodrigo Dias Castro"
    ],
    createdAt: "2026-01-15T10:00:00.000Z"
  },
  {
    id: "min_midia",
    churchId: "church_demo",
    name: "Mídia & Tecnologia",
    leaderName: "Thiago Neves Barbosa",
    viceLeaderName: "Beatriz Camargo Santos",
    meetingDay: "Quarta e Domingo",
    meetingTime: "18:00",
    location: "Mesa de Som e Cabine de Transmissão",
    description: "Gestão de som, projeção, transmissão ao vivo e redes sociais da congregação.",
    membersCount: 6,
    members: [
      "Thiago Neves Barbosa",
      "Beatriz Camargo Santos",
      "Gabriel Almeida Santos",
      "Matheus Henrique Silva",
      "Larissa Moreira Silva",
      "Lucas Rocha Martins"
    ],
    volunteers: [
      "Felipe Augusto Lima",
      "Davi Lucas Silveira"
    ],
    createdAt: "2026-01-15T10:00:00.000Z"
  },
  {
    id: "min_social",
    churchId: "church_demo",
    name: "Ação Social & Comunidade",
    leaderName: "Patrícia Helena Lima",
    viceLeaderName: "Paulo Ricardo Mendes",
    meetingDay: "Sábado (quinzenal)",
    meetingTime: "09:00",
    location: "Salão Comunitário e Bairros Atendidos",
    description: "Distribuição de cestas básicas, visitas comunitárias e apoio a famílias.",
    membersCount: 6,
    members: [
      "Patrícia Helena Lima",
      "Paulo Ricardo Mendes",
      "Carlos Eduardo Oliveira",
      "Fernanda Lima Ribeiro",
      "Roberto Carlos Silveira",
      "Juliana Costa Silveira"
    ],
    volunteers: [
      "Fernando Albuquerque",
      "Mariana Costa Ramos"
    ],
    createdAt: "2026-01-15T10:00:00.000Z"
  },
  {
    id: "min_familia",
    churchId: "church_demo",
    name: "Ministério de Famílias & Casais",
    leaderName: "Roberto Carlos Silveira",
    viceLeaderName: "Juliana Costa Silveira",
    meetingDay: "Sexta-feira (mensal)",
    meetingTime: "19:30",
    location: "Templo Principal",
    description: "Encontros de casais, fortalecimento dos lares e aconselhamento familiar.",
    membersCount: 6,
    members: [
      "Roberto Carlos Silveira",
      "Juliana Costa Silveira",
      "Carlos Eduardo Oliveira",
      "Mariana Costa Ramos",
      "Paulo Ricardo Mendes",
      "Patrícia Helena Lima"
    ],
    volunteers: [
      "Fernando Albuquerque",
      "Ana Cristina Silveira"
    ],
    createdAt: "2026-01-15T10:00:00.000Z"
  },
  {
    id: "min_recepcao",
    churchId: "church_demo",
    name: "Ministério de Recepção & Acolhimento",
    leaderName: "Rodrigo Dias Castro",
    viceLeaderName: "Ana Cristina Silveira",
    meetingDay: "Domingo",
    meetingTime: "08:30 e 18:30",
    location: "Porta Principal e Átrio",
    description: "Boas-vindas calorosas, acolhimento de visitantes e integração de novos membros.",
    membersCount: 5,
    members: [
      "Rodrigo Dias Castro",
      "Ana Cristina Silveira",
      "Letícia Campos Guimarães",
      "Amanda Vieira Castro",
      "Larissa Moreira Silva"
    ],
    volunteers: [
      "Clara Maria Silveira",
      "Sofia Rocha Martins"
    ],
    createdAt: "2026-01-15T10:00:00.000Z"
  },
  {
    id: "min_juventude",
    churchId: "church_demo",
    name: "Juventude & Adolescentes",
    leaderName: "Gabriel Almeida Santos",
    viceLeaderName: "Beatriz Camargo Santos",
    meetingDay: "Sábado",
    meetingTime: "19:30",
    location: "Templo Principal",
    description: "Cultos de jovens, dinâmicas, comunhão bíblica e evangelismo criativo.",
    membersCount: 6,
    members: [
      "Gabriel Almeida Santos",
      "Beatriz Camargo Santos",
      "Lucas Rocha Martins",
      "Thiago Neves Barbosa",
      "Matheus Henrique Silva",
      "Sofia Rocha Martins"
    ],
    volunteers: [
      "Felipe Augusto Lima",
      "Larissa Moreira Silva"
    ],
    createdAt: "2026-01-15T10:00:00.000Z"
  },
  {
    id: "min_mulheres",
    churchId: "church_demo",
    name: "Ministério de Mulheres",
    leaderName: "Fernanda Lima Ribeiro",
    viceLeaderName: "Juliana Costa Silveira",
    meetingDay: "Quinta-feira",
    meetingTime: "19:30",
    location: "Templo Principal",
    description: "Edificação espiritual feminina, chás de comunhão e intercessão contínua.",
    membersCount: 6,
    members: [
      "Fernanda Lima Ribeiro",
      "Juliana Costa Silveira",
      "Mariana Costa Ramos",
      "Patrícia Helena Lima",
      "Ana Cristina Silveira",
      "Letícia Campos Guimarães"
    ],
    volunteers: [
      "Amanda Vieira Castro",
      "Camila Duarte Souza"
    ],
    createdAt: "2026-01-15T10:00:00.000Z"
  }
];

export const DEMO_LEADERSHIP: Leadership[] = [
  {
    id: "lead_pastor_titular",
    churchId: "church_demo",
    name: "Pr. Marcos Aurélio Silveira",
    role: "Pastor Titular",
    phone: "(11) 98888-0001",
    whatsapp: "5511988880001",
    email: "pastor@igrejabetel.com.br",
    ministry: "Pastoral Geral",
    startDate: "2020-01-01",
    observations: "Pastor Titular e Presidente do Ministério Pastoral.",
    createdAt: "2026-01-15T10:00:00.000Z"
  },
  {
    id: "lead_vice_pastor",
    churchId: "church_demo",
    name: "Diác. Fernando Albuquerque",
    role: "Equipe Pastoral & Gabinete",
    phone: "(11) 98888-0002",
    whatsapp: "5511988880002",
    email: "fernando@igrejabetel.com.br",
    ministry: "Pastoral & Gabinete",
    startDate: "2022-01-01",
    observations: "Aconselhamento pastoral, visitas e apoio ministerial.",
    createdAt: "2026-01-15T10:00:00.000Z"
  },
  {
    id: "lead_fiscal_carlos",
    churchId: "church_demo",
    name: "Carlos Eduardo Oliveira",
    role: "Presidente do Conselho Fiscal",
    phone: "(11) 98888-0003",
    whatsapp: "5511988880003",
    ministry: "Conselho Fiscal & Financeiro",
    startDate: "2024-01-01",
    observations: "Auditoria contábil, conferência de relatórios e transparência.",
    createdAt: "2026-01-15T10:00:00.000Z"
  },
  {
    id: "lead_infantil_mariana",
    churchId: "church_demo",
    name: "Mariana Costa Ramos",
    role: "Líder do Ministério Infantil",
    phone: "(11) 98888-0004",
    whatsapp: "5511988880004",
    ministry: "Departamento Infantil",
    startDate: "2023-02-01",
    observations: "Coordenação pedagógica e discipulado infantil.",
    createdAt: "2026-01-15T10:00:00.000Z"
  },
  {
    id: "lead_infantil_camila",
    churchId: "church_demo",
    name: "Camila Duarte Souza",
    role: "Vice-Líder Ministério Infantil",
    phone: "(11) 98888-0005",
    whatsapp: "5511988880005",
    ministry: "Departamento Infantil",
    startDate: "2023-02-01",
    observations: "Apoio pedagógico e escalas de professoras.",
    createdAt: "2026-01-15T10:00:00.000Z"
  },
  {
    id: "lead_louvor_lucas",
    churchId: "church_demo",
    name: "Lucas Rocha Martins",
    role: "Ministro de Louvor",
    phone: "(11) 98888-0006",
    whatsapp: "5511988880006",
    ministry: "Louvor & Adoração",
    startDate: "2021-06-01",
    observations: "Direção musical e escalas da equipe de louvor.",
    createdAt: "2026-01-15T10:00:00.000Z"
  },
  {
    id: "lead_louvor_rafael",
    churchId: "church_demo",
    name: "Rafael Mendes Farias",
    role: "Vice-Líder de Louvor",
    phone: "(11) 98888-0007",
    whatsapp: "5511988880007",
    ministry: "Louvor & Adoração",
    startDate: "2022-01-01",
    observations: "Apoio instrumental e arranjos vocais.",
    createdAt: "2026-01-15T10:00:00.000Z"
  },
  {
    id: "lead_midia_thiago",
    churchId: "church_demo",
    name: "Thiago Neves Barbosa",
    role: "Coordenador de Mídia e Transmissão",
    phone: "(11) 98888-0008",
    whatsapp: "5511988880008",
    ministry: "Mídia & Tecnologia",
    startDate: "2023-01-01",
    observations: "Transmissão ao vivo, áudio e projeção multimídia.",
    createdAt: "2026-01-15T10:00:00.000Z"
  },
  {
    id: "lead_social_patricia",
    churchId: "church_demo",
    name: "Patrícia Helena Lima",
    role: "Líder de Ação Social",
    phone: "(11) 98888-0011",
    whatsapp: "5511988880011",
    ministry: "Ação Social & Comunidade",
    startDate: "2021-08-01",
    observations: "Coordenação de doações comunitárias e apoio a famílias.",
    createdAt: "2026-01-15T10:00:00.000Z"
  },
  {
    id: "lead_familia_roberto",
    churchId: "church_demo",
    name: "Roberto Carlos Silveira",
    role: "Líder do Ministério de Famílias",
    phone: "(11) 98888-0012",
    whatsapp: "5511988880012",
    ministry: "Família & Casais",
    startDate: "2021-01-01",
    observations: "Fortalecimento dos lares e aconselhamento matrimonial.",
    createdAt: "2026-01-15T10:00:00.000Z"
  },
  {
    id: "lead_recepcao_rodrigo",
    churchId: "church_demo",
    name: "Rodrigo Dias Castro",
    role: "Líder de Recepção & Acolhimento",
    phone: "(11) 98888-0014",
    whatsapp: "5511988880014",
    ministry: "Recepção",
    startDate: "2022-05-01",
    observations: "Coordenação da equipe de recepção e boas-vindas.",
    createdAt: "2026-01-15T10:00:00.000Z"
  },
  {
    id: "lead_jovens_gabriel",
    churchId: "church_demo",
    name: "Gabriel Almeida Santos",
    role: "Líder de Juventude",
    phone: "(11) 98888-0015",
    whatsapp: "5511988880015",
    ministry: "Juventude",
    startDate: "2023-01-01",
    observations: "Coordenação dos cultos e encontros de jovens.",
    createdAt: "2026-01-15T10:00:00.000Z"
  },
  {
    id: "lead_mulheres_fernanda",
    churchId: "church_demo",
    name: "Fernanda Lima Ribeiro",
    role: "Líder do Ministério de Mulheres",
    phone: "(11) 98888-0016",
    whatsapp: "5511988880016",
    ministry: "Mulheres",
    startDate: "2022-09-01",
    observations: "Encontros de oração e comunhão feminina.",
    createdAt: "2026-01-15T10:00:00.000Z"
  }
];

export const CBA_MINISTRIES = DEMO_MINISTRIES;
export const CBA_LEADERSHIP = DEMO_LEADERSHIP;
