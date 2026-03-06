"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

export async function createRegistration(data: {
  team_name: string;
  city: string;
  captain_first_name: string;
  captain_last_name: string;
  captain_phone: string;
  captain_email: string;
  clerk_user_id: string;
}): Promise<string> {
  const supabase = createAdminClient();

  const { data: registration, error } = await supabase
    .from("team_registrations")
    .insert(data)
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  return registration.id;
}

export async function approveRegistration(id: string) {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("team_registrations")
    .update({ registration_status: "approved", updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/[locale]/admin/registros", "page");
}

export async function rejectRegistration(id: string) {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("team_registrations")
    .update({ registration_status: "rejected", updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/[locale]/admin/registros", "page");
}
