"use client";

import { useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils/cn";

interface PlayerStatCardProps {
  playerId: string;
  playerName: string;
  dorsal: number | null;
  photoUrl: string | null;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  isMvp: boolean;
  onUpdate: (
    playerId: string,
    field: "goals" | "assists" | "yellow_cards" | "red_cards" | "is_mvp",
    value: number | boolean
  ) => void;
}

function StatPill({ label, value }: { label: string; value: number }) {
  if (value === 0) return null;
  return (
    <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full bg-accent/10 text-accent">
      {value}{label}
    </span>
  );
}

function Counter({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-text-secondary w-8">{label}</span>
      <button
        type="button"
        onClick={() => onChange(Math.max(0, value - 1))}
        className="w-7 h-7 flex items-center justify-center rounded-full border border-border text-text-secondary hover:border-accent hover:text-accent transition-colors text-sm font-bold"
      >
        -
      </button>
      <span className="w-6 text-center text-sm font-bold">{value}</span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        className="w-7 h-7 flex items-center justify-center rounded-full border border-accent text-accent hover:bg-accent hover:text-white transition-colors text-sm font-bold"
      >
        +
      </button>
    </div>
  );
}

export function PlayerStatCard({
  playerId,
  playerName,
  dorsal,
  photoUrl,
  goals,
  assists,
  yellowCards,
  redCards,
  isMvp,
  onUpdate,
}: PlayerStatCardProps) {
  const [expanded, setExpanded] = useState(false);

  const hasStats = goals > 0 || assists > 0 || yellowCards > 0 || redCards > 0 || isMvp;

  return (
    <div
      className={cn(
        "border rounded-[10px] p-3 transition-all",
        expanded ? "border-accent/40 bg-accent/5" : "border-border bg-bg-card",
        isMvp && "ring-1 ring-warning/50"
      )}
    >
      {/* Header — always visible */}
      <div
        className="flex items-center gap-3 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <Avatar
          src={photoUrl}
          fallback={playerName}
          size="sm"
          shape="circle"
        />
        <span className="text-sm font-bold text-accent w-6 text-center">
          {dorsal ?? "-"}
        </span>
        <span className="text-sm font-medium flex-1 truncate">{playerName}</span>

        {/* Stat pills (collapsed view) */}
        {!expanded && hasStats && (
          <div className="flex gap-1">
            <StatPill label="G" value={goals} />
            <StatPill label="A" value={assists} />
            {yellowCards > 0 && (
              <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full bg-warning/10 text-warning">
                {yellowCards}YC
              </span>
            )}
            {redCards > 0 && (
              <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full bg-error/10 text-error">
                {redCards}RC
              </span>
            )}
            {isMvp && (
              <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full bg-warning/20 text-warning">
                MVP
              </span>
            )}
          </div>
        )}

        <svg
          className={cn(
            "w-4 h-4 text-text-muted transition-transform shrink-0",
            expanded && "rotate-180"
          )}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </div>

      {/* Expanded editor */}
      {expanded && (
        <div className="mt-3 pt-3 border-t border-border/50 space-y-2">
          <Counter
            label="GOL"
            value={goals}
            onChange={(v) => onUpdate(playerId, "goals", v)}
          />
          <Counter
            label="AST"
            value={assists}
            onChange={(v) => onUpdate(playerId, "assists", v)}
          />
          <Counter
            label="TA"
            value={yellowCards}
            onChange={(v) => onUpdate(playerId, "yellow_cards", v)}
          />
          <Counter
            label="TR"
            value={redCards}
            onChange={(v) => onUpdate(playerId, "red_cards", v)}
          />
          <label className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => onUpdate(playerId, "is_mvp", !isMvp)}
              className={cn(
                "w-7 h-7 flex items-center justify-center rounded-full border transition-colors text-sm",
                isMvp
                  ? "bg-warning text-white border-warning"
                  : "border-border text-text-muted hover:border-warning hover:text-warning"
              )}
            >
              &#9733;
            </button>
            <span className="text-xs text-text-secondary">MVP</span>
          </label>
        </div>
      )}
    </div>
  );
}
