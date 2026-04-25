-- Add phase column to rooms table
ALTER TABLE rooms ADD COLUMN phase TEXT DEFAULT 'quiz' CHECK (phase IN ('quiz', 'onthespot', 'finished'));

-- Create teams table
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  emoji TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  captain_id UUID REFERENCES players(id) ON DELETE SET NULL,
  double_points_used BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index on room_id for faster queries
CREATE INDEX idx_teams_room_id ON teams(room_id);

-- Add team-related columns to players table
ALTER TABLE players ADD COLUMN team_id UUID REFERENCES teams(id) ON DELETE SET NULL;
ALTER TABLE players ADD COLUMN has_played_roulette BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE players ADD COLUMN friend_lifeline_used BOOLEAN NOT NULL DEFAULT false;

-- Create index on team_id for faster queries
CREATE INDEX idx_players_team_id ON players(team_id);

-- Enable Row Level Security for teams
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

-- Create policies for teams
CREATE POLICY "Anyone can read teams" ON teams FOR SELECT USING (true);
CREATE POLICY "Anyone can insert teams" ON teams FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update teams" ON teams FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete teams" ON teams FOR DELETE USING (true);

-- Enable Realtime for teams table
ALTER PUBLICATION supabase_realtime ADD TABLE teams;
