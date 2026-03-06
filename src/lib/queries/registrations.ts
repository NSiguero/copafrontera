import { createAdminClient } from "@/lib/supabase/admin";
import type { TeamRegistration } from "@/lib/supabase/types";

export async function getRegistrations(): Promise<TeamRegistration[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("team_registrations")
    .select("*")
    .order("registered_at", { ascending: false });

  if (error) throw new Error(error.message);

  return data as unknown as TeamRegistration[];
}

export async function getRegistrationByUserId(
  clerkUserId: string
): Promise<TeamRegistration | null> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("team_registrations")
    .select("*")
    .eq("clerk_user_id", clerkUserId)
    .maybeSingle();

  if (error) throw new Error(error.message);

  return data as unknown as TeamRegistration | null;
}
