"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Database, Match, GroupStanding } from "@/lib/supabase/types";

type MatchInsert = Database["public"]["Tables"]["matches"]["Insert"];

/**
 * Generate all 24 group stage matches (round-robin: 6 per group × 4 groups).
 */
export async function generateGroupMatches(): Promise<{ count: number }> {
  const supabase = createAdminClient();

  // Guard: check if group matches already exist
  const { count: existing } = await supabase
    .from("matches")
    .select("*", { count: "exact", head: true })
    .eq("stage", "group");

  if (existing && existing > 0) {
    throw new Error("MATCHES_ALREADY_EXIST");
  }

  // Fetch all groups with their teams
  const { data: groups, error: groupsError } = await supabase
    .from("groups")
    .select("id, name")
    .order("display_order");

  if (groupsError) throw groupsError;

  const { data: teams, error: teamsError } = await supabase
    .from("teams")
    .select("id, group_id")
    .not("group_id", "is", null);

  if (teamsError) throw teamsError;

  // Group teams by group_id
  const teamsByGroup = new Map<string, string[]>();
  for (const team of teams) {
    if (!team.group_id) continue;
    const existing = teamsByGroup.get(team.group_id) ?? [];
    existing.push(team.id);
    teamsByGroup.set(team.group_id, existing);
  }

  const matchInserts: MatchInsert[] = [];

  for (const group of groups) {
    const groupTeams = teamsByGroup.get(group.id);
    if (!groupTeams || groupTeams.length < 2) continue;

    // Round-robin for 4 teams:
    // Round 1: T1 vs T2, T3 vs T4
    // Round 2: T1 vs T3, T2 vs T4
    // Round 3: T1 vs T4, T2 vs T3
    const [t1, t2, t3, t4] = groupTeams;
    const fixtures: [string, string, number][] = [];

    if (groupTeams.length === 4) {
      fixtures.push(
        [t1, t2, 1], [t3, t4, 1],
        [t1, t3, 2], [t2, t4, 2],
        [t1, t4, 3], [t2, t3, 3],
      );
    } else {
      // Generic round-robin for groups with != 4 teams
      let round = 1;
      for (let i = 0; i < groupTeams.length; i++) {
        for (let j = i + 1; j < groupTeams.length; j++) {
          fixtures.push([groupTeams[i], groupTeams[j], round]);
          round++;
        }
      }
    }

    for (const [teamA, teamB, round] of fixtures) {
      matchInserts.push({
        team_a_id: teamA,
        team_b_id: teamB,
        group_id: group.id,
        stage: "group",
        round,
        status: "scheduled",
      });
    }
  }

  if (matchInserts.length === 0) {
    throw new Error("No teams assigned to groups");
  }

  const { error: insertError } = await supabase
    .from("matches")
    .insert(matchInserts);

  if (insertError) throw insertError;

  revalidatePath("/[locale]/calendario", "page");
  revalidatePath("/[locale]/posiciones", "page");
  revalidatePath("/[locale]", "page");

  return { count: matchInserts.length };
}

/**
 * Detect which stage just completed and generate the next round of matches.
 */
export async function advanceToNextStage(): Promise<{ stage: string; count: number } | null> {
  const supabase = createAdminClient();

  // Fetch all matches
  const { data, error } = await supabase
    .from("matches")
    .select("*")
    .order("created_at");

  if (error) throw error;

  const allMatches = data as unknown as Match[];

  const byStage = (stage: string) => allMatches.filter((m) => m.stage === stage);
  const allCompleted = (matches: Match[]) =>
    matches.length > 0 && matches.every((m) => m.status === "completed");

  const groupMatches = byStage("group");
  const qfMatches = byStage("quarterfinal");
  const sfMatches = byStage("semifinal");
  const finalMatches = [...byStage("final"), ...byStage("third_place")];

  // Groups → Quarterfinals
  if (allCompleted(groupMatches) && qfMatches.length === 0) {
    return await generateQuarterfinals(supabase);
  }

  // Quarterfinals → Semifinals
  if (allCompleted(qfMatches) && qfMatches.length > 0 && sfMatches.length === 0) {
    return await generateSemifinals(supabase, qfMatches);
  }

  // Semifinals → Final + Third Place
  if (allCompleted(sfMatches) && sfMatches.length > 0 && finalMatches.length === 0) {
    return await generateFinals(supabase, sfMatches);
  }

  return null;
}

type SupabaseClient = ReturnType<typeof createAdminClient>;

function getMatchWinner(match: Match): string {
  if (match.score_a === null || match.score_b === null) {
    throw new Error(`Match ${match.id} has no score`);
  }
  if (match.score_a > match.score_b) return match.team_a_id;
  if (match.score_b > match.score_a) return match.team_b_id;
  // Tied — check penalties
  if (match.penalty_a !== null && match.penalty_b !== null) {
    if (match.penalty_a > match.penalty_b) return match.team_a_id;
    if (match.penalty_b > match.penalty_a) return match.team_b_id;
  }
  throw new Error(`Match ${match.id} has no clear winner`);
}

