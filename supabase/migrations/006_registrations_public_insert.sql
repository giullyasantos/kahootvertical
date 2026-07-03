-- Allow unauthenticated users to insert their own registration.
-- The form is public-facing: participants fill it out before they have an account.
-- Reads and updates remain admin-only (no public SELECT/UPDATE policy here).
CREATE POLICY "public_insert_registration"
  ON registrations
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow anonymous reads only on camp_events so the form can look up the active event id.
CREATE POLICY "public_read_active_camp_event"
  ON camp_events
  FOR SELECT
  TO anon
  USING (status IN ('registration', 'precamp', 'live'));
