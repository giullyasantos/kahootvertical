import {
  CampEvent,
  CampTeam,
  CriteriaSet,
  EventMode,
  MealAssignment,
  MealCompletion,
  MealPlan,
  Participant,
  PointLedgerEntry,
  PresenterState,
} from '@/types/camp';

export const campEvent: CampEvent = {
  id: 'camp-2026',
  title: 'DESPERTA! Acampadentro 2026',
  slug: 'desperta-acampadentro-2026',
  startsAt: '2026-07-31T23:00:00-04:00',
  endsAt: '2026-08-02T07:00:00-04:00',
  locationName: '201 S Clarke Rd, Ocoee FL',
  status: 'live',
  activeModeId: 'mode-treasure',
};

export const campTeams: CampTeam[] = [
  {
    id: 'team-a',
    campEventId: campEvent.id,
    name: 'Time A',
    color: '#FFD200',
    accentColor: '#FFB703',
    captainParticipantId: 'participant-ana',
    score: 1240,
    revealed: true,
  },
  {
    id: 'team-b',
    campEventId: campEvent.id,
    name: 'Time B',
    color: '#84CC16',
    accentColor: '#2F9E44',
    captainParticipantId: 'participant-davi',
    score: 1180,
    revealed: true,
  },
  {
    id: 'team-c',
    campEventId: campEvent.id,
    name: 'Time C',
    color: '#7C3AED',
    accentColor: '#9333EA',
    captainParticipantId: 'participant-bia',
    score: 1095,
    revealed: true,
  },
];

export const participants: Participant[] = [
  {
    id: 'participant-ana',
    campEventId: campEvent.id,
    displayName: 'Ana',
    fullName: 'Ana Souza',
    phone: '(407) 000-0001',
    avatarUrl: undefined,
    teamId: 'team-a',
    roles: ['participant', 'captain'],
    notificationEnabled: true,
  },
  {
    id: 'participant-davi',
    campEventId: campEvent.id,
    displayName: 'Davi',
    fullName: 'Davi Lima',
    phone: '(407) 000-0002',
    avatarUrl: undefined,
    teamId: 'team-b',
    roles: ['participant', 'captain'],
    notificationEnabled: false,
  },
  {
    id: 'participant-bia',
    campEventId: campEvent.id,
    displayName: 'Bia',
    fullName: 'Bia Costa',
    phone: '(407) 000-0003',
    avatarUrl: undefined,
    teamId: 'team-c',
    roles: ['participant', 'captain'],
    notificationEnabled: true,
  },
  {
    id: 'participant-isa',
    campEventId: campEvent.id,
    displayName: 'Isa',
    fullName: 'Isabella Rocha',
    phone: '(407) 000-0004',
    teamId: 'team-a',
    roles: ['participant'],
    notificationEnabled: true,
  },
];

export const eventModes: EventMode[] = [
  {
    id: 'mode-treasure',
    campEventId: campEvent.id,
    type: 'treasure_hunt',
    title: 'Caca ao tesouro',
    status: 'active',
    accentColor: '#7C3AED',
    deadlineAt: '2026-07-31T23:50:00-04:00',
    presenterTitle: 'Progresso dos times',
    participantSummary: 'Fique com seu time. As pistas aparecem apenas para o capitao.',
    captainSummary: 'Leia a pista, envie a resposta e avance com o time.',
    adminSummary: 'Acompanhe etapa, tentativas, acertos e progresso por time.',
  },
  {
    id: 'mode-conversation',
    campEventId: campEvent.id,
    type: 'conversation',
    title: 'Roda de conversa',
    status: 'scheduled',
    accentColor: '#F97316',
    presenterTitle: 'Conversa valendo pontos',
    participantSummary: 'Participe com atencao. Mais pessoas falando bem ajuda o time.',
    adminSummary: 'Toque no avatar e registre contribuicoes de 1 a 5.',
  },
  {
    id: 'mode-breakfast',
    campEventId: campEvent.id,
    type: 'meal',
    title: 'Cafe da manha',
    status: 'scheduled',
    accentColor: '#FFB703',
    deadlineAt: '2026-08-01T09:00:00-04:00',
    presenterTitle: 'Cafe da manha',
    participantSummary: 'Veja a funcao do seu time e o tempo ate estar pronto.',
    adminSummary: 'Registre comida servida, decoracao pronta, servico e limpeza.',
  },
];

