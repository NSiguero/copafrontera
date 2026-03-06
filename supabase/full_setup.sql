-- ============================================
-- Copa Frontera — Full Database Setup
-- Paste this entire script into Supabase SQL Editor and click Run
-- ============================================

-- ============================================
-- 1. ENUMS
-- ============================================
CREATE TYPE match_stage AS ENUM (
  'group',
  'round_of_32',
  'round_of_16',
  'quarterfinal',
  'semifinal',
  'third_place',
  'final'
);

CREATE TYPE match_status AS ENUM (
  'scheduled',
  'in_progress',
  'completed',
  'postponed',
  'cancelled'
);

CREATE TYPE player_position AS ENUM (
  'goalkeeper',
  'defender',
  'midfielder',
  'forward'
);

-- ============================================
-- 2. TABLES
-- ============================================
CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  short_name TEXT,
  logo_url TEXT,
  group_id UUID REFERENCES groups(id) ON DELETE SET NULL,
  city TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_teams_group ON teams(group_id);
CREATE INDEX idx_teams_slug ON teams(slug);

CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  dorsal INTEGER,
  position player_position,
  photo_url TEXT,
  is_captain BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_players_team ON players(team_id);

CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_a_id UUID NOT NULL REFERENCES teams(id),
  team_b_id UUID NOT NULL REFERENCES teams(id),
  score_a INTEGER,
  score_b INTEGER,
  penalty_a INTEGER,
  penalty_b INTEGER,
  group_id UUID REFERENCES groups(id) ON DELETE SET NULL,
  stage match_stage NOT NULL DEFAULT 'group',
  status match_status NOT NULL DEFAULT 'scheduled',
  match_date TIMESTAMPTZ,
  venue TEXT,
  round INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT different_teams CHECK (team_a_id <> team_b_id)
);

CREATE INDEX idx_matches_group ON matches(group_id);
CREATE INDEX idx_matches_stage ON matches(stage);
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_matches_date ON matches(match_date);

CREATE TABLE player_match_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  goals INTEGER NOT NULL DEFAULT 0,
  assists INTEGER NOT NULL DEFAULT 0,
  yellow_cards INTEGER NOT NULL DEFAULT 0,
  red_cards INTEGER NOT NULL DEFAULT 0,
  is_mvp BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(player_id, match_id)
);

CREATE INDEX idx_stats_player ON player_match_stats(player_id);
CREATE INDEX idx_stats_match ON player_match_stats(match_id);

-- ============================================
-- 3. VIEWS
-- ============================================
CREATE OR REPLACE VIEW group_standings AS
SELECT
  g.id AS group_id,
  g.name AS group_name,
  t.id AS team_id,
  t.name AS team_name,
  t.slug AS team_slug,
  t.logo_url,
  COALESCE(stats.pj, 0) AS pj,
  COALESCE(stats.pg, 0) AS pg,
  COALESCE(stats.pe, 0) AS pe,
  COALESCE(stats.pp, 0) AS pp,
  COALESCE(stats.gf, 0) AS gf,
  COALESCE(stats.gc, 0) AS gc,
  COALESCE(stats.gf, 0) - COALESCE(stats.gc, 0) AS dg,
  COALESCE(stats.pg, 0) * 3 + COALESCE(stats.pe, 0) AS pts
FROM teams t
JOIN groups g ON t.group_id = g.id
LEFT JOIN LATERAL (
  SELECT
    COUNT(*) AS pj,
    COUNT(*) FILTER (
      WHERE (m.team_a_id = t.id AND m.score_a > m.score_b)
         OR (m.team_b_id = t.id AND m.score_b > m.score_a)
    ) AS pg,
    COUNT(*) FILTER (WHERE m.score_a = m.score_b) AS pe,
    COUNT(*) FILTER (
      WHERE (m.team_a_id = t.id AND m.score_a < m.score_b)
         OR (m.team_b_id = t.id AND m.score_b < m.score_a)
    ) AS pp,
    SUM(CASE WHEN m.team_a_id = t.id THEN m.score_a ELSE m.score_b END) AS gf,
    SUM(CASE WHEN m.team_a_id = t.id THEN m.score_b ELSE m.score_a END) AS gc
  FROM matches m
  WHERE m.status = 'completed'
    AND m.stage = 'group'
    AND (m.team_a_id = t.id OR m.team_b_id = t.id)
) stats ON true
ORDER BY g.display_order, pts DESC, dg DESC, gf DESC, t.name;

