import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import {
  getGroupStandings,
  getTopScorers,
  getTopAssists,
} from "@/lib/queries/standings";
import { GroupTable } from "@/components/standings/group-table";
import { Leaderboard } from "@/components/standings/leaderboard";
import { PageBanner } from "@/components/ui/page-banner";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "standings" });
  return { title: t("title") };
}

export default async function StandingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [standings, topScorers, topAssists] = await Promise.all([
    getGroupStandings(),
    getTopScorers(),
    getTopAssists(),
  ]);

  const t = await getTranslations({ locale, namespace: "standings" });

  return (
    <main>
      <PageBanner
        imageSrc="/images/cta-crowd.png"
        title={t("title")}
        objectPosition="center 40%"
      />

      {/* Group standings */}
      <section className="bg-bg-secondary px-4 py-14">
        <div className="mx-auto max-w-7xl">
          {standings.length > 0 ? (
            <div className="grid gap-6 lg:grid-cols-2">
              {standings.map((group, i) => (
                <div
                  key={group.groupId}
                  className="animate-slide-horizontal"
                  style={{ animationDelay: `${i * 120}ms` }}
                >
                  <GroupTable
                    groupName={group.groupName}
                    teams={group.teams}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p className="font-display text-lg font-bold text-text-muted uppercase tracking-wider">
                {t("noData")}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Leaderboards */}
      <section className="px-4 py-14">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 lg:grid-cols-2">
            {topScorers.length > 0 && (
              <div className="animate-slide-horizontal">
                <Leaderboard
                  title={t("topScorers")}
                  playerLabel={t("player")}
                  statLabel={t("goals")}
                  data={topScorers}
                  statKey="total_goals"
                />
              </div>
            )}
            {topAssists.length > 0 && (
              <div className="animate-slide-horizontal" style={{ animationDelay: '150ms' }}>
                <Leaderboard
                  title={t("topAssists")}
                  playerLabel={t("player")}
                  statLabel={t("assists")}
                  data={topAssists}
                  statKey="total_assists"
                />
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
