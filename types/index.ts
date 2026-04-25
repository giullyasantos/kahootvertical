export type GameStatus = 'waiting' | 'active' | 'finished';
export type Phase = 'quiz' | 'onthespot' | 'finished';

export interface Room {
  id: string;
  code: string;
  status: GameStatus;
  current_question_index: number;
  phase: Phase;
  created_at: string;
}

export interface Player {
  id: string;
  room_id: string;
  name: string;
  score: number;
  team_id: string | null;
  has_played_roulette: boolean;
  friend_lifeline_used: boolean;
  joined_at: string;
}

export interface Answer {
  id: string;
  room_id: string;
  player_id: string;
  question_index: number;
  answer_index: number;
  is_correct: boolean;
  points_earned: number;
  answered_at: string;
}

export interface Question {
  id: number;
  question: string;
  options: [string, string, string, string];
  correct: 0 | 1 | 2 | 3;
  explanation: string;
  verse: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export type AnswerColor = 'red' | 'blue' | 'yellow' | 'green';

export interface Team {
  id: string;
  room_id: string;
  name: string;
  emoji: string;
  score: number;
  captain_id: string | null;
  double_points_used: boolean;
  created_at: string;
}

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface RouletteState {
  type: 'spin_name' | 'name_result' | 'spin_difficulty' | 'difficulty_result' |
        'superpower_activated' | 'question_revealed' | 'timer_start' | 'score_awarded';
  payload?: any;
  timestamp: number;
}