CREATE OR REPLACE VIEW top_scorers AS
SELECT
  p.id AS player_id,
  p.first_name,
  p.last_name,
  p.team_id,
  t.name AS team_name,
  t.slug AS team_slug,
  COALESCE(SUM(pms.goals), 0)::INTEGER AS total_goals
FROM players p
JOIN teams t ON p.team_id = t.id
JOIN player_match_stats pms ON pms.player_id = p.id
JOIN matches m ON pms.match_id = m.id AND m.status = 'completed'
WHERE pms.goals > 0
GROUP BY p.id, p.first_name, p.last_name, p.team_id, t.name, t.slug
ORDER BY total_goals DESC, p.last_name;

CREATE OR REPLACE VIEW top_assists AS
SELECT
  p.id AS player_id,
  p.first_name,
  p.last_name,
  p.team_id,
  t.name AS team_name,
  t.slug AS team_slug,
  COALESCE(SUM(pms.assists), 0)::INTEGER AS total_assists
FROM players p
JOIN teams t ON p.team_id = t.id
JOIN player_match_stats pms ON pms.player_id = p.id
JOIN matches m ON pms.match_id = m.id AND m.status = 'completed'
WHERE pms.assists > 0
GROUP BY p.id, p.first_name, p.last_name, p.team_id, t.name, t.slug
ORDER BY total_assists DESC, p.last_name;

-- ============================================
-- 4. TRIGGERS
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER teams_updated_at
  BEFORE UPDATE ON teams
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER players_updated_at
  BEFORE UPDATE ON players
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER matches_updated_at
  BEFORE UPDATE ON matches
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================
-- 5. ROW LEVEL SECURITY
-- ============================================
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_match_stats ENABLE ROW LEVEL SECURITY;

-- Helper function
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Groups
CREATE POLICY "Groups are viewable by everyone"
  ON groups FOR SELECT USING (true);
CREATE POLICY "Groups are editable by admins"
  ON groups FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Teams
CREATE POLICY "Teams are viewable by everyone"
  ON teams FOR SELECT USING (true);
CREATE POLICY "Teams are editable by admins"
  ON teams FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Players
CREATE POLICY "Players are viewable by everyone"
  ON players FOR SELECT USING (true);
CREATE POLICY "Players are editable by admins"
  ON players FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Matches
CREATE POLICY "Matches are viewable by everyone"
  ON matches FOR SELECT USING (true);
CREATE POLICY "Matches are editable by admins"
  ON matches FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Player match stats
CREATE POLICY "Stats are viewable by everyone"
  ON player_match_stats FOR SELECT USING (true);
CREATE POLICY "Stats are editable by admins"
  ON player_match_stats FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- ============================================
-- 6. STORAGE BUCKETS
-- ============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('team-logos', 'team-logos', true, 2097152);

INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('player-photos', 'player-photos', true, 5242880);

-- Team logos storage policies
CREATE POLICY "Team logos are publicly accessible"
  ON storage.objects FOR SELECT USING (bucket_id = 'team-logos');
CREATE POLICY "Admins can upload team logos"
  ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'team-logos' AND is_admin());
CREATE POLICY "Admins can update team logos"
  ON storage.objects FOR UPDATE USING (bucket_id = 'team-logos' AND is_admin());
CREATE POLICY "Admins can delete team logos"
  ON storage.objects FOR DELETE USING (bucket_id = 'team-logos' AND is_admin());

-- Player photos storage policies
CREATE POLICY "Player photos are publicly accessible"
  ON storage.objects FOR SELECT USING (bucket_id = 'player-photos');
CREATE POLICY "Admins can upload player photos"
  ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'player-photos' AND is_admin());
CREATE POLICY "Admins can update player photos"
  ON storage.objects FOR UPDATE USING (bucket_id = 'player-photos' AND is_admin());
CREATE POLICY "Admins can delete player photos"
  ON storage.objects FOR DELETE USING (bucket_id = 'player-photos' AND is_admin());

-- ============================================
-- 7. SEED DATA
-- ============================================
INSERT INTO groups (name, display_order) VALUES
  ('Grupo A', 1),
  ('Grupo B', 2),
  ('Grupo C', 3),
  ('Grupo D', 4),
  ('Grupo E', 5),
  ('Grupo F', 6),
  ('Grupo G', 7),
  ('Grupo H', 8),
  ('Grupo I', 9),
  ('Grupo J', 10),
  ('Grupo K', 11),
  ('Grupo L', 12);
