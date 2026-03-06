import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { getMatches } from "@/lib/queries/matches";
import { StatsEditor } from "./stats-editor";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "admin" });
  return { title: t("stats") };
}

export default async function AdminStatsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const matches = await getMatches();

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-accent">
        Estadísticas
      </h1>
      <div className="mt-6">
        <StatsEditor matches={matches} />
      </div>
    </div>
  );
}
