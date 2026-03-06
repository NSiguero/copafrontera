"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { slugify } from "@/lib/utils/format";

export interface TeamImportRow {
  name: string;
  short_name?: string;
  city?: string;
  group_name?: string;
}

export interface PlayerImportRow {
  first_name: string;
  last_name: string;
  dorsal?: number;
  position?: "goalkeeper" | "defender" | "midfielder" | "forward";
  date_of_birth?: string;
  is_captain?: boolean;
}

interface ImportResult {
  imported: number;
  failed: number;
  errors: string[];
}

export async function bulkCreateTeams(
  rows: TeamImportRow[]
): Promise<ImportResult> {
  const supabase = createAdminClient();

  // Fetch groups to resolve group_name -> group_id
  const { data: groups } = await supabase.from("groups").select("id, name");
  const groupMap = new Map(
    (groups ?? []).map((g) => [g.name.toLowerCase(), g.id])
  );

  const toInsert: Array<{
    name: string;
    slug: string;
    short_name: string | null;
    city: string | null;
    group_id: string | null;
  }> = [];
  const errors: string[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (!row.name?.trim()) {
      errors.push(`Row ${i + 1}: name required`);
      continue;
    }

    let groupId: string | null = null;
    if (row.group_name?.trim()) {
      groupId = groupMap.get(row.group_name.trim().toLowerCase()) ?? null;
      if (!groupId) {
        errors.push(`Row ${i + 1}: group "${row.group_name}" not found`);
        continue;
      }
    }

    toInsert.push({
      name: row.name.trim(),
      slug: slugify(row.name.trim()),
      short_name: row.short_name?.trim() || null,
      city: row.city?.trim() || null,
      group_id: groupId,
    });
  }

  if (toInsert.length === 0) {
    return { imported: 0, failed: rows.length, errors };
  }

  const { data, error } = await supabase
    .from("teams")
    .insert(toInsert)
    .select("id");

  if (error) {
    return {
      imported: 0,
      failed: rows.length,
      errors: [...errors, error.message],
    };
  }

  revalidatePath("/[locale]/equipos", "page");
  revalidatePath("/[locale]", "page");

  return {
    imported: data.length,
    failed: rows.length - data.length,
    errors,
  };
}

export async function bulkCreatePlayers(
  teamId: string,
  rows: PlayerImportRow[]
): Promise<ImportResult> {
  const supabase = createAdminClient();

  const toInsert: Array<{
    team_id: string;
    first_name: string;
    last_name: string;
    dorsal?: number;
    position?: "goalkeeper" | "defender" | "midfielder" | "forward";
    date_of_birth?: string;
    is_captain?: boolean;
  }> = [];
  const errors: string[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (!row.first_name?.trim() || !row.last_name?.trim()) {
      errors.push(`Row ${i + 1}: first_name and last_name required`);
      continue;
    }

    toInsert.push({
      team_id: teamId,
      first_name: row.first_name.trim(),
      last_name: row.last_name.trim(),
      dorsal: row.dorsal,
      position: row.position || undefined,
      date_of_birth: row.date_of_birth || undefined,
      is_captain: row.is_captain ?? false,
    });
  }

  if (toInsert.length === 0) {
    return { imported: 0, failed: rows.length, errors };
  }

  const { data, error } = await supabase
    .from("players")
    .insert(toInsert)
    .select("id");

  if (error) {
    return {
      imported: 0,
      failed: rows.length,
      errors: [...errors, error.message],
    };
  }

  revalidatePath("/[locale]/equipos", "page");

  return {
    imported: data.length,
    failed: rows.length - data.length,
    errors,
  };
}
