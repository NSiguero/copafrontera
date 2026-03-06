-- Migration 2: Computed Views

-- Group Standings: auto-calculates PJ/PG/PE/PP/GF/GC/DG/PTS from completed matches
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

-- Top Scorers: aggregates goals by player across all completed matches
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

-- Top Assists: aggregates assists by player across all completed matches
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
