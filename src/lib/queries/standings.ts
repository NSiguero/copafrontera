import { createClient } from "@/lib/supabase/server";
import type { GroupStanding, TopScorer, TopAssist } from "@/lib/supabase/types";

export async function getGroupStandings() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("group_standings")
    .select("*");

  if (error) throw error;

  const rows = data as GroupStanding[];

  // Group by group_id
  const grouped = new Map<string, GroupStanding[]>();
  for (const row of rows) {
    const existing = grouped.get(row.group_id) || [];
    existing.push(row);
    grouped.set(row.group_id, existing);
  }

  return Array.from(grouped.entries()).map(([groupId, teams]) => ({
    groupId,
    groupName: teams[0]?.group_name ?? "",
    teams,
  }));
}

export async function getTopScorers(limit: number = 20): Promise<TopScorer[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("top_scorers")
    .select("*")
    .limit(limit);

  if (error) throw error;
  return data as TopScorer[];
}

export async function getTopAssists(limit: number = 20): Promise<TopAssist[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("top_assists")
    .select("*")
    .limit(limit);

  if (error) throw error;
  return data as TopAssist[];
}
