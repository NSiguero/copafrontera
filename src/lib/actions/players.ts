"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

export async function createPlayer(data: {
  team_id: string;
  first_name: string;
  last_name: string;
  dorsal?: number;
  position?: "goalkeeper" | "defender" | "midfielder" | "forward";
  is_captain?: boolean;
  date_of_birth?: string;
}) {
  const supabase = createAdminClient();

  const { data: player, error } = await supabase
    .from("players")
    .insert(data)
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/[locale]/equipos", "page");

  return player.id;
}

export async function updatePlayer(
  playerId: string,
  data: {
    first_name?: string;
    last_name?: string;
    dorsal?: number;
    position?: "goalkeeper" | "defender" | "midfielder" | "forward";
    is_captain?: boolean;
    photo_url?: string;
    date_of_birth?: string | null;
  }
) {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("players")
    .update(data)
    .eq("id", playerId);

  if (error) throw new Error(error.message);

  revalidatePath("/[locale]/equipos", "page");
}

export async function deletePlayer(playerId: string) {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("players")
    .delete()
    .eq("id", playerId);

  if (error) throw new Error(error.message);

  revalidatePath("/[locale]/equipos", "page");
}

export async function uploadPlayerPhoto(
  teamSlug: string,
  playerId: string,
  formData: FormData
) {
  const supabase = createAdminClient();
  const file = formData.get("photo") as File;

  if (!file) throw new Error("No file provided");

  const filePath = `${teamSlug}/${playerId}.webp`;

  const { error: uploadError } = await supabase.storage
    .from("player-photos")
    .upload(filePath, file, { upsert: true });

  if (uploadError) throw new Error(uploadError.message);

  const { data: urlData } = supabase.storage
    .from("player-photos")
    .getPublicUrl(filePath);

  // Update player with photo URL
  const { error: updateError } = await supabase
    .from("players")
    .update({ photo_url: urlData.publicUrl })
    .eq("id", playerId);

  if (updateError) throw new Error(updateError.message);

  revalidatePath("/[locale]/equipos", "page");
}
