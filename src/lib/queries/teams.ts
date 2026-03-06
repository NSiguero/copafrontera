import { createClient } from "@/lib/supabase/server";
import type { Team, Group } from "@/lib/supabase/types";

export type TeamWithGroup = Team & { group: Group | null };
export type TeamWithGroupAndCount = TeamWithGroup & { player_count: number };

export async function getTeams(): Promise<TeamWithGroup[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("teams")
    .select("*, group:groups(*)")
    .order("name");

  if (error) throw error;
  return data as unknown as TeamWithGroup[];
}

export async function getTeamsByGroup(groupId: string): Promise<TeamWithGroup[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("teams")
    .select("*, group:groups(*)")
    .eq("group_id", groupId)
    .order("name");

  if (error) throw error;
  return data as unknown as TeamWithGroup[];
}

export async function getTeamBySlug(slug: string): Promise<TeamWithGroup> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("teams")
    .select("*, group:groups(*)")
    .eq("slug", slug)
    .single();

  if (error) throw error;
  return data as unknown as TeamWithGroup;
}

export async function getTeamsWithPlayerCount(): Promise<TeamWithGroupAndCount[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("teams")
    .select("*, group:groups(*), players(count)")
    .order("name");

  if (error) throw error;

  return (data as unknown as (Team & { group: Group | null; players: { count: number }[] })[]).map(
    (t) => ({
      ...t,
      player_count: t.players?.[0]?.count ?? 0,
    })
  ) as unknown as TeamWithGroupAndCount[];
}

export async function getTeamById(teamId: string): Promise<TeamWithGroup> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("teams")
    .select("*, group:groups(*)")
    .eq("id", teamId)
    .single();

  if (error) throw error;
  return data as unknown as TeamWithGroup;
}

export async function getGroups(): Promise<Group[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("groups")
    .select("*")
    .order("display_order");

  if (error) throw error;
  return data as Group[];
}
