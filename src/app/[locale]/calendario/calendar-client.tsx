"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { MatchCard } from "@/components/matches/match-card";
import { Select } from "@/components/ui/select";
import { PageBanner } from "@/components/ui/page-banner";
import type { MatchWithTeams } from "@/lib/supabase/types";
import type { Group } from "@/lib/supabase/types";

interface CalendarClientProps {
  matches: MatchWithTeams[];
  groups: Group[];
  locale: string;
}

const stages = [
  "group",
  "round_of_32",
  "round_of_16",
  "quarterfinal",
  "semifinal",
  "third_place",
  "final",
] as const;

export function CalendarClient({ matches, groups, locale }: CalendarClientProps) {
  const t = useTranslations("calendar");
  const tMatch = useTranslations("match");
  const [groupFilter, setGroupFilter] = useState("");
  const [stageFilter, setStageFilter] = useState("");

  const filtered = matches.filter((match) => {
    const matchesGroup = !groupFilter || match.group_id === groupFilter;
    const matchesStage = !stageFilter || match.stage === stageFilter;
    return matchesGroup && matchesStage;
  });

  // Group matches by date
  const byDate = new Map<string, MatchWithTeams[]>();
  for (const match of filtered) {
    const dateKey = match.match_date
      ? new Date(match.match_date).toLocaleDateString(locale, {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "Sin fecha";
    const existing = byDate.get(dateKey) || [];
    existing.push(match);
    byDate.set(dateKey, existing);
  }

  return (
    <main className="min-h-screen">
      <PageBanner
        imageSrc="/images/stats-bg.png"
        title={t("title")}
      />
      <div className="mx-auto max-w-7xl px-4 py-12">
        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end animate-fade-in">
          <div className="w-full sm:w-48">
            <Select
              value={groupFilter}
              onChange={(e) => setGroupFilter(e.target.value)}
              label={t("filterByGroup")}
            >
              <option value="">{t("allGroups")}</option>
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="w-full sm:w-48">
            <Select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              label={t("filterByStage")}
            >
              <option value="">{t("allStages")}</option>
              {stages.map((stage) => (
                <option key={stage} value={stage}>
                  {tMatch(`stages.${stage}`)}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {/* Matches by date */}
        {filtered.length > 0 ? (
          <div className="mt-10 space-y-10">
            {Array.from(byDate.entries()).map(([date, dateMatches], groupIdx) => (
              <section key={date} className="animate-fade-in" style={{ animationDelay: `${groupIdx * 100}ms` }}>
                <h2 className="section-heading mb-5 font-display text-xl font-bold text-text-primary uppercase">
                  {date}
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {dateMatches.map((match) => (
                    <MatchCard key={match.id} match={match} locale={locale} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="mt-12 empty-state">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="h-16 w-16 text-text-muted/30 mb-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
            </svg>
            <p className="font-display text-lg font-bold text-text-muted uppercase tracking-wider">
              {t("noMatches")}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
