"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

export async function upsertPlayerMatchStats(
  data: {
    player_id: string;
    match_id: string;
    goals: number;
    assists: number;
    yellow_cards: number;
    red_cards: number;
    is_mvp: boolean;
  }[]
) {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("player_match_stats")
    .upsert(data, { onConflict: "player_id,match_id" });

  if (error) throw new Error(error.message);

  revalidatePath("/[locale]/posiciones", "page");
  revalidatePath("/[locale]/calendario", "page");
  revalidatePath("/[locale]/equipos", "page");
}
