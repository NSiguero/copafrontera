import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { getMatches } from "@/lib/queries/matches";
import { getGroups } from "@/lib/queries/teams";
import { CalendarClient } from "./calendar-client";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "calendar" });
  return { title: t("title") };
}

export default async function CalendarPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [matches, groups] = await Promise.all([getMatches(), getGroups()]);

  return <CalendarClient matches={matches} groups={groups} locale={locale} />;
}
