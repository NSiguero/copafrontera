import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import { getTeamBySlug } from "@/lib/queries/teams";
import { getPlayersByTeam } from "@/lib/queries/players";
import { getMatchesByTeam } from "@/lib/queries/matches";
import { RosterTable } from "@/components/teams/roster-table";
import { MatchCard } from "@/components/matches/match-card";
import { Badge } from "@/components/ui/badge";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; teamSlug: string }>;
}) {
  const { locale, teamSlug } = await params;
  try {
    const team = await getTeamBySlug(teamSlug);
    return { title: team.name };
  } catch {
    return { title: "Team" };
  }
}

export default async function TeamDetailPage({
  params,
}: {
  params: Promise<{ locale: string; teamSlug: string }>;
}) {
  const { locale, teamSlug } = await params;
  setRequestLocale(locale);

  let team;
  try {
    team = await getTeamBySlug(teamSlug);
  } catch {
    notFound();
  }

  const [players, matches] = await Promise.all([
    getPlayersByTeam(team.id),
    getMatchesByTeam(team.id),
  ]);

  const t = await getTranslations({ locale, namespace: "teams" });

  return (
    <main>
      {/* Dark header section */}
      <section className="bg-bg-dark px-4 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center gap-6 animate-fade-in">
            {team.logo_url ? (
              <Image
                src={team.logo_url}
                alt={team.name}
                width={120}
                height={120}
                className="h-28 w-28 object-contain rounded-[16px]"
              />
            ) : (
              <div className="flex h-28 w-28 items-center justify-center bg-bg-dark-secondary rounded-[16px] text-3xl font-bold text-white/40">
                {team.short_name || team.name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="font-display text-5xl font-bold text-white">
                {team.name}
              </h1>
              <div className="mt-2 flex items-center gap-3">
                {team.group && <Badge variant="accent">{team.group.name}</Badge>}
                {team.city && (
                  <span className="text-sm text-white/50">{team.city}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Roster section */}
      <section className="px-4 py-12">
        <div className="mx-auto max-w-7xl animate-fade-in delay-200">
          <h2 className="font-display text-3xl font-bold text-text-primary">
            {t("roster")}
          </h2>
          {players.length > 0 ? (
            <div className="mt-4">
              <RosterTable players={players} />
            </div>
          ) : (
            <p className="mt-4 text-text-secondary">Sin jugadores registrados</p>
          )}
        </div>
      </section>

      {/* Matches section */}
      <section className="bg-bg-secondary px-4 py-12">
        <div className="mx-auto max-w-7xl animate-fade-in delay-300">
          <h2 className="font-display text-3xl font-bold text-text-primary">
            {t("matches")}
          </h2>
          {matches.length > 0 ? (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {matches.map((match) => (
                <MatchCard key={match.id} match={match} locale={locale} />
              ))}
            </div>
          ) : (
            <p className="mt-4 text-text-muted">Sin partidos programados</p>
          )}
        </div>
      </section>
    </main>
  );
}
