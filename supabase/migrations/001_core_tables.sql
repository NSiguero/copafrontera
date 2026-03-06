-- Migration 1: Core Tables

-- Enums
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

-- Groups (flexible: works for 8, 12, or 16 groups)
CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Teams
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

-- Players
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

-- Matches
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

-- Player Match Stats
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
