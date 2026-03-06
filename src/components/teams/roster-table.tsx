import { useTranslations } from "next-intl";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { Player } from "@/lib/supabase/types";

interface RosterTableProps {
  players: Player[];
}

const positionLabels: Record<string, { es: string; en: string }> = {
  goalkeeper: { es: "POR", en: "GK" },
  defender: { es: "DEF", en: "DEF" },
  midfielder: { es: "MED", en: "MID" },
  forward: { es: "DEL", en: "FWD" },
};

export function RosterTable({ players }: RosterTableProps) {
  const t = useTranslations("player");

  return (
    <div className="rounded-[10px] border border-border bg-bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">#</TableHead>
            <TableHead>{t("position")}</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {players.map((player) => (
            <TableRow key={player.id}>
              <TableCell className="font-bold text-accent">
                {player.dorsal ?? "-"}
              </TableCell>
              <TableCell>
                {player.position && (
                  <Badge variant="default">
                    {positionLabels[player.position]?.es ?? player.position}
                  </Badge>
                )}
              </TableCell>
              <TableCell className="font-medium">
                {player.first_name} {player.last_name}
              </TableCell>
              <TableCell>
                {player.is_captain && (
                  <Badge variant="accent">{t("captain")}</Badge>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
