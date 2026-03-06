"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { upsertPlayerMatchStats } from "@/lib/actions/stats";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/client";
import { PlayerStatCard } from "./player-stat-card";
import type { MatchWithTeams, Player, PlayerMatchStats } from "@/lib/supabase/types";

interface StatsEditorProps {
  matches: MatchWithTeams[];
}

interface PlayerStat {
  player_id: string;
  player_name: string;
  team_id: string;
  team_name: string;
  dorsal: number | null;
  photo_url: string | null;
  goals: number;
  assists: number;
  yellow_cards: number;
  red_cards: number;
  is_mvp: boolean;
}

export function StatsEditor({ matches }: StatsEditorProps) {
  const t = useTranslations("admin");
  const { toast } = useToast();
  const [selectedMatch, setSelectedMatch] = useState("");
  const [playerStats, setPlayerStats] = useState<PlayerStat[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const completedMatches = matches.filter(
    (m) => m.status === "completed" || m.status === "in_progress"
  );

  const match = matches.find((m) => m.id === selectedMatch);

  useEffect(() => {
    if (!selectedMatch) {
      setPlayerStats([]);
      return;
    }

    async function fetchData() {
      setLoading(true);
      const supabase = createClient();
      const currentMatch = matches.find((m) => m.id === selectedMatch);
      if (!currentMatch) return;

      const { data: playersA } = await supabase
        .from("players")
        .select("*")
        .eq("team_id", currentMatch.team_a_id)
        .order("dorsal");

      const { data: playersB } = await supabase
        .from("players")
        .select("*")
        .eq("team_id", currentMatch.team_b_id)
        .order("dorsal");

      const { data: existingStats } = await supabase
        .from("player_match_stats")
        .select("*")
        .eq("match_id", selectedMatch);

      const statsArr = (existingStats || []) as PlayerMatchStats[];
      const statsMap = new Map(statsArr.map((s) => [s.player_id, s]));

      const playersAList = (playersA || []) as Player[];
      const playersBList = (playersB || []) as Player[];

      const buildStats = (
        players: Player[],
        teamId: string,
        teamName: string
      ): PlayerStat[] =>
        players.map((p) => {
          const existing = statsMap.get(p.id);
          return {
            player_id: p.id,
            player_name: `${p.first_name} ${p.last_name}`,
            team_id: teamId,
            team_name: teamName,
            dorsal: p.dorsal,
            photo_url: p.photo_url,
            goals: existing?.goals ?? 0,
            assists: existing?.assists ?? 0,
            yellow_cards: existing?.yellow_cards ?? 0,
            red_cards: existing?.red_cards ?? 0,
            is_mvp: existing?.is_mvp ?? false,
          };
        });

      setPlayerStats([
        ...buildStats(playersAList, currentMatch.team_a_id, currentMatch.team_a?.name || ""),
        ...buildStats(playersBList, currentMatch.team_b_id, currentMatch.team_b?.name || ""),
      ]);
      setLoading(false);
    }

    fetchData();
  }, [selectedMatch, matches]);

  function updateStat(
    playerId: string,
    field: "goals" | "assists" | "yellow_cards" | "red_cards" | "is_mvp",
    value: number | boolean
  ) {
    setPlayerStats((prev) => {
      // MVP: only one per match
      if (field === "is_mvp" && value === true) {
        return prev.map((ps) => ({
          ...ps,
          is_mvp: ps.player_id === playerId,
        }));
      }
      return prev.map((ps) =>
        ps.player_id === playerId ? { ...ps, [field]: value } : ps
      );
    });
  }

  async function handleSave() {
    setSaving(true);
    try {
      const data = playerStats
        .filter(
          (ps) =>
            ps.goals > 0 ||
            ps.assists > 0 ||
            ps.yellow_cards > 0 ||
            ps.red_cards > 0 ||
            ps.is_mvp
        )
        .map((ps) => ({
          player_id: ps.player_id,
          match_id: selectedMatch,
          goals: ps.goals,
          assists: ps.assists,
          yellow_cards: ps.yellow_cards,
          red_cards: ps.red_cards,
          is_mvp: ps.is_mvp,
        }));

      if (data.length > 0) {
        await upsertPlayerMatchStats(data);
      }
      toast(t("saved"), "success");
    } catch {
      toast(t("error"), "error");
    }
    setSaving(false);
  }

  const teamAStats = playerStats.filter(
    (ps) => ps.team_id === match?.team_a_id
  );
  const teamBStats = playerStats.filter(
    (ps) => ps.team_id === match?.team_b_id
  );

  const teamAGoals = teamAStats.reduce((sum, ps) => sum + ps.goals, 0);
  const teamBGoals = teamBStats.reduce((sum, ps) => sum + ps.goals, 0);

  return (
    <div>
      {/* Match selector */}
      <Select
        label={t("selectMatch")}
        value={selectedMatch}
        onChange={(e) => setSelectedMatch(e.target.value)}
        className="max-w-md"
      >
        <option value="">{t("selectMatch")}</option>
        {completedMatches.map((m) => (
          <option key={m.id} value={m.id}>
            {m.team_a?.name} vs {m.team_b?.name}
            {m.score_a != null && ` (${m.score_a}-${m.score_b})`}
          </option>
        ))}
      </Select>

      {loading && (
        <p className="mt-6 text-text-muted">{t("loading")}</p>
      )}

      {selectedMatch && !loading && playerStats.length > 0 && match && (
        <div className="mt-6">
          {/* Match summary */}
          <div className="flex items-center justify-center gap-6 mb-6 p-4 bg-bg-card border border-border rounded-[10px]">
            <div className="text-center">
              <p className="font-semibold text-sm">
                {match.team_a?.short_name || match.team_a?.name}
              </p>
              <p className="text-2xl font-bold text-accent">{teamAGoals}</p>
            </div>
            <span className="text-text-muted text-lg">-</span>
            <div className="text-center">
              <p className="font-semibold text-sm">
                {match.team_b?.short_name || match.team_b?.name}
              </p>
              <p className="text-2xl font-bold text-accent">{teamBGoals}</p>
            </div>
          </div>

          {/* Two-column layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Team A */}
            <div>
              <h3 className="font-display text-sm font-bold text-text-primary mb-3 uppercase tracking-wide">
                {match.team_a?.name}
              </h3>
              <div className="space-y-2">
                {teamAStats.map((ps) => (
                  <PlayerStatCard
                    key={ps.player_id}
                    playerId={ps.player_id}
                    playerName={ps.player_name}
                    dorsal={ps.dorsal}
                    photoUrl={ps.photo_url}
                    goals={ps.goals}
                    assists={ps.assists}
                    yellowCards={ps.yellow_cards}
                    redCards={ps.red_cards}
                    isMvp={ps.is_mvp}
                    onUpdate={updateStat}
                  />
                ))}
              </div>
            </div>

            {/* Team B */}
            <div>
              <h3 className="font-display text-sm font-bold text-text-primary mb-3 uppercase tracking-wide">
                {match.team_b?.name}
              </h3>
              <div className="space-y-2">
                {teamBStats.map((ps) => (
                  <PlayerStatCard
                    key={ps.player_id}
                    playerId={ps.player_id}
                    playerName={ps.player_name}
                    dorsal={ps.dorsal}
                    photoUrl={ps.photo_url}
                    goals={ps.goals}
                    assists={ps.assists}
                    yellowCards={ps.yellow_cards}
                    redCards={ps.red_cards}
                    isMvp={ps.is_mvp}
                    onUpdate={updateStat}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Save button */}
          <div className="mt-6 flex justify-center">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? t("saving") : t("saveAll")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
