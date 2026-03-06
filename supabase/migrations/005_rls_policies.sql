-- Migration 5: RLS Policies

-- Helper function: check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Groups policies
CREATE POLICY "Groups are viewable by everyone"
  ON groups FOR SELECT
  USING (true);

CREATE POLICY "Groups are editable by admins"
  ON groups FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- Teams policies
CREATE POLICY "Teams are viewable by everyone"
  ON teams FOR SELECT
  USING (true);

CREATE POLICY "Teams are editable by admins"
  ON teams FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- Players policies
CREATE POLICY "Players are viewable by everyone"
  ON players FOR SELECT
  USING (true);

CREATE POLICY "Players are editable by admins"
  ON players FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- Matches policies
CREATE POLICY "Matches are viewable by everyone"
  ON matches FOR SELECT
  USING (true);

CREATE POLICY "Matches are editable by admins"
  ON matches FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- Player match stats policies
CREATE POLICY "Stats are viewable by everyone"
  ON player_match_stats FOR SELECT
  USING (true);

CREATE POLICY "Stats are editable by admins"
  ON player_match_stats FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());
