import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { getTeamsWithPlayerCount, getGroups } from "@/lib/queries/teams";
import { TeamManager } from "./team-manager";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "admin" });
  return { title: t("teams") };
}

export default async function AdminTeamsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [teams, groups] = await Promise.all([
    getTeamsWithPlayerCount(),
    getGroups(),
  ]);

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-accent">
        {(await getTranslations({ locale, namespace: "admin" }))("teams")}
      </h1>
      <div className="mt-6">
        <TeamManager teams={teams} groups={groups} />
      </div>
    </div>
  );
}
