"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter, Link } from "@/i18n/navigation";
import {
  updateMatchScore,
  updateMatchStatus,
  updateMatchSchedule,
} from "@/lib/actions/matches";
import { generateGroupMatches } from "@/lib/actions/tournament";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { MATCH_STATUSES } from "@/lib/utils/constants";
import type { MatchWithTeams, Group } from "@/lib/supabase/types";
import type { TeamWithGroup } from "@/lib/queries/teams";
import type { TournamentProgress } from "@/lib/queries/tournament";

interface MatchResultsEditorProps {
  matches: MatchWithTeams[];
  teams: TeamWithGroup[];
  groups: Group[];
  progress: TournamentProgress;
}

const statusVariant: Record<string, "success" | "warning" | "info" | "error"> = {
  completed: "success",
  in_progress: "warning",
  scheduled: "info",
  postponed: "error",
  cancelled: "error",
};

const STAGE_ORDER = ["group", "quarterfinal", "semifinal", "third_place", "final"] as const;
const ACTIVE_STAGES = ["group", "quarterfinal", "semifinal", "final"] as const;

function stageLabel(stage: string, tMatch: ReturnType<typeof useTranslations>) {
  return tMatch(`stages.${stage}`);
}

export function MatchResultsEditor({
  matches,
  teams,
  groups,
  progress,
}: MatchResultsEditorProps) {
  const t = useTranslations("admin");
  const tMatch = useTranslations("match");
  const tCal = useTranslations("calendar");
  const router = useRouter();
  const { toast } = useToast();

  // Default filter to current active stage
  const defaultStage =
    progress.currentStage === "not_started" || progress.currentStage === "completed"
      ? ""
      : progress.currentStage;
  const [stageFilter, setStageFilter] = useState(defaultStage);
  const [groupFilter, setGroupFilter] = useState("");

  // Local state for matches (optimistic updates)
  const [localMatches, setLocalMatches] = useState(matches);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [scoreA, setScoreA] = useState(0);
  const [scoreB, setScoreB] = useState(0);
  const [penaltyA, setPenaltyA] = useState<number | undefined>();
  const [penaltyB, setPenaltyB] = useState<number | undefined>();
  const [editStatus, setEditStatus] = useState<string>("completed");
  const [editMatchDate, setEditMatchDate] = useState("");
  const [editVenue, setEditVenue] = useState("");
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);

  const filtered = localMatches.filter((m) => {
    if (stageFilter && m.stage !== stageFilter) return false;
    if (groupFilter && m.group_id !== groupFilter) return false;
    return true;
  });

  // Group matches by stage for display
  const matchesByStage = new Map<string, MatchWithTeams[]>();
  for (const m of filtered) {
    const existing = matchesByStage.get(m.stage) ?? [];
    existing.push(m);
    matchesByStage.set(m.stage, existing);
  }

  function startEdit(match: MatchWithTeams) {
    setEditingId(match.id);
    setScoreA(match.score_a ?? 0);
    setScoreB(match.score_b ?? 0);
    setPenaltyA(match.penalty_a ?? undefined);
    setPenaltyB(match.penalty_b ?? undefined);
    setEditStatus(match.status);
    setEditMatchDate(
      match.match_date
        ? new Date(match.match_date).toISOString().slice(0, 16)
        : ""
    );
    setEditVenue(match.venue ?? "");
  }

  async function handleSave(matchId: string, matchStage: string) {
    setSaving(true);
    try {
      if (editStatus === "completed" || editStatus === "in_progress") {
        await updateMatchScore(
          matchId,
          scoreA,
          scoreB,
          penaltyA ?? null,
          penaltyB ?? null,
          editStatus as "in_progress" | "completed"
        );
      } else {
        await updateMatchStatus(
          matchId,
          editStatus as "scheduled" | "postponed" | "cancelled"
        );
      }

      await updateMatchSchedule(
        matchId,
        editMatchDate ? new Date(editMatchDate).toISOString() : null,
        editVenue || null
      );

      // Update local state optimistically
      setLocalMatches((prev) =>
        prev.map((m) =>
          m.id === matchId
            ? {
                ...m,
                score_a: scoreA,
                score_b: scoreB,
                penalty_a: penaltyA ?? null,
                penalty_b: penaltyB ?? null,
                status: editStatus as MatchWithTeams["status"],
                match_date: editMatchDate ? new Date(editMatchDate).toISOString() : null,
                venue: editVenue || null,
              }
            : m
        )
      );

      toast(t("saved"), "success");
      setEditingId(null);
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      if (message === "NEED_PENALTIES") {
        toast(t("needPenalties"), "error");
      } else {
        toast(t("error"), "error");
      }
    }
    setSaving(false);
  }

  async function handleGenerateGroupStage() {
    setGenerating(true);
    try {
      const result = await generateGroupMatches();
      toast(t("groupStageGenerated", { count: result.count }), "success");
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      if (message === "MATCHES_ALREADY_EXIST") {
        toast(t("matchesAlreadyExist"), "error");
      } else {
        toast(t("error"), "error");
      }
    }
    setGenerating(false);
  }

  const isKnockout = (stage: string) => stage !== "group";

  // Show penalty fields when editing a knockout match and scores are tied
  const showPenaltyFields = (match: MatchWithTeams) =>
    editingId === match.id && isKnockout(match.stage) && scoreA === scoreB && editStatus === "completed";

  return (
    <div>
      {/* Tournament Control Panel */}
      <TournamentControlPanel
        progress={progress}
        tMatch={tMatch}
        t={t}
        generating={generating}
        onGenerate={handleGenerateGroupStage}
      />

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <Select
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value)}
          className="sm:max-w-[200px]"
        >
          <option value="">{t("allStages")}</option>
          {ACTIVE_STAGES.map((s) => (
            <option key={s} value={s}>
              {tMatch(`stages.${s}`)}
            </option>
          ))}
          <option value="third_place">{tMatch("stages.third_place")}</option>
        </Select>
        {stageFilter === "group" && (
          <Select
            value={groupFilter}
            onChange={(e) => setGroupFilter(e.target.value)}
            className="sm:max-w-[200px]"
          >
            <option value="">{t("allGroups")}</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </Select>
        )}
      </div>

      {/* Match list grouped by stage */}
      <div className="space-y-6">
        {STAGE_ORDER.map((stage) => {
          const stageMatches = matchesByStage.get(stage);
          if (!stageMatches || stageMatches.length === 0) return null;

          return (
            <div key={stage}>
              {!stageFilter && (
                <h2 className="font-display text-lg font-bold text-text-secondary mb-3">
                  {stageLabel(stage, tMatch)}
                </h2>
              )}
              <div className="space-y-3">
                {stageMatches.map((match) => (
                  <div
                    key={match.id}
                    className="border border-border bg-bg-card rounded-[10px] p-4"
                  >
                    {/* Stage/Group info */}
                    <div className="flex items-center gap-2 mb-2 text-xs text-text-muted">
                      <span>{tMatch(`stages.${match.stage}`)}</span>
                      {match.group && (
                        <>
                          <span>&middot;</span>
                          <span>{match.group.name}</span>
                        </>
                      )}
                      {match.round && (
                        <>
                          <span>&middot;</span>
                          <span>{tMatch("round")} {match.round}</span>
                        </>
                      )}
                      {match.match_date && (
                        <>
                          <span>&middot;</span>
                          <span>
                            {new Date(match.match_date).toLocaleDateString()}
                          </span>
                        </>
                      )}
                      {match.venue && (
                        <>
                          <span>&middot;</span>
                          <span>{match.venue}</span>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Teams */}
                      <div className="flex-1 text-right">
                        <span className="font-semibold">
                          {match.team_a?.short_name || match.team_a?.name}
                        </span>
                      </div>

                      {/* Score area */}
                      {editingId === match.id ? (
                        <div className="flex flex-col items-center gap-3">
                          {/* Schedule section */}
                          <div className="w-full border-t border-border pt-3 mb-1">
                            <div className="grid grid-cols-2 gap-3">
                              {/* Date & Time */}
                              <div className="col-span-2 sm:col-span-1">
                                <label className="block text-xs font-semibold text-accent mb-2 uppercase tracking-wide">
                                  {t("matchDate")}
                                </label>
                                <input
                                  type="datetime-local"
                                  value={editMatchDate}
                                  onChange={(e) => setEditMatchDate(e.target.value)}
                                  className="w-full bg-bg-secondary border border-border/60 rounded-lg px-3 py-2.5 text-sm font-mono focus:border-accent focus:ring-1 focus:ring-accent/20 focus:outline-none transition-colors"
                                />
                                {editMatchDate && (
                                  <p className="text-xs text-text-muted mt-1">
                                    {new Date(editMatchDate).toLocaleDateString(undefined, {
                                      weekday: "short",
                                      month: "short",
                                      day: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </p>
                                )}
                              </div>
                              {/* Venue */}
                              <div className="col-span-2 sm:col-span-1">
                                <label className="block text-xs font-semibold text-accent mb-2 uppercase tracking-wide">
                                  {t("venue")}
                                </label>
                                <input
                                  type="text"
                                  value={editVenue}
                                  onChange={(e) => setEditVenue(e.target.value)}
                                  placeholder="Estadio..."
                                  className="w-full bg-bg-secondary border border-border/60 rounded-lg px-3 py-2.5 text-sm placeholder-text-muted/40 focus:border-accent focus:ring-1 focus:ring-accent/20 focus:outline-none transition-colors"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min={0}
                              value={scoreA}
                              onChange={(e) => setScoreA(Number(e.target.value))}
                              className="w-14 border border-border bg-bg-secondary rounded-[10px] p-2 text-center text-lg font-bold text-accent focus:border-accent focus:outline-none"
                            />
                            <span className="text-text-muted">-</span>
                            <input
                              type="number"
                              min={0}
                              value={scoreB}
                              onChange={(e) => setScoreB(Number(e.target.value))}
                              className="w-14 border border-border bg-bg-secondary rounded-[10px] p-2 text-center text-lg font-bold text-accent focus:border-accent focus:outline-none"
                            />
                          </div>
                          {/* Penalties for knockout when tied */}
                          {showPenaltyFields(match) && (
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min={0}
                                value={penaltyA ?? ""}
                                onChange={(e) =>
                                  setPenaltyA(
                                    e.target.value ? Number(e.target.value) : undefined
                                  )
                                }
                                placeholder={t("penaltyA")}
                                className="w-14 border border-border bg-bg-secondary rounded-[10px] p-1 text-center text-sm focus:border-accent focus:outline-none"
                              />
                              <span className="text-xs text-text-muted">PEN</span>
                              <input
                                type="number"
                                min={0}
                                value={penaltyB ?? ""}
                                onChange={(e) =>
                                  setPenaltyB(
                                    e.target.value ? Number(e.target.value) : undefined
                                  )
                                }
                                placeholder={t("penaltyB")}
                                className="w-14 border border-border bg-bg-secondary rounded-[10px] p-1 text-center text-sm focus:border-accent focus:outline-none"
                              />
                            </div>
                          )}
                          {/* Always show penalty fields for knockout if already set */}
                          {editingId === match.id && isKnockout(match.stage) && !showPenaltyFields(match) && (penaltyA !== undefined || penaltyB !== undefined) && (
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min={0}
                                value={penaltyA ?? ""}
                                onChange={(e) =>
                                  setPenaltyA(
                                    e.target.value ? Number(e.target.value) : undefined
                                  )
                                }
                                placeholder={t("penaltyA")}
                                className="w-14 border border-border bg-bg-secondary rounded-[10px] p-1 text-center text-sm focus:border-accent focus:outline-none"
                              />
                              <span className="text-xs text-text-muted">PEN</span>
                              <input
                                type="number"
                                min={0}
                                value={penaltyB ?? ""}
                                onChange={(e) =>
                                  setPenaltyB(
                                    e.target.value ? Number(e.target.value) : undefined
                                  )
                                }
                                placeholder={t("penaltyB")}
                                className="w-14 border border-border bg-bg-secondary rounded-[10px] p-1 text-center text-sm focus:border-accent focus:outline-none"
                              />
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <div className="flex items-center gap-2 text-lg">
                            <span className="font-bold">{match.score_a ?? "-"}</span>
                            <span className="text-text-muted">-</span>
                            <span className="font-bold">{match.score_b ?? "-"}</span>
                          </div>
                          {match.penalty_a != null && match.penalty_b != null && (
                            <span className="text-xs text-text-muted">
                              ({tMatch("penalties")} {match.penalty_a}-{match.penalty_b})
                            </span>
                          )}
                        </div>
                      )}

                      <div className="flex-1">
                        <span className="font-semibold">
                          {match.team_b?.short_name || match.team_b?.name}
                        </span>
                      </div>

                      {/* Status + actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        {editingId === match.id ? (
                          <Select
                            value={editStatus}
                            onChange={(e) => setEditStatus(e.target.value)}
                            className="w-36 text-xs"
                          >
                            {MATCH_STATUSES.map((s) => (
                              <option key={s} value={s}>
                                {tCal(
                                  s === "in_progress"
                                    ? "inProgress"
                                    : s
                                )}
                              </option>
                            ))}
                          </Select>
                        ) : (
                          <Badge variant={statusVariant[match.status] ?? "info"}>
                            {tCal(
                              match.status === "in_progress"
                                ? "inProgress"
                                : match.status
                            )}
                          </Badge>
                        )}

                        {editingId === match.id ? (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleSave(match.id, match.stage)}
                              disabled={saving}
                            >
                              {t("save")}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditingId(null)}
                            >
                              {t("cancel")}
                            </Button>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => startEdit(match)}
                            >
                              {t("edit")}
                            </Button>
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            <Link href={`/admin/resultados/${match.id}` as any}>
                              <Button size="sm" variant="ghost">
                                {t("stats")}
                              </Button>
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <p className="text-center text-text-muted py-8">{t("noResults")}</p>
        )}
      </div>
    </div>
  );
}

function TournamentControlPanel({
  progress,
  tMatch,
  t,
  generating,
  onGenerate,
}: {
  progress: TournamentProgress;
  tMatch: ReturnType<typeof useTranslations>;
  t: ReturnType<typeof useTranslations>;
  generating: boolean;
  onGenerate: () => void;
}) {
  const { currentStage, groups, quarterfinals, semifinals, finals, championName } = progress;

  // Determine the stage to show progress for
  let activeStageLabel = "";
  let completed = 0;
  let total = 0;

  if (currentStage === "group") {
    activeStageLabel = tMatch("stages.group");
    completed = groups.completed;
    total = groups.total;
  } else if (currentStage === "quarterfinal") {
    activeStageLabel = tMatch("stages.quarterfinal");
    completed = quarterfinals.completed;
    total = quarterfinals.total;
  } else if (currentStage === "semifinal") {
    activeStageLabel = tMatch("stages.semifinal");
    completed = semifinals.completed;
    total = semifinals.total;
  } else if (currentStage === "final") {
    activeStageLabel = tMatch("stages.final");
    completed = finals.completed;
    total = finals.total;
  }

  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="border border-border bg-bg-card rounded-[10px] p-5 mb-6">
      {currentStage === "not_started" && (
        <div>
          <h3 className="font-display text-lg font-bold text-text-primary mb-2">
            {t("tournament")}
          </h3>
          <p className="text-text-muted text-sm mb-4">{t("noResults")}</p>
          <Button onClick={onGenerate} disabled={generating}>
            {generating ? t("generating") : t("generateGroupStage")}
          </Button>
        </div>
      )}

      {currentStage === "completed" && (
        <div>
          <h3 className="font-display text-lg font-bold text-green-600 mb-1">
            {t("tournamentCompleted")}
          </h3>
          {championName && (
            <p className="text-text-primary font-semibold">
              {t("champion")}: {championName}
            </p>
          )}
        </div>
      )}

      {currentStage !== "not_started" && currentStage !== "completed" && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-display text-lg font-bold text-text-primary">
              {activeStageLabel}
            </h3>
            <span className="text-sm text-text-muted">
              {t("stageProgress", { completed, total })}
            </span>
          </div>
          <div className="w-full bg-bg-secondary rounded-full h-2.5">
            <div
              className="bg-accent h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${percentage}%` }}
            />
          </div>

          {/* Show completed stages summary */}
          {currentStage !== "group" && groups.total > 0 && (
            <p className="text-xs text-green-600 mt-2">
              {t("stageCompleted", { stage: tMatch("stages.group") })}
            </p>
          )}
          {currentStage !== "group" && currentStage !== "quarterfinal" && quarterfinals.total > 0 && (
            <p className="text-xs text-green-600">
              {t("stageCompleted", { stage: tMatch("stages.quarterfinal") })}
            </p>
          )}
          {currentStage === "final" && semifinals.total > 0 && (
            <p className="text-xs text-green-600">
              {t("stageCompleted", { stage: tMatch("stages.semifinal") })}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
