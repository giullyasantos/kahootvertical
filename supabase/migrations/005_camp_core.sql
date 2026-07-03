-- Camp core schema for DESPERTA! Acampadentro, sequenced after quiz auth migrations.
-- This migration intentionally creates camp-specific tables beside the existing
-- quiz tables. It enables RLS without broad public policies.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE camp_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  location_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'registration', 'precamp', 'live', 'closed')),
  active_mode_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  permission_level TEXT NOT NULL DEFAULT 'admin'
    CHECK (permission_level IN ('owner', 'admin', 'scorekeeper')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  camp_event_id UUID NOT NULL REFERENCES camp_events(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  preferred_name TEXT,
  age INTEGER NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  emergency_contact_name TEXT NOT NULL,
  emergency_contact_phone TEXT NOT NULL,
  dietary_notes TEXT,
  skills TEXT[] NOT NULL DEFAULT '{}',
  custom_skill TEXT,
  bonus_answer TEXT,
  image_permission BOOLEAN NOT NULL DEFAULT FALSE,
  late_night_agreement BOOLEAN NOT NULL DEFAULT FALSE,
  photo_path TEXT,
  payment_proof_path TEXT,
  payment_status TEXT NOT NULL DEFAULT 'missing'
    CHECK (payment_status IN ('missing', 'submitted', 'confirmed', 'rejected')),
  status TEXT NOT NULL DEFAULT 'submitted'
    CHECK (status IN ('submitted', 'needs_review', 'approved', 'denied')),
  reviewed_by_admin_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  camp_event_id UUID NOT NULL REFERENCES camp_events(id) ON DELETE CASCADE,
  auth_user_id UUID UNIQUE,
  registration_id UUID UNIQUE REFERENCES registrations(id) ON DELETE SET NULL,
  display_name TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  selected_avatar_url TEXT,
  notification_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE avatar_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  source_photo_path TEXT,
  image_path TEXT NOT NULL,
  provider TEXT NOT NULL DEFAULT 'placeholder'
    CHECK (provider IN ('manual', 'gemini', 'placeholder')),
  provider_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  selected BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE camp_teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  camp_event_id UUID NOT NULL REFERENCES camp_events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  accent_color TEXT NOT NULL,
  captain_participant_id UUID REFERENCES participants(id) ON DELETE SET NULL,
  revealed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (camp_event_id, name)
);

ALTER TABLE participants
  ADD COLUMN team_id UUID REFERENCES camp_teams(id) ON DELETE SET NULL;

CREATE TABLE team_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES camp_teams(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'captain')),
  assigned_by_admin_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (team_id, participant_id)
);

CREATE TABLE team_reveals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  camp_event_id UUID NOT NULL REFERENCES camp_events(id) ON DELETE CASCADE,
  scheduled_for TIMESTAMPTZ,
  revealed_at TIMESTAMPTZ,
  revealed_by_admin_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  notification_job_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE event_modes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  camp_event_id UUID NOT NULL REFERENCES camp_events(id) ON DELETE CASCADE,
  mode_type TEXT NOT NULL CHECK (
    mode_type IN (
      'arrival',
      'treasure_hunt',
      'conversation',
      'video_challenge',
      'free_time',
      'meal',
      'message',
      'pie_quiz',
      'presentation_prep',
      'presentation_judging',
      'outdoor_circuit',
      'night_conversation',
      'late_games',
      'closing'
    )
  ),
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled'
    CHECK (status IN ('locked', 'scheduled', 'active', 'paused', 'complete')),
  accent_color TEXT NOT NULL,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  deadline_at TIMESTAMPTZ,
  presenter_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  participant_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  captain_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  admin_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE camp_events
  ADD CONSTRAINT camp_events_active_mode_id_fkey
  FOREIGN KEY (active_mode_id) REFERENCES event_modes(id) ON DELETE SET NULL;

