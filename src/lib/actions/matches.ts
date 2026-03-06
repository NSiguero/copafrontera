"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { advanceToNextStage } from "./tournament";

export async function updateMatchScore(
  matchId: string,
  scoreA: number,
  scoreB: number,
  penaltyA: number | null,
  penaltyB: number | null,
  status: "in_progress" | "completed" = "completed"
) {
  const supabase = createAdminClient();

  // Fetch the match to check its stage
  const { data: match, error: fetchError } = await supabase
    .from("matches")
    .select("stage")
    .eq("id", matchId)
    .single();

  if (fetchError) throw new Error(fetchError.message);

  // Penalty enforcement for knockout matches
  if (status === "completed" && match.stage !== "group") {
    if (scoreA === scoreB) {
      if (penaltyA === null || penaltyB === null) {
        throw new Error("NEED_PENALTIES");
      }
      if (penaltyA === penaltyB) {
        throw new Error("NEED_PENALTIES");
      }
    }
  }

  // Update score + penalties + status in one call
  const { error } = await supabase
    .from("matches")
    .update({
      score_a: scoreA,
      score_b: scoreB,
      penalty_a: penaltyA,
      penalty_b: penaltyB,
      status,
    })
    .eq("id", matchId);

  if (error) throw new Error(error.message);

  revalidatePath("/[locale]/posiciones", "page");
  revalidatePath("/[locale]/calendario", "page");
  revalidatePath("/[locale]", "page");
  revalidatePath("/[locale]/admin/resultados", "page");

  // Auto-advance: if completing a match, try to advance tournament
  if (status === "completed") {
    try {
      await advanceToNextStage();
    } catch {
      // Non-fatal: advancement might not be possible yet
    }
  }
}

export async function updateMatchPenalties(
  matchId: string,
  penaltyA: number,
  penaltyB: number
) {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("matches")
    .update({ penalty_a: penaltyA, penalty_b: penaltyB })
    .eq("id", matchId);

  if (error) throw new Error(error.message);

  revalidatePath("/[locale]/calendario", "page");
}

export async function createMatch(data: {
  team_a_id: string;
  team_b_id: string;
  group_id?: string;
  stage?: "group" | "round_of_32" | "round_of_16" | "quarterfinal" | "semifinal" | "third_place" | "final";
  match_date?: string;
  venue?: string;
  round?: number;
}) {
  const supabase = createAdminClient();

  const { error } = await supabase.from("matches").insert(data);

  if (error) throw new Error(error.message);

  revalidatePath("/[locale]/calendario", "page");
}

export async function updateMatchStatus(
  matchId: string,
  status: "scheduled" | "in_progress" | "completed" | "postponed" | "cancelled"
) {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("matches")
    .update({ status })
    .eq("id", matchId);

  if (error) throw new Error(error.message);

  revalidatePath("/[locale]/posiciones", "page");
  revalidatePath("/[locale]/calendario", "page");
  revalidatePath("/[locale]", "page");
}
