import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { getTeams, getGroups } from "@/lib/queries/teams";
import { TeamsPageClient } from "./teams-client";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "teams" });
  return { title: t("title") };
}

export default async function TeamsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [teams, groups] = await Promise.all([getTeams(), getGroups()]);

  return <TeamsPageClient teams={teams} groups={groups} />;
}
