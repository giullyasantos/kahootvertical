export type CampRole = 'participant' | 'captain' | 'admin' | 'presenter';

export type CampEventStatus = 'draft' | 'registration' | 'precamp' | 'live' | 'closed';

export type EventModeType =
  | 'arrival'
  | 'treasure_hunt'
  | 'conversation'
  | 'video_challenge'
  | 'free_time'
  | 'meal'
  | 'message'
  | 'pie_quiz'
  | 'presentation_prep'
  | 'presentation_judging'
  | 'outdoor_circuit'
  | 'night_conversation'
  | 'late_games'
  | 'closing';

export type EventModeStatus = 'locked' | 'scheduled' | 'active' | 'paused' | 'complete';

export type RegistrationStatus = 'submitted' | 'needs_review' | 'approved' | 'denied';

export type PaymentStatus = 'missing' | 'submitted' | 'confirmed' | 'rejected';

export type TeamFunction = 'cook' | 'decorate_serve' | 'clean';

export type VisibilityScope = 'private' | 'team' | 'admin';

export interface CampEvent {
  id: string;
  title: string;
  slug: string;
  startsAt: string;
  endsAt: string;
  locationName: string;
  status: CampEventStatus;
  activeModeId: string | null;
}

export interface EventMode {
  id: string;
  campEventId: string;
  type: EventModeType;
  title: string;
  status: EventModeStatus;
  accentColor: string;
  startsAt?: string;
  endsAt?: string;
  deadlineAt?: string;
  presenterTitle: string;
  participantSummary: string;
  captainSummary?: string;
  adminSummary: string;
}

export interface ModeTransition {
  id: string;
  campEventId: string;
  previousModeId: string | null;
  nextModeId: string;
  adminUserId: string;
  note?: string;
  createdAt: string;
}

export interface Registration {
  id: string;
  campEventId: string;
  fullName: string;
  age: number;
  phone: string;
  email?: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  dietaryNotes?: string;
  skills: string[];
  customSkill?: string;
  bonusAnswer?: string;
  imagePermission: boolean;
  lateNightAgreement: boolean;
  photoPath?: string;
  paymentProofPath?: string;
  paymentStatus: PaymentStatus;
  status: RegistrationStatus;
  createdAt: string;
}

export interface Participant {
  id: string;
  campEventId: string;
  authUserId?: string;
  registrationId?: string;
  displayName: string;
  fullName: string;
  phone: string;
  email?: string;
  avatarUrl?: string;
  teamId?: string;
  roles: CampRole[];
  notificationEnabled: boolean;
}

export interface AvatarOption {
  id: string;
  participantId: string;
  imageUrl: string;
  provider: 'manual' | 'gemini' | 'placeholder';
  selected: boolean;
  createdAt: string;
}

export interface AdminUser {
  id: string;
  authUserId: string;
  displayName: string;
  email?: string;
  phone?: string;
  permissionLevel: 'owner' | 'admin' | 'scorekeeper';
}

export interface CampTeam {
  id: string;
  campEventId: string;
  name: string;
  color: string;
  accentColor: string;
  captainParticipantId?: string;
  score: number;
  revealed: boolean;
}

export interface TeamMembership {
  id: string;
  teamId: string;
  participantId: string;
  role: 'member' | 'captain';
  assignedAt: string;
}

export interface TeamReveal {
  id: string;
  campEventId: string;
  scheduledFor?: string;
  revealedAt?: string;
  revealedByAdminId?: string;
}

export interface CriteriaSet {
  id: string;
  campEventId: string;
  modeId: string;
  title: string;
  description: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface RubricItem {
  id: string;
  criteriaSetId: string;
  label: string;
  description: string;
  minScore: number;
  maxScore: number;
}

export interface AdminVote {
  id: string;
  rubricItemId: string;
  teamId?: string;
  participantId?: string;
  adminUserId: string;
  score: number;
  note?: string;
  createdAt: string;
}

export interface PointLedgerEntry {
  id: string;
  campEventId: string;
  teamId: string;
  participantId?: string;
  modeId?: string;
  source:
    | 'precamp'
    | 'arrival'
    | 'treasure_hunt'
    | 'conversation'
    | 'video'
    | 'meal'
    | 'message_penalty'
    | 'pie_quiz'
    | 'presentation'
    | 'outdoor_circuit'
    | 'instagram_bonus'
    | 'manual';
  label: string;
  points: number;
  rawScore?: number;
  adminUserId?: string;
  note?: string;
  createdAt: string;
}

export interface MealAssignment {
  id: string;
  campEventId: string;
  modeId: string;
  mealName: 'Breakfast' | 'Lunch' | 'Dinner';
  readyAt: string;
  cookingTeamId: string;
  decorationTeamId: string;
  cleaningTeamId: string;
}

export interface MealPlan {
  id: string;
  mealAssignmentId: string;
  teamId: string;
  teamFunction: TeamFunction;
  menu?: string;
  decorationPlan?: string;
  supplies: string[];
  budgetNote?: string;
  status: 'draft' | 'submitted' | 'approved' | 'needs_changes';
}

export interface MealCompletion {
  id: string;
  mealAssignmentId: string;
  foodServedAt?: string;
  decorationReadyAt?: string;
  serviceCompleteAt?: string;
  cleaningCompleteAt?: string;
}

export interface NotificationJob {
  id: string;
  campEventId: string;
  audience: 'all' | 'team' | 'captains' | 'admins' | 'participant';
  audienceId?: string;
  title: string;
  body: string;
  scheduledFor?: string;
  sentAt?: string;
  status: 'draft' | 'scheduled' | 'sent' | 'failed';
}

export interface PresenterState {
  id: string;
  campEventId: string;
  activeModeId: string | null;
  publicView:
    | 'leaderboard'
    | 'arrival'
    | 'treasure_progress'
    | 'conversation'
    | 'video_status'
    | 'meal_status'
    | 'quiz_matchup'
    | 'presentation'
    | 'outdoor_progress'
    | 'closing';
  updatedAt: string;
}

export interface Note {
  id: string;
  participantId: string;
  teamId?: string;
  modeId?: string;
  scope: VisibilityScope;
  body: string;
  updatedAt: string;
}
