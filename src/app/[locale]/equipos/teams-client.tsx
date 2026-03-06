"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { TeamCard, LockedTeamCard } from "@/components/teams/team-card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { PageBanner } from "@/components/ui/page-banner";
import type { Group } from "@/lib/supabase/types";
import type { TeamWithGroup } from "@/lib/queries/teams";

interface TeamsPageClientProps {
  teams: TeamWithGroup[];
  groups: Group[];
}

export function TeamsPageClient({ teams, groups }: TeamsPageClientProps) {
  const t = useTranslations("teams");
  const [search, setSearch] = useState("");
  const [groupFilter, setGroupFilter] = useState("");

  const filtered = teams.filter((team) => {
    const matchesSearch = team.name
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesGroup = !groupFilter || team.group_id === groupFilter;
    return matchesSearch && matchesGroup;
  });

  const revealed = filtered.filter((t) => t.is_revealed);
  const locked = filtered.filter((t) => !t.is_revealed);
  const total = teams.length;

  return (
    <main className="min-h-screen">
      <PageBanner
        imageSrc="/images/teams-header.png"
        title={t("title")}
        objectPosition="center 30%"
      />
      <div className="mx-auto max-w-7xl px-4 py-12">
        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end animate-fade-in">
          <div className="flex-1">
            <Input
              placeholder={t("searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-48">
            <Select
              value={groupFilter}
              onChange={(e) => setGroupFilter(e.target.value)}
            >
              <option value="">{t("allGroups")}</option>
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {filtered.length > 0 ? (
          <>
            {/* Revealed section */}
            {revealed.length > 0 && (
              <section className="mt-10">
                <div className="flex items-center gap-3 mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 text-accent">
                    <path d="M18 1.5c2.9 0 5.25 2.35 5.25 5.25v3.75a.75.75 0 0 1-1.5 0V6.75a3.75 3.75 0 1 0-7.5 0v3a3 3 0 0 1 3 3v6.75a3 3 0 0 1-3 3H3.75a3 3 0 0 1-3-3v-6.75a3 3 0 0 1 3-3h9v-3c0-2.9 2.35-5.25 5.25-5.25Z" />
                  </svg>
                  <h2 className="font-display text-2xl font-bold text-text-primary">
                    {t("revealed")}
                  </h2>
                  <Badge variant="accent">
                    {t("revealedCount", { count: revealed.length, total })}
                  </Badge>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {revealed.map((team, i) => (
                    <div
                      key={team.id}
                      className="animate-reveal-up"
                      style={{ animationDelay: `${Math.min(i * 80, 600)}ms` }}
                    >
                      <TeamCard team={team} />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Locked section */}
            {locked.length > 0 && (
              <section className="mt-10">
                <div className="flex items-center gap-3 mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 text-text-muted">
                    <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3c0-2.9-2.35-5.25-5.25-5.25Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z" clipRule="evenodd" />
                  </svg>
                  <h2 className="font-display text-2xl font-bold text-text-muted">
                    {t("locked")}
                  </h2>
                  <Badge variant="muted">
                    {t("revealedCount", { count: locked.length, total })}
                  </Badge>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {locked.map((team, i) => (
                    <div
                      key={team.id}
                      className="animate-reveal-up"
                      style={{ animationDelay: `${Math.min(i * 80, 600)}ms` }}
                    >
                      <LockedTeamCard comingSoonText={t("comingSoon")} />
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        ) : (
          <div className="mt-12 empty-state">
            <p className="font-display text-lg font-bold text-text-muted uppercase tracking-wider">
              {t("noTeams")}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
