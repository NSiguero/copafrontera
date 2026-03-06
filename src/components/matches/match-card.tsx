import { cn } from "@/lib/utils/cn";
import { Badge } from "@/components/ui/badge";
import { formatMatchDate } from "@/lib/utils/format";
import type { MatchWithTeams } from "@/lib/supabase/types";

interface MatchCardProps {
  match: MatchWithTeams;
  locale?: string;
}

const statusLabel = {
  scheduled: { es: "Programado", en: "Scheduled" },
  in_progress: { es: "En Vivo", en: "LIVE" },
  completed: { es: "Final", en: "FT" },
  postponed: { es: "Pospuesto", en: "Postponed" },
  cancelled: { es: "Cancelado", en: "Cancelled" },
};

function formatShortDate(date: string, locale: string) {
  const d = new Date(date);
  const day = d.getDate();
  const month = d.toLocaleDateString(locale, { month: "short" }).toUpperCase();
  const time = d.toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${day} ${month} · ${time}`;
}

export function MatchCard({ match, locale = "es" }: MatchCardProps) {
  const isCompleted = match.status === "completed";
  const isLive = match.status === "in_progress";
  const isScheduled = match.status === "scheduled";

  return (
    <div
      className={cn(
        "scoreboard-card rounded-[10px] overflow-hidden bg-bg-card",
        isLive && "border-l-[var(--color-gold)]",
        isScheduled && "border-l-accent"
      )}
    >
      {/* Header bar */}
      <div className="px-4 py-2 bg-bg-secondary flex justify-between items-center">
        <span className="text-xs uppercase tracking-wider font-display text-text-secondary">
          {match.group?.name ?? ""}
        </span>
        <span className="text-xs text-text-secondary">
          {match.match_date ? formatShortDate(match.match_date, locale) : ""}
        </span>
      </div>

      {/* Team rows */}
      <div className="relative">
        {/* Home team */}
        <div className="px-4 py-3 flex items-center gap-3 border-b border-border/50">
          {match.team_a?.logo_url ? (
            <img
              src={match.team_a.logo_url}
              alt=""
              className="w-6 h-6 rounded object-cover"
            />
          ) : (
            <span className="w-6 h-6 rounded bg-accent/20 flex items-center justify-center">
              <span className="w-3 h-3 rounded-full bg-accent" />
            </span>
          )}
          <span className="flex-1 font-display text-sm uppercase tracking-wide text-text-primary">
            {match.team_a?.short_name || match.team_a?.name}
          </span>
          {isCompleted || isLive ? (
            <span
              className={cn(
                "font-display text-xl font-bold tabular-nums",
                isLive ? "text-[var(--color-gold)]" : "text-text-primary"
              )}
            >
              {match.score_a}
            </span>
          ) : null}
        </div>

        {/* Away team */}
        <div className="px-4 py-3 flex items-center gap-3">
          {match.team_b?.logo_url ? (
            <img
              src={match.team_b.logo_url}
              alt=""
              className="w-6 h-6 rounded object-cover"
            />
          ) : (
            <span className="w-6 h-6 rounded bg-accent/20 flex items-center justify-center">
              <span className="w-3 h-3 rounded-full bg-accent" />
            </span>
          )}
          <span className="flex-1 font-display text-sm uppercase tracking-wide text-text-primary">
            {match.team_b?.short_name || match.team_b?.name}
          </span>
          {isCompleted || isLive ? (
            <span
              className={cn(
                "font-display text-xl font-bold tabular-nums",
                isLive ? "text-[var(--color-gold)]" : "text-text-primary"
              )}
            >
              {match.score_b}
            </span>
          ) : null}
        </div>

        {/* VS overlay for scheduled matches */}
        {isScheduled && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="font-display text-2xl font-bold text-accent/30 uppercase">
              VS
            </span>
          </div>
        )}
      </div>

      {/* Penalties */}
      {match.penalty_a != null && match.penalty_b != null && (
        <p className="px-4 pb-1 text-center text-xs text-text-muted">
          ({match.penalty_a} - {match.penalty_b} pen.)
        </p>
      )}

      {/* Footer bar */}
      <div className="px-4 py-2 bg-bg-secondary flex justify-between items-center">
        <div className="flex items-center">
          {isLive ? (
            <>
              <span className="live-dot mr-2" />
              <Badge variant="live">
                {statusLabel.in_progress[locale as "es" | "en"]}
              </Badge>
            </>
          ) : isCompleted ? (
            <Badge variant="default">
              {statusLabel.completed[locale as "es" | "en"]}
            </Badge>
          ) : (
            <Badge variant="accent">
              {statusLabel[match.status]?.[locale as "es" | "en"] ??
                (locale === "es" ? "PRÓX" : "NEXT")}
            </Badge>
          )}
        </div>
        {match.venue && (
          <span className="text-xs text-text-muted">{match.venue}</span>
        )}
      </div>
    </div>
  );
}