CREATE TABLE mode_transitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  camp_event_id UUID NOT NULL REFERENCES camp_events(id) ON DELETE CASCADE,
  previous_mode_id UUID REFERENCES event_modes(id) ON DELETE SET NULL,
  next_mode_id UUID NOT NULL REFERENCES event_modes(id) ON DELETE CASCADE,
  admin_user_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE activity_rounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  camp_event_id UUID NOT NULL REFERENCES camp_events(id) ON DELETE CASCADE,
  mode_id UUID NOT NULL REFERENCES event_modes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  round_index INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'scheduled'
    CHECK (status IN ('scheduled', 'active', 'complete')),
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE criteria_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  camp_event_id UUID NOT NULL REFERENCES camp_events(id) ON DELETE CASCADE,
  mode_id UUID NOT NULL REFERENCES event_modes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  unlocked BOOLEAN NOT NULL DEFAULT FALSE,
  unlocked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE rubric_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  criteria_set_id UUID NOT NULL REFERENCES criteria_sets(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  description TEXT NOT NULL,
  min_score INTEGER NOT NULL DEFAULT 0,
  max_score INTEGER NOT NULL DEFAULT 5,
  weight NUMERIC NOT NULL DEFAULT 1,
  display_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE point_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  camp_event_id UUID NOT NULL REFERENCES camp_events(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES camp_teams(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES participants(id) ON DELETE SET NULL,
  mode_id UUID REFERENCES event_modes(id) ON DELETE SET NULL,
  source TEXT NOT NULL,
  label TEXT NOT NULL,
  points INTEGER NOT NULL,
  raw_score NUMERIC,
  admin_user_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  note TEXT,
  supersedes_entry_id UUID REFERENCES point_ledger(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE admin_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  camp_event_id UUID NOT NULL REFERENCES camp_events(id) ON DELETE CASCADE,
  mode_id UUID REFERENCES event_modes(id) ON DELETE CASCADE,
  rubric_item_id UUID NOT NULL REFERENCES rubric_items(id) ON DELETE CASCADE,
  team_id UUID REFERENCES camp_teams(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES participants(id) ON DELETE SET NULL,
  admin_user_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  score NUMERIC NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE arrival_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  camp_event_id UUID NOT NULL REFERENCES camp_events(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  arrived_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'arrived', 'late', 'missing')),
  checked_by_admin_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  penalty_entry_id UUID REFERENCES point_ledger(id) ON DELETE SET NULL,
  UNIQUE (camp_event_id, participant_id)
);

CREATE TABLE conversation_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  camp_event_id UUID NOT NULL REFERENCES camp_events(id) ON DELETE CASCADE,
  round_id UUID NOT NULL REFERENCES activity_rounds(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES camp_teams(id) ON DELETE CASCADE,
  admin_user_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 1 AND score <= 5),
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE sleep_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  camp_event_id UUID NOT NULL REFERENCES camp_events(id) ON DELETE CASCADE,
  mode_id UUID REFERENCES event_modes(id) ON DELETE SET NULL,
  participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES camp_teams(id) ON DELETE CASCADE,
  marked_by_admin_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  notification_job_id UUID,
  penalty_entry_id UUID REFERENCES point_ledger(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE treasure_hunt_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  camp_event_id UUID NOT NULL REFERENCES camp_events(id) ON DELETE CASCADE,
  mode_id UUID NOT NULL REFERENCES event_modes(id) ON DELETE CASCADE,
  step_order INTEGER NOT NULL,
  captain_clue TEXT NOT NULL,
  answer_key TEXT,
  validation_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  points INTEGER NOT NULL DEFAULT 0,
  UNIQUE (mode_id, step_order)
);

CREATE TABLE treasure_hunt_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  step_id UUID NOT NULL REFERENCES treasure_hunt_steps(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES camp_teams(id) ON DELETE CASCADE,
  submitted_by_participant_id UUID REFERENCES participants(id) ON DELETE SET NULL,
  answer TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE pie_quiz_selections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  camp_event_id UUID NOT NULL REFERENCES camp_events(id) ON DELETE CASCADE,
  mode_id UUID NOT NULL REFERENCES event_modes(id) ON DELETE CASCADE,
  question_index INTEGER,
  participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES camp_teams(id) ON DELETE CASCADE,
  opponent_participant_id UUID REFERENCES participants(id) ON DELETE SET NULL,
  opponent_team_id UUID REFERENCES camp_teams(id) ON DELETE SET NULL,
  is_correct BOOLEAN,
  consequence_recorded BOOLEAN NOT NULL DEFAULT FALSE,
  selected_by_admin_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE precamp_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  camp_event_id UUID NOT NULL REFERENCES camp_events(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  prompt_type TEXT NOT NULL CHECK (prompt_type IN ('reading', 'keyword', 'question')),
  answer_key TEXT,
  scheduled_for TIMESTAMPTZ,
  points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE precamp_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id UUID NOT NULL REFERENCES precamp_prompts(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  team_id UUID REFERENCES camp_teams(id) ON DELETE SET NULL,
  answer TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT FALSE,
  points_entry_id UUID REFERENCES point_ledger(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (prompt_id, participant_id)
);

CREATE TABLE meal_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  camp_event_id UUID NOT NULL REFERENCES camp_events(id) ON DELETE CASCADE,
  mode_id UUID NOT NULL REFERENCES event_modes(id) ON DELETE CASCADE,
  meal_name TEXT NOT NULL CHECK (meal_name IN ('Breakfast', 'Lunch', 'Dinner')),
  ready_at TIMESTAMPTZ NOT NULL,
  cooking_team_id UUID NOT NULL REFERENCES camp_teams(id) ON DELETE CASCADE,
  decoration_team_id UUID NOT NULL REFERENCES camp_teams(id) ON DELETE CASCADE,
  cleaning_team_id UUID NOT NULL REFERENCES camp_teams(id) ON DELETE CASCADE
);

CREATE TABLE meal_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_assignment_id UUID NOT NULL REFERENCES meal_assignments(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES camp_teams(id) ON DELETE CASCADE,
  team_function TEXT NOT NULL CHECK (team_function IN ('cook', 'decorate_serve', 'clean')),
  menu TEXT,
  decoration_plan TEXT,
  supplies TEXT[] NOT NULL DEFAULT '{}',
  budget_note TEXT,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'submitted', 'approved', 'needs_changes')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (meal_assignment_id, team_id, team_function)
);

CREATE TABLE meal_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_assignment_id UUID NOT NULL UNIQUE REFERENCES meal_assignments(id) ON DELETE CASCADE,
  food_served_at TIMESTAMPTZ,
  decoration_ready_at TIMESTAMPTZ,
  service_complete_at TIMESTAMPTZ,
  cleaning_complete_at TIMESTAMPTZ,
  updated_by_admin_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE video_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  camp_event_id UUID NOT NULL REFERENCES camp_events(id) ON DELETE CASCADE,
  mode_id UUID NOT NULL REFERENCES event_modes(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES camp_teams(id) ON DELETE CASCADE,
  uploaded_by_participant_id UUID REFERENCES participants(id) ON DELETE SET NULL,
  storage_provider TEXT NOT NULL DEFAULT 'supabase',
  storage_path TEXT NOT NULL,
  original_file_name TEXT,
  status TEXT NOT NULL DEFAULT 'uploaded'
    CHECK (status IN ('uploading', 'uploaded', 'reviewed', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE presentation_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  camp_event_id UUID NOT NULL REFERENCES camp_events(id) ON DELETE CASCADE,
  mode_id UUID REFERENCES event_modes(id) ON DELETE SET NULL,
  team_id UUID NOT NULL REFERENCES camp_teams(id) ON DELETE CASCADE,
  notes TEXT,
  storage_path TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE instagram_bonus_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  camp_event_id UUID NOT NULL REFERENCES camp_events(id) ON DELETE CASCADE,
  video_submission_id UUID REFERENCES video_submissions(id) ON DELETE SET NULL,
  team_id UUID NOT NULL REFERENCES camp_teams(id) ON DELETE CASCADE,
  vote_count INTEGER NOT NULL DEFAULT 0,
  points_entry_id UUID REFERENCES point_ledger(id) ON DELETE SET NULL,
  entered_by_admin_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  camp_event_id UUID NOT NULL REFERENCES camp_events(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  team_id UUID REFERENCES camp_teams(id) ON DELETE CASCADE,
  mode_id UUID REFERENCES event_modes(id) ON DELETE SET NULL,
  visibility_scope TEXT NOT NULL DEFAULT 'private'
    CHECK (visibility_scope IN ('private', 'team', 'admin')),
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE notification_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  camp_event_id UUID NOT NULL REFERENCES camp_events(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
  admin_user_id UUID REFERENCES admin_users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  subscription_json JSONB NOT NULL,
  user_agent TEXT,
  installed_pwa BOOLEAN,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ
);

CREATE TABLE notification_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  camp_event_id UUID NOT NULL REFERENCES camp_events(id) ON DELETE CASCADE,
  audience TEXT NOT NULL CHECK (audience IN ('all', 'team', 'captains', 'admins', 'participant')),
  audience_id UUID,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  scheduled_for TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'scheduled', 'sent', 'failed')),
  created_by_admin_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE team_reveals
  ADD CONSTRAINT team_reveals_notification_job_id_fkey
  FOREIGN KEY (notification_job_id) REFERENCES notification_jobs(id) ON DELETE SET NULL;

ALTER TABLE sleep_events
  ADD CONSTRAINT sleep_events_notification_job_id_fkey
  FOREIGN KEY (notification_job_id) REFERENCES notification_jobs(id) ON DELETE SET NULL;

CREATE TABLE presenter_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  camp_event_id UUID NOT NULL REFERENCES camp_events(id) ON DELETE CASCADE,
  active_mode_id UUID REFERENCES event_modes(id) ON DELETE SET NULL,
  display_token TEXT UNIQUE,
  public_view TEXT NOT NULL DEFAULT 'leaderboard',
  public_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  camp_event_id UUID REFERENCES camp_events(id) ON DELETE CASCADE,
  admin_user_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target_table TEXT,
  target_id UUID,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_registrations_camp_event_id ON registrations(camp_event_id);
CREATE UNIQUE INDEX idx_registrations_event_phone ON registrations(camp_event_id, phone);
CREATE INDEX idx_participants_camp_event_id ON participants(camp_event_id);
CREATE INDEX idx_participants_team_id ON participants(team_id);
CREATE UNIQUE INDEX idx_participants_event_phone ON participants(camp_event_id, phone);
CREATE UNIQUE INDEX idx_avatar_options_one_selected ON avatar_options(participant_id) WHERE selected;
CREATE INDEX idx_camp_teams_camp_event_id ON camp_teams(camp_event_id);
CREATE INDEX idx_event_modes_camp_event_id ON event_modes(camp_event_id);
CREATE INDEX idx_point_ledger_team_id ON point_ledger(team_id);
CREATE INDEX idx_point_ledger_camp_event_id ON point_ledger(camp_event_id);
CREATE INDEX idx_admin_votes_mode_id ON admin_votes(mode_id);
CREATE UNIQUE INDEX idx_admin_votes_unique_target ON admin_votes (
  rubric_item_id,
  admin_user_id,
  COALESCE(team_id, '00000000-0000-0000-0000-000000000000'::uuid),
  COALESCE(participant_id, '00000000-0000-0000-0000-000000000000'::uuid)
);
CREATE UNIQUE INDEX idx_notification_subscriptions_endpoint ON notification_subscriptions(endpoint);
CREATE INDEX idx_notification_jobs_camp_event_id ON notification_jobs(camp_event_id);
CREATE INDEX idx_presenter_states_camp_event_id ON presenter_states(camp_event_id);

ALTER TABLE camp_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE avatar_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE camp_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_reveals ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_modes ENABLE ROW LEVEL SECURITY;
ALTER TABLE mode_transitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE criteria_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE rubric_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE arrival_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sleep_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE treasure_hunt_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE treasure_hunt_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE pie_quiz_selections ENABLE ROW LEVEL SECURITY;
ALTER TABLE precamp_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE precamp_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE presentation_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE instagram_bonus_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE presenter_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;

ALTER PUBLICATION supabase_realtime ADD TABLE camp_events;
ALTER PUBLICATION supabase_realtime ADD TABLE camp_teams;
ALTER PUBLICATION supabase_realtime ADD TABLE participants;
ALTER PUBLICATION supabase_realtime ADD TABLE event_modes;
ALTER PUBLICATION supabase_realtime ADD TABLE point_ledger;
ALTER PUBLICATION supabase_realtime ADD TABLE admin_votes;
ALTER PUBLICATION supabase_realtime ADD TABLE meal_completions;
ALTER PUBLICATION supabase_realtime ADD TABLE treasure_hunt_attempts;
ALTER PUBLICATION supabase_realtime ADD TABLE video_submissions;
ALTER PUBLICATION supabase_realtime ADD TABLE presenter_states;
