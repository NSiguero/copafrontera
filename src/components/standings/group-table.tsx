import { useTranslations } from "next-intl";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Link } from "@/i18n/navigation";
import type { GroupStanding } from "@/lib/supabase/types";

interface GroupTableProps {
  groupName: string;
  teams: GroupStanding[];
}

export function GroupTable({ groupName, teams }: GroupTableProps) {
  const t = useTranslations("standings");

  return (
    <div className="rounded-[10px] border border-border bg-bg-card overflow-hidden glow-accent">
      <div className="broadcast-tab text-white font-display text-sm uppercase tracking-widest">
        {t("group")} {groupName}
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10 text-xs uppercase tracking-wider text-text-muted font-display">POS</TableHead>
            <TableHead className="text-xs uppercase tracking-wider text-text-muted font-display">{t("team")}</TableHead>
            <TableHead className="text-center text-xs uppercase tracking-wider text-text-muted font-display">{t("pj")}</TableHead>
            <TableHead className="text-center text-xs uppercase tracking-wider text-text-muted font-display">{t("pg")}</TableHead>
            <TableHead className="text-center text-xs uppercase tracking-wider text-text-muted font-display">{t("pe")}</TableHead>
            <TableHead className="text-center text-xs uppercase tracking-wider text-text-muted font-display">{t("pp")}</TableHead>
            <TableHead className="text-center text-xs uppercase tracking-wider text-text-muted font-display">{t("dg")}</TableHead>
            <TableHead className="text-center text-xs uppercase tracking-wider text-[var(--color-gold)] font-display">
              {t("pts")}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {teams.map((team, index) => (
            <TableRow
              key={team.team_id}
              className={`${index < 2 ? "bg-accent/5" : ""} ${index === 1 ? "border-b-2 border-accent/30" : ""} hover:bg-bg-card-hover cursor-pointer`}
            >
              <TableCell>
                <span className="w-6 h-6 rounded-full bg-accent/10 text-accent text-xs font-bold flex items-center justify-center">
                  {index + 1}
                </span>
              </TableCell>
              <TableCell>
                <Link
                  href={{ pathname: "/equipos/[teamSlug]", params: { teamSlug: team.team_slug } }}
                  className="font-medium hover:text-accent transition-colors"
                >
                  {team.team_name}
                </Link>
              </TableCell>
              <TableCell className="text-center tabular-nums">{team.pj}</TableCell>
              <TableCell className="text-center tabular-nums">{team.pg}</TableCell>
              <TableCell className="text-center tabular-nums">{team.pe}</TableCell>
              <TableCell className="text-center tabular-nums">{team.pp}</TableCell>
              <TableCell className="text-center tabular-nums">
                {team.dg > 0 ? `+${team.dg}` : team.dg}
              </TableCell>
              <TableCell className="text-center">
                <span className="text-gradient-gold font-bold font-display text-lg tabular-nums">
                  {team.pts}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
