"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils/cn";
import type { GroupStanding, MatchWithTeams } from "@/lib/supabase/types";

type MatchStage =
  | "group"
  | "round_of_32"
  | "round_of_16"
  | "quarterfinal"
  | "semifinal"
  | "third_place"
  | "final";

interface GroupData {
  groupId: string;
  groupName: string;
  teams: GroupStanding[];
}

interface BracketViewProps {
  standings: GroupData[];
  matches: MatchWithTeams[];
}

const ALL_KNOCKOUT_ROUNDS: MatchStage[] = [
  "round_of_32",
  "round_of_16",
  "quarterfinal",
  "semifinal",
  "final",
];

const ROUND_GAPS: Record<string, string> = {
  round_of_32: "gap-2",
  round_of_16: "gap-6",
  quarterfinal: "gap-14",
  semifinal: "gap-30",
  final: "gap-30",
};

function getWinner(match: MatchWithTeams): "a" | "b" | null {
  if (match.status !== "completed") return null;
  if (match.score_a !== null && match.score_b !== null) {
    if (match.score_a > match.score_b) return "a";
    if (match.score_b > match.score_a) return "b";
    // Tied in regular time — check penalties
    if (match.penalty_a !== null && match.penalty_b !== null) {
      if (match.penalty_a > match.penalty_b) return "a";
      if (match.penalty_b > match.penalty_a) return "b";
    }
  }
  return null;
}

export function BracketView({ standings, matches }: BracketViewProps) {
  const t = useTranslations("admin");
  const tStage = useTranslations("match.stages");
  const tStandings = useTranslations("standings");
  const [tab, setTab] = useState<"groups" | "knockout">("groups");

  const matchesByStage = new Map<MatchStage, MatchWithTeams[]>();
  for (const m of matches) {
    const stage = m.stage as MatchStage;
    const existing = matchesByStage.get(stage) ?? [];
    existing.push(m);
    matchesByStage.set(stage, existing);
  }

  const sortedStandings = standings
    .map((g) => ({
      ...g,
      teams: [...g.teams].sort((a, b) => {
        if (b.pts !== a.pts) return b.pts - a.pts;
        if (b.dg !== a.dg) return b.dg - a.dg;
        return b.gf - a.gf;
      }),
    }))
    .sort((a, b) => a.groupName.localeCompare(b.groupName));

  return (
    <div>
      {/* Tab switcher */}
      <div className="flex gap-1 mb-6 bg-bg-dark/5 rounded-[10px] p-1 w-fit">
        <button
          onClick={() => setTab("groups")}
          className={cn(
            "px-4 py-2 text-sm font-medium rounded-[8px] transition-colors",
            tab === "groups"
              ? "bg-accent text-white shadow-sm"
              : "text-text-secondary hover:text-text-primary"
          )}
        >
          {t("groupStage")}
        </button>
        <button
          onClick={() => setTab("knockout")}
          className={cn(
            "px-4 py-2 text-sm font-medium rounded-[8px] transition-colors",
            tab === "knockout"
              ? "bg-accent text-white shadow-sm"
              : "text-text-secondary hover:text-text-primary"
          )}
        >
          {t("knockoutStage")}
        </button>
      </div>

      {tab === "groups" ? (
        <GroupStageView
          standings={sortedStandings}
          tStandings={tStandings}
        />
      ) : (
        <KnockoutView
          matchesByStage={matchesByStage}
          tStage={tStage}
          tbd={t("tbd")}
          noMatches={t("noMatchesInStage")}
        />
      )}
    </div>
  );
}

