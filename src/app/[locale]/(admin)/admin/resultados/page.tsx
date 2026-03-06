import { getTranslations, setRequestLocale } from "next-intl/server";
import { getMatches } from "@/lib/queries/matches";
import { getTeams, getGroups } from "@/lib/queries/teams";
import { getTournamentProgress } from "@/lib/queries/tournament";
import { MatchResultsEditor } from "./results-editor";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "admin" });
  return { title: t("results") };
}

export default async function AdminResultsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "admin" });
  const [matches, teams, groups, progress] = await Promise.all([
    getMatches(),
    getTeams(),
    getGroups(),
    getTournamentProgress(),
  ]);

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-accent">
        {t("results")}
      </h1>
      <div className="mt-6">
        <MatchResultsEditor
          matches={matches}
          teams={teams}
          groups={groups}
          progress={progress}
        />
      </div>
    </div>
  );
}
