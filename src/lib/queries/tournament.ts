import { createClient } from "@/lib/supabase/server";

export type TournamentProgress = {
  currentStage:
    | "not_started"
    | "group"
    | "quarterfinal"
    | "semifinal"
    | "final"
    | "completed";
  groups: { total: number; completed: number };
  quarterfinals: { total: number; completed: number };
  semifinals: { total: number; completed: number };
  finals: { total: number; completed: number }; // includes third_place
  canAdvance: boolean;
  championName: string | null;
};

export async function getTournamentProgress(): Promise<TournamentProgress> {
  const supabase = await createClient();

  const { data: matches, error } = await supabase
    .from("matches")
    .select("stage, status, score_a, score_b, team_a:teams!matches_team_a_id_fkey(name), team_b:teams!matches_team_b_id_fkey(name)");

  if (error) throw error;

  const rows = matches as unknown as {
    stage: string;
    status: string;
    score_a: number | null;
    score_b: number | null;
    team_a: { name: string } | null;
    team_b: { name: string } | null;
  }[];

  const count = (stage: string | string[]) => {
    const stages = Array.isArray(stage) ? stage : [stage];
    const stageMatches = rows.filter((m) => stages.includes(m.stage));
    return {
      total: stageMatches.length,
      completed: stageMatches.filter((m) => m.status === "completed").length,
    };
  };

  const groups = count("group");
  const quarterfinals = count("quarterfinal");
  const semifinals = count("semifinal");
  const finals = count(["final", "third_place"]);

  // Determine current stage
  let currentStage: TournamentProgress["currentStage"] = "not_started";
  if (groups.total > 0) currentStage = "group";
  if (quarterfinals.total > 0) currentStage = "quarterfinal";
  if (semifinals.total > 0) currentStage = "semifinal";
  if (finals.total > 0) currentStage = "final";
  if (finals.total > 0 && finals.completed === finals.total) {
    currentStage = "completed";
  }

  // Determine if we can advance
  let canAdvance = false;
  if (currentStage === "group" && groups.completed === groups.total && groups.total > 0) {
    canAdvance = quarterfinals.total === 0;
  } else if (currentStage === "quarterfinal" && quarterfinals.completed === quarterfinals.total && quarterfinals.total > 0) {
    canAdvance = semifinals.total === 0;
  } else if (currentStage === "semifinal" && semifinals.completed === semifinals.total && semifinals.total > 0) {
    canAdvance = finals.total === 0;
  }

  // Find champion
  let championName: string | null = null;
  if (currentStage === "completed") {
    const finalMatch = rows.find((m) => m.stage === "final" && m.status === "completed");
    if (finalMatch && finalMatch.score_a !== null && finalMatch.score_b !== null) {
      if (finalMatch.score_a > finalMatch.score_b) {
        championName = finalMatch.team_a?.name ?? null;
      } else {
        championName = finalMatch.team_b?.name ?? null;
      }
    }
  }

  return {
    currentStage,
    groups,
    quarterfinals,
    semifinals,
    finals,
    canAdvance,
    championName,
  };
}