export const activeMode = eventModes.find((mode) => mode.id === campEvent.activeModeId) ?? eventModes[0];

export const criteriaSets: CriteriaSet[] = [
  {
    id: 'criteria-video',
    campEventId: campEvent.id,
    modeId: 'mode-treasure',
    title: 'Video de 15-30 segundos',
    description: 'Criatividade, conexao com a conversa, participacao do time e clareza.',
    unlocked: false,
  },
  {
    id: 'criteria-conversation',
    campEventId: campEvent.id,
    modeId: 'mode-conversation',
    title: 'Contribuicao na conversa',
    description: 'Pontua qualidade da fala e quantas pessoas diferentes do time participam.',
    unlocked: true,
    unlockedAt: '2026-07-31T23:30:00-04:00',
  },
  {
    id: 'criteria-meal',
    campEventId: campEvent.id,
    modeId: 'mode-breakfast',
    title: 'Cafe da manha',
    description: 'Comida, hospitalidade, criatividade, limpeza, teamwork e pontualidade.',
    unlocked: true,
  },
];

export const mealAssignments: MealAssignment[] = [
  {
    id: 'meal-breakfast',
    campEventId: campEvent.id,
    modeId: 'mode-breakfast',
    mealName: 'Breakfast',
    readyAt: '2026-08-01T09:00:00-04:00',
    cookingTeamId: 'team-a',
    decorationTeamId: 'team-b',
    cleaningTeamId: 'team-c',
  },
];

export const mealPlans: MealPlan[] = [
  {
    id: 'plan-breakfast-food',
    mealAssignmentId: 'meal-breakfast',
    teamId: 'team-a',
    teamFunction: 'cook',
    menu: 'Panquecas, frutas, ovos mexidos e suco.',
    supplies: ['massa de panqueca', 'frutas', 'ovos', 'suco'],
    budgetNote: 'Enviar lista final ate 25 de julho.',
    status: 'submitted',
  },
  {
    id: 'plan-breakfast-decor',
    mealAssignmentId: 'meal-breakfast',
    teamId: 'team-b',
    teamFunction: 'decorate_serve',
    decorationPlan: 'Mesa com cores do time, versiculo do tema e recepcao na entrada.',
    supplies: ['toalha', 'copos', 'cartazes', 'guardanapos'],
    budgetNote: 'Separar decoracao simples e reutilizavel.',
    status: 'submitted',
  },
];

export const mealCompletions: MealCompletion[] = [
  {
    id: 'completion-breakfast',
    mealAssignmentId: 'meal-breakfast',
  },
];

export const pointLedger: PointLedgerEntry[] = [
  {
    id: 'point-1',
    campEventId: campEvent.id,
    teamId: 'team-a',
    modeId: 'mode-treasure',
    source: 'precamp',
    label: 'Resposta pre-camp correta',
    points: 120,
    createdAt: '2026-07-28T09:00:00-04:00',
  },
  {
    id: 'point-2',
    campEventId: campEvent.id,
    teamId: 'team-b',
    modeId: 'mode-treasure',
    source: 'precamp',
    label: 'Keyword encontrado',
    points: 95,
    createdAt: '2026-07-29T09:00:00-04:00',
  },
  {
    id: 'point-3',
    campEventId: campEvent.id,
    teamId: 'team-c',
    source: 'manual',
    label: 'Bonus de organizacao',
    points: 60,
    createdAt: '2026-07-30T09:00:00-04:00',
  },
];

export const presenterState: PresenterState = {
  id: 'presenter-main',
  campEventId: campEvent.id,
  activeModeId: activeMode.id,
  publicView: 'treasure_progress',
  updatedAt: '2026-07-31T23:12:00-04:00',
};

export const treasureProgress = [
  { teamId: 'team-a', percent: 72, correct: 5, wrong: 1, attempts: 6 },
  { teamId: 'team-b', percent: 58, correct: 4, wrong: 2, attempts: 6 },
  { teamId: 'team-c', percent: 44, correct: 3, wrong: 3, attempts: 6 },
];

export function getTeam(teamId: string) {
  return campTeams.find((team) => team.id === teamId);
}

export function getParticipantsByTeam(teamId: string) {
  return participants.filter((participant) => participant.teamId === teamId);
}