function getMatchLoser(match: Match): string {
  const winner = getMatchWinner(match);
  return winner === match.team_a_id ? match.team_b_id : match.team_a_id;
}

async function generateQuarterfinals(
  supabase: SupabaseClient
): Promise<{ stage: string; count: number }> {
  // Read group standings view
  const { data, error } = await supabase
    .from("group_standings")
    .select("*");

  if (error) throw error;

  const standings = data as unknown as GroupStanding[];

  // Group by group_id, sort by pts/dg/gf
  const grouped = new Map<string, GroupStanding[]>();
  for (const row of standings) {
    const existing = grouped.get(row.group_id) ?? [];
    existing.push(row);
    grouped.set(row.group_id, existing);
  }

  // Sort groups alphabetically by group_name to get consistent A, B, C, D ordering
  const sortedGroups = Array.from(grouped.entries())
    .map(([groupId, teams]) => ({
      groupId,
      groupName: teams[0]?.group_name ?? "",
      teams: [...teams].sort((a, b) => {
        if (b.pts !== a.pts) return b.pts - a.pts;
        if (b.dg !== a.dg) return b.dg - a.dg;
        return b.gf - a.gf;
      }),
    }))
    .sort((a, b) => a.groupName.localeCompare(b.groupName));

  if (sortedGroups.length < 4) {
    throw new Error("Need 4 groups for quarterfinals");
  }

  const [groupA, groupB, groupC, groupD] = sortedGroups;

  // QF1: 1st A vs 2nd B
  // QF2: 1st B vs 2nd A
  // QF3: 1st C vs 2nd D
  // QF4: 1st D vs 2nd C
  const qfMatches: MatchInsert[] = [
    { team_a_id: groupA.teams[0].team_id, team_b_id: groupB.teams[1].team_id, stage: "quarterfinal", status: "scheduled", round: 1 },
    { team_a_id: groupB.teams[0].team_id, team_b_id: groupA.teams[1].team_id, stage: "quarterfinal", status: "scheduled", round: 2 },
    { team_a_id: groupC.teams[0].team_id, team_b_id: groupD.teams[1].team_id, stage: "quarterfinal", status: "scheduled", round: 3 },
    { team_a_id: groupD.teams[0].team_id, team_b_id: groupC.teams[1].team_id, stage: "quarterfinal", status: "scheduled", round: 4 },
  ];

  const { error: insertError } = await supabase
    .from("matches")
    .insert(qfMatches);

  if (insertError) throw insertError;

  revalidatePath("/[locale]/calendario", "page");
  revalidatePath("/[locale]/posiciones", "page");
  revalidatePath("/[locale]", "page");

  return { stage: "quarterfinal", count: 4 };
}

async function generateSemifinals(
  supabase: SupabaseClient,
  qfMatches: Match[]
): Promise<{ stage: string; count: number }> {
  // Sort QF matches by round to ensure consistent pairing
  const sorted = [...qfMatches].sort((a, b) => (a.round ?? 0) - (b.round ?? 0));

  // SF1: Winner QF1 vs Winner QF3
  // SF2: Winner QF2 vs Winner QF4
  const sfMatches: MatchInsert[] = [
    { team_a_id: getMatchWinner(sorted[0]), team_b_id: getMatchWinner(sorted[2]), stage: "semifinal", status: "scheduled", round: 1 },
    { team_a_id: getMatchWinner(sorted[1]), team_b_id: getMatchWinner(sorted[3]), stage: "semifinal", status: "scheduled", round: 2 },
  ];

  const { error } = await supabase.from("matches").insert(sfMatches);
  if (error) throw error;

  revalidatePath("/[locale]/calendario", "page");
  revalidatePath("/[locale]/posiciones", "page");
  revalidatePath("/[locale]", "page");

  return { stage: "semifinal", count: 2 };
}

async function generateFinals(
  supabase: SupabaseClient,
  sfMatches: Match[]
): Promise<{ stage: string; count: number }> {
  const sorted = [...sfMatches].sort((a, b) => (a.round ?? 0) - (b.round ?? 0));

  // Final: Winner SF1 vs Winner SF2
  // Third Place: Loser SF1 vs Loser SF2
  const finalMatches: MatchInsert[] = [
    { team_a_id: getMatchWinner(sorted[0]), team_b_id: getMatchWinner(sorted[1]), stage: "final", status: "scheduled", round: 1 },
    { team_a_id: getMatchLoser(sorted[0]), team_b_id: getMatchLoser(sorted[1]), stage: "third_place", status: "scheduled", round: 1 },
  ];

  const { error } = await supabase.from("matches").insert(finalMatches);
  if (error) throw error;

  revalidatePath("/[locale]/calendario", "page");
  revalidatePath("/[locale]/posiciones", "page");
  revalidatePath("/[locale]", "page");

  return { stage: "final", count: 2 };
}