function GroupStageView({
  standings,
  tStandings,
}: {
  standings: GroupData[];
  tStandings: ReturnType<typeof useTranslations>;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {standings.map((group) => (
        <div
          key={group.groupId}
          className="bg-bg-card border border-border rounded-[10px] overflow-hidden"
        >
          <div className="bg-accent text-white px-4 py-2 font-display font-bold tracking-wide">
            {group.groupName}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border text-text-muted">
                  <th className="text-left px-3 py-2 w-6">#</th>
                  <th className="text-left px-2 py-2">{tStandings("team")}</th>
                  <th className="text-center px-1 py-2">{tStandings("pj")}</th>
                  <th className="text-center px-1 py-2">{tStandings("pg")}</th>
                  <th className="text-center px-1 py-2">{tStandings("pe")}</th>
                  <th className="text-center px-1 py-2">{tStandings("pp")}</th>
                  <th className="text-center px-1 py-2">{tStandings("gf")}</th>
                  <th className="text-center px-1 py-2">{tStandings("gc")}</th>
                  <th className="text-center px-1 py-2">{tStandings("dg")}</th>
                  <th className="text-center px-2 py-2 font-bold">{tStandings("pts")}</th>
                </tr>
              </thead>
              <tbody>
                {group.teams.map((team, idx) => (
                  <tr
                    key={team.team_id}
                    className={cn(
                      "border-b border-border/50 last:border-0",
                      idx < 2 && "border-l-2 border-l-green-500"
                    )}
                  >
                    <td className="px-3 py-1.5 text-text-muted">{idx + 1}</td>
                    <td className="px-2 py-1.5 font-medium truncate max-w-[120px]">
                      {team.team_name}
                    </td>
                    <td className="text-center px-1 py-1.5">{team.pj}</td>
                    <td className="text-center px-1 py-1.5">{team.pg}</td>
                    <td className="text-center px-1 py-1.5">{team.pe}</td>
                    <td className="text-center px-1 py-1.5">{team.pp}</td>
                    <td className="text-center px-1 py-1.5">{team.gf}</td>
                    <td className="text-center px-1 py-1.5">{team.gc}</td>
                    <td className="text-center px-1 py-1.5">{team.dg}</td>
                    <td className="text-center px-2 py-1.5 font-bold">{team.pts}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}

function BracketMatchCard({
  match,
  tbd,
}: {
  match?: MatchWithTeams;
  tbd: string;
}) {
  if (!match) {
    return (
      <div className="w-48 border border-border rounded-[8px] bg-bg-card overflow-hidden">
        <div className="px-3 py-2 text-xs text-text-muted border-b border-border/50">
          {tbd}
        </div>
        <div className="px-3 py-2 text-xs text-text-muted">{tbd}</div>
      </div>
    );
  }

  const winner = getWinner(match);

  return (
    <div className="w-48 border border-border rounded-[8px] bg-bg-card overflow-hidden">
      <div
        className={cn(
          "flex items-center justify-between px-3 py-2 text-xs border-b border-border/50",
          winner === "a" && "text-green-600 font-bold"
        )}
      >
        <span className="truncate flex-1">
          {match.team_a?.short_name || match.team_a?.name || tbd}
        </span>
        <span className="ml-2 tabular-nums">
          {match.score_a ?? "-"}
          {match.penalty_a != null && (
            <span className="text-text-muted ml-0.5">({match.penalty_a})</span>
          )}
        </span>
      </div>
      <div
        className={cn(
          "flex items-center justify-between px-3 py-2 text-xs",
          winner === "b" && "text-green-600 font-bold"
        )}
      >
        <span className="truncate flex-1">
          {match.team_b?.short_name || match.team_b?.name || tbd}
        </span>
        <span className="ml-2 tabular-nums">
          {match.score_b ?? "-"}
          {match.penalty_b != null && (
            <span className="text-text-muted ml-0.5">({match.penalty_b})</span>
          )}
        </span>
      </div>
    </div>
  );
}

function KnockoutView({
  matchesByStage,
  tStage,
  tbd,
  noMatches,
}: {
  matchesByStage: Map<MatchStage, MatchWithTeams[]>;
  tStage: ReturnType<typeof useTranslations>;
  tbd: string;
  noMatches: string;
}) {
  // Filter to only stages that actually have matches
  const KNOCKOUT_ROUNDS = ALL_KNOCKOUT_ROUNDS.filter(
    (s) => matchesByStage.has(s)
  );
  const hasKnockout = KNOCKOUT_ROUNDS.length > 0;
  const thirdPlace = matchesByStage.get("third_place") ?? [];

  if (!hasKnockout && thirdPlace.length === 0) {
    return (
      <p className="text-center text-text-muted py-8">{noMatches}</p>
    );
  }

  return (
    <div>
      {/* Main bracket */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-8 min-w-fit">
          {KNOCKOUT_ROUNDS.map((stage) => {
            const stageMatches = matchesByStage.get(stage) ?? [];
            if (stageMatches.length === 0 && stage !== "final") return null;

            return (
              <div key={stage} className="flex flex-col items-center">
                <h3 className="font-display text-sm font-bold text-text-secondary mb-3 whitespace-nowrap">
                  {tStage(stage)}
                </h3>
                <div
                  className={cn(
                    "flex flex-col justify-center flex-1",
                    ROUND_GAPS[stage] ?? "gap-4"
                  )}
                >
                  {stageMatches.length > 0 ? (
                    stageMatches.map((match) => (
                      <div key={match.id} className="relative">
                        <BracketMatchCard match={match} tbd={tbd} />
                        {/* Connector line to next round */}
                        <div className="absolute top-1/2 -right-4 w-4 border-t border-border" />
                      </div>
                    ))
                  ) : (
                    <BracketMatchCard tbd={tbd} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Third place match */}
      {thirdPlace.length > 0 && (
        <div className="mt-8 pt-6 border-t border-border">
          <h3 className="font-display text-sm font-bold text-text-secondary mb-3">
            {tStage("third_place")}
          </h3>
          <div className="flex gap-4">
            {thirdPlace.map((match) => (
              <BracketMatchCard key={match.id} match={match} tbd={tbd} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
