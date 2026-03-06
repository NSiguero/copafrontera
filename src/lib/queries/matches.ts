import { createClient } from "@/lib/supabase/server";
import type { MatchWithTeams } from "@/lib/supabase/types";

type MatchStage = "group" | "round_of_32" | "round_of_16" | "quarterfinal" | "semifinal" | "third_place" | "final";
type MatchStatusFilter = "scheduled" | "in_progress" | "completed" | "postponed" | "cancelled";

export async function getMatches(filters?: {
  groupId?: string;
  stage?: MatchStage;
  status?: MatchStatusFilter;
}): Promise<MatchWithTeams[]> {
  const supabase = await createClient();
  let query = supabase
    .from("matches")
    .select(
      "*, team_a:teams!matches_team_a_id_fkey(*), team_b:teams!matches_team_b_id_fkey(*), group:groups(*)"
    )
    .order("match_date", { ascending: true, nullsFirst: false });

  if (filters?.groupId) {
    query = query.eq("group_id", filters.groupId);
  }
  if (filters?.stage) {
    query = query.eq("stage", filters.stage);
  }
  if (filters?.status) {
    query = query.eq("status", filters.status);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as unknown as MatchWithTeams[];
}

export async function getMatchById(matchId: string): Promise<MatchWithTeams> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("matches")
    .select(
      "*, team_a:teams!matches_team_a_id_fkey(*), team_b:teams!matches_team_b_id_fkey(*), group:groups(*)"
    )
    .eq("id", matchId)
    .single();

  if (error) throw error;
  return data as unknown as MatchWithTeams;
}

export async function getUpcomingMatches(limit: number = 4): Promise<MatchWithTeams[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("matches")
    .select(
      "*, team_a:teams!matches_team_a_id_fkey(*), team_b:teams!matches_team_b_id_fkey(*), group:groups(*)"
    )
    .eq("status", "scheduled")
    .order("match_date", { ascending: true })
    .limit(limit);

  if (error) throw error;
  return data as unknown as MatchWithTeams[];
}

export async function getMatchesByTeam(teamId: string): Promise<MatchWithTeams[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("matches")
    .select(
      "*, team_a:teams!matches_team_a_id_fkey(*), team_b:teams!matches_team_b_id_fkey(*), group:groups(*)"
    )
    .or(`team_a_id.eq.${teamId},team_b_id.eq.${teamId}`)
    .order("match_date", { ascending: true, nullsFirst: false });

  if (error) throw error;
  return data as unknown as MatchWithTeams[];
}
