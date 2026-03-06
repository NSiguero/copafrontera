import { createClient } from "@/lib/supabase/server";
import type { PlayerMatchStats } from "@/lib/supabase/types";

export async function getMatchStats(matchId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("player_match_stats")
    .select("*, player:players(*, team:teams(*))")
    .eq("match_id", matchId);

  if (error) throw error;
  return data;
}

export async function getPlayerSeasonStats(playerId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("player_match_stats")
    .select("goals, assists, yellow_cards, red_cards, is_mvp")
    .eq("player_id", playerId);

  if (error) throw error;

  const stats = data as Pick<PlayerMatchStats, "goals" | "assists" | "yellow_cards" | "red_cards" | "is_mvp">[];

  return stats.reduce(
    (acc, stat) => ({
      goals: acc.goals + stat.goals,
      assists: acc.assists + stat.assists,
      yellowCards: acc.yellowCards + stat.yellow_cards,
      redCards: acc.redCards + stat.red_cards,
      mvpCount: acc.mvpCount + (stat.is_mvp ? 1 : 0),
      matchesPlayed: acc.matchesPlayed + 1,
    }),
    { goals: 0, assists: 0, yellowCards: 0, redCards: 0, mvpCount: 0, matchesPlayed: 0 }
  );
}
