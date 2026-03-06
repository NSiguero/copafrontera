import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Link } from "@/i18n/navigation";
import type { TopScorer, TopAssist } from "@/lib/supabase/types";

interface LeaderboardProps {
  title: string;
  playerLabel: string;
  statLabel: string;
  data: (TopScorer | TopAssist)[];
  statKey: "total_goals" | "total_assists";
}

export function Leaderboard({
  title,
  playerLabel,
  statLabel,
  data,
  statKey,
}: LeaderboardProps) {
  const positionBadgeClass = (index: number) => {
    if (index === 0) return "bg-[var(--color-gold-muted)] text-[var(--color-gold)]";
    if (index === 1) return "bg-gray-200/20 text-gray-400";
    if (index === 2) return "bg-amber-800/20 text-amber-700";
    return "bg-accent/10 text-accent";
  };

  return (
    <div className="rounded-[10px] border border-border bg-bg-card overflow-hidden">
      <div className="broadcast-tab text-white font-display text-sm uppercase tracking-widest">
        {title}
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10 text-xs uppercase tracking-wider text-text-muted font-display">#</TableHead>
            <TableHead className="text-xs uppercase tracking-wider text-text-muted font-display">{playerLabel}</TableHead>
            <TableHead className="text-xs uppercase tracking-wider text-text-muted font-display">Equipo</TableHead>
            <TableHead className="text-center text-xs uppercase tracking-wider text-[var(--color-gold)] font-display">
              {statLabel}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, index) => (
            <TableRow key={item.player_id}>
              <TableCell>
                <span className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${positionBadgeClass(index)}`}>
                  {index + 1}
                </span>
              </TableCell>
              <TableCell className="font-medium">
                {item.first_name} {item.last_name}
              </TableCell>
              <TableCell>
                <Link
                  href={{ pathname: "/equipos/[teamSlug]", params: { teamSlug: item.team_slug } }}
                  className="text-text-secondary hover:text-accent transition-colors"
                >
                  {item.team_name}
                </Link>
              </TableCell>
              <TableCell className="text-center">
                <span className="text-gradient-gold font-bold font-display text-lg tabular-nums">
                  {(item as Record<string, unknown>)[statKey] as number}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
