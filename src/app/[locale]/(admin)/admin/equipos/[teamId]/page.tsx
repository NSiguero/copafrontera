import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { getTeamById } from "@/lib/queries/teams";
import { getPlayersByTeam } from "@/lib/queries/players";
import { getGroups } from "@/lib/queries/teams";
import { Link } from "@/i18n/navigation";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { EnhancedRosterEditor } from "./roster-editor";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; teamId: string }>;
}) {
  const { locale, teamId } = await params;
  const [t, team] = await Promise.all([
    getTranslations({ locale, namespace: "admin" }),
    getTeamById(teamId),
  ]);
  return { title: `${team.name} - ${t("roster")}` };
}

export default async function TeamDetailPage({
  params,
}: {
  params: Promise<{ locale: string; teamId: string }>;
}) {
  const { locale, teamId } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "admin" });

  const [team, players, groups] = await Promise.all([
    getTeamById(teamId),
    getPlayersByTeam(teamId),
    getGroups(),
  ]);

  return (
    <div>
      {/* Back link */}
      <Link
        href="/admin/equipos"
        className="inline-flex items-center gap-1 text-sm text-accent hover:underline mb-4"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        {t("backToTeams")}
      </Link>

      {/* Team header */}
      <div className="flex items-center gap-4 mb-6">
        <Avatar
          src={team.logo_url}
          fallback={team.short_name || team.name}
          size="lg"
          shape="square"
        />
        <div>
          <h1 className="font-display text-2xl font-bold text-accent">
            {team.name}
          </h1>
          <div className="flex items-center gap-3 mt-1">
            {team.city && (
              <span className="text-sm text-text-secondary">{team.city}</span>
            )}
            {team.group && (
              <Badge variant="accent">{team.group.name}</Badge>
            )}
          </div>
        </div>
      </div>

      {/* Roster */}
      <h2 className="font-display text-xl font-bold text-text-primary mb-4">
        {t("roster")}
      </h2>

      <EnhancedRosterEditor
        team={team}
        initialPlayers={players}
        groups={groups}
      />
    </div>
  );
}
