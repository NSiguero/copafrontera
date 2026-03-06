import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { getMatchById } from "@/lib/queries/matches";
import { getPlayersByTeam } from "@/lib/queries/players";
import { getMatchStats } from "@/lib/queries/stats";
import { MatchDetailEditor } from "./match-detail-editor";

async function MatchDetailPage({
  params,
}: {
  params: Promise<{ locale: string; matchId: string }>;
}) {
  const { matchId } = await params;
  const t = await getTranslations("admin");

  // Fetch match first, then fetch rosters and stats in parallel
  const match = await getMatchById(matchId);
  const [playersA, playersB, stats] = await Promise.all([
    getPlayersByTeam(match.team_a_id),
    getPlayersByTeam(match.team_b_id),
    getMatchStats(matchId),
  ]);

  return (
    <div>
      {/* Back link */}
      <div className="mb-6">
        <Link href="/admin/resultados">
          <Button variant="ghost" size="sm">
            ← {t("backToResults")}
          </Button>
        </Link>
      </div>

      {/* Page title */}
      <h1 className="font-display text-2xl font-bold text-text-primary mb-6">
        {t("matchDetail")}
      </h1>

      {/* Editor component */}
      <MatchDetailEditor
        match={match}
        playersA={playersA}
        playersB={playersB}
        existingStats={stats}
      />
    </div>
  );
}

export default MatchDetailPage;
