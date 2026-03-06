"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

export async function createTeam(data: {
  name: string;
  slug: string;
  short_name?: string;
  city?: string;
  group_id?: string;
}) {
  const supabase = createAdminClient();

  const { data: team, error } = await supabase
    .from("teams")
    .insert(data)
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/[locale]/equipos", "page");
  revalidatePath("/[locale]", "page");

  return team.id;
}

export async function updateTeam(
  teamId: string,
  data: {
    name?: string;
    slug?: string;
    short_name?: string | null;
    city?: string | null;
    group_id?: string | null;
    logo_url?: string | null;
  }
) {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("teams")
    .update(data)
    .eq("id", teamId);

  if (error) throw new Error(error.message);

  revalidatePath("/[locale]/equipos", "page");
  revalidatePath("/[locale]", "page");
}

export async function deleteTeam(teamId: string) {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("teams")
    .delete()
    .eq("id", teamId);

  if (error) throw new Error(error.message);

  revalidatePath("/[locale]/equipos", "page");
  revalidatePath("/[locale]", "page");
}

export async function toggleTeamReveal(teamId: string, revealed: boolean) {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("teams")
    .update({ is_revealed: revealed })
    .eq("id", teamId);

  if (error) throw new Error(error.message);

  revalidatePath("/[locale]/equipos", "page");
  revalidatePath("/[locale]", "page");
}

export async function uploadTeamLogo(
  slug: string,
  teamId: string,
  formData: FormData
) {
  const supabase = createAdminClient();
  const file = formData.get("logo") as File;

  if (!file) throw new Error("No file provided");

  const filePath = `${slug}/logo.webp`;

  const { error: uploadError } = await supabase.storage
    .from("team-logos")
    .upload(filePath, file, { upsert: true });

  if (uploadError) throw new Error(uploadError.message);

  const { data: urlData } = supabase.storage
    .from("team-logos")
    .getPublicUrl(filePath);

  const { error: updateError } = await supabase
    .from("teams")
    .update({ logo_url: urlData.publicUrl })
    .eq("id", teamId);

  if (updateError) throw new Error(updateError.message);

  revalidatePath("/[locale]/equipos", "page");
  revalidatePath("/[locale]", "page");
}
