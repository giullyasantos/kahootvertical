-- Add authenticated ownership and duplicate-prevention constraints.

-- Profiles mirror Supabase Auth users for app display/ownership.
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are readable" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE
    SET display_name = EXCLUDED.display_name,
        avatar_url = EXCLUDED.avatar_url,
        updated_at = NOW();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Identity columns.
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS host_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE players ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Duplicate prevention.
CREATE UNIQUE INDEX IF NOT EXISTS idx_players_room_user_unique
  ON players(room_id, user_id)
  WHERE user_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_answers_room_player_question_unique
  ON answers(room_id, player_id, question_index);

-- Replace permissive prototype policies.
DROP POLICY IF EXISTS "Anyone can read rooms" ON rooms;
DROP POLICY IF EXISTS "Anyone can insert rooms" ON rooms;
DROP POLICY IF EXISTS "Anyone can update rooms" ON rooms;
DROP POLICY IF EXISTS "Anyone can delete rooms" ON rooms;

DROP POLICY IF EXISTS "Anyone can read players" ON players;
DROP POLICY IF EXISTS "Anyone can insert players" ON players;
DROP POLICY IF EXISTS "Anyone can update players" ON players;
DROP POLICY IF EXISTS "Anyone can delete players" ON players;

DROP POLICY IF EXISTS "Anyone can read answers" ON answers;
DROP POLICY IF EXISTS "Anyone can insert answers" ON answers;
DROP POLICY IF EXISTS "Anyone can update answers" ON answers;
DROP POLICY IF EXISTS "Anyone can delete answers" ON answers;

DROP POLICY IF EXISTS "Anyone can read teams" ON teams;
DROP POLICY IF EXISTS "Anyone can insert teams" ON teams;
DROP POLICY IF EXISTS "Anyone can update teams" ON teams;
DROP POLICY IF EXISTS "Anyone can delete teams" ON teams;

CREATE POLICY "Rooms are readable" ON rooms
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create hosted rooms" ON rooms
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND host_user_id = auth.uid());

CREATE POLICY "Room hosts can update rooms" ON rooms
  FOR UPDATE
  USING (host_user_id = auth.uid())
  WITH CHECK (host_user_id = auth.uid());

CREATE POLICY "Room hosts can delete rooms" ON rooms
  FOR DELETE
  USING (host_user_id = auth.uid());

CREATE POLICY "Players are readable" ON players
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can join as themselves" ON players
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "Players and hosts can update players" ON players
  FOR UPDATE
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM rooms
      WHERE rooms.id = players.room_id
        AND rooms.host_user_id = auth.uid()
    )
  )
  WITH CHECK (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM rooms
      WHERE rooms.id = players.room_id
        AND rooms.host_user_id = auth.uid()
    )
  );

CREATE POLICY "Room hosts can delete players" ON players
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM rooms
      WHERE rooms.id = players.room_id
        AND rooms.host_user_id = auth.uid()
    )
  );

CREATE POLICY "Teams are readable" ON teams
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create teams" ON teams
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM rooms
      WHERE rooms.id = teams.room_id
        AND rooms.status = 'waiting'
    )
  );

CREATE POLICY "Team members and room hosts can update teams" ON teams
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM rooms
      WHERE rooms.id = teams.room_id
        AND rooms.host_user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM players
      WHERE players.team_id = teams.id
        AND players.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM rooms
      WHERE rooms.id = teams.room_id
        AND rooms.host_user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM players
      WHERE players.team_id = teams.id
        AND players.user_id = auth.uid()
    )
  );

CREATE POLICY "Room hosts can delete teams" ON teams
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM rooms
      WHERE rooms.id = teams.room_id
        AND rooms.host_user_id = auth.uid()
    )
  );

CREATE POLICY "Answers are readable" ON answers
  FOR SELECT USING (true);

CREATE POLICY "Players can insert own answers" ON answers
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM players
      WHERE players.id = answers.player_id
        AND players.room_id = answers.room_id
        AND players.user_id = auth.uid()
    )
  );
