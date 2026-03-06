import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { getGroupStandings } from "@/lib/queries/standings";
import { getMatches } from "@/lib/queries/matches";
import { BracketView } from "./bracket-view";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "admin" });
  return { title: t("bracket") };
}

export default async function BracketPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [standings, matches] = await Promise.all([
    getGroupStandings(),
    getMatches(),
  ]);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-text-primary mb-6">
        Bracket
      </h1>
      <BracketView standings={standings} matches={matches} />
    </div>
  );
}
