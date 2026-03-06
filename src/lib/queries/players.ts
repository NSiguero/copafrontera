import { createClient } from "@/lib/supabase/server";
import type { Player, PlayerWithTeam } from "@/lib/supabase/types";

export async function getPlayersByTeam(teamId: string): Promise<Player[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("players")
    .select("*")
    .eq("team_id", teamId)
    .order("dorsal", { ascending: true, nullsFirst: false });

  if (error) throw error;
  return data as Player[];
}

export async function getPlayerById(playerId: string): Promise<PlayerWithTeam> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("players")
    .select("*, team:teams(*)")
    .eq("id", playerId)
    .single();

  if (error) throw error;
  return data as unknown as PlayerWithTeam;
}
